import { getNeonSetupConfig } from "./neon-config";

export const AUTH_SEED_DIRECTORY = "/tmp/menujuakad-auth-preprod-20261008";

/** Guard sebelum koneksi, pembuatan manifest, atau write database. */
export function getAuthSeedConfig(env: Record<string, string | undefined>) {
  if (
    env.NODE_ENV === "production" ||
    env.SEED_ENVIRONMENT !== "preproduction" ||
    env.SEED_CONFIRMATION !== "menujuakad-preproduction:11-dummy-accounts"
  ) {
    throw new Error("Seed auth memerlukan opt-in eksplisit preproduction; production ditolak.");
  }
  const config = getNeonSetupConfig(env);
  for (const value of [config.runtimeUrl, config.migrationUrl]) {
    const url = new URL(value);
    if (
      new Set(url.searchParams.keys()).size !== [...url.searchParams.keys()].length ||
      url.hash ||
      [...url.searchParams.keys()].some((key) => !["sslmode", "channel_binding"].includes(key))
    ) {
      throw new Error("Parameter URL seed tidak diizinkan mengganti target/kredensial koneksi.");
    }
  }
  if (decodeURIComponent(new URL(config.migrationUrl).pathname) !== "/menujuakad-preproduction") {
    throw new Error("Seed auth hanya untuk database menujuakad-preproduction.");
  }
  return { ...config, directory: AUTH_SEED_DIRECTORY };
}
