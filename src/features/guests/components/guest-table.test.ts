import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { guestsFixture } from "@/features/design-preview/data/guests-fixtures";
import { GuestTable } from "./guest-table";

describe("tabel tamu sintetis", () => {
  it("menampilkan grup Indonesia, kursi aktual dan status contoh dari DTO", () => {
    const html = renderToStaticMarkup(
      createElement(GuestTable, {
        guests: [{ ...guestsFixture[0], group: "COLLEAGUES", partySize: 4, rsvpStatus: "MAYBE" }],
      }),
    );
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    expect(text).toContain("Rekan kerja");
    expect(text).toContain("4 kursi");
    expect(text).toContain("Masih ragu");
    expect(text).toContain("Ilustrasi terkirim");
    expect(html).not.toContain("COLLEAGUES");
  });
});
