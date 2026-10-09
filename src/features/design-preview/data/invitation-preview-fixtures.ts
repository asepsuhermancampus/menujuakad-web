import { guestsFixture } from "./guests-fixtures";
import { invitationFixture } from "./invitations-fixtures";

/** Kuota uji terpisah dari guest fixture satu orang; bukan jatah undangan nyata. */
export const previewGuestOptions = guestsFixture.slice(0, 3).map((guest, index) => ({
  id: guest.id,
  displayName: guest.displayName,
  maxPartySize: index === 0 ? 2 : 1,
}));
export const invitationSettingsFixture = Object.freeze({
  slug: invitationFixture.slug,
  timeZone: "Asia/Jakarta",
  calendarLocale: "id-ID",
  noindex: true,
  moderation: true,
  rsvpDeadline: null,
  exampleArchiveUntil: "2027-12-12",
});
export const previewViewports = [
  { id: "MOBILE", label: "Mobile", width: 390 },
  { id: "TABLET", label: "Tablet", width: 768 },
  { id: "DESKTOP", label: "Desktop", width: 1440 },
] as const;
