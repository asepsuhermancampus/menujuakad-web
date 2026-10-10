-- Migrasi domain perencanaan pernikahan (PLN) + admin operasional.
-- Menutup drift schema.prisma vs database: 15 enum + 21 tabel + indeks + FK.
-- Murni aditif: tidak ada DROP/TRUNCATE/DELETE pada data yang ada.

-- CreateEnum
CREATE TYPE "EventContext" AS ENUM ('WEDDING', 'ENGAGEMENT');

-- CreateEnum
CREATE TYPE "PlannerMemberRole" AS ENUM ('OWNER', 'PARTNER');

-- CreateEnum
CREATE TYPE "PlannerInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "SavingsOwner" AS ENUM ('SELF', 'PARTNER', 'SHARED');

-- CreateEnum
CREATE TYPE "PlannerTaskStatus" AS ENUM ('PENDING', 'DONE');

-- CreateEnum
CREATE TYPE "PlannerTaskPic" AS ENUM ('SELF', 'PARTNER', 'SHARED');

-- CreateEnum
CREATE TYPE "VendorPaymentStatus" AS ENUM ('UNPAID', 'PARTIAL', 'PAID');

-- CreateEnum
CREATE TYPE "SeserahanCategory" AS ENUM ('SESERAHAN_WANITA', 'SESERAHAN_PRIA', 'HANTARAN_LAMARAN');

-- CreateEnum
CREATE TYPE "SeserahanStatus" AS ENUM ('NOT_BOUGHT', 'BOUGHT', 'PREPARED');

-- CreateEnum
CREATE TYPE "MoodboardCategory" AS ENUM ('DEKORASI', 'BUSANA', 'UNDANGAN', 'KUE', 'FOTOGRAFI');

-- CreateEnum
CREATE TYPE "WeddingKitFormat" AS ENUM ('SPREADSHEET', 'MOODBOARD', 'CHECKLIST');

