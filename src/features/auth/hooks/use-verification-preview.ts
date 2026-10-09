"use client";
import { useState } from "react";
export function useVerificationPreview() {
  const [remaining, setRemaining] = useState(60);
  const [message, setMessage] = useState("");
  const advance = () => setRemaining((previous) => Math.max(0, previous - 30));
  const resend = () => {
    if (remaining > 0) return;
    setRemaining(60);
    setMessage("Permintaan ulang disimulasikan lokal. Email tidak dikirim.");
  };
  return {
    remaining,
    message,
    advance,
    resend,
    inspect: () => setMessage("Kotak masuk contoh tidak dibuka. Email belum dikirim oleh layanan."),
  };
}
