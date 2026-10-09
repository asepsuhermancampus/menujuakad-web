import Link from "next/link";
import { requireCustomerSession } from "@/server/authorization/guards";
import { listCustomerInvitations } from "@/server/invitations/service";
import { workspaceView } from "@/features/workspace/components/data-boundary";
export const dynamic = "force-dynamic";
export default async function Page() {
  await requireCustomerSession("/dashboard");
  return workspaceView(async () => {
    const invitations = await listCustomerInvitations();
    return (
      <section className="stack">
        <h1>Dashboard</h1>
        <p>Kelola draft undangan dari akun Anda. Data berikut dibaca dari database.</p>
        <div className="grid-two stats">
          <article className="card">
            <h2>Undangan ditampilkan</h2>
            <strong>{invitations.length}</strong>
            <p>Maksimal 100 undangan terbaru.</p>
          </article>
          <article className="card">
            <h2>Draft privat ditampilkan</h2>
            <strong>
              {invitations.filter((row) => row.status === "DRAFT" && !row.isPublished).length}
            </strong>
            <p>Dapat disunting dan disimpan.</p>
          </article>
        </div>
        <div className="actions">
          <Link href="/dashboard/invitations" className="button">
            Undangan Saya
          </Link>
          <Link href="/dashboard/invitations/new" className="button secondary">
            Buat Draft
          </Link>
          <Link href="/dashboard/billing">Pembayaran Pengujian</Link>
        </div>
        <p className="notice">
          Tamu, RSVP publik, storage media dan publikasi komersial belum tersedia.
        </p>
      </section>
    );
  });
}
