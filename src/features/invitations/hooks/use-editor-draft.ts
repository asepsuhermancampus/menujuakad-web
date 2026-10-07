"use client";
import { useState } from "react";
import type { EditorPreviewDto } from "@/features/design-preview/data/fixtures";
import { createEditorDraft, updateEditorDraft, validateEditorDraft } from "../lib/editor-draft";
export function useEditorDraft(fixture: EditorPreviewDto) {
  const [draft, setDraft] = useState(() => createEditorDraft(fixture));
  const [message, setMessage] = useState("Belum ada perubahan lokal.");
  const [dirty, setDirty] = useState(false);
  const update = (field: string, value: string) => {
    setDraft((previous) => updateEditorDraft(previous, field, value));
    setDirty(true);
    setMessage("Perubahan lokal belum disimpan.");
  };
  const save = () => {
    const errors = validateEditorDraft(draft);
    if (errors.length) {
      setMessage(errors.join(" "));
      return;
    }
    setDirty(false);
    setMessage("Tersimpan lokal sampai halaman dimuat ulang. Tidak diterbitkan ke layanan.");
  };
  return { draft, dirty, message, update, save, setMessage };
}
