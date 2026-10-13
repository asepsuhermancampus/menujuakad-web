/*
 * Label domain tamu untuk UI NYATA (data database). Sengaja terpisah dari
 * lib/guest-labels.ts milik fixture design-preview agar komponen produksi
 * tidak pernah mengimpor data contoh.
 */
export const GUEST_CATEGORY_OPTIONS = [
  { value: "FAMILY", label: "Keluarga" },
  { value: "FRIEND", label: "Sahabat" },
  { value: "WORK", label: "Rekan Kerja" },
  { value: "VIP", label: "VIP" },
  { value: "VENDOR", label: "Vendor" },
  { value: "OTHER", label: "Lainnya" },
] as const;

export const guestCategoryLabels: Record<string, string> = Object.fromEntries(
  GUEST_CATEGORY_OPTIONS.map((option) => [option.value, option.label]),
);

export const RSVP_STATUS_OPTIONS = [
  { value: "ATTENDING", label: "Hadir" },
  { value: "NOT_ATTENDING", label: "Tidak hadir" },
  { value: "MAYBE", label: "Masih ragu" },
  { value: "PENDING", label: "Belum menjawab" },
] as const;

export const rsvpStatusLabels: Record<string, string> = Object.fromEntries(
  RSVP_STATUS_OPTIONS.map((option) => [option.value, option.label]),
);

/*
 * Tautan WhatsApp dari nomor apa pun: hanya digit, awalan 62 (E.164 Indonesia).
 * Mengembalikan null bila nomor tidak ada atau terlalu pendek agar UI tidak
 * menampilkan tautan rusak.
 */
export function whatsappHref(phone: string | null, text: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("62")
    ? digits
    : digits.startsWith("0")
      ? `62${digits.slice(1)}`
      : `62${digits}`;
  if (normalized.length < 9) return null;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
}
