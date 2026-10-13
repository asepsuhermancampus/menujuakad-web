import "server-only";
import { z } from "zod";

/*
 * Kontrak input RSVP publik (dibuka lewat tautan personal tamu).
 * Hanya field yang boleh dikirim tamu; nama/undangan/kursi ditentukan server
 * dari token, bukan dari body, agar tidak bisa dipalsukan.
 */
const text = (max: number) => z.string().trim().max(max);
const phone = z
  .string()
  .trim()
  .max(32)
  .regex(/^[+()\d\s-]{5,32}$/, "Nomor telepon tidak valid.");

export const publicRsvpStatusSchema = z.enum(["ATTENDING", "NOT_ATTENDING", "MAYBE"]);

export const publicRsvpSchema = z
  .object({
    status: publicRsvpStatusSchema,
    /* Jumlah hadir 0..10; batas alokasi kursi tamu diperiksa di repository. */
    guestCount: z.number().int().min(0).max(10).default(0),
    phone: phone.nullable().default(null),
    message: text(1000).nullable().default(null),
  })
  .strict();

/* Token personal: base64url 32 byte = 43 karakter; hanya bentuk ini diterima. */
export const personalTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/);

export type PublicRsvpInput = z.infer<typeof publicRsvpSchema>;
