import { expect, test } from "@playwright/test";

test("verifikasi dan konflik metode mempunyai state lokal khusus tanpa layanan", async ({
  page,
}) => {
  const writes: string[] = [];
  page.on("request", (request) => {
    if (!["GET", "HEAD"].includes(request.method())) writes.push(request.url());
  });
  await page.goto("/preview-ui/aut-05");
  await expect(page.getByText("akun@example.invalid", { exact: true })).toBeVisible();
  const resend = page.getByRole("button", { name: "Simulasikan kirim ulang" });
  await expect(resend).toBeDisabled();
  await page.getByRole("button", { name: "Simulasikan 30 detik berlalu" }).click();
  await page.getByRole("button", { name: "Simulasikan 30 detik berlalu" }).click();
  await expect(resend).toBeEnabled();
  await resend.click();
  await expect(page.getByRole("status")).toContainText("Email tidak dikirim");
  await expect(resend).toBeDisabled();
  await page.goto("/preview-ui/aut-06");
  await expect(page.getByRole("heading", { name: "Metode Google (contoh)" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Metode Email (contoh)" })).toBeVisible();
  await page.getByRole("button", { name: "Tinjau masuk dengan Google" }).click();
  await expect(page.getByRole("status")).toContainText("Google belum terhubung");
  await page.getByRole("button", { name: "Tinjau pemulihan email" }).click();
  await expect(page.getByRole("status")).toContainText("Email tidak dikirim");
  expect(writes).toEqual([]);
});

test("tiga mode sampul dan overlay berubah pada pratinjau lokal", async ({ page }) => {
  await page.goto("/preview-ui/edt-02");
  await page.getByRole("button", { name: "Solid", exact: true }).click();
  await expect(page.locator('[data-cover-mode="SOLID"]')).toBeVisible();
  await page.getByLabel("Kegelapan overlay").focus();
  await page.keyboard.press("End");
  for (let step = 0; step < 3; step += 1) await page.keyboard.press("ArrowLeft");
  await expect(page.locator('[data-cover-mode="SOLID"]')).toHaveAttribute("data-overlay", "75");
  await page.getByRole("button", { name: "Portrait", exact: true }).click();
  await expect(page.locator('[data-cover-mode="PORTRAIT"]')).toBeVisible();
  await page.getByRole("button", { name: "Type Focus", exact: true }).click();
  await expect(page.locator('[data-cover-mode="TYPE_FOCUS"]')).toBeVisible();
  await page.getByRole("button", { name: "Simpan perubahan lokal" }).click();
  await expect(page.getByRole("status")).toContainText("Tersimpan lokal");
});

test("countdown memakai durasi deterministik, gaya dan zero-state", async ({ page }) => {
  await page.goto("/preview-ui/edt-12");
  await page.getByLabel("Waktu tujuan (WIB)").fill("2026-10-08T15:00");
  await expect(page.getByLabel("Durasi contoh deterministik")).toContainText("1 Hari");
  await expect(page.getByLabel("Durasi contoh deterministik")).toContainText("0 Jam");
  await page.getByRole("button", { name: "Kartu", exact: true }).click();
  await expect(page.locator('[data-countdown-style="CARDS"]')).toBeVisible();
  await page.getByLabel("Waktu tujuan (WIB)").fill("2026-10-06T15:00");
  await expect(
    page.getByText("Hari bahagia telah tiba (contoh)", { exact: true }).first(),
  ).toBeVisible();
});
