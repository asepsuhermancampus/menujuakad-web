"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ordersFixture,
  paymentStatusLabels,
  type PaymentPreviewStatus,
} from "@/features/design-preview/data/fixtures";
import {
  filterOrders,
  formatExampleTime,
  formatIdr,
  orderMetrics,
  paginate,
} from "../../lib/presentation";
import { MonitoringControls, MonitoringMetrics, MonitoringPagination } from "./monitoring-controls";
import { PaymentOrderTable } from "./payment-order-table";

export function AdminPaymentsPreview() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<PaymentPreviewStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const metrics = orderMetrics(ordersFixture);
  const results = paginate(filterOrders(ordersFixture, status, query), page, 2);
  const selected = ordersFixture.find((order) => order.id === selectedId);
  return (
    <div className="billing stack" data-billing="admin-payments">
      <header>
        <p className="billing-eyebrow">Admin / Keuangan & transaksi / Contoh</p>
        <h1>Monitoring Pembayaran & Status Rekonsiliasi</h1>
        <p>
          Audit komposisi transaksi contoh. Tidak ada settlement, verifikasi provider, atau aktivasi
          paket.
        </p>
        <div className="actions">
          <button
            type="button"
            className="button secondary"
            onClick={() =>
              setMessage(
                "Sinkronisasi hanya contoh tampilan. Tidak menghubungi provider atau mengubah status order.",
              )
            }
          >
            Tinjau sinkronisasi provider
          </button>
          <Link className="button" href="/preview-ui/adm-02">
            Buka log webhook contoh
          </Link>
        </div>
      </header>
      <MonitoringMetrics
        items={[
          { label: "Nilai order dibayar (contoh)", value: formatIdr(metrics.paidAmountIdr) },
          { label: "Dibayar (contoh)", value: metrics.paid },
          { label: "Menunggu (contoh)", value: metrics.pending },
          { label: "Gagal / kedaluwarsa (contoh)", value: metrics.review },
        ]}
      />
      <MonitoringControls
        label="order"
        query={query}
        onQuery={(value) => {
          setQuery(value);
          setPage(1);
          setSelectedId(null);
        }}
        status={status}
        onStatus={(value) => {
          setStatus(value as PaymentPreviewStatus | "ALL");
          setPage(1);
          setSelectedId(null);
        }}
        options={Object.entries(paymentStatusLabels).map(([value, label]) => ({ value, label }))}
        onReset={() => {
          setStatus("ALL");
          setQuery("");
          setPage(1);
          setSelectedId(null);
        }}
      />
      <section className="billing-panel billing-table-panel">
        <PaymentOrderTable orders={results.rows} onSelect={setSelectedId} />
        <MonitoringPagination {...results} onPage={setPage} />
      </section>
      {selected && (
        <section className="billing-panel" aria-label="Detail order contoh">
          <div className="billing-help">
            <h2>Detail order contoh</h2>
            <button type="button" className="button secondary" onClick={() => setSelectedId(null)}>
              Tutup detail
            </button>
          </div>
          <dl>
            <div>
              <dt>Order</dt>
              <dd>{selected.id}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{paymentStatusLabels[selected.status]}</dd>
            </div>
            <div>
              <dt>Nominal contoh</dt>
              <dd>{formatIdr(selected.amountIdr)}</dd>
            </div>
            <div>
              <dt>Waktu dibayar (contoh)</dt>
              <dd>{selected.paidAt ? formatExampleTime(selected.paidAt) : "Tidak tersedia"}</dd>
            </div>
            <div>
              <dt>Provider</dt>
              <dd>Belum terhubung</dd>
            </div>
            <div>
              <dt>Entitlement</dt>
              <dd>Tidak diterbitkan oleh preview</dd>
            </div>
          </dl>
        </section>
      )}
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      <aside className="billing-panel billing-help">
        <div>
          <h2>Koneksi Webhook & Rekonsiliasi</h2>
          <p>Provider belum terhubung. Status PAID sintetis tidak menjadi bukti transaksi.</p>
        </div>
        <Link className="button secondary" href="/preview-ui/adm-02">
          Inspeksi event contoh
        </Link>
      </aside>
    </div>
  );
}
