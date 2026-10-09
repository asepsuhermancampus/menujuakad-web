import { test, expect } from "@playwright/test";

const codes = [
  "cus-07",
  "cus-08",
  "adm-01",
  "adm-02",
  "gst-01",
  "gst-02",
  "gst-03",
  "gst-04",
  "gst-05",
  "gst-06",
];

test("kontrol specialist dapat difokuskan dengan keyboard dan mempunyai nama", async ({ page }) => {
  for (const code of codes) {
    await page.goto(`/preview-ui/${code}`);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Langsung ke konten" })).toBeFocused();
    await page.keyboard.press("Enter");
    const controls = page.locator(
      "main button:enabled, main input:enabled, main select:enabled, main textarea:enabled, main a[href]",
    );
    for (let index = 0; index < (await controls.count()); index++) {
      const control = controls.nth(index);
      if (!(await control.isVisible())) continue;
      await control.focus();
      await expect(control).toBeFocused();
      await expect(control).toHaveAccessibleName(/\S/);
      expect(
        await control.evaluate((element) => {
          const style = getComputedStyle(element);
          return style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0;
        }),
      ).toBe(true);
    }
  }
});

test("specialist reflow pada lebar efektif 200 persen dan teks diperbesar", async ({ page }) => {
  // 1440/2 = 720 CSS px: reflow ekuivalen; bukan klaim browser zoom native.
  await page.setViewportSize({ width: 720, height: 900 });
  for (const code of codes) {
    await page.goto(`/preview-ui/${code}`);
    await page.addStyleTag({
      content: "main p, main label, main button, main td, main th { font-size: 200% !important; }",
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
    await expect(page.locator("main h1")).toBeVisible();
  }
});
