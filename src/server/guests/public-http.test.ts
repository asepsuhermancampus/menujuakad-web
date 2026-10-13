import { beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ origin: vi.fn(), submit: vi.fn() }));
vi.mock("@/server/auth/request-policy", () => ({ assertTrustedOrigin: mocks.origin }));
vi.mock("./public-service", () => ({ submitPublicRsvp: mocks.submit }));
import { publicRsvpResource } from "./public-http";
import { WorkspaceError } from "@/server/invitations/errors";

const token = "b".repeat(43);
const request = (method = "PUT", body: unknown = { status: "ATTENDING" }) =>
  new Request(`https://menujuakad.com/api/public/rsvp/${token}`, {
    method,
    headers: { "content-type": "application/json", origin: "https://menujuakad.com" },
    ...(method === "GET" ? {} : { body: JSON.stringify(body) }),
  });

beforeEach(() => {
  vi.resetAllMocks();
  mocks.origin.mockReturnValue(true);
});

it("allows only PUT", async () => {
  expect((await publicRsvpResource(request("GET"), token)).status).toBe(405);
  expect(mocks.submit).not.toHaveBeenCalled();
});

it("denies untrusted origin before reading the body or touching the service", async () => {
  mocks.origin.mockReturnValue(false);
  expect((await publicRsvpResource(request(), token)).status).toBe(403);
  expect(mocks.submit).not.toHaveBeenCalled();
});

it("rejects oversized bodies with 413", async () => {
  const response = await publicRsvpResource(
    request("PUT", { message: "x".repeat(5000) }),
    token,
  );
  expect(response.status).toBe(413);
  expect(mocks.submit).not.toHaveBeenCalled();
});

it("rejects non-JSON content type and invalid JSON", async () => {
  expect(
    (
      await publicRsvpResource(
        new Request("https://menujuakad.com/api/public/rsvp/x", { method: "PUT", body: "oops" }),
        token,
      )
    ).status,
  ).toBe(400);
});

it("returns the stored result with no-store headers", async () => {
  mocks.submit.mockResolvedValue({ status: "ATTENDING", guestCount: 2 });
  const response = await publicRsvpResource(request(), token);
  expect(response.status).toBe(200);
  expect(response.headers.get("cache-control")).toContain("no-store");
  expect(await response.json()).toMatchObject({ ok: true });
  expect(mocks.submit).toHaveBeenCalledWith(
    token,
    expect.anything(),
    expect.objectContaining({ status: "ATTENDING" }),
  );
});

it("preserves known denials and hides internal errors as safe 503", async () => {
  mocks.submit.mockRejectedValue(new WorkspaceError(429, "Terlalu banyak percobaan."));
  const limited = await publicRsvpResource(request(), token);
  expect(limited.status).toBe(429);
  mocks.submit.mockRejectedValue(new Error("postgres://secret-uri"));
  const failed = await publicRsvpResource(request(), token);
  expect(failed.status).toBe(503);
  expect(await failed.text()).not.toContain("secret");
});
