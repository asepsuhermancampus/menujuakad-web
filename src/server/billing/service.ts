import "server-only";
import { verifyWorkspaceRole } from "@/server/customer/access";
import { WorkspaceError } from "@/server/invitations/errors";
import { testingPackages } from "./catalog";
import { billingIdSchema, createTestSchema, reviewTestSchema } from "./validation";
import * as repository from "./repository";
import type { VerifiedSession } from "@/server/authorization/session";
async function operation<T>(
  role: VerifiedSession["role"],
  action: (userId: string) => Promise<T>,
): Promise<T> {
  const session = await verifyWorkspaceRole(role);
  try {
    return await action(session.userId);
  } catch (error) {
    if (error instanceof WorkspaceError) throw error;
    throw new WorkspaceError(
      503,
      "Layanan data pengujian sedang tidak tersedia. Silakan coba lagi.",
    );
  }
}
export const requireBillingCustomer = () => verifyWorkspaceRole("CLIENT");
export const listCustomerTestRequests = () => operation("CLIENT", repository.listOwnedRequests);
export const listCustomerBillingDrafts = () => operation("CLIENT", repository.listOwnedDrafts);
export const listAdminPaymentTests = () => operation("SUPERADMIN", repository.listAdminRequests);
export function getCustomerTestRequest(id: string) {
  return operation("CLIENT", async (userId) => {
    if (!billingIdSchema.safeParse(id).success)
      throw new WorkspaceError(404, "Permintaan uji tidak ditemukan.");
    const row = await repository.findOwnedRequest(userId, id);
    if (!row) throw new WorkspaceError(404, "Permintaan uji tidak ditemukan.");
    return row;
  });
}
export function createCustomerTestRequest(raw: unknown) {
  return operation("CLIENT", (userId) => {
    const parsed = createTestSchema.safeParse(raw);
    if (!parsed.success) throw new WorkspaceError(400, "Data permintaan uji tidak valid.");
    const item = testingPackages.find((item) => item.slug === parsed.data.packageSlug)!;
    return repository.createOwnedRequest(userId, { ...parsed.data, amountIdr: item.amountIdr });
  });
}
export function reviewPaymentTest(id: string, raw: unknown) {
  return operation("SUPERADMIN", (userId) => {
    if (!billingIdSchema.safeParse(id).success)
      throw new WorkspaceError(404, "Permintaan uji tidak ditemukan.");
    const parsed = reviewTestSchema.safeParse(raw);
    if (!parsed.success) throw new WorkspaceError(400, "Keputusan review uji tidak valid.");
    return repository.reviewRequest(userId, id, parsed.data.status);
  });
}
