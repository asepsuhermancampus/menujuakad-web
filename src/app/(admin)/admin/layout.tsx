import type { ReactNode } from "react";
import { requireSuperadminSession } from "@/server/authorization/guards";
import { getWorkspaceIdentity } from "@/server/customer/identity";
import { AdminWorkspaceShell } from "@/components/admin/admin-workspace-shell";
import { workspaceLayoutView } from "@/features/workspace/components/data-boundary";
export const dynamic = "force-dynamic";
export default async function Layout({ children }: { children: ReactNode }) {
  await requireSuperadminSession("/admin");
  return workspaceLayoutView(async () => (
    <AdminWorkspaceShell identity={await getWorkspaceIdentity("SUPERADMIN")}>
      {children}
    </AdminWorkspaceShell>
  ));
}
