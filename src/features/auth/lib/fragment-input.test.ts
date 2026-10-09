import { describe, expect, it, vi } from "vitest";
import { takeTokenFragment } from "../hooks/use-token-fragment";
import { identifierError, cleanIdentifierInput } from "./identifier-input";
describe("proof sementara dan identifier", () => {
  it("format nomor ramah pengguna dibersihkan sebelum dikirim ke parser server", () => {
    expect(cleanIdentifierInput(" +1 (202) 555-0100 ")).toBe("+12025550100");
    expect(cleanIdentifierInput(" 0812-3456-7890 ")).toBe("081234567890");
    expect(cleanIdentifierInput(" Nama+undangan@example.com ")).toBe("Nama+undangan@example.com");
  });
  it("fragment dibaca dan token dihapus dari fragment serta query sebelum POST", () => {
    const history = { state: null, replaceState: vi.fn() };
    const token = "0123456789_abcdefghijklm";
    expect(
      takeTokenFragment(
        { hash: `#token=${token}`, pathname: "/reset-password", search: "?token=legacy&safe=yes" },
        history,
      ),
    ).toBe(token);
    expect(history.replaceState).toHaveBeenCalledWith(null, "", "/reset-password?safe=yes");
  });
  it("menolak token query dan fragment malformed", () => {
    const history = { state: null, replaceState: vi.fn() };
    expect(
      takeTokenFragment(
        { hash: "", pathname: "/reset-password", search: "?token=legacy" },
        history,
      ),
    ).toBe("");
    expect(
      takeTokenFragment(
        { hash: "#token=bad%3Cscript%3E", pathname: "/verify-email", search: "" },
        history,
      ),
    ).toBe("");
  });
  it.each(["name@example.com", "081234567890", "+6281234567890", "+1 202-555-0100"])(
    "menerima email atau telepon %s",
    (value) => expect(identifierError(value)).toBeNull(),
  );
  it.each(["bad@", "", "abc", "role=SUPERADMIN", "0", "12345678", "07123456789", "+1234567"])(
    "menghasilkan galat inline untuk %s",
    (value) => expect(identifierError(value)).toBeTruthy(),
  );
});
