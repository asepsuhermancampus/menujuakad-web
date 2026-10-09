import { getNeonSetupConfig } from "./neon-config";
export const CUSTOMER_JOURNEY_DIRECTORY = "/tmp/menujuakad-customer-journeys-preproduction";
/** Dijalankan sebelum manifest/koneksi. Tidak menggunakan guard seed lama secara lebih longgar. */
export function getCustomerJourneyConfig(env: Record<string, string | undefined>) {
  if (
    env.NODE_ENV === "production" ||
    env.SEED_ENVIRONMENT !== "preproduction" ||
    env.SEED_CONFIRMATION !== "menujuakad-preproduction:30-customer-journeys"
  )
    throw new Error("Seed customer memerlukan opt-in preproduction; production ditolak.");
  const config = getNeonSetupConfig(env);
  for (const value of [config.runtimeUrl, config.migrationUrl]) {
    const url = new URL(value);
    if (
      decodeURIComponent(url.pathname) !== "/menujuakad-preproduction" ||
      url.hash ||
      new Set(url.searchParams.keys()).size !== [...url.searchParams.keys()].length ||
      [...url.searchParams.keys()].some((key) => !["sslmode", "channel_binding"].includes(key))
    )
      throw new Error("Target atau parameter URL seed tidak diizinkan.");
  }
  return { ...config, directory: CUSTOMER_JOURNEY_DIRECTORY };
}
