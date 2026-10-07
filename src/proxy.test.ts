import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { getPreviewScreen } from "./features/design-preview/data/screens";
import { proxy } from "./proxy";
describe("batas HTTP rute preview dan slug contoh", () => {
  it.each([
    "/preview-ui/unknown",
    "/preview-ui/pub-01/more",
    "/preview-ui/PUB-99",
    "/templates/unknown",
    "/demo/unknown",
    "/invitation/unknown",
  ])("menolak %s dengan 404 sebelum streaming", (path) => {
    expect(proxy(new NextRequest(`https://menujuakad.com${path}`)).status).toBe(404);
  });
  it("menolak varian silang, tak dikenal, dan parameter varian ganda", () => {
    const wrong = getPreviewScreen("EDT-02")!.id;
    for (const query of [`variant=${wrong}`, "variant=unknown", "variant=a&variant=b"]) {
      expect(
        proxy(new NextRequest(`https://menujuakad.com/preview-ui/inv-01?${query}`)).status,
      ).toBe(404);
    }
  });
  it.each([
    "/preview-ui",
    "/preview-ui/pub-01",
    "/templates/serenade-no-1",
    "/demo/serenade-no-1",
    "/invitation/sarah-dimas-contoh",
  ])("meneruskan path terdaftar %s", (path) => {
    expect(
      proxy(new NextRequest(`https://menujuakad.com${path}`)).headers.get("x-middleware-next"),
    ).toBe("1");
  });
});
