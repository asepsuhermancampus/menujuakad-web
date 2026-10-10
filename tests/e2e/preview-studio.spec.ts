import { expect, test } from "@playwright/test";

/*
 * Preview Studio menggabungkan seluruh kode layar sumber Stitch ke satu halaman
 * berkelompok. Snapshot 10 Oktober 2026: 86 kode / 120 varian, 12 kelompok
 * domain (PUB, AUT, CUS, EDT, GST, INV, ACC, SUP, PLN, ADM, ERR, DS).
 * Test ini mengunci perilaku penggabungan: pengelompokan domain, pencarian,
 * filter area, navigasi prev/next, dan ketahanan tanpa overflow.
 */
test("Preview Studio mengelompokkan layar per domain tanpa overflow", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/preview-ui");
  await expect(page.getByRole("heading", { name: "Preview Studio" })).toBeVisible();
  // 12 kelompok domain (PUB, AUT, CUS, EDT, GST, INV, ACC, SUP, PLN, ADM, ERR, DS).
  await expect(page.locator(".preview-domain")).toHaveCount(12);
  // Seluruh 86 kode tampil sebagai baris ringkas, bukan kartu besar.
  await expect(page.locator(".preview-row")).toHaveCount(86);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
  ).toBe(true);
});

test("pencarian dan filter area menyaring baris tanpa menghilangkan domain", async ({ page }) => {
  await page.goto("/preview-ui");
  await page.getByLabel("Cari layar").fill("RSVP");
  await expect(page.locator(".preview-row")).toHaveCount(2);
  await page.getByLabel("Cari layar").fill("");
  await page.getByLabel("Area layar").selectOption("customer");
  const rows = await page.locator(".preview-row").count();
  expect(rows).toBeGreaterThan(0);
  expect(rows).toBeLessThan(86);
  await page.getByLabel("Area layar").selectOption("all");
  await expect(page.locator(".preview-row")).toHaveCount(86);
});

test("kelompok domain dapat diringkas dan dibuka kembali", async ({ page }) => {
  await page.goto("/preview-ui");
  const pubDomain = page.locator(".preview-domain").filter({ hasText: "Halaman Publik" });
  await expect(pubDomain.locator(".preview-row")).toHaveCount(13);
  await pubDomain.getByRole("button", { name: "Ringkas kelompok" }).click();
  await expect(pubDomain.locator(".preview-row")).toHaveCount(0);
  await pubDomain.getByRole("button", { name: "Buka kelompok" }).click();
  await expect(pubDomain.locator(".preview-row")).toHaveCount(13);
});

test("navigasi antar-layar sekelompok bekerja tanpa kembali ke studio", async ({ page }) => {
  await page.goto("/preview-ui/edt-15");
  const neighbors = page.getByRole("navigation", { name: "Navigasi layar sekelompok" });
  await expect(neighbors.getByText("EDT 15/20")).toBeVisible();
  await neighbors.getByRole("link", { name: /EDT-16/ }).click();
  await expect(page).toHaveURL(/\/preview-ui\/edt-16/);
  await expect(page.locator(".preview-banner > div small")).toContainText("EDT-16");
  // Kembali ke studio tetap tersedia sebagai tautan pertama.
  await page.getByRole("link", { name: "← Preview Studio" }).click();
  await expect(page).toHaveURL(/\/preview-ui$/);
});

test("Preview Studio tetap terbaca pada 320 dan 390 px tanpa overflow", async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/preview-ui");
    await expect(page.locator(".preview-row").first()).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    ).toBe(true);
  }
});
