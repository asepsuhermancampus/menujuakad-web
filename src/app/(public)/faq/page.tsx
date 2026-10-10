import { publicPageMetadata } from "@/config/seo";
export const metadata = publicPageMetadata(
  "/faq",
  "Pertanyaan yang Sering Diajukan",
  "Jawaban cepat seputar fitur, pembayaran, buku tamu, dan masa aktif undangan pada pratinjau Menuju Akad. Harga, pembayaran komersial, dan penerbitan undangan belum aktif.",
);
import { FaqSection } from "@/features/marketing/components/faq-section";
export default function Page() {
  return (
    <main id="main">
      <section className="container section faq-hero">
        <p className="eyebrow">PUSAT BANTUAN &amp; INFORMASI</p>
        <h1>Pertanyaan yang Sering Diajukan</h1>
        <p className="muted">
          Temukan jawaban cepat seputar fitur, pembayaran, buku tamu, dan masa aktif undangan Anda.
          Seluruh jawaban mengikuti status pratinjau saat ini.
        </p>
      </section>
      <FaqSection searchable />
    </main>
  );
}
