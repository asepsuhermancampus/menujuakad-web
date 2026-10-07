import type { SourceScreenTuple } from "../../types";

// Snapshot metadata Stitch 2026-10-07; bukan URL/aset runtime.
export const admSources = [
  [
    "72c3e194242f46c5826dbf91aa321b62",
    "ADM-01",
    "ADM-01 — Monitoring Pembayaran — Default",
    "/admin/payments",
    "Default",
    "DESKTOP",
    "screenshot",
    2560,
    2946,
    true,
  ],
  [
    "2a62b424023f49a2b70102b70be5bbfc",
    "ADM-02",
    "ADM-02 — Rekonsiliasi Webhook — Default",
    "/admin/webhooks",
    "Default",
    "DESKTOP",
    "screenshot",
    2560,
    4094,
    false,
  ],
] as const satisfies readonly SourceScreenTuple[];
