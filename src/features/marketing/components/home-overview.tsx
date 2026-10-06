import Link from "next/link";
import { Ornament } from "@/components/shared/ornament";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

export function HomeOverview() {
  return (
    <>
      <a className="skip-link" href="#konten">
        Langsung ke konten
      </a>
      <header className="site-header container">
        <Link className="wordmark" href="/" aria-label="Menuju Akad, beranda">
          menuju<span>akad</span>
          <span className="wordmark-dot">.</span>
        </Link>
        <a className="header-link" href="#tentang">
          Tentang Menuju Akad
        </a>
      </header>

      <main id="konten">
        <section className="hero container" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">Sebuah awal yang indah</p>
            <h1 id="hero-title">
              Untuk cerita yang ingin kalian <em>kenang.</em>
            </h1>
            <p className="hero-description">
              Setiap cinta punya cerita. Rayakan hari istimewa kalian dengan undangan yang hangat,
              personal, dan bermakna.
            </p>
            <a href="#tentang" className={buttonClassName()}>
              Kenali Menuju Akad <span aria-hidden="true">↗</span>
            </a>
          </div>
          <Card className="hero-keepsake">
            <Ornament className="hero-ornament" />
            <p className="eyebrow">Menuju hari bahagia</p>
            <p className="keepsake-title">
              Dua hati.
              <br />
              Satu cerita.
            </p>
            <span className="keepsake-divider" aria-hidden="true" />
            <p className="keepsake-caption">
              Dirangkai dengan cinta,
              <br />
              dibagikan dengan sepenuh hati.
            </p>
          </Card>
        </section>

        <section className="about container" id="tentang" aria-labelledby="about-title">
          <p className="eyebrow">Tentang Menuju Akad</p>
          <h2 id="about-title">
            Karena hari istimewa dimulai
            <br />
            dari kabar yang penuh cinta.
          </h2>
          <p>
            Menuju Akad adalah ruang untuk merangkai undangan pernikahan digital yang mencerminkan
            cerita kalian. Kami sedang menyiapkan pengalaman yang sederhana, indah, dan nyaman bagi
            kalian serta orang-orang tersayang.
          </p>
        </section>
      </main>

      <footer className="site-footer container">
        <span>{siteConfig.name}</span>
        <span>Untuk setiap awal yang bermakna.</span>
      </footer>
    </>
  );
}
