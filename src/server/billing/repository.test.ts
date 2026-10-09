import { applyAuthMigrations } from "../../../tests/database/auth-multimethod-fixture";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, expect, it, vi } from "vitest";
import { PrismaClient } from "@/generated/prisma/client";
import type { CreateTestInput } from "./validation";
import { workspaceTestAdapter } from "../../../tests/database/workspace-test-adapter";
vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({ client: null as unknown }));
vi.mock("@/server/db/client", () => ({ getPrisma: () => state.client }));
import {
  createOwnedRequest,
  findOwnedRequest,
  listOwnedRequests,
  listOwnedDrafts,
  listAdminRequests,
  reviewRequest,
} from "./repository";
const db = new PGlite();
let client: PrismaClient;
const input = (
  invitationId: string,
  packageSlug: CreateTestInput["packageSlug"] = "TEST_BASIC",
  amountIdr = 1000,
) => ({ invitationId, packageSlug, amountIdr, reference: "deklarasi customer" });
beforeAll(async () => {
  await applyAuthMigrations(db);
  await db.exec(`INSERT INTO "User" ("id","email","role","status","updatedAt") VALUES ('owner','owner@menujuakad.test','CUSTOMER','ACTIVE',now()),('other','other@menujuakad.test','CUSTOMER','ACTIVE',now()),('admin','admin@menujuakad.test','SUPERADMIN','ACTIVE',now()),('suspended','suspended@menujuakad.test','CUSTOMER','SUSPENDED',now());
    INSERT INTO "Template" ("id","name","slug","updatedAt") VALUES ('template','Template TEST','billing-test-template',now());
    INSERT INTO "Invitation" ("id","ownerUserId","templateId","title","slug","status","isPublished","updatedAt") VALUES ('draft','owner','template','Draft Uji','billing-draft','DRAFT',false,now()),('foreign','other','template','Asing','billing-foreign','DRAFT',false,now()),('published','owner','template','Terbit','billing-published','ACTIVE',true,now()),('blocked','suspended','template','Suspend','billing-suspend','DRAFT',false,now());`);
  client = new PrismaClient({ adapter: workspaceTestAdapter(db) });
  state.client = client;
}, 60000);
afterAll(async () => {
  await client?.$disconnect();
  await db.close();
});
it("persists server request and returns safe reread DTO with ownership", async () => {
  const request = await createOwnedRequest("owner", input("draft"));
  expect(request).toMatchObject({
    amountIdr: 1000,
    status: "REQUESTED",
    reference: "deklarasi customer",
    reviewedAt: null,
  });
  expect(await findOwnedRequest("owner", request.id)).toEqual(request);
  expect(await findOwnedRequest("other", request.id)).toBeNull();
  expect(await listOwnedRequests("other")).toEqual([]);
  expect(request).not.toHaveProperty("user");
});
it("foreign, non-draft and suspended invitations cannot create requests", async () => {
  await expect(createOwnedRequest("owner", input("foreign"))).rejects.toMatchObject({
    status: 404,
  });
  await expect(createOwnedRequest("owner", input("published"))).rejects.toMatchObject({
    status: 409,
  });
  await expect(createOwnedRequest("suspended", input("blocked"))).rejects.toMatchObject({
    status: 404,
  });
  expect((await listOwnedDrafts("owner")).map((row) => row.id)).toEqual(["draft"]);
});
it("repeated same pending request is reused and different package conflicts", async () => {
  const a = await createOwnedRequest("owner", input("draft"));
  const b = await createOwnedRequest("owner", {
    ...input("draft"),
    reference: "different declaration",
  });
  expect(a.id).toBe(b.id);
  expect(b.reference).toBe("deklarasi customer");
  await expect(
    createOwnedRequest("owner", input("draft", "TEST_PLUS", 3000)),
  ).rejects.toMatchObject({ status: 409 });
  expect(await client.paymentTestRequest.count({ where: { invitationId: "draft" } })).toBe(1);
});
it("customer cannot review or read admin list at repository boundary", async () => {
  const request = (await listOwnedRequests("owner"))[0];
  await expect(reviewRequest("owner", request.id, "APPROVED_TEST")).rejects.toMatchObject({
    status: 403,
  });
  await expect(listAdminRequests("owner")).rejects.toMatchObject({ status: 403 });
});
it("atomic review records server reviewer/time and never activates entitlement", async () => {
  const request = (await listOwnedRequests("owner"))[0];
  const reviewed = await reviewRequest("admin", request.id, "APPROVED_TEST");
  expect(reviewed.status).toBe("APPROVED_TEST");
  expect(reviewed.reviewedAt).not.toBeNull();
  expect(reviewed.reviewedByUserId).toBe("admin");
  await expect(reviewRequest("admin", request.id, "REJECTED")).rejects.toMatchObject({
    status: 409,
  });
  expect(
    await client.invitation.findUnique({
      where: { id: "draft" },
      select: { status: true, isPublished: true, publishedAt: true },
    }),
  ).toEqual({ status: "DRAFT", isPublished: false, publishedAt: null });
});
it("retry after approval creates new row preserving history; conflicting parallel review has one winner", async () => {
  const prior = (await listOwnedRequests("owner"))[0];
  const retry = await createOwnedRequest("owner", input("draft"));
  expect(retry.id).not.toBe(prior.id);
  const results = await Promise.allSettled([
    reviewRequest("admin", retry.id, "REJECTED"),
    reviewRequest("admin", retry.id, "APPROVED_TEST"),
  ]);
  expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
  const failed = results.find((result) => result.status === "rejected");
  expect(failed).toMatchObject({ status: "rejected", reason: { status: 409 } });
  expect(await client.paymentTestRequest.count({ where: { invitationId: "draft" } })).toBe(2);
  expect((await findOwnedRequest("owner", prior.id))?.status).toBe("APPROVED_TEST");
});
it("parallel double submit yields one pending row", async () => {
  const requests = await Promise.all([
    createOwnedRequest("owner", input("draft")),
    createOwnedRequest("owner", input("draft")),
  ]);
  expect(requests[0].id).toBe(requests[1].id);
  expect(
    await client.paymentTestRequest.count({ where: { userId: "owner", status: "REQUESTED" } }),
  ).toBe(1);
});
it("positive integer IDR is defended by repository and database", async () => {
  for (const amountIdr of [0, -1, 1.5])
    await expect(
      createOwnedRequest("owner", input("draft", "TEST_BASIC", amountIdr)),
    ).rejects.toMatchObject({ status: 400 });
  await expect(
    db.query('UPDATE "PaymentTestRequest" SET "amountIdr"=0 WHERE "invitationId"=$1', ["draft"]),
  ).rejects.toMatchObject({ code: "23514" });
});
it("persistent hourly request budget cannot be bypassed by new invitation", async () => {
  await db.exec(`INSERT INTO "PaymentTestRequest" ("id","invitationId","userId","amountIdr","packageSlug","status","createdAt","updatedAt") SELECT 'rate-'||g,'draft','owner',1000,'TEST_BASIC','REJECTED',now(),now() FROM generate_series(1,20) g;
    INSERT INTO "Invitation" ("id","ownerUserId","templateId","title","slug","updatedAt") VALUES ('rate-draft','owner','template','Rate','billing-rate-draft',now());`);
  await expect(createOwnedRequest("owner", input("rate-draft"))).rejects.toMatchObject({
    status: 429,
  });
});
it("10 pending requests limit remains persistent across different drafts", async () => {
  await db.exec(`INSERT INTO "User" ("id","email","role","updatedAt") VALUES ('budget','budget@menujuakad.test','CUSTOMER',now());
    INSERT INTO "Invitation" ("id","ownerUserId","templateId","title","slug","updatedAt") SELECT 'budget-draft-'||g,'budget','template','Budget','budget-slug-'||g,now() FROM generate_series(1,11) g;
    INSERT INTO "PaymentTestRequest" ("id","invitationId","userId","amountIdr","packageSlug","status","createdAt","updatedAt") SELECT 'budget-test-'||g,'budget-draft-'||g,'budget',1000,'TEST_BASIC','REQUESTED',now(),now() FROM generate_series(1,10) g;`);
  await expect(createOwnedRequest("budget", input("budget-draft-11"))).rejects.toMatchObject({
    status: 429,
  });
  expect((await createOwnedRequest("budget", input("budget-draft-1"))).id).toBe("budget-test-1");
});
it("admin downgrade/suspension blocks reads and review at database boundary", async () => {
  await client.user.update({ where: { id: "admin" }, data: { status: "SUSPENDED" } });
  await expect(listAdminRequests("admin")).rejects.toMatchObject({ status: 403 });
  const pending = await client.paymentTestRequest.findFirst({ where: { status: "REQUESTED" } });
  await expect(reviewRequest("admin", pending!.id, "APPROVED_TEST")).rejects.toMatchObject({
    status: 403,
  });
  expect((await client.paymentTestRequest.findUnique({ where: { id: pending!.id } }))?.status).toBe(
    "REQUESTED",
  );
});
