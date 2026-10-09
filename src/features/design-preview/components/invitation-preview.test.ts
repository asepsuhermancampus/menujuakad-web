import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { InvitationCustomerPreview } from "./invitation-customer-preview";
import { InvitationSettingsPreview } from "./invitation-settings-preview";
import { RsvpPreview } from "@/features/guests/components/rsvp-preview";

// Kontrak SSR yang penting: kontrol pengaturan inert sebelum JavaScript, angka respons tetap konsisten.
describe("kontrak layar undangan sintetis", () => {
  it("CUS-05 menampilkan identitas sintetis, kuota uji dan konfigurasi RSVP tertunda", () => {
    const html = renderToStaticMarkup(createElement(InvitationCustomerPreview));
    expect(html).toContain('id="main"');
    for (const label of [
      "Tamu Contoh 001",
      "Kuota uji: 2",
      "Batas Waktu RSVP Belum Ditentukan",
      "Mobile",
      "Tablet",
      "Desktop",
      "Zoom",
    ])
      expect(html).toContain(label);
    expect(html).not.toMatch(/<iframe|\.png|https:\/\/.*googleusercontent/);
  });
  it("CUS-06 mengunci submit SSR dan tidak memiliki input sandi nyata", () => {
    const html = renderToStaticMarkup(createElement(InvitationSettingsPreview));
    expect(html).toContain('data-preview-ready="false"');
    expect(html).toContain('disabled=""');
    for (const label of [
      "tidak ada autosave database",
      "KONFIRMASI",
      "Hanya simulasi konfirmasi penghapusan",
      "Rute preview selalu noindex",
    ])
      expect(html).toContain(label);
    expect(html).not.toMatch(/type="password"|action="https?:|name="password"/);
  });
  it("GST-03 menghitung 100 respons termasuk ragu dan hanya memakai identitas contoh", () => {
    const html = renderToStaticMarkup(createElement(RsvpPreview));
    expect(html).toMatch(/100 <span>\/ 120 undangan/);
    expect(html).toContain("Masih ragu: 12 undangan");
    expect(html).toContain("Termasuk 100 respons masuk");
    expect(html).toContain("24 orang pada sesi");
    expect(html).toContain("68 orang pada sesi");
    expect(html).toContain("Tidak tersinkron ke layanan");
    expect(html).toContain("Tamu Contoh 069");
    expect(html).toContain("Tamu Contoh 089");
    expect(html).not.toContain("Sarah Ramadhani");
  });
});
