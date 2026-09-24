// S9 Ask Controller: plain-language questions answered from the org's Digitory data only.
// The assistant explains and suggests; it has read-only tools, so it cannot approve,
// adjust stock or close exceptions. Every tool is scoped to the asker's outlets.
import Anthropic from '@anthropic-ai/sdk';
import type { User } from '@prisma/client';
import type { Tx } from '../db.js';
import { addDays, businessDate, round2 } from '../lib/time.js';
import { flashKpis } from './views.js';

const MODEL = process.env.ASK_MODEL ?? 'claude-opus-5';

type Ref = { type: string; id: string; label: string };
type Table = { columns: string[]; rows: (string | number | null)[][] };
type Ctx = { tx: Tx; user: User; outletIds: string[]; refs: Ref[]; table: Table | null };

const str = { type: 'string' } as const;
const date = { type: 'string', description: 'YYYY-MM-DD business date' } as const;

const TOOLS: Anthropic.Tool[] = [
  { name: 'list_outlets', description: 'Outlets the user can see, with ids and names.', input_schema: { type: 'object', properties: {} } },
  {
    name: 'daily_kpis',
    description: 'Day-close KPIs: net sales, food and beverage cost % vs theoretical, giveaways, unbilled KOTs, stock and cash variance, wastage.',
    input_schema: { type: 'object', properties: { date, outletId: str }, required: ['date'] },
  },
  {
    name: 'search_exceptions',
    description: 'Exceptions (control issues) with ₹ impact, owner and status. Filter by type, status, outlet, date range or text.',
    input_schema: {
      type: 'object',
      properties: { status: { type: 'string', enum: ['OPEN', 'AWAITING_DECISION', 'RESOLVED', 'ANY'] }, type: str, outletId: str, from: date, to: date, text: str },
    },
  },
  { name: 'get_exception', description: 'Full detail of one exception: drivers in ₹, items, checks, history.', input_schema: { type: 'object', properties: { id: str }, required: ['id'] } },
  {
    name: 'giveaways',
    description: 'Discounts, comps, voids and refunds with approver, bill, paid mode and refund mode.',
    input_schema: {
      type: 'object',
      properties: {
        from: date, to: date, outletId: str,
        type: { type: 'string', enum: ['DISCOUNT', 'COMP', 'VOID_BEFORE_KOT', 'VOID_AFTER_KOT', 'VOID_AFTER_PAYMENT', 'REFUND'] },
        refundModeDiffers: { type: 'boolean', description: 'Only refunds where refund mode differs from how the guest paid' },
      },
      required: ['from', 'to'],
    },
  },
  {
    name: 'item_movements',
    description: 'Stock movements for an item (receipts, sales, comps, wastage, transfers, count adjustments) with totals by type. Liquor is in ml.',
    input_schema: { type: 'object', properties: { item: { type: 'string', description: 'Item name or part of it' }, outletId: str, from: date, to: date }, required: ['item', 'from', 'to'] },
  },
  {
    name: 'staff_on_duty',
    description: 'Who worked a business date: stewards on KOTs by station, cashiers by till and shift, counters.',
    input_schema: { type: 'object', properties: { date, outletId: str }, required: ['date'] },
  },
  {
    name: 'invoices',
    description: 'Vendor invoices with three-way match result, payable and difference.',
    input_schema: { type: 'object', properties: { vendor: str, status: str, from: date, to: date } },
  },
  {
    name: 'wastage',
    description: 'Wastage and breakage entries with reason, value, who logged and who approved.',
    input_schema: { type: 'object', properties: { from: date, to: date, outletId: str }, required: ['from', 'to'] },
  },
  {
    name: 'show_table',
    description: 'Show the user a table alongside your answer. Use when listing several records.',
    input_schema: {
      type: 'object',
      properties: { columns: { type: 'array', items: str }, rows: { type: 'array', items: { type: 'array', items: {} } } },
      required: ['columns', 'rows'],
    },
  },
];

function scoped(ctx: Ctx, outletId?: string) {
  if (outletId && ctx.outletIds.includes(outletId)) return [outletId];
  return ctx.outletIds;
}

