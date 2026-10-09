import "server-only";
import type { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { sectionSchemas } from "./input";
export const invitationSelect = {
  id: true,
  title: true,
  slug: true,
  status: true,
  weddingDate: true,
  timezone: true,
  isPublished: true,
  createdAt: true,
  updatedAt: true,
  template: { select: { id: true, name: true } },
  coupleProfile: {
    select: {
      groomFullName: true,
      groomNickname: true,
      groomParents: true,
      groomBio: true,
      brideFullName: true,
      brideNickname: true,
      brideParents: true,
      brideBio: true,
    },
  },
  sections: { select: { type: true, configJson: true }, orderBy: { sortOrder: "asc" } },
} satisfies Prisma.InvitationSelect;
type Record = Prisma.InvitationGetPayload<{ select: typeof invitationSelect }>;
export function invitationDto(row: Record) {
  const parse = <T>(schema: z.ZodType<T>, type: string) => {
    const result = schema.safeParse(
      row.sections.find((section) => section.type === type)?.configJson,
    );
    return result.success ? result.data : null;
  };
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: row.status,
    weddingDate: row.weddingDate?.toISOString().slice(0, 10) ?? null,
    timezone: row.timezone,
    isPublished: row.isPublished,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    template: row.template,
    couple: row.coupleProfile,
    sections: {
      cover: parse(sectionSchemas.cover, "COVER"),
      event: parse(sectionSchemas.event, "EVENT"),
      story: parse(sectionSchemas.story, "STORY"),
      rsvp: parse(sectionSchemas.rsvp, "RSVP"),
    },
  };
}
export type InvitationDto = ReturnType<typeof invitationDto>;
