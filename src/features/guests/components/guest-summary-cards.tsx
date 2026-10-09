import type { summarizeGuests } from "../lib/guest-preview";

type GuestSummary = ReturnType<typeof summarizeGuests>;

/** Presentasi ringkasan seluruh daftar; pencarian dan pagination tidak mengubah denominator. */
export function GuestSummaryCards({ summary }: { summary: GuestSummary }) {
  return (
    <section className="guest-summary" aria-label="Ringkasan tamu contoh">
      <article className="card guest-summary-card">
        <h2>Tamu terdaftar</h2>
        <p className="guest-summary-value">{summary.total}</p>
        <p>Identitas tamu sintetis</p>
      </article>
      <article className="card guest-summary-card">
        <h2>Alokasi kursi</h2>
        <p className="guest-summary-value">{summary.seats}</p>
        <p>Jumlah kursi seluruh tamu dan pendamping</p>
      </article>
      <article className="card guest-summary-card">
        <h2>Pengiriman contoh</h2>
        <p className="guest-summary-value">
          {summary.sent} / {summary.total}
        </p>
        <progress
          aria-label="Persentase pengiriman contoh"
          value={summary.deliveryRatePercent}
          max={100}
        />
        <p>{summary.deliveryRatePercent}% ilustrasi terkirim; tidak ada pengiriman nyata.</p>
      </article>
      <article className="card guest-summary-card">
        <h2>RSVP</h2>
        <p className="guest-summary-value">
          {summary.attendanceRatePercent}% <span>hadir</span>
        </p>
        <dl className="guest-summary-rsvp">
          <div>
            <dt>Hadir</dt>
            <dd>{summary.attending}</dd>
          </div>
          <div>
            <dt>Tidak hadir</dt>
            <dd>{summary.declining}</dd>
          </div>
          <div>
            <dt>Masih ragu</dt>
            <dd>{summary.maybe}</dd>
          </div>
          <div>
            <dt>Belum menjawab</dt>
            <dd>{summary.pending}</dd>
          </div>
        </dl>
      </article>
    </section>
  );
}
