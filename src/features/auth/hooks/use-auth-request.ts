"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AuthClientError } from "../lib/auth-client";
const subscribe = () => () => {};
export function useAuthRequest() {
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const lock = useRef(false);
  const [pending, setPending] = useState(false);
  const [message, updateMessage] = useState("");
  const [failed, setFailed] = useState(false);
  function setMessage(value: string) {
    updateMessage(value);
    setFailed(true);
  }
  function setSuccess(value: string) {
    updateMessage(value);
    setFailed(false);
  }
  const [retryUntil, setRetryUntil] = useState(0);
  const [retryRemaining, setRetryRemaining] = useState(0);
  useEffect(() => {
    if (!retryUntil) return;
    const tick = () => setRetryRemaining(Math.max(0, Math.ceil((retryUntil - Date.now()) / 1000)));
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [retryUntil]);
  async function run(task: () => Promise<void>) {
    if (!ready || lock.current || Date.now() < retryUntil) return;
    lock.current = true;
    setPending(true);
    updateMessage("");
    setFailed(false);
    try {
      await task();
    } catch (error) {
      setMessage(
        error instanceof AuthClientError ? error.message : "Koneksi gagal. Silakan coba lagi.",
      );
      if (error instanceof AuthClientError && error.status === 429) {
        setRetryUntil(Date.now() + (error.retryAfter || 60) * 1000);
        setRetryRemaining(error.retryAfter || 60);
      }
    } finally {
      lock.current = false;
      setPending(false);
    }
  }
  return {
    ready,
    pending,
    message:
      retryRemaining > 0
        ? `Terlalu banyak percobaan. Coba lagi dalam ${retryRemaining} detik.`
        : message,
    setMessage,
    setSuccess,
    failed,
    rateLimited: retryRemaining > 0,
    run,
  };
}