-- CreateEnum
CREATE TYPE "WeddingKitOrderStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'FULFILLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "UpgradeRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ContentSectionKey" AS ENUM ('BRAND', 'LANDING', 'PRICING', 'FAQ', 'ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "AdminAuditResult" AS ENUM ('SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "PlannerWorkspace" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "partnerName" TEXT,
    "weddingDate" DATE,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
    "savingsTargetIdr" INTEGER,
    "savingsTargetDate" DATE,
    "onboardingDoneAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "PlannerWorkspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlannerMember" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "PlannerMemberRole" NOT NULL DEFAULT 'PARTNER',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlannerMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlannerInvite" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "invitedLabel" TEXT NOT NULL,
    "status" "PlannerInviteStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "acceptedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlannerInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavingsAccount" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "bank" TEXT NOT NULL,
    "owner" "SavingsOwner" NOT NULL DEFAULT 'SHARED',
    "accountNumber" TEXT,
    "balanceIdr" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "SavingsAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavingsTransfer" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "fromAccountId" TEXT NOT NULL,
    "toAccountId" TEXT NOT NULL,
    "amountIdr" INTEGER NOT NULL,
    "note" TEXT,
    "transferredAt" DATE NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavingsTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetCategory" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "budgetIdr" INTEGER NOT NULL DEFAULT 0,
    "eventContext" "EventContext" NOT NULL DEFAULT 'WEDDING',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "BudgetCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "categoryId" TEXT,
    "accountId" TEXT,
    "description" TEXT NOT NULL,
    "amountIdr" INTEGER NOT NULL,
    "spentAt" DATE NOT NULL,
    "eventContext" "EventContext" NOT NULL DEFAULT 'WEDDING',
    "note" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlannerTask" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "pic" "PlannerTaskPic" NOT NULL DEFAULT 'SHARED',
    "dueDate" DATE,
    "status" "PlannerTaskStatus" NOT NULL DEFAULT 'PENDING',
    "eventContext" "EventContext" NOT NULL DEFAULT 'WEDDING',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "PlannerTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RundownItem" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "startTime" VARCHAR(5) NOT NULL,
    "endTime" VARCHAR(5),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "pic" "PlannerTaskPic" NOT NULL DEFAULT 'SHARED',
    "eventContext" "EventContext" NOT NULL DEFAULT 'WEDDING',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "RundownItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "contact" TEXT,
    "totalIdr" INTEGER NOT NULL DEFAULT 0,
    "paidIdr" INTEGER NOT NULL DEFAULT 0,
    "status" "VendorPaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "eventContext" "EventContext" NOT NULL DEFAULT 'WEDDING',
    "note" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeserahanItem" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "SeserahanCategory" NOT NULL,
    "estimateIdr" INTEGER NOT NULL DEFAULT 0,
    "status" "SeserahanStatus" NOT NULL DEFAULT 'NOT_BOUGHT',
    "purchaseUrl" TEXT,
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "SeserahanItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequirementItem" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "dueDate" DATE,
    "note" TEXT,
    "attachmentKey" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "RequirementItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EngagementPlan" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "eventName" TEXT,
    "eventDate" DATE,
    "budgetIdr" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "EngagementPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoodboardBoard" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "MoodboardBoard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoodboardItem" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "MoodboardCategory" NOT NULL,
    "imageRef" TEXT,
    "sourceUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MoodboardItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeddingKitProduct" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT,
    "priceIdr" INTEGER NOT NULL,
    "format" "WeddingKitFormat" NOT NULL,
    "contents" JSONB NOT NULL DEFAULT '[]',
    "status" "TemplateStatus" NOT NULL DEFAULT 'DRAFT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "WeddingKitProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeddingKitOrder" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "status" "WeddingKitOrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "amountIdr" INTEGER NOT NULL,
    "reference" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "WeddingKitOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UpgradeRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fromPackageSlug" TEXT,
    "toPackageSlug" TEXT NOT NULL,
    "status" "UpgradeRequestStatus" NOT NULL DEFAULT 'PENDING',
    "proofKey" TEXT,
    "decidedAt" TIMESTAMPTZ(3),
    "decidedByUserId" TEXT,
    "decisionNote" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "UpgradeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentSection" (
    "id" TEXT NOT NULL,
    "key" "ContentSectionKey" NOT NULL,
    "draftJson" JSONB NOT NULL DEFAULT '{}',
    "publishedJson" JSONB DEFAULT '{}',
    "draftSavedAt" TIMESTAMPTZ(3),
    "publishedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ContentSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentSetting" (
    "id" TEXT NOT NULL,
    "qrisKey" TEXT,
    "qrisLabel" TEXT,
    "accountsJson" JSONB NOT NULL DEFAULT '[]',
    "adminWhatsapp" TEXT,
    "messageTemplate" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "PaymentSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "reason" TEXT,
    "result" "AdminAuditResult" NOT NULL DEFAULT 'SUCCESS',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlannerWorkspace_ownerUserId_idx" ON "PlannerWorkspace"("ownerUserId");

-- CreateIndex
CREATE INDEX "PlannerMember_userId_idx" ON "PlannerMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PlannerMember_workspaceId_userId_key" ON "PlannerMember"("workspaceId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PlannerInvite_tokenHash_key" ON "PlannerInvite"("tokenHash");

-- CreateIndex
CREATE INDEX "PlannerInvite_workspaceId_status_idx" ON "PlannerInvite"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "SavingsAccount_workspaceId_sortOrder_idx" ON "SavingsAccount"("workspaceId", "sortOrder");

-- CreateIndex
CREATE INDEX "SavingsTransfer_workspaceId_transferredAt_idx" ON "SavingsTransfer"("workspaceId", "transferredAt");

-- CreateIndex
CREATE INDEX "BudgetCategory_workspaceId_eventContext_sortOrder_idx" ON "BudgetCategory"("workspaceId", "eventContext", "sortOrder");

-- CreateIndex
CREATE INDEX "Expense_workspaceId_spentAt_idx" ON "Expense"("workspaceId", "spentAt");

-- CreateIndex
CREATE INDEX "Expense_workspaceId_categoryId_idx" ON "Expense"("workspaceId", "categoryId");

-- CreateIndex
CREATE INDEX "PlannerTask_workspaceId_status_dueDate_idx" ON "PlannerTask"("workspaceId", "status", "dueDate");

-- CreateIndex
CREATE INDEX "RundownItem_workspaceId_eventContext_sortOrder_idx" ON "RundownItem"("workspaceId", "eventContext", "sortOrder");

-- CreateIndex
CREATE INDEX "Vendor_workspaceId_status_idx" ON "Vendor"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "SeserahanItem_workspaceId_category_sortOrder_idx" ON "SeserahanItem"("workspaceId", "category", "sortOrder");

-- CreateIndex
CREATE INDEX "RequirementItem_workspaceId_done_sortOrder_idx" ON "RequirementItem"("workspaceId", "done", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "EngagementPlan_workspaceId_key" ON "EngagementPlan"("workspaceId");

-- CreateIndex
CREATE INDEX "MoodboardBoard_workspaceId_sortOrder_idx" ON "MoodboardBoard"("workspaceId", "sortOrder");

-- CreateIndex
CREATE INDEX "MoodboardItem_boardId_sortOrder_idx" ON "MoodboardItem"("boardId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "WeddingKitProduct_slug_key" ON "WeddingKitProduct"("slug");

-- CreateIndex
CREATE INDEX "WeddingKitOrder_workspaceId_createdAt_idx" ON "WeddingKitOrder"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "UpgradeRequest_status_createdAt_idx" ON "UpgradeRequest"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ContentSection_key_key" ON "ContentSection"("key");

-- CreateIndex
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_actorUserId_createdAt_idx" ON "AdminAuditLog"("actorUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "PlannerWorkspace" ADD CONSTRAINT "PlannerWorkspace_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannerMember" ADD CONSTRAINT "PlannerMember_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "PlannerWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannerMember" ADD CONSTRAINT "PlannerMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannerInvite" ADD CONSTRAINT "PlannerInvite_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "PlannerWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingsAccount" ADD CONSTRAINT "SavingsAccount_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "PlannerWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingsTransfer" ADD CONSTRAINT "SavingsTransfer_fromAccountId_fkey" FOREIGN KEY ("fromAccountId") REFERENCES "SavingsAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingsTransfer" ADD CONSTRAINT "SavingsTransfer_toAccountId_fkey" FOREIGN KEY ("toAccountId") REFERENCES "SavingsAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetCategory" ADD CONSTRAINT "BudgetCategory_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "PlannerWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "PlannerWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BudgetCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "SavingsAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannerTask" ADD CONSTRAINT "PlannerTask_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "PlannerWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RundownItem" ADD CONSTRAINT "RundownItem_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "PlannerWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "PlannerWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeserahanItem" ADD CONSTRAINT "SeserahanItem_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "PlannerWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequirementItem" ADD CONSTRAINT "RequirementItem_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "PlannerWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngagementPlan" ADD CONSTRAINT "EngagementPlan_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "PlannerWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoodboardBoard" ADD CONSTRAINT "MoodboardBoard_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "PlannerWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoodboardItem" ADD CONSTRAINT "MoodboardItem_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "MoodboardBoard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeddingKitOrder" ADD CONSTRAINT "WeddingKitOrder_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "PlannerWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeddingKitOrder" ADD CONSTRAINT "WeddingKitOrder_productId_fkey" FOREIGN KEY ("productId") REFERENCES "WeddingKitProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpgradeRequest" ADD CONSTRAINT "UpgradeRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpgradeRequest" ADD CONSTRAINT "UpgradeRequest_decidedByUserId_fkey" FOREIGN KEY ("decidedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

