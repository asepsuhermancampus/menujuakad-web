import { cp } from "node:fs/promises";

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
