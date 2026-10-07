"use client";
import Link from "next/link";
import { useState } from "react";
export function ErrorPreview({ code }: { code: "ERR-404" | "ERR-500" }) {
  const [message, setMessage] = useState("");
  const missing = code === "ERR-404";
  return (
    <main id="main" className="container status-page">
      <p className="status-number">{missing ? "404" : "500"}</p>
      <p className="eyebrow">MENUJU AKAD · HALAMAN CONTOH</p>
      <h1>{missing ? "Sepertinya Alamat Ini Belum Tersedia" : "Ada Kendala di Perjalanan Ini"}</h1>
      <p>
        {missing
          ? "Periksa tautan yang Anda buka atau kembali ke beranda."
          : "Coba kembali beberapa saat lagi. Ini adalah state error sintetis."}
      </p>
      <div className="actions status-actions">
        <Link className="button" href="/">
          Kembali ke Beranda
        </Link>
        {!missing && (
          <button
            className="button secondary"
            onClick={() => setMessage("Simulasi muat ulang selesai; tidak menghubungi layanan.")}
          >
            Coba Lagi
          </button>
        )}
      </div>
      {message && <p role="status">{message}</p>}
    </main>
  );
}
