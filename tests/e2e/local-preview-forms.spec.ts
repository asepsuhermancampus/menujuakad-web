import { expect, test } from "@playwright/test";
test("semua form contoh inert tanpa JavaScript dan tidak mengirim nilai lewat URL/body", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: "http://127.0.0.1:3107",
  });
  const page = await context.newPage();
  const leaked: string[] = [];
  const marker = "qa-local-sensitive-example";
  page.on("request", (request) => {
    if (request.url().includes(marker) || request.postData()?.includes(marker))
      leaked.push(request.url());
  });
  try {
    for (const path of [
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
      "/contact",
      "/preview-ui/acc-01",
      "/preview-ui/sup-01",
      "/preview-ui/cus-03",
      "/preview-ui/inv-02",
    ]) {
      await page.goto(path);
      const controls = page.locator("form input, form textarea, form select, form button");
      expect(await controls.count(), path).toBeGreaterThan(0);
      for (const control of await controls.all()) await expect(control, path).toBeDisabled();
      const input = page
        .locator("form input:not([type=checkbox]):not([type=radio]), form textarea")
        .first();
      if (await input.count()) await expect(input.fill(marker, { timeout: 150 })).rejects.toThrow();
      const before = page.url();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(before);
      expect(new URL(page.url()).search, path).toBe("");
    }
    expect(leaked).toEqual([]);
  } finally {
    await context.close();
  }
});
