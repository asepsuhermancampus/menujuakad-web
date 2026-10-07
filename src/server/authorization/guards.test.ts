import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { getURLFromRedirectError } from "next/dist/client/components/redirect";

vi.mock("server-only", () => ({}));

import * as sessions from "./session";
import type { VerifiedSession } from "./session";
import { requireCustomerSession, requireSuperadminSession } from "./guards";

const now = 1_800_000_000_000;
const customer: VerifiedSession = {
  userId: "customer-example",
  role: "CUSTOMER",
  expiresAt: now + 60_000,
};
const admin: VerifiedSession = {
  userId: "admin-example",
  role: "SUPERADMIN",
  expiresAt: now + 60_000,
};

async function expectLoginRedirect(result: Promise<unknown>, target: string) {
  await expect(result).rejects.toSatisfy(
    (error: unknown) => isRedirectError(error) && getURLFromRedirectError(error) === target,
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe.each([
  {
    name: "customer",
    guard: requireCustomerSession,
    path: "/dashboard",
    login: "/login?next=%2Fdashboard",
    allowed: customer,
    wrongRole: admin,
  },
  {
    name: "superadmin",
    guard: requireSuperadminSession,
    path: "/admin",
    login: "/login?next=%2Fadmin",
    allowed: admin,
    wrongRole: customer,
  },
])("guard $name", ({ guard, path, login, allowed, wrongRole }) => {
  it("menolak anonim melalui resolver nyata", async () => {
    await expectLoginRedirect(guard(path), login);
  });

  it("menghasilkan redirect lokal ketika returnTo eksternal", async () => {
    await expectLoginRedirect(guard("//evil.example"), "/login?next=%2Fdashboard");
  });

  it("mengizinkan hanya role terverifikasi yang sesuai", async () => {
    vi.spyOn(sessions, "getVerifiedSession").mockResolvedValue(allowed);
    expect(await guard(path)).toEqual(allowed);
  });

  it("menolak role terverifikasi dari area lain", async () => {
    vi.spyOn(sessions, "getVerifiedSession").mockResolvedValue(wrongRole);
    await expectLoginRedirect(guard(path), login);
  });

  it.each([
    { expiresAt: now - 1 },
    { expiresAt: now },
    { expiresAt: now / 1000 },
    { expiresAt: Infinity },
    { expiresAt: NaN },
    { expiresAt: "1800000060000" },
    { expiresAt: now + 0.5 },
    { expiresAt: Number.MAX_SAFE_INTEGER + 1 },
    { expiresAt: undefined },
    { userId: "" },
    { userId: " " },
    { userId: "\n" },
    { userId: null },
    { userId: 123 },
    { role: "customer" },
    { role: "ADMIN" },
    { role: "superadmin" },
    { role: undefined },
  ])("menolak sesi provider invalid %j", async (override) => {
    vi.spyOn(sessions, "getVerifiedSession").mockResolvedValue({
      ...allowed,
      ...override,
    } as unknown as VerifiedSession);
    await expectLoginRedirect(guard(path), login);
  });

  it.each([undefined, {}, false, "SUPERADMIN"])(
    "menolak bentuk runtime sesi invalid %j",
    async (value) => {
      vi.spyOn(sessions, "getVerifiedSession").mockResolvedValue(
        value as unknown as VerifiedSession,
      );
      await expectLoginRedirect(guard(path), login);
    },
  );

  it("tidak memakai object sesi tambahan dari caller", async () => {
    const unsafeCaller = guard as unknown as (
      returnTo: string,
      session: VerifiedSession,
    ) => Promise<VerifiedSession>;
    await expectLoginRedirect(unsafeCaller(path, allowed), login);
  });

  it("kegagalan resolver tidak memberikan akses", async () => {
    vi.spyOn(sessions, "getVerifiedSession").mockRejectedValue(new Error("Provider unavailable"));
    await expect(guard(path)).rejects.toThrow("Provider unavailable");
  });
});
