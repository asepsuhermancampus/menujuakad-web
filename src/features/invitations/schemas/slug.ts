import { z } from "zod";
import { RESERVED_SLUGS } from "@/config/routes";

const reservedSlugs = new Set<string>(RESERVED_SLUGS);

export const invitationSlugSchema = z
  .string()
  .min(3, "Alamat undangan minimal 3 karakter.")
  .max(80, "Alamat undangan maksimal 80 karakter.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Gunakan huruf kecil, angka, dan tanda hubung.")
  .refine((slug) => !reservedSlugs.has(slug), "Alamat ini digunakan oleh Menuju Akad.");
