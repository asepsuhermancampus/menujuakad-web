import { describe, expect, it } from "vitest";
import { RESERVED_SLUGS } from "@/config/routes";
import { invitationSlugSchema } from "./slug";

describe("alamat undangan", () => {
  it("menerima alamat pasangan dan batas panjang yang diizinkan", () => {
    for (const slug of ["asep-kirana", "eva", "rani-2027", "a".repeat(80)]) {
      expect(invitationSlugSchema.safeParse(slug).success).toBe(true);
    }
  });

  it.each(["about", "terms", "privacy", "preview-ui", "how-it-works", "fonts"])(
    "melindungi rute publik slicing %s",
    (slug) => {
      expect(invitationSlugSchema.safeParse(slug).success).toBe(false);
    },
  );

  it.each(RESERVED_SLUGS)("melindungi rute sistem %s", (slug) => {
    expect(invitationSlugSchema.safeParse(slug).success).toBe(false);
  });

  it.each([
    "",
    "ab",
    "a".repeat(81),
    "Asep-Kirana",
    "-asep",
    "asep-",
    "a--b",
    "a/b",
    "../admin",
    "asep kirana",
    "<script>",
    "éva-rani",
  ])("menolak format tidak aman: %s", (slug) =>
    expect(invitationSlugSchema.safeParse(slug).success).toBe(false),
  );
});
