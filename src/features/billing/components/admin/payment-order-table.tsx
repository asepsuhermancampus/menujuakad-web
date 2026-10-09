import {
  packagesFixture,
  paymentStatusLabels,
  type OrderPreviewDto,
} from "@/features/design-preview/data/fixtures";
import { formatExampleTime, formatIdr } from "../../lib/presentation";
export function PaymentOrderTable({
  orders,
  onSelect,
}: {
  orders: readonly OrderPreviewDto[];
  onSelect: (id: string) => void;
}) {
  return (
    <div
      className="billing-table-scroll"
      role="region"
      aria-label="Order pembayaran contoh"
      tabIndex={0}
    >
      <table>
        <caption className="sr-only">Daftar order sintetis tanpa aktivasi entitlement</caption>
        <thead>
          <tr>
            {[
              "Order & waktu contoh",
              "Undangan",
              "Paket",
              "Nominal IDR",
              "Status contoh",
              "Entitlement",
              "Tindakan",
            ].map((label) => (
              <th scope="col" key={label}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <th scope="row">
                {order.id}
                <small>{formatExampleTime(order.createdAt)}</small>
              </th>
              <td>{order.invitationId}</td>
              <td>
                {packagesFixture.find((p) => p.id === order.packageId)?.name ?? "Tidak tersedia"}
              </td>
              <td>{formatIdr(order.amountIdr)}</td>
              <td>
                <span className={`badge ${order.status === "FAILED" ? "danger" : ""}`}>
                  {paymentStatusLabels[order.status]}
                </span>
              </td>
              <td>Tidak diterbitkan oleh preview</td>
              <td>
                <button
                  type="button"
                  className="button secondary"
                  aria-label={`Detail ${order.id}`}
                  onClick={() => onSelect(order.id)}
                >
                  Detail & log
                </button>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={7}>Tidak ada order contoh yang cocok. Ubah atau reset filter.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
