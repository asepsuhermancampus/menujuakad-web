-- Read-only, tanpa kolom password/hash/PII; jalankan melalui role tooling.
SELECT current_database()::text AS database, current_user::text AS tooling_role;

SELECT rolname::text AS runtime_role, rolsuper, rolcreatedb, rolcreaterole,
  rolreplication, rolbypassrls, rolinherit, rolcanlogin
FROM pg_roles WHERE rolname='menujuakad_runtime_preproduction';

SELECT pg_get_userbyid(member)::text AS member_role,
  pg_get_userbyid(roleid)::text AS parent_role, admin_option
FROM pg_auth_members
WHERE member=(SELECT oid FROM pg_roles WHERE rolname='menujuakad_runtime_preproduction');

SELECT nspname::text AS schema_owned
FROM pg_namespace
WHERE nspowner=(SELECT oid FROM pg_roles WHERE rolname='menujuakad_runtime_preproduction');

SELECT n.nspname::text AS schema_name, c.relname::text AS object_owned
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE c.relowner=(SELECT oid FROM pg_roles WHERE rolname='menujuakad_runtime_preproduction');

SELECT has_schema_privilege('menujuakad_runtime_preproduction','public','USAGE') AS public_usage,
  has_schema_privilege('menujuakad_runtime_preproduction','public','CREATE') AS public_create;
