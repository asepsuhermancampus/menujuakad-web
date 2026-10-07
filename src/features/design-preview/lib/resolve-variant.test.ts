import { describe, expect, it } from "vitest";
import { getPreviewScreen } from "../data/screens";
import { resolveScreenVariant } from "./resolve-variant";
describe("pilihan varian preview", () => {
  it("hanya menerima varian milik kode yang sama", () => {
    const cover = getPreviewScreen("INV-01")!;
    const editor = getPreviewScreen("EDT-02")!;
    expect(resolveScreenVariant(cover, editor.id)).toBeUndefined();
    expect(resolveScreenVariant(cover, "../etc/passwd")).toBeUndefined();
    expect(resolveScreenVariant(cover)).toEqual(cover);
    const invalid = cover.variants.find((v) => v.state.includes("Tidak Valid"))!;
    expect(resolveScreenVariant(cover, invalid.id)?.state).toContain("Tidak Valid");
  });
});
