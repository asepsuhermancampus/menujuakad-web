import type { SourceScreenTuple } from "../../types";

// Snapshot metadata Stitch 2026-10-07; bukan URL/aset runtime.
export const accSources = [
  [
    "fac73b6ed2f346b6a52cb1234a27f5cf",
    "ACC-01",
    "ACC-01 — Akun & Keamanan — Default",
    "/dashboard/profile",
    "Default",
    "DESKTOP",
    "screenshot",
    2560,
    5878,
    true,
  ],
  [
    "c1f6fe8a7010482fa053e30ba9cd9ea4",
    "ACC-02",
    "ACC-02 — Notifikasi — Default",
    "/dashboard/notifications",
    "Default",
    "DESKTOP",
    "screenshot",
    2560,
    3736,
    false,
  ],
] as const satisfies readonly SourceScreenTuple[];
