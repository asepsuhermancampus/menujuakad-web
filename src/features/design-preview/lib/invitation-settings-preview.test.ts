import { describe, expect, it } from "vitest";
import {
  validatePreviewSlug,
  validPreviewPasscode,
  previewCalendarDate,
} from "./invitation-settings-preview";
import { rsvpSessionFixtures, latestRsvpFixture } from "../data/rsvp-session-fixtures";
import { guestsFixture } from "../data/guests-fixtures";
import { invitationFixture } from "../data/invitations-fixtures";
import {
  previewGuestOptions,
  invitationSettingsFixture,
} from "../data/invitation-preview-fixtures";

describe("simulations undangan dan sesi sintetis", () => {
  it("memvalidasi slug memakai aturan domain tanpa mengklaim tersedia", () => {
    expect(validatePreviewSlug(invitationSettingsFixture.slug)).toBeNull();
    for (const slug of ["a", "UPPER", "dua--hubung", "../admin", "login", "école"]) {
      expect(validatePreviewSlug(slug)).not.toBeNull();
    }
  });
  it("format kalender mengikuti zona waktu yang dipilih", () => {
    expect(previewCalendarDate("Asia/Jakarta", "id-ID")).toContain("09.00");
    expect(previewCalendarDate("Asia/Makassar", "id-ID")).toContain("10.00");
    expect(previewCalendarDate("Asia/Jayapura", "id-ID")).toContain("11.00");
    expect(validPreviewPasscode("1234")).toBe(true);
    for (const value of ["123", "12345", "abcd", "12 4"])
      expect(validPreviewPasscode(value)).toBe(false);
  });
  it("alokasi sesi hanya merujuk tamu hadir dan partySize tidak mengubah fixture", () => {
    expect(rsvpSessionFixtures.map((session) => session.attendees.length)).toEqual([24, 68]);
    for (const session of rsvpSessionFixtures) {
      expect(invitationFixture.events.some((event) => event.id === session.eventId)).toBe(true);
      expect(new Set(session.attendees.map((attendee) => attendee.guestId)).size).toBe(
        session.attendees.length,
      );
      expect(
        session.attendees.reduce((sum, attendee) => sum + attendee.partySize, 0),
      ).toBeLessThanOrEqual(session.exampleCapacity);
      for (const attendee of session.attendees) {
        expect(guestsFixture.find((guest) => guest.id === attendee.guestId)).toMatchObject({
          rsvpStatus: "ATTENDING",
          partySize: attendee.partySize,
        });
      }
    }
    expect(
      latestRsvpFixture.every((guest) => guest.respondedAt && guest.rsvpStatus !== "PENDING"),
    ).toBe(true);
    expect(previewGuestOptions[0].maxPartySize).toBe(2);
    expect(guestsFixture.every((guest) => guest.partySize === 1)).toBe(true);
  });
});
