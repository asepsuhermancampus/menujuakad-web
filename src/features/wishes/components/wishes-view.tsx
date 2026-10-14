import Link from "next/link";
import type { WishDto } from "@/server/guests/dto";
import { rsvpStatusLabels } from "@/features/guests/lib/guest-domain-labels";

/*
 * Tab Buku Doa & Ucapan (GST-04) memakai data NYATA: pesan yang dikirim tamu
 * bersama responsnya (`RsvpResponse.message`), baik lewat tautan personal
 * maupun catatan pemilik.
 *
 * Moderasi (sembunyikan/tampilkan) TIDAK ditawarkan di sini karena skema belum
 * menyimpan status visibilitas — halaman tidak boleh menampilkan tombol yang
 * seolah menyimpan padahal tidak.
 */
const respondedAtFormat = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

function formatRespondedAt(value: string | null) {
  if (!value) return "waktu tidak tercatat";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "waktu tidak tercatat" : respondedAtFormat.format(date);
}

export function WishesView({
  invitationId,
  wishes,
}: {
  invitationId: string;
  wishes: WishDto[];
}) {
  return (
    <section className="stack">
      <header className="workspace-title">
        <div>
          <p className="eyebrow">BUKU DOA &amp; UCAPAN · DATA TERSIMPAN</p>
          <h1>Buku Doa &amp; Ucapan</h1>
          <p className="billing-muted">
            {wishes.length === 0
              ? "Belum ada ucapan tersimpan untuk undangan ini."
              : `${wishes.length} ucapan tersimpan dari tamu undangan ini.`}
          </p>
        </div>
        <span className="badge">{wishes.length} ucapan</span>
      </header>

      <p className="notice">
        Ucapan tersimpan bersama respons tamu. Moderasi (sembunyikan/tampilkan) belum tersedia karena
        skema belum menyimpan status visibilitas; tidak ada ucapan yang dihapus atau disembunyikan
        oleh halaman ini.
      </p>

      {wishes.length === 0 ? (
        <article className="card stack">
          <h2>Belum ada ucapan</h2>
          <p>
            Ucapan akan muncul di sini setelah tamu mengirim pesan pada halaman konfirmasi mereka
            (<code>/u/&lt;token&gt;</code>), atau setelah Anda mencatat respons beserta pesan di tab
            Tamu.
          </p>
          <Link className="button secondary" href={`/dashboard/invitations/${invitationId}/guests`}>
            Buka tab Tamu
          </Link>
        </article>
      ) : (
        <div className="stack">
          {wishes.map((wish) => (
            <article className="card stack" key={wish.guestId}>
              <h2>{wish.guestName}</h2>
              <p>{wish.message}</p>
              <p className="billing-muted">
                <span className="badge">{rsvpStatusLabels[wish.status]}</span> · {wish.guestCount}{" "}
                orang · {formatRespondedAt(wish.respondedAt)}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
