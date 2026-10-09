import { expect, test, type Page } from "@playwright/test";
async function bootstrap(
  page: Page,
  capabilities = { google: false, emailRecovery: true, smsOtp: true },
) {
  await page.route("**/api/auth/capabilities", (route) =>
    route.fulfill({ json: { ok: true, data: capabilities } }),
  );
  await page.route("**/api/auth/csrf", (route) =>
    route.fulfill({ json: { ok: true, data: { csrfToken: "browser-proof" } } }),
  );
}
test("login email/telepon memakai CSRF dan tetap ringkas pada layar kecil", async ({ page }) => {
  await bootstrap(page);
  const payloads: unknown[] = [];
  await page.route("**/api/auth/login", async (route) => {
    expect(route.request().headers()["x-csrf-token"]).toBe("browser-proof");
    payloads.push(route.request().postDataJSON());
    await route.fulfill({ status: 401, json: { ok: false, code: "INVALID_CREDENTIALS" } });
  });
  await page.goto("/login");
  await expect(page.getByRole("button", { name: "Masuk dengan Google" })).toBeDisabled();
  await page.getByLabel("Email atau nomor telepon").fill("081234567890");
  await page.getByLabel("Kata sandi", { exact: true }).fill("password_example");
  await page.getByLabel("Tampilkan kata sandi", { exact: true }).check();
  await expect(page.locator("input[name=password]")).toHaveAttribute("type", "text");
  await page.locator("form").evaluate((form) => {
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
  await expect(page.locator("main").getByRole("alert")).toContainText("tidak sesuai");
  expect(payloads).toEqual([{ identifier: "081234567890", password: "password_example" }]);
  expect(page.url()).not.toContain("password_example");
  expect(
    await page.locator(".auth-card").evaluate((el) => el.getBoundingClientRect().width),
  ).toBeLessThanOrEqual(400);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => window.innerWidth),
  );
  await page.screenshot({
    path: `/tmp/menujuakad-auth-ui-login-${test.info().project.name}.png`,
    fullPage: true,
  });
});
test("pendaftaran mengirim field kontrak tanpa peran atau checkbox kebijakan", async ({ page }) => {
  await bootstrap(page);
  let payload: unknown;
  await page.route("**/api/auth/register", (route) => {
    payload = route.request().postDataJSON();
    return route.fulfill({ status: 503, json: { ok: false, code: "UNAVAILABLE" } });
  });
  await page.goto("/register");
  await page.getByLabel("Nama lengkap").fill("Nama Contoh");
  await page.getByLabel("Email atau nomor telepon").fill("account@example.invalid");
  await page.getByLabel("Kata sandi", { exact: true }).fill("password_example");
  await page.getByRole("checkbox", { name: /Saya menyetujui/ }).check();
  await page.getByRole("button", { name: "Daftar", exact: true }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText("belum tersedia");
  expect(payload).toEqual({
    name: "Nama Contoh",
    identifier: "account@example.invalid",
    password: "password_example",
  });
});
test("pemulihan SMS dua tahap tidak menyimpan proof pada URL atau storage", async ({ page }) => {
  await bootstrap(page);
  await page.route("**/api/auth/forgot-password", (route) =>
    route.fulfill({
      status: 202,
      json: { ok: true, data: { token: "transient-challenge", expiresIn: 300, resendAfter: 60 } },
    }),
  );
  await page.route("**/api/auth/otp/verify", (route) => {
    expect(route.request().postDataJSON()).toEqual({
      token: "transient-challenge",
      code: "123456",
    });
    return route.fulfill({ json: { ok: true, data: { resetToken: "reset-proof" } } });
  });
  await page.route("**/api/auth/reset-password", (route) => {
    expect(route.request().postDataJSON()).toEqual({
      token: "reset-proof",
      password: "password_example",
    });
    return route.fulfill({ json: { ok: true, redirectTo: "/login" } });
  });
  await page.goto("/forgot-password");
  await page.getByLabel("Email atau nomor telepon").fill("081234567890");
  await page.getByRole("button", { name: "Kirim petunjuk" }).click();
  await page.getByLabel("Kode SMS").fill("123456");
  await expect(page.getByRole("button", { name: /Kirim ulang dalam/ })).toBeDisabled();
  await page.getByRole("button", { name: "Verifikasi kode" }).click();
  await page.getByLabel("Kata sandi baru", { exact: true }).fill("password_example");
  await page.getByLabel("Konfirmasi kata sandi", { exact: true }).fill("password_example");
  await page.getByRole("button", { name: "Simpan kata sandi" }).click();
  await expect(page.getByRole("status")).toContainText("diperbarui");
  expect(page.url()).not.toContain("proof");
  expect(page.url()).not.toContain("challenge");
  expect(
    await page.evaluate(() => [Object.keys(localStorage), Object.keys(sessionStorage)]),
  ).toEqual([[], []]);
});
test("token fragment dibersihkan dan verifikasi memerlukan tindakan eksplisit", async ({
  page,
}) => {
  await bootstrap(page);
  let calls = 0;
  await page.route("**/api/auth/email/verify", (route) => {
    calls++;
    expect(route.request().postDataJSON()).toEqual({ token: "0123456789_abcdefghijklmnop" });
    return route.fulfill({ json: { ok: true, redirectTo: "/login" } });
  });
  const response = await page.goto("/verify-email#token=0123456789_abcdefghijklmnop");
  expect(response?.headers()["referrer-policy"]).toBe("no-referrer");
  await expect(page.getByRole("button", { name: "Verifikasi email" })).toBeEnabled();
  expect(new URL(page.url()).hash).toBe("");
  expect(calls).toBe(0);
  await page.getByRole("button", { name: "Verifikasi email" }).click();
  await expect(page.getByRole("status")).toContainText("terverifikasi");
  expect(calls).toBe(1);
});
test("Google tidak meneruskan redirect ke origin asing", async ({ page }) => {
  await bootstrap(page, { google: true, emailRecovery: false, smsOtp: false });
  await page.route("**/api/auth/google/start", (route) => {
    expect(route.request().postDataJSON()).toEqual({ intent: "login" });
    return route.fulfill({ json: { ok: true, redirectTo: "https://evil.example/oauth" } });
  });
  await page.goto("/login");
  await page.getByRole("button", { name: "Masuk dengan Google" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText("belum tersedia");
  await expect(page).toHaveURL(/\/login$/);
});
test("tanpa JavaScript seluruh field kredensial tetap disabled", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: "http://127.0.0.1:3107",
  });
  const page = await context.newPage();
  try {
    for (const path of ["/login", "/register", "/forgot-password"]) {
      await page.goto(path);
      for (const input of await page.locator("form input, form button").all())
        await expect(input).toBeDisabled();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(`http://127.0.0.1:3107${path}`);
    }
  } finally {
    await context.close();
  }
});

