// Overnight day close, 8 am Daily Flash, SLA escalation and notification delivery.
import cron from 'node-cron';
import type { FastifyBaseLogger } from 'fastify';
import { prisma } from '../db.js';
import { inr, inrShort } from '../lib/format.js';
import { sendPush, sendWhatsApp } from '../lib/notify.js';
import { usersWithRole } from '../lib/people.js';
import { addDays, businessDate } from '../lib/time.js';
import { closeDayAllOutlets, countsNotStarted } from '../engine/dayclose.js';
import { escalateOverdue } from '../engine/exceptions.js';
import { flagOverdueTransfers } from '../engine/wastage.js';
import { flashKpis } from '../engine/views.js';

export async function dispatchNotifications(limit = 200) {
  const queued = await prisma.notification.findMany({ where: { status: 'QUEUED', channel: { in: ['PUSH', 'WHATSAPP'] } }, take: limit, orderBy: { createdAt: 'asc' } });
  for (const n of queued) {
    const user = await prisma.user.findUnique({ where: { id: n.userId } });
    let res: { ok: boolean; ref?: string; error?: string } = { ok: false, error: 'No destination' };
    if (n.channel === 'WHATSAPP' && user?.whatsapp) res = await sendWhatsApp(user.whatsapp, `${n.title}\n${n.body}\nReply 1 to open it, 2 to call the owner of the item, or ask a question.`);
    if (n.channel === 'PUSH' && user) res = await sendPush(user.id, n.title, n.body);
    await prisma.notification.update({ where: { id: n.id }, data: { status: res.ok ? 'SENT' : 'FAILED', sentAt: new Date(), providerRef: res.ref ?? res.error } });
  }
  // In-app notifications are read from the inbox, never "sent".
  await prisma.notification.updateMany({ where: { status: 'QUEUED', channel: 'IN_APP' }, data: { status: 'SENT', sentAt: new Date() } });
  return queued.length;
}

export async function sendDailyFlash(orgId: string) {
  const date = addDays(businessDate(), -1);
  const outlets = (await prisma.outlet.findMany({ where: { orgId, kind: 'RESTAURANT' } })).map((o) => o.id);
  const k = await flashKpis(prisma, outlets, date);
  const open = await prisma.exception.findMany({ where: { orgId, status: { not: 'RESOLVED' } }, orderBy: { impact: 'desc' } });
  const crit = open.filter((e) => e.severity === 'CRITICAL').length;
  const att = open.filter((e) => e.severity === 'ATTENTION').length;
  const body = [
    `Net sales ${inrShort(k.netSales)}${k.netSalesVsLastWeekPct !== null ? ` (${k.netSalesVsLastWeekPct >= 0 ? '+' : ''}${k.netSalesVsLastWeekPct}% vs last week)` : ''}`,
    `Food cost ${k.foodCostPct}% (${k.foodCostVsTheoryPts >= 0 ? '+' : ''}${k.foodCostVsTheoryPts} pts vs theory), beverage ${k.bevCostPct}%`,
    `Giveaways ${inrShort(k.giveaways)}, unbilled KOTs ${inrShort(k.unbilledKot)}`,
    `Stock variance ${inrShort(k.stockVariance)}, cash variance ${inrShort(k.cashVariance)}`,
    `${crit} critical, ${att} attention.${open[0] ? ` Largest: ${open[0].title} ${inr(open[0].impact)}.` : ''}`,
  ].join('\n');
  const people = await usersWithRole(prisma, orgId, ['OWNER', 'FINANCE_HEAD']);
  for (const p of people) {
    await prisma.notification.create({ data: { userId: p.id, channel: 'PUSH', kind: 'DAILY_FLASH', title: `Daily Flash, ${date}`, body } });
    await prisma.notification.create({ data: { userId: p.id, channel: 'IN_APP', kind: 'DAILY_FLASH', title: `Daily Flash, ${date}`, body } });
  }
  await dispatchNotifications();
  return people.length;
}

export function startScheduler(log: FastifyBaseLogger) {
  const tz = { timezone: 'Asia/Kolkata' };
  const safe = (name: string, fn: () => Promise<unknown>) => async () => {
    try {
      const r = await fn();
      log.info({ job: name, result: r }, 'job done');
    } catch (e) {
      log.error({ job: name, err: e }, 'job failed');
    }
  };

  // Reconciliations run after day close at every outlet (05:30, after the rollover hour).
  cron.schedule('30 5 * * *', safe('day-close', async () => {
    const date = addDays(businessDate(), -1);
    for (const org of await prisma.org.findMany()) {
      await prisma.$transaction((t) => closeDayAllOutlets(t, org.id, date), { timeout: 300_000 });
      await prisma.$transaction((t) => flagOverdueTransfers(t, org.id), { timeout: 60_000 });
    }
    return dispatchNotifications();
  }), tz);

  // By 8 am the owner has a ranked list, not a stack of reports.
  cron.schedule('0 8 * * *', safe('daily-flash', async () => {
    for (const org of await prisma.org.findMany()) await sendDailyFlash(org.id);
  }), tz);

  // SLA escalation, late counts and overdue transfers.
  cron.schedule('*/15 * * * *', safe('escalate', async () => {
    const moved = await prisma.$transaction((t) => escalateOverdue(t), { timeout: 60_000 });
    for (const org of await prisma.org.findMany()) {
      await prisma.$transaction((t) => countsNotStarted(t, org.id, new Date()), { timeout: 60_000 });
      await prisma.$transaction((t) => flagOverdueTransfers(t, org.id), { timeout: 60_000 });
    }
    return moved;
  }), tz);

  cron.schedule('* * * * *', safe('dispatch', () => dispatchNotifications()), tz);
}
