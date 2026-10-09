import { it, expect, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { publicDeliveryOutcome, PUBLIC_DELIVERY_FLOOR_MS } from "./public-delivery-timing";
it("eligible provider acceptance and synthetic outcomes share the same duration floor", async () => {
  for (const providerElapsed of [0, 75, 9900, 10000]) {
    let elapsed = 0;
    const wait = vi.fn(async (ms: number) => {
      elapsed += ms;
    });
    const result = await publicDeliveryOutcome(
      async () => {
        elapsed += providerElapsed;
        return "generic";
      },
      { now: () => elapsed, wait },
    );
    expect(result).toBe("generic");
    expect(elapsed).toBe(PUBLIC_DELIVERY_FLOOR_MS);
    expect(wait).toHaveBeenCalledWith(PUBLIC_DELIVERY_FLOOR_MS - providerElapsed);
  }
});
it("error outcomes also wait and preserve the original error", async () => {
  let elapsed = 0;
  await expect(
    publicDeliveryOutcome(
      async () => {
        elapsed += 10000;
        throw Error("redacted");
      },
      {
        now: () => elapsed,
        wait: async (ms) => {
          elapsed += ms;
        },
      },
    ),
  ).rejects.toThrow("redacted");
  expect(elapsed).toBe(PUBLIC_DELIVERY_FLOOR_MS);
});
