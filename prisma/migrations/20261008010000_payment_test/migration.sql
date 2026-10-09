-- Pengujian internal saja: tidak ada status PAID atau trigger aktivasi undangan.
CREATE TYPE "PaymentTestStatus" AS ENUM ('REQUESTED', 'APPROVED_TEST', 'REJECTED');

CREATE TABLE "PaymentTestRequest" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountIdr" INTEGER NOT NULL,
    "packageSlug" TEXT NOT NULL,
    "status" "PaymentTestStatus" NOT NULL DEFAULT 'REQUESTED',
    "reference" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "reviewedAt" TIMESTAMPTZ(3),
    "reviewedByUserId" TEXT,
    CONSTRAINT "PaymentTestRequest_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PaymentTestRequest_amountIdr_positive" CHECK ("amountIdr" > 0)
);

CREATE INDEX "PaymentTestRequest_userId_createdAt_idx" ON "PaymentTestRequest"("userId", "createdAt");
CREATE INDEX "PaymentTestRequest_status_createdAt_idx" ON "PaymentTestRequest"("status", "createdAt");

ALTER TABLE "PaymentTestRequest" ADD CONSTRAINT "PaymentTestRequest_invitationId_fkey"
    FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentTestRequest" ADD CONSTRAINT "PaymentTestRequest_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PaymentTestRequest" ADD CONSTRAINT "PaymentTestRequest_reviewedByUserId_fkey"
    FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
