import type { FastifyRequest } from 'fastify';
import type { User } from '@prisma/client';
import { z, type ZodTypeAny } from 'zod';
import { prisma, type Tx } from '../db.js';
import { AppError, badRequest } from './errors.js';

export function parse<S extends ZodTypeAny>(schema: S, data: unknown): z.infer<S> {
  const r = schema.safeParse(data);
  if (!r.success) throw badRequest('VALIDATION', 'Invalid request', r.error.issues);
  return r.data;
}

export async function currentUser(req: FastifyRequest): Promise<User> {
  const u = await prisma.user.findUnique({ where: { id: req.user.sub } });
  if (!u || !u.active) throw new AppError(401, 'UNAUTHENTICATED', 'Account not active');
  return u;
}

/** Run a unit of work in one transaction so a failed rule leaves nothing half-written. */
export function tx<T>(fn: (t: Tx) => Promise<T>, timeoutMs = 20_000): Promise<T> {
  return prisma.$transaction((t) => fn(t), { timeout: timeoutMs, maxWait: 10_000 });
}

export const zDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');
export const zMonth = z.string().regex(/^\d{4}-\d{2}$/, 'Use YYYY-MM');
export const zId = z.string().min(1);
