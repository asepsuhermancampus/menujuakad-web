import { expect, test } from "@playwright/test";

/*
 * Form auth resmi dan form simulasi sama-sama tidak boleh mengirim nilai
 * tanpa JavaScript. Reset simulasi berada di AUT-04; route reset resmi tanpa
 * fragment tidak merender field dan diuji terpisah di kontrak auth.
 */
test("form contoh inert tanpa JavaScript dan tidak mengirim nilai lewat URL/body", async ({
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
      "/register",
      "/forgot-password",
      "/preview-ui/aut-04",
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

/*
 * Form login nyata tanpa JavaScript harus tetap aman: tidak mengirim nilai
 * contoh lewat URL/body, tetap di halaman yang sama, dan tidak membocorkan
 * isi form ke query string saat submit gagal.
 */
test("form login nyata tidak membocorkan nilai contoh lewat URL tanpa JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: "http://127.0.0.1:3107",
  });
  const page = await context.newPage();
  const marker = "qa-local-sensitive-example";
  try {
    await page.goto("/login");
    const input = page.locator("form input[name=identifier]").first();
    expect(await input.count(), "/login").toBeGreaterThan(0);
    await expect(input).toBeDisabled();
    await expect(input).toHaveAttribute("autocomplete", "username");
    await expect(input.fill(marker, { timeout: 150 })).rejects.toThrow();
    await expect(page.getByRole("button", { name: "Masuk", exact: true })).toBeDisabled();
    expect(new URL(page.url()).search, "/login").toBe("");
    // Nilai tidak boleh muncul pada URL setelah interaksi keyboard apa pun.
    await page.keyboard.press("Enter");
    expect(new URL(page.url()).search.includes(marker)).toBe(false);
    await expect(page).toHaveURL("http://127.0.0.1:3107/login");
  } finally {
    await context.close();
  }
});
