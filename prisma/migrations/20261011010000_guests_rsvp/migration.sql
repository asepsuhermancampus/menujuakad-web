-- Migrasi domain tamu & RSVP: enum GuestCategory/GuestStatus/RsvpStatus + tabel
-- Guest, GuestInvitation, RsvpResponse beserta indeks dan foreign key.
-- Murni aditif: tidak ada DROP/TRUNCATE/DELETE pada data yang ada.
--
-- Catatan desain:
-- - Guest.guestCountAllowed = alokasi kursi dari pemilik; RsvpResponse.guestCount
--   = jumlah orang yang benar-benar hadir. Keduanya sengaja dipisah.
-- - GuestInvitation.personalToken unik per tamu; URL publik memakai token acak,
--   bukan ID berurutan.
-- - RsvpResponse.guestId unik (satu respons per tamu) sekaligus memenuhi
--   rekomendasi master spec "invitationId + guestId".

-- CreateEnum
-- Enam kategori tamu: FAMILY, FRIEND, WORK, VIP, VENDOR, OTHER.
CREATE TYPE "GuestCategory" AS ENUM ('FAMILY', 'FRIEND', 'WORK', 'VIP', 'VENDOR', 'OTHER');

-- CreateEnum
CREATE TYPE "GuestStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RsvpStatus" AS ENUM ('ATTENDING', 'NOT_ATTENDING', 'MAYBE', 'PENDING');

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "phone" VARCHAR(32),
    "email" VARCHAR(254),
    "category" "GuestCategory" NOT NULL DEFAULT 'OTHER',
    "guestCountAllowed" INTEGER NOT NULL DEFAULT 1,
    "notes" VARCHAR(500),
    "status" "GuestStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestInvitation" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "personalToken" VARCHAR(64) NOT NULL,
    "sentAt" TIMESTAMPTZ(3),
    "openedAt" TIMESTAMPTZ(3),
    "lastOpenedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "GuestInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RsvpResponse" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "status" "RsvpStatus" NOT NULL DEFAULT 'PENDING',
    "guestCount" INTEGER NOT NULL DEFAULT 0,
    "phone" VARCHAR(32),
    "message" VARCHAR(1000),
    "respondedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "RsvpResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Guest_invitationId_createdAt_idx" ON "Guest"("invitationId", "createdAt");

-- CreateIndex
CREATE INDEX "Guest_invitationId_phone_idx" ON "Guest"("invitationId", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "GuestInvitation_guestId_key" ON "GuestInvitation"("guestId");

-- CreateIndex
CREATE UNIQUE INDEX "GuestInvitation_personalToken_key" ON "GuestInvitation"("personalToken");

-- CreateIndex
CREATE INDEX "GuestInvitation_invitationId_idx" ON "GuestInvitation"("invitationId");

-- CreateIndex
CREATE UNIQUE INDEX "RsvpResponse_guestId_key" ON "RsvpResponse"("guestId");

-- CreateIndex
CREATE INDEX "RsvpResponse_invitationId_status_idx" ON "RsvpResponse"("invitationId", "status");

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestInvitation" ADD CONSTRAINT "GuestInvitation_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestInvitation" ADD CONSTRAINT "GuestInvitation_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RsvpResponse" ADD CONSTRAINT "RsvpResponse_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RsvpResponse" ADD CONSTRAINT "RsvpResponse_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
