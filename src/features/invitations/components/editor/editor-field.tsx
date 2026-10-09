"use client";
import type { EditorDraft } from "../../lib/editor-draft";
export type EditorFieldProps = {
  draft: EditorDraft;
  update: (field: string, value: string) => void;
};
export function EditorField({
  draft,
  update,
  name,
  label,
  type = "text",
  multiline = false,
}: EditorFieldProps & {
  name: string;
  label: string;
  type?: string;
  multiline?: boolean;
}) {
  return (
    <label>
      {label}
      {multiline ? (
        <textarea value={draft[name]} onChange={(e) => update(name, e.target.value)} />
      ) : (
        <input type={type} value={draft[name]} onChange={(e) => update(name, e.target.value)} />
      )}
    </label>
  );
}
export function EditorToggle({
  draft,
  update,
  name,
  label,
}: EditorFieldProps & { name: string; label: string }) {
  return (
    <label className="check">
      <input
        type="checkbox"
        checked={draft[name] === "true"}
        onChange={(e) => update(name, String(e.target.checked))}
      />
      {label}
    </label>
  );
}
