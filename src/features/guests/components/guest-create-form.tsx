"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWorkspaceMutation } from "@/features/workspace/use-workspace-mutation";
import type { GuestDto } from "@/server/guests/dto";
import { GUEST_CATEGORY_OPTIONS } from "../lib/guest-domain-labels";

/*
 * Form tambah tamu. Kontrak server: POST /api/customer/invitations/[id]/guests
 * dengan { name, phone, email, category, guestCountAllowed, notes }.
 */
export function GuestCreateForm({ invitationId }: { invitationId: string }) {
  const mutation = useWorkspaceMutation();
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <div className="actions">
        <Button onClick={() => setOpen(true)}>Tambah Tamu</Button>
      </div>
    );
  return (
    <form
      className="card stack"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        void mutation
          .mutate(`/api/customer/invitations/${invitationId}/guests`, "POST", {
            name: String(data.get("name") ?? ""),
            phone: String(data.get("phone") ?? "") || null,
            email: String(data.get("email") ?? "") || null,
            category: String(data.get("category") ?? "OTHER"),
            guestCountAllowed: Number(data.get("guestCountAllowed") ?? 1),
            notes: String(data.get("notes") ?? "") || null,
          })
          .then(() => setOpen(false));
      }}
    >
      <h2>Tambah Tamu</h2>
      <label>
        Nama tamu
        <input name="name" maxLength={120} required autoComplete="off" />
      </label>
      <div className="grid-two">
        <label>
          Nomor WhatsApp (opsional)
          <input name="phone" maxLength={32} inputMode="tel" placeholder="0812…" />
        </label>
        <label>
          Email (opsional)
          <input name="email" type="email" maxLength={254} />
        </label>
      </div>
      <div className="grid-two">
        <label>
          Kategori
          <select name="category" defaultValue="FRIEND">
            {GUEST_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Alokasi kursi
          <input
            name="guestCountAllowed"
            type="number"
            min={1}
            max={10}
            defaultValue={1}
            required
          />
        </label>
      </div>
      <label>
        Catatan (opsional)
        <input name="notes" maxLength={500} />
      </label>
      <div className="actions">
        <Button type="submit" disabled={mutation.pending}>
          {mutation.pending ? "Menyimpan…" : "Simpan Tamu"}
        </Button>
        <Button type="button" className="secondary" onClick={() => setOpen(false)}>
          Batal
        </Button>
      </div>
      {mutation.message && <p role={mutation.failed ? "alert" : "status"}>{mutation.message}</p>}
    </form>
  );
}

/* Tombol arsip: tamu diarsipkan (bukan dihapus) agar riwayat RSVP tetap utuh. */
export function GuestArchiveButton({
  invitationId,
  guest,
}: {
  invitationId: string;
  guest: GuestDto;
}) {
  const mutation = useWorkspaceMutation();
  const [confirm, setConfirm] = useState(false);
  if (!confirm)
    return (
      <Button className="secondary" onClick={() => setConfirm(true)}>
        Arsipkan
      </Button>
    );
  return (
    <span className="actions">
      <Button
        className="secondary"
        disabled={mutation.pending}
        onClick={() =>
          void mutation.mutate(
            `/api/customer/invitations/${invitationId}/guests/${guest.id}`,
            "DELETE",
            {},
          )
        }
      >
        {mutation.pending ? "Mengarsipkan…" : "Ya, arsipkan"}
      </Button>
      <Button className="secondary" onClick={() => setConfirm(false)}>
        Batal
      </Button>
      {mutation.message && <span role={mutation.failed ? "alert" : "status"}>{mutation.message}</span>}
    </span>
  );
}
