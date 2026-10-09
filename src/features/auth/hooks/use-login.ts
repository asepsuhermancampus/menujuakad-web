"use client";
import { useSyncExternalStore, useState, type FormEvent } from "react";
const subscribeHydration = () => () => {};
const clientReady = () => true;
const serverReady = () => false;
export function useLogin(next?: string) {
  const ready = useSyncExternalStore(subscribeHydration, clientReady, serverReady);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.get("email"), password: data.get("password"), next }),
      });
      const result = await response.json();
      if (
        response.ok &&
        result.ok &&
        typeof result.redirectTo === "string" &&
        /^\/(dashboard|admin)(\/[A-Za-z0-9_-]+)*\/?$/.test(result.redirectTo)
      ) {
        window.location.assign(result.redirectTo);
        return;
      }
      setMessage(
        response.status === 401
          ? "Email atau kata sandi tidak sesuai. Coba lagi nanti bila batas percobaan tercapai."
          : "Layanan masuk sementara tidak tersedia. Silakan coba lagi.",
      );
    } catch {
      setMessage("Koneksi gagal. Silakan coba lagi.");
    } finally {
      setPending(false);
    }
  }
  return { ready, pending, message, submit };
}
