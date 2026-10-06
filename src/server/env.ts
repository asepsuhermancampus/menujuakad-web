import "server-only";
import { z } from "zod";

const databaseUrlSchema = z.url().refine((url) => {
  const protocol = new URL(url).protocol;
  return protocol === "postgres:" || protocol === "postgresql:";
});

export function getDatabaseUrl(): string | undefined {
  const value = process.env.DATABASE_URL;
  if (!value) return undefined;

  const result = databaseUrlSchema.safeParse(value);
  if (!result.success) throw new Error("Konfigurasi koneksi database tidak valid.");

  return result.data;
}
