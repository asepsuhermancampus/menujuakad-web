import { InvitationMedia } from "@/components/shared/invitation-media";
import { invitationFixture } from "@/features/design-preview/data/fixtures";
import { InvitationResponse } from "./invitation-response";
export function InvitationSections() {
  return (
    <>
      <section id="pasangan">
        <p className="eyebrow">BISMILLAHIRRAHMANIRRAHIM</p>
        <h1>Sarah & Dimas</h1>
        <InvitationMedia />
        <p>
          Dengan memohon rahmat dan ridha Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir
          di hari bahagia kami.
        </p>
        <div className="grid-two">
          {[invitationFixture.partnerOne, invitationFixture.partnerTwo].map((name, i) => (
            <div key={name}>
              <div className="couple-portrait" aria-label="Ilustrasi profil">
                {i ? "D" : "S"}
              </div>
              <h2>{name}</h2>
              <p>Keluarga contoh · data ilustrasi</p>
            </div>
          ))}
        </div>
      </section>
      <section id="cerita">
        <p className="eyebrow">PERJALANAN KAMI</p>
        <h2>Kisah Kami</h2>
        {invitationFixture.story.map((s) => (
          <article className="card" key={s.id}>
            <small>{s.date.slice(0, 4)}</small>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </article>
        ))}
      </section>
      <section id="acara">
        <p className="eyebrow">HARI YANG DINANTIKAN</p>
        <h2>Rangkaian Acara</h2>
        <div className="countdown" aria-label="Tanggal acara contoh">
          <strong>12</strong>
          <strong>12</strong>
          <strong>2026</strong>
        </div>
        <div className="grid-two">
          {invitationFixture.events.map((e) => (
            <article className="card" key={e.id}>
              <h3>{e.title}</h3>
              <p>Sabtu, 12 Desember 2026</p>
              <p>{e.title === "Akad Nikah" ? "09.00" : "11.00"} WIB</p>
              <p>{e.venue}</p>
              <small>{e.addressLabel}</small>
            </article>
          ))}
        </div>
        <p className="notice">Lokasi ilustrasi. Peta acara nyata belum tersedia.</p>
      </section>
      <section id="galeri">
        <h2>Galeri Momen</h2>
        <div className="grid-two">
          <InvitationMedia kind="MINIMAL" />
          <InvitationMedia kind="BOTANICAL" />
        </div>
        <p>Ilustrasi sumber; foto pasangan belum disediakan.</p>
      </section>
      <InvitationResponse />
      <section id="hadiah">
        <h2>Tanda Kasih</h2>
        <p>Doa restu Anda adalah hadiah terindah bagi kami.</p>
        <p className="notice">
          Pratinjau tidak menampilkan rekening atau instrumen pembayaran nyata.
        </p>
      </section>
      <section>
        <h2>Terima Kasih</h2>
        <p>Merupakan kebahagiaan bagi kami apabila Anda berkenan hadir dan memberikan doa restu.</p>
        <h3>Sarah & Dimas</h3>
        <small>MENUJU AKAD · UNDANGAN CONTOH</small>
      </section>
    </>
  );
}
