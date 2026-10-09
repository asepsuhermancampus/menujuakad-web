"use client";
import { useState } from "react";
import { webhooksFixture, type WebhookPreviewDto } from "@/features/design-preview/data/fixtures";
import {
  filterWebhooks,
  paginate,
  webhookMetrics,
  webhookStatusLabels,
} from "../../lib/presentation";
import { MonitoringControls, MonitoringMetrics, MonitoringPagination } from "./monitoring-controls";
import { WebhookEventTable } from "./webhook-event-table";
import { WebhookDetailPanel } from "./webhook-detail-panel";
export function AdminWebhooksPreview() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<WebhookPreviewDto["status"] | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | undefined>(webhooksFixture[0]?.id);
  const [message, setMessage] = useState("");
  const metrics = webhookMetrics(webhooksFixture);
  const results = paginate(filterWebhooks(webhooksFixture, status, query), page, 2);
  const selected = results.rows.find((event) => event.id === selectedId);
  function simulateRetry() {
    if (selected)
      setMessage(
        `Simulasi retry ${selected.id}: tidak menghubungi provider. Status ${webhookStatusLabels[selected.status]} dan ${selected.attempts} percobaan contoh tetap; entitlement tidak diterbitkan.`,
      );
  }
  return (
    <div className="billing stack" data-billing="admin-webhooks">
      <header>
        <p className="billing-eyebrow">Admin / Keuangan & transaksi / Contoh</p>
        <h1>Rekonsiliasi Webhook & Inspeksi Log Event</h1>
        <p>Data sintetis tanpa signature, raw payload, kredensial, atau koneksi gateway.</p>
        <div className="actions">
          <button
            type="button"
            className="button secondary"
            onClick={() =>
              setMessage(
                "Contoh uji koneksi. Tidak ada ping, request jaringan atau provider tersambung.",
              )
            }
          >
            Tinjau uji koneksi
          </button>
          <button type="button" className="button" disabled={!selected} onClick={simulateRetry}>
            Tinjau retry event terpilih
          </button>
        </div>
      </header>
      <MonitoringMetrics
        items={[
          { label: "Total event contoh", value: metrics.total },
          { label: "Diproses (contoh)", value: metrics.processed },
          { label: "Duplikat (contoh)", value: metrics.duplicate },
          { label: "Gagal (contoh)", value: metrics.failed },
        ]}
      />
      <MonitoringControls
        label="event"
        query={query}
        onQuery={(value) => {
          setQuery(value);
          setPage(1);
          setSelectedId(undefined);
        }}
        status={status}
        onStatus={(value) => {
          setStatus(value as WebhookPreviewDto["status"] | "ALL");
          setPage(1);
          setSelectedId(undefined);
        }}
        options={Object.entries(webhookStatusLabels).map(([value, label]) => ({ value, label }))}
        onReset={() => {
          setQuery("");
          setStatus("ALL");
          setPage(1);
          setSelectedId(webhooksFixture[0]?.id);
        }}
      />
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      <div className="billing-webhook-columns">
        <section className="billing-panel billing-table-panel">
          <WebhookEventTable
            events={results.rows}
            selectedId={selected?.id}
            onSelect={setSelectedId}
          />
          <MonitoringPagination
            {...results}
            onPage={(value) => {
              setPage(value);
              setSelectedId(undefined);
            }}
          />
        </section>
        <WebhookDetailPanel event={selected} onRetry={simulateRetry} />
      </div>
    </div>
  );
}
