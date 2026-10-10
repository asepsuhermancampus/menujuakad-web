import { describe, expect, it } from "vitest";
import { getPreviewScreen, getPreviewVariant, previewScreens, screenRecords } from "./screens";
import {
  analyticsFixture,
  billingFixture,
  guestsFixture,
  giftsFixture,
  invitationFixture,
  rsvpFixture,
  wishesFixture,
  accountFixture,
  invitationsFixture,
  rsvpStatusLabels,
} from "./fixtures";

describe("kontrak preview sintetis", () => {
  it("screen_codes_are_unique_and_views_whitelisted", () => {
    // Snapshot Stitch 10 Oktober 2026: 86 kode / 120 varian sumber.
    expect(previewScreens).toHaveLength(86);
    expect(new Set(previewScreens.map((screen) => screen.code)).size).toBe(86);
    expect(screenRecords).toHaveLength(120);
    expect(new Set(screenRecords.map((screen) => screen.id)).size).toBe(120);
    expect(previewScreens.flatMap((screen) => screen.variants)).toHaveLength(120);
    expect(getPreviewScreen("pub-01")?.logicalRoute).toBe("/");
    expect(getPreviewScreen("PUB-05")?.logicalRoute).toBe("/pricing");
    expect(getPreviewScreen("ADM-01")?.audience).toBe("admin");
    for (const [code, id, height] of [
      ["CUS-05", "61139739fb3c4c33b03bfdfbecd99c52", 2048],
      ["CUS-06", "bcb43b8dd3f94746ace5cbab77003ee7", 4392],
    ] as const) {
      expect(getPreviewScreen(code)).toMatchObject({
        id,
        audience: "customer",
        sourceStatus: "screenshot",
        width: 2560,
        height,
      });
    }
    expect(getPreviewScreen("DS-01")?.audience).toBe("reference");
    expect(getPreviewScreen("DS-02")?.audience).toBe("reference");
    // Kode modul perencanaan dan admin operasional kini tersedia di Stitch.
    for (const code of ["PLN-01", "PLN-02", "PLN-17", "ADM-03", "ADM-08"]) {
      expect(getPreviewScreen(code)?.audience).toBe(
        code.startsWith("PLN") ? "customer" : "admin",
      );
    }
    for (const code of [
      "__proto__",
      "constructor",
      "toString",
      "../ADM-01",
      "%41DM-01",
      "ADM-01?role=SUPERADMIN",
      " CUS-01",
      "PUB-99",
    ]) {
      expect(getPreviewScreen(code)).toBeUndefined();
    }
  });

  it("mempertahankan perangkat/state sumber tanpa mengklaim screenshot yang hilang", () => {
    expect(
      screenRecords
        .filter((record) => record.sourceStatus === "metadata-only")
        .map((record) => record.code),
    ).toEqual([]);
    expect(screenRecords.filter((record) => record.sourceStatus === "screenshot")).toHaveLength(120);
    expect(getPreviewScreen("CUS-01")?.sourceStatus).toBe("screenshot");
    expect(getPreviewScreen("CUS-02")?.sourceStatus).toBe("screenshot");
    expect(getPreviewScreen("CUS-08")?.variants.map((variant) => variant.state)).toContain(
      "Sesi Expired",
    );
    expect(getPreviewScreen("EDT-06")?.variants.map((variant) => variant.state)).toContain(
      "Kuota Penuh",
    );
    // Urutan varian mengikuti urutan sumber Stitch; perbandingan memakai
    // himpunan agar tidak bergantung pada urutan balikan API.
    expect(
      new Set(getPreviewScreen("PUB-01")?.variants.map((variant) => variant.device)),
    ).toEqual(new Set(["DESKTOP", "MOBILE"]));
    expect(getPreviewVariant("../../secrets")).toBeUndefined();
  });

  it("fixtures_have_synthetic_identity_and_integer_idr", () => {
    expect(invitationFixture.id).toBe("demo-invitation-01");
    expect(accountFixture.email).toMatch(/@example\.invalid$/);
    expect(guestsFixture).toHaveLength(120);
    expect(new Set(guestsFixture.map((guest) => guest.id)).size).toBe(120);
    for (const guest of guestsFixture) {
      expect(guest.id).toMatch(/^demo-guest-/);
      expect(guest.displayName).toMatch(/^Tamu Contoh /);
      expect(guest.invitationId).toBe(invitationFixture.id);
    }
    for (const order of billingFixture.orders) {
      expect(order.currency).toBe("IDR");
      expect(Number.isSafeInteger(order.amountIdr)).toBe(true);
      expect(order.amountIdr).toBeGreaterThanOrEqual(0);
      expect(order.createdAt).toBe(new Date(order.createdAt).toISOString());
      expect(order.expiresAt).toBe(new Date(order.expiresAt).toISOString());
      expect(Date.parse(order.expiresAt)).toBeGreaterThan(Date.parse(order.createdAt));
      expect(billingFixture.packages.some((item) => item.id === order.packageId)).toBe(true);
    }
    expect(billingFixture.mode).toBe("synthetic");
    expect(billingFixture.paymentInstrument).toBeNull();
    for (const gift of giftsFixture) {
      expect(Number.isSafeInteger(gift.amountIdr)).toBe(true);
      expect(gift.status).toBe("DECLARED");
      expect(guestsFixture.some((guest) => guest.id === gift.guestId)).toBe(true);
    }
    for (const wish of wishesFixture) {
      expect(guestsFixture.some((guest) => guest.id === wish.guestId)).toBe(true);
      expect(wish.createdAt).toBe(new Date(wish.createdAt).toISOString());
    }
  });

  it("uses_product_rsvp_status_for_twenty_absent_guests", () => {
    expect(guestsFixture.filter((guest) => guest.rsvpStatus === "NOT_ATTENDING")).toHaveLength(20);
    expect(rsvpStatusLabels.NOT_ATTENDING).toBe("Tidak hadir");
    expect(rsvpFixture.declining).toBe(20);
  });

  it("active_invitation_can_be_unpublished", () => {
    const active = invitationsFixture.find((invitation) => invitation.status === "ACTIVE");
    expect(active).toMatchObject({ status: "ACTIVE", isPublished: false });
    expect(invitationFixture).toMatchObject({ status: "DRAFT", isPublished: false });
  });

  it("maybe_is_not_pending", () => {
    expect(rsvpFixture).toMatchObject({
      total: 120,
      attending: 68,
      declining: 20,
      maybe: 12,
      pending: 20,
      attendanceRatePercent: 57,
    });
    expect(guestsFixture.filter((guest) => guest.rsvpStatus === "MAYBE")).toHaveLength(12);
    expect(guestsFixture.filter((guest) => guest.rsvpStatus === "PENDING")).toHaveLength(20);
    expect(analyticsFixture.rsvp).toEqual(rsvpFixture);
    expect(analyticsFixture.uniqueVisitors).toBeLessThanOrEqual(analyticsFixture.pageViews);
    expect(analyticsFixture.sources.reduce((sum, source) => sum + source.visitors, 0)).toBe(
      analyticsFixture.uniqueVisitors,
    );
  });
});