async function names(tx: Tx, ids: (string | null | undefined)[]) {
  const rows = await tx.user.findMany({ where: { id: { in: ids.filter(Boolean) as string[] } } });
  return new Map(rows.map((u) => [u.id, u.shortName]));
}

async function runTool(ctx: Ctx, name: string, input: Record<string, unknown>): Promise<unknown> {
  const { tx } = ctx;
  const s = (k: string) => (typeof input[k] === 'string' ? (input[k] as string) : undefined);
  switch (name) {
    case 'list_outlets':
      return tx.outlet.findMany({ where: { id: { in: ctx.outletIds } }, select: { id: true, name: true, code: true, kind: true } });
    case 'daily_kpis': {
      const ids = scoped(ctx, s('outletId'));
      const perOutlet = await tx.dayClose.findMany({ where: { outletId: { in: ids }, businessDate: s('date')! } });
      return { total: await flashKpis(tx, ids, s('date')!), perOutlet: perOutlet.map((d) => ({ outletId: d.outletId, ...(d.kpis as object) })) };
    }
    case 'search_exceptions': {
      const status = s('status');
      const rows = await tx.exception.findMany({
        where: {
          orgId: ctx.user.orgId,
          OR: [{ outletId: { in: scoped(ctx, s('outletId')) } }, { outletIds: { hasSome: scoped(ctx, s('outletId')) } }],
          ...(status && status !== 'ANY' ? { status: status as 'OPEN' } : status ? {} : { status: { not: 'RESOLVED' } }),
          ...(s('type') ? { type: s('type') as 'FOOD_COST' } : {}),
          ...(s('from') || s('to') ? { businessDate: { gte: s('from') ?? '0000', lte: s('to') ?? '9999' } } : {}),
          ...(s('text') ? { OR: [{ title: { contains: s('text'), mode: 'insensitive' as const } }, { summary: { contains: s('text'), mode: 'insensitive' as const } }] } : {}),
        },
        orderBy: { impact: 'desc' },
        take: 25,
      });
      rows.forEach((r) => ctx.refs.push({ type: 'exception', id: r.id, label: `Exception, ${r.status.toLowerCase()}` }));
      return rows.map((r) => ({ id: r.id, type: r.type, severity: r.severity, status: r.status, impact: r.impact, title: r.title, summary: r.summary, date: r.businessDate, closeReason: r.closeReasonCode }));
    }
    case 'get_exception': {
      const ex = await tx.exception.findFirst({ where: { id: s('id'), orgId: ctx.user.orgId }, include: { events: true } });
      if (!ex || (ex.outletId && !ctx.outletIds.includes(ex.outletId))) return { error: 'Not found' };
      ctx.refs.push({ type: 'exception', id: ex.id, label: `Exception, ${ex.status.toLowerCase()}` });
      for (const r of (ex.sourceRefs as Ref[] | null) ?? []) ctx.refs.push(r);
      return ex;
    }
    case 'giveaways': {
      const rows = await tx.giveaway.findMany({
        where: {
          outletId: { in: scoped(ctx, s('outletId')) },
          businessDate: { gte: s('from')!, lte: s('to')! },
          ...(s('type') ? { type: s('type') as 'REFUND' } : {}),
          ...(input.refundModeDiffers ? { type: 'REFUND' as const } : {}),
        },
        orderBy: { at: 'asc' },
      });
      const filtered = input.refundModeDiffers ? rows.filter((r) => r.paidMode && r.refundMode && r.paidMode !== r.refundMode) : rows;
      const people = await names(tx, filtered.map((r) => r.approverId));
      const outlets = new Map((await tx.outlet.findMany({ where: { id: { in: ctx.outletIds } } })).map((o) => [o.id, o.name]));
      filtered.slice(0, 20).forEach((r) => r.billId && ctx.refs.push({ type: 'bill', id: r.billId, label: `Bill ${r.billNo}` }));
      return {
        count: filtered.length,
        total: round2(filtered.reduce((a, r) => a + r.amount, 0)),
        rows: filtered.slice(0, 100).map((r) => ({ date: r.businessDate, outlet: outlets.get(r.outletId), type: r.type, bill: r.billNo, amount: r.amount, reason: r.reasonCode, approvedBy: people.get(r.approverId), paidMode: r.paidMode, refundMode: r.refundMode })),
      };
    }
    case 'item_movements': {
      const items = await tx.item.findMany({ where: { orgId: ctx.user.orgId, name: { contains: s('item'), mode: 'insensitive' } }, take: 3 });
      const out = [];
      for (const it of items) {
        const mv = await tx.stockMovement.findMany({ where: { itemId: it.id, outletId: { in: scoped(ctx, s('outletId')) }, businessDate: { gte: s('from')!, lte: s('to')! } }, orderBy: { at: 'asc' } });
        const byType: Record<string, number> = {};
        for (const m of mv) byType[m.type] = round2((byType[m.type] ?? 0) + m.qty);
        const approvers = await names(tx, mv.map((m) => m.approvedById));
        out.push({
          item: it.name, unit: it.baseUnit, totalsByType: byType,
          approvedComps: mv.filter((m) => m.type === 'COMP' || m.type === 'STAFF_MEAL').map((m) => ({ at: m.at, qty: m.qty, approvedBy: approvers.get(m.approvedById ?? '') })),
        });
      }
      return out;
    }
    case 'staff_on_duty': {
      const ids = scoped(ctx, s('outletId'));
      const kots = await tx.kot.findMany({ where: { outletId: { in: ids }, businessDate: s('date')! } });
      const shifts = await tx.cashShift.findMany({ where: { outletId: { in: ids }, businessDate: s('date')! } });
      const counts = await tx.countTask.findMany({ where: { outletId: { in: ids }, businessDate: s('date')! } });
      const people = await names(tx, [...kots.map((k) => k.stewardId), ...shifts.map((x) => x.cashierId), ...counts.map((c) => c.assigneeId)]);
      const byStation: Record<string, { stewards: Set<string>; first: Date; last: Date }> = {};
      for (const k of kots) {
        const b = (byStation[k.station] ??= { stewards: new Set(), first: k.firedAt, last: k.firedAt });
        if (k.stewardId) b.stewards.add(people.get(k.stewardId) ?? k.stewardId);
        if (k.firedAt < b.first) b.first = k.firedAt;
        if (k.firedAt > b.last) b.last = k.firedAt;
      }
      return {
        stations: Object.entries(byStation).map(([station, b]) => ({ station, stewards: [...b.stewards], firstKot: b.first, lastKot: b.last })),
        cashiers: shifts.map((x) => ({ till: x.till, shift: x.shiftName, cashier: people.get(x.cashierId), openedAt: x.openedAt, closedAt: x.closedAt })),
        counters: counts.map((c) => ({ type: c.type, counter: people.get(c.assigneeId), status: c.status })),
      };
    }
    case 'invoices': {
      const vendors = s('vendor') ? await tx.vendor.findMany({ where: { orgId: ctx.user.orgId, name: { contains: s('vendor'), mode: 'insensitive' } } }) : null;
      const rows = await tx.invoice.findMany({
        where: {
          outletId: { in: ctx.outletIds },
          ...(vendors ? { vendorId: { in: vendors.map((v) => v.id) } } : {}),
          ...(s('status') ? { status: s('status') as 'ON_HOLD' } : {}),
          ...(s('from') || s('to') ? { invoiceDate: { gte: s('from') ?? '0000', lte: s('to') ?? '9999' } } : {}),
        },
        take: 50,
        orderBy: { createdAt: 'desc' },
      });
      rows.forEach((r) => ctx.refs.push({ type: 'invoice', id: r.id, label: `Invoice ${r.invoiceNo}` }));
      return rows.map((r) => ({ id: r.id, invoiceNo: r.invoiceNo, date: r.invoiceDate, amount: r.amount, payable: r.payable, difference: r.difference, status: r.status, check: r.checkResult, lines: r.matchLines }));
    }
    case 'wastage': {
      const rows = await tx.wastageEntry.findMany({ where: { outletId: { in: scoped(ctx, s('outletId')) }, businessDate: { gte: s('from')!, lte: s('to')! } } });
      const items = new Map((await tx.item.findMany({ where: { id: { in: rows.map((r) => r.itemId) } } })).map((i) => [i.id, i.name]));
      const people = await names(tx, [...rows.map((r) => r.loggedById), ...rows.map((r) => r.decidedById)]);
      if (rows.length) ctx.refs.push({ type: 'wastage', id: `${s('from')}:${s('to')}`, label: `${rows.length} wastage entries` });
      return rows.map((r) => ({ date: r.businessDate, item: items.get(r.itemId), qty: r.qty, value: r.value, reason: r.reasonCode, section: r.section, loggedBy: people.get(r.loggedById), status: r.status, decidedBy: people.get(r.decidedById ?? '') }));
    }
    case 'show_table': {
      ctx.table = { columns: input.columns as string[], rows: input.rows as Table['rows'] };
      return { shown: true };
    }
    default:
      return { error: `Unknown tool ${name}` };
  }
}

