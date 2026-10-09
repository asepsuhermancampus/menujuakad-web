"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PreviewScreen } from "../types";
import { getPreviewNeighbors } from "../data/screens";

/*
 * Banner konteks pratinjau. Rancangan penggabungan: pengguna dapat berjalan
 * antar-layar dalam domain yang sama (prev/next) tanpa kembali ke galeri.
 * Navigasi hanya tautan biasa; tidak ada state server atau mutasi.
 */
export function PreviewBanner({ screen }: { screen: PreviewScreen }) {
  const router = useRouter();
  const neighbors = getPreviewNeighbors(screen.code);
  return (
    <aside className="preview-banner" aria-label="Konteks pratinjau">
      <div>
        <Link href="/preview-ui">← Preview Studio</Link>
        <p>Data contoh · perubahan hanya di perangkat ini</p>
        <small>
          {screen.code} · {screen.state} · {screen.device}
        </small>
      </div>
      <nav className="preview-neighbors" aria-label="Navigasi layar sekelompok">
        {neighbors.previous ? (
          <Link href={`/preview-ui/${neighbors.previous.toLowerCase()}`}>
            ← {neighbors.previous}
          </Link>
        ) : (
          <span className="preview-neighbor-disabled">← awal kelompok</span>
        )}
        <small>
          {neighbors.domain} {neighbors.index}/{neighbors.total}
        </small>
        {neighbors.next ? (
          <Link href={`/preview-ui/${neighbors.next.toLowerCase()}`}>{neighbors.next} →</Link>
        ) : (
          <span className="preview-neighbor-disabled">akhir kelompok →</span>
        )}
      </nav>
      {screen.variants.length > 1 && (
        <label>
          Varian sumber
          <select
            value={screen.id}
            onChange={(event) =>
              router.push(`/preview-ui/${screen.code.toLowerCase()}?variant=${event.target.value}`)
            }
          >
            {screen.variants.map((variant) => (
              <option value={variant.id} key={variant.id}>
                {variant.state} · {variant.device}
              </option>
            ))}
          </select>
        </label>
      )}
      {screen.sourceStatus === "metadata-only" && (
        <p>Rekonstruksi: screenshot sumber varian ini belum tersedia.</p>
      )}
      <p className="preview-limit">Akun, pembayaran, unggahan, dan penerbitan belum terhubung.</p>
    </aside>
  );
}
