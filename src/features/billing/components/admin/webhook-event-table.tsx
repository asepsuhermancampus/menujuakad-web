import type { WebhookPreviewDto } from "@/features/design-preview/data/fixtures";
import { formatExampleTime, webhookStatusLabels } from "../../lib/presentation";
export function WebhookEventTable({
  events,
  selectedId,
  onSelect,
}: {
  events: readonly WebhookPreviewDto[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      className="billing-table-scroll"
      role="region"
      aria-label="Arsip webhook contoh"
      tabIndex={0}
    >
      <table>
        <caption>Arsip event contoh · tanpa stream atau polling</caption>
        <thead>
          <tr>
            {["Event & waktu", "Order", "Status contoh", "Percobaan contoh", "Detail"].map(
              (label) => (
                <th scope="col" key={label}>
                  {label}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr className={event.id === selectedId ? "billing-selected-row" : ""} key={event.id}>
              <th scope="row">
                {event.id}
                <small>{formatExampleTime(event.receivedAt)}</small>
              </th>
              <td>
                {event.orderId}
                <small>{event.eventType}</small>
              </td>
              <td>
                <span className={`badge ${event.status === "FAILED" ? "danger" : ""}`}>
                  {webhookStatusLabels[event.status]}
                </span>
              </td>
              <td>{event.attempts}</td>
              <td>
                <button
                  type="button"
                  className="button secondary"
                  aria-pressed={event.id === selectedId}
                  aria-label={`Inspeksi ${event.id}`}
                  onClick={() => onSelect(event.id)}
                >
                  Inspeksi
                </button>
              </td>
            </tr>
          ))}
          {events.length === 0 && (
            <tr>
              <td colSpan={5}>Tidak ada event contoh yang cocok. Ubah atau reset filter.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
