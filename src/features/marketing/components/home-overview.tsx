import Link from "next/link";
import { InvitationMedia } from "@/components/shared/invitation-media";
import { templatesFixture } from "@/features/design-preview/data/fixtures";
import { TemplateCard } from "@/features/templates/components/template-card";
import { HowItWorks } from "./how-it-works";
import { FaqSection } from "./faq-section";
import { CallToAction } from "./call-to-action";
import { FeaturedPackages } from "./featured-packages";
export function HomeOverview() {
  return (
    <>
      <section className="hero container">
        <div>
          <p className="eyebrow">UNDANGAN DIGITAL · DIBUAT DENGAN HATI</p>
          <h1>
            Undangan untuk
            <br /> hari kalian.
          </h1>
          <p className="hero-description">
            Rangkai cerita cinta dalam undangan yang hangat, personal, dan penuh makna. Sebuah awal
            indah untuk perjalanan bersama.
          </p>
          <div className="actions">
            <Link className="button" href="/templates">
              Pilih Desain →
            </Link>
            <Link className="button secondary" href="/demo/serenade-no-1">
              Lihat Demo Undangan
            </Link>
          </div>
          <div className="hero-notes">
            <span>Desain editorial</span>
            <span>Responsif di setiap layar</span>
            <span>Cerita yang personal</span>
          </div>
        </div>
        <div className="hero-preview">
          <div className="preview-paper">
            <p className="eyebrow">THE WEDDING OF</p>
            <InvitationMedia />
            <h2>Sarah & Dimas</h2>
            <p>12 DESEMBER 2026</p>
            <Link href="/demo/serenade-no-1">Buka kisah mereka ↗</Link>
          </div>
          <span className="hero-caption">Sebuah undangan. Sejuta kenangan.</span>
        </div>
      </section>
      <section id="desain" className="container section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">DIPILIH UNTUK KALIAN</p>
            <h2>Desain Pilihan</h2>
          </div>
          <Link href="/templates">Lihat semua desain →</Link>
        </div>
        <div className="grid-three">
          {templatesFixture.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </div>
      </section>
      <HowItWorks />
      <section className="container section feature-section">
        <div>
          <p className="eyebrow">DETAIL YANG BERARTI</p>
          <h2>
            Bukan sekadar tautan,
            <br />
            sebuah momen untuk dikenang.
          </h2>
          <p>Setiap detail punya tempat, setiap cerita punya ruang.</p>
        </div>
        <div className="grid-two">
          {[
            ["Cerita kalian", "Pasangan, perjalanan cinta dan galeri dalam satu undangan."],
            ["Rangkaian acara", "Jadwal dan tempat acara yang mudah dibaca."],
            ["Kehadiran & doa", "Pratinjau RSVP dan buku ucapan tamu."],
            ["Tampilan personal", "Susun bagian undangan melalui editor modular."],
          ].map(([t, b]) => (
            <article className="card" key={t}>
              <h3>{t}</h3>
              <p>{b}</p>
            </article>
          ))}
        </div>
      </section>
      <FeaturedPackages />
      <FaqSection />
      <CallToAction />
    </>
  );
}
