import { describe, expect, it } from "vitest";
import {
  guestsFixture,
  type GuestPreviewDto,
} from "@/features/design-preview/data/guests-fixtures";
import { filterGuests, guestCsv, summarizeGuests, validateGuestImport } from "./guest-preview";
describe("guest preview", () => {
  it("keeps maybe distinct and recalculates empty summaries", () => {
    expect(summarizeGuests(guestsFixture)).toMatchObject({
      total: 120,
      attending: 68,
      declining: 20,
      maybe: 12,
      pending: 20,
      attendanceRatePercent: 57,
    });
    expect(summarizeGuests([]).attendanceRatePercent).toBe(0);
  });
  it("jumlah kursi dan pengiriman berasal dari DTO, bukan jumlah tamu atau status RSVP", () => {
    const guests: readonly GuestPreviewDto[] = [
      { ...guestsFixture[0], partySize: 3, deliveryStatus: "NOT_SENT" },
      { ...guestsFixture[1], partySize: 2, rsvpStatus: "PENDING", deliveryStatus: "SENT_EXAMPLE" },
      { ...guestsFixture[2], partySize: 1, rsvpStatus: "MAYBE", deliveryStatus: "NOT_SENT" },
    ];
    expect(summarizeGuests(guests)).toEqual({
      total: 3,
      seats: 6,
      sent: 1,
      deliveryRatePercent: 33,
      attending: 1,
      declining: 0,
      maybe: 1,
      pending: 1,
      attendanceRatePercent: 33,
    });
  });
  it("ringkasan kosong memiliki nilai nol termasuk rasio pengiriman", () => {
    expect(summarizeGuests([])).toEqual({
      total: 0,
      seats: 0,
      sent: 0,
      deliveryRatePercent: 0,
      attending: 0,
      declining: 0,
      maybe: 0,
      pending: 0,
      attendanceRatePercent: 0,
    });
  });
  it("tambahan lokal memperbarui total dan kursi tanpa menaikkan pengiriman", () => {
    const original = [{ ...guestsFixture[0], partySize: 3 }];
    const before = summarizeGuests(original);
    const after = summarizeGuests([
      ...original,
      { ...guestsFixture[1], partySize: 2, rsvpStatus: "PENDING", deliveryStatus: "NOT_SENT" },
    ]);
    expect(before).toMatchObject({ total: 1, seats: 3, sent: 1, deliveryRatePercent: 100 });
    expect(after).toMatchObject({
      total: 2,
      seats: 5,
      sent: 1,
      deliveryRatePercent: 50,
      pending: 1,
      attendanceRatePercent: 50,
    });
    expect(original).toHaveLength(1);
  });
  it("combines search, status and group", () => {
    expect(filterGuests(guestsFixture, "  09 ", "MAYBE", "COLLEAGUES")).toHaveLength(10);
    expect(filterGuests(guestsFixture, "unknown", "ALL", "ALL")).toEqual([]);
  });
  it("rejects invalid and duplicate import rows without losing their values", () => {
    const rows = validateGuestImport(
      "Baru;FAMILY\nBaru;FRIENDS\n;FAMILY\nTamu Contoh 001;FAMILY\nSalah;UNKNOWN",
      guestsFixture,
    );
    expect(rows.map((row) => row.status)).toEqual([
      "VALID",
      "DUPLICATE",
      "INVALID",
      "DUPLICATE",
      "INVALID",
    ]);
    expect(rows[4].displayName).toBe("Salah");
  });
  it("neutralizes spreadsheet formula and escapes quotes", () => {
    expect(guestCsv([{ ...guestsFixture[0], displayName: ' =HYPERLINK("x")' }])).toContain(
      '"\' =HYPERLINK(""x"")"',
    );
  });
});
