-- Hanya dijalankan DevOps memakai role owner sesudah backup dan QA.
BEGIN;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_roles WHERE rolname='menujuakad_runtime_preproduction'
      AND NOT rolsuper AND NOT rolcreatedb AND NOT rolcreaterole
      AND NOT rolreplication AND NOT rolbypassrls
  ) THEN
    RAISE EXCEPTION 'Role runtime preproduction tidak ada atau terlalu berhak.';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_auth_members WHERE member=(SELECT oid FROM pg_roles WHERE rolname='menujuakad_runtime_preproduction'))
    OR EXISTS (SELECT 1 FROM pg_namespace WHERE nspowner=(SELECT oid FROM pg_roles WHERE rolname='menujuakad_runtime_preproduction'))
    OR EXISTS (SELECT 1 FROM pg_class WHERE relowner=(SELECT oid FROM pg_roles WHERE rolname='menujuakad_runtime_preproduction'))
    OR has_schema_privilege('menujuakad_runtime_preproduction','public','CREATE') THEN
    RAISE EXCEPTION 'Role runtime preproduction memiliki inheritance/ownership/DDL yang tidak aman.';
  END IF;
END $$;

-- Registrasi Prisma menyertakan default role/status. Trigger migration memastikan
-- INSERT runtime hanya CLIENT/ACTIVE. Role/status tidak pernah mendapat UPDATE.
REVOKE INSERT, UPDATE, DELETE ON TABLE public."User" FROM menujuakad_runtime_preproduction;
REVOKE UPDATE ("id", "role", "status", "createdAt") ON TABLE public."User" FROM menujuakad_runtime_preproduction;
REVOKE UPDATE ON TABLE public."AuthCredential", public."UserSession", public."AuthAccount", public."AuthVerificationToken" FROM menujuakad_runtime_preproduction;
REVOKE UPDATE ("userId") ON TABLE public."AuthCredential" FROM menujuakad_runtime_preproduction;
REVOKE UPDATE ("id", "userId", "tokenHash", "expiresAt", "createdAt") ON TABLE public."UserSession" FROM menujuakad_runtime_preproduction;
REVOKE UPDATE ("id", "userId", "provider", "providerAccountId", "createdAt") ON TABLE public."AuthAccount" FROM menujuakad_runtime_preproduction;
REVOKE UPDATE ("id", "userId", "tokenHash", "purpose", "identifier", "payload", "expiresAt", "createdAt") ON TABLE public."AuthVerificationToken" FROM menujuakad_runtime_preproduction;
GRANT SELECT ON TABLE public."User" TO menujuakad_runtime_preproduction;
GRANT INSERT ("id", "email", "emailVerifiedAt", "name", "phone", "phoneVerifiedAt", "smsOtpEnabled",
  "avatarUrl", "role", "status", "lastLoginAt", "createdAt", "updatedAt")
  ON TABLE public."User" TO menujuakad_runtime_preproduction;
GRANT UPDATE ("email", "emailVerifiedAt", "name", "phone", "phoneVerifiedAt", "smsOtpEnabled",
  "avatarUrl", "lastLoginAt", "updatedAt")
  ON TABLE public."User" TO menujuakad_runtime_preproduction;
-- Satu password akun: signup/reset mengganti hash; unlink memerlukan transaksi.
GRANT SELECT, INSERT, DELETE ON TABLE public."AuthCredential" TO menujuakad_runtime_preproduction;
GRANT UPDATE ("passwordHash") ON TABLE public."AuthCredential" TO menujuakad_runtime_preproduction;
-- Revoke/reauth/lastSeen tanpa hak menulis ulang kepemilikan atau hash sesi.
GRANT SELECT, INSERT, DELETE ON TABLE public."UserSession" TO menujuakad_runtime_preproduction;
GRANT UPDATE ("reauthenticatedAt", "lastSeenAt", "revokedAt", "userAgent", "ipHash")
  ON TABLE public."UserSession" TO menujuakad_runtime_preproduction;
-- Linking immutable subject; metadata dapat diperbarui setelah provider verification.
GRANT SELECT, INSERT, DELETE ON TABLE public."AuthAccount" TO menujuakad_runtime_preproduction;
GRANT UPDATE ("email", "emailVerified", "updatedAt") ON TABLE public."AuthAccount" TO menujuakad_runtime_preproduction;
-- Konsumsi/attempts atomik, tetapi hash/purpose/userId token immutable untuk runtime.
GRANT SELECT, INSERT, DELETE ON TABLE public."AuthVerificationToken" TO menujuakad_runtime_preproduction;
GRANT UPDATE ("consumedAt", "attempts") ON TABLE public."AuthVerificationToken" TO menujuakad_runtime_preproduction;
-- Throttle atomik upsert dan decrement; tidak membutuhkan DELETE.
GRANT SELECT, INSERT, UPDATE ON TABLE public."AuthLoginThrottle" TO menujuakad_runtime_preproduction;
-- CRUD draft/section/profile memerlukan ownership check pada setiap operasi server.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public."Invitation", public."CoupleProfile", public."InvitationSection"
  TO menujuakad_runtime_preproduction;
-- QRIS TEST request/review; tidak membutuhkan DELETE atau akses model komersial.
GRANT SELECT, INSERT, UPDATE ON TABLE public."PaymentTestRequest" TO menujuakad_runtime_preproduction;
COMMIT;
