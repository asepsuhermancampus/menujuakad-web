import { applyAuthMigrations } from "../../../tests/database/auth-multimethod-fixture";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, expect, it, vi } from "vitest";
import { PrismaClient } from "@/generated/prisma/client";
import { workspaceTestAdapter } from "../../../tests/database/workspace-test-adapter";
vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({ client: null as unknown }));
vi.mock("@/server/db/client", () => ({ getPrisma: () => state.client }));
import { readOwnedAnalytics } from "./repository";
import { analyticsWindow, summarizeAnalytics } from "./service";
const db = new PGlite();
let client: PrismaClient;
const now = new Date("2026-10-08T12:00:00.000Z");
beforeAll(async () => {
  await applyAuthMigrations(db);
  await db.exec(`INSERT INTO "User" ("id","email","role","status","updatedAt") VALUES ('a','a@test.invalid','CUSTOMER','ACTIVE',now()),('b','b@test.invalid','CUSTOMER','ACTIVE',now()),('admin','admin@test.invalid','SUPERADMIN','ACTIVE',now()),('suspended','s@test.invalid','CUSTOMER','SUSPENDED',now());
  INSERT INTO "Template" ("id","name","slug","updatedAt") VALUES ('t','TEST','test',now());`);
  for (const [id, owner, status, createdAt] of [
    ["lower", "a", "DRAFT", "2026-10-01T12:00:00.000Z"],
    ["upper", "a", "ARCHIVED", now.toISOString()],
    ["before", "a", "DRAFT", "2026-10-01T11:59:59.999Z"],
    ["future", "a", "DRAFT", "2026-10-08T12:00:00.001Z"],
    ["foreign", "b", "DRAFT", now.toISOString()],
    ["admin-owned", "admin", "DRAFT", now.toISOString()],
    ["suspended-owned", "suspended", "DRAFT", now.toISOString()],
  ])
    await db.query(
      `INSERT INTO "Invitation" ("id","ownerUserId","templateId","slug","title","status","createdAt","updatedAt") VALUES ($1::text,$2,'t',$1::text,'TEST',$3::"InvitationStatus",$4,now())`,
      [id, owner, status, createdAt],
    );
  for (const [id, invitationId, userId, status, amountIdr, createdAt] of [
    ["r1", "lower", "a", "REQUESTED", 1000, "2026-10-01T12:00:00.000Z"],
    ["r2", "upper", "a", "APPROVED_TEST", 2147483647, now.toISOString()],
    ["r3", "upper", "a", "APPROVED_TEST", 2147483647, now.toISOString()],
    ["r4", "upper", "a", "REJECTED", 2000, now.toISOString()],
    ["old", "lower", "a", "REQUESTED", 3000, "2026-10-01T11:59:59.999Z"],
    ["future-r", "lower", "a", "REQUESTED", 4000, "2026-10-08T12:00:00.001Z"],
    ["foreign-r", "foreign", "b", "REQUESTED", 5000, now.toISOString()],
    ["bad-owner", "foreign", "a", "REQUESTED", 6000, now.toISOString()],
    ["bad-requester", "lower", "b", "REQUESTED", 7000, now.toISOString()],
  ])
    await db.query(
      `INSERT INTO "PaymentTestRequest" ("id","invitationId","userId","status","amountIdr","packageSlug","createdAt","updatedAt") VALUES ($1,$2,$3,$4::"PaymentTestStatus",$5,'test',$6,now())`,
      [id, invitationId, userId, status, amountIdr, createdAt],
    );
  client = new PrismaClient({ adapter: workspaceTestAdapter(db) });
  state.client = client;
}, 15000);
afterAll(async () => {
  await client?.$disconnect();
  await db.close();
});
it("real SQL excludes foreign rows/mismatched owner and includes both UTC boundaries", async () => {
  const window = analyticsWindow("7d", now);
  const dto = summarizeAnalytics(window, await readOwnedAnalytics("a", window));
  expect(dto.invitations).toEqual({ total: 2, draft: 1, other: 1 });
  expect(dto.paymentTests).toEqual({
    total: 4,
    amountIdr: 4294970294,
    byStatus: {
      REQUESTED: { count: 1, amountIdr: 1000 },
      APPROVED_TEST: { count: 2, amountIdr: 4294967294 },
      REJECTED: { count: 1, amountIdr: 2000 },
    },
  });
});
it("all includes older records but excludes future rows and all foreign data", async () => {
  const window = analyticsWindow("all", now);
  const dto = summarizeAnalytics(window, await readOwnedAnalytics("a", window));
  expect(dto.invitations.total).toBe(3);
  expect(dto.paymentTests.total).toBe(5);
  expect(dto.paymentTests.amountIdr).toBe(4294973294);
  const foreign = summarizeAnalytics(window, await readOwnedAnalytics("b", window));
  expect(foreign.invitations.total).toBe(1);
  expect(foreign.paymentTests.amountIdr).toBe(5000);
});
it.each(["admin", "suspended", "missing"])(
  "repository denies ineligible identity %s even with stale/direct userId",
  async (id) => {
    await expect(readOwnedAnalytics(id, analyticsWindow("all", now))).rejects.toMatchObject({
      status: 403,
    });
  },
);
it("30d uses exact rolling UTC days and includes empty owned dataset", async () => {
  expect(analyticsWindow("30d", now).from?.toISOString()).toBe("2026-09-08T12:00:00.000Z");
  await db.exec(
    `INSERT INTO "User" ("id","email","updatedAt") VALUES ('empty','empty@test.invalid',now())`,
  );
  const window = analyticsWindow("30d", now);
  expect(
    summarizeAnalytics(window, await readOwnedAnalytics("empty", window)).invitations.total,
  ).toBe(0);
});
