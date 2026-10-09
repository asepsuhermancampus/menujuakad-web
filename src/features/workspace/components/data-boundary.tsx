import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { WorkspaceError } from "@/server/invitations/errors";
function DataError({ message }: { message: string }) {
  return (
    <section className="card">
      <h1>Data belum dapat dimuat</h1>
      <p role="alert">{message}</p>
      <p>Muat ulang halaman untuk mencoba kembali.</p>
      <Link href="/login">Kembali ke login</Link>
    </section>
  );
}
async function resolveView(
  render: () => Promise<ReactNode>,
  failure: (message: string) => ReactNode,
) {
  try {
    return await render();
  } catch (error) {
    if (!(error instanceof WorkspaceError)) throw error;
    if (error.status === 404) notFound();
    return failure(error.message);
  }
}
export function workspaceView(render: () => Promise<ReactNode>) {
  return resolveView(render, (message) => <DataError message={message} />);
}
export function workspaceLayoutView(render: () => Promise<ReactNode>) {
  return resolveView(render, (message) => (
    <main id="main" className="workspace-main">
      <DataError message={message} />
    </main>
  ));
}
export function PendingFeature({ title, preview }: { title: string; preview: string }) {
  return (
    <section className="card stack">
      <h1>{title}</h1>
      <p>
        Layanan fitur ini belum aktif di workspace. Belum ada penyimpanan atau pengiriman data untuk
        fitur ini.
      </p>
      <Link href={preview}>Lihat tampilan sintetis terpisah</Link>
    </section>
  );
}
/*
 * PreviewOnlyFeature memasang komponen UI yang sudah di-slicing langsung pada
 * route resmi workspace. Berbeda dari PendingFeature yang hanya menautkan ke
 * /preview-ui, komponen ini merender tampilan penuh agar pemeriksaan routing
 * dan tata letak dapat dilakukan di URL sebenarnya.
 *
 * Batas yang dipertahankan: data tetap sintetis dari fixture, tidak ada
 * penyimpanan/DB/provider, dan label "data contoh" wajib terlihat sehingga
 * tidak ada klaim fitur backend selesai.
 */
export function PreviewOnlyFeature({
  title,
  children,
  previewCode,
}: {
  title: string;
  children: ReactNode;
  previewCode: string;
}) {
  return (
    <section className="stack">
      <div className="workspace-title">
        <div>
          <h1>{title}</h1>
          <p className="billing-muted">
            Tampilan resmi sudah terpasang di rute ini. Data yang terlihat adalah contoh; penyimpanan
            dan layanan backend belum aktif.
          </p>
        </div>
        <span className="badge">Data contoh · belum tersimpan</span>
      </div>
      <p className="notice">
        Halaman ini memakai fixture sintetis agar alur dan tata letak dapat diperiksa pada URL asli.
        Perubahan tidak dikirim ke database atau layanan pihak ketiga.
      </p>
      {children}
      <p className="billing-muted">
        Referensi desain sumber: <Link href={`/preview-ui/${previewCode}`}>{previewCode}</Link> ·
        Pratinjau terpisah untuk perbandingan fidelity.
      </p>
    </section>
  );
}
export function WorkspaceNotFound({ home }: { home: "/dashboard" | "/admin" }) {
  return (
    <section className="card stack">
      <h1>Halaman tidak ditemukan</h1>
      <p>Halaman atau undangan yang Anda cari tidak tersedia untuk akun ini.</p>
      <Link href={home}>Kembali ke workspace</Link>
    </section>
  );
}
