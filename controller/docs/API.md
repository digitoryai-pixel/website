# Digitory Controller API reference

Base URL `/api`. JSON in and out. Interactive OpenAPI docs are served by the API at `/docs`.

**Auth.** `Authorization: Bearer <token>`.
- Web token: `POST /auth/login` (email + password). For owners, finance, controllers and managers.
- Mobile token: `POST /auth/mobile-login` (phone + PIN + deviceId). Endpoints marked 📱 accept **only** a mobile token: counts, receipts, wastage and cash counts can't be entered from the web or a spreadsheet.
- Integrations: `X-Api-Key` + `X-Org-Id` headers (no user token).

**Errors.** `{"error": {"code": "SELF_APPROVAL", "message": "...", "details": ...}}` with status 400 (validation, missing reason or evidence), 401, 403 (role, outlet scope, separation of duties, mobile only), 404, 409 (period locked, already decided, lock blocked).

Screens: S = web, M = mobile, W = workflow in the screens pack.

## Auth and reference data
| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/login` | Web sign-in → `{token, user}` |
| POST | `/auth/mobile-login` | Mobile sign-in (phone, PIN, deviceId) |
| GET | `/me` | Profile, org and outlets in scope |
| GET | `/outlets` | Outlets with locations (store order) |
| GET | `/items?category&q` | Stock items. Never carries system quantity |
| GET | `/users?outletId` | People in scope (for reassigning) |
| GET | `/reason-codes?domain=A,B` | Reason codes: `EXCEPTION_CLOSE`, `KOT_EXPLAIN`, `STOCK_ADJ`, `WASTAGE`, `INVOICE_ACCEPT`, `NC` |
| GET | `/vendors` | Vendors with contract rates |
| GET | `/menu-items` | Menu with active recipes |

## Today: S1 Action Centre, M10 Daily Flash, notifications
| Method | Path | Purpose |
|---|---|---|
| GET | `/flash?date&outletId` | KPIs vs theoretical/baseline, open counts, largest item |
| GET | `/action-centre?outletId&severity&area` | Open exceptions ranked by ₹ impact then severity; owner shows "You / Routed past outlet" |
| GET | `/notifications` | In-app inbox (includes copies of WhatsApp/push alerts) |
| POST | `/notifications/{id}/read` | Mark read |

## Exceptions: S2, M12, W1, W3
| Method | Path | Purpose |
|---|---|---|
| GET | `/exceptions?status&type&outletId&assignedToMe&from&to` | List |
| GET | `/exceptions/{id}` | Detail: drivers in ₹, type panel, checks, escalation path, involved people, evidence, history, `can.{close,explain,decide,reassign}` |
| POST | `/exceptions/{id}/close` | `{reasonCode, evidenceIds[≥1], note?}`. Free text alone is rejected; involved people get 403; above the closer's limit it becomes a decision for the next person up |
| POST | `/exceptions/{id}/explain` | M12 `{reasonCode, note, evidenceIds}`. Within limit: resolved. Above: `AWAITING_DECISION`, routed up |
| POST | `/exceptions/{id}/decide` | `{decision: ACCEPT\|REJECT, note}`. Accepting applies the side effect (e.g. KOT items become NC with approver) |
| POST | `/exceptions/{id}/reassign` | `{userId}`. Can't be given to anyone involved |
| POST | `/exceptions/{id}/checks/{index}` | Tick a suggested check (logged) |

## Stock counts: W2, S3, M1–M6
| Method | Path | Purpose |
|---|---|---|
| GET | `/counts?outletId&from&to&needsApproval=1` | Count tasks |
| POST | `/counts` | Schedule a spot count `{outletId, locationId, dueAt, assigneeId?, itemCount?}`. The system picks items weighted to liquor and high value; never self-assigned |
| GET | `/counts/{id}/review` | S3: system at snapshot, count 1, recount, variance, ₹, evidence, status; `canApprove` false for the counters |
| POST | `/counts/{id}/approve` | `{lineIds, reasonCode}`. Posts adjustment with reason and approver; counters get 403 |
| POST | `/counts/{id}/send-back` | `{lineIds, note}` |
| GET | `/m/tasks` | M1 My tasks today (counts, recounts, receiving, transfers, wastage, cash, approvals) |
| POST 📱 | `/m/counts/{id}/start` | Start; snapshot time recorded; returns items in shelf order |
| GET 📱 | `/m/counts/{id}` | Counter view. No system quantity, no other person's count |
| PUT 📱 | `/m/counts/{id}/lines/{lineId}` | M3/M4 `{sealedUnits, openWeightG}` or `{scaleReadings:[{kg}]}` or `{typedQty}` (+`photoIds`). Typed weights flagged; photo required above threshold |
| POST 📱 | `/m/counts/{id}/submit` | M5: result is never returned. Out-of-tolerance lines go to a blind recount by a different person (M6); still off → exception + S3 |

## Control areas: S4, S5, S7
| Method | Path | Purpose |
|---|---|---|
| GET | `/liquor?outletId&locationId&from&to` | S4 per-SKU ml: opening, received, sold, comp+staff, breakage, closing, variance, ₹ at selling price; variance % by bar; draught yield |
| GET | `/liquor/{itemId}/trail?outletId&from&to` | Every count, receipt and pour behind a number |
| GET | `/kot-match?outletId&date` | S5 where every KOT item ended; not-accounted table; steward pattern over 30 days |
| GET | `/giveaways?outletId&from&to` | S7 tiles, daily % vs baseline, by approver vs own baseline |

## Purchasing: W5, M9, S6
| Method | Path | Purpose |
|---|---|---|
| GET | `/pos?outletId&status` | Purchase orders |
| POST | `/pos` | Create PO (rate defaults to contract rate) |
| POST | `/pos/{id}/approve` | `{approve}`. Creator gets 403 |
| GET 📱 | `/m/receiving` | POs waiting at the door |
| GET 📱 | `/m/receiving/{poId}` | Receiver view. Ordered qty hidden when blind receiving is on |
| POST 📱 | `/m/grns` | Create GRN with scale readings, invoice number, invoice + goods photos; warns on duplicate invoice numbers |
| POST | `/invoices` | Enter vendor invoice → three-way match. Duplicate vendor + number → `BLOCKED` |
| GET | `/invoices?outletId&from&to&status` | S6 list with check result and payment status |
| GET | `/invoices/{id}` | Line-by-line PO vs GRN vs invoice; payable = min(received, ordered) × PO rate |
| POST | `/invoices/{id}/decide` | `ACCEPT_DIFFERENCE` (reason), `DEBIT_NOTE`, `APPROVE_NO_PO` (reason), `MARK_PAID`. Purchaser, receiver or enterer get 403 |

## Cash: W4, M7
| Method | Path | Purpose |
|---|---|---|
| POST 📱 | `/m/cash/shifts` | Open shift; float counted blind by denomination |
| GET 📱 | `/m/cash/shifts/current` | Cashier's open shift (expected amount only after submitting) |
| POST 📱 | `/m/cash/shifts/{id}/close` | Blind close count → counted, expected, variance |
| GET 📱 | `/m/cash/second-counts` | Shifts waiting for the duty manager |
| POST 📱 | `/m/cash/shifts/{id}/second-count` | `{denoms, managerPin, cashierPin}`. Both PINs sign the handover; variance stored against cashier and shift |
| GET | `/cash/shifts?outletId&from&to` | History incl. no-sale drawer opens |

## Wastage and transfers: W7, M8
| Method | Path | Purpose |
|---|---|---|
| POST 📱 | `/m/wastage` | Log wastage (scale or typed, reason, photo above threshold); routed to the lowest manager whose limit covers it, else owner |
| GET | `/wastage?outletId&from&to&status&mine` | Entries with `canDecide` |
| POST | `/wastage/{id}/decide` | `{approve, note}`. The logger gets 403; above limit 403 |
| POST 📱 | `/m/transfers` | Dispatch |
| GET 📱 | `/m/transfers/incoming` | Blind receiver view (qty sent hidden) |
| POST 📱 | `/m/transfers/{id}/receive` | Confirm what arrived; gap → exception to both stores |
| GET | `/transfers?outletId&status` | List with overdue flag |

## Month-end: W8, S8
| Method | Path | Purpose |
|---|---|---|
| GET | `/periods/{month}/checklist` | Per-outlet checklist, blockers in words |
| POST | `/periods/{month}/full-count` | Schedule a full count at every outlet and location |
| POST | `/periods/{month}/lock` | 409 with `details.blockers` until every outlet is clear |
| POST | `/periods/{month}/reopen` | Finance head only, `{reason}`; logged |
| GET | `/periods/{month}/mis?format=csv` | MIS pack for the accountant |

Writes dated inside a locked month (POS ingest, counts, GRNs, invoices, wastage, cash) return `409 PERIOD_LOCKED`.

## Ask Controller: S9, M11
| Method | Path | Purpose |
|---|---|---|
| POST | `/ask` | `{question}` → `{answer, citations[], table}`. Read-only tools scoped to the asker's outlets |
| GET | `/ask/history` | Previous questions |
| GET | `/webhooks/whatsapp` | Meta verification handshake |
| POST | `/webhooks/whatsapp` | Inbound: `1` opens the last alert, `2` returns the owner's phone, anything else is answered by Ask Controller |

## Controls setup: S10
| Method | Path | Purpose |
|---|---|---|
| GET | `/controls?outletId=chain\|{id}` | Effective tolerances, approval limits, SLAs, settings; separation of duties (always on, locked) |
| PUT | `/controls?outletId` | Owner / finance head only. Separation of duties and owner limits can't be changed (400); audited with before/after |
| GET | `/controls/history` | Change log |

## Evidence
| Method | Path | Purpose |
|---|---|---|
| POST | `/attachments` | multipart `file` (+ `kind`: PHOTO, SCALE_READING, DOCUMENT, CCTV_STILL) → `{id}` |
| GET | `/attachments/{id}` | The file (also accepts `?token=` for `<img>`) |

## Integrations: Digitory POS, KDS and flow meters
Header `X-Api-Key: $POS_INGEST_KEY`, `X-Org-Id: <org id>`. All idempotent on their natural keys.

| Method | Path | Body |
|---|---|---|
| POST | `/integrations/pos/kots` | `{outletId, kotNo, firedAt, station, tableNo?, section?, stewardId?, items:[{menuItemId, qty, amount}]}` |
| POST | `/integrations/pos/bills` | `{outletId, billNo, openedAt, paidAt?, status, netAmount, paymentMode?, items:[{menuItemId, qty, amount, kotNo?, kotLine?}]}`. A paid bill depletes stock by recipe |
| POST | `/integrations/pos/kot-dispositions` | `{outletId, kotNo, line, disposition: VOIDED\|STAFF_MEAL\|NC, reason, approverId?}`. NC and staff meals need an approver |
| POST | `/integrations/pos/giveaways` | `{outletId, at, type, amount, reasonCode, approverId, billNo?, paidMode?, refundMode?}`. Refunds need the original bill |
| POST | `/integrations/pos/drawer-opens` | `{outletId, till, at, withSale, billNo?}` |
| POST | `/integrations/pos/cash-txns` | `{outletId, till, at, kind: SALE\|REFUND\|PAYOUT, amount}` |
| POST | `/integrations/draught-draws` | `{outletId, itemId, tankNo, businessDate, drawnMl, source, standardYieldPct}` |
| POST | `/integrations/section-issues` | `{outletId, section, itemId, businessDate, qtyIssued, qtyReturned}` |

## Jobs (owner / finance; also run by the scheduler)
| Method | Path | Schedule |
|---|---|---|
| POST | `/jobs/day-close` | 05:30 IST daily. KOT match, cost drivers, giveaway baselines, draught yield, overdue transfers, KPIs |
| POST | `/jobs/daily-flash` | 08:00 IST daily. Push + in-app flash to owners and finance |
| POST | `/jobs/escalate` | Every 15 min. SLA breach moves one level up; late counts; overdue transfers |
| — | notification dispatch | Every minute (WhatsApp Cloud API, push hook) |