function systemPrompt(user: User, today: string) {
  return `You are Digitory Controller, the financial controller for a restaurant group. You answer the owner's and finance head's questions using only the tools, which read their Digitory POS, KDS, inventory and purchasing data.

Today's business date is ${today}; "yesterday" is ${addDays(today, -1)}. The asker is ${user.shortName} (${user.role.toLowerCase().replace('_', ' ')}).

How to answer:
- Lead with the number and what explains it, the way a controller would in a morning briefing. Use ₹ with Indian digit grouping (₹4.61L, ₹18,900). Liquor is in ml.
- Break a cost movement into drivers in ₹ when the data has them (the get_exception tool returns drivers).
- Only state figures that came from a tool result. If the data doesn't cover the question, say what is missing.
- When the answer lists several records, call show_table with them and keep the prose short.
- You can explain and suggest checks, but you cannot approve, adjust stock or close anything. If asked to, say that it has to be done in the app by the right person.
- Plain text, no markdown headers. Keep it under 150 words unless the question needs a list.`;
}

export async function askController(tx: Tx, user: User, outletIds: string[], question: string, channel: 'WEB' | 'WHATSAPP' = 'WEB') {
  const ctx: Ctx = { tx, user, outletIds, refs: [], table: null };
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    const answer = 'Ask Controller is not configured on this server. Set ANTHROPIC_API_KEY to enable it.';
    return { answer, citations: [], table: null };
  }
  const client = new Anthropic();
  const messages: Anthropic.Beta.BetaMessageParam[] = [{ role: 'user', content: question }];
  let answer = '';

  for (let turn = 0; turn < 12; turn++) {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'medium' },
      system: [{ type: 'text', text: systemPrompt(user, businessDate()), cache_control: { type: 'ephemeral' } }],
      tools: TOOLS as Anthropic.Beta.BetaTool[],
      messages,
      // Re-run a safety-classifier decline on Anthropic's recommended fallback model.
      betas: ['server-side-fallback-2026-07-01'],
      ...({ fallbacks: 'default' } as object),
    });

    if (response.stop_reason === 'refusal') {
      answer = "I can't answer that one. Try asking about sales, stock, costs, vendors or staff.";
      break;
    }
    messages.push({ role: 'assistant', content: response.content });
    if (response.stop_reason === 'pause_turn') continue;

    const toolUses = response.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === 'tool_use');
    if (response.stop_reason !== 'tool_use' || !toolUses.length) {
      answer = response.content.filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text').map((b) => b.text).join('\n').trim();
      break;
    }
    const results: Anthropic.Beta.BetaToolResultBlockParam[] = await Promise.all(
      toolUses.map(async (t) => {
        try {
          const out = await runTool(ctx, t.name, (t.input ?? {}) as Record<string, unknown>);
          return { type: 'tool_result' as const, tool_use_id: t.id, content: JSON.stringify(out).slice(0, 60_000) };
        } catch (e) {
          return { type: 'tool_result' as const, tool_use_id: t.id, content: `Error: ${(e as Error).message}`, is_error: true };
        }
      }),
    );
    messages.push({ role: 'user', content: results });
  }
  if (!answer) answer = 'I could not finish answering that. Try a narrower question.';

  const seen = new Set<string>();
  const citations = ctx.refs.filter((r) => (seen.has(`${r.type}:${r.id}`) ? false : (seen.add(`${r.type}:${r.id}`), true))).slice(0, 8);
  await tx.askLog.create({ data: { userId: user.id, channel, question, answer, citations, table: ctx.table ?? undefined } });
  return { answer, citations, table: ctx.table };
}
