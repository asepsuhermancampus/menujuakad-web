import { expect, test } from "@playwright/test";

const routes = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];

test("auth reflow, reduced motion dan bukti visual 320/390/768/1440", async ({ page }) => {
  /*
   * Tes ini memuat 20 halaman (4 viewport × 5 rute) dan mengambil 20 screenshot
   * fullPage. Pada proyek mobile itu melebihi batas bawaan 30 detik — kegagalan
   * sebelumnya adalah timeout saat screenshot, bukan kegagalan assertion.
   * Anggaran waktu dinaikkan agar seluruh kombinasi terverifikasi.
   */
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of routes) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      await expect(page.locator("main h1")).toBeVisible();
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        "noindex, nofollow",
      );
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
        `${path} ${width}`,
      ).toBeLessThanOrEqual(width);
      const motion = await page.locator(".auth-card").evaluate((element) => {
        const style = getComputedStyle(element);
        return { animation: style.animationName, transition: style.transitionDuration };
      });
      expect(motion.animation).toBe("none");
      expect(motion.transition).toBe("0s");
      await page.screenshot({
        path: `/tmp/menujuakad-qa-auth-${test.info().project.name}-${path.slice(1)}-${width}.png`,
        fullPage: true,
      });
    }
  }
});

test("keyboard login mengirim satu POST mock dengan CSRF tanpa bocor URL", async ({ page }) => {
  await page.route("**/api/auth/capabilities", (route) =>
    route.fulfill({
      json: { ok: true, data: { google: false, emailRecovery: false, smsOtp: false } },
    }),
  );
  await page.route("**/api/auth/csrf", (route) =>
    route.fulfill({
      json: { ok: true, data: { csrfToken: "keyboard-proof" } },
    }),
  );
  let calls = 0;
  await page.route("**/api/auth/login", (route) => {
    calls++;
    expect(route.request().headers()["x-csrf-token"]).toBe("keyboard-proof");
    expect(route.request().postDataJSON()).toEqual({
      identifier: "keyboard@example.invalid",
      password: "password_example",
    });
    return route.fulfill({ status: 401, json: { ok: false, code: "INVALID_CREDENTIALS" } });
  });
  await page.goto("/login");
  const identifier = page.getByLabel("Email atau nomor telepon");
  await expect(identifier).toBeEnabled();
  await identifier.focus();
  await page.keyboard.type("keyboard@example.invalid");
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Kata sandi", { exact: true })).toBeFocused();
  await page.keyboard.type("password_example");
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Tampilkan kata sandi", { exact: true })).toBeFocused();
  await page.keyboard.press("Space");
  await expect(page.locator("input[name=password]")).toHaveAttribute("type", "text");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Lupa kata sandi?" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Masuk", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main").getByRole("alert")).toContainText("tidak sesuai");
  expect(calls).toBe(1);
  await expect(page).toHaveURL(/\/login$/);
});

test("reset tanpa proof dan fragment tanpa JS tidak memicu mutasi", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: "http://127.0.0.1:3107",
  });
  const page = await context.newPage();
  const writes: string[] = [];
  page.on("request", (request) => {
    if (!["GET", "HEAD"].includes(request.method())) writes.push(request.url());
  });
  try {
    for (const path of [
      "/reset-password",
      "/reset-password#token=synthetic_token_0123456789",
      "/verify-email#token=synthetic_token_0123456789",
    ]) {
      await page.goto(path);
      await expect(page.locator("form input")).toHaveCount(0);
      const before = page.url();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(before);
    }
    expect(writes).toEqual([]);
  } finally {
    await context.close();
  }
});

test("API nyata tanpa konfigurasi fail closed dan capability provider false", async ({
  request,
}) => {
  const capability = await request.get("/api/auth/capabilities");
  expect(capability.status()).toBe(200);
  expect(await capability.json()).toEqual({
    ok: true,
    data: { google: false, emailRecovery: false, smsOtp: false },
  });
  for (const path of [
    "/api/auth/csrf",
    "/api/account/profile",
    "/api/account/security",
    "/api/account/sessions",
  ]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(503);
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect((await response.json()).ok).toBe(false);
    expect(response.headers()["set-cookie"] ?? "").not.toMatch(/menujuakad_session=[^;]/);
  }
  for (const path of [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/forgot-password",
    "/api/auth/google/start",
  ]) {
    const response = await request.post(path, {
      data: { identifier: "qa@example.invalid", password: "password_example" },
    });
    expect(response.status(), path).toBe(503);
    expect((await response.json()).ok).toBe(false);
    expect(response.headers()["set-cookie"] ?? "").not.toMatch(/menujuakad_session=[^;]/);
  }
});

test("alias akun tidak membuka area privat dengan cookie palsu", async ({
  context,
  page,
}) => {
  await context.addCookies([
    { name: "menujuakad_session", value: "synthetic-forged-token", domain: "127.0.0.1", path: "/" },
  ]);
  for (const path of [
    "/account",
    "/account/security",
    "/dashboard/account",
    "/dashboard/settings",
    "/dashboard/settings/profile",
    "/dashboard/settings/security",
  ]) {
    await page.goto(path);
    await expect(page, path).toHaveURL(/\/login\?next=/);
    expect(new URL(page.url()).searchParams.get("next")).toMatch(
      /^\/(account|dashboard)(\/|$)/,
    );
    await expect(page.getByRole("heading", { name: "Masuk", exact: true })).toBeVisible();
  }
});

test("teks auth 200 persen dan lebar efektif zoom tetap reflow", async ({ page }) => {
  // 1440/2 = 720 CSS px; ini reflow ekuivalen, bukan zoom browser native.
  await page.setViewportSize({ width: 720, height: 900 });
  for (const path of routes) {
    await page.goto(path);
    await page.addStyleTag({
      content: "main p, main label, main button, main input { font-size: 200% !important; }",
    });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      path,
    ).toBe(true);
    await expect(page.locator("main h1")).toBeVisible();
  }
});

test("preview auth tetap inert dengan JavaScript dan tidak bootstrap API auth", async ({
  page,
}) => {
  const calls: string[] = [];
  page.on("request", (request) => {
    if (
      new URL(request.url()).pathname.startsWith("/api/auth/") ||
      !["GET", "HEAD"].includes(request.method())
    )
      calls.push(request.url());
  });
  await page.goto("/preview-ui/aut-01");
  await page.getByLabel("Alamat email", { exact: true }).fill("preview@example.invalid");
  await page.getByLabel("Kata sandi", { exact: true }).fill("password_example");
  await page.getByRole("button", { name: "Tinjau form masuk" }).click();
  await expect(page.getByRole("status")).toContainText("tidak ada data yang dikirim");
  for (const code of ["aut-02", "aut-03", "aut-04", "aut-05", "aut-06", "acc-01", "acc-02"]) {
    await page.goto(`/preview-ui/${code}`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, nofollow",
    );
  }
  expect(calls).toEqual([]);
});

test("empat alias akun melakukan redirect307 sebelum guard customer", async ({ request, page }) => {
  for (const [path, destination] of [
    ["/dashboard/account", "/account"],
    ["/dashboard/settings", "/account"],
    ["/dashboard/settings/profile", "/account"],
    ["/dashboard/settings/security", "/account/security"],
  ]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(307);
    expect(new URL(response.headers().location, "http://127.0.0.1:3107").pathname).toBe(
      destination,
    );
    await page.goto(path);
    await expect(page).toHaveURL(/\/login\?next=/);
    expect(new URL(page.url()).searchParams.get("next")).toMatch(/^\/account(?:\/security)?$/);
  }
});
