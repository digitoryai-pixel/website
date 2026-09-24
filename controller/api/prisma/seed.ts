// Demo data for Hopline Brewing Co. — reproduces the scenarios in the Phase 1 screens pack.
// Everything that has a rule is driven through the real engines (counts, cash, purchasing,
// wastage, transfers, day close), so the exceptions you see are the ones the system raised.
// All names, outlets and figures are demo data.
import '../src/env.js';
process.env.QUIET_NOTIFY = '1';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Category, CountMode, BaseUnit, LocationKind, MenuKind, Role, User, Prisma } from '@prisma/client';
import { prisma, type Tx } from '../src/db.js';
import { DEFAULT_CONTROLS } from '../src/lib/controls.js';
import { addDays, atLocal, businessDate, monthOf, monthRange, round2 } from '../src/lib/time.js';
import { enterLine, startTask, submitTask, createCountTask } from '../src/engine/counts.js';
import { openShift, secondCount, submitClose } from '../src/engine/cash.js';
import { approvePO, createPO, enterInvoice, receiveGoods } from '../src/engine/purchasing.js';
import { decideWastage, dispatchTransfer, logWastage, receiveTransfer } from '../src/engine/wastage.js';
import { closeDayAllOutlets, countsNotStarted } from '../src/engine/dayclose.js';
import { openBottleMl } from '../src/engine/stock.js';
import { dispatchNotifications } from '../src/jobs/scheduler.js';

// Deterministic randomness so every seed looks the same.
let s = 20260922;
const rand = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
const jitter = (n: number, pct = 0.1) => n * (1 + (rand() * 2 - 1) * pct);
const pick = <T,>(a: T[]) => a[Math.floor(rand() * a.length)];

const NOW = new Date();
const D = addDays(businessDate(NOW), -1); // "yesterday": the day the Daily Flash reports on
const HISTORY_DAYS = 56;
const PIN = '1234';
const PASSWORD = 'demo1234';

const run = <T,>(fn: (t: Tx) => Promise<T>) => prisma.$transaction(fn, { timeout: 180_000, maxWait: 20_000 });

