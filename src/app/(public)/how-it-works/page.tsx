import { publicPageMetadata } from "@/config/seo";
export const metadata = publicPageMetadata(
  "/how-it-works",
  "Cara Membuat Undangan",
  "Enam langkah menyiapkan undangan digital: pilih desain, isi data, kurasi media, kelola tamu, periksa kesiapan, lalu bagikan tautan. Status pratinjau dijelaskan jujur pada tiap langkah.",
);
import { HowItWorksDetail } from "@/features/marketing/components/how-it-works-detail";
export default function Page() {
  return (
    <main id="main">
      <HowItWorksDetail />
    </main>
  );
}
