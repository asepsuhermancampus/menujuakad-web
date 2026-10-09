import { test, expect } from "@playwright/test";
test("public canonical and private noindex match release policy", async ({ page, request }) => {
  for (const path of ["/", "/about", "/templates", "/templates/serenade-no-1"]) {
    await page.goto(path);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://menujuakad.com${path === "/" ? "" : path}`,
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index, follow");
  }
  for (const path of [
    "/login?next=/admin",
    "/reset-password?token=example",
    "/preview-ui/gst-01",
    "/pricing",
    "/privacy",
    "/demo/serenade-no-1",
  ]) {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, nofollow",
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  }
  const xml = await request.get("/sitemap.xml");
  expect(xml.status()).toBe(200);
  expect(await xml.text()).not.toMatch(/preview-ui|login|pricing/);
  expect((await request.get("/robots.txt")).status()).toBe(200);
});
