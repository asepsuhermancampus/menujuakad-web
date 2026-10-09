import { randomBytes, randomUUID } from "node:crypto";
import { constants } from "node:fs";
import { lstat, mkdir, open, realpath, unlink } from "node:fs/promises";
import { isAbsolute, join, relative, resolve } from "node:path";

export type SeedAccount = {
  email: string;
  role: "SUPERADMIN" | "CLIENT";
  password: string;
  userId: string;
};
export type AuthSeedManifest = {
  environment: "preproduction";
  accounts: SeedAccount[];
  createdAt: string;
};

const expectedAccounts = [
  { email: "admin@menujuakad.test", role: "SUPERADMIN" as const },
  ...Array.from({ length: 10 }, (_, index) => ({
    email: `customer${String(index + 1).padStart(2, "0")}@menujuakad.test`,
    role: "CLIENT" as const,
  })),
];

function newManifest(): AuthSeedManifest {
  return {
    environment: "preproduction",
    createdAt: new Date().toISOString(),
    accounts: expectedAccounts.map((account) => ({
      ...account,
      password: randomBytes(24).toString("base64url"),
      userId: randomUUID(),
    })),
  };
}

export function validateAuthSeedManifest(value: unknown): AuthSeedManifest {
  const manifest = value as AuthSeedManifest | null;
  if (
    !manifest ||
    manifest.environment !== "preproduction" ||
    typeof manifest.createdAt !== "string" ||
    !Number.isFinite(Date.parse(manifest.createdAt)) ||
    !Array.isArray(manifest.accounts) ||
    manifest.accounts.length !== expectedAccounts.length
  )
    throw new Error("Manifest credential tidak valid.");
  const passwords = new Set<string>();
  const ids = new Set<string>();
  for (const [index, account] of manifest.accounts.entries()) {
    const expected = expectedAccounts[index];
    if (
      !account ||
      account.email !== expected.email ||
      account.role !== expected.role ||
      typeof account.password !== "string" ||
      !/^[A-Za-z0-9_-]{20,128}$/.test(account.password) ||
      typeof account.userId !== "string" ||
      !/^[a-f0-9-]{36}$/.test(account.userId) ||
      passwords.has(account.password) ||
      ids.has(account.userId)
    )
      throw new Error("Manifest credential tidak valid.");
    passwords.add(account.password);
    ids.add(account.userId);
  }
  return manifest;
}

export async function ensurePrivateDirectory(directory: string) {
  const target = resolve(directory);
  const repository = await realpath(process.cwd());
  const rel = relative(repository, target);
  if (!rel || (!rel.startsWith("..") && !isAbsolute(rel))) {
    throw new Error("Manifest credential wajib di luar repository.");
  }
  // Parent nyata menolak jalur melalui symlink sebelum membuat file rahasia.
  const parent = resolve(target, "..");
  if ((await realpath(parent)) !== parent) throw new Error("Parent manifest harus path nyata.");
  await mkdir(target, { mode: 0o700 }).catch((error) => {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST")
      throw new Error("Direktori manifest gagal dibuat.");
  });
  const info = await lstat(target);
  if (
    !info.isDirectory() ||
    info.isSymbolicLink() ||
    (info.mode & 0o777) !== 0o700 ||
    (process.getuid && info.uid !== process.getuid())
  ) {
    throw new Error("Direktori manifest harus milik proses dengan mode0700, tanpa symlink.");
  }
  return target;
}

async function loadOrCreateManifest(path: string) {
  try {
    const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
    try {
      const info = await file.stat();
      if (
        !info.isFile() ||
        info.nlink !== 1 ||
        (info.mode & 0o777) !== 0o600 ||
        info.size > 16384 ||
        (process.getuid && info.uid !== process.getuid())
      ) {
        throw new Error("Manifest credential harus file privat0600, tanpa hardlink.");
      }
      let value: unknown;
      try {
        value = JSON.parse(await file.readFile("utf8"));
      } catch {
        throw new Error("Manifest credential tidak valid.");
      }
      return validateAuthSeedManifest(value);
    } finally {
      await file.close();
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const manifest = newManifest();
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
  // Manifest ditulis sebelum transaksi: kegagalan DB dapat diulang tanpa kehilangan password.
  const folder = await open(resolve(path, ".."), constants.O_RDONLY);
  try {
    await folder.sync();
  } finally {
    await folder.close();
  }
  return manifest;
}

/** Tidak mencetak/mereturn manifest ke CLI; lock menserialisasi proses seed lokal. */
export async function withAuthSeedManifest<T>(
  directory: string,
  operation: (manifest: AuthSeedManifest) => Promise<T>,
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
    throw new Error("Direktori credential sedang dipakai; inspeksi lock sebelum mencoba ulang.");
  }
  try {
    return await operation(await loadOrCreateManifest(join(target, "credentials.json")));
  } finally {
    await lock.close();
    await unlink(lockPath);
  }
}
