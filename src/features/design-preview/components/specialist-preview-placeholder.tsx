import Link from "next/link";
import { billingFixture, guestsFixture, emptyGuestsFixture } from "../data/fixtures";
import type { PreviewScreen } from "../types";
/** Handoff eksplisit untuk UI billing/business yang dimiliki specialist berikutnya. */
export function SpecialistPreviewPlaceholder({ screen }: { screen: PreviewScreen }) {
  const billing =
    screen.code.startsWith("ADM") || screen.code === "CUS-07" || screen.code === "CUS-08";
  const empty = screen.state.includes("Empty");
  return (
    <section className="stack">
      <p className="eyebrow">DATA CONTOH · HANDOFF DOMAIN</p>
      <h1>{screen.title.split("—")[1]?.trim() || screen.code}</h1>
      <p className="notice">
        Komponen domain khusus sedang disiapkan pada increment berikutnya. Tampilan ini merupakan
        handoff terbatas; bukan fitur akhir atau layanan aktif.
      </p>
      {billing ? (
        <article className="card">
          <h2>Ringkasan Transaksi Contoh</h2>
          <p>{billingFixture.label}</p>
          <p>
            Provider belum terhubung. Tidak ada QRIS, rekening, atau pembayaran yang dapat
            dilakukan.
          </p>
          {screen.code === "CUS-08" && (
            <span className="badge">
              {screen.state === "Expired" ? "Kedaluwarsa (contoh)" : "Menunggu (contoh)"}
            </span>
          )}
          <Link href="/pricing">Tinjau harga contoh →</Link>
        </article>
      ) : (
        <article className="card">
          <h2>Data Tamu Sintetis</h2>
          <p>
            {(empty ? emptyGuestsFixture : guestsFixture).length} tamu contoh. Respons, hadiah, dan
            analitik tidak berasal dari layanan produksi.
          </p>
          {empty && <p>Belum ada tamu contoh pada state ini.</p>}
        </article>
      )}
    </section>
  );
}
