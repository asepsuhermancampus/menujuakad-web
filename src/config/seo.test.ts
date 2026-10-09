import { expect, it } from "vitest";
import { publicPageMetadata, seoOrigin } from "./seo";
import sitemap from "@/app/sitemap";
it("canonical uses fixed production origin and rejects request-like paths", () => {
  expect(publicPageMetadata("/about", "À propos", "Exemple").alternates?.canonical).toBe(
    `${seoOrigin}/about`,
  );
  for (const path of [
    "//evil.test",
    "https://evil.test",
    "/login?token=secret",
    "/about#x",
    "/a\n",
  ])
    expect(() => publicPageMetadata(path, "x", "x")).toThrow();
});
it("sitemap contains only unique public pages and known templates", () => {
  const urls = sitemap().map((entry) => entry.url);
  // 7 halaman publik + 3 template + 3 artikel blog contoh.
  expect(urls).toHaveLength(13);
  expect(new Set(urls).size).toBe(13);
  expect(urls.every((url) => url.startsWith(`${seoOrigin}/`))).toBe(true);
  expect(urls.join(" ")).not.toMatch(/preview-ui|login|pricing|privacy|terms|invitation|demo/);
  // Blog baru terdaftar sebagai halaman publik yang boleh diindeks.
  expect(urls).toContain(`${seoOrigin}/blog`);
  expect(urls).toContain(`${seoOrigin}/blog/panduan-menyusun-rundown-akad`);
});
