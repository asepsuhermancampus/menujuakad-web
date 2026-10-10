import type { SourceScreenTuple } from "../../types";

/* Snapshot metadata Stitch 2026-10-10 (tema Horizon Modern Style).
 * Hanya metadata build-time: tanpa URL aset, path lokal, atau data provider. */
export const accSources = [
  [
    "fada0faeb7644253abf32fd6736e4cd3",
    "ACC-01",
    "ACC-01 — Akun & Keamanan — Horizon",
    "/account",
    "Default",
    "DESKTOP",
    "screenshot",
    2560,
    3666,
    false,
  ],
  [
    "4a44244391c640d88deb0a9104dcdc56",
    "ACC-02",
    "ACC-02 — Notifikasi — Horizon",
    "/dashboard/notifications",
    "Default",
    "DESKTOP",
    "screenshot",
    2560,
    2590,
    false,
  ],
] as const satisfies readonly SourceScreenTuple[];
