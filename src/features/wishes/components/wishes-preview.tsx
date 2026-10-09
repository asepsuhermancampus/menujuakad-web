"use client";
import { useState } from "react";
import { wishesFixture } from "@/features/design-preview/data/wishes-fixtures";
export function WishesPreview() {
  const [wishes, setWishes] = useState([...wishesFixture]);
  const [filter, setFilter] = useState("ALL");
  const [message, setMessage] = useState("");
  const visible = wishes.filter((wish) => wish.status === "VISIBLE").length;
  return (
    <section className="business stack">
      <p className="eyebrow">TAMU / UCAPAN CONTOH</p>
      <h1>Buku Doa & Ucapan</h1>
      <p>
        {visible} ucapan terlihat · {wishes.length - visible} disembunyikan. Moderasi hanya di
        memori browser.
      </p>
      <label>
        Filter ucapan
        <select
          aria-label="Filter ucapan"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="ALL">Semua ucapan</option>
          <option value="VISIBLE">Terlihat</option>
          <option value="HIDDEN">Disembunyikan</option>
        </select>
      </label>
      {wishes
        .filter((wish) => filter === "ALL" || wish.status === filter)
        .map((wish) => (
          <article className="card" key={wish.id}>
            <h2>{wish.guestLabel}</h2>
            <p>{wish.message}</p>
            <p className="badge">{wish.status === "VISIBLE" ? "Terlihat" : "Disembunyikan"}</p>
            <button
              type="button"
              className="button secondary"
              onClick={() => {
                setWishes(
                  wishes.map((item) =>
                    item.id === wish.id
                      ? { ...item, status: item.status === "VISIBLE" ? "HIDDEN" : "VISIBLE" }
                      : item,
                  ),
                );
                setMessage(
                  "Moderasi contoh berubah lokal. Tidak disimpan atau mengirim notifikasi.",
                );
              }}
            >
              {wish.status === "VISIBLE" ? "Sembunyikan" : "Tampilkan"} {wish.guestLabel}
            </button>
          </article>
        ))}
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
