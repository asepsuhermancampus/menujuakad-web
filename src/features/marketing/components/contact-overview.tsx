import { ContactForm } from "@/features/marketing/components/contact-form";
export function ContactOverview() {
  return (
    <section className="container section">
      <p className="eyebrow">BANTUAN MENUJU AKAD</p>
      <h1>Kami Siap Membantu Hari Bahagia Anda</h1>
      <p>Konsultasikan ide dan kebutuhan undangan kalian.</p>
      <div className="grid-two">
        <article className="card">
          <h2>Kanal Bantuan</h2>
          <p>Kontak dan jam layanan resmi akan diumumkan sebelum platform beroperasi.</p>
          <p className="notice">
            Kanal email dan WhatsApp belum diaktifkan. Tidak ada pesan yang dikirim dari pratinjau.
          </p>
        </article>
        <ContactForm />
      </div>
    </section>
  );
}
