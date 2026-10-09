import Link from "next/link";
import { previewGuestOptions } from "../data/invitation-preview-fixtures";
import styles from "./invitation-customer-preview.module.css";
export function InvitationReadinessInspector({
  guestId,
  partySize,
  onGuest,
  onParty,
}: {
  guestId: string;
  partySize: number;
  onGuest: (value: string) => void;
  onParty: (value: number) => void;
}) {
  const guest =
    previewGuestOptions.find((option) => option.id === guestId) ?? previewGuestOptions[0];
  return (
    <aside className={`${styles.inspector} ${styles.stack}`} aria-labelledby="inspector-heading">
      <div>
        <p className="eyebrow">INSPEKTOR PRATINJAU</p>
        <h2 id="inspector-heading">Kesiapan & Pengujian</h2>
        <p>Periksa kartu contoh sebelum menguji tampilan penerima.</p>
      </div>
      <section className={styles.card}>
        <header>
          <h3>Status Kesiapan Publikasi</h3>
          <span className="badge">Perlu Tinjauan</span>
        </header>
        <div className={styles.warning}>
          <strong>Batas Waktu RSVP Belum Ditentukan</strong>
          <p>
            Fixture belum memiliki tanggal penutupan konfirmasi. Tidak ada undangan yang
            diterbitkan.
          </p>
          <Link href="/preview-ui/cus-06">Buka Pengaturan Undangan →</Link>
        </div>
        <dl className={styles.details}>
          <div>
            <dt>Tema Stasioneri</dt>
            <dd>Editorial Ivory & Gold</dd>
          </div>
          <div>
            <dt>Musik Latar</dt>
            <dd>Nonaktif · contoh</dd>
          </div>
          <div>
            <dt>Perlindungan Sandi</dt>
            <dd>Belum diterapkan</dd>
          </div>
          <div>
            <dt>Penyimpanan</dt>
            <dd>State lokal saja</dd>
          </div>
        </dl>
      </section>
      <section className={styles.card}>
        <h3>Uji Responsif & Tamu Simulasi</h3>
        <p>Identitas dan kuota khusus dibuat untuk uji sampul, terpisah dari data RSVP contoh.</p>
        <label>
          Nama Tamu Uji Coba
          <select value={guestId} onChange={(event) => onGuest(event.target.value)}>
            {previewGuestOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.displayName}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.toggleRow}>
          <span>
            <strong>Simulasikan Kuota Pendamping (+1)</strong>
            <small>
              {guest.maxPartySize === 2
                ? "Tampilkan jatah tambahan pada sampul."
                : "Tamu contoh ini memiliki kuota satu orang."}
            </small>
          </span>
          <input
            type="checkbox"
            checked={partySize > 1}
            disabled={guest.maxPartySize < 2}
            onChange={(event) => onParty(event.target.checked ? 2 : 1)}
          />
        </label>
        <div className={styles.inset}>
          <small>Hasil uji sampul</small>
          <p>
            <strong>{guest.displayName}</strong> · {partySize} orang
          </p>
          <small>Perubahan tidak disimpan dan tidak membuat token atau tautan tamu nyata.</small>
        </div>
      </section>
    </aside>
  );
}
