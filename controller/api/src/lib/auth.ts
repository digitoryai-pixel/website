import '@fastify/jwt';
import type { FastifyRequest } from 'fastify';
import type { Role } from '@prisma/client';
import { forbidden } from './errors.js';

export type Client = 'web' | 'mobile';
export type AuthUser = {
  sub: string;
  orgId: string;
  role: Role;
  name: string;
  outletIds: string[];
  client: Client;
  deviceId?: string;
};

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: AuthUser;
    user: AuthUser;
  }
}

export const OWNERS: Role[] = ['OWNER', 'FINANCE_HEAD'];
export const CONTROL_VIEWERS: Role[] = ['OWNER', 'FINANCE_HEAD', 'REGIONAL_CONTROLLER'];
export const MANAGERS: Role[] = ['OUTLET_MANAGER', 'DUTY_MANAGER', 'BAR_MANAGER', 'HEAD_CHEF'];
export const CHAIN_WIDE: Role[] = ['OWNER', 'FINANCE_HEAD', 'REGIONAL_CONTROLLER', 'PURCHASE'];

export const me = (req: FastifyRequest) => req.user;

export function requireRole(req: FastifyRequest, roles: Role[]) {
  if (!roles.includes(req.user.role)) throw forbidden('ROLE', 'Your role cannot do this');
}

export function requireOutlet(req: FastifyRequest, outletId: string | null | undefined) {
  if (!outletId) return;
  if (!req.user.outletIds.includes(outletId)) throw forbidden('OUTLET_SCOPE', 'This outlet is outside your access');
}

/** Counts, receipts, wastage and cash counts can only be entered in the mobile app. */
export function requireMobile(req: FastifyRequest) {
  if (req.user.client !== 'mobile') {
    throw forbidden('MOBILE_ONLY', 'This entry can only be made in the Digitory Controller mobile app');
  }
}

/** Outlet filter for list queries: explicit outlet (checked) or the user's whole scope. */
export function outletScope(req: FastifyRequest, outletId?: string): string[] {
  if (outletId && outletId !== 'all') {
    requireOutlet(req, outletId);
    return [outletId];
  }
  return req.user.outletIds;
}
