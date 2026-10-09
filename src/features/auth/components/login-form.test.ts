import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { LoginForm } from "./login-form";
import { AuthForm } from "./auth-form";
describe("login and preview isolation", () => {
  it("actual login renders credential fields and safe POST fallback", () => {
    const html = renderToStaticMarkup(createElement(LoginForm, { next: "/dashboard" }));
    expect(html).toContain('method="post"');
    expect(html).toContain('autoComplete="current-password"');
    expect(html).toContain('action="/api/auth/login"');
    expect(html).toContain('disabled=""');
    expect(html).not.toContain('name="role"');
  });
  it("preview auth remains synthetic with no real API form action", () => {
    const html = renderToStaticMarkup(createElement(AuthForm, { mode: "login" }));
    expect(html).toContain("Tampilan contoh");
    expect(html).not.toContain("/api/auth/login");
    expect(html).toContain("Gunakan data contoh");
  });
});
