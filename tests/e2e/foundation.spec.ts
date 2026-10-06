import { expect, test } from "@playwright/test";

test("beranda dapat dibaca, digunakan dengan keyboard, dan tidak melebar di ponsel", async ({
  page,
}, testInfo) => {
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  await page.goto("/");
  await expect(page).toHaveTitle(/Menuju Akad/);
  await expect(page.locator("html")).toHaveAttribute("lang", "id");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Untuk cerita yang ingin kalian kenang.",
  );
  await expect
    .poll(() =>
      page.locator(".ornament").evaluate((element) => (element as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  await page.screenshot({ path: testInfo.outputPath("beranda.png"), fullPage: true });
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Langsung ke konten" })).toBeFocused();
  await page.getByRole("link", { name: "Kenali Menuju Akad" }).click();
  await expect(page).toHaveURL(/#tentang$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  expect(browserErrors).toEqual([]);
});

test("alamat yang belum ada memberikan 404 dan jalan kembali", async ({ page }) => {
  const response = await page.goto("/halaman-belum-ada");
  expect(response?.status()).toBe(404);
  await page.getByRole("link", { name: "Kembali ke beranda" }).click();
  await expect(page).toHaveURL("/");
});

test("health membedakan proses hidup dan database belum siap", async ({ request }) => {
  const live = await request.get("/api/health/live");
  expect(live.status()).toBe(200);
  const ready = await request.get("/api/health");
  expect(ready.status()).toBe(503);
  expect(ready.headers()["cache-control"]).toBe("no-store");
  expect(ready.headers()["x-content-type-options"]).toBe("nosniff");
  expect(await ready.json()).toEqual({
    status: "not_ready",
    checks: { application: "ok", database: "not_configured" },
  });
});
