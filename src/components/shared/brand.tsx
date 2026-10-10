import Link from "next/link";

/*
 * Merek Menuju Akad.
 *
 * Monogram "MA" berasal dari aset pemilik `Logo MenujuAkad.png` yang
 * divektorisasi menjadi `public/brand/logo-menujuakad.svg` (satu path,
 * `fill="currentColor"`, viewBox 1000×469). `currentColor` dipakai agar warna
 * mengikuti token tema — bukan hardcode — dan tetap tajam di semua ukuran.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    /* eslint-disable-next-line @next/next/no-img-element -- SVG statis satu warna; tidak perlu pipeline optimasi gambar */
    <img
      className={className ? `brand-mark ${className}` : "brand-mark"}
      src="/brand/logo-menujuakad.svg"
      alt=""
      aria-hidden="true"
      width={1000}
      height={469}
      decoding="async"
    />
  );
}

export function Brand() {
  return (
    <Link className="brand" href="/">
      <BrandMark />
      <span className="brand-name">Menuju Akad</span>
    </Link>
  );
}
