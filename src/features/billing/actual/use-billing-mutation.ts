"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
export function useBillingMutation() {
  const router = useRouter();
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  async function mutate(path: string, method: "POST" | "PATCH", input: unknown) {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setMessage("");
    setFailed(false);
    try {
      const response = await fetch(path, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          typeof result.message === "string" ? result.message : "Permintaan uji gagal disimpan.",
        );
      setMessage(
        method === "POST"
          ? "Permintaan uji tersimpan."
          : "Keputusan review uji tersimpan. Tidak ada aktivasi undangan.",
      );
      if (method === "POST" && typeof result.request?.id === "string")
        router.push(`/dashboard/billing/checkout/${encodeURIComponent(result.request.id)}`);
      router.refresh();
    } catch (error) {
      setFailed(true);
      setMessage(
        error instanceof Error ? error.message : "Layanan pengujian belum tersedia. Coba lagi.",
      );
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  return { pending, message, failed, mutate };
}
