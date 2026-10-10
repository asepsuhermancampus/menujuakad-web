import { terms, privacy } from "../config/legal-copy";

/*
 * Dokumen hukum mengikuti struktur PUB-10/11 (Horizon Modern Style):
 * hero + daftar isi enam bagian + isi bernomor dengan poin penjelas.
 *
 * Nomor versi dan tanggal efektif tidak dicantumkan karena dokumen masih draf
 * pratinjau; jangan menambahkan "v2.4-ID" atau tanggal efektif dari desain
 * sumber tanpa penetapan resmi.
 */
export function LegalDocument({ privacyMode = false }: { privacyMode?: boolean }) {
  const sections = privacyMode ? privacy : terms;
  return (
    <>
      <section className="container section legal-hero">
        <p className="eyebrow">DOKUMEN HUKUM · DRAF PRATINJAU</p>
        <h1>
          {privacyMode
            ? "Kebijakan Privasi & Perlindungan Data"
            : "Syarat & Ketentuan Penggunaan Platform"}
        </h1>
        <p className="muted">
          Komitmen keterbukaan Menuju Akad dalam melindungi kerahasiaan momen sakral, data tamu, dan
          keamanan transaksi Anda.
        </p>
        <div className="legal-meta">
          <span className="badge">Status: draf pratinjau</span>
          <span className="badge">Belum berlaku sebagai perjanjian</span>
        </div>
        <p className="notice" role="status">
          Dokumen ini masih draf untuk versi pratinjau. Kebijakan operasional, dasar kontraktual,
          dan ketentuan final belum diterbitkan.
        </p>
      </section>

      <section className="container section">
        <div className="legal-layout">
          <aside aria-label="Daftar isi">
            <p className="eyebrow">{sections.length} Bagian</p>
            {sections.map((section, index) => (
              <a href={`#legal-${index}`} key={section.title}>
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}.</span>{" "}
                {section.title}
              </a>
            ))}
          </aside>
          <div className="legal-copy card">
            {sections.map((section, index) => (
              <section id={`legal-${index}`} key={section.title}>
                <h2>
                  <span className="legal-number" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>{" "}
                  {section.title}
                </h2>
                <p>{section.body}</p>
                {section.points && (
                  <ul className="legal-points">
                    {section.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
