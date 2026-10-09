-- Additive pada identitas dan sesi. Tidak menghapus/merge User atau relasi bisnis.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
-- Cegah identitas baru menyelip di antara pemeriksaan konflik dan normalisasi.
LOCK TABLE "User" IN SHARE ROW EXCLUSIVE MODE;

DO $$
DECLARE invalid_emails bigint; duplicate_emails bigint; invalid_phones bigint; duplicate_phones bigint;
BEGIN
  SELECT count(*) INTO invalid_emails FROM "User" WHERE "email" IS NOT NULL AND btrim("email")='';
  SELECT count(*) INTO duplicate_emails FROM (
    SELECT lower(btrim("email")) FROM "User" WHERE "email" IS NOT NULL
    GROUP BY lower(btrim("email")) HAVING count(*)>1
  ) conflicts;

  WITH canonical AS (
    SELECT CASE
      WHEN "phone" !~ '^[+0-9() .-]+$' THEN NULL
      WHEN regexp_replace("phone", '[() .-]', '', 'g') LIKE '+%'
        THEN regexp_replace("phone", '[() .-]', '', 'g')
      WHEN regexp_replace("phone", '[() .-]', '', 'g') LIKE '0%'
        THEN '+62' || substring(regexp_replace("phone", '[() .-]', '', 'g') FROM 2)
      WHEN regexp_replace("phone", '[() .-]', '', 'g') LIKE '62%'
        THEN '+' || regexp_replace("phone", '[() .-]', '', 'g')
      ELSE NULL END AS value
    FROM "User" WHERE "phone" IS NOT NULL
  ) SELECT count(*) FILTER (WHERE value IS NULL OR value !~ '^\+[1-9][0-9]{1,14}$'),
    (SELECT count(*) FROM (SELECT value FROM canonical WHERE value IS NOT NULL GROUP BY value HAVING count(*)>1) conflicts)
    INTO invalid_phones, duplicate_phones FROM canonical;

  IF invalid_emails>0 OR duplicate_emails>0 OR invalid_phones>0 OR duplicate_phones>0 THEN
    -- Hanya hitungan, tidak membocorkan email/telepon/account ID pada log migrasi.
    RAISE EXCEPTION 'AUTH_PREFLIGHT_CONFLICT: invalid_emails=%, email_conflicts=%, invalid_phones=%, phone_conflicts=%. Perbaiki manual; akun tidak dihapus/merge.',
      invalid_emails, duplicate_emails, invalid_phones, duplicate_phones;
  END IF;
END $$;

UPDATE "User" SET "email"=lower(btrim("email")) WHERE "email" IS NOT NULL AND "email" IS DISTINCT FROM lower(btrim("email"));
UPDATE "User" SET "phone"=CASE
  WHEN regexp_replace("phone", '[() .-]', '', 'g') LIKE '+%' THEN regexp_replace("phone", '[() .-]', '', 'g')
  WHEN regexp_replace("phone", '[() .-]', '', 'g') LIKE '0%' THEN '+62' || substring(regexp_replace("phone", '[() .-]', '', 'g') FROM 2)
  ELSE '+' || regexp_replace("phone", '[() .-]', '', 'g') END WHERE "phone" IS NOT NULL;

ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CLIENT';
ALTER TABLE "User" ADD COLUMN "phoneVerifiedAt" TIMESTAMPTZ(3);
ALTER TABLE "User" ADD CONSTRAINT "User_email_canonical_check" CHECK ("email" IS NULL OR ("email"=lower(btrim("email")) AND "email"<>''));
ALTER TABLE "User" ADD CONSTRAINT "User_phone_e164_check" CHECK ("phone" IS NULL OR "phone" ~ '^\+[1-9][0-9]{1,14}$');
ALTER TABLE "User" ADD CONSTRAINT "User_phone_verified_check" CHECK ("phoneVerifiedAt" IS NULL OR "phone" IS NOT NULL);
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

ALTER TABLE "UserSession"
  ADD COLUMN "reauthenticatedAt" TIMESTAMPTZ(3),
  ADD COLUMN "lastSeenAt" TIMESTAMPTZ(3),
  ADD COLUMN "revokedAt" TIMESTAMPTZ(3),
  ADD COLUMN "userAgent" VARCHAR(512),
  ADD COLUMN "ipHash" TEXT;

CREATE TABLE "AuthAccount" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "email" TEXT,
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "AuthAccount_identity_check" CHECK ("provider"<>'' AND "providerAccountId"<>''),
  CONSTRAINT "AuthAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "AuthAccount_provider_providerAccountId_key" ON "AuthAccount"("provider","providerAccountId");
CREATE UNIQUE INDEX "AuthAccount_userId_provider_key" ON "AuthAccount"("userId","provider");

CREATE TABLE "AuthVerificationToken" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "tokenHash" TEXT NOT NULL,
  "purpose" TEXT NOT NULL,
  "userId" TEXT,
  "identifier" TEXT,
  "payload" JSONB,
  "expiresAt" TIMESTAMPTZ(3) NOT NULL,
  "consumedAt" TIMESTAMPTZ(3),
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuthVerificationToken_attempts_check" CHECK ("attempts">=0),
  CONSTRAINT "AuthVerificationToken_identity_check" CHECK ("tokenHash"<>'' AND "purpose"<>''),
  CONSTRAINT "AuthVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "AuthVerificationToken_tokenHash_key" ON "AuthVerificationToken"("tokenHash");
CREATE INDEX "AuthVerificationToken_userId_purpose_idx" ON "AuthVerificationToken"("userId","purpose");
CREATE INDEX "AuthVerificationToken_identifier_purpose_idx" ON "AuthVerificationToken"("identifier","purpose");
CREATE INDEX "AuthVerificationToken_expiresAt_idx" ON "AuthVerificationToken"("expiresAt");
-- Prisma menyertakan default role/status pada INSERT, sehingga hak INSERT kolom
-- perlu disertai guard. Owner tetap dapat provisioning akun administratif.
CREATE FUNCTION public.auth_guard_runtime_registration() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF current_user = 'menujuakad_runtime_preproduction'
    AND (NEW."role" <> 'CLIENT' OR NEW."status" <> 'ACTIVE') THEN
    RAISE EXCEPTION 'AUTH_REGISTRATION_ROLE_FORBIDDEN' USING ERRCODE='42501';
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.auth_guard_runtime_registration() FROM PUBLIC;
CREATE TRIGGER "User_runtime_registration_guard"
  BEFORE INSERT ON "User" FOR EACH ROW
  EXECUTE FUNCTION public.auth_guard_runtime_registration();
COMMIT;
