import { requireCustomerSession } from "@/server/authorization/guards";
import { workspaceView } from "@/features/workspace/components/data-boundary";
import { TestingPackagesView } from "@/features/billing/actual/customer-views";
export const metadata = { title: "Nominal Pengujian", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function Page() {
  await requireCustomerSession("/dashboard/billing/packages");
  return workspaceView(TestingPackagesView);
}
