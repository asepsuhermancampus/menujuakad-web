import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { AdminTestRequestDto, TestRequestDto } from "@/features/billing/actual/contracts";
export const testRequestSelect = {
  id: true,
  invitationId: true,
  amountIdr: true,
  packageSlug: true,
  status: true,
  reference: true,
  createdAt: true,
  reviewedAt: true,
  invitation: { select: { title: true } },
} satisfies Prisma.PaymentTestRequestSelect;
export const adminTestSelect = {
  ...testRequestSelect,
  reviewedByUserId: true,
  user: { select: { email: true } },
} satisfies Prisma.PaymentTestRequestSelect;
type RequestRow = Prisma.PaymentTestRequestGetPayload<{ select: typeof testRequestSelect }>;
export function testRequestDto(row: RequestRow): TestRequestDto {
  return {
    id: row.id,
    invitationId: row.invitationId,
    invitationTitle: row.invitation.title,
    amountIdr: row.amountIdr,
    packageSlug: row.packageSlug,
    status: row.status,
    reference: row.reference,
    createdAt: row.createdAt.toISOString(),
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
  };
}
export function adminTestDto(
  row: Prisma.PaymentTestRequestGetPayload<{ select: typeof adminTestSelect }>,
): AdminTestRequestDto {
  return {
    ...testRequestDto(row),
    customerEmail: row.user.email ?? "Email belum ditambahkan",
    reviewedByUserId: row.reviewedByUserId,
  };
}
