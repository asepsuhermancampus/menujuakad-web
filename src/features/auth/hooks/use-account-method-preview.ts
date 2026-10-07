"use client";
import { useState } from "react";
export function useAccountMethodPreview() {
  const [message, setMessage] = useState("");
  return {
    message,
    google: () => setMessage("Google belum terhubung. Tidak ada sesi dibuat atau akun ditautkan."),
    recover: () =>
      setMessage(
        "Pemulihan contoh ditinjau lokal. Email tidak dikirim dan metode akun tidak berubah.",
      ),
  };
}
