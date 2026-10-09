import { cp, lstat, readdir, realpath, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join, sep } from "node:path";

const buildDirectory = fileURLToPath(new URL("../.next", import.meta.url));
const standaloneDirectory = join(buildDirectory, "standalone");
for (const directory of [buildDirectory, standaloneDirectory]) {
  const metadata = await lstat(directory);
  if (!metadata.isDirectory() || metadata.isSymbolicLink()) {
    throw new Error("Direktori build/standalone harus berupa direktori asli.");
  }
}
const root = await realpath(standaloneDirectory);

async function sanitize(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = join(directory, entry.name);
    // unlink hanya membuang salinan/tautan, tidak mengikuti target berkas sumber.
    if (entry.name === ".env" || entry.name.startsWith(".env.")) {
      if (entry.isDirectory()) throw new Error("Environment berbentuk direktori ditolak.");
      await unlink(target);
    } else if (entry.isSymbolicLink()) {
      const resolved = await realpath(target);
      if (!resolved.startsWith(root + sep)) {
        throw new Error("Symlink keluar standalone ditolak sebelum penyalinan aset.");
      }
    } else if (entry.isDirectory()) {
      await sanitize(target);
    }
  }
}

// Next dapat menyalin .env saat tracing; rahasia runtime disuplai di luar artifact.
// Guard package existing tetap menolak environment/kunci/symlink yang tidak aman.
await sanitize(standaloneDirectory);

// Next.js tidak menyalin public dan static assets ke standalone secara otomatis.
await cp(
  new URL("../public", import.meta.url),
  new URL("../.next/standalone/public", import.meta.url),
  {
    recursive: true,
  },
);
await cp(
  new URL("../.next/static", import.meta.url),
  new URL("../.next/standalone/.next/static", import.meta.url),
  { recursive: true },
);
await sanitize(standaloneDirectory);
