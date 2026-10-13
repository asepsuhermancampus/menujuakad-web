import Link from "next/link";
import { Icon } from "@/components/ui/icon";

/*
 * State tautan tidak valid untuk `/u/[token]` (status HTTP 404).
 * Kartu netral: tidak membocorkan apakah token "hampir benar" atau ada.
 * Metadata robots mengikuti layout root (noindex, nofollow).
 */

export default function NotFound() {
  return (
    <main id="main" className="invitation-canvas">
      <section className="invitation-cover invitation-cover-invalid">
        <span className="invitation-seal" aria-hidden="true">
          <Icon name="shield" size={22} />
        </span>
        <p className="aura-label">Menuju Akad</p>
        <h1>Tautan Undangan Tidak Dapat Ditemukan</h1>
        <p>
          Tautan ini tidak valid atau sudah tidak berlaku. Periksa kembali alamat dari pengirim
          undangan, atau minta tautan baru kepada pemilik undangan.
        </p>
        <Link className="button" href="/">
          Kembali ke Beranda
        </Link>
        <small>Menuju Akad</small>
      </section>
    </main>
  );
}
