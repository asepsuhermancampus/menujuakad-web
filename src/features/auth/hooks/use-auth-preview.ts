"use client";
import { useState, type FormEvent } from "react";
import type { AuthMode } from "../config/auth-copy";
export function useAuthPreview(mode: AuthMode) {
  const [message, setMessage] = useState("");
  const [show, setShow] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (mode === "reset-password" && data.get("password") !== data.get("confirmation")) {
      setMessage("Konfirmasi kata sandi belum sama.");
      return;
    }
    setMessage(
      "Validasi lokal selesai. Layanan akun belum terhubung; tidak ada data yang dikirim.",
    );
  };
  return {
    message,
    show,
    setShow,
    submit,
    google: () => setMessage("Login Google belum tersedia pada pratinjau."),
  };
}
