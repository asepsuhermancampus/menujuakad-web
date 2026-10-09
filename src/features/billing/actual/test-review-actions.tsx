"use client";
import { Button } from "@/components/ui/button";
import { useBillingMutation } from "./use-billing-mutation";
export function TestReviewActions({ id }: { id: string }) {
  const mutation = useBillingMutation();
  function review(status: "APPROVED_TEST" | "REJECTED") {
    const wording =
      status === "APPROVED_TEST"
        ? "Setujui pengujian ini? Persetujuan tidak membuktikan pembayaran dan tidak mengaktifkan undangan."
        : "Tolak permintaan uji ini? Keputusan yang sudah disimpan tidak dapat ditimpa.";
    if (window.confirm(wording))
      void mutation.mutate(`/api/admin/payment-tests/${encodeURIComponent(id)}`, "PATCH", {
        status,
      });
  }
  return (
    <div className="stack">
      <div className="actions">
        <Button type="button" disabled={mutation.pending} onClick={() => review("APPROVED_TEST")}>
          Setujui uji
        </Button>
        <Button
          type="button"
          className="button-secondary"
          disabled={mutation.pending}
          onClick={() => review("REJECTED")}
        >
          Tolak uji
        </Button>
      </div>
      {mutation.message && <p role={mutation.failed ? "alert" : "status"}>{mutation.message}</p>}
    </div>
  );
}
