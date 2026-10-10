import Link from "next/link";
import { requireCustomerSession } from "@/server/authorization/guards";
import { listCustomerInvitations } from "@/server/invitations/service";
import { workspaceView } from "@/features/workspace/components/data-boundary";
import {
  budgetActualTotalIdr,
  budgetTotalIdr,
  savingsTotalBalanceIdr,
  savingsTargetFixture,
} from "@/features/design-preview/data/planner-finance-fixtures";
import { tasksFixture } from "@/features/design-preview/data/planner-work-fixtures";
import { formatIdrPlain } from "@/features/planner/lib/presentation";
import { PlannerAnnouncementModal } from "@/features/planner/components/planner-misc-views";
export const dynamic = "force-dynamic";
export default async function Page() {
  await requireCustomerSession("/dashboard");
  return workspaceView(async () => {
    const invitations = await listCustomerInvitations();
    const pendingTasks = tasksFixture.filter((task) => task.status === "PENDING").length;
    return (
      <section className="stack">
        <PlannerAnnouncementModal />
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
        {/*
         * Kartu ringkas perencanaan memakai fixture contoh; angka di bawah
         * bukan pembacaan database dan diberi label contoh agar tidak
         * disalahartikan sebagai saldo atau progres nyata.
         */}
        <h2>Perencanaan (data contoh)</h2>
        <div className="grid-three stats">
          <article className="card">
            <h2>Dana terkumpul</h2>
            <strong>{formatIdrPlain(savingsTotalBalanceIdr)}</strong>
            <p>Contoh dari target {formatIdrPlain(savingsTargetFixture.targetIdr)}.</p>
          </article>
          <article className="card">
            <h2>Sisa anggaran</h2>
            <strong>{formatIdrPlain(budgetTotalIdr - budgetActualTotalIdr)}</strong>
            <p>Contoh; bukan pembacaan database.</p>
          </article>
          <article className="card">
            <h2>Tugas berjalan</h2>
            <strong>{pendingTasks}</strong>
            <p>Contoh; belum tersimpan.</p>
          </article>
        </div>
        <div className="actions">
          <Link href="/dashboard/invitations" className="button">
            Undangan Saya
          </Link>
          <Link href="/dashboard/invitations/new" className="button secondary">
            Buat Draft
          </Link>
          <Link href="/dashboard/planner" className="button secondary">
            Buka Perencanaan
          </Link>
          <Link href="/dashboard/billing">Pembayaran Pengujian</Link>
        </div>
        <p className="notice">
          Tamu, RSVP publik, storage media dan publikasi komersial belum tersedia. Kartu perencanaan
          memakai fixture contoh.
        </p>
      </section>
    );
  });
}
