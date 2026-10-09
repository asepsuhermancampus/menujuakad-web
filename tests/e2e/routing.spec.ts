import { expect, test } from "@playwright/test";

/*
 * Routing resmi: memastikan seluruh halaman publik baru dapat diakses dan
 * route workspace terlindungi menolak tanpa sesi terverifikasi.
 */
test("route publik baru dapat diakses tanpa sesi", async ({ page }) => {
  const pages: readonly [string, string][] = [
    ["/blog", "Panduan untuk"],
    ["/blog/panduan-menyusun-rundown-akad", "Menyusun Rundown Akad"],
    ["/blog/memilih-palet-undangan", "Memilih Palet Warna"],
    ["/blog/etika-mengundang-tamu-digital", "Etika Mengundang Tamu"],
  ];
  for (const [path, heading] of pages) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.status(), path).toBe(200);
    await expect(page.locator("main h1")).toContainText(heading);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      path,
    ).toBe(true);
  }
});

test("slug artikel asing menghasilkan halaman tidak ditemukan", async ({ page }) => {
  const response = await page.goto("/blog/slug-tidak-ada", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(404);
});

test("navigasi publik memuat tautan Blog", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Navigasi utama" }).getByRole("link", { name: "Blog" })).toBeVisible();
});

test("route workspace menolak akses tanpa sesi terverifikasi", async ({ page }) => {
  const protectedPaths = [
    "/dashboard",
    "/dashboard/guests",
    "/dashboard/rsvp",
    "/dashboard/wishes",
    "/dashboard/gifts",
    "/dashboard/notifications",
    "/dashboard/support",
    "/dashboard/analytics",
    "/admin",
    "/admin/payments",
    "/admin/webhooks",
  ];
  for (const path of protectedPaths) {
    await page.goto(path, { waitUntil: "networkidle" });
    await expect(page, path).toHaveURL(/\/login\?next=/);
  }
});

test("cookie dan parameter identitas palsu tidak membuka workspace", async ({ context, page }) => {
  await context.addCookies([
    {
      name: "menujuakad_session",
      value: "palsu-tidak-valid",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
  for (const path of ["/dashboard/guests?role=SUPERADMIN", "/admin/webhooks?userId=admin"]) {
    await page.goto(path, { waitUntil: "networkidle" });
    await expect(page, path).toHaveURL(/\/login\?next=/);
  }
});

test("sitemap memuat halaman blog dan tidak memuat rute privat", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const xml = await response.text();
  expect(xml).toContain("/blog");
  expect(xml).toContain("/blog/panduan-menyusun-rundown-akad");
  expect(xml).not.toMatch(/preview-ui|\/login|\/dashboard|\/admin/);
});
