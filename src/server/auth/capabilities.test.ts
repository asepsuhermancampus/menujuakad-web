import { expect, it, vi, afterEach } from "vitest";
vi.mock("server-only", () => ({}));
import { getAuthCapabilities } from "./capabilities";
afterEach(() => vi.unstubAllEnvs());
it("requires complete valid server provider config and never exposes secrets", () => {
  for (const key of [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REDIRECT_URI",
    "RESEND_API_KEY",
    "AUTH_EMAIL_FROM",
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_FROM_NUMBER",
  ])
    vi.stubEnv(key, "");
  expect(getAuthCapabilities()).toEqual({ google: false, emailRecovery: false, smsOtp: false });
  vi.stubEnv("AUTH_SECRET", "x".repeat(32));
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://menujuakad.com");
  vi.stubEnv("GOOGLE_CLIENT_ID", "123-test.apps.googleusercontent.com");
  vi.stubEnv("GOOGLE_CLIENT_SECRET", "GOCSPX-test");
  vi.stubEnv("GOOGLE_REDIRECT_URI", "https://evil.example/callback");
  expect(getAuthCapabilities().google).toBe(false);
  vi.stubEnv("GOOGLE_REDIRECT_URI", "https://menujuakad.com/api/auth/google/callback");
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("AUTH_EMAIL_FROM", "Menuju Akad <noreply@example.invalid>");
  vi.stubEnv("TWILIO_ACCOUNT_SID", "AC" + "a".repeat(32));
  vi.stubEnv("TWILIO_AUTH_TOKEN", "b".repeat(32));
  vi.stubEnv("TWILIO_FROM_NUMBER", "+14155552671");
  expect(getAuthCapabilities()).toEqual({ google: true, emailRecovery: true, smsOtp: true });
});

it("all capabilities are false when mandatory authentication config is unavailable", () => {
  vi.stubEnv("AUTH_SECRET", "");
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("AUTH_EMAIL_FROM", "noreply@example.invalid");
  expect(getAuthCapabilities()).toEqual({ google: false, emailRecovery: false, smsOtp: false });
});
