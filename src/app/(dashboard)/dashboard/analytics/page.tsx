import { requireCustomerSession } from "@/server/authorization/guards";
import { getCustomerAnalytics } from "@/server/analytics/query";
import { CustomerAnalyticsView } from "@/features/analytics/components/customer-analytics-view";
import { workspaceView } from "@/features/workspace/components/data-boundary";
export const dynamic = "force-dynamic";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireCustomerSession("/dashboard/analytics");
  return workspaceView(async () => (
    <CustomerAnalyticsView data={await getCustomerAnalytics(await searchParams)} />
  ));
}
