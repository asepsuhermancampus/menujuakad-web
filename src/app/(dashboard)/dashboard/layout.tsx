import type { ReactNode } from "react";
import { requireCustomerSession } from "@/server/authorization/guards";
export default async function Layout({ children }: { children: ReactNode }) {
  await requireCustomerSession("/dashboard");
  return children;
}
