// Integration tests against a freshly seeded database. They exercise the controls the
// screens pack promises: blind counting, separation of duties, reason codes + evidence,
// routing past involved managers, escalation, period lock and three-way match.
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { execSync } from 'node:child_process';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { prisma } from '../src/db.js';
import { addDays, businessDate, monthOf } from '../src/lib/time.js';

let app: FastifyInstance;
const tokens: Record<string, string> = {};
let orgId = '';

async function web(email: string) {
  const r = await app.inject({ method: 'POST', url: '/api/auth/login', payload: { email, password: 'demo1234' } });
  expect(r.statusCode).toBe(200);
  return r.json().token as string;
}
async function mobile(phone: string) {
  const r = await app.inject({ method: 'POST', url: '/api/auth/mobile-login', payload: { phone, pin: '1234', deviceId: 'test-device' } });
  expect(r.statusCode).toBe(200);
  return r.json().token as string;
}
const call = (token: string, method: 'GET' | 'POST' | 'PUT', url: string, payload?: unknown) =>
  app.inject({ method, url: `/api${url}`, headers: { authorization: `Bearer ${token}` }, payload: payload as object });

async function evidence(token: string) {
  const boundary = 'x-boundary';
  const body = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="p.png"\r\nContent-Type: image/png\r\n\r\nPNGDATA\r\n--${boundary}--\r\n`;
  const r = await app.inject({ method: 'POST', url: '/api/attachments', headers: { authorization: `Bearer ${token}`, 'content-type': `multipart/form-data; boundary=${boundary}` }, payload: body });
  expect(r.statusCode).toBe(200);
  return r.json().id as string;
}

beforeAll(async () => {
  execSync('npx tsx prisma/seed.ts', { stdio: 'ignore', env: { ...process.env, QUIET_NOTIFY: '1' } });
  process.env.QUIET_NOTIFY = '1';
  app = await buildApp();
  orgId = (await prisma.org.findFirstOrThrow()).id;
  tokens.shiv = await web('shiv@hopline.in');
  tokens.anita = await web('anita@hopline.in');
  tokens.priya = await web('priya@hopline.in');
  tokens.vikram = await web('vikram@hopline.in');
  tokens.meera = await web('meera@hopline.in');
  tokens.ravi = await mobile('9000000001');
  tokens.deepa = await mobile('9000000002');
  tokens.suresh = await mobile('9000000104');
  tokens.anandM = await mobile('9000000103');
}, 120_000);

afterAll(async () => {
  await app.close();
  await prisma.$disconnect();
});

describe('auth and channels', () => {
  it('rejects a wrong password', async () => {
    const r = await app.inject({ method: 'POST', url: '/api/auth/login', payload: { email: 'shiv@hopline.in', password: 'nope' } });
    expect(r.statusCode).toBe(401);
  });
  it('requires a token', async () => {
    expect((await app.inject({ method: 'GET', url: '/api/flash' })).statusCode).toBe(401);
  });
  it('counts can only be entered from the mobile app', async () => {
    const task = await prisma.countTask.findFirstOrThrow({ where: { status: 'ASSIGNED', type: 'SPOT' } });
    const r = await call(tokens.shiv, 'POST', `/m/counts/${task.id}/start`);
    expect(r.statusCode).toBe(403);
    expect(r.json().error.code).toBe('MOBILE_ONLY');
  });
});

describe('S1 Action Centre and M10 Daily Flash', () => {
  it('ranks by ₹ impact and shows the manager-involved items as "You"', async () => {
    const r = (await call(tokens.shiv, 'GET', '/action-centre')).json();
    const impacts = r.items.map((i: { impact: number }) => i.impact);
    expect(impacts).toEqual([...impacts].sort((a, b) => b - a));
    expect(r.items[0].title).toMatch(/Jameson 750 ml short by 3,400 ml/);
    const comps = r.items.find((i: { title: string }) => i.title.startsWith('Comps at'));
    expect(comps.owner).toEqual({ name: 'You', sub: 'Routed past outlet' });
    expect(r.counts.critical).toBeGreaterThanOrEqual(4);
  });
  it('flash compares against theory and last week', async () => {
    const f = (await call(tokens.shiv, 'GET', '/flash')).json();
    expect(f.outletsClosed).toBe(4);
    expect(f.unbilledKot).toBe(21840);
    expect(f.cashVariance).toBe(-6200);
    expect(f.netSalesVsLastWeekPct).not.toBeNull();
  });
});

describe('W2 blind count', () => {
  let taskId = '';
  it('counter never sees system quantity', async () => {
    const tasks = (await call(tokens.ravi, 'GET', '/m/tasks')).json();
    const t = tasks.find((x: { kind: string }) => x.kind === 'COUNT');
    taskId = t.id;
    const before = await call(tokens.ravi, 'GET', `/m/counts/${taskId}`);
    expect(before.json().message).toMatch(/when you start/);
    const started = await call(tokens.ravi, 'POST', `/m/counts/${taskId}/start`);
    expect(started.statusCode).toBe(200);
    const text = started.body.toLowerCase();
    expect(text).not.toContain('system');
    expect(text).not.toContain('variance');
  });
  it('only the assignee can count', async () => {
    const r = await call(tokens.deepa, 'POST', `/m/counts/${taskId}/start`);
    expect(r.statusCode).toBe(403);
  });
  it('photo is required on high-value lines and the result is never shown', async () => {
    const view = (await call(tokens.ravi, 'GET', `/m/counts/${taskId}`)).json();
    const photo = await evidence(tokens.ravi);
    for (const l of view.lines) {
      const body = l.countMode === 'BOTTLE_AND_OPEN' ? { sealedUnits: 30 } : l.countMode === 'WEIGHT' ? { scaleReadings: [{ kg: 50 }] } : { typedQty: 100 };
      const noPhoto = await call(tokens.ravi, 'PUT', `/m/counts/${taskId}/lines/${l.id}`, body);
      if (noPhoto.statusCode === 400) expect(noPhoto.json().error.code).toBe('PHOTO_REQUIRED');
      const ok = await call(tokens.ravi, 'PUT', `/m/counts/${taskId}/lines/${l.id}`, { ...body, photoIds: [photo] });
      expect(ok.statusCode).toBe(200);
    }
    const sub = await call(tokens.ravi, 'POST', `/m/counts/${taskId}/submit`);
    expect(sub.statusCode).toBe(200);
    expect(sub.json().message).toMatch(/You won't see the result/);
    expect(JSON.stringify(sub.json())).not.toMatch(/systemQty|variance/i);
  });
  it('recount goes to a different person', async () => {
    const recount = await prisma.countTask.findFirst({ where: { parentTaskId: taskId } });
    if (recount) expect(recount.assigneeId).not.toBe((await prisma.countTask.findUniqueOrThrow({ where: { id: taskId } })).assigneeId);
  });
});

describe('S3 stock count review', () => {
  it('counters cannot approve; owner approves with a reason code', async () => {
    const breast = await prisma.item.findFirstOrThrow({ where: { sku: 'CHKBR' } });
    const task = await prisma.countTask.findFirstOrThrow({ where: { lines: { some: { status: 'NEEDS_APPROVAL', itemId: breast.id } }, type: 'SPOT' } });
    const review = (await call(tokens.shiv, 'GET', `/counts/${task.id}/review`)).json();
    expect(review.snapshotAt).toBeTruthy();
    expect(review.canApprove).toBe(true);
    const line = review.lines.find((l: { status: string; item: string }) => l.status === 'NEEDS_APPROVAL' && l.item === 'Chicken breast');
    expect(line).toBeTruthy();

    const noReason = await call(tokens.shiv, 'POST', `/counts/${task.id}/approve`, { lineIds: [line.lineId], reasonCode: '' });
    expect(noReason.statusCode).toBe(400);

    const ok = await call(tokens.shiv, 'POST', `/counts/${task.id}/approve`, { lineIds: [line.lineId], reasonCode: 'EVAPORATION_TRIM' });
    expect(ok.statusCode).toBe(200);
    const adj = await prisma.stockMovement.findFirstOrThrow({ where: { refId: line.lineId, type: 'ADJUSTMENT' } });
    expect(adj.approvedById).toBeTruthy();
    const ex = await prisma.exception.findUniqueOrThrow({ where: { id: line.exceptionId } });
    expect(ex.status).toBe('RESOLVED');
  });
});

describe('W3 exceptions: reason codes, evidence and independence', () => {
  it('closing needs a reason code and evidence', async () => {
    const ex = await prisma.exception.findFirstOrThrow({ where: { type: 'FOOD_COST', status: 'OPEN' } });
    const freeText = await call(tokens.shiv, 'POST', `/exceptions/${ex.id}/close`, { note: 'looked at it' });
    expect(freeText.statusCode).toBe(400);
    const noEvidence = await call(tokens.shiv, 'POST', `/exceptions/${ex.id}/close`, { reasonCode: 'PORTION_OVER_STANDARD', evidenceIds: [] });
    expect(noEvidence.statusCode).toBe(400);
    const ok = await call(tokens.shiv, 'POST', `/exceptions/${ex.id}/close`, { reasonCode: 'PORTION_OVER_STANDARD', note: 'Weighed 5 portions', evidenceIds: [await evidence(tokens.shiv)] });
    expect(ok.statusCode).toBe(200);
    expect(ok.json().status).toBe('RESOLVED');
  });

  it('a manager who approved the comps cannot close the exception about them', async () => {
    const ex = await prisma.exception.findFirstOrThrow({ where: { type: 'GIVEAWAY_PATTERN', status: 'OPEN' } });
    const detail = (await call(tokens.shiv, 'GET', `/exceptions/${ex.id}`)).json();
    expect(detail.routedPastOutlet).toBe(true);
    const r = await call(tokens.vikram, 'POST', `/exceptions/${ex.id}/close`, { reasonCode: 'UNEXPLAINED', evidenceIds: [await evidence(tokens.vikram)] });
    expect(r.statusCode).toBe(403);
  });

  it('M12: explanation above the manager\'s limit moves up to the owner, who accepts it as NC', async () => {
    const ex = await prisma.exception.findFirstOrThrow({ where: { type: 'UNBILLED_KOT', status: 'OPEN' } });
    const r = await call(tokens.priya, 'POST', `/exceptions/${ex.id}/explain`, {
      reasonCode: 'SERVED_NOT_BILLED', note: 'Table B6 party moved to B4, items not transferred to the new bill. Checked CCTV 22:15–22:40.', evidenceIds: [await evidence(tokens.priya)],
    });
    expect(r.statusCode).toBe(200);
    expect(r.json().status).toBe('AWAITING_DECISION');
    const shiv = await prisma.user.findFirstOrThrow({ where: { email: 'shiv@hopline.in' } });
    expect(r.json().assigneeId).toBe(shiv.id);

    const selfDecide = await call(tokens.priya, 'POST', `/exceptions/${ex.id}/decide`, { decision: 'ACCEPT' });
    expect(selfDecide.statusCode).toBe(403);
    const accept = await call(tokens.shiv, 'POST', `/exceptions/${ex.id}/decide`, { decision: 'ACCEPT', note: 'OK, retrain on table transfers' });
    expect(accept.json().status).toBe('RESOLVED');
    const items = await prisma.kotItem.findMany({ where: { exceptionId: ex.id } });
    expect(items.every((i) => i.disposition === 'NC' && i.ncApproverId === shiv.id)).toBe(true);
  });

  it('SLA breach escalates one level up', async () => {
    const ex = await prisma.exception.findFirstOrThrow({ where: { type: 'TRANSFER_GAP', status: 'OPEN' } });
    await prisma.exception.update({ where: { id: ex.id }, data: { dueAt: new Date(Date.now() - 60_000) } });
    const r = await call(tokens.shiv, 'POST', '/jobs/escalate');
    expect(r.json().moved).toBeGreaterThanOrEqual(1);
    const after = await prisma.exception.findUniqueOrThrow({ where: { id: ex.id } });
    expect(after.assigneeId).toBe(ex.escalationPath[0]);
    expect(after.escalationLevel).toBe(1);
  });
});

describe('W5 purchasing', () => {
  it('payable is the lower of received and ordered at PO rate', async () => {
    const inv = await prisma.invoice.findFirstOrThrow({ where: { invoiceNo: '4471' } });
    const d = (await call(tokens.anita, 'GET', `/invoices/${inv.id}`)).json();
    expect(d.status).toBe('ON_HOLD');
    expect(d.checkResult).toBe('Qty and rate differ');
    const breast = d.lines.find((l: { item: string }) => l.item === 'Chicken breast');
    expect(breast.payable).toBe(23688);
    expect(breast.difference).toBe(4992);
  });
  it('the purchaser cannot accept the difference; finance raises a debit note', async () => {
    const inv = await prisma.invoice.findFirstOrThrow({ where: { invoiceNo: '4471' } });
    const self = await call(tokens.meera, 'POST', `/invoices/${inv.id}/decide`, { action: 'ACCEPT_DIFFERENCE', reasonCode: 'RATE_REVISION_AGREED' });
    expect(self.statusCode).toBe(403);
    const dn = await call(tokens.anita, 'POST', `/invoices/${inv.id}/decide`, { action: 'DEBIT_NOTE', note: 'Short weight and rate above PO' });
    expect(dn.json().status).toBe('RELEASED');
    expect((await prisma.debitNote.findFirstOrThrow({ where: { invoiceId: inv.id } })).amount).toBe(4992);
  });
  it('duplicate vendor + invoice number is blocked', async () => {
    const rows = (await call(tokens.anita, 'GET', '/invoices')).json();
    expect(rows.find((r: { invoiceNo: string; status: string }) => r.invoiceNo === 'PG-3310' && r.status === 'BLOCKED')).toBeTruthy();
  });
  it("PO creator can't approve the PO", async () => {
    const vendor = await prisma.vendor.findFirstOrThrow({ where: { name: 'Metro Dairy' } });
    const outlet = await prisma.outlet.findFirstOrThrow({ where: { code: 'KOR' } });
    const item = await prisma.item.findFirstOrThrow({ where: { sku: 'CREAM' } });
    const po = (await call(tokens.meera, 'POST', '/pos', { outletId: outlet.id, vendorId: vendor.id, lines: [{ itemId: item.id, qty: 10 }] })).json();
    expect(po.lines[0].rate).toBe(220); // contract rate on file
    const r = await call(tokens.meera, 'POST', `/pos/${po.id}/approve`, { approve: true });
    expect(r.statusCode).toBe(403);
    expect((await call(tokens.priya, 'POST', `/pos/${po.id}/approve`, { approve: true })).json().status).toBe('APPROVED');
  });
});

describe('W7 wastage', () => {
  it('the person logging wastage cannot approve it, and a photo is needed above ₹500', async () => {
    const outlet = await prisma.outlet.findFirstOrThrow({ where: { code: 'KOR' } });
    const item = await prisma.item.findFirstOrThrow({ where: { sku: 'MUTN' } });
    const noPhoto = await call(tokens.suresh, 'POST', '/m/wastage', { outletId: outlet.id, itemId: item.id, scaleReadings: [{ kg: 1 }], reasonCode: 'DROPPED' });
    expect(noPhoto.json().error.code).toBe('PHOTO_REQUIRED');
    const w = (await call(tokens.anandM, 'POST', '/m/wastage', { outletId: outlet.id, itemId: item.id, scaleReadings: [{ kg: 1 }], reasonCode: 'DROPPED', photoIds: [await evidence(tokens.anandM)] })).json();
    expect(w.routedTo).not.toBe('Anand R');
    const self = await call(tokens.anandM, 'POST', `/wastage/${w.id}/decide`, { approve: true });
    expect(self.statusCode).toBe(403);
  });
});

describe('S5, S4, S7 control areas', () => {
  it('KOT-to-bill shows the nine unaccounted items', async () => {
    const kor = await prisma.outlet.findFirstOrThrow({ where: { code: 'KOR' } });
    const k = (await call(tokens.shiv, 'GET', `/kot-match?outletId=${kor.id}`)).json();
    expect(k.notAccounted.length + k.breakdown.nc).toBeGreaterThanOrEqual(9);
    expect(k.pattern.nights30).toBe(3);
  });
  it('liquor control shows Jameson in ml at selling price', async () => {
    const ind = await prisma.outlet.findFirstOrThrow({ where: { code: 'IND' }, include: { locations: true } });
    const bar = ind.locations.find((l) => l.name === 'Main bar')!;
    const l = (await call(tokens.shiv, 'GET', `/liquor?outletId=${ind.id}&locationId=${bar.id}`)).json();
    const jam = l.rows.find((r: { sku: string }) => r.sku === 'Jameson 750 ml');
    expect(jam.variance).toBe(-3400);
    expect(jam.received).toBeGreaterThanOrEqual(18000); // Deccan Spirits GRN plus the weekly top-up
    expect(l.byBar[0].bar).toMatch(/Indiranagar/);
    expect(l.draught.find((d: { beer: string }) => d.beer === 'Belgian Wit')).toBeTruthy();
  });
  it('giveaways by approver flags the duty manager', async () => {
    const g = (await call(tokens.shiv, 'GET', '/giveaways')).json();
    const vik = g.byApprover.find((a: { name: string }) => a.name === 'Vikram S');
    expect(vik.flag).toBeTruthy();
    expect(g.tiles.refunds.allWithBill).toBe(true);
  });
});

describe('S10 controls', () => {
  it("separation of duties can't be switched off and changes are audited", async () => {
    const locked = await call(tokens.shiv, 'PUT', '/controls', { separationOfDuties: [{ key: 'NO_SELF_APPROVAL', on: false }] });
    expect(locked.statusCode).toBe(400);
    const mgr = await call(tokens.priya, 'PUT', '/controls', { tolerances: { DAIRY: { pct: 10, rupees: 1000, frequency: 'WEEKLY' } } });
    expect(mgr.statusCode).toBe(403);
    const ok = await call(tokens.shiv, 'PUT', '/controls', { tolerances: { DAIRY: { pct: 2.5, rupees: 300, frequency: '3X_WEEK' } } });
    expect(ok.json().effective.tolerances.DAIRY.pct).toBe(2.5);
    const hist = (await call(tokens.shiv, 'GET', '/controls/history')).json();
    expect(hist[0].before).toBeTruthy();
  });
});

describe('W8 month-end close', () => {
  const prev = monthOf(addDays(`${monthOf(addDays(businessDate(), -1))}-01`, -1));
  it('lock is blocked while an outlet has an open critical, and says why', async () => {
    const c = (await call(tokens.anita, 'GET', `/periods/${prev}/checklist`)).json();
    expect(c.readyCount).toBe(c.outlets.length - 1);
    const r = await call(tokens.anita, 'POST', `/periods/${prev}/lock`);
    expect(r.statusCode).toBe(409);
    expect(r.json().error.details.blockers[0]).toMatch(/Whitefield/);
  });
  it('only the finance head can reopen a locked period; writes to it are refused', async () => {
    const locked = await prisma.period.findFirstOrThrow({ where: { status: 'LOCKED' } });
    const kor = await prisma.outlet.findFirstOrThrow({ where: { code: 'KOR' } });
    const ingest = await app.inject({
      method: 'POST', url: '/api/integrations/pos/giveaways', headers: { 'x-api-key': process.env.POS_INGEST_KEY!, 'x-org-id': orgId },
      payload: { outletId: kor.id, at: `${locked.month}-10T15:00:00+05:30`, type: 'COMP', amount: 100, reasonCode: 'MANAGER_COMP', approverId: (await prisma.user.findFirstOrThrow({ where: { email: 'priya@hopline.in' } })).id },
    });
    expect(ingest.statusCode).toBe(409);
    expect((await call(tokens.shiv, 'POST', `/periods/${locked.month}/reopen`, { reason: 'Missed a credit note' })).statusCode).toBe(403);
    const ok = await call(tokens.anita, 'POST', `/periods/${locked.month}/reopen`, { reason: 'Missed a credit note from Metro Dairy' });
    expect(ok.json().status).toBe('OPEN');
  });
  it('MIS pack exports as CSV', async () => {
    const r = await call(tokens.anita, 'GET', `/periods/${prev}/mis?format=csv`);
    expect(r.headers['content-type']).toMatch(/text\/csv/);
    expect(r.body.split('\n')[0]).toContain('netSales');
  });
});

describe('POS / KDS ingestion', () => {
  it('rejects a bad key and a refund without a bill', async () => {
    const kor = await prisma.outlet.findFirstOrThrow({ where: { code: 'KOR' } });
    const bad = await app.inject({ method: 'POST', url: '/api/integrations/pos/kots', headers: { 'x-api-key': 'wrong', 'x-org-id': orgId }, payload: {} });
    expect(bad.statusCode).toBe(401);
    const approver = await prisma.user.findFirstOrThrow({ where: { email: 'priya@hopline.in' } });
    const r = await app.inject({
      method: 'POST', url: '/api/integrations/pos/giveaways', headers: { 'x-api-key': process.env.POS_INGEST_KEY!, 'x-org-id': orgId },
      payload: { outletId: kor.id, at: new Date().toISOString(), type: 'REFUND', amount: 500, reasonCode: 'SERVICE_RECOVERY', approverId: approver.id },
    });
    expect(r.json().error.code).toBe('REFUND_NEEDS_BILL');
  });
  it('a KOT and its bill are linked and deplete stock by recipe', async () => {
    const kor = await prisma.outlet.findFirstOrThrow({ where: { code: 'KOR' } });
    const menu = await prisma.menuItem.findFirstOrThrow({ where: { name: 'Chicken tikka' } });
    const h = { 'x-api-key': process.env.POS_INGEST_KEY!, 'x-org-id': orgId };
    const now = new Date().toISOString();
    expect((await app.inject({ method: 'POST', url: '/api/integrations/pos/kots', headers: h, payload: { outletId: kor.id, kotNo: 'T-1', firedAt: now, station: 'Tandoor', items: [{ menuItemId: menu.id, qty: 2, amount: 1180 }] } })).statusCode).toBe(200);
    const b = await app.inject({ method: 'POST', url: '/api/integrations/pos/bills', headers: h, payload: { outletId: kor.id, billNo: 'T-B1', openedAt: now, paidAt: now, status: 'PAID', netAmount: 1180, paymentMode: 'CARD', items: [{ menuItemId: menu.id, qty: 2, amount: 1180, kotNo: 'T-1', kotLine: 0 }] } });
    expect(b.statusCode).toBe(200);
    const sale = await prisma.stockMovement.findMany({ where: { refId: b.json().id, type: 'SALE' } });
    expect(sale.length).toBeGreaterThan(0);
  });
});
