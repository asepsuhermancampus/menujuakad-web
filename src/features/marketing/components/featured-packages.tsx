import Link from "next/link";
import { packagesFixture } from "@/features/design-preview/data/fixtures";
/** Varian home tablet menampilkan dua kartu; mobile menampilkan satu kartu contoh. */
export function FeaturedPackages() {
  const packages = [packagesFixture[1], packagesFixture[0]];
  return (
    <section className="container section home-packages">
      <p className="eyebrow">PILIHAN UNTUK KALIAN</p>
      <h2>Ruang untuk Setiap Cerita</h2>
      <p className="notice">Harga dan fitur contoh; belum merupakan penawaran komersial.</p>
      <div className="grid-two">
        {packages.map((packageDto) => (
          <article className="card stack" key={packageDto.id}>
            <span className="badge">Paket contoh</span>
            <h3>{packageDto.name}</h3>
            <strong>Rp{packageDto.amountIdr.toLocaleString("id-ID")}</strong>
            <small>Harga contoh</small>
            <ul>
              {packageDto.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <Link className="button" href="/pricing">
              Tinjau paket contoh
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
