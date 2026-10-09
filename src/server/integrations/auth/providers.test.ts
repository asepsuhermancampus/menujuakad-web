import { afterEach, it, expect, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { createDeliveryProviders } from "./providers";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
it("missing provider configuration fails closed without network", async () => {
  vi.stubEnv("RESEND_API_KEY", "");
  vi.stubEnv("TWILIO_ACCOUNT_SID", "");
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  const providers = createDeliveryProviders();
  await expect(
    providers.email.send({
      recipient: "uji@example.invalid",
      url: "https://example.invalid/verify-email#token=safe",
      kind: "verify",
      idempotencyKey: "test",
    }),
  ).rejects.toMatchObject({ status: 503 });
  await expect(
    providers.sms.send({ phone: "+6281234567890", code: "123456", idempotencyKey: "test" }),
  ).rejects.toMatchObject({ status: 503 });
  expect(fetcher).not.toHaveBeenCalled();
});
it("Resend acceptance requires receipt and uses idempotency plus timeout", async () => {
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("AUTH_EMAIL_FROM", "Uji <uji@example.invalid>");
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ id: "accepted-id" }), { status: 200 })),
  );
  const p = createDeliveryProviders();
  expect(
    await p.email.send({
      recipient: "uji@example.invalid",
      url: "https://example.invalid/reset-password#token=test",
      kind: "reset",
      idempotencyKey: "proof-id",
    }),
  ).toEqual({ accepted: true, receiptId: "accepted-id" });
  expect(fetch).toHaveBeenCalledWith(
    "https://api.resend.com/emails",
    expect.objectContaining({
      headers: expect.objectContaining({ "Idempotency-Key": "proof-id" }),
      signal: expect.any(AbortSignal),
    }),
  );
});
it("provider failures and malformed receipts are redacted", async () => {
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("AUTH_EMAIL_FROM", "uji@example.invalid");
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("secret-provider-payload", { status: 500 })),
  );
  await expect(
    createDeliveryProviders().email.send({
      recipient: "uji@example.invalid",
      url: "https://example.invalid",
      kind: "verify",
      idempotencyKey: "p",
    }),
  ).rejects.toMatchObject({
    status: 503,
    message: "Layanan autentikasi sementara tidak tersedia.",
  });
});
