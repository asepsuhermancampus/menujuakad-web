import { requireCustomerSession } from "@/server/authorization/guards";
import { workspaceView } from "@/features/workspace/components/data-boundary";
import { TestingCheckoutView } from "@/features/billing/actual/customer-views";
export const metadata = { title: "QRIS Pengujian", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ requestId: string }> }) {
  await requireCustomerSession("/dashboard/billing");
  const { requestId } = await params;
  return workspaceView(() => TestingCheckoutView({ id: requestId }));
}
