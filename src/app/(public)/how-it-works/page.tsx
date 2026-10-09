import { publicPageMetadata } from "@/config/seo";
export const metadata = publicPageMetadata(
  "/how-it-works",
  "Cara Kerja Pratinjau",
  "Tinjau alur desain, simulasi pendaftaran dan editor undangan contoh. Login akun uji terpisah dari preview; penerbitan undangan belum tersedia.",
);
import { HowItWorksDetail } from "@/features/marketing/components/how-it-works-detail";
export default function Page() {
  return (
    <main id="main">
      <HowItWorksDetail />
    </main>
  );
}
