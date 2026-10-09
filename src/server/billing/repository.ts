import "server-only";
import { getPrisma } from "@/server/db/client";
import type { Prisma } from "@/generated/prisma/client";
import { WorkspaceError } from "@/server/invitations/errors";
import { adminTestDto, adminTestSelect, testRequestDto, testRequestSelect } from "./dto";
import type { CreateTestInput, ReviewStatus } from "./validation";
const customerScope = (userId: string) => ({
  userId,
  user: {
    is: {
      id: userId,
      role: { in: ["CUSTOMER", "CLIENT"] as ("CUSTOMER" | "CLIENT")[] },
      status: "ACTIVE" as const,
    },
  },
  invitation: { is: { ownerUserId: userId } },
});
export function listOwnedDrafts(userId: string) {
  return getPrisma().invitation.findMany({
    where: {
      ownerUserId: userId,
      status: "DRAFT",
      isPublished: false,
      owner: { is: { role: { in: ["CUSTOMER", "CLIENT"] }, status: "ACTIVE" } },
    },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
export async function listOwnedRequests(userId: string) {
  const rows = await getPrisma().paymentTestRequest.findMany({
    where: customerScope(userId),
    select: testRequestSelect,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 100,
  });
  return rows.map(testRequestDto);
}
export async function findOwnedRequest(userId: string, id: string) {
  const row = await getPrisma().paymentTestRequest.findFirst({
    where: { ...customerScope(userId), id },
    select: testRequestSelect,
  });
  return row ? testRequestDto(row) : null;
}
async function assertAdmin(tx: Prisma.TransactionClient, userId: string) {
  const user = await tx.user.findFirst({
    where: { id: userId, role: "SUPERADMIN", status: "ACTIVE" },
    select: { id: true },
  });
  if (!user) throw new WorkspaceError(403, "Akses ditolak.");
}
export async function listAdminRequests(userId: string) {
  return getPrisma().$transaction(async (tx) => {
    await assertAdmin(tx, userId);
    const rows = await tx.paymentTestRequest.findMany({
      select: adminTestSelect,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 100,
    });
    return rows.map(adminTestDto);
  });
}
export async function createOwnedRequest(userId: string, input: CreateTestInput) {
  if (
    !Number.isSafeInteger(input.amountIdr) ||
    input.amountIdr <= 0 ||
    input.amountIdr > 2147483647
  )
    throw new WorkspaceError(400, "Nominal uji tidak valid.");
  return getPrisma().$transaction(async (tx) => {
    // Lock per customer menserialisasi budget dan submit lintas undangan/proses.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`billing-test:${userId}`}))`;
    // Lock parent juga menahan delete/publikasi bersamaan; tidak mengubah undangan.
    const drafts = await tx.$queryRaw<{ id: string; status: string; isPublished: boolean }[]>`
      SELECT i."id", i."status", i."isPublished" FROM "Invitation" i
      JOIN "User" u ON u."id"=i."ownerUserId"
      WHERE i."id"=${input.invitationId} AND i."ownerUserId"=${userId}
        AND u."status"='ACTIVE' AND u."role" IN ('CUSTOMER','CLIENT') FOR UPDATE OF i`;
    const draft = drafts[0];
    if (!draft) throw new WorkspaceError(404, "Undangan tidak ditemukan.");
    if (draft.status !== "DRAFT" || draft.isPublished)
      throw new WorkspaceError(409, "Hanya draft privat yang dapat digunakan untuk pengujian.");
    const pending = await tx.paymentTestRequest.findFirst({
      where: { ...customerScope(userId), invitationId: draft.id, status: "REQUESTED" },
      select: testRequestSelect,
    });
    if (pending) {
      if (pending.packageSlug !== input.packageSlug || pending.amountIdr !== input.amountIdr)
        throw new WorkspaceError(
          409,
          "Masih ada permintaan uji menunggu review untuk undangan ini. Buka riwayat tagihan.",
        );
      return testRequestDto(pending);
    }
    const now = new Date();
    const recent = await tx.paymentTestRequest.count({
      where: { userId, createdAt: { gte: new Date(now.getTime() - 3600000) } },
    });
    if (recent >= 20)
      throw new WorkspaceError(429, "Batas 20 permintaan uji per jam tercapai. Coba lagi nanti.");
    const pendingCount = await tx.paymentTestRequest.count({
      where: { userId, status: "REQUESTED" },
    });
    if (pendingCount >= 10)
      throw new WorkspaceError(429, "Batas 10 permintaan menunggu review tercapai.");
    const row = await tx.paymentTestRequest.create({
      data: {
        invitationId: draft.id,
        userId,
        amountIdr: input.amountIdr,
        packageSlug: input.packageSlug,
        reference: input.reference || null,
        status: "REQUESTED",
      },
      select: testRequestSelect,
    });
    return testRequestDto(row);
  });
}
export async function reviewRequest(userId: string, id: string, status: ReviewStatus) {
  return getPrisma().$transaction(async (tx) => {
    await assertAdmin(tx, userId);
    const changed = await tx.paymentTestRequest.updateMany({
      where: { id, status: "REQUESTED" },
      data: { status, reviewedAt: new Date(), reviewedByUserId: userId },
    });
    if (changed.count !== 1) {
      const exists = await tx.paymentTestRequest.findUnique({
        where: { id },
        select: { id: true },
      });
      throw new WorkspaceError(
        exists ? 409 : 404,
        exists
          ? "Permintaan uji sudah direview. Muat ulang daftar."
          : "Permintaan uji tidak ditemukan.",
      );
    }
    const row = await tx.paymentTestRequest.findUniqueOrThrow({
      where: { id },
      select: adminTestSelect,
    });
    // Persetujuan uji hanya menulis PaymentTestRequest: tanpa aktivasi/provider/entitlement.
    return adminTestDto(row);
  });
}
