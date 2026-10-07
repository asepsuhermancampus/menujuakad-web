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
    expect(previewScreens).toHaveLength(53);
    expect(new Set(previewScreens.map((screen) => screen.code)).size).toBe(53);
    expect(screenRecords).toHaveLength(64);
    expect(new Set(screenRecords.map((screen) => screen.id)).size).toBe(64);
    expect(previewScreens.flatMap((screen) => screen.variants)).toHaveLength(64);
    expect(getPreviewScreen("pub-01")?.logicalRoute).toBe("/");
    expect(getPreviewScreen("PUB-05")?.logicalRoute).toBe("/pricing");
    expect(getPreviewScreen("ADM-01")?.audience).toBe("admin");
    expect(getPreviewScreen("DS-01")?.audience).toBe("reference");
    expect(getPreviewScreen("INV-01")?.state).toBe("Default (data contoh Sarah & Dimas)");
    for (const code of [
      "__proto__",
      "constructor",
      "toString",
      "../ADM-01",
      "%41DM-01",
      "ADM-01?role=SUPERADMIN",
      " CUS-01",
      "CUS-05",
      "CUS-06",
      "PUB-99",
    ]) {
      expect(getPreviewScreen(code)).toBeUndefined();
    }
  });

  it("mempertahankan perangkat/state sumber tanpa mengklaim screenshot yang hilang", () => {
    expect(
      screenRecords
        .filter((record) => record.sourceStatus === "metadata-only")
        .map((record) => record.code)
        .sort(),
    ).toEqual(["CUS-01", "CUS-02"]);
    expect(screenRecords.filter((record) => record.sourceStatus === "screenshot")).toHaveLength(62);
    expect(getPreviewScreen("CUS-01")?.sourceStatus).toBe("screenshot");
    expect(getPreviewScreen("CUS-02")?.sourceStatus).toBe("metadata-only");
    expect(getPreviewScreen("CUS-08")?.state).toBe("Default");
    expect(getPreviewScreen("CUS-08")?.variants.map((variant) => variant.state)).toEqual([
      "Expired",
      "Default",
    ]);
    expect(getPreviewScreen("EDT-06")?.variants.map((variant) => variant.state)).toContain(
      "Error & Kuota",
    );
    expect(getPreviewScreen("PUB-01")?.variants.map((variant) => variant.device)).toEqual([
      "DESKTOP",
      "MOBILE",
      "TABLET",
    ]);
    expect(getPreviewVariant("3f8be25ae0eb4ba9b5190d593d7a967a")?.sourceStatus).toBe(
      "metadata-only",
    );
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
