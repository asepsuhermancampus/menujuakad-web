import "server-only";
import { z } from "zod";

/*
 * Kontrak input domain tamu. Batas panjang mengikuti kolom database
 * (VARCHAR) agar kesalahan tertangkap sebelum menyentuh repository.
 */
const text = (max: number) => z.string().trim().max(max);
const name = text(120).min(1, "Nama tamu wajib diisi.");
/* Nomor telepon disimpan apa adanya; normalisasi E.164 dilakukan di layer aksi. */
const phone = z
  .string()
  .trim()
  .max(32)
  .regex(/^[+()\d\s-]{5,32}$/, "Nomor telepon tidak valid.");
const email = z.string().trim().toLowerCase().email("Email tidak valid.").max(254);

export const guestCategorySchema = z.enum(["FAMILY", "FRIEND", "WORK", "VIP", "VENDOR", "OTHER"]);
export const rsvpStatusSchema = z.enum(["ATTENDING", "NOT_ATTENDING", "MAYBE", "PENDING"]);

const guestFields = {
  name,
  phone: phone.nullable(),
  email: email.nullable(),
  category: guestCategorySchema,
  /* Alokasi kursi 1..10: cukup untuk keluarga inti, menahan input tak wajar. */
  guestCountAllowed: z.number().int().min(1).max(10),
  notes: text(500).nullable(),
};

export const createGuestSchema = z
  .object({
    name: guestFields.name,
    phone: guestFields.phone.default(null),
    email: guestFields.email.default(null),
    category: guestFields.category.default("OTHER"),
    guestCountAllowed: guestFields.guestCountAllowed.default(1),
    notes: guestFields.notes.default(null),
  })
  .strict();

export const updateGuestSchema = z
  .object(guestFields)
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, "Tidak ada perubahan yang dikirim.");

/* Impor massal: satu baris per tamu, diproses seluruhnya dalam satu transaksi. */
export const bulkGuestSchema = z
  .object({
    guests: z
      .array(
        z
          .object({
            name: guestFields.name,
            phone: guestFields.phone.default(null),
            category: guestFields.category.default("OTHER"),
            guestCountAllowed: guestFields.guestCountAllowed.default(1),
          })
          .strict(),
      )
      .min(1, "Minimal satu tamu.")
      .max(500, "Maksimal 500 tamu per impor."),
  })
  .strict();

/* Input RSVP dari pemilik undangan (pencatatan manual respons tamu). */
export const updateRsvpSchema = z
  .object({
    status: rsvpStatusSchema,
    guestCount: z.number().int().min(0).max(10).default(0),
    phone: phone.nullable().default(null),
    message: text(1000).nullable().default(null),
  })
  .strict();

export type CreateGuestInput = z.infer<typeof createGuestSchema>;
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;
export type BulkGuestInput = z.infer<typeof bulkGuestSchema>;
export type UpdateRsvpInput = z.infer<typeof updateRsvpSchema>;
