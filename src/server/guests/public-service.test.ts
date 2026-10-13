import { beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({
  config: vi.fn(),
  keys: vi.fn(),
  reserve: vi.fn(),
  read: vi.fn(),
  persist: vi.fn(),
}));
vi.mock("@/server/auth/request-policy", () => ({
  getAuthConfig: mocks.config,
  getScopedThrottleKeys: mocks.keys,
}));
vi.mock("@/server/auth/auth-repository", () => ({ reserveLoginAttempt: mocks.reserve }));
vi.mock("./public-repository", () => ({
  getPublicRsvpContext: mocks.read,
  submitPublicRsvp: mocks.persist,
}));
import { getPublicRsvpContext, submitPublicRsvp } from "./public-service";
import { WorkspaceError } from "@/server/invitations/errors";

const token = "a".repeat(43);
const request = () =>
  new Request(`https://menujuakad.com/api/public/rsvp/${token}`, { method: "PUT" });

beforeEach(() => {
  vi.resetAllMocks();
  mocks.config.mockReturnValue({
    origin: "https://menujuakad.com",
    secret: "s".repeat(32),
    trustProxy: false,
  });
  mocks.keys.mockReturnValue([
    { keyHash: "token-key", limit: 10 },
    { keyHash: "ip-key", limit: 300 },
  ]);
  mocks.reserve.mockResolvedValue(true);
});

it("rejects malformed tokens before touching repository or throttle", async () => {
  await expect(getPublicRsvpContext("token-pendek")).rejects.toMatchObject({ status: 404 });
  await expect(
    submitPublicRsvp("token-pendek", request(), { status: "ATTENDING" }),
  ).rejects.toMatchObject({ status: 404 });
  expect(mocks.read).not.toHaveBeenCalled();
  expect(mocks.persist).not.toHaveBeenCalled();
  expect(mocks.reserve).not.toHaveBeenCalled();
});

it("returns the public context for a valid token and maps unknown tokens to 404", async () => {
  mocks.read.mockResolvedValue({ guestName: "Budi", invitationTitle: "Undangan" });
  await expect(getPublicRsvpContext(token)).resolves.toMatchObject({ guestName: "Budi" });
  expect(mocks.read).toHaveBeenCalledWith(token);
  mocks.read.mockRejectedValue(new WorkspaceError(404, "Tidak ditemukan."));
  await expect(getPublicRsvpContext(token)).rejects.toMatchObject({ status: 404 });
});

it("maps unexpected repository failures to a safe 503 without leaking details", async () => {
  mocks.read.mockRejectedValue(new Error("postgres://secret-uri"));
  const error = await getPublicRsvpContext(token).catch((caught: unknown) => caught);
  expect(error).toBeInstanceOf(WorkspaceError);
  expect((error as WorkspaceError).status).toBe(503);
  expect((error as WorkspaceError).message).not.toContain("secret");
});

it("applies the guest-rsvp throttle before validating the body", async () => {
  mocks.reserve.mockResolvedValue(false);
  await expect(
    submitPublicRsvp(token, request(), { status: "HADIR" }),
  ).rejects.toMatchObject({ status: 429 });
  expect(mocks.persist).not.toHaveBeenCalled();
  expect(mocks.keys).toHaveBeenCalledWith(
    "guest-rsvp",
    token,
    expect.anything(),
    expect.anything(),
    { identifier: 10, ip: 300, windowSeconds: 900 },
  );
});

it("rejects invalid and mass-assigned payloads after a passing throttle", async () => {
  for (const payload of [
    { status: "HADIR" },
    { status: "ATTENDING", guestCount: 11 },
    { status: "ATTENDING", guestCount: -1 },
    { status: "ATTENDING", guestId: "guest-lain" },
    { status: "ATTENDING", invitationId: "undangan-lain" },
  ]) {
    await expect(submitPublicRsvp(token, request(), payload)).rejects.toMatchObject({
      status: 400,
    });
  }
  expect(mocks.persist).not.toHaveBeenCalled();
});

it("persists only validated fields and never identity from the body", async () => {
  mocks.persist.mockResolvedValue({ status: "MAYBE", guestCount: 0 });
  const result = await submitPublicRsvp(token, request(), {
    status: "MAYBE",
    guestCount: 3,
    message: "  Insya Allah  ",
  });
  expect(result).toMatchObject({ status: "MAYBE" });
  expect(mocks.persist).toHaveBeenCalledWith(token, {
    status: "MAYBE",
    guestCount: 3,
    phone: null,
    message: "Insya Allah",
  });
});

it("preserves seat-cap 400 from the repository and hides unknown errors as 503", async () => {
  mocks.persist.mockRejectedValue(new WorkspaceError(400, "Melebihi alokasi kursi."));
  await expect(
    submitPublicRsvp(token, request(), { status: "ATTENDING", guestCount: 2 }),
  ).rejects.toMatchObject({ status: 400 });
  mocks.persist.mockRejectedValue(new Error("detail internal"));
  await expect(
    submitPublicRsvp(token, request(), { status: "ATTENDING", guestCount: 1 }),
  ).rejects.toMatchObject({ status: 503 });
});
