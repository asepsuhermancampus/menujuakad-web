import Link from "next/link";
import { packagesFixture } from "@/features/design-preview/data/fixtures";
export function PricingOverview() {
  return (
    <section className="container section">
      <div className="cta">
        <p className="eyebrow">PILIHAN PAKET</p>
        <h1>Pilihan untuk Hari Istimewa</h1>
        <p>
          Harga dan fitur berikut adalah data contoh untuk peninjauan UI, bukan penawaran komersial.
        </p>
      </div>
      <div className="grid-three">
        {packagesFixture.map((p) => (
          <article className="card stack" key={p.id}>
            {p.recommended && <span className="badge">Rekomendasi contoh</span>}
            <h2>{p.name}</h2>
            <strong>Rp{p.amountIdr.toLocaleString("id-ID")}</strong>
            <small>Harga contoh</small>
            <ul>
              {p.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <Link className="button" href="/preview-ui/cus-07">
              Tinjau Paket
            </Link>
          </article>
        ))}
      </div>
      <section className="section">
        <h2>Komparasi Fitur</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Fitur contoh</th>
                {packagesFixture.map((p) => (
                  <th key={p.id}>{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Kuota tamu</td>
                {packagesFixture.map((p) => (
                  <td key={p.id}>{p.guestLimit}</td>
                ))}
              </tr>
              <tr>
                <td>Foto galeri</td>
                {packagesFixture.map((p) => (
                  <td key={p.id}>{p.galleryLimit}</td>
                ))}
              </tr>
              <tr>
                <td>Editor & Pratinjau</td>
                {packagesFixture.map((p) => (
                  <td key={p.id}>Tersedia untuk ditinjau</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
