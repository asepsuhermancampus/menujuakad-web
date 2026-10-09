import { terms, privacy } from "../config/legal-copy";
export function LegalDocument({ privacyMode = false }: { privacyMode?: boolean }) {
  const sections = privacyMode ? privacy : terms;
  return (
    <section className="container section">
      <p className="eyebrow">INFORMASI PLATFORM · DRAF PRATINJAU</p>
      <h1>
        {privacyMode
          ? "Kebijakan Privasi & Perlindungan Data"
          : "Syarat & Ketentuan Penggunaan Platform"}
      </h1>
      <p className="notice">
        Dokumen draf untuk versi pratinjau. Kebijakan operasional final belum diterbitkan.
      </p>
      <div className="legal-layout">
        <aside aria-label="Daftar isi">
          {sections.map(([title], i) => (
            <a href={`#legal-${i}`} key={title}>
              {i + 1}. {title}
            </a>
          ))}
        </aside>
        <div className="legal-copy card">
          {sections.map(([title, body], i) => (
            <section id={`legal-${i}`} key={title}>
              <h2>
                {i + 1}. {title}
              </h2>
              <p>{body}</p>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
