"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="id">
      <body>
        <main className="status-page container">
          <h1>Menuju Akad belum dapat dibuka.</h1>
          <p>Silakan coba kembali beberapa saat lagi.</p>
          <Button onClick={reset}>Coba lagi</Button>
        </main>
      </body>
    </html>
  );
}
