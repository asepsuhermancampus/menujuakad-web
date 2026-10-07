import type { ReactNode } from "react";
import { requireSuperadminSession } from "@/server/authorization/guards";
export default async function Layout({ children }: { children: ReactNode }) {
  await requireSuperadminSession("/admin");
  return children;
}
