import { expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { createInvitationSchema, updateInvitationSchema } from "./input";
const valid = {
  title: "Undangan Uji",
  slug: "undangan-uji",
  weddingDate: "2027-01-02",
  timezone: "Asia/Jakarta",
  templateId: "internal-template",
};
it("accepts date and internal template selection", () =>
  expect(createInvitationSchema.safeParse(valid).success).toBe(true));
it.each(["ownerUserId", "status", "isPublished", "role"])("rejects mass assignment %s", (field) =>
  expect(createInvitationSchema.safeParse({ ...valid, [field]: "ACTIVE" }).success).toBe(false),
);
it.each(["2027-02-30", "2027-13-01", "invalid"])(
  "rejects impossible wedding date %s",
  (weddingDate) =>
    expect(createInvitationSchema.safeParse({ ...valid, weddingDate }).success).toBe(false),
);
it("rejects unsupported timezone and reserved slug", () => {
  expect(createInvitationSchema.safeParse({ ...valid, timezone: "Moon/Base" }).success).toBe(false);
  expect(createInvitationSchema.safeParse({ ...valid, slug: "admin" }).success).toBe(false);
});
it("rejects arbitrary sections and excessive text", () => {
  expect(
    updateInvitationSchema.safeParse({ sections: { GIFT: { url: "javascript:alert(1)" } } })
      .success,
  ).toBe(false);
  expect(
    updateInvitationSchema.safeParse({
      sections: { cover: { heading: "x".repeat(161), message: "" } },
    }).success,
  ).toBe(false);
});
it("validates typed plaintext sections", () =>
  expect(
    updateInvitationSchema.safeParse({
      sections: {
        cover: { heading: "Selamat datang", message: "Kami mengundang Anda" },
        event: {
          name: "Akad",
          date: "2027-01-02",
          time: "09:00",
          venue: "Aula",
          address: "Jakarta",
        },
        story: { text: "Kisah kami" },
        rsvp: { enabled: true, deadline: "2027-01-01" },
      },
    }).success,
  ).toBe(true));
it("does not accept empty patches or invalid time", () => {
  expect(updateInvitationSchema.safeParse({}).success).toBe(false);
  expect(
    updateInvitationSchema.safeParse({
      sections: {
        event: { name: "Akad", date: "2027-01-02", time: "25:00", venue: "Aula", address: "" },
      },
    }).success,
  ).toBe(false);
});
