"use client";
import type { FormEvent } from "react";
import type { InvitationDto } from "@/server/invitations/dto";
import { Button } from "@/components/ui/button";
import { useWorkspaceMutation } from "../use-workspace-mutation";
import { editorPayload } from "../editor-payload";
import { EditorFields } from "./editor-fields";
export function InvitationEditorForm({ invitation }: { invitation: InvitationDto }) {
  const mutation = useWorkspaceMutation();
  const readOnly = invitation.status !== "DRAFT" || invitation.isPublished;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void mutation.mutate(
      `/api/customer/invitations/${invitation.id}`,
      "PATCH",
      editorPayload(new FormData(event.currentTarget)),
    );
  }
  return (
    <form className="card stack" onSubmit={submit}>
      <p>Isi berupa teks biasa. Simpan manual untuk mempertahankan perubahan setelah reload.</p>
      {readOnly && (
        <p className="notice">Undangan ini hanya dapat dibaca karena bukan draft privat.</p>
      )}
      <fieldset className="stack" disabled={mutation.pending || readOnly}>
        <legend>Isi undangan</legend>
        <EditorFields invitation={invitation} />
        <Button type="submit">{mutation.pending ? "Menyimpan…" : "Simpan Isi Undangan"}</Button>
      </fieldset>
      {mutation.message && <p role={mutation.failed ? "alert" : "status"}>{mutation.message}</p>}
    </form>
  );
}
