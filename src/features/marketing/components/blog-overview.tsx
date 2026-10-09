import Link from "next/link";
import { blogArticles } from "../config/blog-articles";

/*
 * PUB-12 — Blog & Panduan Pernikahan (data contoh).
 * Artikel dibaca dari whitelist `blog-articles.ts` sehingga route asli dan
 * pratinjau memakai sumber yang sama; tidak ada CMS atau feed eksternal.
 */
export function BlogOverview() {
  return (
    <section>
      <section className="container section cta">
        <p className="eyebrow">BLOG & PANDUAN · DATA CONTOH</p>
        <h1>
          Panduan untuk
          <br />
          Perjalanan Menuju Akad
        </h1>
        <p>
          Kumpulan artikel contoh tentang perencanaan, desain, dan etiket pernikahan. Isi artikel
          merupakan ilustrasi tata letak, bukan nasihat final.
        </p>
      </section>
      <section className="container section">
        <div className="grid-three">
          {blogArticles.map((article) => (
            <article className="card stack" key={article.slug}>
              <span className="badge">{article.category} · contoh</span>
              <h2>{article.title}</h2>
              <p>{article.excerpt}</p>
              <small>{article.readLabel} · artikel ilustratif</small>
              <Link className="button secondary" href={`/blog/${article.slug}`}>
                Baca artikel contoh
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section className="container section">
        <p className="notice">
          Blog ini pratinjau statis tanpa CMS. Artikel baru, kategori, dan pencarian belum
          terhubung ke layanan.
        </p>
      </section>
    </section>
  );
}
