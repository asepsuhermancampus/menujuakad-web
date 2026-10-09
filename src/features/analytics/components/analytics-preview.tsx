"use client";
import { useState } from "react";
import { analyticsFixture as data } from "@/features/design-preview/data/analytics-fixtures";
export function AnalyticsPreview() {
  const [period, setPeriod] = useState("ALL");
  const days = period === "ALL" ? data.daily : data.daily.slice(-3);
  const pageViews = days.reduce((sum, day) => sum + day.pageViews, 0);
  return (
    <section className="business stack">
      <p className="eyebrow">TAMU / ANALITIK CONTOH</p>
      <h1>Analitik & Sirkulasi</h1>
      <p>Snapshot sintetis 1–7 Oktober 2026. Tidak ada pelacakan atau pengiriman event analitik.</p>
      <label>
        Periode contoh
        <select
          aria-label="Periode contoh"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="ALL">1–7 Oktober 2026</option>
          <option value="LAST3">5–7 Oktober 2026</option>
        </select>
      </label>
      <div className="grid-three">
        <article className="card">
          <h2>{pageViews}</h2>
          <p>Tampilan halaman periode terpilih</p>
        </article>
        <article className="card">
          <h2>{period === "ALL" ? data.uniqueVisitors : "Tidak tersedia"}</h2>
          <p>Pengunjung unik periode</p>
        </article>
        <article className="card">
          <h2>{data.rsvp.attendanceRatePercent}%</h2>
          <p>Hadir dari seluruh tamu fixture</p>
        </article>
      </div>
      <p className="notice">
        Pengunjung unik harian tidak dijumlah karena orang yang sama dapat kembali. Ringkasan RSVP
        tetap snapshot seluruh tamu, terpisah dari filter kunjungan.
      </p>
      <article className="card">
        <h2>Kunjungan Harian</h2>
        <div className="business-chart">
          {days.map((day) => (
            <div key={day.date}>
              <span>{day.date.slice(5)}</span>
              <meter
                aria-label={`Tampilan halaman ${day.date}`}
                min={0}
                max={100}
                value={day.pageViews}
              />
              <span>{day.pageViews}</span>
            </div>
          ))}
        </div>
      </article>
      <div className="business-table">
        <table>
          <caption>Kunjungan harian contoh</caption>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Tampilan halaman</th>
              <th>Pengunjung unik harian</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day.date}>
                <td>{day.date}</td>
                <td>{day.pageViews}</td>
                <td>{day.uniqueVisitors}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {period === "ALL" && (
        <article className="card">
          <h2>Sumber Kunjungan Contoh</h2>
          {data.sources.map((source) => (
            <p key={source.label}>
              {source.label}: {source.visitors}
            </p>
          ))}
        </article>
      )}
    </section>
  );
}
