"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWorkspaceMutation } from "../use-workspace-mutation";
export function DeleteDraftButton({ id }: { id: string }) {
  const [confirm, setConfirm] = useState(false);
  const mutation = useWorkspaceMutation();
  return (
    <div className="stack">
      {confirm ? (
        <>
          <p>Hapus draft ini beserta isi editornya? Tindakan ini tidak dapat dipulihkan.</p>
          <div className="actions">
            <Button
              disabled={mutation.pending}
              onClick={() =>
                void mutation.mutate(
                  `/api/customer/invitations/${id}`,
                  "DELETE",
                  {},
                  "/dashboard/invitations",
                )
              }
            >
              Ya, Hapus Draft
            </Button>
            <Button
              disabled={mutation.pending}
              className="secondary"
              onClick={() => setConfirm(false)}
            >
              Batal
            </Button>
          </div>
        </>
      ) : (
        <Button className="secondary" onClick={() => setConfirm(true)}>
          Hapus Draft
        </Button>
      )}
      {mutation.message && <p role={mutation.failed ? "alert" : "status"}>{mutation.message}</p>}
    </div>
  );
}
