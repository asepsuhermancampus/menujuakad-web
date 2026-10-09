import { publicPageMetadata } from "@/config/seo";
export const metadata = publicPageMetadata(
  "/",
  "Sebuah Awal yang Indah",
  "Jelajahi desain dan demo undangan digital Menuju Akad dengan data contoh. Login khusus akun uji; penerbitan dan pembayaran komersial belum tersedia.",
);
import { HomeOverview } from "@/features/marketing/components/home-overview";
export default function Home() {
  return (
    <main id="main">
      <HomeOverview />
    </main>
  );
}
