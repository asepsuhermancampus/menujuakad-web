import { publicPageMetadata } from "@/config/seo";
export const metadata = publicPageMetadata(
  "/about",
  "Tentang Menuju Akad",
  "Kenali Menuju Akad dan pendekatan desain undangan pernikahan digital. Katalog memakai data contoh; layanan komersial masih dalam pengembangan.",
);
import { AboutOverview } from "@/features/marketing/components/about-overview";
export default function Page() {
  return (
    <main id="main">
      <AboutOverview />
    </main>
  );
}
