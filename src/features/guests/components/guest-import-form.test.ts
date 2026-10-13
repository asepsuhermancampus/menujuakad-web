import { expect, it } from "vitest";
import { parseGuestRows } from "./guest-import-form";
import { whatsappHref } from "../lib/guest-domain-labels";

it("parses name-only and name;category rows, defaulting to FRIEND", () => {
  const rows = parseGuestRows("Budi Santoso\nSiti Aminah;FAMILY");
  expect(rows).toHaveLength(2);
  expect(rows[0]).toMatchObject({ name: "Budi Santoso", category: "FRIEND", valid: true });
  expect(rows[1]).toMatchObject({ name: "Siti Aminah", category: "FAMILY", valid: true });
});

it("flags empty names, unknown categories, extra columns, and duplicates", () => {
  const rows = parseGuestRows(";FAMILY\nBudi;TETANGGA\nSiti;FRIEND;ekstra\nRina\nRINA");
  expect(rows[0].valid).toBe(false);
  expect(rows[0].issue).toContain("Nama kosong");
  expect(rows[1].valid).toBe(false);
  expect(rows[1].issue).toContain("Kategori tidak dikenal");
  expect(rows[2].valid).toBe(false);
  expect(rows[2].issue).toContain("Terlalu banyak kolom");
  /* Duplikat tidak peka huruf besar/kecil. */
  expect(rows[3].valid).toBe(true);
  expect(rows[4].valid).toBe(false);
  expect(rows[4].issue).toContain("Duplikat");
});

it("ignores blank lines and trims whitespace", () => {
  const rows = parseGuestRows("\n  Budi Santoso  \n\n\n");
  expect(rows).toHaveLength(1);
  expect(rows[0].name).toBe("Budi Santoso");
});

it("normalizes Indonesian phone numbers into wa.me links", () => {
  expect(whatsappHref("08123456789", "Halo")).toBe(
    "https://wa.me/628123456789?text=Halo",
  );
  expect(whatsappHref("+62 812-3456-789", "Halo")).toContain("https://wa.me/628123456789");
  expect(whatsappHref("8123456789", "Halo")).toContain("https://wa.me/628123456789");
  /* Nomor tidak ada / terlalu pendek tidak menghasilkan tautan rusak. */
  expect(whatsappHref(null, "Halo")).toBeNull();
  expect(whatsappHref("0812", "Halo")).toBeNull();
});
