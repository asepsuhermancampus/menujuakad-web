import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import {
  invitationFixture,
  rsvpFixture,
  guestsFixture,
} from "@/features/design-preview/data/fixtures";
import { InvitationSummaryCard } from "./invitation-summary-card";

/*
 * CUS-01 — Ringkasan Akun (Horizon Modern Style).
 *
 * Susunan mengikuti desain: kartu sambutan dengan daftar langkah kesiapan, tiga
 * kartu status (tamu & RSVP, kelengkapan draf, menuju hari bahagia), lalu
 * undangan aktif dan kartu bantuan.
 *
 * Semua angka berasal dari fixture sintetis dan diberi label contoh. Tidak ada
 * klaim penyimpanan, sinkronisasi pasangan, atau pengiriman undangan nyata.
 */

/** Langkah kesiapan yang ditampilkan pada kartu sambutan desain. */
const readinessSteps = [
  { label: "Profil pasangan", done: true },
  { label: "Jadwal akad", done: true },
  { label: "Lokasi resepsi", done: false },
  { label: "Format pesan digital", done: false },
] as const;

export function CustomerOverview() {
  const pendingSteps = readinessSteps.filter((step) => !step.done).length;
  const guestTotal = guestsFixture.length;
  const attending = rsvpFixture.attending;
  const guestPercent = guestTotal === 0 ? 0 : Math.round((attending / guestTotal) * 100);
  const draftPercent = Math.round(
    ((readinessSteps.length - pendingSteps) / readinessSteps.length) * 100,
  );

  return (
    <>
      <section className="welcome-card">
        <div className="welcome-body">
          <p className="aura-label">Langkah berikutnya</p>
          <h1>Selamat datang, Sarah &amp; Dimas</h1>
          <p className="welcome-lead">
            Undangan utama <strong>&lsquo;{invitationFixture.title}&rsquo;</strong> masih berstatus
            draf. Ada <strong>{pendingSteps} langkah</strong> sebelum siap dibagikan ke tamu.
          </p>
          <ul className="welcome-steps">
            {readinessSteps.map((step) => (
              <li key={step.label} data-done={step.done}>
                <Icon name={step.done ? "task-alt" : "shield"} size={16} />
                <span>{step.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="welcome-actions">
          <Link className="button" href="/preview-ui/cus-04">
            <span>Lanjutkan pengisian rincian</span>
            <Icon name="arrow-forward" size={16} />
          </Link>
          <Link className="button secondary" href="/preview-ui/inv-01">
            <Icon name="visibility" size={16} />
            <span>Pratinjau draf saat ini</span>
          </Link>
        </div>
      </section>

      <div className="dashboard-status-grid">
        <article className="dashboard-status-card" data-tone="primary">
          <header>
            <span className="dashboard-status-icon">
              <Icon name="group" size={18} />
            </span>
            <span>Daftar Tamu &amp; RSVP</span>
            <span className="planner-badge">{guestPercent}% hadir</span>
          </header>
          <strong className="tabular">
            {attending} / {guestTotal} tamu
          </strong>
          <p>
            {attending} konfirmasi hadir · {rsvpFixture.pending} menunggu tanggapan ·{" "}
            {rsvpFixture.maybe} masih mempertimbangkan (contoh).
          </p>
          <div
            className="planner-bar"
            role="progressbar"
            aria-valuenow={guestPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Persentase tamu terkonfirmasi hadir"
          >
            <span style={{ width: `${guestPercent}%` }} />
          </div>
        </article>

        <article className="dashboard-status-card" data-tone="tertiary">
          <header>
            <span className="dashboard-status-icon">
              <Icon name="task-alt" size={18} />
            </span>
            <span>Kelengkapan Draf</span>
            <span className="planner-badge">
              Langkah {readinessSteps.length - pendingSteps}/{readinessSteps.length}
            </span>
          </header>
          <strong className="tabular">{draftPercent}%</strong>
          <p>Tersisa lokasi resepsi dan format pesan digital pada daftar contoh.</p>
          <div
            className="planner-bar"
            role="progressbar"
            aria-valuenow={draftPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Kelengkapan draf contoh"
          >
            <span style={{ width: `${draftPercent}%` }} />
          </div>
        </article>

        <article className="dashboard-status-card" data-tone="secondary">
          <header>
            <span className="dashboard-status-icon">
              <Icon name="schedule" size={18} />
            </span>
            <span>Menuju Hari Bahagia</span>
            <span className="planner-badge">12 Des 2026</span>
          </header>
          <strong className="tabular">{pendingSteps} langkah tersisa</strong>
          <p>Disarankan menyebar tautan undangan minimal 30 hari sebelum acara.</p>
          <footer className="dashboard-status-foot">
            <small>Paket draf contoh</small>
            <Link href="/preview-ui/cus-07">
              <span>Lihat paket</span>
              <Icon name="arrow-forward" size={14} />
            </Link>
          </footer>
        </article>
      </div>

      <section className="section">
        <div className="section-heading">
          <div>
            <h2>Undangan Aktif</h2>
            <p className="section-sub">Draf seremonial utama · data contoh</p>
          </div>
          <span className="planner-badge">Draf aktif</span>
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

      <p className="notice">
        Seluruh angka pada halaman ini adalah data contoh. Belum ada penyimpanan, sinkronisasi
        pasangan, atau pengiriman undangan yang aktif.
      </p>
    </>
  );
}
