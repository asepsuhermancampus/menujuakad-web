import { test, expect } from "@playwright/test";
test("guest filters, local add and import reject duplicates", async ({ page }) => {
  await page.goto("/preview-ui/gst-01");
  await page.getByLabel("Status RSVP", { exact: true }).selectOption("MAYBE");
  await expect(page.getByRole("table")).toContainText("Masih ragu");
  await expect(page.getByRole("table")).not.toContainText("Belum menjawab");
  await page.getByRole("button", { name: "Reset filter" }).click();
  await page.getByRole("button", { name: "Tambah tamu contoh" }).click();
  await expect(page.locator('p[role="status"]')).toContainText("ditambahkan");
  await page.goto("/preview-ui/gst-02");
  await page
    .getByLabel("Baris impor contoh")
    .fill("Nama Sintetis;FAMILY\nNama Sintetis;FRIENDS\n;FAMILY");
  await expect(page.getByRole("table")).toContainText("DUPLICATE");
  await page.getByRole("button", { name: "Tambahkan baris valid lokal" }).click();
  await expect(page.locator('p[role="status"]')).toContainText("1 tamu contoh");
  await expect(page.getByLabel("Baris impor contoh")).toHaveValue(
    "Nama Sintetis;FAMILY\nNama Sintetis;FRIENDS\n;FAMILY",
  );
});
test("moderation, gifts and analytics remain local and reflow", async ({ page }) => {
  const writes: string[] = [];
  page.on("request", (request) => {
    if (!["GET", "HEAD"].includes(request.method())) writes.push(request.url());
  });
  await page.goto("/preview-ui/gst-04");
  await page.getByRole("button", { name: "Sembunyikan Tamu Contoh 001", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Tampilkan Tamu Contoh 001", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", {
      name: "Sembunyikan Tamu Contoh 001",
      exact: true,
    }),
  ).toBeVisible();
  await page.goto("/preview-ui/gst-05");
  await page.getByLabel("Tampilkan bagian hadiah contoh").check();
  await expect(page.getByText("Bagian contoh ditampilkan lokal.", { exact: false })).toBeVisible();
  await page.goto("/preview-ui/gst-06");
  await page.getByLabel("Periode contoh").selectOption("LAST3");
  await expect(page.getByRole("heading", { name: "Tidak tersedia", exact: true })).toBeVisible();
  await page.setViewportSize({ width: 320, height: 800 });
  for (const code of ["gst-01", "gst-02", "gst-03", "gst-04", "gst-05", "gst-06"]) {
    await page.goto(`/preview-ui/${code}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
  }
  expect(writes).toEqual([]);
});

test("ringkasan tamu memakai seluruh daftar dan berubah bersama tambahan lokal", async ({
  page,
}) => {
  await page.goto("/preview-ui/gst-01");
  const summary = page.getByRole("region", { name: "Ringkasan tamu contoh" });
  const registered = summary
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name: "Tamu terdaftar", exact: true }) });
  const seats = summary
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name: "Alokasi kursi", exact: true }) });
  const delivery = summary
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name: "Pengiriman contoh", exact: true }) });
  const rsvp = summary
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name: "RSVP", exact: true }) });
  await expect(summary.getByRole("article")).toHaveCount(4);
  await expect(registered).toContainText("120");
  await expect(seats).toContainText("120");
  await expect(delivery).toContainText("100 / 120");
  await expect(rsvp).toContainText("57%");
  await page.getByLabel("Status RSVP", { exact: true }).selectOption("MAYBE");
  await expect(registered).toContainText("120");
  await expect(delivery).toContainText("100 / 120");
  await page.getByRole("button", { name: "Reset filter", exact: true }).click();
  await page.getByRole("button", { name: "Tambah tamu contoh", exact: true }).click();
  await expect(registered).toContainText("121");
  await expect(seats).toContainText("121");
  await expect(delivery).toContainText("100 / 121");
  await expect(rsvp).toContainText("56%");
  await page.reload();
  await expect(registered).toContainText("120");
  await expect(delivery).toContainText("100 / 120");
});

test("tamu kosong dan kartu mobile menjaga label, kursi dan tombol pagination", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.goto("/preview-ui/gst-01?variant=b0e90f9cdfef471093bb75009f1521ad");
  const summary = page.getByRole("region", { name: "Ringkasan tamu contoh" });
  await expect(summary.getByRole("article")).toHaveCount(4);
  await expect(summary).toContainText("0 / 0");
  await expect(summary).not.toContainText(/NaN|Infinity/);
  await expect(
    page.getByRole("progressbar", { name: "Persentase pengiriman contoh" }),
  ).toHaveAttribute("value", "0");
  await page.getByRole("button", { name: "Tambah tamu contoh", exact: true }).click();
  const row = page
    .getByRole("row")
    .filter({ has: page.getByRole("cell", { name: "Tamu Lokal Contoh 1", exact: true }) });
  await expect(row.getByRole("cell")).toHaveCount(5);
  await expect(row.getByRole("cell", { name: "Teman", exact: true })).toBeVisible();
  await expect(row.getByRole("cell", { name: "1 kursi", exact: true })).toBeVisible();
  await expect(row.getByRole("cell", { name: "Belum menjawab", exact: true })).toBeVisible();
  await expect(row.getByRole("cell", { name: "Belum dikirim", exact: true })).toBeVisible();
  for (const label of await row.locator(".guest-cell-label").all()) {
    await expect(label).toBeVisible();
  }
  const presentation = await row.evaluate((element) => ({
    labels: Array.from(element.querySelectorAll(".guest-cell-label")).map(
      (label) => label.textContent,
    ),
    fits: Array.from(element.querySelectorAll("td")).every(
      (cell) => cell.getBoundingClientRect().right <= innerWidth,
    ),
  }));
  expect(presentation.labels).toEqual([
    "Nama",
    "Grup",
    "Alokasi kursi",
    "RSVP",
    "Pengiriman contoh",
  ]);
  expect(presentation.fits).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const name of ["Sebelumnya", "Selanjutnya"]) {
    const button = page.getByRole("button", { name, exact: true });
    await expect(button).toBeDisabled();
    const box = await button.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(48);
  }
});
