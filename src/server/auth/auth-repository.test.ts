import { PGlite } from "@electric-sql/pglite";
import { beforeAll, afterAll, expect, it, vi } from "vitest";
import type { Prisma } from "@/generated/prisma/client";
vi.mock("server-only", () => ({}));
const store = vi.hoisted(() => ({ client: null as unknown }));
vi.mock("@/server/db/client", () => ({ getPrisma: () => store.client }));
import { reserveLoginAttempt } from "./auth-repository";
const database = new PGlite();
beforeAll(async () => {
  await database.exec(
    'CREATE TABLE "AuthLoginThrottle" ("keyHash" TEXT PRIMARY KEY, "failedAttempts" INTEGER NOT NULL, "windowStartsAt" TIMESTAMPTZ NOT NULL, "blockedUntil" TIMESTAMPTZ)',
  );
  store.client = {
    $transaction: (operation: (tx: unknown) => Promise<unknown>) =>
      database.transaction((tx) =>
        operation({
          $queryRaw: async (sql: Prisma.Sql) => (await tx.query(sql.text, sql.values)).rows,
        }),
      ),
  };
});
afterAll(async () => database.close());
it("blocked global IP cannot create throttle rows for random new emails", async () => {
  await database.query(
    "INSERT INTO \"AuthLoginThrottle\" VALUES ($1,100,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP+INTERVAL '15 minutes')",
    ["blocked-ip"],
  );
  for (let index = 0; index < 20; index++)
    expect(
      await reserveLoginAttempt([
        { keyHash: `random-email-${index}`, limit: 5 },
        { keyHash: "blocked-ip", limit: 100 },
      ]),
    ).toBe(false);
  expect((await database.query('SELECT * FROM "AuthLoginThrottle"')).rows).toHaveLength(1);
});
it("IP-first reservation still applies account budget across separate IPs", async () => {
  const results = await Promise.all(
    Array.from({ length: 8 }, (_, index) =>
      reserveLoginAttempt([
        { keyHash: "same-email", limit: 5 },
        { keyHash: `separate-ip-${index}`, limit: 100 },
      ]),
    ),
  );
  expect(results.filter(Boolean)).toHaveLength(5);
});
