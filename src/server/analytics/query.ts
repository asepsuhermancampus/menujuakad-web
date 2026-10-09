import "server-only";
import { verifyWorkspaceRole } from "@/server/customer/access";
import { WorkspaceError, unavailable } from "@/server/invitations/errors";
import { analyticsInputSchema } from "./input";
import { readOwnedAnalytics } from "./repository";
import { analyticsWindow, summarizeAnalytics } from "./service";
export async function getCustomerAnalytics(raw: unknown) {
  const session = await verifyWorkspaceRole("CLIENT");
  const input = analyticsInputSchema.safeParse(raw);
  if (!input.success)
    throw new WorkspaceError(400, "Filter tidak valid. Pilih semua waktu, 7 hari, atau 30 hari.");
  try {
    const window = analyticsWindow(input.data.period);
    return summarizeAnalytics(window, await readOwnedAnalytics(session.userId, window));
  } catch (error) {
    unavailable(error);
  }
}
