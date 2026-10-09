import Link from "next/link";
import type { BlogArticle } from "../config/blog-articles";

/*
 * PUB-13 — Detail Artikel Panduan (data contoh).
 * Menerima artikel dari whitelist `blog-articles.ts` sehingga route asli
 * `/blog/[slug]` dan pratinjau merender sumber yang sama. Tanpa komentar,
 * penulis nyata, atau integrasi CMS.
 */
export function BlogDetail({ article }: { article: BlogArticle }) {
  return (
    <section className="container section">
      <nav aria-label="Navigasi artikel">
        <Link href="/blog">← Kembali ke Blog</Link>
      </nav>
      <article className="section">
        <p className="eyebrow">
          {article.category.toUpperCase()} · ARTIKEL CONTOH
        </p>
        <h1>{article.title}</h1>
        <p className="muted">
          {article.readLabel} · ilustrasi editorial · tidak diterbitkan sebagai nasihat final
        </p>
        <section className="section">
          {article.sections.map((section, index) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
              {index === 0 && article.points && (
                <>
                  <h2>Prinsip utama</h2>
                  <ul>
                    {article.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          ))}
        </section>
        <aside className="card stack">
          <h2>Ringkasan contoh</h2>
          <p>{article.closing}</p>
          <Link className="button" href="/blog">
            Lihat artikel contoh lain
          </Link>
        </aside>
      </article>
    </section>
  );
}
