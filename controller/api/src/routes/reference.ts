import type { FastifyPluginAsync } from 'fastify';
import { prisma } from '../db.js';
import { outletScope } from '../lib/auth.js';
import { ROLE_LABEL } from '../lib/people.js';

const routes: FastifyPluginAsync = async (app) => {
  app.get('/outlets', async (req) =>
    prisma.outlet.findMany({ where: { id: { in: req.user.outletIds } }, include: { locations: { orderBy: { sortOrder: 'asc' } } }, orderBy: { name: 'asc' } }),
  );

  app.get<{ Querystring: { category?: string; q?: string } }>('/items', async (req) =>
    prisma.item.findMany({
      where: {
        orgId: req.user.orgId, active: true,
        ...(req.query.category ? { category: req.query.category as 'DAIRY' } : {}),
        ...(req.query.q ? { name: { contains: req.query.q, mode: 'insensitive' } } : {}),
      },
      // Counters never see system quantities; the catalogue carries none.
      select: { id: true, sku: true, name: true, category: true, baseUnit: true, packSize: true, countMode: true, standardCost: true, isHighValue: true },
      orderBy: { name: 'asc' },
    }),
  );

  app.get<{ Querystring: { outletId?: string } }>('/users', async (req) => {
    const ids = outletScope(req, req.query.outletId);
    const users = await prisma.user.findMany({
      where: { orgId: req.user.orgId, active: true, OR: [{ outlets: { some: { outletId: { in: ids } } } }, { role: { in: ['OWNER', 'FINANCE_HEAD'] } }] },
      include: { outlets: true },
      orderBy: { name: 'asc' },
    });
    return users.map((u) => ({ id: u.id, name: u.name, shortName: u.shortName, role: u.role, roleLabel: ROLE_LABEL[u.role], title: u.title, outletIds: u.outlets.map((o) => o.outletId) }));
  });

  app.get<{ Querystring: { domain?: string } }>('/reason-codes', async (req) =>
    prisma.reasonCode.findMany({ where: { orgId: req.user.orgId, ...(req.query.domain ? { domain: { in: req.query.domain.split(',') } } : {}) }, orderBy: { label: 'asc' } }),
  );

  app.get('/vendors', async (req) => prisma.vendor.findMany({ where: { orgId: req.user.orgId }, include: { rates: true }, orderBy: { name: 'asc' } }));

  app.get('/menu-items', async (req) =>
    prisma.menuItem.findMany({ where: { orgId: req.user.orgId }, include: { recipes: { where: { active: true }, include: { lines: true } } }, orderBy: { name: 'asc' } }),
  );
};
export default routes;
