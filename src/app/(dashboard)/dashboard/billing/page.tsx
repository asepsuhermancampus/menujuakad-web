import { requireCustomerSession } from "@/server/authorization/guards";
import { workspaceView } from "@/features/workspace/components/data-boundary";
import { CustomerBillingView } from "@/features/billing/actual/customer-views";
export const metadata = { title: "Tagihan Uji", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function Page() {
  await requireCustomerSession("/dashboard/billing");
  return workspaceView(CustomerBillingView);
}
