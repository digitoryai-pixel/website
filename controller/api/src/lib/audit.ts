import type { Tx } from '../db.js';

export async function audit(
  tx: Tx,
  a: { orgId: string; actorId?: string | null; action: string; entity: string; entityId?: string; before?: unknown; after?: unknown },
) {
  await tx.auditLog.create({
    data: {
      orgId: a.orgId,
      actorId: a.actorId ?? null,
      action: a.action,
      entity: a.entity,
      entityId: a.entityId,
      before: a.before === undefined ? undefined : (a.before as object),
      after: a.after === undefined ? undefined : (a.after as object),
    },
  });
}
