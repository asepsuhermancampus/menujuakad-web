import Link from "next/link";
export function HowItWorks() {
  return (
    <section className="container section">
      <p className="eyebrow">CARA MEMBUAT</p>
      <h2>Tiga langkah menuju hari kalian.</h2>
      <div className="grid-three">
        {[
          ["01", "Pilih desain", "Temukan komposisi yang terasa seperti kalian."],
          ["02", "Lengkapi cerita", "Susun detail pasangan, rangkaian acara, dan kenangan."],
          ["03", "Bagikan kebahagiaan", "Tinjau undangan dan siapkan tautan untuk orang terkasih."],
        ].map(([n, t, b]) => (
          <article className="card" key={n}>
            <span className="step-number">{n}</span>
            <h3>{t}</h3>
            <p>{b}</p>
          </article>
        ))}
      </div>
      <Link href="/preview-ui/edt-01">Jelajahi editor contoh →</Link>
    </section>
  );
}
