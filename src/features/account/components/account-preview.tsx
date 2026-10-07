"use client";
import { LocalPreviewForm } from "@/components/shared/local-preview-form";
import { useAccountPreview } from "../hooks/use-account-preview";
export function AccountPreview() {
  const account = useAccountPreview();
  const tabs = [
    ["profile", "Profil"],
    ["password", "Kata Sandi"],
    ["providers", "Metode Masuk"],
    ["sessions", "Sesi & Perangkat"],
  ];
  return (
    <>
      <p className="eyebrow">PENGATURAN AKUN</p>
      <h1>Akun & Keamanan</h1>
      <p>Jaga data akun kalian dengan pengaturan yang jelas.</p>
      <div className="account-settings-layout">
        <nav className="account-settings-nav" aria-label="Pengaturan akun">
          {tabs.map(([id, label]) => (
            <button key={id} aria-pressed={account.tab === id} onClick={() => account.setTab(id)}>
              {label}
            </button>
          ))}
        </nav>
        <section className="account-settings-content">
          <article className="card stack">
            {account.tab === "profile" && (
              <LocalPreviewForm className="stack" onSubmit={account.submit}>
                <h2>Informasi Profil</h2>
                <div className="account-avatar" aria-label="Avatar akun contoh">
                  AC
                </div>
                <label>
                  Nama lengkap
                  <input
                    required
                    value={account.name}
                    onChange={(e) => account.setName(e.target.value)}
                  />
                </label>
                <label>
                  Alamat email
                  <input
                    required
                    type="email"
                    value={account.email}
                    onChange={(e) => account.setEmail(e.target.value)}
                  />
                </label>
                <span className="badge">Email contoh · belum terverifikasi</span>
                <button className="button" type="submit">
                  Tinjau perubahan lokal
                </button>
              </LocalPreviewForm>
            )}
            {account.tab === "password" && (
              <LocalPreviewForm className="stack" onSubmit={account.submit}>
                <h2>Kata Sandi</h2>
                <p>Gunakan data contoh; jangan masukkan kredensial nyata.</p>
                <label>
                  Kata sandi contoh saat ini
                  <input type="password" required autoComplete="off" />
                </label>
                <label>
                  Kata sandi contoh baru
                  <input type="password" minLength={8} required autoComplete="off" />
                </label>
                <button className="button" type="submit">
                  Tinjau perubahan kata sandi
                </button>
              </LocalPreviewForm>
            )}
            {account.tab === "providers" && (
              <>
                <h2>Metode Masuk</h2>
                <p>
                  Google dan email ditampilkan sebagai rancangan. Belum ada provider yang terhubung.
                </p>
                <button className="button secondary" onClick={account.unavailable}>
                  Tinjau koneksi Google
                </button>
              </>
            )}
            {account.tab === "sessions" && (
              <>
                <h2>Sesi & Perangkat</h2>
                <p className="notice">
                  Tidak ada sesi nyata pada pratinjau ini. Identitas contoh tidak mengautentikasi
                  pengguna.
                </p>
                <button className="button secondary" onClick={account.unavailable}>
                  Tinjau pengakhiran sesi
                </button>
              </>
            )}
          </article>
        </section>
      </div>
      {account.message && (
        <p className="local-message" role="status">
          {account.message}
        </p>
      )}
    </>
  );
}
