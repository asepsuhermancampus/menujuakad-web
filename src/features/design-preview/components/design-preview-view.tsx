import { InvitationCustomerPreview } from "./invitation-customer-preview";
import { InvitationSettingsPreview } from "./invitation-settings-preview";
import { BusinessPreviewView, hasBusinessPreview } from "./business-preview-view";
import { CustomerPreviewLayout } from "@/components/customer/customer-preview-layout";
import { AdminShell } from "@/components/admin/admin-shell";
import { AuthForm, type AuthMode } from "@/features/auth/components/auth-form";
import { AuthShell } from "@/components/shared/auth-shell";
import { CustomerOverview } from "@/features/invitations/components/customer/customer-overview";
import { InvitationList } from "@/features/invitations/components/customer/invitation-list";
import { InvitationWizard } from "@/features/invitations/components/customer/invitation-wizard";
import { InvitationDetail } from "@/features/invitations/components/customer/invitation-detail";
import { AccountPreview } from "@/features/account/components/account-preview";
import { NotificationsPreview } from "@/features/account/components/notifications-preview";
import { SupportPreview } from "@/features/support/components/support-preview";
import { EditorPreview } from "@/features/invitations/components/editor/editor-preview";
import { InvitationView } from "@/features/invitations/components/invitation/invitation-view";
import type { PreviewScreen } from "../types";
import { PublicPreviewView, hasPublicPreview } from "./public-preview-view";
import { SpecialistPreviewPlaceholder } from "./specialist-preview-placeholder";
import { DesignReference } from "./design-reference";
import { ErrorPreview } from "./error-preview";
import { BillingPreviewView, hasBillingPreview } from "./billing-preview-view";
import { PlannerPreviewView, hasPlannerPreview } from "./planner-preview-view";
import { AdminPreviewView, hasAdminPreview } from "./admin-preview-view";
const customerViews = {
  "CUS-01": <CustomerOverview />,
  "CUS-02": <InvitationList />,
  "CUS-03": <InvitationWizard />,
  "CUS-04": <InvitationDetail />,
  "CUS-06": <InvitationSettingsPreview />,
  "ACC-01": <AccountPreview />,
  "ACC-02": <NotificationsPreview />,
  "SUP-01": <SupportPreview />,
} as const;
const authViews: Record<string, AuthMode> = {
  "AUT-01": "login",
  "AUT-02": "register",
  "AUT-03": "forgot-password",
  "AUT-04": "reset-password",
  "AUT-05": "verify-email",
  "AUT-06": "conflict",
};
export function DesignPreviewView({ screen }: { screen: PreviewScreen }) {
  if (screen.code === "CUS-05") return <InvitationCustomerPreview />;
  if (hasPublicPreview(screen.code)) return <PublicPreviewView code={screen.code} />;
  if (screen.audience === "auth")
    return (
      <AuthShell>
        <main id="main">
          <AuthForm mode={authViews[screen.code]} />
        </main>
      </AuthShell>
    );
  if (screen.code.startsWith("EDT-"))
    return (
      <EditorPreview
        code={screen.code}
        /*
         * Judul varian sumber berbunyi "Editor Galeri — Kuota Penuh & Error
         * Upload", sehingga state tersimpan sebagai "Kuota Penuh". Kedua kata
         * kunci diperiksa agar state kritis tetap aktif bila penamaan bergeser.
         */
        errorState={/error|kuota/i.test(screen.state)}
      />
    );
  if (screen.audience === "invitation")
    return (
      <main id="main">
        <InvitationView
          opened={screen.code === "INV-02"}
          invalid={screen.state.includes("Tidak Valid")}
        />
      </main>
    );
  if (screen.code === "ERR-404" || screen.code === "ERR-500")
    return <ErrorPreview code={screen.code} />;
  if (screen.code === "DS-01" || screen.code === "DS-02") return <DesignReference />;
  if (hasAdminPreview(screen.code))
    return (
      <AdminShell code={screen.code}>
        <AdminPreviewView code={screen.code} state={screen.state} />
      </AdminShell>
    );
  if (screen.audience === "admin")
    return (
      <AdminShell code={screen.code}>
        {hasBillingPreview(screen.code) ? (
          <BillingPreviewView screen={screen} />
        ) : (
          <SpecialistPreviewPlaceholder screen={screen} />
        )}
      </AdminShell>
    );
  if (hasPlannerPreview(screen.code))
    return (
      <CustomerPreviewLayout screen={screen}>
        <PlannerPreviewView code={screen.code} />
      </CustomerPreviewLayout>
    );
  if (screen.audience === "customer")
    return (
      <CustomerPreviewLayout screen={screen}>
        {hasBillingPreview(screen.code) ? (
          <BillingPreviewView screen={screen} />
        ) : hasBusinessPreview(screen.code) ? (
          <BusinessPreviewView screen={screen} />
        ) : Object.hasOwn(customerViews, screen.code) ? (
          customerViews[screen.code as keyof typeof customerViews]
        ) : (
          <SpecialistPreviewPlaceholder screen={screen} />
        )}
      </CustomerPreviewLayout>
    );
  return null;
}
