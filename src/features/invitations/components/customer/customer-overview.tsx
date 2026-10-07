import Link from "next/link";
import {
  invitationFixture,
  rsvpFixture,
  guestsFixture,
} from "@/features/design-preview/data/fixtures";
import { InvitationSummaryCard } from "./invitation-summary-card";
export function CustomerOverview() {
  return (
    <>
      <div className="workspace-title">
        <div>
          <p className="eyebrow">HARI ISTIMEWA KALIAN</p>
          <h1>Selamat Datang Kembali</h1>
          <p className="muted">Susun cerita dan siapkan undangan untuk orang terkasih.</p>
        </div>
        <Link className="button" href="/preview-ui/cus-03">
          + Buat Undangan Contoh
        </Link>
      </div>
      <div className="grid-four stats">
        {[
          ["Undangan contoh", 2],
          ["Daftar tamu contoh", guestsFixture.length],
          ["Konfirmasi hadir", rsvpFixture.attending],
          ["Masih mempertimbangkan", rsvpFixture.maybe],
        ].map(([label, value]) => (
          <article key={label} className="card">
            <small>{label}</small>
            <strong>{value}</strong>
            <span className="badge">Data contoh</span>
          </article>
        ))}
      </div>
      <section className="section">
        <div className="section-heading">
          <h2>Undangan Anda</h2>
          <Link href="/preview-ui/cus-02">Lihat Semua →</Link>
        </div>
        <InvitationSummaryCard invitation={invitationFixture} />
      </section>
      <div className="grid-two">
        <article className="card">
          <h2>Langkah Selanjutnya</h2>
          <p>Periksa profil pasangan, jadwal, dan detail undangan.</p>
          <Link href="/preview-ui/edt-08">Tinjau kelengkapan →</Link>
        </article>
        <article className="card">
          <h2>Ada yang Bisa Dibantu?</h2>
          <p>Jelajahi contoh pusat bantuan dan diskusi dukungan.</p>
          <Link href="/preview-ui/sup-01">Pusat bantuan →</Link>
        </article>
      </div>
    </>
  );
}
