"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RSVP_STATUS_OPTIONS } from "@/features/guests/lib/guest-domain-labels";

/*
 * Form RSVP publik untuk tamu (tanpa login). Identitas tamu HANYA berasal dari
 * token pada URL; formulir tidak mengirim nama/tamu/undangan sama sekali —
 * hanya status kehadiran, jumlah orang, kontak opsional, dan ucapan.
 */

const PUBLIC_STATUS_OPTIONS = RSVP_STATUS_OPTIONS.filter((option) => option.value !== "PENDING");

export type PublicRsvpCurrent = {
  status: string;
  guestCount: number;
  message: string | null;
} | null;

export function PublicRsvpForm({
  personalToken,
  guestCountAllowed,
  current,
}: {
  personalToken: string;
  guestCountAllowed: number;
  current: PublicRsvpCurrent;
}) {
  /* Status PENDING (dibuat pemilik) tidak valid dari sisi tamu; mulai default. */
  const initialStatus =
    current && current.status !== "PENDING" ? current.status : "ATTENDING";
  const [status, setStatus] = useState(initialStatus);
  const [guestCount, setGuestCount] = useState(current?.guestCount || 1);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [saved, setSaved] = useState(Boolean(current?.status));

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    setFailed(false);
    try {
      const data = new FormData(event.currentTarget);
      const response = await fetch(`/api/public/rsvp/${personalToken}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          guestCount: status === "ATTENDING" ? Number(guestCount) : 0,
          phone: String(data.get("phone") ?? "").trim() || null,
          message: String(data.get("message") ?? "").trim() || null,
        }),
      });
      const result = response.status === 204 ? {} : await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message ?? "Respons gagal dikirim.");
      setSaved(true);
      setMessage("Terima kasih. Konfirmasi kehadiran Anda sudah kami terima.");
    } catch (error) {
      setFailed(true);
      setMessage(error instanceof Error ? error.message : "Layanan belum tersedia. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="stack" onSubmit={submit} noValidate>
      <fieldset className="stack" disabled={pending}>
        <legend className="sr-only">Konfirmasi kehadiran</legend>
        <label>
          Kehadiran
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            {PUBLIC_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {status === "ATTENDING" && (
          <label>
            Jumlah orang yang hadir (maks {guestCountAllowed})
            <input
              type="number"
              min={1}
              max={guestCountAllowed}
              value={guestCount}
              onChange={(event) => setGuestCount(Number(event.target.value))}
            />
          </label>
        )}
        <label>
          Nomor WhatsApp (opsional)
          <input name="phone" inputMode="tel" maxLength={32} defaultValue="" />
        </label>
        <label>
          Ucapan & doa (opsional)
          <textarea name="message" maxLength={1000} rows={3} defaultValue={current?.message ?? ""} />
        </label>
      </fieldset>
      <div className="actions">
        <Button type="submit" disabled={pending}>
          {pending ? "Mengirim…" : saved ? "Perbarui konfirmasi" : "Kirim konfirmasi"}
        </Button>
      </div>
      {message && <p role={failed ? "alert" : "status"}>{message}</p>}
    </form>
  );
}
