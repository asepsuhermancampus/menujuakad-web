import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { getURLFromRedirectError } from "next/dist/client/components/redirect";

const browser = vi.hoisted(() => ({ request: null as NextRequest | null }));
vi.mock("server-only", () => ({}));
// Next menyediakan konteks request; pengujian hanya mengganti boundary input browser.
vi.mock("next/headers", () => ({
  cookies: async () => browser.request?.cookies,
  headers: async () => browser.request?.headers,
}));

import { getVerifiedSession } from "./session";
import { requireCustomerSession, requireSuperadminSession } from "./guards";

afterEach(() => {
  browser.request = null;
});

describe("resolver belum terintegrasi auth", () => {
  it.each<{ url: string; headers: Record<string, string> }>([
    { url: "/dashboard", headers: {} },
    {
      url: "/admin?role=SUPERADMIN&userId=fake",
      headers: {
        cookie: "role=SUPERADMIN; userId=fake; session=fake; verified=true",
        "x-user-id": "fake",
        "x-role": "SUPERADMIN",
        authorization: "Bearer fake-token",
      },
    },
    { url: "/dashboard?role=CUSTOMER", headers: { cookie: "role=CUSTOMER; userId=fake" } },
  ])("request $url tidak memberi sesi", async ({ url, headers }) => {
    browser.request = new NextRequest(new URL(url, "https://menujuakad.example"), { headers });
    expect(await getVerifiedSession()).toBeNull();
    for (const [guard, path, login] of [
      [requireCustomerSession, "/dashboard", "/login?next=%2Fdashboard"],
      [requireSuperadminSession, "/admin", "/login?next=%2Fadmin"],
    ] as const) {
      await expect(guard(path)).rejects.toSatisfy(
        (error: unknown) => isRedirectError(error) && getURLFromRedirectError(error) === login,
      );
    }
  });
});
