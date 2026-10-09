"use client";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { useWorkspaceMutation } from "../use-workspace-mutation";
export function CreateInvitationForm({ templates }: { templates: { id: string; name: string }[] }) {
  const mutation = useWorkspaceMutation();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void mutation.mutate("/api/customer/invitations", "POST", {
      title: data.get("title"),
      slug: data.get("slug"),
      templateId: data.get("templateId"),
      weddingDate: data.get("weddingDate") || null,
      timezone: data.get("timezone"),
    });
  }
  if (!templates.length)
    return <p role="alert">Template internal pengujian belum tersedia. Hubungi administrator.</p>;
  return (
    <form className="card stack" onSubmit={submit}>
      <fieldset disabled={mutation.pending} className="stack">
        <legend>Draft baru</legend>
        <label>
          Judul undangan
          <input name="title" required minLength={3} maxLength={160} />
        </label>
        <label>
          Alamat draft
          <input
            name="slug"
            required
            minLength={3}
            maxLength={80}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            placeholder="nama-undangan-uji"
          />
        </label>
        <label>
          Tanggal pernikahan
          <input type="date" name="weddingDate" />
        </label>
        <label>
          Zona waktu
          <select name="timezone">
            <option>Asia/Jakarta</option>
            <option>Asia/Makassar</option>
            <option>Asia/Jayapura</option>
          </select>
        </label>
        <label>
          Template pengujian
          <select name="templateId">
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </label>
        <p>Draft bersifat privat; membuat draft tidak mengaktifkan undangan publik.</p>
        <Button type="submit">{mutation.pending ? "Menyimpan…" : "Buat Draft"}</Button>
      </fieldset>
      {mutation.message && <p role={mutation.failed ? "alert" : "status"}>{mutation.message}</p>}
    </form>
  );
}
