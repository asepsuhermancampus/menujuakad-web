"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function logout() {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      if (!response.ok) throw new Error();
      router.replace("/login");
      router.refresh();
    } catch {
      setError("Keluar gagal. Silakan coba lagi.");
      setPending(false);
    }
  }
  return (
    <div>
      <Button className="secondary" disabled={pending} onClick={logout}>
        {pending ? "Keluar…" : "Keluar"}
      </Button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
