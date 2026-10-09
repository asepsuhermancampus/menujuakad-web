import { invitationSlugSchema } from "@/features/invitations/schemas/slug";

/** Validasi format saja; ketersediaan slug memerlukan query server yang belum dipakai preview. */
export function validatePreviewSlug(slug: string): string | null {
  const result = invitationSlugSchema.safeParse(slug);
  return result.success ? null : result.error.issues[0].message;
}
export function previewCalendarDate(timeZone: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
    timeStyle: "short",
    timeZone,
  }).format(new Date("2026-12-12T02:00:00.000Z"));
}
export function validPreviewPasscode(value: string) {
  return /^[0-9]{4}$/.test(value);
}
