import type { SourceScreenTuple } from "../../types";

/* Snapshot metadata Stitch 2026-10-10 (tema Horizon Modern Style).
 * Hanya metadata build-time: tanpa URL aset, path lokal, atau data provider. */
export const dsSources = [
  [
    "2e2fbdb9fdbc4d55b2872cf9ba778967",
    "DS-01",
    "DS-01 — Component Sheet & Design Tokens Guide",
    "referensi internal",
    "Default",
    "DESKTOP",
    "screenshot",
    2560,
    13458,
    true,
  ],
  [
    "d832f5ee715640489298bdd44ad72178",
    "DS-02",
    "DS-02 — Spesifikasi Hand-off & Token Developer — Horizon",
    "referensi internal",
    "Default",
    "DESKTOP",
    "screenshot",
    2560,
    9854,
    false,
  ],
] as const satisfies readonly SourceScreenTuple[];
