import Link from "next/link";
export function CallToAction() {
  return (
    <section className="container section cta">
      <p className="eyebrow">SEBUAH AWAL YANG INDAH</p>
      <h2>
        Rangkai undangan pernikahan
        <br />
        dengan keanggunan sejati.
      </h2>
      <div className="actions">
        <Link className="button" href="/templates">
          Temukan Desain
        </Link>
        <Link className="button secondary" href="/contact">
          Hubungi Kami
        </Link>
      </div>
    </section>
  );
}
