-- Flag opt-in permanen; seluruh akun existing tetap tanpa faktor SMS tambahan.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
ALTER TABLE "User" ADD COLUMN "smsOtpEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD CONSTRAINT "User_sms_otp_verified_check"
  CHECK (NOT "smsOtpEnabled" OR ("phone" IS NOT NULL AND "phoneVerifiedAt" IS NOT NULL));
-- Keberadaan AuthCredential dan reauthentication diverifikasi transaksi layanan.
-- Unlink nomor harus mematikan flag dalam UPDATE atomik yang sama.
COMMIT;
