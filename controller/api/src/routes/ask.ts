import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db.js';
import { CONTROL_VIEWERS, MANAGERS, requireRole } from '../lib/auth.js';
import { currentUser, parse } from '../lib/http.js';
import { askController } from '../engine/ask.js';

const routes: FastifyPluginAsync = async (app) => {
  app.post('/ask', async (req) => {
    requireRole(req, [...CONTROL_VIEWERS, ...MANAGERS]);
    const body = parse(z.object({ question: z.string().min(3).max(1000) }), req.body);
    const user = await currentUser(req);
    return askController(prisma, user, req.user.outletIds, body.question, 'WEB');
  });
  app.get('/ask/history', async (req) => prisma.askLog.findMany({ where: { userId: req.user.sub }, orderBy: { createdAt: 'desc' }, take: 30 }));
};
export default routes;
