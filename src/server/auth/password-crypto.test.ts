import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password-crypto";
describe("scrypt credential", () => {
  it("uses independent salts, verifies only matching passwords", async () => {
    const a = await hashPassword("Rahasia-uji-2026!");
    const b = await hashPassword("Rahasia-uji-2026!");
    expect(a).toMatch(/^scrypt\$32768\$8\$1\$[\w-]{22}\$[\w-]{86}$/);
    expect(a).not.toBe(b);
    expect(await verifyPassword("Rahasia-uji-2026!", a)).toBe(true);
    expect(await verifyPassword("wrong", a)).toBe(false);
  });
  it.each(["", "scrypt$2$8$1$abc$def", "scrypt$32768$8$1$abc$def", "bcrypt$garbage"])(
    "rejects corrupt/unsafe hash %s",
    async (hash) => {
      expect(await verifyPassword("password", hash)).toBe(false);
    },
  );
});
