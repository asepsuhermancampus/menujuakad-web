"use client";
import type { FormEvent } from "react";
import type { InvitationDto } from "@/server/invitations/dto";
import { Button } from "@/components/ui/button";
import { useWorkspaceMutation } from "../use-workspace-mutation";
export function InvitationSettingsForm({ invitation }: { invitation: InvitationDto }) {
  const mutation = useWorkspaceMutation();
  const readOnly = invitation.status !== "DRAFT" || invitation.isPublished;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void mutation.mutate(`/api/customer/invitations/${invitation.id}`, "PATCH", {
      title: data.get("title"),
      slug: data.get("slug"),
      weddingDate: data.get("weddingDate") || null,
      timezone: data.get("timezone"),
    });
  }
  return (
    <form onSubmit={submit} className="card stack">
      <fieldset className="stack" disabled={mutation.pending || readOnly}>
        <legend>Pengaturan draft</legend>
        <label>
          Judul
          <input
            name="title"
            required
            minLength={3}
            maxLength={160}
            defaultValue={invitation.title}
          />
        </label>
        <label>
          Alamat undangan
          <input
            name="slug"
            required
            minLength={3}
            maxLength={80}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            defaultValue={invitation.slug}
          />
        </label>
        <label>
          Tanggal pernikahan
          <input name="weddingDate" type="date" defaultValue={invitation.weddingDate ?? ""} />
        </label>
        <label>
          Zona waktu
          <select name="timezone" defaultValue={invitation.timezone}>
            <option>Asia/Jakarta</option>
            <option>Asia/Makassar</option>
            <option>Asia/Jayapura</option>
          </select>
        </label>
        <Button type="submit">{mutation.pending ? "Menyimpan…" : "Simpan Pengaturan"}</Button>
      </fieldset>
      <p>Publikasi dan masa aktif komersial belum tersedia. Draft tetap privat.</p>
      {mutation.message && <p role={mutation.failed ? "alert" : "status"}>{mutation.message}</p>}
    </form>
  );
}
