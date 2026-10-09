import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SmsOtpSettings } from "@/features/account/components/sms-otp-settings";
import { RegistrationSuccess } from "./registration-success";
import { CustomerWorkspaceShell } from "@/components/customer/customer-workspace-shell";
import { RegisterForm } from "./register-form";
import { PasswordRecoveryForm } from "./password-recovery-form";
import { NewPasswordForm } from "./password-reset-form";
import { EmailVerificationForm } from "./email-verification-form";
import { OAuthFeedback } from "./oauth-feedback";
import { GoogleAuthButton } from "./google-auth-button";
import { PasswordSettings } from "@/features/account/components/password-settings";
import { AuthForm } from "./auth-form";
import type { SecurityDto } from "@/features/account/types/account-contracts";
vi.mock("server-only", () => ({}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }) }));
const render = (component: ReturnType<typeof createElement>) => renderToStaticMarkup(component);
describe("formulir nyata dan aksesibilitas", () => {
  it("akun baru tidak dianggap sudah terverifikasi atau sudah menerima email", () => {
    const html = render(
      createElement(RegistrationSuccess, {
        identifier: "nama@example.invalid",
        redirectTo: "/dashboard",
        verification: { verificationRequired: true, channel: "email", verificationAvailable: true },
      }),
    );
    expect(html).toContain("Akun dibuat");
    expect(html).toContain("belum terverifikasi");
    expect(html).toContain("Kirim verifikasi email");
    expect(html).not.toContain("Email terkirim");
    expect(html).toContain('href="/dashboard"');
  });
  it("signup telepon tanpa SMS tetap menawarkan akses akun dan status yang jujur", () => {
    const html = render(
      createElement(RegistrationSuccess, {
        identifier: "081234567890",
        redirectTo: "/dashboard",
        verification: { verificationRequired: true, channel: "sms", verificationAvailable: false },
      }),
    );
    expect(html).toContain("Verifikasi SMS belum tersedia");
    expect(html).toContain('href="/account/security"');
    expect(html).not.toContain("Kode terkirim");
  });
  it("workspace akun tanpa email memakai nomor nyata sebagai identitas", () => {
    const props = {
      identity: { name: null, email: null, phone: "+6281234567890" },
      children: null,
    };
    const html = render(createElement(CustomerWorkspaceShell, props));
    expect(html).toContain("+6281234567890");
    expect(html).not.toContain("@example");
  });
  it("pendaftaran tanpa input peran dan tanpa rahasia terkirim sebelum JS", () => {
    const html = render(createElement(RegisterForm));
    expect(html).toContain('name="identifier"');
    expect(html).toContain('autoComplete="username"');
    expect(html).toContain('minLength="12"');
    expect(html).toContain('autoComplete="new-password"');
    expect(html).toContain('method="post"');
    expect(html).toMatch(/<fieldset[^>]+disabled=""/);
    expect(html).not.toContain('name="role"');
  });
  it("persetujuan daftar mengelompokkan teks dan tautan agar dapat membungkus", () => {
    const html = render(createElement(RegisterForm));
    const consent = html.match(/<label class="check auth-consent">(.*?)<\/label>/)?.[1];
    expect(consent).toBeDefined();
    expect(consent).toMatch(/^<input[^>]*type="checkbox"[^>]*required=""[^>]*\/><span>/);
    expect(consent).toContain('<a href="/terms">Ketentuan</a>');
    expect(consent).toContain('<a href="/privacy">Privasi</a>');
    expect(consent).toMatch(/<\/span>$/);
  });
  it("pemulihan dinonaktifkan sebelum kemampuan server diketahui", () => {
    const html = render(createElement(PasswordRecoveryForm));
    expect(html).toContain('action="/api/auth/forgot-password"');
    expect(html).toContain('disabled=""');
    expect(html).not.toContain('name="token"');
  });
  it("proof reset tidak ditulis ke DOM", () => {
    const html = render(createElement(NewPasswordForm, { token: "secret-not-in-dom" }));
    expect(html).not.toContain("secret-not-in-dom");
    expect(html).toContain('name="confirmation"');
    expect(html).toMatch(/<fieldset[^>]+disabled=""/);
  });
  it("scanner verifikasi tidak memicu API", () => {
    const fetch = vi.spyOn(globalThis, "fetch");
    render(createElement(EmailVerificationForm));
    expect(fetch).not.toHaveBeenCalled();
    fetch.mockRestore();
  });
  it("tombol Google putih memakai G multicolor dan aria-hidden", () => {
    const html = render(createElement(GoogleAuthButton, { enabled: false }));
    for (const color of ["#EA4335", "#4285F4", "#FBBC05", "#34A853"]) expect(html).toContain(color);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('class="button google-button"');
    expect(html).toContain("Google belum tersedia.");
    expect(html).toContain('disabled=""');
  });
  it("proof wajib sebelum perubahan kata sandi", () => {
    const security: SecurityDto = {
      smsOtpEnabled: false,
      hasPassword: true,
      googleLinked: false,
      emailVerified: true,
      phoneVerified: false,
      reauthenticatedUntil: null,
      capabilities: { google: false, emailRecovery: false, smsOtp: false },
    };
    const html = render(
      createElement(PasswordSettings, { security, proved: false, refresh: async () => {} }),
    );
    expect(html).toMatch(/<fieldset[^>]+disabled=""/);
    expect(html).toContain('autoComplete="current-password"');
  });
  it.each([
    { proved: false, phoneVerified: true, smsOtp: true },
    { proved: true, phoneVerified: false, smsOtp: true },
    { proved: true, phoneVerified: true, smsOtp: false },
  ])("OTP login tidak aktif tanpa reauth, nomor verified, dan provider siap: %j", (gate) => {
    const html = render(
      createElement(SmsOtpSettings, {
        security: {
          hasPassword: true,
          googleLinked: false,
          emailVerified: false,
          phoneVerified: gate.phoneVerified,
          smsOtpEnabled: false,
          reauthenticatedUntil: null,
          capabilities: { google: false, emailRecovery: false, smsOtp: gate.smsOtp },
        },
        proved: gate.proved,
        refresh: async () => {},
      }),
    );
    expect(html).toContain("Kode SMS saat masuk");
    expect(html).toMatch(/<button[^>]+disabled=""/);
    expect(html).toContain('aria-pressed="false"');
  });
  it("umpan balik Google hanya menerima kode allowlist", () => {
    expect(render(createElement(OAuthFeedback, { code: "GOOGLE_CONFLICT" }))).toContain(
      "metode yang biasa digunakan",
    );
    expect(render(createElement(OAuthFeedback, { code: "<script>secret</script>" }))).toBe("");
  });
  it.each(["login", "register", "forgot-password", "reset-password", "verify-email"] as const)(
    "preview %s tetap sintetis",
    (mode) => {
      const html = render(createElement(AuthForm, { mode }));
      expect(html).toContain("contoh");
      expect(html).not.toContain("/api/auth/");
      expect(html).not.toContain("/api/account/");
    },
  );
});
