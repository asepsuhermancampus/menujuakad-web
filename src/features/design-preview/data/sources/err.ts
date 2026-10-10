import type { SourceScreenTuple } from "../../types";

/* Snapshot metadata Stitch 2026-10-10 (tema Horizon Modern Style).
 * Hanya metadata build-time: tanpa URL aset, path lokal, atau data provider. */
export const errSources = [
  [
    "ec0dd05fe00b42519185ba01e8f4b473#ERR-404",
    "ERR-404",
    "ERR-404 — Halaman Error & Pemeliharaan — Horizon",
    "halaman 404",
    "Default",
    "DESKTOP",
    "screenshot",
    2560,
    3102,
    false,
  ],
  [
    "ec0dd05fe00b42519185ba01e8f4b473#ERR-500",
    "ERR-500",
    "ERR-500 — Halaman Error & Pemeliharaan — Horizon",
    "halaman 500",
    "Default",
    "DESKTOP",
    "screenshot",
    2560,
    3102,
    false,
  ],
] as const satisfies readonly SourceScreenTuple[];
