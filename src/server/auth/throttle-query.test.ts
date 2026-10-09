import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { throttleReservation } from "./throttle-query";
const database = new PGlite();
beforeAll(async () => {
  await database.exec(
    'CREATE TABLE "AuthLoginThrottle" ("keyHash" TEXT PRIMARY KEY, "failedAttempts" INTEGER NOT NULL, "windowStartsAt" TIMESTAMPTZ NOT NULL, "blockedUntil" TIMESTAMPTZ)',
  );
});
afterAll(async () => {
  await database.close();
});
async function reserve(keyHash: string, limit = 5) {
  const query = throttleReservation({ keyHash, limit });
  const result = await database.query<{ blocked: boolean }>(query.text, query.values);
  return !result.rows[0].blocked;
}
describe("persistent throttle PostgreSQL", () => {
  it("atomically allows five email attempts and blocks the sixth", async () => {
    const results = await Promise.all(Array.from({ length: 8 }, () => reserve("email")));
    expect(results.filter(Boolean)).toHaveLength(5);
    const row = await database.query<{ failedAttempts: number }>(
      'SELECT "failedAttempts" FROM "AuthLoginThrottle" WHERE "keyHash"=$1',
      ["email"],
    );
    expect(row.rows[0].failedAttempts).toBe(8);
  });
  it("starts a fresh budget after expired window and block", async () => {
    await database.exec(
      `UPDATE "AuthLoginThrottle" SET "windowStartsAt" = CURRENT_TIMESTAMP - INTERVAL '31 minutes', "blockedUntil" = CURRENT_TIMESTAMP - INTERVAL '1 minute' WHERE "keyHash"='email'`,
    );
    expect(await reserve("email")).toBe(true);
  });
  it("supports repeated successful logins by releasing email only", async () => {
    for (let i = 0; i < 10; i++) {
      expect(await reserve("success-email")).toBe(true);
      expect(await reserve("success-ip", 100)).toBe(true);
      await database.query(
        'UPDATE "AuthLoginThrottle" SET "failedAttempts"="failedAttempts"-1 WHERE "keyHash"=$1 AND "failedAttempts">0',
        ["success-email"],
      );
    }
    const rows = await database.query<{ keyHash: string; failedAttempts: number }>(
      'SELECT "keyHash", "failedAttempts" FROM "AuthLoginThrottle" WHERE "keyHash" LIKE $1 ORDER BY "keyHash"',
      ["success-%"],
    );
    expect(rows.rows).toEqual([
      { keyHash: "success-email", failedAttempts: 0 },
      { keyHash: "success-ip", failedAttempts: 10 },
    ]);
  });
});

it("global IP blocks credential spraying across independent emails", async () => {
  const attempts = await Promise.all(Array.from({ length: 101 }, () => reserve("spray-ip", 100)));
  expect(attempts.filter(Boolean)).toHaveLength(100);
});
