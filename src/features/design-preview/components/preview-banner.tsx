"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PreviewScreen } from "../types";
export function PreviewBanner({ screen }: { screen: PreviewScreen }) {
  const router = useRouter();
  return (
    <aside className="preview-banner" aria-label="Konteks pratinjau">
      <div>
        <Link href="/preview-ui">← Galeri UI</Link>
        <p>Data contoh · perubahan hanya di perangkat ini</p>
        <small>
          {screen.code} · {screen.state} · {screen.device}
        </small>
      </div>
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
