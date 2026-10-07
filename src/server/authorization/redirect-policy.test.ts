import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { buildSafeLoginRedirect } from "./redirect-policy";

describe("target login lokal", () => {
  it.each([
    ["/dashboard", "/login?next=%2Fdashboard"],
    ["/dashboard/", "/login?next=%2Fdashboard%2F"],
    [
      "/dashboard/invitations/sample-id/editor",
      "/login?next=%2Fdashboard%2Finvitations%2Fsample-id%2Feditor",
    ],
    ["/admin", "/login?next=%2Fadmin"],
    ["/admin/payments", "/login?next=%2Fadmin%2Fpayments"],
  ])("mempertahankan path allowlist %s", (target, expected) => {
    expect(buildSafeLoginRedirect(target)).toBe(expected);
  });

  it.each([
    "",
    "https://evil.example",
    "http://evil.example/dashboard",
    "javascript:alert(1)",
    "//evil.example",
    "///evil.example",
    "/\\evil.example",
    "\\\\evil.example",
    "/dashboard\\evil",
    "/admin\\evil",
    " /admin",
    "/admin ",
    "/admin\n",
    "/admin\r",
    "/admin\t",
    "/admin\u0000",
    "/admin\u007f",
    "/admin\u0085",
    "/admin\u2028",
    "/admin\u202e",
    "/admin\u200b",
    "/admin\u00a0",
    "/dashboardevil",
    "/adminevil",
    "/login",
    "/login?next=/admin",
    "/preview-ui/adm-01",
    "/api/health",
    "/",
    "/dashboard/../login",
    "/dashboard/./invitations",
    "/admin/..",
    "/admin/.",
    "/admin//payments",
    "/admin;anything",
    "/admin/<script>",
    "/admin/@evil.example",
    "/dashboard?role=SUPERADMIN",
    "/admin?userId=fake",
    "/admin?next=//evil.example",
    "/dashboard#//evil.example",
    "/admin/payments?token=secret",
    "%2f%2fevil.example",
    "/%5cevil.example",
    "/dashboard/%2e%2e/login",
    "/admin/%2f%2fevil.example",
    "/admin/%5Cevil.example",
    "/admin/%0d%0aLocation:evil",
    "%252f%252fevil.example",
    "/admin/%252e%252e/login",
    "/admin/%255c/evil",
    "/admin/%GG",
    "/admin/%",
    "/admin/%E0%A4%A",
    "/admin/%61",
    "/dashboard/支付",
    "/admin/" + "a".repeat(2048),
  ])("menolak target berbahaya %j", (target) => {
    expect(buildSafeLoginRedirect(target)).toBe("/login?next=%2Fdashboard");
  });

  it.each([null, undefined, {}, 42])("menolak input runtime bukan string %j", (target) => {
    expect(buildSafeLoginRedirect(target as unknown as string)).toBe("/login?next=%2Fdashboard");
  });
});
