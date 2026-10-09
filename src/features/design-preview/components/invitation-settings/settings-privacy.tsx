import styles from "../invitation-customer-preview.module.css";
export function SettingsPrivacy({
  passcodeEnabled,
  passcode,
  noindex,
  moderation,
  onPasscodeEnabled,
  onPasscode,
  onNoindex,
  onModeration,
}: {
  passcodeEnabled: boolean;
  passcode: string;
  noindex: boolean;
  moderation: boolean;
  onPasscodeEnabled: (value: boolean) => void;
  onPasscode: (value: string) => void;
  onNoindex: (value: boolean) => void;
  onModeration: (value: boolean) => void;
}) {
  return (
    <section className={styles.card} aria-labelledby="settings-privacy-heading">
      <h2 id="settings-privacy-heading">Privasi, Keamanan & Aksesibilitas</h2>
      <p>
        Simulasi konfigurasi lokal. Tombol ini tidak menerapkan perlindungan sandi atau moderasi
        server.
      </p>
      <label className={styles.toggleRow}>
        <span>
          <strong>Proteksi Sandi Tamu (Guest Passcode)</strong>
          <small>Uji format PIN buatan. Jangan memasukkan PIN atau sandi nyata.</small>
        </span>
        <input
          type="checkbox"
          role="switch"
          checked={passcodeEnabled}
          onChange={(event) => onPasscodeEnabled(event.target.checked)}
        />
      </label>
      {passcodeEnabled && (
        <label>
          PIN uji coba (4 digit)
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{4}"
            maxLength={4}
            value={passcode}
            onChange={(event) => onPasscode(event.target.value)}
            required
            aria-describedby="passcode-help"
          />
          <small id="passcode-help">PIN lokal tidak melindungi akses undangan.</small>
        </label>
      )}
      <label className={styles.toggleRow}>
        <span>
          <strong>Cegah Mesin Pencari (No-Index)</strong>
          <small>
            Rute preview selalu noindex. Pilihan ini hanya mensimulasikan pengaturan undangan.
          </small>
        </span>
        <input
          type="checkbox"
          role="switch"
          checked={noindex}
          onChange={(event) => onNoindex(event.target.checked)}
        />
      </label>
      <label className={styles.toggleRow}>
        <span>
          <strong>Moderasi Mandiri Buku Tamu & Doa</strong>
          <small>Uji preferensi persetujuan manual; tidak mengubah ucapan atau data layanan.</small>
        </span>
        <input
          type="checkbox"
          role="switch"
          checked={moderation}
          onChange={(event) => onModeration(event.target.checked)}
        />
      </label>
    </section>
  );
}
