import { PackageSelectionPreview } from "@/features/billing/components/customer/package-selection-preview";
import { PaymentCheckoutPreview } from "@/features/billing/components/customer/payment-checkout-preview";
import { AdminPaymentsPreview } from "@/features/billing/components/admin/admin-payments-preview";
import { AdminWebhooksPreview } from "@/features/billing/components/admin/admin-webhooks-preview";
import { pendingOrderFixture, expiredOrderFixture } from "../data/fixtures";
import type { PreviewScreen } from "../types";
const billingCodes = new Set(["CUS-07", "CUS-08", "ADM-01", "ADM-02"]);
export function hasBillingPreview(code: string) {
  return billingCodes.has(code);
}
export function BillingPreviewView({ screen }: { screen: PreviewScreen }) {
  switch (screen.code) {
    case "CUS-07":
      return <PackageSelectionPreview />;
    case "CUS-08": {
      const expired = screen.state === "Expired";
      return (
        <PaymentCheckoutPreview
          key={screen.id}
          order={expired ? expiredOrderFixture : pendingOrderFixture}
          initialExpired={expired}
        />
      );
    }
    case "ADM-01":
      return <AdminPaymentsPreview />;
    case "ADM-02":
      return <AdminWebhooksPreview />;
    default:
      return null;
  }
}
