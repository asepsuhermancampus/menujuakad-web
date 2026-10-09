import { expect, test } from "@playwright/test";
import { previewScreens, screenRecords } from "../../src/features/design-preview/data/screens";

test("preview mencakup 63 kode, 74 varian, noindex dan tanpa overflow", async ({
  page,
}, testInfo) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/preview-ui");
  await expect(page.getByRole("heading", { name: "Preview Studio" })).toBeVisible();
  for (const screen of previewScreens) {
    await page.goto(`/preview-ui/${screen.code.toLowerCase()}`);
    await expect(
      page.getByText("Data contoh · perubahan hanya di perangkat ini", { exact: true }),
    ).toBeVisible();
    await expect(page.locator("main").first()).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      screen.code,
    ).toBe(true);
  }
  for (const record of screenRecords.filter(
    (record) => previewScreens.find((screen) => screen.code === record.code)!.id !== record.id,
  )) {
    await page.goto(`/preview-ui/${record.code.toLowerCase()}?variant=${record.id}`);
    await expect(
      page.getByText(`${record.code} · ${record.state} · ${record.device}`, { exact: true }),
    ).toBeVisible();
  }
  expect((await page.goto("/preview-ui/unknown"))?.status()).toBe(404);
  expect(
    (
      await page.goto(
        `/preview-ui/inv-01?variant=${previewScreens.find((s) => s.code === "EDT-02")!.id}`,
      )
    )?.status(),
  ).toBe(404);
  expect(errors).toEqual([]);
  await page.goto("/preview-ui/edt-02");
  await page.screenshot({ path: testInfo.outputPath("editor.png"), fullPage: true });
});

test("rute customer/admin menolak cookie dan parameter identitas palsu", async ({
  page,
  context,
}) => {
  await context.addCookies([{ name: "role", value: "SUPERADMIN", domain: "127.0.0.1", path: "/" }]);
  for (const path of [
    "/dashboard",
    "/dashboard/invitations/example/editor",
    "/admin/payments",
    "/admin/webhooks?role=SUPERADMIN",
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login\?next=/);
    await expect(page.getByRole("heading", { name: "Masuk", exact: true })).toBeVisible();
  }
});

test("katalog, undangan, editor dan notifikasi berubah lokal tanpa mutasi", async ({ page }) => {
  const mutations: string[] = [];
  page.on("request", (request) => {
    if (request.method() !== "GET" && request.method() !== "HEAD") mutations.push(request.url());
  });
  await page.goto("/templates");
  await page.getByRole("textbox", { name: "Cari desain" }).fill("botanical");
  await expect(page.getByRole("heading", { name: "Botanical Garden" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Serenade No. 1" })).toHaveCount(0);
  await page.goto("/preview-ui/inv-01");
  await page.getByRole("button", { name: "Buka Undangan", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Rangkaian Acara" })).toBeVisible();
  await page.goto("/preview-ui/edt-02");
  await page.getByLabel("Judul sampul").fill("Alya & Bima");
  await page.getByRole("button", { name: "Simpan perubahan lokal" }).click();
  await expect(page.getByRole("status")).toContainText("Tersimpan lokal");
  await expect(page.getByRole("heading", { name: "Alya & Bima" })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Judul sampul")).toHaveValue("Sarah & Dimas");
  await page.goto("/preview-ui/acc-02");
  await page.getByRole("button", { name: "Belum Dibaca", exact: true }).click();
  await page.getByRole("button", { name: "Tandai semua dibaca lokal" }).click();
  await expect(page.getByText("Semua notifikasi contoh sudah dibaca.")).toBeVisible();
  expect(mutations).toEqual([]);
});

test("wizard, bantuan, validasi auth dan slug asing", async ({ page }) => {
  await page.goto("/preview-ui/cus-03");
  await page.getByRole("button", { name: "Lanjutkan", exact: true }).click();
  await page.getByLabel("Nama pasangan pertama").fill("Alya Contoh");
  await page.getByRole("button", { name: "Lanjutkan", exact: true }).click();
  await page.getByRole("button", { name: "Lanjutkan", exact: true }).click();
  await page.getByRole("button", { name: "Lanjutkan", exact: true }).click();
  await page.getByRole("button", { name: "Tinjau draft lokal" }).click();
  await expect(page.getByRole("status")).toContainText("Tidak ada undangan dibuat");
  await page.goto("/preview-ui/sup-01");
  await page.getByRole("button", { name: "+ Tiket Contoh Baru" }).click();
  await page.getByLabel("Judul pertanyaan").fill("Pertanyaan tata letak contoh");
  await page
    .getByLabel("Pesan contoh", { exact: true })
    .fill("Mohon bantu tinjau tata letak contoh.");
  await page.getByRole("button", { name: "Tambahkan tiket lokal" }).click();
  await expect(page.getByRole("status")).toContainText("Tidak dikirim");
  await page.goto("/preview-ui/aut-04");
  await page.getByLabel("Kata sandi baru", { exact: true }).fill("contoh-1234");
  await page.getByLabel("Konfirmasi kata sandi").fill("berbeda-1234");
  await page.getByRole("button", { name: /Tinjau kata sandi baru/ }).click();
  await expect(page.getByRole("status")).toContainText("Konfirmasi kata sandi belum sama");
  expect((await page.goto("/templates/desain-asing"))?.status()).toBe(404);
  expect((await page.goto("/demo/desain-asing"))?.status()).toBe(404);
  expect((await page.goto("/invitation/undangan-asing"))?.status()).toBe(404);
});

test("galeri kuota dan selector token invalid mempertahankan state sumber", async ({ page }) => {
  const gallery = previewScreens.find((screen) => screen.code === "EDT-06")!;
  const full = gallery.variants.find((variant) => variant.state.includes("Error"))!;
  await page.goto(`/preview-ui/edt-06?variant=${full.id}`);
  await expect(page.getByText("20 / 20 contoh", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Tambahkan ilustrasi contoh" }).click();
  await expect(page.getByRole("status").first()).toContainText("Kuota galeri contoh tercapai");
  const cover = previewScreens.find((screen) => screen.code === "INV-01")!;
  const invalid = cover.variants.find((variant) => variant.state.includes("Tidak Valid"))!;
  await page.goto("/preview-ui/inv-01");
  await page.getByLabel("Varian sumber").selectOption(invalid.id);
  await expect(
    page.getByRole("heading", { name: "Tautan Undangan Tidak Dapat Ditemukan" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Buka Undangan", exact: true })).toHaveCount(0);
});

test("komposisi utama tidak melebar pada viewport tablet", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  for (const path of ["/", "/preview-ui/cus-01", "/preview-ui/edt-02", "/preview-ui/inv-02"]) {
    await page.goto(path);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      path,
    ).toBe(true);
  }
});
