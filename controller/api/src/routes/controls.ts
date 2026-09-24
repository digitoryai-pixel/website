// S10 Controls setup. Tolerances and limits are adjustable; separation of duties is not.
import type { FastifyPluginAsync } from 'fastify';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../db.js';
import { CONTROL_VIEWERS, OWNERS, requireOutlet, requireRole } from '../lib/auth.js';
import { audit } from '../lib/audit.js';
import { getControls, SEPARATION_OF_DUTIES } from '../lib/controls.js';
import { badRequest } from '../lib/errors.js';
import { currentUser, parse, tx } from '../lib/http.js';

const tol = z.object({ pct: z.number().min(0).max(50), rupees: z.number().min(0), frequency: z.enum(['DAILY', '3X_WEEK', 'WEEKLY']) });
const lim = z.object({ discountPct: z.number().min(0).max(100).nullable(), comps: z.number().min(0).nullable(), wastage: z.number().min(0).nullable(), stockAdj: z.number().min(0).nullable() });
const sla = z.object({ hours: z.number().min(1).max(24 * 30), escalateTo: z.string() });
const body = z.object({
  tolerances: z.record(tol).optional(),
  approvalLimits: z.record(lim).optional(),
  sla: z.record(sla).optional(),
  settings: z.record(z.unknown()).optional(),
  separationOfDuties: z.unknown().optional(),
});

const routes: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: { outletId?: string } }>('/controls', async (req) => {
    requireRole(req, [...CONTROL_VIEWERS, 'OUTLET_MANAGER']);
    const outletId = req.query.outletId && req.query.outletId !== 'chain' ? req.query.outletId : null;
    if (outletId) requireOutlet(req, outletId);
    const effective = await getControls(prisma, req.user.orgId, outletId);
    return { outletId, ...effective, separationOfDuties: SEPARATION_OF_DUTIES.map((s) => ({ ...s, on: true, locked: true })) };
  });

  // Changes are logged with before and after values and need the owner or finance head.
  app.put<{ Querystring: { outletId?: string } }>('/controls', async (req) => {
    requireRole(req, OWNERS);
    const b = parse(body, req.body);
    if (b.separationOfDuties !== undefined) throw badRequest('LOCKED', "Separation of duties can't be switched off");
    if (b.approvalLimits && Object.keys(b.approvalLimits).some((r) => r === 'OWNER' || r === 'FINANCE_HEAD')) {
      throw badRequest('LOCKED', 'Owner and finance head limits are always "Any"');
    }
    const outletId = req.query.outletId && req.query.outletId !== 'chain' ? req.query.outletId : null;
    if (outletId) requireOutlet(req, outletId);
    const user = await currentUser(req);
    return tx(async (t) => {
      const before = await t.controlProfile.findFirst({ where: { orgId: user.orgId, outletId } });
      const merged = {
        tolerances: { ...((before?.tolerances as object) ?? {}), ...(b.tolerances ?? {}) },
        approvalLimits: { ...((before?.approvalLimits as object) ?? {}), ...(b.approvalLimits ?? {}) },
        sla: { ...((before?.sla as object) ?? {}), ...(b.sla ?? {}) },
        settings: { ...((before?.settings as object) ?? {}), ...(b.settings ?? {}) },
      } as Prisma.InputJsonObject;
      const saved = before
        ? await t.controlProfile.update({ where: { id: before.id }, data: { ...merged, updatedById: user.id } })
        : await t.controlProfile.create({ data: { orgId: user.orgId, outletId, ...merged, updatedById: user.id } as Prisma.ControlProfileUncheckedCreateInput });
      await audit(t, { orgId: user.orgId, actorId: user.id, action: 'controls.update', entity: 'controlProfile', entityId: saved.id, before: before ?? null, after: saved });
      return { ok: true, effective: await getControls(t, user.orgId, outletId) };
    });
  });

  app.get('/controls/history', async (req) => {
    requireRole(req, CONTROL_VIEWERS);
    const rows = await prisma.auditLog.findMany({ where: { orgId: req.user.orgId, entity: 'controlProfile' }, orderBy: { at: 'desc' }, take: 50 });
    const people = new Map((await prisma.user.findMany({ where: { id: { in: rows.map((r) => r.actorId!).filter(Boolean) } } })).map((u) => [u.id, u.shortName]));
    return rows.map((r) => ({ ...r, actor: r.actorId ? people.get(r.actorId) : null }));
  });
};
export default routes;
