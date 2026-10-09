import type { ReactNode } from "react";
import type { PreviewScreen } from "@/features/design-preview/types";
import { CustomerShell } from "./customer-shell";
import { CustomerDomainShell } from "./customer-domain-shell";
import { CustomerSettingsShell } from "./customer-settings-shell";
import { CheckoutShell } from "./checkout-shell";
/** Komposisi keluarga shell yang terlihat pada sumber; tidak mengubah peran/izin. */
export function CustomerPreviewLayout({
  children,
  screen,
}: {
  children: ReactNode;
  screen: PreviewScreen;
}) {
  if (screen.code === "CUS-08") return <CheckoutShell>{children}</CheckoutShell>;
  if (screen.code.startsWith("ACC-") || screen.code === "SUP-01")
    return <CustomerSettingsShell>{children}</CustomerSettingsShell>;
  if (
    (screen.code === "GST-01" && !screen.state.includes("Empty")) ||
    screen.code === "GST-05" ||
    screen.code === "GST-06"
  )
    return <CustomerDomainShell code={screen.code}>{children}</CustomerDomainShell>;
  return <CustomerShell code={screen.code}>{children}</CustomerShell>;
}
