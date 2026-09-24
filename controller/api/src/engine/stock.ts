import type { Item, MovementType } from '@prisma/client';
import type { Tx } from '../db.js';
import { round2 } from '../lib/time.js';

/** Theoretical stock of one item at an outlet (optionally a location) at an instant. */
export async function theoreticalQty(tx: Tx, outletId: string, itemId: string, at: Date, locationId?: string | null) {
  const r = await tx.stockMovement.aggregate({
    _sum: { qty: true },
    where: { outletId, itemId, at: { lte: at }, ...(locationId ? { locationId } : {}) },
  });
  return round2(r._sum.qty ?? 0);
}

export async function postMovement(
  tx: Tx,
  m: {
    outletId: string;
    item: Pick<Item, 'id' | 'standardCost'>;
    locationId?: string | null;
    type: MovementType;
    qty: number;
    at: Date;
    businessDate: string;
    refType?: string;
    refId?: string;
    reasonCode?: string;
    approvedById?: string | null;
    createdById?: string | null;
    unitCost?: number;
  },
) {
  if (m.qty === 0) return null;
  const locationId = m.locationId ?? (await defaultLocation(tx, m.outletId, m.item.id));
  return tx.stockMovement.create({
    data: {
      outletId: m.outletId,
      itemId: m.item.id,
      locationId,
      type: m.type,
      qty: m.qty,
      unitCost: m.unitCost ?? m.item.standardCost,
      at: m.at,
      businessDate: m.businessDate,
      refType: m.refType,
      refId: m.refId,
      reasonCode: m.reasonCode,
      approvedById: m.approvedById ?? null,
      createdById: m.createdById ?? null,
    },
  });
}

/** Where an item lives at an outlet when a movement doesn't say (first mapped location in store order). */
export async function defaultLocation(tx: Tx, outletId: string, itemId: string): Promise<string | null> {
  const il = await tx.itemLocation.findFirst({
    where: { itemId, location: { outletId } },
    orderBy: [{ location: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
  });
  return il?.locationId ?? null;
}

/** Liquor variance is valued at selling price; everything else at cost. */
export function varianceValue(item: Pick<Item, 'standardCost' | 'sellingPricePerUnit' | 'category'>, qty: number) {
  const rate = item.category === 'SPIRITS_WINE' && item.sellingPricePerUnit ? item.sellingPricePerUnit : item.standardCost;
  return round2(qty * rate);
}

/** M4: open bottles are weighed, not guessed. grams → ml via the SKU's empty weight and density. */
export function openBottleMl(item: Pick<Item, 'emptyWeightG' | 'densityGPerMl'>, weightG: number) {
  const empty = item.emptyWeightG ?? 0;
  const density = item.densityGPerMl ?? 0.94;
  return Math.max(0, Math.round((weightG - empty) / density));
}