test("login 202 menunggu OTP dan memakai challenge baru setelah resend", async ({ page }) => {
  await bootstrap(page);
  await page.route("**/api/auth/login", (route) =>
    route.fulfill({
      status: 202,
      json: {
        ok: true,
        data: { otpRequired: true, token: "login-challenge", expiresIn: 300, resendAfter: 0 },
      },
    }),
  );
  await page.route("**/api/auth/otp/resend", (route) => {
    expect(route.request().headers()["x-csrf-token"]).toBe("browser-proof");
    expect(route.request().postDataJSON()).toEqual({ token: "login-challenge" });
    return route.fulfill({
      status: 202,
      json: { ok: true, data: { token: "replacement-challenge", expiresIn: 300, resendAfter: 60 } },
    });
  });
  await page.route("**/api/auth/otp/verify", (route) => {
    expect(route.request().headers()["x-csrf-token"]).toBe("browser-proof");
    expect(route.request().postDataJSON()).toEqual({
      token: "replacement-challenge",
      code: "123456",
    });
    return route.fulfill({ status: 400, json: { ok: false, code: "INVALID_PROOF" } });
  });
  await page.goto("/login");
  await page.getByLabel("Email atau nomor telepon").fill("081234567890");
  await page.getByLabel("Kata sandi", { exact: true }).fill("password_example");
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Konfirmasi masuk" })).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole("button", { name: "Kirim ulang kode" }).click();
  await expect(page.getByRole("button", { name: /Kirim ulang dalam/ })).toBeDisabled();
  await page.getByLabel("Kode SMS").fill("123456");
  await page.getByRole("button", { name: "Verifikasi kode" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText("kedaluwarsa");
  expect(
    await page.evaluate(() => [Object.keys(localStorage), Object.keys(sessionStorage)]),
  ).toEqual([[], []]);
  expect(page.url()).not.toContain("challenge");
});

test("signup tanpa pengiriman tetap memberi status belum verified serta akses akun", async ({
  page,
}) => {
  await bootstrap(page);
  let deliveries = 0;
  await page.route("**/api/auth/email/request", (route) => {
    deliveries++;
    return route.abort();
  });
  await page.route("**/api/auth/register", (route) =>
    route.fulfill({
      status: 201,
      json: {
        ok: true,
        redirectTo: "/dashboard",
        data: { verificationRequired: true, channel: "sms", verificationAvailable: false },
      },
    }),
  );
  await page.goto("/register");
  await page.getByLabel("Nama lengkap").fill("Nama Contoh");
  await page.getByLabel("Email atau nomor telepon").fill("081234567890");
  await page.getByLabel("Kata sandi", { exact: true }).fill("password_example");
  await page.getByRole("checkbox", { name: /Saya menyetujui/ }).check();
  await page.getByRole("button", { name: "Daftar", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("belum terverifikasi");
  await expect(page.getByText(/Verifikasi SMS belum tersedia/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Lanjut ke ruang kerja" })).toHaveAttribute(
    "href",
    "/dashboard",
  );
  await expect(page.getByRole("link", { name: "Kelola kontak & keamanan" })).toHaveAttribute(
    "href",
    "/account/security",
  );
  expect(deliveries).toBe(0);
});

test("429 menampilkan countdown dan menolak klik ulang", async ({ page }) => {
  await bootstrap(page);
  let calls = 0;
  await page.route("**/api/auth/login", (route) => {
    calls++;
    return route.fulfill({
      status: 429,
      headers: { "Retry-After": "60" },
      json: { ok: false, code: "RATE_LIMITED" },
    });
  });
  await page.goto("/login");
  await page.getByLabel("Email atau nomor telepon").fill("contoh@example.invalid");
  await page.getByLabel("Kata sandi", { exact: true }).fill("password_example");
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText("detik");
  await expect(page.getByRole("button", { name: "Masuk", exact: true })).toBeDisabled();
  expect(calls).toBe(1);
});