async function wipe() {
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename <> '_prisma_migrations'`;
  await prisma.$executeRawUnsafe(`TRUNCATE ${tables.map((t) => `"${t.tablename}"`).join(', ')} RESTART IDENTITY CASCADE`);
}

// ─────────────── Catalogue ───────────────

type ItemDef = { sku: string; name: string; category: Category; baseUnit: BaseUnit; packSize?: number; countMode: CountMode; standardCost: number; sell?: number; empty?: number; hv?: boolean };
const ITEMS: ItemDef[] = [
  { sku: 'JAM750', name: 'Jameson 750 ml', category: 'SPIRITS_WINE', baseUnit: 'ML', packSize: 750, countMode: 'BOTTLE_AND_OPEN', standardCost: 2.6, sell: 11.32, empty: 540, hv: true },
  { sku: 'JWB750', name: 'Johnnie Walker Black 750 ml', category: 'SPIRITS_WINE', baseUnit: 'ML', packSize: 750, countMode: 'BOTTLE_AND_OPEN', standardCost: 4.2, sell: 13.67, empty: 560, hv: true },
  { sku: 'TAN750', name: 'Tanqueray 750 ml', category: 'SPIRITS_WINE', baseUnit: 'ML', packSize: 750, countMode: 'BOTTLE_AND_OPEN', standardCost: 3.0, sell: 10, empty: 600, hv: true },
  { sku: 'OMK750', name: 'Old Monk 750 ml', category: 'SPIRITS_WINE', baseUnit: 'ML', packSize: 750, countMode: 'BOTTLE_AND_OPEN', standardCost: 0.9, sell: 6, empty: 500 },
  { sku: 'BAC750', name: 'Bacardi Carta Blanca 750 ml', category: 'SPIRITS_WINE', baseUnit: 'ML', packSize: 750, countMode: 'BOTTLE_AND_OPEN', standardCost: 1.1, sell: 6, empty: 520 },
  { sku: 'SULASB', name: 'Sula Sauvignon Blanc', category: 'SPIRITS_WINE', baseUnit: 'ML', packSize: 750, countMode: 'BOTTLE_AND_OPEN', standardCost: 1.1, sell: 4, empty: 520 },
  { sku: 'KFU650', name: 'Kingfisher Ultra 650 ml', category: 'BOTTLED_BEER', baseUnit: 'PC', countMode: 'UNITS', standardCost: 140 },
  { sku: 'LAGER', name: 'House Lager', category: 'DRAUGHT_BEER', baseUnit: 'ML', countMode: 'UNITS', standardCost: 0.12, sell: 0.78 },
  { sku: 'WIT', name: 'Belgian Wit', category: 'DRAUGHT_BEER', baseUnit: 'ML', countMode: 'UNITS', standardCost: 0.13, sell: 0.94 },
  { sku: 'HIPA', name: 'Hazy IPA', category: 'DRAUGHT_BEER', baseUnit: 'ML', countMode: 'UNITS', standardCost: 0.15, sell: 0.98 },
  { sku: 'STOUT', name: 'Stout', category: 'DRAUGHT_BEER', baseUnit: 'ML', countMode: 'UNITS', standardCost: 0.14, sell: 0.96 },
  { sku: 'CHKBR', name: 'Chicken breast', category: 'MEAT_SEAFOOD', baseUnit: 'KG', countMode: 'WEIGHT', standardCost: 420, hv: true },
  { sku: 'CHKLG', name: 'Chicken leg, skin-on', category: 'MEAT_SEAFOOD', baseUnit: 'KG', countMode: 'WEIGHT', standardCost: 310, hv: true },
  { sku: 'MUTN', name: 'Mutton', category: 'MEAT_SEAFOOD', baseUnit: 'KG', countMode: 'WEIGHT', standardCost: 780, hv: true },
  { sku: 'PANR', name: 'Paneer', category: 'DAIRY', baseUnit: 'KG', countMode: 'WEIGHT', standardCost: 360 },
  { sku: 'CREAM', name: 'Amul fresh cream 1 l', category: 'DAIRY', baseUnit: 'PC', countMode: 'UNITS', standardCost: 220 },
  { sku: 'BUTR', name: 'Butter', category: 'DAIRY', baseUnit: 'KG', countMode: 'WEIGHT', standardCost: 520 },
  { sku: 'RICE', name: 'Basmati rice', category: 'DRY_STORE', baseUnit: 'KG', countMode: 'WEIGHT', standardCost: 120 },
  { sku: 'SPICE', name: 'Spice and oil mix', category: 'DRY_STORE', baseUnit: 'KG', countMode: 'WEIGHT', standardCost: 410 },
  { sku: 'ONION', name: 'Onion', category: 'PRODUCE', baseUnit: 'KG', countMode: 'WEIGHT', standardCost: 35 },
  { sku: 'TOMATO', name: 'Tomato', category: 'PRODUCE', baseUnit: 'KG', countMode: 'WEIGHT', standardCost: 40 },
  { sku: 'FRIES', name: 'Frozen fries', category: 'DRY_STORE', baseUnit: 'KG', countMode: 'WEIGHT', standardCost: 180 },
  { sku: 'BOX', name: 'Takeaway box', category: 'PACKAGING', baseUnit: 'PC', countMode: 'UNITS', standardCost: 11.5 },
];

const LOCATION_FOR: Record<Category, string> = {
  SPIRITS_WINE: 'Main bar', BOTTLED_BEER: 'Back bar', DRAUGHT_BEER: 'Taps', MEAT_SEAFOOD: 'Walk-in chiller', DAIRY: 'Walk-in chiller',
  PRODUCE: 'Walk-in chiller', DRY_STORE: 'Dry store', PACKAGING: 'Dry store',
};
const SHELF: Record<string, string> = {
  JAM750: 'Shelf 1, back wall', JWB750: 'Shelf 1, back wall', OMK750: 'Shelf 1, back wall', TAN750: 'Shelf 2, speed rail', BAC750: 'Shelf 2, speed rail', SULASB: 'Wine fridge',
};

type MenuDef = { name: string; kind: MenuKind; price: number; station: string; section?: string; base: number; recipe: [string, number][] };
const SPICE: [string, number] = ['SPICE', 0.06];
const MENU: MenuDef[] = [
  { name: 'Tandoori chicken', kind: 'FOOD', price: 520, station: 'Tandoor', section: 'Tandoor', base: 64, recipe: [['CHKLG', 0.3], ['BUTR', 0.01], ['ONION', 0.05], SPICE] },
  { name: 'Chicken tikka', kind: 'FOOD', price: 590, station: 'Tandoor', section: 'Tandoor', base: 81, recipe: [['CHKBR', 0.18], ['BUTR', 0.01], ['ONION', 0.03], SPICE] },
  { name: 'Butter chicken', kind: 'FOOD', price: 560, station: 'Main kitchen', section: 'Main kitchen', base: 112, recipe: [['CHKBR', 0.12], ['CREAM', 0.04], ['BUTR', 0.03], ['TOMATO', 0.15], SPICE] },
  { name: 'Tandoori platter', kind: 'FOOD', price: 1650, station: 'Tandoor', section: 'Tandoor', base: 14, recipe: [['CHKLG', 0.25], ['CHKBR', 0.15], ['MUTN', 0.1], ['SPICE', 0.1]] },
  { name: 'Mutton seekh', kind: 'FOOD', price: 790, station: 'Tandoor', section: 'Tandoor', base: 34, recipe: [['MUTN', 0.18], ['ONION', 0.03], SPICE] },
  { name: 'Paneer tikka', kind: 'FOOD', price: 450, station: 'Tandoor', section: 'Tandoor', base: 58, recipe: [['PANR', 0.2], ['ONION', 0.03], SPICE] },
  { name: 'Veg biryani', kind: 'FOOD', price: 380, station: 'Main kitchen', section: 'Main kitchen', base: 80, recipe: [['RICE', 0.15], ['ONION', 0.08], ['TOMATO', 0.05], SPICE] },
  { name: 'Fries', kind: 'FOOD', price: 260, station: 'Fry', section: 'Fry', base: 104, recipe: [['FRIES', 0.2], ['SPICE', 0.02]] },
  { name: 'Jameson 60 ml', kind: 'LIQUOR', price: 900, station: 'Main bar', base: 30, recipe: [['JAM750', 60]] },
  { name: 'Johnnie Walker Black 60 ml', kind: 'LIQUOR', price: 1180, station: 'Main bar', base: 21, recipe: [['JWB750', 60]] },
  { name: 'Tanqueray 60 ml', kind: 'LIQUOR', price: 700, station: 'Main bar', base: 11, recipe: [['TAN750', 60]] },
  { name: 'Old Monk 60 ml', kind: 'LIQUOR', price: 360, station: 'Main bar', base: 17, recipe: [['OMK750', 60]] },
  { name: 'Bacardi 60 ml', kind: 'LIQUOR', price: 420, station: 'Main bar', base: 11, recipe: [['BAC750', 60]] },
  { name: 'Sula Sauvignon Blanc 150 ml', kind: 'LIQUOR', price: 650, station: 'Main bar', base: 4, recipe: [['SULASB', 150]] },
  { name: 'Kingfisher Ultra 650 ml', kind: 'BEVERAGE', price: 450, station: 'Back bar', base: 44, recipe: [['KFU650', 1]] },
  { name: 'Hazy IPA 500 ml', kind: 'BEVERAGE', price: 490, station: 'Taps', base: 80, recipe: [['HIPA', 500]] },
  { name: 'Belgian Wit 500 ml', kind: 'BEVERAGE', price: 470, station: 'Taps', base: 56, recipe: [['WIT', 500]] },
  { name: 'House Lager 500 ml', kind: 'BEVERAGE', price: 390, station: 'Taps', base: 96, recipe: [['LAGER', 500]] },
  { name: 'Stout 500 ml', kind: 'BEVERAGE', price: 480, station: 'Taps', base: 40, recipe: [['STOUT', 500]] },
];
const DOW_FACTOR = [1.25, 0.8, 0.85, 0.9, 0.95, 1.2, 1.35]; // Sun..Sat

// ─────────────── People ───────────────

type UserDef = { key: string; name: string; short: string; role: Role; title?: string; outlets: string[]; email?: string; phone?: string };
const USERS: UserDef[] = [
  { key: 'shiv', name: 'Shiv Mogali', short: 'Shiv M', role: 'OWNER', outlets: [], email: 'shiv@hopline.in', phone: '9800000001' },
  { key: 'anita', name: 'Anita Rao', short: 'Anita R', role: 'FINANCE_HEAD', outlets: [], email: 'anita@hopline.in', phone: '9800000002' },
  { key: 'meera', name: 'Meera Joshi', short: 'Meera J', role: 'PURCHASE', title: 'Purchase', outlets: [], email: 'meera@hopline.in', phone: '9800000003' },
  // Indiranagar — counters first so the system picks Deepa for recounts.
  { key: 'ravi', name: 'Ravi Kumar', short: 'Ravi K', role: 'COUNTER', title: 'Store and bar counter', outlets: ['IND'], phone: '9000000001' },
  { key: 'deepa', name: 'Deepa Shetty', short: 'Deepa S', role: 'COUNTER', title: 'Store counter', outlets: ['IND'], phone: '9000000002' },
  { key: 'rohit', name: 'Rohit Bansal', short: 'Rohit B', role: 'OUTLET_MANAGER', title: 'Outlet manager', outlets: ['IND'], email: 'rohit@hopline.in', phone: '9000000003' },
  { key: 'rakesh', name: 'Rakesh Menon', short: 'Rakesh M', role: 'BAR_MANAGER', title: 'Bar manager', outlets: ['IND'], email: 'rakesh@hopline.in', phone: '9000000004' },
  { key: 'vikram', name: 'Vikram Singh', short: 'Vikram S', role: 'DUTY_MANAGER', title: 'Duty manager', outlets: ['IND'], email: 'vikram@hopline.in', phone: '9000000005' },
  { key: 'manoj', name: 'Manoj Pillai', short: 'Manoj P', role: 'BAR_STAFF', title: 'Bartender', outlets: ['IND'], phone: '9000000006' },
  { key: 'sameer', name: 'Sameer Das', short: 'Sameer D', role: 'BAR_STAFF', title: 'Bartender', outlets: ['IND'], phone: '9000000007' },
  { key: 'indcash', name: 'Farah Khan', short: 'Farah K', role: 'CASHIER', title: 'Cashier', outlets: ['IND'], phone: '9000000008' },
  { key: 'indstew', name: 'Karan Mehta', short: 'Karan M', role: 'STEWARD', title: 'Steward', outlets: ['IND'], phone: '9000000009' },
  // Koramangala
  { key: 'korcount', name: 'Imran Shaikh', short: 'Imran S', role: 'COUNTER', title: 'Store counter', outlets: ['KOR'], phone: '9000000101' },
  { key: 'priya', name: 'Priya Nair', short: 'Priya N', role: 'OUTLET_MANAGER', title: 'Outlet manager', outlets: ['KOR'], email: 'priya@hopline.in', phone: '9000000102' },
  { key: 'anand', name: 'Anand Rao', short: 'Anand R', role: 'HEAD_CHEF', title: 'Head chef', outlets: ['KOR'], email: 'anand@hopline.in', phone: '9000000103' },
  { key: 'suresh', name: 'Suresh Babu', short: 'Suresh B', role: 'KITCHEN_STAFF', title: 'Tandoor cook', outlets: ['KOR'], phone: '9000000104' },
  { key: 'arjun', name: 'Arjun Thomas', short: 'Arjun T', role: 'STEWARD', title: 'Steward', outlets: ['KOR'], phone: '9000000105' },
  { key: 'leela', name: 'Leela Varma', short: 'Leela V', role: 'STEWARD', title: 'Steward', outlets: ['KOR'], phone: '9000000106' },
  { key: 'korcash', name: 'Neha Gupta', short: 'Neha G', role: 'CASHIER', title: 'Cashier', outlets: ['KOR'], phone: '9000000107' },
  { key: 'kiran', name: 'Kiran Shetty', short: 'Kiran S', role: 'STORE', title: 'Store in-charge', outlets: ['KOR', 'WHF'], phone: '9000000108' },
  // Whitefield
  { key: 'whfcount', name: 'Lokesh R', short: 'Lokesh R', role: 'COUNTER', title: 'Store counter', outlets: ['WHF'], phone: '9000000201' },
  { key: 'sunil', name: 'Sunil Dsouza', short: 'Sunil D', role: 'OUTLET_MANAGER', title: 'Outlet manager', outlets: ['WHF'], email: 'sunil@hopline.in', phone: '9000000202' },
  { key: 'ajay', name: 'Ajay Verma', short: 'Ajay V', role: 'DUTY_MANAGER', title: 'Duty manager', outlets: ['WHF'], email: 'ajay@hopline.in', phone: '9000000203' },
  { key: 'nikhil', name: 'Nikhil Prasad', short: 'Nikhil P', role: 'CASHIER', title: 'Cashier', outlets: ['WHF'], phone: '9000000204' },
  { key: 'whfstew', name: 'Rahul J', short: 'Rahul J', role: 'STEWARD', title: 'Steward', outlets: ['WHF'], phone: '9000000205' },
  // HSR Layout
  { key: 'asha', name: 'Asha Thomas', short: 'Asha T', role: 'STORE', title: 'Store in-charge', outlets: ['HSR'], phone: '9000000301' },
  { key: 'hsrcount', name: 'Vinod K', short: 'Vinod K', role: 'COUNTER', title: 'Store counter', outlets: ['HSR'], phone: '9000000302' },
  { key: 'sanjay', name: 'Sanjay Kulkarni', short: 'Sanjay K', role: 'OUTLET_MANAGER', title: 'Outlet manager', outlets: ['HSR'], email: 'sanjay@hopline.in', phone: '9000000303' },
  { key: 'hsrstew', name: 'Tina P', short: 'Tina P', role: 'STEWARD', title: 'Steward', outlets: ['HSR'], phone: '9000000304' },
  // Central kitchen
  { key: 'farhan', name: 'Farhan Ali', short: 'Farhan A', role: 'STORE', title: 'CK store in-charge', outlets: ['CK'], phone: '9000000401' },
];

const OUTLETS = [
  { code: 'IND', name: 'Indiranagar', kind: 'RESTAURANT' as const, hasDraught: true, factor: 1.3 },
  { code: 'KOR', name: 'Koramangala', kind: 'RESTAURANT' as const, hasDraught: true, factor: 1.25 },
  { code: 'WHF', name: 'Whitefield', kind: 'RESTAURANT' as const, hasDraught: false, factor: 1.35 },
  { code: 'HSR', name: 'HSR Layout', kind: 'RESTAURANT' as const, hasDraught: false, factor: 1.3 },
  { code: 'CK', name: 'Central kitchen', kind: 'CENTRAL_KITCHEN' as const, hasDraught: false, factor: 0 },
];
const MANAGERS_BY_OUTLET: Record<string, string[]> = { IND: ['vikram', 'rohit'], KOR: ['priya'], WHF: ['sunil', 'ajay'], HSR: ['sanjay'] };
const STEWARDS: Record<string, string[]> = { IND: ['indstew', 'manoj'], KOR: ['arjun', 'leela'], WHF: ['whfstew'], HSR: ['hsrstew'] };

async function main() {
  console.log(`Seeding demo data. Report date (yesterday) = ${D}`);
  await wipe();
  const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? './uploads');
  await mkdir(uploadDir, { recursive: true });
  // 1×1 PNG placeholder for photo evidence.
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  await writeFile(path.join(uploadDir, 'demo-photo.png'), png);

  const org = await prisma.org.create({ data: { name: 'Hopline Brewing Co.' } });
  const outlets: Record<string, { id: string; code: string; name: string; hasDraught: boolean; factor: number }> = {};
  const locs: Record<string, Record<string, string>> = {};
  for (const o of OUTLETS) {
    const row = await prisma.outlet.create({ data: { orgId: org.id, code: o.code, name: o.name, kind: o.kind, hasDraught: o.hasDraught, city: 'Bengaluru' } });
    outlets[o.code] = { ...row, factor: o.factor };
    const defs: [string, LocationKind][] =
      o.kind === 'CENTRAL_KITCHEN'
        ? [['Main store', 'STORE']]
        : [['Main bar', 'BAR'], ['Back bar', 'BAR'], ...(o.hasDraught ? ([['Taps', 'TAPS']] as [string, LocationKind][]) : []), ['Walk-in chiller', 'CHILLER'], ['Dry store', 'STORE']];
    locs[o.code] = {};
    for (const [i, [name, kind]] of defs.entries()) {
      locs[o.code][name] = (await prisma.location.create({ data: { outletId: row.id, name, kind, sortOrder: i } })).id;
    }
  }

  const pinHash = await bcrypt.hash(PIN, 8);
  const pwHash = await bcrypt.hash(PASSWORD, 8);
  const U: Record<string, User> = {};
  for (const u of USERS) {
    U[u.key] = await prisma.user.create({
      data: {
        orgId: org.id, name: u.name, shortName: u.short, role: u.role, title: u.title, email: u.email, phone: u.phone,
        whatsapp: u.phone ? `91${u.phone}` : null, pinHash, passwordHash: u.email ? pwHash : null,
        outlets: { create: u.outlets.map((c) => ({ outletId: outlets[c].id })) },
      },
    });
  }

  const I: Record<string, { id: string; standardCost: number; sellingPricePerUnit: number | null; category: Category; emptyWeightG: number | null; densityGPerMl: number | null; packSize: number | null; baseUnit: BaseUnit }> = {};
  for (const it of ITEMS) {
    I[it.sku] = await prisma.item.create({
      data: {
        orgId: org.id, sku: it.sku, name: it.name, category: it.category, baseUnit: it.baseUnit, packSize: it.packSize, countMode: it.countMode,
        standardCost: it.standardCost, sellingPricePerUnit: it.sell, emptyWeightG: it.empty, densityGPerMl: it.empty ? 0.94 : null, isHighValue: !!it.hv,
      },
    });
  }
  // Map items to locations in shelf order.
  for (const o of OUTLETS) {
    for (const [i, it] of ITEMS.entries()) {
      const locName = o.kind === 'CENTRAL_KITCHEN' ? 'Main store' : LOCATION_FOR[it.category];
      const locId = locs[o.code][locName];
      if (!locId) continue;
      await prisma.itemLocation.create({ data: { itemId: I[it.sku].id, locationId: locId, shelf: SHELF[it.sku] ?? null, sortOrder: i } });
    }
  }

  const M: Record<string, { id: string; price: number; kind: MenuKind; station: string; recipe: [string, number][]; base: number; section?: string }> = {};
  for (const m of MENU) {
    const row = await prisma.menuItem.create({
      data: { orgId: org.id, name: m.name, kind: m.kind, price: m.price, station: m.station, recipes: { create: { version: 4, section: m.section, lines: { create: m.recipe.map(([sku, q]) => ({ itemId: I[sku].id, qty: q })) } } } },
    });
    M[m.name] = { id: row.id, price: m.price, kind: m.kind, station: m.station, recipe: m.recipe, base: m.base, section: m.section };
  }

  const vendorDefs: [string, [string, number][]][] = [
    ['FreshCo Poultry', [['CHKBR', 425], ['CHKLG', 310]]],
    ['Green Leaf Vegetables', [['ONION', 35], ['TOMATO', 40]]],
    ['Pack & Go Packaging', [['BOX', 11.5]]],
    ['Spice Route', [['SPICE', 410], ['RICE', 120]]],
    ['Metro Dairy', [['CREAM', 220], ['BUTR', 520], ['PANR', 360]]],
    ['Deccan Spirits Traders', [['JAM750', 2.6], ['JWB750', 4.2], ['TAN750', 3.0], ['OMK750', 0.9], ['BAC750', 1.1], ['SULASB', 1.1], ['KFU650', 140]]],
    ['Hopline Brewery', [['LAGER', 0.12], ['WIT', 0.13], ['HIPA', 0.15], ['STOUT', 0.14]]],
    ['Deccan Meats', [['MUTN', 780]]],
    ['Frozen Foods Co.', [['FRIES', 180]]],
  ];
  const V: Record<string, string> = {};
  for (const [name, rates] of vendorDefs) {
    V[name] = (await prisma.vendor.create({ data: { orgId: org.id, name, gstin: `29AAB${Math.floor(rand() * 1e5)}Z1`, rates: { create: rates.map(([sku, rate]) => ({ itemId: I[sku].id, rate, validFrom: new Date('2026-04-01') })) } } })).id;
  }

  const reasons: [string, string, string][] = [
    ['EXCEPTION_CLOSE', 'PORTION_OVER_STANDARD', 'Portion over standard'],
    ['EXCEPTION_CLOSE', 'RECIPE_NOT_FOLLOWED', 'Recipe not followed'],
    ['EXCEPTION_CLOSE', 'VENDOR_RATE_CORRECTED', 'Vendor rate corrected'],
    ['EXCEPTION_CLOSE', 'COUNTING_ERROR', 'Counting error, recounted'],
    ['EXCEPTION_CLOSE', 'THEFT_CONFIRMED', 'Theft confirmed, action taken'],
    ['EXCEPTION_CLOSE', 'SYSTEM_ENTRY_ERROR', 'Entry error in POS or purchase'],
    ['EXCEPTION_CLOSE', 'TRAINING_ISSUE', 'Staff training issue'],
    ['EXCEPTION_CLOSE', 'UNEXPLAINED', 'Unexplained, loss accepted'],
    ['KOT_EXPLAIN', 'GUEST_WALKED_OUT', 'Guest walked out'],
    ['KOT_EXPLAIN', 'SERVED_NOT_BILLED', 'Served, not entered on bill'],
    ['KOT_EXPLAIN', 'STAFF_CONSUMPTION', 'Staff consumption not logged'],
    ['KOT_EXPLAIN', 'KOT_FIRED_IN_ERROR', 'KOT fired in error'],
    ['STOCK_ADJ', 'UNEXPLAINED_INVESTIGATE_STAFF', 'Unexplained, investigate staff'],
    ['STOCK_ADJ', 'BREAKAGE_NOT_LOGGED', 'Breakage not logged'],
    ['STOCK_ADJ', 'RECEIVING_ERROR', 'Receiving error'],
    ['STOCK_ADJ', 'EVAPORATION_TRIM', 'Evaporation or trim loss'],
    ['WASTAGE', 'PREP_TRIM', 'Prep trim'],
    ['WASTAGE', 'SPOILAGE', 'Spoilage'],
    ['WASTAGE', 'EXPIRED', 'Expired'],
    ['WASTAGE', 'OVERPRODUCTION', 'Overproduction'],
    ['WASTAGE', 'RETURNED_BY_GUEST', 'Returned by guest'],
    ['WASTAGE', 'DROPPED', 'Dropped'],
    ['WASTAGE', 'BREAKAGE', 'Breakage'],
    ['INVOICE_ACCEPT', 'RATE_REVISION_AGREED', 'Rate revision agreed'],
    ['INVOICE_ACCEPT', 'EMERGENCY_PURCHASE', 'Emergency purchase'],
    ['INVOICE_ACCEPT', 'WEIGHT_LOSS_IN_TRANSIT', 'Weight loss in transit accepted'],
    ['NC', 'MANAGER_COMP', 'Manager comp'],
    ['NC', 'SERVICE_RECOVERY', 'Service recovery'],
    ['NC', 'STAFF_MEAL', 'Staff meal'],
    ['NC', 'REGULAR_GUEST', 'Regular guest'],
  ];
  await prisma.reasonCode.createMany({ data: reasons.map(([domain, code, label]) => ({ orgId: org.id, domain, code, label })) });
  await prisma.controlProfile.create({
    data: {
      orgId: org.id, outletId: null,
      tolerances: DEFAULT_CONTROLS.tolerances as unknown as Prisma.InputJsonObject,
      approvalLimits: DEFAULT_CONTROLS.approvalLimits as unknown as Prisma.InputJsonObject,
      sla: DEFAULT_CONTROLS.sla as unknown as Prisma.InputJsonObject,
      settings: DEFAULT_CONTROLS.settings as unknown as Prisma.InputJsonObject,
    },
  });

  // ─────────────── History: 8 weeks of trading ───────────────
  const restaurants = OUTLETS.filter((o) => o.kind === 'RESTAURANT');
  const movements: Prisma.StockMovementCreateManyInput[] = [];
  const bills: Prisma.BillCreateManyInput[] = [];
  const billItems: Prisma.BillItemCreateManyInput[] = [];
  const giveaways: Prisma.GiveawayCreateManyInput[] = [];
  const wastageRows: Prisma.WastageEntryCreateManyInput[] = [];
  const dayCloses: Prisma.DayCloseCreateManyInput[] = [];
  const itemLoc = (code: string, sku: string) => locs[code][LOCATION_FOR[I[sku].category]] ?? null;
  const cost = (recipe: [string, number][]) => recipe.reduce((s2, [sku, q]) => s2 + q * I[sku].standardCost, 0);
  const menuFor = (code: string) => MENU.filter((m) => outlets[code].hasDraught || m.station !== 'Taps');

  const firstDay = addDays(D, -HISTORY_DAYS);
  const salesByDate: Record<string, Record<string, number>> = {};
  for (const o of restaurants) {
    const code = o.code;
    // Opening stock 10 days of use, replenished weekly.
    for (const it of ITEMS) {
      const daily = menuFor(code).reduce((s2, m) => s2 + m.base * o.factor * (m.recipe.find((r) => r[0] === it.sku)?.[1] ?? 0), 0);
      const qty = Math.max(daily * 10, it.baseUnit === 'PC' ? 60 : it.baseUnit === 'KG' ? 20 : 6000);
      movements.push({ id: randomUUID(), outletId: outlets[code].id, itemId: I[it.sku].id, locationId: itemLoc(code, it.sku), type: 'OPENING', qty: round2(qty), unitCost: it.standardCost, at: atLocal(firstDay, 6), businessDate: firstDay });
    }
    for (let d = firstDay; d < D; d = addDays(d, 1)) {
      const dow = new Date(`${d}T00:00:00Z`).getUTCDay();
      const usage: Record<string, number> = {};
      let food = 0, foodTheo = 0, bev = 0, bevTheo = 0;
      // A handful of summary bills per day carry the day's volume.
      const nBills = 12;
      const billIds = Array.from({ length: nBills }, () => randomUUID());
      const totals = new Array(nBills).fill(0);
      for (const m of menuFor(code)) {
        const q = Math.max(0, Math.round(jitter(m.base * o.factor * DOW_FACTOR[dow], 0.12)));
        if (!q) continue;
        const amount = q * m.price;
        const b = Math.floor(rand() * nBills);
        totals[b] += amount;
        billItems.push({ id: randomUUID(), billId: billIds[b], menuItemId: M[m.name].id, qty: q, amount });
        if (m.kind === 'FOOD') { food += amount; foodTheo += q * cost(m.recipe); } else { bev += amount; bevTheo += q * cost(m.recipe); }
        for (const [sku, rq] of m.recipe) usage[sku] = (usage[sku] ?? 0) + q * rq;
      }
      billIds.forEach((id, i) =>
        bills.push({ id, outletId: outlets[code].id, billNo: `${code}-H${d.replaceAll('-', '')}-${i}`, businessDate: d, openedAt: atLocal(d, 13 + i % 10), paidAt: atLocal(d, 14 + i % 10), status: 'PAID', netAmount: totals[i], paymentMode: pick(['CARD', 'UPI', 'CASH']), stewardId: U[pick(STEWARDS[code])].id }),
      );
      salesByDate[`${code}:${d}`] = { food, bev };
      for (const [sku, q] of Object.entries(usage)) {
        movements.push({ id: randomUUID(), outletId: outlets[code].id, itemId: I[sku].id, locationId: itemLoc(code, sku), type: 'SALE', qty: -round2(q), unitCost: I[sku].standardCost, at: atLocal(d, 23), businessDate: d, refType: 'seed' });
      }
      // Weekly replenishment.
      if (dow === 1) {
        for (const it of ITEMS) {
          const daily = menuFor(code).reduce((s2, m) => s2 + m.base * o.factor * (m.recipe.find((r) => r[0] === it.sku)?.[1] ?? 0), 0);
          if (daily <= 0) continue;
          movements.push({ id: randomUUID(), outletId: outlets[code].id, itemId: I[it.sku].id, locationId: itemLoc(code, it.sku), type: 'GRN', qty: round2(daily * 7.2), unitCost: it.standardCost, at: atLocal(d, 11), businessDate: d, refType: 'seed' });
        }
      }
      // Giveaways around each manager's own normal.
      for (const mk of MANAGERS_BY_OUTLET[code]) {
        const compBase = mk === 'vikram' ? 7500 : mk === 'priya' ? 2800 : 1800;
        const nComps = 3 + Math.floor(rand() * 3);
        for (let c = 0; c < nComps; c++) giveaways.push({ outletId: outlets[code].id, businessDate: d, at: atLocal(d, 20, c * 7), type: 'COMP', amount: round2(jitter(compBase / nComps, 0.2)), reasonCode: pick(['MANAGER_COMP', 'SERVICE_RECOVERY', 'REGULAR_GUEST']), approverId: U[mk].id });
        giveaways.push({ outletId: outlets[code].id, businessDate: d, at: atLocal(d, 21), type: 'DISCOUNT', amount: round2(jitter(mk === 'vikram' ? 10500 : 7000, 0.25)), reasonCode: 'HAPPY_HOUR', approverId: U[mk].id });
        if (rand() < 0.5) giveaways.push({ outletId: outlets[code].id, businessDate: d, at: atLocal(d, 22), type: 'VOID_AFTER_KOT', amount: round2(jitter(1400, 0.4)), reasonCode: 'KOT_FIRED_IN_ERROR', approverId: U[mk].id });
        if (rand() < 0.15) giveaways.push({ outletId: outlets[code].id, businessDate: d, at: atLocal(d, 22, 30), type: 'REFUND', amount: round2(jitter(900, 0.4)), reasonCode: 'SERVICE_RECOVERY', approverId: U[mk].id, billNo: `${code}-H${d.replaceAll('-', '')}-0`, billId: billIds[0], paidMode: 'CARD', refundMode: 'CARD' });
      }
      // Normal wastage, approved.
      const wItem = pick(['CHKLG', 'CHKBR', 'PANR', 'TOMATO']);
      const wQty = round2(jitter(I[wItem].baseUnit === 'KG' ? 1.4 : 2, 0.3));
      const wId = randomUUID();
      const logger = code === 'KOR' ? U.suresh : U[pick(MANAGERS_BY_OUTLET[code])];
      const approver = code === 'KOR' ? U.anand : U[MANAGERS_BY_OUTLET[code].find((k) => U[k].id !== logger.id) ?? 'shiv'];
      wastageRows.push({ id: wId, outletId: outlets[code].id, section: 'Tandoor', itemId: I[wItem].id, qty: wQty, value: round2(wQty * I[wItem].standardCost), reasonCode: 'PREP_TRIM', entryMethod: 'SCALE', loggedById: logger.id, loggedAt: atLocal(d, 16), businessDate: d, status: 'APPROVED', routedToId: approver.id, decidedById: approver.id, decidedAt: atLocal(d, 17) });
      movements.push({ id: randomUUID(), outletId: outlets[code].id, itemId: I[wItem].id, locationId: itemLoc(code, wItem), type: 'WASTAGE', qty: -wQty, unitCost: I[wItem].standardCost, at: atLocal(d, 16), businessDate: d, refType: 'wastage', refId: wId, approvedById: approver.id });

      dayCloses.push({
        outletId: outlets[code].id, businessDate: d, closedAt: atLocal(d, 29, 30), exceptionsCreated: 0,
        kpis: {
          netSales: food + bev, netSalesLastWeek: 0, dow, foodSales: food, foodCost: round2(foodTheo * jitter(1.02, 0.01)), foodTheo: round2(foodTheo),
          foodCostPct: round2((foodTheo * 1.02 / food) * 100), foodTheoPct: round2((foodTheo / food) * 100),
          bevSales: bev, bevCost: round2(bevTheo * 1.01), bevTheo: round2(bevTheo), bevCostPct: round2((bevTheo * 1.01 / bev) * 100), bevTheoPct: round2((bevTheo / bev) * 100),
          giveaways: 0, unbilledKot: 0, stockVariance: round2(jitter(-1500, 0.5)), cashVariance: 0, wastage: round2(wQty * I[wItem].standardCost),
        },
      });
    }
  }
  // Last 7 days of small count adjustments at every bar (drives "Variance % by bar").
  const barAdj: Record<string, [string, number][]> = {
    IND: [['JWB750', -660], ['TAN750', -30], ['OMK750', -30], ['BAC750', 20]],
    KOR: [['JWB750', -180], ['JAM750', -120], ['OMK750', -60]],
    WHF: [['JWB750', -120], ['JAM750', -90]],
    HSR: [['JAM750', -60], ['JWB750', -60]],
  };
  for (const [code, adj] of Object.entries(barAdj)) {
    for (const [sku, q] of adj) movements.push({ id: randomUUID(), outletId: outlets[code].id, itemId: I[sku].id, locationId: itemLoc(code, sku), type: 'ADJUSTMENT', qty: q, unitCost: I[sku].standardCost, at: atLocal(addDays(D, -3), 7, 30), businessDate: addDays(D, -3), refType: 'seed', reasonCode: 'COUNT_WITHIN_TOLERANCE' });
  }
  // Approved comps and a logged breakage at Indiranagar main bar.
  movements.push({ id: randomUUID(), outletId: outlets.IND.id, itemId: I.JAM750.id, locationId: locs.IND['Main bar'], type: 'COMP', qty: -240, unitCost: 2.6, at: atLocal(addDays(D, -2), 22), businessDate: addDays(D, -2), approvedById: U.vikram.id, refType: 'seed' });
  const brkId = randomUUID();
  wastageRows.push({ id: brkId, outletId: outlets.IND.id, locationId: locs.IND['Main bar'], itemId: I.SULASB.id, qty: 750, value: 825, reasonCode: 'BREAKAGE', isBreakage: true, entryMethod: 'TYPED', loggedById: U.manoj.id, loggedAt: atLocal(addDays(D, -4), 21), businessDate: addDays(D, -4), status: 'APPROVED', routedToId: U.rakesh.id, decidedById: U.rakesh.id, decidedAt: atLocal(addDays(D, -4), 22) });
  movements.push({ id: randomUUID(), outletId: outlets.IND.id, itemId: I.SULASB.id, locationId: locs.IND['Main bar'], type: 'BREAKAGE', qty: -750, unitCost: 1.1, at: atLocal(addDays(D, -4), 21), businessDate: addDays(D, -4), approvedById: U.rakesh.id, refType: 'wastage', refId: brkId });

  // Card-paid bills refunded in cash this week.
  const refundBills: [string, string, string, number, string][] = [['HSR', 'HS-10388', addDays(D, -2), 4120, 'sanjay'], ['IND', 'IN-22817', D, 3220, 'vikram']];
  for (const [code, no, d, amt, mk] of refundBills) {
    const id = randomUUID();
    bills.push({ id, outletId: outlets[code].id, billNo: no, businessDate: d, openedAt: atLocal(d, 20), paidAt: atLocal(d, 21), status: 'PAID', netAmount: amt, paymentMode: 'CARD' });
    giveaways.push({ outletId: outlets[code].id, businessDate: d, at: atLocal(d, 22), type: 'REFUND', amount: amt, reasonCode: 'SERVICE_RECOVERY', approverId: U[mk].id, billNo: no, billId: id, paidMode: 'CARD', refundMode: 'CASH' });
  }

  await prisma.bill.createMany({ data: bills });
  await prisma.billItem.createMany({ data: billItems });
  await prisma.stockMovement.createMany({ data: movements });
  await prisma.giveaway.createMany({ data: giveaways });
  await prisma.wastageEntry.createMany({ data: wastageRows });
  await prisma.dayClose.createMany({ data: dayCloses });
  // Fix up "same day last week" sales for the flash comparison.
  for (const dc of dayCloses) {
    const k = dc.kpis as Record<string, number>;
    const lw = dayCloses.find((x) => x.outletId === dc.outletId && x.businessDate === addDays(dc.businessDate, -7));
    if (lw) await prisma.dayClose.update({ where: { outletId_businessDate: { outletId: dc.outletId, businessDate: dc.businessDate } }, data: { kpis: { ...k, netSalesLastWeek: (lw.kpis as Record<string, number>).netSales } } });
  }
  console.log(`History: ${bills.length} bills, ${movements.length} stock movements, ${giveaways.length} giveaways`);

  const photo = async (by: User, kind = 'PHOTO') =>
    (await prisma.attachment.create({ data: { orgId: org.id, kind, path: 'demo-photo.png', mime: 'image/png', sizeBytes: png.length, uploadedById: by.id, meta: { demo: true } } })).id;

  // ─────────────── Purchasing (W5) ───────────────
  await run(async (t) => {
    // Deccan Spirits → Indiranagar bar, received three days ago, matched and released.
    const at = atLocal(addDays(D, -3), 11);
    const po = await createPO(t, U.meera, { outletId: outlets.IND.id, vendorId: V['Deccan Spirits Traders'], lines: [['JAM750', 18000], ['JWB750', 9000], ['TAN750', 6000], ['OMK750', 7500], ['BAC750', 4500], ['SULASB', 4500]].map(([sku, qty]) => ({ itemId: I[sku as string].id, qty: qty as number })) });
    await approvePO(t, U.rohit, po.id, true, at);
    await receiveGoods(t, U.deepa, { outletId: outlets.IND.id, poId: po.id, vendorId: V['Deccan Spirits Traders'], invoiceNo: 'DS-1182', invoicePhotoId: await photo(U.deepa), goodsPhotoId: await photo(U.deepa), lines: po.lines.map((l) => ({ itemId: l.itemId, qty: l.qty })) }, at);
    await enterInvoice(t, U.meera, { outletId: outlets.IND.id, vendorId: V['Deccan Spirits Traders'], invoiceNo: 'DS-1182', invoiceDate: addDays(D, -3), poId: po.id, lines: po.lines.map((l) => ({ itemId: l.itemId, qty: l.qty, rate: l.rate })) }, at);

    // Pack & Go: first invoice matched nine days ago; the same number again today is blocked.
    const at2 = atLocal(addDays(D, -9), 12);
    const po2 = await createPO(t, U.meera, { outletId: outlets.KOR.id, vendorId: V['Pack & Go Packaging'], lines: [{ itemId: I.BOX.id, qty: 800, rate: 11.5 }] });
    await approvePO(t, U.priya, po2.id, true, at2);
    await receiveGoods(t, U.kiran, { outletId: outlets.KOR.id, poId: po2.id, vendorId: V['Pack & Go Packaging'], invoiceNo: 'PG-3310', invoicePhotoId: await photo(U.kiran), goodsPhotoId: await photo(U.kiran), lines: [{ itemId: I.BOX.id, qty: 800 }] }, at2);
    await enterInvoice(t, U.meera, { outletId: outlets.KOR.id, vendorId: V['Pack & Go Packaging'], invoiceNo: 'PG-3310', invoiceDate: addDays(D, -9), poId: po2.id, lines: [{ itemId: I.BOX.id, qty: 800, rate: 11.5 }] }, at2);
  });
  await run(async (t) => {
    const at = atLocal(D, 10, 34);
    // FreshCo Poultry: 3.6 kg short on the scale and billed ₹58/kg above PO rate.
    const po = await createPO(t, U.meera, { outletId: outlets.KOR.id, vendorId: V['FreshCo Poultry'], lines: [{ itemId: I.CHKBR.id, qty: 60, rate: 420 }, { itemId: I.CHKLG.id, qty: 40, rate: 310 }] });
    await approvePO(t, U.priya, po.id, true, atLocal(D, 8));
    await receiveGoods(t, U.kiran, { outletId: outlets.KOR.id, poId: po.id, vendorId: V['FreshCo Poultry'], invoiceNo: '4471', invoicePhotoId: await photo(U.kiran), goodsPhotoId: await photo(U.kiran), lines: [{ itemId: I.CHKBR.id, scaleReadings: [{ kg: 28.2 }, { kg: 28.2 }] }, { itemId: I.CHKLG.id, scaleReadings: [{ kg: 20.1 }, { kg: 20.1 }] }] }, at);
    await enterInvoice(t, U.meera, { outletId: outlets.KOR.id, vendorId: V['FreshCo Poultry'], invoiceNo: '4471', invoiceDate: D, poId: po.id, lines: [{ itemId: I.CHKBR.id, qty: 60, rate: 478 }, { itemId: I.CHKLG.id, qty: 40, rate: 310 }] }, at);

    // Green Leaf: bought without a PO.
    const g = await receiveGoods(t, U.kiran, { outletId: outlets.KOR.id, vendorId: V['Green Leaf Vegetables'], invoiceNo: 'GL-0544', invoicePhotoId: await photo(U.kiran), goodsPhotoId: await photo(U.kiran), lines: [{ itemId: I.ONION.id, scaleReadings: [{ kg: 72 }] }, { itemId: I.TOMATO.id, scaleReadings: [{ kg: 108 }] }] }, atLocal(D, 9));
    await enterInvoice(t, U.meera, { outletId: outlets.KOR.id, vendorId: V['Green Leaf Vegetables'], invoiceNo: 'GL-0544', invoiceDate: D, grnId: g.grnId, lines: [{ itemId: I.ONION.id, qty: 72, rate: 35 }, { itemId: I.TOMATO.id, qty: 108, rate: 40 }] }, atLocal(D, 12));

    // Pack & Go duplicate.
    const dupPo = await t.purchaseOrder.findFirstOrThrow({ where: { vendorId: V['Pack & Go Packaging'] } });
    await enterInvoice(t, U.meera, { outletId: outlets.KOR.id, vendorId: V['Pack & Go Packaging'], invoiceNo: 'PG-3310', invoiceDate: D, poId: dupPo.id, lines: [{ itemId: I.BOX.id, qty: 800, rate: 11.5 }] }, atLocal(D, 12));

    // Spice Route: invoice arrived before the goods.
    const po3 = await createPO(t, U.meera, { outletId: outlets.HSR.id, vendorId: V['Spice Route'], lines: [{ itemId: I.SPICE.id, qty: 10, rate: 410 }] });
    await approvePO(t, U.sanjay, po3.id, true, atLocal(D, 9));
    await enterInvoice(t, U.meera, { outletId: outlets.HSR.id, vendorId: V['Spice Route'], invoiceNo: 'SR-771', invoiceDate: D, poId: po3.id, lines: [{ itemId: I.SPICE.id, qty: 10, rate: 410 }] }, atLocal(D, 12));

    // Metro Dairy: clean three-way match.
    const po4 = await createPO(t, U.meera, { outletId: outlets.WHF.id, vendorId: V['Metro Dairy'], lines: [{ itemId: I.CREAM.id, qty: 40, rate: 220 }, { itemId: I.BUTR.id, qty: 10.67, rate: 520 }] });
    await approvePO(t, U.sunil, po4.id, true, atLocal(D, 8));
    await receiveGoods(t, U.kiran, { outletId: outlets.WHF.id, poId: po4.id, vendorId: V['Metro Dairy'], invoiceNo: 'MD-9920', invoicePhotoId: await photo(U.kiran), goodsPhotoId: await photo(U.kiran), lines: [{ itemId: I.CREAM.id, qty: 40 }, { itemId: I.BUTR.id, scaleReadings: [{ kg: 10.67 }] }] }, atLocal(D, 11));
    await enterInvoice(t, U.meera, { outletId: outlets.WHF.id, vendorId: V['Metro Dairy'], invoiceNo: 'MD-9920', invoiceDate: D, poId: po4.id, lines: [{ itemId: I.CREAM.id, qty: 40, rate: 220 }, { itemId: I.BUTR.id, qty: 10.67, rate: 520 }] }, atLocal(D, 12));

    // An approved PO waiting at the door today (M9 demo).
    const po5 = await createPO(t, U.meera, { outletId: outlets.IND.id, vendorId: V['Metro Dairy'], expectedAt: new Date(NOW.getTime() + 2 * 3600_000).toISOString(), lines: [{ itemId: I.CREAM.id, qty: 20, rate: 220 }, { itemId: I.PANR.id, qty: 12, rate: 360 }] });
    await approvePO(t, U.rohit, po5.id, true, NOW);
  });

  // ─────────────── Blind counts at Indiranagar (W2) ───────────────
  // System stock is set so the counts below reproduce the S3 review.
  type Line = { sku: string; system: number; count1: { sealed?: number; openG?: number; kg?: number[]; units?: number }; recount?: { sealed?: number; openG?: number; kg?: number[]; units?: number } };
  const openG = (sku: string, ml: number) => round2((I[sku].emptyWeightG ?? 0) + ml * 0.94);
  const plan: Record<string, Line[]> = {
    'Main bar': [
      { sku: 'JAM750', system: 18650, count1: { sealed: 20, openG: 822 }, recount: { sealed: 20, openG: 775 } },
      { sku: 'JWB750', system: 5880, count1: { sealed: 7, openG: openG('JWB750', 630) } },
      { sku: 'OMK750', system: 5700, count1: { sealed: 7, openG: openG('OMK750', 450) } },
      { sku: 'TAN750', system: 6120, count1: { sealed: 8, openG: openG('TAN750', 80) } },
      { sku: 'BAC750', system: 3890, count1: { sealed: 5, openG: openG('BAC750', 140) } },
      { sku: 'SULASB', system: 3600, count1: { sealed: 4, openG: openG('SULASB', 600) } },
    ],
    'Walk-in chiller': [
      { sku: 'CHKBR', system: 28.4, count1: { kg: [13.6, 13.5] }, recount: { kg: [13.6, 13.55] } },
      { sku: 'PANR', system: 12.0, count1: { kg: [11.1] }, recount: { kg: [11.85] } },
      { sku: 'CREAM', system: 14, count1: { units: 14 } },
    ],
    'Back bar': [{ sku: 'KFU650', system: 96, count1: { units: 94 }, recount: { units: 96 } }],
    'Dry store': [{ sku: 'RICE', system: 42.0, count1: { kg: [41.6] } }],
  };
  const countStart = atLocal(D, 7, 10);
  // Top up opening stock so theoretical stock at the count equals the planned system quantity.
  for (const lines of Object.values(plan)) {
    for (const l of lines) {
      const r = await prisma.stockMovement.aggregate({ _sum: { qty: true }, where: { outletId: outlets.IND.id, itemId: I[l.sku].id, at: { lte: countStart } } });
      const diff = round2(l.system - (r._sum.qty ?? 0));
      await prisma.stockMovement.create({ data: { outletId: outlets.IND.id, itemId: I[l.sku].id, locationId: itemLoc('IND', l.sku), type: 'OPENING', qty: diff, unitCost: I[l.sku].standardCost, at: atLocal(firstDay, 6, 5), businessDate: firstDay, refType: 'seed' } });
    }
  }
  const entry = (sku: string, e: Line['count1']) =>
    I[sku].baseUnit === 'ML' ? { sealedUnits: e.sealed, openWeightG: e.openG } : e.kg ? { scaleReadings: e.kg.map((kg) => ({ kg, deviceId: 'scale-ind-01' })) } : { typedQty: e.units };

  let minute = 0;
  for (const [locName, lines] of Object.entries(plan)) {
    const task = await prisma.countTask.create({
      data: {
        outletId: outlets.IND.id, locationId: locs.IND[locName], type: 'SPOT', assigneeId: U.ravi.id, dueAt: atLocal(D, 7, 30), businessDate: D, createdAt: atLocal(D, 6, 30),
        lines: { create: lines.map((l, i) => ({ itemId: I[l.sku].id, locationId: locs.IND[locName], sortOrder: i })) },
      },
      include: { lines: true },
    });
    await run(async (t) => {
      await startTask(t, U.ravi, task.id, atLocal(D, 7, 10 + minute));
      for (const [i, l] of lines.entries()) {
        await enterLine(t, U.ravi, task.id, task.lines[i].id, { ...entry(l.sku, l.count1), photoIds: [await photo(U.ravi)] }, atLocal(D, 7, 10 + minute + i));
      }
      await submitTask(t, U.ravi, task.id, atLocal(D, 7, 31 + minute));
    });
    minute += 5;
    const recount = await prisma.countTask.findFirst({ where: { parentTaskId: task.id }, include: { lines: true } });
    if (recount) {
      if (recount.assigneeId !== U.deepa.id) throw new Error('Recount should go to Deepa');
      await run(async (t) => {
        await startTask(t, U.deepa, recount.id, atLocal(D, 8, 5));
        for (const rl of recount.lines) {
          const l = lines.find((x) => I[x.sku].id === rl.itemId)!;
          await enterLine(t, U.deepa, recount.id, rl.id, { ...entry(l.sku, l.recount ?? l.count1), photoIds: [await photo(U.deepa)] }, atLocal(D, 8, 8));
        }
        await submitTask(t, U.deepa, recount.id, atLocal(D, 8, 20));
      });
    }
  }
  console.log('Counts done: Jameson open bottle =', openBottleMl(I.JAM750, 822), 'ml');

  // ─────────────── Yesterday's trading, KOT by KOT ───────────────
  const kots: Prisma.KotCreateManyInput[] = [];
  const kotItems: Prisma.KotItemCreateManyInput[] = [];
  const dBills: Prisma.BillCreateManyInput[] = [];
  const dBillItems: Prisma.BillItemCreateManyInput[] = [];
  const dMoves: Prisma.StockMovementCreateManyInput[] = [];
  const draws: Prisma.DraughtDrawCreateManyInput[] = [];
  const theoUsageKOR: Record<string, number> = {};
  const dow = new Date(`${D}T00:00:00Z`).getUTCDay();
  let kotSeq = 88000;
  for (const o of restaurants) {
    const code = o.code;
    const usage: Record<string, number> = {};
    const lines: { menu: string; qty: number }[] = [];
    for (const m of menuFor(code)) {
      let q = code === 'KOR' && ['Tandoori chicken', 'Chicken tikka', 'Butter chicken'].includes(m.name) ? m.base : Math.round(jitter(m.base * o.factor * DOW_FACTOR[dow], 0.1));
      // Belgian Wit at Indiranagar: 195 l sold.
      if (code === 'IND' && m.name === 'Belgian Wit 500 ml') q = 390;
      while (q > 0) {
        const n = Math.min(q, rand() < 0.7 ? 1 : 2);
        lines.push({ menu: m.name, qty: n });
        q -= n;
      }
    }
    lines.sort(() => rand() - 0.5);
    // KOR: some lines end as voids, staff meals and approved NC.
    const disposition = (i: number) => (code !== 'KOR' ? 'BILLED' : i < 17 ? 'VOIDED' : i < 26 ? 'STAFF_MEAL' : i < 32 ? 'NC' : 'BILLED');
    let billIdx = 0;
    let cur: { id: string; items: Prisma.BillItemCreateManyInput[]; total: number; openedAt: Date; table: string; section: string; steward: string } | null = null;
    const flush = () => {
      if (!cur) return;
      dBills.push({ id: cur.id, outletId: outlets[code].id, billNo: `${code.slice(0, 2)}-${30300 + billIdx}`, businessDate: D, tableNo: cur.table, section: cur.section, stewardId: cur.steward, openedAt: cur.openedAt, paidAt: new Date(cur.openedAt.getTime() + 70 * 60_000), status: 'PAID', netAmount: cur.total, paymentMode: pick(['CARD', 'UPI', 'CASH', 'CARD']) });
      dBillItems.push(...cur.items);
      billIdx++;
      cur = null;
    };
    lines.forEach((l, i) => {
      const m = M[l.menu];
      const disp = disposition(i);
      if (disp === 'BILLED' && (!cur || cur.items.length >= 6)) {
        flush();
        const hour = 12 + Math.floor(rand() * 11);
        const section = pick(['A', 'B', 'C']);
        cur = { id: randomUUID(), items: [], total: 0, openedAt: atLocal(D, hour, Math.floor(rand() * 60)), table: `${section}${1 + Math.floor(rand() * 9)}`, section, steward: U[pick(STEWARDS[code])].id };
      }
      const firedAt = cur ? new Date(cur.openedAt.getTime() + 5 * 60_000) : atLocal(D, 13 + Math.floor(rand() * 10), Math.floor(rand() * 60));
      const kotId = randomUUID();
      const kiId = randomUUID();
      kots.push({ id: kotId, outletId: outlets[code].id, kotNo: `${code[0]}-${kotSeq++}`, businessDate: D, firedAt, tableNo: cur?.table ?? 'C2', section: cur?.section ?? 'C', stewardId: cur?.steward ?? U[pick(STEWARDS[code])].id, station: m.station });
      kotItems.push({
        id: kiId, kotId, menuItemId: m.id, qty: l.qty, amount: l.qty * m.price,
        disposition: disp === 'BILLED' ? 'PENDING' : (disp as 'VOIDED'),
        voidReason: disp === 'VOIDED' ? 'Guest changed order' : null,
        ncReasonCode: disp === 'STAFF_MEAL' ? 'STAFF_MEAL' : disp === 'NC' ? 'SERVICE_RECOVERY' : null,
        ncApproverId: disp === 'STAFF_MEAL' || disp === 'NC' ? U.priya.id : null,
      });
      if (disp === 'BILLED' && cur) {
        cur.items.push({ id: randomUUID(), billId: cur.id, menuItemId: m.id, qty: l.qty, amount: l.qty * m.price, kotItemId: kiId });
        cur.total += l.qty * m.price;
      }
      if (disp !== 'VOIDED') {
        for (const [sku, rq] of m.recipe) {
          const key = `${disp === 'BILLED' ? 'SALE' : disp === 'STAFF_MEAL' ? 'STAFF_MEAL' : 'COMP'}:${sku}`;
          usage[key] = (usage[key] ?? 0) + l.qty * rq;
          if (code === 'KOR' && disp === 'BILLED') theoUsageKOR[sku] = (theoUsageKOR[sku] ?? 0) + l.qty * rq;
        }
      }
    });
    flush();
    for (const [key, q] of Object.entries(usage)) {
      const [type, sku] = key.split(':');
      dMoves.push({ id: randomUUID(), outletId: outlets[code].id, itemId: I[sku].id, locationId: itemLoc(code, sku), type: type as 'SALE', qty: -round2(q), unitCost: I[sku].standardCost, at: atLocal(D, 23, 30), businessDate: D, refType: 'pos', approvedById: type === 'SALE' ? null : U.priya.id });
    }
    // Draught: tank to tap, last 7 days (Belgian Wit at Indiranagar yields low yesterday).
    if (outlets[code].hasDraught) {
      for (let back = 6; back >= 0; back--) {
        const d = addDays(D, -back);
        for (const [sku, std] of [['LAGER', 96], ['WIT', 96], ['HIPA', 95], ['STOUT', 96]] as [string, number][]) {
          const soldMl = back === 0 ? (usage[`SALE:${sku}`] ?? 0) : (await prisma.stockMovement.aggregate({ _sum: { qty: true }, where: { outletId: outlets[code].id, itemId: I[sku].id, type: 'SALE', businessDate: d } }))._sum.qty! * -1;
          const y = code === 'IND' && sku === 'WIT' && back === 0 ? 91.3 : std + (rand() * 1.2 - 0.6);
          draws.push({ outletId: outlets[code].id, itemId: I[sku].id, tankNo: String({ LAGER: 1, WIT: 3, HIPA: 2, STOUT: 4 }[sku]), businessDate: d, drawnMl: round2(soldMl / (y / 100)), source: 'FLOW_METER', standardYieldPct: std });
        }
      }
    }
  }
  // The nine KOT items at Koramangala that never reached a bill.
  const unbilled: [string, string, string, string, string, number, number, string][] = [
    ['K-88412', '21:42', 'B4', 'arjun', 'Hazy IPA 500 ml', 4, 1960, 'Taps'],
    ['K-88419', '21:58', 'B4', 'arjun', 'Chicken tikka', 2, 1180, 'Tandoor'],
    ['K-88436', '22:20', 'B6', 'arjun', 'Jameson 60 ml', 6, 5400, 'Main bar'],
    ['K-88437', '22:21', 'B6', 'arjun', 'Tandoori platter', 1, 1650, 'Tandoor'],
    ['K-88450', '22:47', 'B2', 'arjun', 'Johnnie Walker Black 60 ml', 4, 4720, 'Main bar'],
    ['K-88461', '23:02', 'B6', 'arjun', 'Belgian Wit 500 ml', 3, 1410, 'Taps'],
    ['K-88466', '23:09', 'B8', 'arjun', 'Fries', 2, 520, 'Fry'],
    ['K-88470', '23:12', 'A3', 'leela', 'Mutton seekh', 2, 1580, 'Tandoor'],
    ['K-88474', '23:15', 'A3', 'leela', 'Hazy IPA 500 ml', 7, 3420, 'Taps'],
  ];
  for (const [no, hm, table, stew, menu, qty, amt, station] of unbilled) {
    const [h, mi] = hm.split(':').map(Number);
    const id = randomUUID();
    kots.push({ id, outletId: outlets.KOR.id, kotNo: no, businessDate: D, firedAt: atLocal(D, h, mi), tableNo: table, section: table[0], stewardId: U[stew].id, station });
    kotItems.push({ id: randomUUID(), kotId: id, menuItemId: M[menu].id, qty, amount: amt });
  }
  // Arjun's two earlier nights in the last 30 days (explained and accepted as NC at the time).
  for (const [back, amt] of [[9, 8960], [20, 10500]] as [number, number][]) {
    const d = addDays(D, -back);
    const ex = await prisma.exception.create({
      data: {
        orgId: org.id, outletId: outlets.KOR.id, outletIds: [outlets.KOR.id], type: 'UNBILLED_KOT', severity: 'CRITICAL', status: 'RESOLVED', title: '4 KOT items never billed',
        summary: 'Section B. Served by Arjun T.', impact: amt, businessDate: d, groupKey: `KOT:${outlets.KOR.id}:${d}`, assigneeId: U.priya.id, involvedUserIds: [U.arjun.id],
        escalationPath: [U.shiv.id], dueAt: atLocal(d, 30), closedAt: atLocal(d, 32), closedById: U.priya.id, closeReasonCode: 'SERVED_NOT_BILLED', createdAt: atLocal(d, 29, 30),
      },
    });
    const kid = randomUUID();
    kots.push({ id: kid, outletId: outlets.KOR.id, kotNo: `K-${80000 + back}`, businessDate: d, firedAt: atLocal(d, 22), tableNo: 'B5', section: 'B', stewardId: U.arjun.id, station: 'Main bar' });
    kotItems.push({ id: randomUUID(), kotId: kid, menuItemId: M['Jameson 60 ml'].id, qty: Math.round(amt / 900), amount: amt, disposition: 'NC', ncReasonCode: 'SERVED_NOT_BILLED', ncApproverId: U.priya.id, exceptionId: ex.id });
  }
  await prisma.kot.createMany({ data: kots });
  await prisma.kotItem.createMany({ data: kotItems });
  await prisma.bill.createMany({ data: dBills });
  await prisma.billItem.createMany({ data: dBillItems });
  await prisma.stockMovement.createMany({ data: dMoves });
  await prisma.draughtDraw.createMany({ data: draws });
  console.log(`Yesterday: ${kots.length} KOTs, ${dBills.length} bills`);

  // Store issues to the tandoor section: more chicken and cream used than recipes allow.
  const gap: Record<string, number> = { CHKLG: 2.9, CHKBR: 1.7, CREAM: 0.9 };
  for (const [sku, g] of Object.entries(gap)) {
    const theo = theoUsageKOR[sku] ?? 0;
    const wasted = sku === 'CHKLG' ? 1.8 : sku === 'CHKBR' ? 4 : 0;
    await prisma.sectionIssue.create({ data: { outletId: outlets.KOR.id, section: 'Tandoor', itemId: I[sku].id, businessDate: D, qtyIssued: round2(theo + wasted + g + 0.8), qtyReturned: 0.8 } });
  }

  // Giveaways yesterday: comps at 2.3× baseline by one duty manager; a bill voided after payment.
  const g2: Prisma.GiveawayCreateManyInput[] = [];
  for (const mk of ['rohit', 'priya', 'sunil', 'ajay', 'sanjay']) {
    const code = Object.entries(MANAGERS_BY_OUTLET).find(([, v]) => v.includes(mk))![0];
    g2.push({ outletId: outlets[code].id, businessDate: D, at: atLocal(D, 20), type: 'COMP', amount: round2(jitter(mk === 'priya' ? 2800 : 1800, 0.1)), reasonCode: 'MANAGER_COMP', approverId: U[mk].id });
    g2.push({ outletId: outlets[code].id, businessDate: D, at: atLocal(D, 21), type: 'DISCOUNT', amount: round2(jitter(7000, 0.2)), reasonCode: 'HAPPY_HOUR', approverId: U[mk].id });
  }
  const vikBills = dBills.filter((b) => b.outletId === outlets.IND.id).slice(0, 11);
  vikBills.forEach((b, i) => g2.push({ outletId: outlets.IND.id, businessDate: D, at: atLocal(D, 19 + (i % 5), i * 3), type: 'COMP', amount: [2150, 1480, 1920, 1310, 1640, 1570, 1880, 1290, 1560, 1320, 1130][i], reasonCode: 'REGULAR_GUEST', approverId: U.vikram.id, billNo: b.billNo, billId: b.id }));
  g2.push({ outletId: outlets.IND.id, businessDate: D, at: atLocal(D, 21), type: 'DISCOUNT', amount: 11200, reasonCode: 'HAPPY_HOUR', approverId: U.vikram.id });
  const hsrVoid = randomUUID();
  await prisma.bill.create({ data: { id: hsrVoid, outletId: outlets.HSR.id, billNo: 'HS-10422', businessDate: D, openedAt: atLocal(D, 21), paidAt: atLocal(D, 22), status: 'VOIDED', netAmount: 4860, paymentMode: 'CASH' } });
  g2.push({ outletId: outlets.HSR.id, businessDate: D, at: atLocal(D, 22, 40), type: 'VOID_AFTER_PAYMENT', amount: 4860, reasonCode: 'GUEST_DISPUTE', approverId: U.sanjay.id, billNo: 'HS-10422', billId: hsrVoid });
  await prisma.giveaway.createMany({ data: g2 });

  // ─────────────── Wastage at Koramangala (W7) ───────────────
  await run(async (t) => {
    const w1 = await logWastage(t, U.suresh, { outletId: outlets.KOR.id, itemId: I.CHKLG.id, section: 'Tandoor', scaleReadings: [{ kg: 1.8 }], reasonCode: 'PREP_TRIM', photoIds: [await photo(U.suresh)] }, atLocal(D, 16, 20));
    const w2 = await logWastage(t, U.suresh, { outletId: outlets.KOR.id, itemId: I.CHKBR.id, section: 'Tandoor', scaleReadings: [{ kg: 4 }], reasonCode: 'PREP_TRIM', photoIds: [await photo(U.suresh)] }, atLocal(D, 17, 5));
    await logWastage(t, U.suresh, { outletId: outlets.KOR.id, itemId: I.PANR.id, section: 'Tandoor', scaleReadings: [{ kg: 11 }], reasonCode: 'SPOILAGE', photoIds: [await photo(U.suresh)] }, atLocal(D, 18, 40));
    await decideWastage(t, U.anand, w1.id, true, undefined, atLocal(D, 17));
    await decideWastage(t, U.anand, w2.id, true, undefined, atLocal(D, 18));
  });

  // ─────────────── Cash at Whitefield (W4) ───────────────
  // Two earlier small shortages this month for the same cashier.
  for (const [back, v] of [[12, -450], [19, -800]] as [number, number][]) {
    const d = addDays(D, -back);
    await prisma.cashShift.create({ data: { outletId: outlets.WHF.id, till: '2', cashierId: U.nikhil.id, businessDate: d, shiftName: 'evening', openedAt: atLocal(d, 17), floatExpected: 5000, floatCounted: 5000, closedAt: atLocal(d, 23, 50), closeCounted: 26000 + v, expectedCash: 26000, variance: v, secondCounterId: U.ajay.id, secondCounted: 26000 + v, status: 'CLOSED_VARIANCE', handoverCashierAt: atLocal(d, 23, 55), handoverManagerAt: atLocal(d, 23, 55) } });
  }
  await run(async (t) => {
    const shift = await openShift(t, U.nikhil, { outletId: outlets.WHF.id, till: '2', shiftName: 'evening', floatDenoms: { '100': 30, '50': 30, '20': 25 } }, atLocal(D, 17));
    let total = 0;
    for (let i = 0; i < 38; i++) {
      const amt = i === 37 ? 30165 - total : Math.round(jitter(790, 0.4));
      total += amt;
      await t.cashTxn.create({ data: { shiftId: shift.id, kind: 'SALE', amount: amt, at: atLocal(D, 17 + Math.floor(i / 6), (i * 7) % 60) } });
    }
    for (let i = 0; i < 3; i++) await t.drawerOpen.create({ data: { shiftId: shift.id, at: atLocal(D, 19 + i), withSale: false } });
    const denoms = { '500': 42, '200': 18, '100': 31, '50': 12, '20': 15, '10': 22, coins: 145 };
    await submitClose(t, U.nikhil, shift.id, denoms, atLocal(D, 23, 48));
    await secondCount(t, U.ajay, shift.id, { denoms, managerPin: PIN, cashierPin: PIN }, atLocal(D, 23, 55));
  });

  // ─────────────── Transfers (W7) ───────────────
  await run(async (t) => {
    const tr = await dispatchTransfer(t, U.farhan, { fromOutletId: outlets.CK.id, toOutletId: outlets.HSR.id, lines: [{ itemId: I.PANR.id, qty: 20 }] }, atLocal(D, 9));
    await receiveTransfer(t, U.asha, tr.id, [{ lineId: tr.lines[0].id, qtyReceived: 14 }], atLocal(D, 11));
    // One on the road right now for the mobile demo.
    await dispatchTransfer(t, U.farhan, { fromOutletId: outlets.CK.id, toOutletId: outlets.KOR.id, lines: [{ itemId: I.CHKBR.id, qty: 10 }, { itemId: I.PANR.id, qty: 6 }] }, new Date(NOW.getTime() - 2 * 3600_000));
  });
  await prisma.stockMovement.create({ data: { outletId: outlets.CK.id, itemId: I.PANR.id, locationId: locs.CK['Main store'], type: 'OPENING', qty: 80, unitCost: 360, at: atLocal(firstDay, 6), businessDate: firstDay } });

  // ─────────────── Day close for yesterday (W1) ───────────────
  await run((t) => closeDayAllOutlets(t, org.id, D, atLocal(D, 29, 30)));

  // A spot count at Whitefield that nobody started.
  await prisma.countTask.create({
    data: {
      outletId: outlets.WHF.id, locationId: locs.WHF['Dry store'], type: 'SPOT', assigneeId: U.kiran.id, dueAt: new Date(NOW.getTime() - 30 * 60_000), businessDate: businessDate(NOW),
      lines: { create: [{ itemId: I.RICE.id, locationId: locs.WHF['Dry store'], sortOrder: 0 }, { itemId: I.SPICE.id, locationId: locs.WHF['Dry store'], sortOrder: 1 }] },
    },
  });
  await run((t) => countsNotStarted(t, org.id, NOW));

  // Today's tasks for the mobile demo.
  await run(async (t) => {
    await createCountTask(t, { orgId: org.id, outletId: outlets.IND.id, locationId: locs.IND['Main bar'], type: 'SPOT', assigneeId: U.ravi.id, dueAt: new Date(NOW.getTime() + 30 * 60_000), itemCount: 6, rand });
    await createCountTask(t, { orgId: org.id, outletId: outlets.IND.id, locationId: locs.IND['Walk-in chiller'], type: 'SPOT', assigneeId: U.ravi.id, dueAt: new Date(NOW.getTime() + 2 * 3600_000), itemCount: 5, rand });
  });

  // ─────────────── Last month's close (W8) ───────────────
  const prevMonth = monthOf(addDays(`${monthOf(D)}-01`, -1));
  const { to: prevEnd } = monthRange(prevMonth);
  for (const o of restaurants) {
    const t = await prisma.countTask.create({
      data: {
        outletId: outlets[o.code].id, locationId: locs[o.code]['Walk-in chiller'], type: 'FULL', status: o.code === 'WHF' ? 'SUBMITTED' : 'CLOSED', assigneeId: U[o.code === 'IND' ? 'ravi' : o.code === 'KOR' ? 'korcount' : o.code === 'WHF' ? 'whfcount' : 'hsrcount'].id,
        dueAt: atLocal(prevEnd, 23), startedAt: atLocal(prevEnd, 22), snapshotAt: atLocal(prevEnd, 22), submittedAt: atLocal(prevEnd, 23, 10), periodMonth: prevMonth, businessDate: prevEnd,
      },
    });
    const lines = o.code === 'WHF'
      ? [{ sku: 'MUTN', sys: 24, cnt: 16, st: 'NEEDS_APPROVAL' as const }, { sku: 'CHKLG', sys: 40, cnt: 23.87, st: 'NEEDS_APPROVAL' as const }, { sku: 'PANR', sys: 10, cnt: 10, st: 'AUTO_ACCEPTED' as const }]
      : [{ sku: 'CHKBR', sys: 30, cnt: 29.8, st: 'AUTO_ACCEPTED' as const }, { sku: 'PANR', sys: 10, cnt: 10, st: 'AUTO_ACCEPTED' as const }];
    for (const [i, l] of lines.entries()) {
      await prisma.countLine.create({ data: { taskId: t.id, itemId: I[l.sku].id, locationId: t.locationId, sortOrder: i, status: l.st, countedQty: l.cnt, systemQty: l.sys, variance: round2(l.cnt - l.sys), varianceValue: round2((l.cnt - l.sys) * I[l.sku].standardCost), entryMethod: 'SCALE', countedAt: atLocal(prevEnd, 22, 30), countedById: t.assigneeId } });
    }
  }
  await prisma.exception.create({
    data: {
      orgId: org.id, outletId: outlets.WHF.id, outletIds: [outlets.WHF.id], type: 'CASH_VARIANCE', severity: 'CRITICAL', status: 'OPEN', title: 'Cash short on evening shift, till 1',
      summary: 'Till 1, cashier Nikhil P. Counted twice; handover signed.', impact: 6200, businessDate: addDays(prevEnd, -2), groupKey: `CASH:seed-prev`, assigneeId: U.sunil.id,
      involvedUserIds: [U.nikhil.id, U.ajay.id], escalationPath: [U.shiv.id], dueAt: new Date(NOW.getTime() + 20 * 3600_000), createdAt: atLocal(addDays(prevEnd, -2), 29, 30),
    },
  });
  const locked = monthOf(addDays(`${prevMonth}-01`, -1));
  await prisma.period.create({ data: { orgId: org.id, month: locked, status: 'LOCKED', lockedById: U.anita.id, lockedAt: atLocal(`${monthOf(`${prevMonth}-01`)}-05`, 18), history: [{ action: 'LOCK', byId: U.anita.id, at: atLocal(`${prevMonth}-05`, 18).toISOString() }] } });

  await dispatchNotifications(1000);
  const open = await prisma.exception.count({ where: { orgId: org.id, status: { not: 'RESOLVED' } } });
  console.log(`\nDone. ${open} open exceptions.`);
  console.log(`Web login:    shiv@hopline.in / ${PASSWORD} (owner), anita@hopline.in (finance head), priya@hopline.in (outlet manager)`);
  console.log(`Mobile login: phone 9000000001 (Ravi K, counter), 9000000002 (Deepa S), 9000000204 (Nikhil P, cashier), 9000000102 (Priya N) — PIN ${PIN}`);
  console.log(`Integration:  X-Org-Id: ${org.id}  X-Api-Key: $POS_INGEST_KEY`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
