import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/dashboard/planner",
}));
vi.mock("server-only", () => ({}));
import { CustomerWorkspaceShell } from "@/components/customer/customer-workspace-shell";
import { AdminWorkspaceShell } from "@/components/admin/admin-workspace-shell";
import { PlannerSubNav } from "./planner-shell";
import { plannerRouteKeys, resolvePlannerRoute } from "./planner-routes";

const identity = { name: "TEST Identitas DB", email: "actual@menujuakad.test" };

it("navigasi customer memuat pintu masuk Perencanaan", () => {
  const html = renderToStaticMarkup(
    createElement(
      CustomerWorkspaceShell,
      { identity } as Parameters<typeof CustomerWorkspaceShell>[0],
      null,
    ),
  );
  expect(html).toContain('href="/dashboard/planner"');
  expect(html).toContain("Perencanaan");
});

it("navigasi admin memuat menu operasional baru", () => {
  const html = renderToStaticMarkup(
    createElement(
      AdminWorkspaceShell,
      { identity } as Parameters<typeof AdminWorkspaceShell>[0],
      null,
    ),
  );
  for (const href of [
    "/admin/user-management",
    "/admin/upgrades",
    "/admin/content",
    "/admin/payment-settings",
    "/admin/audit",
    "/admin/landing-preview",
  ]) {
    expect(html).toContain(`href="${href}"`);
  }
});

it("sub-navigasi planner hanya menautkan rute resmi", () => {
  const html = renderToStaticMarkup(
    createElement(PlannerSubNav, { current: "/dashboard/planner" }),
  );
  expect(html).toContain('href="/dashboard/planner/savings"');
  expect(html).toContain('href="/dashboard/planner/wedding-kit"');
  expect(html).not.toContain("/preview-ui/");
});

it("resolver planner mengenali seluruh modul dan menolak path asing", () => {
  expect(plannerRouteKeys).toEqual(
    expect.arrayContaining([
      "savings",
      "budget",
      "expenses",
      "tasks",
      "rundown",
      "vendors",
      "seserahan",
      "requirements",
      "engagement",
      "moodboard",
      "wedding-kit",
      "couple",
      "onboarding",
      "announcements",
    ]),
  );
  expect(resolvePlannerRoute(["guests"])).toBeNull();
  expect(resolvePlannerRoute(["planner"])).not.toBeNull();
  expect(resolvePlannerRoute(["planner", "tidak-ada"])).toBe(false);
  expect(resolvePlannerRoute(["planner", "savings", "extra"])).toBe(false);
});
