import { test, expect, devices } from "@playwright/test";

function trackWrites(page: import("@playwright/test").Page) {
  const calls: string[] = [];
  page.on("request", (request) => {
    if (!["GET", "HEAD"].includes(request.method()) || /mayar|midtrans|xendit/i.test(request.url()))
      calls.push(request.url());
  });
  return calls;
}

test("package selection stays local and checkout remains a fixed example", async ({ page }) => {
  const calls = trackWrites(page);
  await page.goto("/preview-ui/cus-07");
  await page.getByRole("button", { name: "Pilih Premium", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator('p[role="status"]')).toContainText("Pilihan lokal: Premium");
  await expect(page.getByRole("button", { name: "Pilih Premium", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("link", { name: "Lihat checkout contoh Signature" }).click();
  const checkout = page.locator('[data-billing="checkout"]');
  await expect(checkout).toHaveAttribute("data-checkout-status", "PENDING");
  await expect(page.getByLabel("Sisa waktu contoh")).toHaveText("45:00");
  await page.getByRole("radio", { name: /Virtual Account Bank/ }).check();
  await page.getByRole("button", { name: "Lihat status contoh" }).click();
  await expect(page.locator('p[role="status"]')).toContainText("Menunggu (contoh)");
  await expect(checkout).toHaveAttribute("data-checkout-status", "PENDING");
  await page.getByRole("button", { name: "Tinjau kode promo" }).click();
  await expect(page.locator('p[role="status"]')).toContainText("tidak ada diskon diterapkan");
  await expect(checkout.locator("canvas, svg, img, form")).toHaveCount(0);
  expect(calls).toEqual([]);
});

test("expired state displays a banner above both columns without reopening its order", async ({
  page,
}) => {
  const calls = trackWrites(page);
  await page.goto("/preview-ui/cus-08?variant=741bf2dc293243f29a02bea0b8546ed6");
  await expect(page.getByLabel("Sesi pembayaran kedaluwarsa")).toBeVisible();
  await expect(page.getByLabel("Sisa waktu contoh")).toHaveText("00:00");
  await page.getByRole("button", { name: "Lihat status contoh" }).click();
  await expect(page.locator('p[role="status"]')).toContainText("Kedaluwarsa (contoh)");
  await page.getByRole("button", { name: "Tinjau pergantian metode" }).click();
  await expect(page.locator('p[role="status"]')).toContainText("Tidak membuat tagihan");
  await expect(page.locator('[data-billing="checkout"]')).toHaveAttribute(
    "data-checkout-status",
    "EXPIRED",
  );
  expect(calls).toEqual([]);
});

test("admin order filtering, pagination, details and empty results remain synthetic", async ({
  page,
}) => {
  const calls = trackWrites(page);
  await page.goto("/preview-ui/adm-01");
  await page.getByRole("button", { name: "Selanjutnya", exact: true }).click();
  await page.getByRole("button", { name: "Detail demo-order-paid", exact: true }).click();
  await expect(page.getByLabel("Detail order contoh")).toContainText(
    "Tidak diterbitkan oleh preview",
  );
  await page.getByLabel("Status order", { exact: true }).selectOption("PAID");
  await expect(page.getByLabel("Order pembayaran contoh")).toContainText("Dibayar (contoh)");
  await page.getByLabel("Cari ID order").fill("unknown");
  await expect(
    page.getByText("Tidak ada order contoh yang cocok. Ubah atau reset filter."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset filter" }).click();
  await page.getByRole("button", { name: "Tinjau sinkronisasi provider" }).click();
  await expect(page.locator('p[role="status"]')).toContainText("Tidak menghubungi provider");
  expect(calls).toEqual([]);
});

test("webhook retries do not change fixture attempts or event status", async ({ page }) => {
  const calls = trackWrites(page);
  await page.goto("/preview-ui/adm-02");
  await page.getByLabel("Status event", { exact: true }).selectOption("FAILED");
  await page.getByRole("button", { name: "Inspeksi demo-webhook-03", exact: true }).click();
  const detail = page.getByRole("complementary", { name: "Detail event contoh" });
  await expect(detail.getByLabel("Ringkasan event sintetis")).toContainText('"attempts": 3');
  await page.getByRole("button", { name: "Simulasikan tampilan retry", exact: true }).click();
  await expect(page.locator('p[role="status"]')).toContainText("3 percobaan contoh tetap");
  await expect(detail.getByLabel("Ringkasan event sintetis")).toContainText('"status": "FAILED"');
  await expect(detail.getByLabel("Ringkasan event sintetis")).toContainText('"attempts": 3');
  await page.getByLabel("Cari ID event").fill("unknown");
  await expect(
    page.getByText("Tidak ada event contoh yang cocok. Ubah atau reset filter."),
  ).toBeVisible();
  expect(calls).toEqual([]);
});

test("billing content reflows at 320px with overflow confined to tables", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  for (const code of ["cus-07", "cus-08", "adm-01", "adm-02"]) {
    await page.goto(`/preview-ui/${code}`);
    await expect(page.locator("[data-billing]")).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    ).toBe(true);
  }
});

async function expectPackagePricesToFit(page: import("@playwright/test").Page, width: number) {
  await page.setViewportSize({ width, height: 900 });
  const geometry = await page.evaluate(() => ({
    width: innerWidth,
    scroll: document.documentElement.scrollWidth,
    pricesFit: Array.from(document.querySelectorAll(".billing-package .billing-price")).every(
      (price) => {
        const range = document.createRange();
        range.selectNodeContents(price);
        const text = range.getBoundingClientRect();
        const card = price.closest(".billing-package")!.getBoundingClientRect();
        return text.left >= card.left && text.right <= card.right && text.right <= innerWidth;
      },
    ),
  }));
  expect(geometry.width).toBe(width);
  expect(geometry.scroll).toBeLessThanOrEqual(width);
  expect(geometry.pricesFit).toBe(true);
}

for (const touch of [false, true]) {
  test.describe(`paket tablet ${touch ? "dengan" : "tanpa"} sentuhan`, () => {
    const device = devices[touch ? "Pixel 7" : "Desktop Chrome"];
    test.use({
      hasTouch: device.hasTouch,
      isMobile: device.isMobile,
      userAgent: device.userAgent,
      viewport: { width: 768, height: 900 },
      deviceScaleFactor: 1,
    });
    test("harga tetap di dalam kartu pada 768, 769 dan 800 px", async ({ page }) => {
      await page.goto("/preview-ui/cus-07");
      await page.evaluate(() => document.fonts.ready);
      await expect(page.getByRole("button", { name: "Pilih Premium", exact: true })).toBeVisible();
      expect(await page.evaluate(() => navigator.maxTouchPoints > 0)).toBe(touch);
      for (const width of [768, 769, 800]) {
        await expectPackagePricesToFit(page, width);
      }
      const select = page.getByRole("button", { name: "Pilih Premium", exact: true });
      if (touch) await select.tap();
      else await select.click();
      await expect(page.locator('p[role="status"]')).toContainText("Pilihan lokal: Premium");
    });
  });
}
