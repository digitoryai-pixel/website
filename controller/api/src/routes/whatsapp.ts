// M11: criticals reach the owner on WhatsApp; the owner can reply 1 / 2 or ask a question in the thread.
import type { FastifyPluginAsync } from 'fastify';
import { prisma } from '../db.js';
import { CHAIN_WIDE } from '../lib/auth.js';
import { inr } from '../lib/format.js';
import { sendWhatsApp } from '../lib/notify.js';
import { askController } from '../engine/ask.js';

type Inbound = { entry?: { changes?: { value?: { messages?: { from: string; text?: { body: string } }[] } }[] }[] };

const routes: FastifyPluginAsync = async (app) => {
  // Meta webhook verification handshake.
  app.get<{ Querystring: Record<string, string> }>('/webhooks/whatsapp', async (req, reply) => {
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === process.env.WHATSAPP_VERIFY_TOKEN) return reply.send(req.query['hub.challenge']);
    return reply.status(403).send('forbidden');
  });

  app.post('/webhooks/whatsapp', async (req) => {
    const body = req.body as Inbound;
    for (const change of body.entry?.flatMap((e) => e.changes ?? []) ?? []) {
      for (const m of change.value?.messages ?? []) {
        const text = m.text?.body?.trim();
        if (!text) continue;
        const user = await prisma.user.findFirst({ where: { whatsapp: m.from, active: true } });
        if (!user) continue; // unknown numbers get nothing back
        const outletIds = CHAIN_WIDE.includes(user.role)
          ? (await prisma.outlet.findMany({ where: { orgId: user.orgId } })).map((o) => o.id)
          : (await prisma.userOutlet.findMany({ where: { userId: user.id } })).map((x) => x.outletId);
        const last = await prisma.notification.findFirst({ where: { userId: user.id, channel: 'WHATSAPP', exceptionId: { not: null } }, orderBy: { createdAt: 'desc' } });
        const ex = last?.exceptionId ? await prisma.exception.findUnique({ where: { id: last.exceptionId } }) : null;
        let reply: string;
        if (text === '1' && ex) {
          reply = `${ex.title}\n${ex.summary}\n${inr(ex.impact)}, status ${ex.status.toLowerCase()}.\nOpen: ${process.env.WEB_URL ?? 'http://localhost:3100'}/exceptions/${ex.id}`;
        } else if (text === '2' && ex?.assigneeId) {
          const a = await prisma.user.findUnique({ where: { id: ex.assigneeId } });
          reply = a?.phone ? `Call ${a.shortName}: ${a.phone}` : 'No phone number on file for the owner of this item.';
        } else {
          reply = (await askController(prisma, user, outletIds, text, 'WHATSAPP')).answer;
        }
        await sendWhatsApp(m.from, reply);
      }
    }
    return { ok: true };
  });
};
export default routes;
