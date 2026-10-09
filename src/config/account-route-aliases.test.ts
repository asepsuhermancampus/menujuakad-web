import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

const aliases = [
  ["/dashboard/settings", "/account"],
  ["/dashboard/settings/profile", "/account"],
  ["/dashboard/settings/security", "/account/security"],
  ["/dashboard/account", "/account"],
] as const;

describe("alias akun lama sebelum layout customer", () => {
  it.each(aliases)("mengalihkan %s ke %s tanpa syarat role/cookie", async (source, destination) => {
    const redirects = await nextConfig.redirects?.();
    expect(redirects?.find((redirect) => redirect.source === source)).toEqual({
      source,
      destination,
      permanent: false,
    });
  });

  it("membatasi pengalihan ke empat path exact tanpa mencakup workspace atau canonical", async () => {
    const redirects = await nextConfig.redirects?.();
    expect(redirects?.map((redirect) => redirect.source).sort()).toEqual(
      aliases.map(([source]) => source).sort(),
    );
  });
});
