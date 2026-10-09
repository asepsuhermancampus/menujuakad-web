import { guestsFixture } from "./guests-fixtures";
import { invitationFixture } from "./invitations-fixtures";

/** Alokasi ilustratif; tamu dapat hadir di dua sesi, sehingga jumlah sesi bukan tamu unik. */
export const rsvpSessionFixtures = invitationFixture.events.map((event, index) => ({
  eventId: event.id,
  title: event.title,
  timeLabel: index === 0 ? "09.00–10.00 WIB" : "11.00–14.00 WIB",
  exampleCapacity: index === 0 ? 40 : 100,
  attendees: guestsFixture
    .filter((guest) => guest.rsvpStatus === "ATTENDING")
    .slice(0, index === 0 ? 24 : 68)
    .map((guest) => ({ guestId: guest.id, partySize: guest.partySize })),
}));
/** Kebutuhan dibuat untuk ilustrasi agregat, tanpa identitas/detail medis sumber. */
export const guestNeedsFixture = [
  {
    id: "demo-needs-menu",
    title: "Preferensi Menu Tamu",
    count: 3,
    label: "3 kebutuhan menu contoh",
    description:
      "Siapkan pilihan menu alternatif. Detail kebutuhan tidak ditampilkan pada preview.",
  },
  {
    id: "demo-needs-access",
    title: "Aksesibilitas & Pendampingan",
    count: 2,
    label: "2 kebutuhan akses contoh",
    description:
      "Ilustrasi jalur akses tanpa tangga dan kursi pendamping. Bukan data kebutuhan tamu nyata.",
  },
] as const;
export const latestRsvpFixture = [0, 1, 68, 88, 2].map((index) => guestsFixture[index]);
