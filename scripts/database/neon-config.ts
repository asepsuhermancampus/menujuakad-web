type NeonSetupConfig = { runtimeUrl: string; migrationUrl: string };

function parseUrl(value: string | undefined, name: string): URL {
  if (!value) throw new Error(`${name} belum diisi.`);
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} bukan URL PostgreSQL yang valid.`);
  }
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !url.hostname.endsWith(".neon.tech") ||
    !url.username ||
    !url.password ||
    url.pathname.length < 2 ||
    !["require", "verify-full"].includes(url.searchParams.get("sslmode") || "")
  ) {
    throw new Error(`${name} harus memakai host Neon, database, kredensial dan SSL wajib.`);
  }
  return url;
}

/** Hanya CLI persiapan; tidak mengubah konfigurasi atau sesi aplikasi. */
export function getNeonSetupConfig(env: Record<string, string | undefined>): NeonSetupConfig {
  const runtime = parseUrl(env.DATABASE_URL, "DATABASE_URL");
  const direct = parseUrl(env.DIRECT_URL, "DIRECT_URL");
  if (!runtime.hostname.split(".")[0].endsWith("-pooler")) {
    throw new Error("DATABASE_URL harus memakai koneksi pooled.");
  }
  if (direct.hostname.split(".")[0].endsWith("-pooler")) {
    throw new Error("DIRECT_URL harus memakai koneksi direct.");
  }
  if (
    runtime.hostname.replace(/-pooler\./, ".") !== direct.hostname ||
    runtime.pathname !== direct.pathname
  ) {
    throw new Error(
      "DATABASE_URL dan DIRECT_URL harus menunjuk endpoint/branch serta database yang sama.",
    );
  }
  return { runtimeUrl: env.DATABASE_URL!, migrationUrl: env.DIRECT_URL! };
}
