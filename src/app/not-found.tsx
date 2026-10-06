import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="status-page container">
      <p className="eyebrow">Halaman tidak ditemukan</p>
      <h1>Sepertinya alamat ini belum tersedia.</h1>
      <p>Periksa kembali tautannya, atau kembali ke beranda Menuju Akad.</p>
      <Link href="/" className={buttonClassName()}>
        Kembali ke beranda
      </Link>
    </main>
  );
}
