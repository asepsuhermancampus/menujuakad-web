import "server-only";
import { getPrisma } from "@/server/db/client";
import type { Prisma } from "@/generated/prisma/client";
import { invitationDto, invitationSelect } from "./dto";
import { WorkspaceError } from "./errors";
import type { CreateInvitationInput, UpdateInvitationInput } from "./input";
const internalTemplate = {
  id: "menujuakad-seed-preproduction-template",
  slug: "seed-preproduction-internal",
  status: "DRAFT" as const,
};
// Anotasi tipe Prisma menjaga literal role tetap sempit tanpa `as const` berulang.
const ownerScope = (userId: string): Prisma.InvitationWhereInput => ({
  ownerUserId: userId,
  owner: {
    is: {
      id: userId,
      role: "CLIENT",
      status: "ACTIVE",
    },
  },
});
const draftScope = (userId: string, id: string) => ({
  ...ownerScope(userId),
  id,
  status: "DRAFT" as const,
  isPublished: false,
});
export async function listOwnedInvitations(userId: string) {
  const rows = await getPrisma().invitation.findMany({
    where: ownerScope(userId),
    select: invitationSelect,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return rows.map(invitationDto);
}
export async function findOwnedInvitation(userId: string, id: string) {
  const row = await getPrisma().invitation.findFirst({
    where: { ...ownerScope(userId), id },
    select: invitationSelect,
  });
  return row ? invitationDto(row) : null;
}
export function listDraftTemplates() {
  return getPrisma().template.findMany({
    where: internalTemplate,
    select: { id: true, name: true },
    take: 1,
  });
}
async function assertDraft(tx: Prisma.TransactionClient, userId: string, id: string) {
  // Guarded UPDATE locks the row until the transaction ends, preventing publication races.
  const result = await tx.invitation.updateMany({
    where: draftScope(userId, id),
    data: { updatedAt: new Date() },
  });
  if (result.count === 0) {
    const exists = await tx.invitation.findFirst({
      where: { ...ownerScope(userId), id },
      select: { id: true },
    });
    throw new WorkspaceError(
      exists ? 409 : 404,
      exists ? "Hanya draft belum terbit yang dapat diubah." : "Undangan tidak ditemukan.",
    );
  }
}
export async function createOwnedDraft(userId: string, input: CreateInvitationInput) {
  return getPrisma().$transaction(async (tx) => {
    const user = await tx.user.findFirst({
      where: { id: userId, role: "CLIENT", status: "ACTIVE" },
      select: { id: true },
    });
    if (!user) throw new WorkspaceError(403, "Akses ditolak.");
    const template = await tx.template.findFirst({
      where: { ...internalTemplate, id: input.templateId },
      select: { id: true },
    });
    if (!template) throw new WorkspaceError(400, "Template internal pengujian tidak tersedia.");
    const row = await tx.invitation.create({
      data: {
        ownerUserId: userId,
        templateId: template.id,
        title: input.title,
        slug: input.slug,
        weddingDate: input.weddingDate ? new Date(input.weddingDate + "T00:00:00.000Z") : null,
        timezone: input.timezone,
        status: "DRAFT",
        isPublished: false,
      },
      select: invitationSelect,
    });
    return invitationDto(row);
  });
}
export async function updateOwnedDraft(userId: string, id: string, input: UpdateInvitationInput) {
  return getPrisma().$transaction(async (tx) => {
    await assertDraft(tx, userId, id);
    const { sections, couple, weddingDate, ...settings } = input;
    await tx.invitation.updateMany({
      where: draftScope(userId, id),
      data: {
        ...settings,
        ...(weddingDate !== undefined
          ? { weddingDate: weddingDate ? new Date(weddingDate + "T00:00:00.000Z") : null }
          : {}),
      },
    });
    if (couple)
      await tx.coupleProfile.upsert({
        where: { invitationId: id },
        create: { invitationId: id, ...couple },
        update: couple,
      });
    const types = { cover: "COVER", event: "EVENT", story: "STORY", rsvp: "RSVP" } as const;
    if (sections)
      for (const key of Object.keys(types) as (keyof typeof types)[]) {
        const config = sections[key];
        if (config === undefined) continue;
        // Replace only supported section types; no arbitrary JSON or duplicate sections remain.
        await tx.invitationSection.deleteMany({ where: { invitationId: id, type: types[key] } });
        await tx.invitationSection.create({
          data: {
            invitationId: id,
            type: types[key],
            sortOrder: Object.keys(types).indexOf(key),
            isEnabled: key === "rsvp" ? sections.rsvp!.enabled : true,
            configJson: config,
          },
        });
      }
    const row = await tx.invitation.findFirst({
      where: { ...ownerScope(userId), id },
      select: invitationSelect,
    });
    if (!row) throw new WorkspaceError(404, "Undangan tidak ditemukan.");
    return invitationDto(row);
  });
}
export async function deleteOwnedDraft(userId: string, id: string) {
  await getPrisma().$transaction(async (tx) => {
    await assertDraft(tx, userId, id);
    // FOR UPDATE also blocks new FK references until the history check/delete completes.
    await tx.$queryRaw`SELECT "id" FROM "Invitation" WHERE "id"=${id} AND "ownerUserId"=${userId} FOR UPDATE`;
    const history = await tx.paymentTestRequest.count({ where: { invitationId: id } });
    if (history > 0)
      throw new WorkspaceError(409, "Draft dengan riwayat pembayaran uji tidak dapat dihapus.");
    const deleted = await tx.invitation.deleteMany({ where: draftScope(userId, id) });
    if (deleted.count !== 1) throw new WorkspaceError(404, "Undangan tidak ditemukan.");
  });
}
