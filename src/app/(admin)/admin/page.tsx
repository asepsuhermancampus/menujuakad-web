import Link from "next/link";
import { requireSuperadminSession } from "@/server/authorization/guards";
import { getAdminUsers, getAdminInvitations } from "@/server/admin/query";
import { workspaceView } from "@/features/workspace/components/data-boundary";
export const dynamic = "force-dynamic";
export default async function Page() {
  await requireSuperadminSession("/admin");
  return workspaceView(async () => {
    const users = await getAdminUsers();
    const invitations = await getAdminInvitations();
    return (
      <section className="stack">
        <h1>Workspace Superadmin</h1>
        <p>Ringkasan data pengujian dari database preproduction.</p>
        <div className="grid-two stats">
          <article className="card">
            <h2>Akun pengujian ditampilkan</h2>
            <strong>{users.length}</strong>
            <p>Whitelist 11 akun pengujian, halaman pertama.</p>
          </article>
          <article className="card">
            <h2>Undangan ditampilkan</h2>
            <strong>{invitations.length}</strong>
            <p>Halaman pertama, maksimal 25 undangan.</p>
          </article>
        </div>
        <div className="actions">
          <Link className="button" href="/admin/users">
            Lihat Akun
          </Link>
          <Link className="button secondary" href="/admin/invitations">
            Lihat Undangan
          </Link>
          <Link href="/admin/payments">Pembayaran Pengujian</Link>
        </div>
        <p className="notice">
          Ringkasan ini tidak menyatakan pembayaran komersial atau layanan provider sudah aktif.
        </p>
      </section>
    );
  });
}
