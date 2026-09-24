import type { Role, User } from '@prisma/client';
import type { Tx } from '../db.js';

export async function usersWithRole(tx: Tx, orgId: string, roles: Role[], outletId?: string | null): Promise<User[]> {
  return tx.user.findMany({
    where: {
      orgId,
      active: true,
      role: { in: roles },
      ...(outletId ? { outlets: { some: { outletId } } } : {}),
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function outletManager(tx: Tx, orgId: string, outletId: string | null | undefined) {
  if (!outletId) return null;
  return (await usersWithRole(tx, orgId, ['OUTLET_MANAGER'], outletId))[0] ?? null;
}

export async function owner(tx: Tx, orgId: string) {
  return (await usersWithRole(tx, orgId, ['OWNER']))[0] ?? null;
}

export async function financeHead(tx: Tx, orgId: string) {
  return (await usersWithRole(tx, orgId, ['FINANCE_HEAD']))[0] ?? null;
}

export async function userMap(tx: Tx, ids: (string | null | undefined)[]) {
  const uniq = [...new Set(ids.filter(Boolean) as string[])];
  const rows = await tx.user.findMany({ where: { id: { in: uniq } } });
  return new Map(rows.map((u) => [u.id, u]));
}

export const ROLE_LABEL: Record<Role, string> = {
  OWNER: 'Owner',
  FINANCE_HEAD: 'Finance head',
  REGIONAL_CONTROLLER: 'Regional controller',
  OUTLET_MANAGER: 'Outlet manager',
  DUTY_MANAGER: 'Duty manager',
  BAR_MANAGER: 'Bar manager',
  HEAD_CHEF: 'Head chef',
  PURCHASE: 'Purchase',
  STORE: 'Store',
  RECEIVER: 'Receiver',
  COUNTER: 'Counter',
  CASHIER: 'Cashier',
  KITCHEN_STAFF: 'Kitchen',
  BAR_STAFF: 'Bar',
  STEWARD: 'Steward',
};
