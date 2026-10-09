"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function useWorkspaceMutation() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  async function mutate(
    path: string,
    method: "POST" | "PATCH" | "DELETE",
    data: unknown,
    redirectTo?: string,
  ) {
    setPending(true);
    setMessage("");
    setFailed(false);
    try {
      const response = await fetch(path, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = response.status === 204 ? {} : await response.json();
      if (!response.ok) throw new Error(result.message ?? "Penyimpanan gagal.");
      setMessage(method === "DELETE" ? "Draft dihapus." : "Perubahan tersimpan di database.");
      if (redirectTo) router.push(redirectTo);
      else if (method === "POST" && result.invitation?.id)
        router.push(`/dashboard/invitations/${result.invitation.id}/editor`);
      router.refresh();
    } catch (error) {
      setFailed(true);
      setMessage(
        error instanceof Error ? error.message : "Layanan belum tersedia. Silakan coba lagi.",
      );
    } finally {
      setPending(false);
    }
  }
  return { pending, message, failed, mutate };
}
