import { expect, test } from "@playwright/test";

/*
 * RSVP publik `/u/[token]` berjalan tanpa sesi. E2E ini berjalan dengan
 * DATABASE_URL kosong (fail-closed), sehingga hanya menguji kontrak yang tidak
 * membutuhkan database:
 * - token dengan format salah ditolak proxy dengan 404 asli sebelum streaming;
 * - token berformat benar tetapi DB mati menampilkan "layanan belum tersedia"
 *   (bukan 404 — tautan tamu tidak boleh dikira rusak karena gangguan server);
 * - halaman selalu noindex dan tidak pernah masuk sitemap;
 * - API publik menolak origin asing/metode salah dan fail-closed tanpa detail.
 */

test("token dengan format salah menghasilkan 404 asli tanpa identitas tamu", async ({ page }) => {
  const response = await page.goto("/u/token-pendek", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(404);
  /* Tidak boleh ada kebocoran identitas tamu pada state invalid. */
  await expect(page.locator("body")).not.toContainText("Kepada Yth.");
  await expect(page.locator("body")).not.toContainText("Alokasi kursi");
});

test("token berformat benar tanpa database menampilkan layanan belum tersedia", async ({
  page,
}) => {
  const response = await page.goto(`/u/${"a".repeat(43)}`, { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);
  await expect(page.locator("main h1")).toContainText("Layanan Konfirmasi Belum Tersedia");
  /* Bukan halaman data tamu: tidak ada identitas siapa pun. */
  await expect(page.locator("body")).not.toContainText("Kepada Yth.");
});

test("halaman RSVP publik selalu noindex dan tidak masuk sitemap", async ({ page, request }) => {
  for (const path of ["/u/token-pendek", `/u/${"a".repeat(43)}`]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    /*
     * Next.js menambahkan meta robots sendiri pada halaman 404, jadi bisa ada
     * lebih dari satu tag. Semua harus noindex — tidak boleh ada yang index.
     */
    const robots = await page.locator('meta[name="robots"]').evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("content") ?? ""),
    );
    expect(robots.length, path).toBeGreaterThan(0);
    for (const content of robots) expect(content, path).toContain("noindex");
  }
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).not.toMatch(/\/u\//);
});

test("API publik menolak origin asing dan metode selain PUT sebelum menyentuh data", async ({
  request,
}) => {
  const token = "a".repeat(43);
  const noOrigin = await request.put(`/api/public/rsvp/${token}`, {
    data: { status: "ATTENDING", guestCount: 1 },
  });
  expect(noOrigin.status()).toBe(403);
  const wrongMethod = await request.get(`/api/public/rsvp/${token}`, {
    headers: { origin: "http://127.0.0.1:3107" },
  });
  expect(wrongMethod.status()).toBe(405);
});

test("API publik fail-closed saat database tidak tersedia (tanpa membocorkan detail)", async ({
  request,
}) => {
  const token = "a".repeat(43);
  const response = await request.put(`/api/public/rsvp/${token}`, {
    headers: { origin: "http://127.0.0.1:3107" },
    data: { status: "ATTENDING", guestCount: 1 },
  });
  /*
   * 403 = gate origin tertutup karena konfigurasi auth tidak ada (CI),
   * 429 = batas laju, 503 = DB tidak tersedia. Semuanya fail-closed.
   */
  expect([403, 429, 503]).toContain(response.status());
  const text = await response.text();
  expect(text).not.toMatch(/postgres|DATABASE_URL|stack/i);
});
