import { ContactForm } from "@/features/marketing/components/contact-form";

/*
 * Struktur mengikuti desain PUB-08 (Horizon Modern Style): hero + status
 * concierge + tiga kanal + blok pendampingan + formulir.
 *
 * Kontak pada desain sumber (nomor WhatsApp, email, alamat studio Bandung)
 * adalah contoh desain dan BELUM resmi untuk Menuju Akad. Semua kanal di
 * bawah ditandai belum aktif; jangan mengganti dengan kontak rekaan.
 */

const channels = [
  {
    icon: "💬",
    title: "WhatsApp Concierge",
    detail: "Belum diaktifkan",
    note: "Nomor resmi akan diumumkan sebelum platform beroperasi. Desain sumber menampilkan contoh nomor yang tidak boleh dipakai.",
    badge: "Contoh desain",
  },
  {
    icon: "✉",
    title: "Email Support",
    detail: "Belum diaktifkan",
    note: "Alamat email resmi belum ditetapkan. Pratinjau tidak mengirim email ke mana pun.",
    badge: "Contoh desain",
  },
  {
    icon: "◉",
    title: "Kantor Studio",
    detail: "Belum tersedia",
    note: "Lokasi studio pada desain sumber adalah contoh. Kunjungan langsung belum dapat dijadwalkan.",
    badge: "Contoh desain",
  },
] as const;

export function ContactOverview() {
  return (
    <>
      <section className="container section contact-hero">
        <p className="eyebrow">KAMI SIAP MEMBANTU</p>
        <h1>Hubungi Tim Concierge Menuju Akad</h1>
        <p className="muted">
          Konsultasikan konsep undangan pernikahan digital Anda atau sampaikan kendala teknis. Kanal
          resmi belum aktif; halaman ini menampilkan rancangan tampilannya.
        </p>
        <p className="notice" role="status">
          Pratinjau: kanal bantuan dan jam layanan resmi belum tersedia. Tidak ada pesan yang
          terkirim dari halaman ini.
        </p>
      </section>

      <section className="container section contact-channels">
        <h2 className="section-heading">Kanal Bantuan</h2>
        <div className="grid-three">
          {channels.map((channel) => (
            <article className="card contact-channel" key={channel.title}>
              <span className="contact-channel-icon" aria-hidden="true">
                {channel.icon}
              </span>
              <h3>{channel.title}</h3>
              <strong className="contact-channel-detail">{channel.detail}</strong>
              <p>{channel.note}</p>
              <span className="badge">{channel.badge}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="container section">
        <article className="card contact-assist">
          <div>
            <p className="eyebrow">PENDAMPINGAN PENUH</p>
            <h2>Dari pemilihan desain hingga hari bahagia</h2>
            <p>
              Rancangan layanan mencakup pendampingan pemilihan tema, penyiapan data acara, dan
              panduan bagi tamu. Karena layanan belum beroperasi, pendampingan ini belum dapat
              diminta.
            </p>
          </div>
          <span className="badge">Rencana layanan</span>
        </article>
      </section>

      <section className="container section">
        <div className="grid-two contact-form-layout">
          <div>
            <h2>Formulir Pesan</h2>
            <p className="muted">
              Formulir di samping adalah contoh alur. Validasi berjalan lokal di browser dan pesan
              tidak dikirim ke server mana pun.
            </p>
            <ul className="contact-notes">
              <li>Data yang Anda ketik tidak tersimpan.</li>
              <li>Jangan memasukkan data pribadi atau informasi rekening.</li>
              <li>Kanal resmi akan diumumkan sebelum layanan dibuka.</li>
            </ul>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
