import type { WebhookPreviewDto } from "@/features/design-preview/data/fixtures";
import { formatExampleTime, webhookStatusLabels } from "../../lib/presentation";
export function WebhookDetailPanel({
  event,
  onRetry,
}: {
  event?: WebhookPreviewDto;
  onRetry: () => void;
}) {
  if (!event)
    return (
      <aside className="billing-panel">
        <h2>Detail event contoh</h2>
        <p>Pilih event pada hasil yang terlihat untuk inspeksi data sintetis.</p>
      </aside>
    );
  // Explicit field whitelist: never stringify provider payloads or headers.
  const safeDetail = {
    id: event.id,
    orderId: event.orderId,
    eventType: event.eventType,
    status: event.status,
    attempts: event.attempts,
    receivedAt: event.receivedAt,
    summary: event.summary,
  };
  return (
    <aside className="billing-panel billing-webhook-detail" aria-label="Detail event contoh">
      <p className="billing-eyebrow">Panel inspeksi contoh</p>
      <h2>Detail event contoh</h2>
      <h3>{event.id}</h3>
      <dl>
        <div>
          <dt>Status contoh</dt>
          <dd>{webhookStatusLabels[event.status]}</dd>
        </div>
        <div>
          <dt>Diterima (contoh)</dt>
          <dd>{formatExampleTime(event.receivedAt)}</dd>
        </div>
        <div>
          <dt>Percobaan contoh</dt>
          <dd>{event.attempts}</dd>
        </div>
      </dl>
      <p className="billing-muted">Ringkasan aman · bukan raw payload provider</p>
      <pre aria-label="Ringkasan event sintetis">{JSON.stringify(safeDetail, null, 2)}</pre>
      <h3>Timeline ilustrasi</h3>
      <ol className="billing-timeline">
        <li>Snapshot event sintetis ditampilkan.</li>
        <li>Status fixture: {webhookStatusLabels[event.status]}.</li>
        <li>
          {event.status === "DUPLICATE"
            ? "Duplikat tidak menambah order dibayar atau entitlement."
            : "Tidak ada verifikasi provider atau mutasi database."}
        </li>
        <li>Entitlement tidak diterbitkan oleh preview.</li>
      </ol>
      <button type="button" className="button" onClick={onRetry}>
        Simulasikan tampilan retry
      </button>
      <p className="billing-muted">
        Retry menampilkan pesan lokal; status dan jumlah percobaan tetap.
      </p>
    </aside>
  );
}
