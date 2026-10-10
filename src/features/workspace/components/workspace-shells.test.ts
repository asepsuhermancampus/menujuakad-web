import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
  // Shell kini memakai usePathname untuk menandai halaman aktif.
  usePathname: () => "/dashboard",
}));
import { CustomerWorkspaceShell } from "@/components/customer/customer-workspace-shell";
import { WorkspaceNotFound } from "./data-boundary";
vi.mock("server-only", () => ({}));
import { AdminWorkspaceShell } from "@/components/admin/admin-workspace-shell";
const identity = { name: "TEST Identitas DB", email: "actual@menujuakad.test" };
it.each([CustomerWorkspaceShell, AdminWorkspaceShell])(
  "renders one main with actual identity and logout",
  (Shell) => {
    const html = renderToStaticMarkup(
      createElement(
        Shell,
        { identity } as Parameters<typeof Shell>[0],
        createElement(WorkspaceNotFound, {
          home: Shell === CustomerWorkspaceShell ? "/dashboard" : "/admin",
        }),
      ),
    );
    expect(html.match(/<main\b/g)).toHaveLength(1);
    expect(html).toContain('id="main"');
    expect(html).toContain(identity.name);
    expect(html).toContain(identity.email);
    expect(html).toContain("Keluar");
    expect(html).not.toContain("Sarah");
    expect(html).not.toContain("Dimas");
  },
);
it("customer navigation uses authenticated routes", () => {
  const html = renderToStaticMarkup(
    createElement(
      CustomerWorkspaceShell,
      { identity } as Parameters<typeof CustomerWorkspaceShell>[0],
      null,
    ),
  );
  expect(html).toContain('href="/dashboard/invitations"');
  expect(html).toContain('href="/dashboard/billing"');
  expect(html).not.toContain('href="/preview-ui/');
});
it("admin navigation uses role-specific account and invitation routes", () => {
  const html = renderToStaticMarkup(
    createElement(
      AdminWorkspaceShell,
      { identity } as Parameters<typeof AdminWorkspaceShell>[0],
      null,
    ),
  );
  expect(html).toContain('href="/admin/users"');
  expect(html).toContain('href="/admin/invitations"');
  expect(html).toContain('href="/admin/payments"');
});
