import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Icon } from "@/components/ui/icon";
import { PublicRsvpForm } from "@/features/guests/components/public-rsvp-form";
import { getPublicRsvpContext } from "@/server/guests/public-service";
import { WorkspaceError } from "@/server/invitations/errors";

/*
 * Halaman RSVP publik lewat tautan personal tamu (`/u/[token]`).
 *
 * Token adalah kapabilitas acak 32 byte; halaman tidak pernah menampilkan
 * identitas tamu lain, daftar tamu, atau kontak siapa pun. Token tidak valid
 * menghasilkan 404 netral (lihat not-found.tsx) tanpa membocorkan apakah token
 * "hampir benar". Halaman selalu noindex dan tidak pernah masuk sitemap.
 *
 * `generateMetadata` memuat konteks lebih dulu dan memanggil `notFound()`
 * SEBELUM streaming dimulai, sehingga respons benar-benar berstatus 404 —
 * bukan shell 200 yang lalu berubah di tengah. Konteks di-cache per request
 * supaya halaman tidak melakukan query kedua.
 *
 * Kegagalan infrastruktur (DB mati) TIDAK disamarkan sebagai 404: tamu melihat
 * pesan layanan belum tersedia agar tidak menyimpulkan tautannya rusak.
 */

export const dynamic = "force-dynamic";

type RsvpContext = Awaited<ReturnType<typeof getPublicRsvpContext>>;
const loadContext = cache(async (token: string): Promise<RsvpContext | "unavailable"> => {
  try {
    return await getPublicRsvpContext(token);
  } catch (error) {
    if (error instanceof WorkspaceError && error.status === 404) notFound();
    return "unavailable";
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  await loadContext(token);
  return {
    title: "Konfirmasi Kehadiran",
    robots: { index: false, follow: false },
  };
}

function Unavailable() {
  return (
    <main id="main" className="invitation-canvas">
      <section className="invitation-cover invitation-cover-invalid">
        <span className="invitation-seal" aria-hidden="true">
          <Icon name="shield" size={22} />
        </span>
        <p className="aura-label">Menuju Akad</p>
        <h1>Layanan Konfirmasi Belum Tersedia</h1>
        <p>
          Halaman konfirmasi kehadiran sedang tidak dapat diakses. Silakan coba lagi beberapa saat
          lagi.
        </p>
        <Link className="button" href="/">
          Kembali ke Beranda
        </Link>
        <small>Menuju Akad</small>
      </section>
    </main>
  );
}

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const context = await loadContext(token);
  if (context === "unavailable") return <Unavailable />;
  return (
    <main id="main" className="invitation-canvas">
      <section className="invitation-cover">
        <div className="invitation-cover-top">
          <span className="invitation-seal" aria-hidden="true">
            <Icon name="favorite" size={22} />
          </span>
          <p className="aura-label">Konfirmasi Kehadiran</p>
          <h1>{context.invitationTitle}</h1>
          {context.weddingDate && (
            <p className="invitation-partners">
              {new Date(`${context.weddingDate}T00:00:00Z`).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              })}
            </p>
          )}
        </div>
        <div className="invitation-rule" />
        <div className="invitation-addressee">
          <p>Kepada Yth.</p>
          <h2>{context.guestName}</h2>
          <span className="invitation-addressee-badge">
            {context.rsvp && context.rsvp.status !== "PENDING"
              ? `Sudah menjawab: ${
                  context.rsvp.status === "ATTENDING"
                    ? "hadir"
                    : context.rsvp.status === "NOT_ATTENDING"
                      ? "tidak hadir"
                      : "masih ragu"
                }`
              : `Alokasi kursi: ${context.guestCountAllowed} orang`}
          </span>
          <p>
            Mohon konfirmasi kehadiran Anda. Respons tersimpan pada undangan ini dan dapat diubah
            kapan saja lewat tautan yang sama.
          </p>
        </div>
        <PublicRsvpForm
          personalToken={token}
          guestCountAllowed={context.guestCountAllowed}
          current={
            context.rsvp
              ? {
                  status: context.rsvp.status,
                  guestCount: context.rsvp.guestCount,
                  message: context.rsvp.message,
                }
              : null
          }
        />
      </section>
    </main>
  );
}
