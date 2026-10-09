import type { ReactNode } from "react";
import { CustomerHeader } from "./customer-header";
export function CustomerSettingsShell({ children }: { children: ReactNode }) {
  return (
    <>
      <CustomerHeader />
      <main id="main" className="container section customer-settings-main">
        {children}
      </main>
    </>
  );
}
