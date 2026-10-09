import Link from "next/link";
import type { CustomerAnalyticsDto } from "@/server/analytics/types";
const money = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
export function CustomerAnalyticsView({ data }: { data: CustomerAnalyticsDto }) {
  return (
    <section className="stack">
      <h1>Analitik Akun</h1>
      <p>
        Ringkasan dari database untuk undangan milik Anda dan permintaan pembayaran pengujian
        terkait.
      </p>
      <nav className="actions" aria-label="Periode analitik">
        {(
          [
            ["all", "Semua waktu"],
            ["7d", "7 hari terakhir"],
            ["30d", "30 hari terakhir"],
          ] as const
        ).map(([period, label]) => (
          <Link
            key={period}
            href={`/dashboard/analytics?period=${period}`}
            className="button secondary"
            aria-current={data.period === period ? "page" : undefined}
            style={{ minHeight: 48, minWidth: 48 }}
          >
            {label}
          </Link>
        ))}
      </nav>
      <p>
        Periode berdasarkan waktu pembuatan (createdAt) dalam UTC, kedua batas inklusif:{" "}
        {data.fromUtc ?? "Sejak awal"} sampai {data.toUtc}. Status adalah status terkini record yang
        dibuat dalam periode, bukan jumlah perubahan status.
      </p>
      <div className="grid-two stats">
        <article className="card">
          <h2>Total undangan</h2>
          <strong>{data.invitations.total}</strong>
          <p>Seluruh undangan milik Anda dalam periode.</p>
        </article>
        <article className="card">
          <h2>Undangan draft</h2>
          <strong>{data.invitations.draft}</strong>
          <p>Status DRAFT. Status lain: {data.invitations.other}.</p>
        </article>
      </div>
      {data.invitations.total === 0 && (
        <p className="notice">
          Belum ada undangan yang dibuat dalam periode ini.{" "}
          <Link href="/dashboard/invitations/new">Buat draft undangan</Link> atau pilih periode
          lain.
        </p>
      )}
      <section className="card stack" aria-labelledby="test-summary">
        <h2 id="test-summary">Permintaan Pembayaran Uji</h2>
        <p>
          Total permintaan: {data.paymentTests.total}. Total nominal diajukan:{" "}
          {money(data.paymentTests.amountIdr)}.
        </p>
        <dl>
          <dt>Menunggu review (REQUESTED)</dt>
          <dd>
            {data.paymentTests.byStatus.REQUESTED.count} permintaan ·{" "}
            {money(data.paymentTests.byStatus.REQUESTED.amountIdr)}
          </dd>
          <dt>Disetujui untuk pengujian (APPROVED_TEST)</dt>
          <dd>
            {data.paymentTests.byStatus.APPROVED_TEST.count} permintaan ·{" "}
            {money(data.paymentTests.byStatus.APPROVED_TEST.amountIdr)}
          </dd>
          <dt>Ditolak (REJECTED)</dt>
          <dd>
            {data.paymentTests.byStatus.REJECTED.count} permintaan ·{" "}
            {money(data.paymentTests.byStatus.REJECTED.amountIdr)}
          </dd>
        </dl>
        {data.paymentTests.total === 0 && (
          <p>Belum ada permintaan pembayaran uji yang dibuat dalam periode ini.</p>
        )}
        <p className="notice">
          Nominal adalah nilai permintaan pengujian dalam integer rupiah. Persetujuan uji bukan
          bukti pembayaran bank, pendapatan, atau aktivasi komersial. Mayar belum aktif.
        </p>
        <Link href="/dashboard/billing">Lihat pembayaran pengujian</Link>
      </section>
      <section className="card stack" aria-labelledby="unavailable-metrics">
        <h2 id="unavailable-metrics">Metrik Tamu dan Kunjungan</h2>
        <dl>
          <dt>Tamu dan respons RSVP</dt>
          <dd>Belum tersedia</dd>
          <dt>Tayangan dan pengunjung unik</dt>
          <dd>Belum tersedia</dd>
          <dt>Konversi dan tingkat respons</dt>
          <dd>Belum tersedia</dd>
        </dl>
        <p>
          Model tamu/RSVP publik dan instrumentasi kunjungan belum tersedia. Angka tersebut belum
          diukur.
        </p>
      </section>
    </section>
  );
}
