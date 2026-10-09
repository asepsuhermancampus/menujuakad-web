import { expect, test, type Locator, type Page } from "@playwright/test";

async function expectColumns(cards: Locator, columns: number) {
  await expect(cards).toHaveCount(4);
  const bounds = await cards.evaluateAll((elements) =>
    elements.map((element) => {
      const { x, y, width } = element.getBoundingClientRect();
      return { x, y, width };
    }),
  );
  for (let index = 0; index < bounds.length; index++) {
    const rowStart = Math.floor(index / columns) * columns;
    expect(Math.abs(bounds[index].y - bounds[rowStart].y)).toBeLessThan(1);
    expect(bounds[index].width).toBeGreaterThan(0);
    if (index % columns > 0) {
      expect(bounds[index].x).toBeGreaterThanOrEqual(bounds[index - 1].x + bounds[index - 1].width);
    } else if (index > 0) {
      expect(bounds[index].y).toBeGreaterThan(bounds[index - columns].y);
    }
  }
}

async function expectNoPageOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
}

async function expectTouchTarget(control: Locator, viewportWidth: number) {
  await expect(control).toBeVisible();
  const bounds = await control.boundingBox();
  expect(bounds).not.toBeNull();
  expect.soft(bounds!.width).toBeGreaterThanOrEqual(48);
  expect.soft(bounds!.height).toBeGreaterThanOrEqual(48);
  expect.soft(bounds!.x).toBeGreaterThanOrEqual(0);
  expect.soft(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewportWidth + 1);
}

for (const width of [701, 767, 768, 1024]) {
  const columns = width >= 1024 ? 4 : width >= 768 ? 2 : 1;
  test(`GST-01 ${width}px: ${columns} kolom dan bidang tamu sesuai perangkat`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/preview-ui/gst-01");
    await expectColumns(
      page.getByRole("region", { name: "Ringkasan tamu contoh" }).getByRole("article"),
      columns,
    );
    const firstRow = page.getByRole("table").locator("tbody tr").first();
    const labels = firstRow.locator(".guest-cell-label");
    await expect(labels).toHaveText(["Nama", "Grup", "Alokasi kursi", "RSVP", "Pengiriman contoh"]);
    if (width < 768) {
      for (const label of await labels.all()) await expect(label).toBeVisible();
      const cells = await firstRow.getByRole("cell").all();
      for (const cell of cells) {
        const bounds = await cell.boundingBox();
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      }
      expect(await firstRow.evaluate((row) => getComputedStyle(row).display)).toBe("block");
    } else {
      for (const label of await labels.all()) await expect(label).toBeHidden();
      expect(await firstRow.evaluate((row) => getComputedStyle(row).display)).toBe("table-row");
    }
    await expectNoPageOverflow(page);
  });

  test(`GST-03 ${width}px: empat ringkasan sumber dalam ${columns} kolom`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/preview-ui/gst-03");
    const cards = page
      .locator(".business > div")
      .filter({ has: page.getByRole("article") })
      .getByRole("article");
    await expectColumns(cards, columns);
    /*
     * Struktur mengikuti sumber Stitch GST-03: empat ringkasan hierarki
     * (Total Respons Masuk, Total Hadir Pasti, Konfirmasi Berhalangan,
     * Belum Menjawab). MAYBE dipisahkan eksplisit di blok "Masih ragu".
     */
    for (const [index, label] of [
      "Total Respons Masuk",
      "Total Hadir Pasti",
      "Konfirmasi Berhalangan",
      "Belum Menjawab",
    ].entries()) {
      await expect(cards.nth(index).getByRole("heading")).toHaveText(label);
    }
    // Nilai ringkasan: respons 100/120, hadir 68, berhalangan 20, pending 20.
    await expect(cards.nth(0).locator("p").first()).toContainText("100");
    await expect(cards.nth(1).locator("p").first()).toContainText("68");
    await expect(cards.nth(2).locator("p").first()).toContainText("20");
    await expect(cards.nth(3).locator("p").first()).toContainText("20");
    // Blok MAYBE tetap terpisah agar tidak menyamakan ragu dengan hadir/pending.
    await expect(page.getByText(/Masih ragu: 12 undangan/)).toBeVisible();
    await expectNoPageOverflow(page);
  });
}

for (const width of [320, 701, 767, 768, 1024]) {
  test(`Kontrol ${width}px: tab domain dan selector varian minimal 48×48 tanpa overflow`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const code of ["gst-01", "cus-08"]) {
      await page.goto(`/preview-ui/${code}`);
      await expectTouchTarget(page.getByLabel("Varian sumber"), width);
      if (code === "gst-01") {
        const nav = page.getByRole("navigation", { name: "Kelola undangan" });
        for (const tab of await nav.getByRole("link").all()) {
          await expectTouchTarget(tab, width);
        }
        expect(
          await nav.evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
        ).toBe(true);
      }
      await expectNoPageOverflow(page);
    }
  });
}

test("320px: keyboard memfokuskan selector dan kelima tab dengan indikator terlihat", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 1000 });
  await page.goto("/preview-ui/gst-01");
  const selector = page.getByLabel("Varian sumber");
  const tabs = page.getByRole("navigation", { name: "Kelola undangan" }).getByRole("link");
  const controls = [selector, ...(await tabs.all())];
  await page.getByRole("link", { name: "← Preview Studio" }).focus();
  for (const control of controls) {
    for (let step = 0; step < 20; step++) {
      await page.keyboard.press("Tab");
      if (await control.evaluate((element) => element === document.activeElement)) break;
    }
    await expect(control).toBeFocused();
    expect(await control.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
    const outline = await control.evaluate((element) => {
      const style = getComputedStyle(element);
      return { style: style.outlineStyle, width: parseFloat(style.outlineWidth) };
    });
    expect(outline.style).not.toBe("none");
    expect(outline.width).toBeGreaterThan(0);
    await expectTouchTarget(control, 320);
    await expectNoPageOverflow(page);
  }
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/preview-ui\/gst-06$/);
});
