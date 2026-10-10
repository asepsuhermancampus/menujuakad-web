import { publicPageMetadata } from "@/config/seo";
export const metadata = publicPageMetadata(
  "/contact",
  "Hubungi Concierge",
  "Rancangan kanal bantuan Menuju Akad beserta formulir pesan contoh. Kanal resmi belum aktif dan pesan tidak terkirim dari pratinjau.",
);
import { ContactOverview } from "@/features/marketing/components/contact-overview";
export default function Page() {
  return (
    <main id="main">
      <ContactOverview />
    </main>
  );
}
