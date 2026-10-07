import { describe, expect, it } from "vitest";
import { editorFixture, galleryErrorFixture } from "@/features/design-preview/data/fixtures";
import { galleryUsed } from "./gallery-quota";
describe("kuota galeri sintetis", () => {
  it("mempertahankan pemakaian sumber yang tidak seluruh itemnya dirender", () => {
    expect(galleryUsed(galleryErrorFixture.gallery, galleryErrorFixture.gallery, 20)).toBe(20);
    expect(galleryUsed(galleryErrorFixture.gallery, galleryErrorFixture.gallery.slice(1), 20)).toBe(
      19,
    );
  });
  it("item error tidak memakai kuota, item lokal ready menambah kuota", () => {
    const item = { id: "local-01", status: "READY" as const, label: "Ilustrasi", sizeBytes: 1000 };
    expect(galleryUsed(editorFixture.gallery, [...editorFixture.gallery, item], 2)).toBe(3);
  });
});
