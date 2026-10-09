import { requireSuperadminSession } from "@/server/authorization/guards";
import { workspaceView } from "@/features/workspace/components/data-boundary";
import { AdminPaymentTestsView } from "@/features/billing/actual/admin-view";
export const metadata = { title: "Review QRIS Pengujian", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function Page() {
  await requireSuperadminSession("/admin/payments");
  return workspaceView(AdminPaymentTestsView);
}
