/** Membungkus migrasi canonical tanpa mengarang riwayat _prisma_migrations. */
export function makeFoundationImportSql(migration: string): string {
  return `-- Menuju Akad: impor fondasi hanya ke schema public kosong.
-- Setelah impor, verifikasi lalu baseline dengan Prisma migrate resolve.
BEGIN;
DO $guard$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public')
    OR EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace
               WHERE n.nspname='public' AND t.typtype='e') THEN
    RAISE EXCEPTION 'Impor ditolak: schema public harus kosong';
  END IF;
END;
$guard$;

${migration.trim()}

COMMIT;
`;
}
