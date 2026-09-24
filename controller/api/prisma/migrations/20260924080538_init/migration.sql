-- CreateEnum
CREATE TYPE "OutletKind" AS ENUM ('RESTAURANT', 'CENTRAL_KITCHEN');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'FINANCE_HEAD', 'REGIONAL_CONTROLLER', 'OUTLET_MANAGER', 'DUTY_MANAGER', 'BAR_MANAGER', 'HEAD_CHEF', 'PURCHASE', 'STORE', 'RECEIVER', 'COUNTER', 'CASHIER', 'KITCHEN_STAFF', 'BAR_STAFF', 'STEWARD');

-- CreateEnum
CREATE TYPE "LocationKind" AS ENUM ('BAR', 'STORE', 'CHILLER', 'KITCHEN', 'TAPS');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('SPIRITS_WINE', 'DRAUGHT_BEER', 'BOTTLED_BEER', 'MEAT_SEAFOOD', 'DAIRY', 'PRODUCE', 'DRY_STORE', 'PACKAGING');

-- CreateEnum
CREATE TYPE "BaseUnit" AS ENUM ('ML', 'KG', 'PC');

-- CreateEnum
CREATE TYPE "CountMode" AS ENUM ('WEIGHT', 'UNITS', 'BOTTLE_AND_OPEN');

