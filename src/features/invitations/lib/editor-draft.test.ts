import { describe, expect, it } from "vitest";
import { editorFixture } from "@/features/design-preview/data/fixtures";
import { createEditorDraft, updateEditorDraft, validateEditorDraft } from "./editor-draft";
describe("draft editor lokal", () => {
  it("memisahkan perubahan dari fixture sumber", () => {
    const draft = createEditorDraft(editorFixture);
    const changed = updateEditorDraft(draft, "title", "Alya & Bima");
    expect(changed.title).toBe("Alya & Bima");
    expect(draft.title).toBe("Sarah & Dimas");
    expect(editorFixture.cover.title).toBe("Sarah & Dimas");
  });
  it("menolak judul kosong dan URL media executable", () => {
    expect(validateEditorDraft({ ...createEditorDraft(editorFixture), title: " " })).toContain(
      "Judul sampul wajib diisi.",
    );
    expect(
      validateEditorDraft({ ...createEditorDraft(editorFixture), videoUrl: "javascript:alert(1)" }),
    ).toContain("URL media harus menggunakan HTTPS.");
    expect(validateEditorDraft(createEditorDraft(editorFixture))).toEqual([]);
  });
});
