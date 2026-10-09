import type {
  GuestPreviewDto,
  GuestImportRowDto,
  RsvpStatus,
} from "@/features/design-preview/data/guests-fixtures";

export function filterGuests(
  guests: readonly GuestPreviewDto[],
  query: string,
  status: string,
  group: string,
) {
  return guests.filter(
    (guest) =>
      guest.displayName.toLocaleLowerCase("id").includes(query.trim().toLocaleLowerCase("id")) &&
      (status === "ALL" || guest.rsvpStatus === status) &&
      (group === "ALL" || guest.group === group),
  );
}
export function summarizeGuests(guests: readonly GuestPreviewDto[]) {
  const count = (status: RsvpStatus) =>
    guests.filter((guest) => guest.rsvpStatus === status).length;
  const sent = guests.filter((guest) => guest.deliveryStatus === "SENT_EXAMPLE").length;
  return {
    total: guests.length,
    seats: guests.reduce((total, guest) => total + guest.partySize, 0),
    sent,
    deliveryRatePercent: guests.length ? Math.round((sent / guests.length) * 100) : 0,
    attending: count("ATTENDING"),
    declining: count("NOT_ATTENDING"),
    maybe: count("MAYBE"),
    pending: count("PENDING"),
    attendanceRatePercent: guests.length
      ? Math.round((count("ATTENDING") / guests.length) * 100)
      : 0,
  };
}
/** Format impor contoh: satu nama;grup per baris. Tanpa nomor kontak/token tamu. */
export function validateGuestImport(
  text: string,
  guests: readonly GuestPreviewDto[],
): GuestImportRowDto[] {
  const seen = new Set(guests.map((guest) => guest.displayName.trim().toLocaleLowerCase("id")));
  return text
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line, index) => {
      const [name, rawGroup = "FRIENDS", ...extra] = line.split(";");
      const displayName = name.trim();
      const group = rawGroup.trim();
      const validGroup = group === "FAMILY" || group === "FRIENDS" || group === "COLLEAGUES";
      const key = displayName.toLocaleLowerCase("id");
      const invalid = !displayName || displayName.length > 80 || !validGroup || extra.length > 0;
      const duplicate = seen.has(key);
      if (!invalid) seen.add(key);
      return {
        rowNumber: index + 1,
        displayName,
        group: validGroup ? group : "FRIENDS",
        status: invalid ? "INVALID" : duplicate ? "DUPLICATE" : "VALID",
        issue: invalid
          ? "Nama 1–80 karakter dan grup FAMILY/FRIENDS/COLLEAGUES diperlukan."
          : duplicate
            ? "Nama sudah ada dalam contoh."
            : null,
      };
    });
}
function csvCell(value: string) {
  const safe = /^[\s]*[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}
export function guestCsv(guests: readonly GuestPreviewDto[]) {
  return (
    "Nama,Grup,RSVP\r\n" +
    guests
      .map((guest) => [guest.displayName, guest.group, guest.rsvpStatus].map(csvCell).join(","))
      .join("\r\n")
  );
}
