"use client";
import { useState, type FormEvent } from "react";
import { accountFixture } from "@/features/design-preview/data/fixtures";
export function useAccountPreview() {
  const [name, setName] = useState(accountFixture.displayName);
  const [email, setEmail] = useState(accountFixture.email);
  const [tab, setTab] = useState("profile");
  const [message, setMessage] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(
      "Perubahan contoh ditinjau lokal. Profil, kredensial, dan sesi nyata tidak berubah.",
    );
  };
  return {
    name,
    setName,
    email,
    setEmail,
    tab,
    setTab,
    message,
    submit,
    unavailable: () =>
      setMessage(
        "Operasi akun memerlukan layanan autentikasi nyata. Tidak ada perubahan dilakukan.",
      ),
  };
}
