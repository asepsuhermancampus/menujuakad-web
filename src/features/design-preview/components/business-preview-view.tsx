import type { PreviewScreen } from "../types";
import { GuestManagementPreview } from "@/features/guests/components/guest-management-preview";
import { GuestImportPreview } from "@/features/guests/components/guest-import-preview";
import { RsvpPreview } from "@/features/guests/components/rsvp-preview";
import { WishesPreview } from "@/features/wishes/components/wishes-preview";
import { GiftsPreview } from "@/features/gifts/components/gifts-preview";
import { AnalyticsPreview } from "@/features/analytics/components/analytics-preview";
export function hasBusinessPreview(code: string) {
  return ["GST-01", "GST-02", "GST-03", "GST-04", "GST-05", "GST-06"].includes(code);
}
export function BusinessPreviewView({ screen }: { screen: PreviewScreen }) {
  switch (screen.code) {
    case "GST-01":
      return <GuestManagementPreview key={screen.id} empty={screen.state.includes("Empty")} />;
    case "GST-02":
      return <GuestImportPreview />;
    case "GST-03":
      return <RsvpPreview />;
    case "GST-04":
      return <WishesPreview />;
    case "GST-05":
      return <GiftsPreview />;
    case "GST-06":
      return <AnalyticsPreview />;
    default:
      return null;
  }
}
