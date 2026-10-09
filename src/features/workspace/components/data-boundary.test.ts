import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));
import { workspaceLayoutView, workspaceView } from "./data-boundary";
import { WorkspaceError } from "@/server/invitations/errors";
it("layout data failure keeps one main and safe error content", async () => {
  const html = renderToStaticMarkup(
    await workspaceLayoutView(async () => {
      throw new WorkspaceError(503, "Data sementara tidak tersedia.");
    }),
  );
  expect(html.match(/<main\b/g)).toHaveLength(1);
  expect(html).toContain('id="main"');
  expect(html).toContain("Data sementara tidak tersedia.");
});
it("page data failure remains a section within existing shell", async () => {
  const html = renderToStaticMarkup(
    createElement(
      "main",
      null,
      await workspaceView(async () => {
        throw new WorkspaceError(503, "Data sementara tidak tersedia.");
      }),
    ),
  );
  expect(html.match(/<main\b/g)).toHaveLength(1);
});
