-- READ ONLY. Jalankan owner/tooling; hasil hanya hitungan, tidak ada PII/hash.
-- Konflik harus diperbaiki dengan kepemilikan terverifikasi, tanpa merge/hapus akun.
WITH canonical_phone AS (
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
), email_conflicts AS (
  SELECT lower(btrim("email")) FROM "User" WHERE "email" IS NOT NULL
  GROUP BY lower(btrim("email")) HAVING count(*)>1
), phone_conflicts AS (
  SELECT value FROM canonical_phone WHERE value IS NOT NULL GROUP BY value HAVING count(*)>1
)
SELECT
  (SELECT count(*)::int FROM "User" WHERE "email" IS NOT NULL AND btrim("email")='') AS invalid_emails,
  (SELECT count(*)::int FROM email_conflicts) AS email_conflicts,
  (SELECT count(*)::int FROM canonical_phone WHERE value IS NULL OR value !~ '^\+[1-9][0-9]{1,14}$') AS invalid_phones,
  (SELECT count(*)::int FROM phone_conflicts) AS phone_conflicts;
