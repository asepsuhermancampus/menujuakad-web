import "server-only";
import { z } from "zod";
import { invitationSlugSchema } from "@/features/invitations/schemas/slug";
const text = (max: number) => z.string().trim().max(max);
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }, "Tanggal tidak valid.");
const timezone = z.enum(["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"]);
export const sectionSchemas = {
  cover: z.object({ heading: text(160), message: text(2000) }).strict(),
  event: z
    .object({
      name: text(160),
      date: date.nullable(),
      time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
      venue: text(240),
      address: text(1000),
    })
    .strict(),
  story: z.object({ text: text(6000) }).strict(),
  rsvp: z.object({ enabled: z.boolean(), deadline: date.nullable() }).strict(),
};
const couple = z
  .object({
    groomFullName: text(160),
    groomNickname: text(80),
    groomParents: text(240),
    groomBio: text(1500),
    brideFullName: text(160),
    brideNickname: text(80),
    brideParents: text(240),
    brideBio: text(1500),
  })
  .strict();
const base = {
  title: text(160).min(3),
  slug: invitationSlugSchema,
  weddingDate: date.nullable(),
  timezone,
};
export const createInvitationSchema = z
  .object({
    ...base,
    weddingDate: base.weddingDate.default(null),
    timezone: timezone.default("Asia/Jakarta"),
    templateId: z.string().min(1).max(128),
  })
  .strict();
export const updateInvitationSchema = z
  .object({
    ...base,
    couple,
    sections: z
      .object({
        cover: sectionSchemas.cover.optional(),
        event: sectionSchemas.event.optional(),
        story: sectionSchemas.story.optional(),
        rsvp: sectionSchemas.rsvp.optional(),
      })
      .strict()
      .refine((value) => Object.keys(value).length > 0),
  })
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0);
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type UpdateInvitationInput = z.infer<typeof updateInvitationSchema>;
