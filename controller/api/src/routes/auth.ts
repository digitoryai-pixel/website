import type { FastifyPluginAsync } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../db.js';
import type { AuthUser } from '../lib/auth.js';
import { AppError } from '../lib/errors.js';
import { currentUser, parse } from '../lib/http.js';
import { ROLE_LABEL } from '../lib/people.js';
import { CHAIN_WIDE } from '../lib/auth.js';
import type { User } from '@prisma/client';

async function outletIdsFor(u: User) {
  if (CHAIN_WIDE.includes(u.role)) return (await prisma.outlet.findMany({ where: { orgId: u.orgId }, select: { id: true } })).map((o) => o.id);
  return (await prisma.userOutlet.findMany({ where: { userId: u.id } })).map((x) => x.outletId);
}

async function profile(u: User, client: 'web' | 'mobile') {
  const org = await prisma.org.findUniqueOrThrow({ where: { id: u.orgId } });
  const outletIds = await outletIdsFor(u);
  const outlets = await prisma.outlet.findMany({ where: { id: { in: outletIds } }, orderBy: { name: 'asc' } });
  return {
    id: u.id, name: u.name, shortName: u.shortName, role: u.role, roleLabel: ROLE_LABEL[u.role], title: u.title,
    org: { id: org.id, name: org.name }, outlets: outlets.map((o) => ({ id: o.id, name: o.name, code: o.code, kind: o.kind, hasDraught: o.hasDraught })), client,
  };
}

const routes: FastifyPluginAsync = async (app) => {
  // Web: owners, finance, regional controllers, managers.
  app.post('/auth/login', async (req) => {
    const body = parse(z.object({ email: z.string().email(), password: z.string().min(1) }), req.body);
    const u = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (!u?.active || !u.passwordHash || !(await bcrypt.compare(body.password, u.passwordHash))) {
      throw new AppError(401, 'BAD_CREDENTIALS', 'Email or password is wrong');
    }
    const payload: AuthUser = { sub: u.id, orgId: u.orgId, role: u.role, name: u.shortName, outletIds: await outletIdsFor(u), client: 'web' };
    return { token: app.jwt.sign(payload), user: await profile(u, 'web') };
  });

  // Mobile: phone + PIN on a registered device. Counts, receipts, wastage and cash counts need this token.
  app.post('/auth/mobile-login', async (req) => {
    const body = parse(z.object({ phone: z.string().min(6), pin: z.string().min(4).max(6), deviceId: z.string().min(4) }), req.body);
    const u = await prisma.user.findUnique({ where: { phone: body.phone } });
    if (!u?.active || !u.pinHash || !(await bcrypt.compare(body.pin, u.pinHash))) {
      throw new AppError(401, 'BAD_CREDENTIALS', 'Phone or PIN is wrong');
    }
    const payload: AuthUser = { sub: u.id, orgId: u.orgId, role: u.role, name: u.shortName, outletIds: await outletIdsFor(u), client: 'mobile', deviceId: body.deviceId };
    return { token: app.jwt.sign(payload, { expiresIn: '16h' }), user: await profile(u, 'mobile') };
  });

  app.get('/me', async (req) => profile(await currentUser(req), req.user.client));
};
export default routes;
