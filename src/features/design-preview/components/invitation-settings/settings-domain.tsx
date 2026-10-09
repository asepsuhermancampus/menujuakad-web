import styles from "../invitation-customer-preview.module.css";
export function SettingsDomain({
  slug,
  onChange,
  error,
}: {
  slug: string;
  onChange: (value: string) => void;
  error: string | null;
}) {
  return (
    <section className={styles.card} aria-labelledby="settings-domain-heading">
      <header>
        <h2 id="settings-domain-heading">Domain & Alamat Tautan</h2>
        <span className="badge">{error ? "Periksa format" : "Format valid · contoh"}</span>
      </header>
      <p>
        Alamat undangan yang dibagikan kepada tamu. Ketersediaan alamat belum diperiksa di server.
      </p>
      <label htmlFor="settings-slug">Tautan Utama Menuju Akad</label>
      <div className={styles.slug}>
        <span>menujuakad.com/</span>
        <input
          id="settings-slug"
          value={slug}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={!!error}
          aria-describedby="settings-slug-help"
          required
          maxLength={80}
        />
      </div>
      <p id="settings-slug-help" className={error ? styles.error : styles.hint}>
        {error ?? "Gunakan huruf kecil, angka, dan tanda hubung (-). Hanya validasi lokal."}
      </p>
      <div className={styles.inset}>
        <strong>
          Domain Kustom Pribadi <span className="badge">Opsi paket · contoh</span>
        </strong>
        <p>Konfigurasi domain kustom dan sertifikat SSL belum terhubung pada preview.</p>
        <input
          aria-label="Domain kustom belum tersedia"
          placeholder="misal: acara.example.invalid"
          disabled
        />
        <button type="button" className="button secondary" disabled>
          Hubungkan Domain · belum tersedia
        </button>
      </div>
    </section>
  );
}
