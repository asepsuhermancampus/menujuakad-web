import { publicPageMetadata } from "@/config/seo";
export const metadata = publicPageMetadata(
  "/contact",
  "Informasi Bantuan",
  "Tinjau informasi bantuan dan formulir pesan contoh Menuju Akad. Form belum mengirim pesan; kanal kontak dan jam layanan resmi belum tersedia.",
);
import { ContactOverview } from "@/features/marketing/components/contact-overview";
export default function Page() {
  return (
    <main id="main">
      <ContactOverview />
    </main>
  );
}
