import {
  packagesFixture,
  paymentStatusLabels,
  type OrderPreviewDto,
} from "@/features/design-preview/data/fixtures";
import { formatExampleTime, formatIdr, type CheckoutStatus } from "../../lib/presentation";
export function CheckoutSummary({
  order,
  status,
  onPromo,
}: {
  order: OrderPreviewDto;
  status: CheckoutStatus;
  onPromo: () => void;
}) {
  const plan = packagesFixture.find((p) => p.id === order.packageId);
  return (
    <aside className="stack">
      <section className="billing-panel billing-summary">
        <p className="billing-eyebrow">Lembar tagihan contoh</p>
        <h2>Ringkasan Pesanan</h2>
        <div className="billing-summary-feature">
          <span className="badge">Desain contoh</span>
          <h3>{plan?.name ?? "Paket tidak tersedia"}</h3>
          <p>Undangan contoh · belum dipublikasikan</p>
        </div>
        <dl>
          <div>
            <dt>Kode order</dt>
            <dd>{order.id}</dd>
          </div>
          <div>
            <dt>Dibuat (contoh)</dt>
            <dd>{formatExampleTime(order.createdAt)}</dd>
          </div>
          <div>
            <dt>Batas waktu (contoh)</dt>
            <dd>{formatExampleTime(order.expiresAt)}</dd>
          </div>
          <div>
            <dt>Status contoh</dt>
            <dd>
              {status === "UNAVAILABLE" ? "Waktu tidak tersedia" : paymentStatusLabels[status]}
            </dd>
          </div>
        </dl>
        <div className="billing-promo">
          <p>Punya kode promo?</p>
          <button type="button" className="button secondary" onClick={onPromo}>
            Tinjau kode promo
          </button>
          <small>Validasi promo belum tersedia; nominal tidak berubah.</small>
        </div>
        <div className="billing-total">
          <span>
            {status === "EXPIRED" ? "Total tagihan tertutup (contoh)" : "Total pembayaran (contoh)"}
          </span>
          <strong>{formatIdr(order.amountIdr)}</strong>
        </div>
        <p className="billing-muted">
          Harga contoh dari DTO order. Tidak ada fee, pajak atau diskon yang dihitung oleh preview.
        </p>
      </section>
      <section className="billing-panel">
        <h3>Bantuan pembayaran</h3>
        <p>
          Pembayaran belum aktif. Preview tidak menerima transfer dan tidak menerbitkan entitlement.
        </p>
      </section>
    </aside>
  );
}