-- CreateEnum
CREATE TYPE "MenuKind" AS ENUM ('FOOD', 'BEVERAGE', 'LIQUOR');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('OPENING', 'GRN', 'SALE', 'WASTAGE', 'BREAKAGE', 'COMP', 'STAFF_MEAL', 'TRANSFER_OUT', 'TRANSFER_IN', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "CountType" AS ENUM ('SPOT', 'FULL', 'RECOUNT');

-- CreateEnum
CREATE TYPE "CountTaskStatus" AS ENUM ('ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "CountLineStatus" AS ENUM ('PENDING', 'COUNTED', 'AUTO_ACCEPTED', 'RECOUNT_REQUESTED', 'RECOUNT_MATCHED', 'WITHIN_TOLERANCE', 'NEEDS_APPROVAL', 'APPROVED', 'SENT_BACK');

-- CreateEnum
CREATE TYPE "EntryMethod" AS ENUM ('SCALE', 'TYPED', 'UNITS');

-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('OPEN', 'PAID', 'VOIDED');

-- CreateEnum
CREATE TYPE "KotDisposition" AS ENUM ('PENDING', 'BILLED', 'VOIDED', 'STAFF_MEAL', 'NC', 'UNACCOUNTED');

-- CreateEnum
CREATE TYPE "GiveawayType" AS ENUM ('DISCOUNT', 'COMP', 'VOID_BEFORE_KOT', 'VOID_AFTER_KOT', 'VOID_AFTER_PAYMENT', 'REFUND');

-- CreateEnum
CREATE TYPE "ShiftStatus" AS ENUM ('OPEN', 'COUNT_SUBMITTED', 'CLOSED_MATCHED', 'CLOSED_VARIANCE');

-- CreateEnum
CREATE TYPE "PoStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('WAITING_GRN', 'MATCHED', 'ON_HOLD', 'NEEDS_APPROVAL', 'BLOCKED', 'RELEASED', 'PAID');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('IN_TRANSIT', 'RECEIVED', 'RECEIVED_WITH_GAP');

-- CreateEnum
CREATE TYPE "ExceptionType" AS ENUM ('STOCK_VARIANCE', 'LIQUOR_VARIANCE', 'UNBILLED_KOT', 'FOOD_COST', 'BEVERAGE_COST', 'RATE_VARIANCE', 'THREE_WAY_MISMATCH', 'NO_PO_INVOICE', 'DUPLICATE_INVOICE', 'GIVEAWAY_PATTERN', 'VOID_AFTER_PAYMENT', 'REFUND_MODE_MISMATCH', 'CASH_VARIANCE', 'CASH_PATTERN', 'DRAWER_OPEN_PATTERN', 'WASTAGE_ABOVE_LIMIT', 'TRANSFER_GAP', 'TRANSFER_OVERDUE', 'COUNT_NOT_STARTED', 'DRAUGHT_YIELD');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('CRITICAL', 'ATTENTION', 'PENDING');

-- CreateEnum
CREATE TYPE "ExceptionStatus" AS ENUM ('OPEN', 'AWAITING_DECISION', 'RESOLVED');

-- CreateEnum
CREATE TYPE "PeriodStatus" AS ENUM ('OPEN', 'LOCKED');

-- CreateTable
CREATE TABLE "Org" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Org_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outlet" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "OutletKind" NOT NULL DEFAULT 'RESTAURANT',
    "hasDraught" BOOLEAN NOT NULL DEFAULT false,
    "city" TEXT,

    CONSTRAINT "Outlet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "passwordHash" TEXT,
    "pinHash" TEXT,
    "role" "Role" NOT NULL,
    "title" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserOutlet" (
    "userId" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,

    CONSTRAINT "UserOutlet_pkey" PRIMARY KEY ("userId","outletId")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "LocationKind" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "baseUnit" "BaseUnit" NOT NULL,
    "packSize" DOUBLE PRECISION,
    "countMode" "CountMode" NOT NULL DEFAULT 'WEIGHT',
    "standardCost" DOUBLE PRECISION NOT NULL,
    "sellingPricePerUnit" DOUBLE PRECISION,
    "emptyWeightG" DOUBLE PRECISION,
    "densityGPerMl" DOUBLE PRECISION,
    "isHighValue" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemLocation" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "shelf" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ItemLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "MenuKind" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "station" TEXT NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "section" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeLine" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "RecipeLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "locationId" TEXT,
    "type" "MovementType" NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,
    "unitCost" DOUBLE PRECISION NOT NULL,
    "at" TIMESTAMP(3) NOT NULL,
    "businessDate" TEXT NOT NULL,
    "refType" TEXT,
    "refId" TEXT,
    "reasonCode" TEXT,
    "approvedById" TEXT,
    "createdById" TEXT,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectionIssue" (
    "id" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "businessDate" TEXT NOT NULL,
    "qtyIssued" DOUBLE PRECISION NOT NULL,
    "qtyReturned" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "SectionIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountTask" (
    "id" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "type" "CountType" NOT NULL,
    "status" "CountTaskStatus" NOT NULL DEFAULT 'ASSIGNED',
    "assigneeId" TEXT NOT NULL,
    "assignedById" TEXT,
    "parentTaskId" TEXT,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "snapshotAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "periodMonth" TEXT,
    "businessDate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CountTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountLine" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "originalLineId" TEXT,
    "status" "CountLineStatus" NOT NULL DEFAULT 'PENDING',
    "countedQty" DOUBLE PRECISION,
    "sealedUnits" DOUBLE PRECISION,
    "openWeightG" DOUBLE PRECISION,
    "scaleReadings" JSONB,
    "entryMethod" "EntryMethod",
    "typedFlag" BOOLEAN NOT NULL DEFAULT false,
    "countedAt" TIMESTAMP(3),
    "countedById" TEXT,
    "systemQty" DOUBLE PRECISION,
    "variance" DOUBLE PRECISION,
    "varianceValue" DOUBLE PRECISION,
    "exceptionId" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvalReason" TEXT,

    CONSTRAINT "CountLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bill" (
    "id" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "billNo" TEXT NOT NULL,
    "businessDate" TEXT NOT NULL,
    "tableNo" TEXT,
    "section" TEXT,
    "stewardId" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "status" "BillStatus" NOT NULL,
    "netAmount" DOUBLE PRECISION NOT NULL,
    "paymentMode" TEXT,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillItem" (
    "id" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "kotItemId" TEXT,

    CONSTRAINT "BillItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kot" (
    "id" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "kotNo" TEXT NOT NULL,
    "businessDate" TEXT NOT NULL,
    "firedAt" TIMESTAMP(3) NOT NULL,
    "tableNo" TEXT,
    "section" TEXT,
    "stewardId" TEXT,
    "station" TEXT NOT NULL,

    CONSTRAINT "Kot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KotItem" (
    "id" TEXT NOT NULL,
    "kotId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "disposition" "KotDisposition" NOT NULL DEFAULT 'PENDING',
    "voidReason" TEXT,
    "ncReasonCode" TEXT,
    "ncApproverId" TEXT,
    "exceptionId" TEXT,

    CONSTRAINT "KotItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Giveaway" (
    "id" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "businessDate" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL,
    "type" "GiveawayType" NOT NULL,
    "billId" TEXT,
    "billNo" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "reasonCode" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "givenById" TEXT,
    "paidMode" TEXT,
    "refundMode" TEXT,

    CONSTRAINT "Giveaway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashShift" (
    "id" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "till" TEXT NOT NULL,
    "cashierId" TEXT NOT NULL,
    "businessDate" TEXT NOT NULL,
    "shiftName" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL,
    "floatExpected" DOUBLE PRECISION NOT NULL,
    "floatCounted" DOUBLE PRECISION,
    "floatDenoms" JSONB,
    "closedAt" TIMESTAMP(3),
    "closeDenoms" JSONB,
    "closeCounted" DOUBLE PRECISION,
    "expectedCash" DOUBLE PRECISION,
    "variance" DOUBLE PRECISION,
    "secondCounterId" TEXT,
    "secondDenoms" JSONB,
    "secondCounted" DOUBLE PRECISION,
    "handoverCashierAt" TIMESTAMP(3),
    "handoverManagerAt" TIMESTAMP(3),
    "status" "ShiftStatus" NOT NULL DEFAULT 'OPEN',
    "exceptionId" TEXT,

    CONSTRAINT "CashShift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrawerOpen" (
    "id" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL,
    "withSale" BOOLEAN NOT NULL,
    "billNo" TEXT,

    CONSTRAINT "DrawerOpen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashTxn" (
    "id" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "at" TIMESTAMP(3) NOT NULL,
    "ref" TEXT,

    CONSTRAINT "CashTxn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gstin" TEXT,
    "phone" TEXT,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorRate" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "poNo" TEXT NOT NULL,
    "indentRef" TEXT,
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "status" "PoStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "expectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoLine" (
    "id" TEXT NOT NULL,
    "poId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PoLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grn" (
    "id" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "poId" TEXT,
    "grnNo" TEXT NOT NULL,
    "receivedById" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "businessDate" TEXT NOT NULL,
    "blind" BOOLEAN NOT NULL,
    "invoiceNo" TEXT,

    CONSTRAINT "Grn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrnLine" (
    "id" TEXT NOT NULL,
    "grnId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,
    "weighed" BOOLEAN NOT NULL DEFAULT false,
    "typedFlag" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GrnLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "invoiceNo" TEXT NOT NULL,
    "invoiceDate" TEXT NOT NULL,
    "poId" TEXT,
    "grnId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "payable" DOUBLE PRECISION,
    "difference" DOUBLE PRECISION,
    "status" "InvoiceStatus" NOT NULL,
    "checkResult" TEXT,
    "matchLines" JSONB,
    "duplicateOfId" TEXT,
    "enteredById" TEXT NOT NULL,
    "decidedById" TEXT,
    "decisionReason" TEXT,
    "decidedAt" TIMESTAMP(3),
    "exceptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceLine" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "InvoiceLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebitNote" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DebitNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WastageEntry" (
    "id" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "locationId" TEXT,
    "section" TEXT,
    "itemId" TEXT NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "reasonCode" TEXT NOT NULL,
    "isBreakage" BOOLEAN NOT NULL DEFAULT false,
    "entryMethod" "EntryMethod" NOT NULL,
    "loggedById" TEXT NOT NULL,
    "loggedAt" TIMESTAMP(3) NOT NULL,
    "businessDate" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "routedToId" TEXT NOT NULL,
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "decisionNote" TEXT,

    CONSTRAINT "WastageEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transfer" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "fromOutletId" TEXT NOT NULL,
    "toOutletId" TEXT NOT NULL,
    "dispatchedById" TEXT NOT NULL,
    "dispatchedAt" TIMESTAMP(3) NOT NULL,
    "dueBy" TIMESTAMP(3) NOT NULL,
    "receivedById" TEXT,
    "receivedAt" TIMESTAMP(3),
    "status" "TransferStatus" NOT NULL DEFAULT 'IN_TRANSIT',
    "overdueFlagged" BOOLEAN NOT NULL DEFAULT false,
    "exceptionId" TEXT,

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferLine" (
    "id" TEXT NOT NULL,
    "transferId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "qtySent" DOUBLE PRECISION NOT NULL,
    "qtyReceived" DOUBLE PRECISION,

    CONSTRAINT "TransferLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DraughtDraw" (
    "id" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "tankNo" TEXT NOT NULL,
    "businessDate" TEXT NOT NULL,
    "drawnMl" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL,
    "standardYieldPct" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DraughtDraw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exception" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "outletId" TEXT,
    "outletIds" TEXT[],
    "type" "ExceptionType" NOT NULL,
    "severity" "Severity" NOT NULL,
    "status" "ExceptionStatus" NOT NULL DEFAULT 'OPEN',
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "impact" DOUBLE PRECISION NOT NULL,
    "businessDate" TEXT NOT NULL,
    "groupKey" TEXT NOT NULL,
    "occurrences" INTEGER NOT NULL DEFAULT 1,
    "assigneeId" TEXT,
    "ownerLabel" TEXT,
    "routedPastOutlet" BOOLEAN NOT NULL DEFAULT false,
    "involvedUserIds" TEXT[],
    "escalationPath" TEXT[],
    "escalationLevel" INTEGER NOT NULL DEFAULT 0,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "drivers" JSONB,
    "detail" JSONB,
    "suggestedChecks" JSONB,
    "sourceRefs" JSONB,
    "explanation" JSONB,
    "decisionById" TEXT,
    "closedAt" TIMESTAMP(3),
    "closedById" TEXT,
    "closeReasonCode" TEXT,
    "closeNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exception_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExceptionEvent" (
    "id" TEXT NOT NULL,
    "exceptionId" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" TEXT,
    "kind" TEXT NOT NULL,
    "payload" JSONB,

    CONSTRAINT "ExceptionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReasonCode" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "ReasonCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "meta" JSONB,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ControlProfile" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "outletId" TEXT,
    "tolerances" JSONB NOT NULL,
    "approvalLimits" JSONB NOT NULL,
    "sla" JSONB NOT NULL,
    "settings" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "ControlProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DayClose" (
    "id" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "businessDate" TEXT NOT NULL,
    "closedAt" TIMESTAMP(3) NOT NULL,
    "kpis" JSONB NOT NULL,
    "exceptionsCreated" INTEGER NOT NULL,

    CONSTRAINT "DayClose_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Period" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "status" "PeriodStatus" NOT NULL DEFAULT 'OPEN',
    "lockedById" TEXT,
    "lockedAt" TIMESTAMP(3),
    "history" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "Period_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "exceptionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "providerRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AskLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "citations" JSONB,
    "table" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AskLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Outlet_orgId_code_key" ON "Outlet"("orgId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Item_orgId_sku_key" ON "Item"("orgId", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "ItemLocation_itemId_locationId_key" ON "ItemLocation"("itemId", "locationId");

-- CreateIndex
CREATE INDEX "StockMovement_outletId_itemId_at_idx" ON "StockMovement"("outletId", "itemId", "at");

-- CreateIndex
CREATE INDEX "StockMovement_outletId_businessDate_idx" ON "StockMovement"("outletId", "businessDate");

-- CreateIndex
CREATE INDEX "SectionIssue_outletId_businessDate_idx" ON "SectionIssue"("outletId", "businessDate");

-- CreateIndex
CREATE INDEX "CountTask_assigneeId_status_idx" ON "CountTask"("assigneeId", "status");

-- CreateIndex
CREATE INDEX "CountTask_outletId_businessDate_idx" ON "CountTask"("outletId", "businessDate");

-- CreateIndex
CREATE INDEX "CountLine_taskId_idx" ON "CountLine"("taskId");

-- CreateIndex
CREATE INDEX "Bill_outletId_businessDate_idx" ON "Bill"("outletId", "businessDate");

-- CreateIndex
CREATE UNIQUE INDEX "Bill_outletId_billNo_key" ON "Bill"("outletId", "billNo");

-- CreateIndex
CREATE UNIQUE INDEX "BillItem_kotItemId_key" ON "BillItem"("kotItemId");

-- CreateIndex
CREATE INDEX "Kot_outletId_businessDate_idx" ON "Kot"("outletId", "businessDate");

-- CreateIndex
CREATE UNIQUE INDEX "Kot_outletId_kotNo_key" ON "Kot"("outletId", "kotNo");

-- CreateIndex
CREATE INDEX "Giveaway_outletId_businessDate_idx" ON "Giveaway"("outletId", "businessDate");

-- CreateIndex
CREATE INDEX "Giveaway_approverId_businessDate_idx" ON "Giveaway"("approverId", "businessDate");

-- CreateIndex
CREATE INDEX "CashShift_cashierId_businessDate_idx" ON "CashShift"("cashierId", "businessDate");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_poNo_key" ON "PurchaseOrder"("poNo");

-- CreateIndex
CREATE UNIQUE INDEX "Grn_grnNo_key" ON "Grn"("grnNo");

-- CreateIndex
CREATE INDEX "Invoice_vendorId_invoiceNo_idx" ON "Invoice"("vendorId", "invoiceNo");

-- CreateIndex
CREATE UNIQUE INDEX "DebitNote_number_key" ON "DebitNote"("number");

-- CreateIndex
CREATE INDEX "WastageEntry_outletId_businessDate_idx" ON "WastageEntry"("outletId", "businessDate");

-- CreateIndex
CREATE UNIQUE INDEX "Transfer_number_key" ON "Transfer"("number");

-- CreateIndex
CREATE INDEX "Exception_orgId_status_idx" ON "Exception"("orgId", "status");

-- CreateIndex
CREATE INDEX "Exception_groupKey_idx" ON "Exception"("groupKey");

-- CreateIndex
CREATE UNIQUE INDEX "ReasonCode_orgId_domain_code_key" ON "ReasonCode"("orgId", "domain", "code");

-- CreateIndex
CREATE INDEX "Attachment_entityType_entityId_idx" ON "Attachment"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "ControlProfile_orgId_outletId_key" ON "ControlProfile"("orgId", "outletId");

-- CreateIndex
CREATE UNIQUE INDEX "DayClose_outletId_businessDate_key" ON "DayClose"("outletId", "businessDate");

-- CreateIndex
CREATE UNIQUE INDEX "Period_orgId_month_key" ON "Period"("orgId", "month");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_orgId_entity_at_idx" ON "AuditLog"("orgId", "entity", "at");

-- AddForeignKey
ALTER TABLE "Outlet" ADD CONSTRAINT "Outlet_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOutlet" ADD CONSTRAINT "UserOutlet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOutlet" ADD CONSTRAINT "UserOutlet_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemLocation" ADD CONSTRAINT "ItemLocation_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemLocation" ADD CONSTRAINT "ItemLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeLine" ADD CONSTRAINT "RecipeLine_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountLine" ADD CONSTRAINT "CountLine_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "CountTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillItem" ADD CONSTRAINT "BillItem_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KotItem" ADD CONSTRAINT "KotItem_kotId_fkey" FOREIGN KEY ("kotId") REFERENCES "Kot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrawerOpen" ADD CONSTRAINT "DrawerOpen_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "CashShift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashTxn" ADD CONSTRAINT "CashTxn_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "CashShift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorRate" ADD CONSTRAINT "VendorRate_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoLine" ADD CONSTRAINT "PoLine_poId_fkey" FOREIGN KEY ("poId") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrnLine" ADD CONSTRAINT "GrnLine_grnId_fkey" FOREIGN KEY ("grnId") REFERENCES "Grn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebitNote" ADD CONSTRAINT "DebitNote_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferLine" ADD CONSTRAINT "TransferLine_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "Transfer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExceptionEvent" ADD CONSTRAINT "ExceptionEvent_exceptionId_fkey" FOREIGN KEY ("exceptionId") REFERENCES "Exception"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Period" ADD CONSTRAINT "Period_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
