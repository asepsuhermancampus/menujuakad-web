import type { SourceScreenTuple } from "../../types";

// Snapshot metadata Stitch 2026-10-07; bukan URL/aset runtime.
export const errSources = [
  [
    "8e7a57f11275400095caed4dbbf9d908",
    "ERR-404",
    "ERR-404 — Halaman Tidak Ditemukan — Default",
    "not-found boundary",
    "Default",
    "DESKTOP",
    "screenshot",
    2560,
    2822,
    false,
  ],
  [
    "c6fa656ee220450ab292630757074568",
    "ERR-500",
    "ERR-500 — Pemeliharaan Sistem & Status Server — Default",
    "error/maintenance boundary",
    "Default",
    "DESKTOP",
    "screenshot",
    2560,
    2482,
    true,
  ],
] as const satisfies readonly SourceScreenTuple[];
