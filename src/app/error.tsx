"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="status-page container">
      <h1>Halaman belum dapat ditampilkan.</h1>
      <p>
        Coba muat kembali halaman ini. Jika masih terkendala, silakan kembali beberapa saat lagi.
      </p>
      <Button onClick={reset}>Coba lagi</Button>
    </main>
  );
}
