import { publicPageMetadata } from "@/config/seo";
export const metadata = publicPageMetadata(
  "/faq",
  "Pertanyaan Umum",
  "Temukan jawaban tentang preview undangan, login akun uji, RSVP contoh dan batas QRIS TEST. Pendaftaran publik dan pembayaran komersial belum tersedia.",
);
import { FaqSection } from "@/features/marketing/components/faq-section";
export default function Page() {
  return (
    <main id="main">
      <section className="container section">
        <h1>Pusat Pertanyaan</h1>
      </section>
      <FaqSection searchable />
    </main>
  );
}
