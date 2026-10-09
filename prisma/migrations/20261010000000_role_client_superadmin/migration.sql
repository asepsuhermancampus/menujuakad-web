-- Menyederhanakan UserRole menjadi CLIENT + SUPERADMIN.
-- CUSTOMER dan CLIENT digabung menjadi CLIENT; VENDOR dihapus karena tidak dipakai.
-- PostgreSQL tidak mendukung ALTER TYPE ... DROP VALUE, sehingga tipe enum dibuat
-- ulang dan kolom dipindahkan. Aditif terhadap data: hanya nilai role yang dipetakan,
-- tanpa menghapus baris atau relasi bisnis.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

-- Kunci tabel agar tidak ada INSERT/UPDATE role yang menyelip di tengah pemetaan.
LOCK TABLE "User" IN SHARE ROW EXCLUSIVE MODE;

-- Preflight: pastikan tidak ada baris yang tidak dapat dipetakan ke role baru.
DO $$
DECLARE unmapped bigint;
BEGIN
  SELECT count(*) INTO unmapped FROM "User" WHERE "role"::text NOT IN ('CUSTOMER','CLIENT','VENDOR','SUPERADMIN');
  IF unmapped > 0 THEN
    RAISE EXCEPTION 'ROLE_PREFLIGHT_CONFLICT: % baris dengan role tak dikenal. Perbaiki manual sebelum migrasi.', unmapped;
  END IF;
END $$;

-- Pindahkan data ke tipe baru lewat kolom sementara bertipe teks.
ALTER TABLE "User" ADD COLUMN "role_new" TEXT;
UPDATE "User" SET "role_new" = CASE
  WHEN "role"::text = 'SUPERADMIN' THEN 'SUPERADMIN'
  ELSE 'CLIENT'
END;

-- Buat tipe enum baru, lalu ganti kolom lama dengan yang bertipe baru.
CREATE TYPE "UserRole_new" AS ENUM ('CLIENT', 'SUPERADMIN');
ALTER TABLE "User" ALTER COLUMN "role_new" TYPE "UserRole_new" USING ("role_new"::"UserRole_new");
ALTER TABLE "User" DROP COLUMN "role";
ALTER TABLE "User" RENAME COLUMN "role_new" TO "role";
ALTER TABLE "User" ALTER COLUMN "role" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CLIENT';

-- Trigger registrasi runtime dirujuk oleh nama tipe lama, jadi dibuat ulang setelah swap.
DROP TRIGGER IF EXISTS "User_runtime_registration_guard" ON "User";
DROP FUNCTION IF EXISTS public.auth_guard_runtime_registration();
DROP TYPE "UserRole";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";

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
