"use client";
import Link from "next/link";
import { previewContext, type OrderPreviewDto } from "@/features/design-preview/data/fixtures";
import { usePaymentPreview } from "../../hooks/use-payment-preview";
import { formatExampleTime, formatIdr, formatRemaining } from "../../lib/presentation";
import { CheckoutSummary } from "./checkout-summary";
import { PaymentMethodChoice } from "./payment-method-choice";

export function PaymentCheckoutPreview({
  order,
  initialExpired = false,
}: {
  order: OrderPreviewDto;
  initialExpired?: boolean;
}) {
  const { method, setMethod, message, setMessage, state, inspectStatus } = usePaymentPreview(
    order,
    initialExpired,
  );
  const expired = state.status === "EXPIRED";
  return (
    <div
      className="billing billing-checkout stack"
      data-billing="checkout"
      data-checkout-status={state.status}
    >
      {expired && (
        <section className="billing-expired" aria-label="Sesi pembayaran kedaluwarsa">
          <strong>Sesi Pembayaran Kedaluwarsa (contoh)</strong>
          <p>
            Sesi contoh telah berakhir. Jangan melakukan transfer. Tidak ada kode pembayaran aktif.
          </p>
          <span className="badge danger">Sesi berakhir</span>
        </section>
      )}
      <div className="billing-checkout-columns">
        <section className="stack">
          <header>
            <span className="badge">Langkah 2 dari 2 — ilustrasi</span>
            <h1>{expired ? "Checkout Kedaluwarsa" : "Selesaikan Pembayaran"}</h1>
            <p>Pratinjau kanal pembayaran. Provider dan verifikasi transaksi belum terhubung.</p>
          </header>
          <div className="billing-clock">
            <div>
              <strong>Batas waktu sesi contoh</strong>
              <small>Jam contoh: {formatExampleTime(previewContext.now)}</small>
            </div>
            <output aria-label="Sisa waktu contoh">
              {formatRemaining(state.remainingSeconds)}
            </output>
          </div>
          <PaymentMethodChoice
            method={method}
            onChange={setMethod}
            disabled={state.status !== "PENDING"}
          />
          <section
            className={`billing-panel billing-instrument ${expired ? "billing-instrument-expired" : ""}`}
            aria-label="Placeholder instrumen pembayaran"
          >
            <p className="billing-eyebrow">{method} · contoh tampilan</p>
            <div className="billing-instrument-columns">
              <div className="billing-placeholder">
                <span aria-hidden="true">{expired ? "⊘" : "◇"}</span>
                <strong>{expired ? "Kedaluwarsa / Expired" : "Pembayaran belum aktif"}</strong>
                <p>Tidak ada kode untuk dipindai.</p>
              </div>
              <div>
                <p>Nominal order contoh</p>
                <h2>{formatIdr(order.amountIdr)}</h2>
                <p>Tidak ada QR, nomor rekening, instrumen kartu atau tautan pembayaran.</p>
                <span className="badge">Provider belum terhubung</span>
              </div>
            </div>
          </section>
          {!expired && (
            <section>
              <h3>Panduan meninjau UI</h3>
              <div className="billing-guidance">
                {[
                  "Pilih tampilan kanal contoh",
                  "Tinjau nominal dan waktu contoh",
                  "Lihat status fixture tanpa transaksi",
                ].map((copy, i) => (
                  <article className="billing-panel" key={copy}>
                    <span className="badge">{i + 1}</span>
                    <p>{copy}</p>
                  </article>
                ))}
              </div>
            </section>
          )}
          <button type="button" className="button" onClick={inspectStatus}>
            Lihat status contoh
          </button>
          {expired && (
            <>
              <Link className="button secondary" href="/preview-ui/cus-08">
                Lihat contoh checkout lain
              </Link>
              <button
                type="button"
                className="button secondary"
                onClick={() =>
                  setMessage(
                    "Pergantian metode pada sesi berakhir hanya ilustrasi. Tidak membuat tagihan atau request provider.",
                  )
                }
              >
                Tinjau pergantian metode
              </button>
            </>
          )}
          {message && (
            <p className="notice" role="status">
              {message}
            </p>
          )}
          <p className="billing-muted">
            Cek status membaca data sintetis yang sama. Tidak melakukan polling, transfer, aktivasi
            atau penerbitan.
          </p>
        </section>
        <CheckoutSummary
          order={order}
          status={state.status}
          onPromo={() =>
            setMessage(
              "Validasi promo belum tersedia. Nominal contoh tetap; tidak ada diskon diterapkan.",
            )
          }
        />
      </div>
    </div>
  );
}
