import "server-only";
import { setTimeout as wait } from "node:timers/promises";
export const PUBLIC_DELIVERY_FLOOR_MS = 11000;
export type PublicDeliveryTiming = {
  now: () => number;
  wait: (milliseconds: number) => Promise<void>;
};
const runtimeTiming: PublicDeliveryTiming = {
  now: () => performance.now(),
  wait: async (ms) => {
    await wait(ms);
  },
};
/** Equal minimum duration covers the provider's 10s timeout plus a 1s scheduling margin. */
export async function publicDeliveryOutcome<T>(
  operation: () => Promise<T>,
  timing: PublicDeliveryTiming = runtimeTiming,
): Promise<T> {
  const started = timing.now();
  try {
    return await operation();
  } finally {
    const remaining = PUBLIC_DELIVERY_FLOOR_MS - (timing.now() - started);
    if (remaining > 0) await timing.wait(remaining);
  }
}
