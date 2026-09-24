# Digitory Controller (Phase 1)

A full-stack build of the **Digitory Controller Phase 1 screens and workflows** pack. Every controller task is automated, enforced in the app, or assigned to a named person with evidence.

```
controller/
  api/   Fastify + Prisma + PostgreSQL: control engines, REST API, scheduler, Ask Controller (Claude), WhatsApp
  web/   Next.js 14: web app for owners and finance (S1–S10) and the mobile PWA for outlet staff (M1–M12, at /m)
  docs/  API reference
```

## Run it locally

Needs Node 20+ and PostgreSQL 14+ (or Docker).

```bash
# 1. Database
docker compose -f controller/docker-compose.yml up -d db     # or use your own Postgres

# 2. API  (http://localhost:4000, OpenAPI docs at /docs)
cd controller/api
cp .env.example .env            # set DATABASE_URL; ANTHROPIC_API_KEY enables Ask Controller
npm install
npx prisma migrate deploy
npm run db:seed                 # Hopline Brewing Co. demo data; "yesterday" is the report day
npm run dev

# 3. Web + mobile  (http://localhost:3100 and http://localhost:3100/m)
cd ../web
npm install
npm run dev                     # proxies /api to API_URL (default http://localhost:4000)
```

Or run everything in containers: `docker compose -f controller/docker-compose.yml up`.

### Demo logins
| Where | Who | Login |
|---|---|---|
| Web | Shiv M, owner | `shiv@hopline.in` / `demo1234` |
| Web | Anita R, finance head (can reopen periods) | `anita@hopline.in` / `demo1234` |
| Web | Priya N, outlet manager Koramangala | `priya@hopline.in` / `demo1234` |
| Web | Vikram S, duty manager (involved in the comps exception) | `vikram@hopline.in` / `demo1234` |
| Web | Meera J, purchase | `meera@hopline.in` / `demo1234` |
| Mobile | Ravi K, counter (spot counts waiting) | `9000000001` / PIN `1234` |
| Mobile | Deepa S, recounter; Metro Dairy delivery to receive | `9000000002` / `1234` |
| Mobile | Nikhil P, cashier Whitefield | `9000000204` / `1234` |
| Mobile | Ajay V, duty manager Whitefield (second counts) | `9000000203` / `1234` |
| Mobile | Priya N, outlet manager (M12, wastage approval) | `9000000102` / `1234` |
| Mobile | Kiran S, store (transfer in transit to confirm) | `9000000108` / `1234` |
| Mobile | Suresh B, tandoor cook (log wastage) | `9000000104` / `1234` |

The seed drives the real engines, so the Action Centre shows what the system itself raised: Jameson short 3,400 ml after a blind recount, 9 unbilled KOT items at Koramangala, comps at 2.3× baseline routed past the outlet, the FreshCo invoice on hold, cash short at Whitefield (third shortage), a paneer transfer gap, a bill voided after payment, and more. August can't be locked because Whitefield has open variance lines and a critical.

### Tests
```bash
cd controller/api && npm test     # reseeds the database, then 28 integration tests
```
They cover blind counting, recount by a different person, photo and reason-code rules, self-approval blocks, routing past involved managers, explain-and-decide, SLA escalation, three-way match and debit notes, PO approval, wastage approval, period lock and reopen, controls audit, and POS ingestion.

## How the pack maps to code

| Pack | Where |
|---|---|
| W1 Daily control loop | `api/src/engine/dayclose.ts`, `api/src/jobs/scheduler.ts`, `engine/exceptions.ts` |
| W2 Physical stock count | `engine/counts.ts` (weighted pick, snapshot, tolerance, blind recount, approval) |
| W3 Exception lifecycle | `engine/exceptions.ts` (routing, criticals to owner, skip involved managers, SLA escalation, repeat grouping, repeat-cause feedback) |
| W4 Cash shift close | `engine/cash.ts` |
| W5 Receiving and three-way match | `engine/purchasing.ts` |
| W6 KOT-to-bill | `engine/pos.ts` (ingest), `engine/dayclose.ts#kotMatch` |
| W7 Wastage and transfers | `engine/wastage.ts` |
| W8 Month-end close | `engine/monthend.ts`, `lib/period.ts` (lock enforced on every write) |
| S1–S10 | `web/src/app/(web)/…`: `/`, `/exceptions/[id]`, `/counts/[id]`, `/liquor`, `/kot`, `/purchases`, `/giveaways`, `/close`, `/ask`, `/controls` (+ `/flash`, `/cash`, `/wastage`, `/reports`) |
| M1–M12 | `web/src/app/m/…`: tasks, count (M2–M6), cash (M7), wastage (M8), receive (M9), flash (M10), inbox (M11), approvals (M12) |
| Design rules | Mobile-only entry (`requireMobile`), no system qty in counter/receiver views, ₹ + owner + due on every exception, reason code + evidence to close, hidden approve buttons plus server-side self-approval checks, criticals to owner on WhatsApp |

### Design choices worth knowing
- **Theoretical stock** is the sum of an append-only stock ledger (`StockMovement`). Paid bills deplete by recipe; counts post adjustments with reason and approver.
- **Recipe variance** compares store issues to a kitchen section (`SectionIssue`) with recipe usage of what was billed.
- **Baselines** are computed from history per outlet, weekday and person. They aren't stored.
- **Separation of duties** is code, not configuration. `PUT /controls` rejects attempts to change it.
- **Mobile app** is a PWA (camera capture, Web Bluetooth scale via the standard Weight Scale service, "type instead" is flagged). A native wrapper can reuse the same API; mobile tokens are separate from web tokens.
- **Ask Controller** uses Claude with read-only tools and returns citations; without `ANTHROPIC_API_KEY` it says it's not configured. WhatsApp delivery uses the Cloud API when `WHATSAPP_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` are set, otherwise it logs a dry run.

## Configuration (`api/.env`)
| Var | Meaning |
|---|---|
| `DATABASE_URL` | PostgreSQL connection |
| `JWT_SECRET` | Token signing secret (change in production) |
| `POS_INGEST_KEY` | Shared key for POS/KDS ingestion |
| `ANTHROPIC_API_KEY`, `ASK_MODEL` | Ask Controller (default model `claude-opus-5`) |
| `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN` | WhatsApp Business Cloud API |
| `WEB_URL`, `CORS_ORIGIN` | Links in messages; allowed web origin |
| `UPLOAD_DIR` | Evidence storage (swap for S3 in production) |
| `TZ_OFFSET_MINUTES` | Outlet time zone (default IST, 330) |
| `DISABLE_SCHEDULER=1` | Run the API without cron jobs |

## Out of scope for Phase 1 (per the pack)
Tally/Zoho export (MIS CSV instead), gateway/aggregator/bank reconciliation, payroll, accruals and P&L, and state excise register formats.
