import { randomBytes } from "node:crypto";
import { constants } from "node:fs";
import { open, unlink } from "node:fs/promises";
import { join } from "node:path";
import { ensurePrivateDirectory } from "./auth-seed-manifest";
import { customerJourneys } from "./customer-journey-fixtures";
export type CustomerJourneyManifest = {
  version: 1;
  environment: "preproduction";
  createdAt: string;
  accounts: { userId: string; email: string; password: string }[];
};
export function validateCustomerJourneyManifest(value: unknown): CustomerJourneyManifest {
  const manifest = value as CustomerJourneyManifest | null;
  if (
    !manifest ||
    manifest.version !== 1 ||
    manifest.environment !== "preproduction" ||
    typeof manifest.createdAt !== "string" ||
    !Number.isFinite(Date.parse(manifest.createdAt)) ||
    new Date(manifest.createdAt).toISOString() !== manifest.createdAt ||
    !Array.isArray(manifest.accounts) ||
    manifest.accounts.length !== 30
  )
    throw new Error("Manifest customer tidak valid.");
  const passwords = new Set<string>();
  for (const [index, account] of manifest.accounts.entries()) {
    const expected = customerJourneys[index];
    if (
      !account ||
      account.email !== expected.email ||
      account.userId !== expected.userId ||
      typeof account.password !== "string" ||
      !/^[A-Za-z0-9_-]{32,128}$/.test(account.password) ||
      passwords.has(account.password)
    )
      throw new Error("Manifest customer tidak valid.");
    passwords.add(account.password);
  }
  return manifest;
}
async function loadOrCreate(path: string): Promise<CustomerJourneyManifest> {
  try {
    const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    try {
      const info = await file.stat();
      if (
        !info.isFile() ||
        info.nlink !== 1 ||
        (info.mode & 0o777) !== 0o600 ||
        info.size > 32768 ||
        (process.getuid && info.uid !== process.getuid())
      )
        throw new Error("Manifest wajib file privat0600 milik proses tanpa hardlink.");
      let value: unknown;
      try {
        value = JSON.parse(await file.readFile("utf8"));
      } catch {
        throw new Error("Manifest customer tidak valid.");
      }
      return validateCustomerJourneyManifest(value);
    } finally {
      await file.close();
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const manifest: CustomerJourneyManifest = {
    version: 1,
    environment: "preproduction",
    createdAt: new Date().toISOString(),
    accounts: customerJourneys.map(({ userId, email }) => ({
      userId,
      email,
      password: randomBytes(24).toString("base64url"),
    })),
  };
  const file = await open(
    path,
    constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | constants.O_NOFOLLOW,
    0o600,
  );
  try {
    await file.writeFile(JSON.stringify(manifest, null, 2) + "\n", "utf8");
    await file.sync();
  } finally {
    await file.close();
  }
  const directory = await open(join(path, ".."), constants.O_RDONLY);
  try {
    await directory.sync();
  } finally {
    await directory.close();
  }
  return manifest;
}
/** Persist dulu, lalu transaksi: rollback DB tetap memakai password yang sama saat retry. */
export async function withCustomerJourneyManifest<T>(
  directory: string,
  operation: (manifest: CustomerJourneyManifest) => Promise<T>,
): Promise<T> {
  const target = await ensurePrivateDirectory(directory);
  const lockPath = join(target, ".seed.lock");
  let lock;
  try {
    lock = await open(
      lockPath,
      constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | constants.O_NOFOLLOW,
      0o600,
    );
  } catch {
    throw new Error("Manifest sedang dipakai; inspeksi lock secara privat.");
  }
  try {
    return await operation(await loadOrCreate(join(target, "credentials.json")));
  } finally {
    await lock.close();
    await unlink(lockPath);
  }
}

/** Waktu pembuatan sintetis cohort mendahului lastLoginAt dan juga mengikat instance manifest. */
export function customerJourneyCreatedAt(manifest: CustomerJourneyManifest) {
  return new Date(Date.parse(manifest.createdAt) - 60 * 86400000).toISOString();
}
