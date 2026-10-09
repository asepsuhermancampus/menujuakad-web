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
END $$;

-- Resolver/login membaca credential; tidak pernah mengubah password/role/status.
GRANT SELECT ON TABLE public."AuthCredential" TO menujuakad_runtime_preproduction;
-- Repository sesi memakai create/find/delete; tidak membutuhkan UPDATE.
GRANT SELECT, INSERT, DELETE ON TABLE public."UserSession" TO menujuakad_runtime_preproduction;
-- Throttle atomik upsert dan decrement; tidak membutuhkan DELETE.
GRANT SELECT, INSERT, UPDATE ON TABLE public."AuthLoginThrottle" TO menujuakad_runtime_preproduction;
-- CRUD draft/section/profile memerlukan ownership check pada setiap operasi server.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public."Invitation", public."CoupleProfile", public."InvitationSection"
  TO menujuakad_runtime_preproduction;
-- QRIS TEST request/review; tidak membutuhkan DELETE atau akses model komersial.
GRANT SELECT, INSERT, UPDATE ON TABLE public."PaymentTestRequest" TO menujuakad_runtime_preproduction;
COMMIT;
