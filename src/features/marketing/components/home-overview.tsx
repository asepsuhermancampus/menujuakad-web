import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { InvitationMedia } from "@/components/shared/invitation-media";
import { templatesFixture } from "@/features/design-preview/data/fixtures";
import { TemplateCard } from "@/features/templates/components/template-card";
import { HowItWorks } from "./how-it-works";
import { FaqSection } from "./faq-section";
import { CallToAction } from "./call-to-action";
import { FeaturedPackages } from "./featured-packages";

/*
 * Beranda publik (PUB-01, Horizon Modern Style).
 *
 * Susunan mengikuti desain: hero terpusat dengan pil pengumuman, baris pilihan
 * cepat tema, tiga metrik kepercayaan, kartu pratinjau undangan, katalog desain,
 * alur kerja, keunggulan fungsional, paket, FAQ, dan CTA.
 *
 * Catatan kejujuran: seluruh nama, angka, dan kutipan di sini adalah contoh.
 * Tidak ada klaim jumlah pengguna, jaminan, atau harga komersial.
 */

const quickPicks = [
  "Editorial Minimalist",
  "Portrait Intimate",
  "Archiviste Typography",
  "RSVP & Maps",
] as const;

const trustStats = [
  ["01", "Estetika editorial"],
  ["100%", "Bebas iklan & spam"],
  ["Real-time", "RSVP terdata"],
] as const;

const featureCards = [
  {
    icon: "task-alt" as const,
    title: "RSVP Akurat & Tertata",
    body: "Konfirmasi kehadiran tersusun per sesi acara beserta rincian jumlah tamu dan doa restu.",
    foot: ["Contoh pratinjau", "Ekspor CSV (rencana)"],
  },
  {
    icon: "schedule" as const,
    title: "Peta Presisi & Navigasi",
    body: "Tautan lokasi yang jelas menuju peta digital, tanpa titik jemput keliru atau rute membingungkan.",
    foot: ["Peta digital (rencana)", "Rute sekali klik"],
  },
  {
    icon: "gift" as const,
    title: "Amplop Digital & Hadiah",
    body: "Nomor rekening dan kanal hadiah ditampilkan rapi dan tersamar pada pratinjau.",
    foot: ["Belum aktif", "Tanpa potongan platform"],
  },
] as const;

const advantageChecks = [
  ["Bebas musik otomatis paksa", "Tamu memegang kendali penuh atas audio undangan."],
  ["Kecepatan muat terjaga", "Aset ringan agar tetap nyaman di koneksi seluler."],
  ["Satu undangan, satu tautan", "Setiap tamu menerima alamat yang rapi dan mudah dibuka."],
] as const;

export function HomeOverview() {
  const featured = templatesFixture.find((t) => t.featured) ?? templatesFixture[0];

  return (
    <>
      <section className="hero-centered">
        <div className="container">
          <p className="hero-pill">
            <span className="hero-pill-dot" aria-hidden="true" />
            <strong>Baru</strong>
            <span>Koleksi desain digital editorial 2026</span>
          </p>
          <h1>Momen sakral, dibalut presisi digital.</h1>
          <p className="hero-sub">
            Platform undangan pernikahan modern berestetika bersih. Pilih karya kurasi,
            personalisasi detail acara Anda, lalu sebar ke tamu dalam hitungan menit.
          </p>

          {/* Bilah masuk cepat menuju katalog — padanan kolom nama pada desain. */}
          <div className="hero-entry">
            <span className="hero-entry-icon" aria-hidden="true">
              <Icon name="edit" size={18} />
            </span>
            <p>Tuliskan nama Anda dan pasangan, mis. &ldquo;Asep &amp; Kirana&rdquo;.</p>
            <Link className="hero-entry-cta" href="/templates">
              <span>Mulai dari katalog</span>
              <Icon name="arrow-forward" size={16} />
            </Link>
          </div>

          <div className="hero-quickpicks">
            <span>Pilihan cepat:</span>
            {quickPicks.map((pick) => (
              <Link key={pick} href="/templates">
                {pick}
              </Link>
            ))}
          </div>

          <div className="hero-trust">
            {trustStats.map(([value, label]) => (
              <div key={label}>
                <p className="hero-trust-value">{value}</p>
                <p className="hero-trust-label">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="preview-frame">
          <div className="preview-frame-inner">
            <div className="preview-frame-art">
              <InvitationMedia />
              <span className="preview-frame-badge">Contoh desain</span>
            </div>
            <div className="preview-frame-body">
              <div className="preview-frame-top">
                <span>Pratinjau eksklusif</span>
                <span>No. 0824 / MA</span>
              </div>
              <div>
                <p className="eyebrow">Pernikahan suci</p>
                <h2>Sarah &amp; Dimas</h2>
                <p>Minggu, 12 Desember 2026 · Data contoh</p>
              </div>
              <div className="preview-frame-rsvp">
                <span>Status RSVP</span>
                <strong>Contoh · belum tersimpan</strong>
              </div>
              <div className="preview-frame-actions">
                <Link className="button" href="/demo/serenade-no-1">
                  Lihat demo undangan
                </Link>
                <Link className="button secondary" href="/templates">
                  Eksplorasi format ini
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="desain" className="container section">
        <div className="section-heading section-heading-center">
          <div>
            <p className="eyebrow">Katalog kurasi</p>
            <h2>Desain Pilihan</h2>
            <p className="section-sub">
              Format tipografi dengan sentuhan tata letak kontemporer. Berpusat pada kisah dan
              kemudahan tamu.
            </p>
          </div>
        </div>
        <div className="grid-three">
          {templatesFixture.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </div>
        <div className="section-actions">
          <Link className="button secondary" href="/templates">
            <span>Lihat semua desain</span>
            <Icon name="arrow-forward" size={16} />
          </Link>
        </div>
      </section>

      <HowItWorks />

      <section className="container section">
        <div className="feature-split">
          <div>
            <p className="eyebrow">Keunggulan fungsional</p>
            <h2>Bukan sekadar tautan, ini etiket menyambut tamu.</h2>
            <p>
              Kami menanggalkan animasi berisik, pemutar musik otomatis, dan ornamen berat. Fokusnya
              adalah kenyamanan tamu saat menerima kabar bahagia.
            </p>
            <ul className="feature-checks">
              {advantageChecks.map(([title, body]) => (
                <li key={title}>
                  <span className="feature-check" aria-hidden="true">
                    <Icon name="task-alt" size={16} />
                  </span>
                  <div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="feature-cards">
            {featureCards.map((card) => (
              <article className="feature-card" key={card.title}>
                <span className="feature-card-icon" aria-hidden="true">
                  <Icon name={card.icon} size={20} />
                </span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
                <footer>
                  {card.foot.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </footer>
              </article>
            ))}
          </div>
        </div>
      </section>

      {featured && (
        <section className="container section">
          <div className="showcase">
            <div className="showcase-body">
              <p className="eyebrow">Contoh pratinjau</p>
              <h2>{featured.name}</h2>
              <p>{featured.description}</p>
              <div className="actions">
                <Link className="button" href={`/templates/${featured.slug}`}>
                  Lihat detail desain
                </Link>
                <Link className="button secondary" href={`/demo/${featured.slug}`}>
                  Buka demo
                </Link>
              </div>
            </div>
            <div className="showcase-art">
              <InvitationMedia />
            </div>
          </div>
        </section>
      )}

      <FeaturedPackages />
      <FaqSection />
      <CallToAction />
    </>
  );
}
