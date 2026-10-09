import { afterEach, describe, expect, it, vi } from "vitest";
import { authRequest, fetchCsrf, isLocalAuthRedirect, isGoogleAuthRedirect } from "./auth-client";
const json = (body: unknown, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers });
afterEach(() => vi.unstubAllGlobals());
describe("HTTP autentikasi browser", () => {
  it("mengambil CSRF baru sebelum setiap mutasi dan tidak menyimpan rahasia", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(json({ ok: true, data: { csrfToken: "proof" } }))
      .mockResolvedValueOnce(json({ ok: true, data: { name: "Nama" } }));
    vi.stubGlobal("fetch", fetch);
    await authRequest("/api/account/profile", "PATCH", { name: "Nama" });
    expect(fetch.mock.calls[0][0]).toBe("/api/auth/csrf");
    expect(fetch.mock.calls[1][1]).toMatchObject({
      method: "PATCH",
      cache: "no-store",
      credentials: "same-origin",
      headers: { "X-CSRF-Token": "proof" },
    });
  });
  it("gagal tertutup saat bootstrap CSRF tidak menyediakan token", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({ ok: true, data: {} })));
    await expect(fetchCsrf()).rejects.toThrow();
  });
  it("tidak mengirim token CSRF ke origin atau endpoint asing", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    await expect(authRequest("https://evil.test/api", "POST", {})).rejects.toThrow();
    await expect(authRequest("/api/auth/../billing", "POST", {})).rejects.toThrow();
    expect(fetch).not.toHaveBeenCalled();
  });
  it("menampilkan batas percobaan aman dengan Retry-After", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(json({ ok: false, error: "unsafe" }, 429, { "Retry-After": "60" })),
    );
    await expect(authRequest("/api/account/security")).rejects.toMatchObject({
      status: 429,
      retryAfter: 60,
    });
  });
  it("membatasi redirect lokal pada domain aplikasi yang disahkan", () => {
    for (const path of ["/dashboard", "/admin/users", "/account/security"])
      expect(isLocalAuthRedirect(path)).toBe(true);
    for (const path of [
      "//evil.test",
      "/account/../admin",
      "/account/%2e%2e/admin",
      "/dashboard?next=https://evil.test",
      "/account\\evil",
      "https://evil.test",
    ])
      expect(isLocalAuthRedirect(path)).toBe(false);
  });
  it("redirect Google hanya HTTPS endpoint otorisasi resmi", () => {
    expect(
      isGoogleAuthRedirect("https://accounts.google.com/o/oauth2/v2/auth?client_id=test"),
    ).toBe(true);
    for (const url of [
      "http://accounts.google.com/o/oauth2/v2/auth",
      "https://accounts.google.com.evil.test/o/oauth2/v2/auth",
      "https://accounts.google.com/logout",
      "https://evil@accounts.google.com/o/oauth2/v2/auth",
    ])
      expect(isGoogleAuthRedirect(url)).toBe(false);
  });
});
