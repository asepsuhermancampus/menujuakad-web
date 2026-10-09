import type { ReactNode } from "react";
import { requireCustomerSession } from "@/server/authorization/guards";
import { getWorkspaceIdentity } from "@/server/customer/identity";
import { CustomerWorkspaceShell } from "@/components/customer/customer-workspace-shell";
import { workspaceLayoutView } from "@/features/workspace/components/data-boundary";
export const dynamic = "force-dynamic";
export default async function Layout({ children }: { children: ReactNode }) {
  await requireCustomerSession("/dashboard");
  return workspaceLayoutView(async () => (
    <CustomerWorkspaceShell identity={await getWorkspaceIdentity("CLIENT")}>
      {children}
    </CustomerWorkspaceShell>
  ));
}
