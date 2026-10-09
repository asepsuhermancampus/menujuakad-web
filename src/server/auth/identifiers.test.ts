import { expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { normalizeIdentifier, newPasswordSchema } from "./identifiers";
it.each([
  [" USER@EXAMPLE.INVALID ", "email", "user@example.invalid"],
  ["081234567890", "phone", "+6281234567890"],
  ["6281234567890", "phone", "+6281234567890"],
  ["+14155552671", "phone", "+14155552671"],
])("normalizes %s without inventing email", (raw, kind, value) =>
  expect(normalizeIdentifier(raw)).toEqual({ kind, value }),
);
it.each(["0812abc", "123456", "+01234567890", "a@@b.test", "+62812 34", ""])(
  "rejects ambiguous identifier %s",
  (raw) => expect(() => normalizeIdentifier(raw)).toThrow(),
);
it("enforces new password length without trimming", () => {
  expect(newPasswordSchema.safeParse("12345678901").success).toBe(false);
  expect(newPasswordSchema.parse(" 12345678901 ")).toBe(" 12345678901 ");
});
