import { PGlite } from "@electric-sql/pglite";
import { PrismaClient } from "@/generated/prisma/client";
import { beforeAll, afterAll, it, expect, vi } from "vitest";
import { workspaceTestAdapter } from "../../../tests/database/workspace-test-adapter";
import { applyAuthMigrations } from "../../../tests/database/auth-multimethod-fixture";
vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({ client: null as unknown }));
vi.mock("@/server/db/client", () => ({ getPrisma: () => state.client }));
import { registerWithPassword } from "./registration-service";
import { loginWithPassword, verifySessionToken } from "./auth-service";
import { rotatePasswordSession } from "./auth-repository";
import { listOwnedInvitations } from "../invitations/repository";
const db = new PGlite();
let client: PrismaClient;
beforeAll(async () => {
  await applyAuthMigrations(db);
  client = new PrismaClient({ adapter: workspaceTestAdapter(db) });
  state.client = client;
}, 20000);
afterAll(async () => {
  await client?.$disconnect();
  await db.close();
});
it("phone-only signup creates CLIENT, preserves unverified contact and opaque login session", async () => {
  const result = await registerWithPassword(
    { name: "Nama Uji", identifier: "081234567890", password: "password-uji-aman" },
    [],
  );
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error("failed");
  const user = await client.user.findUniqueOrThrow({ where: { phone: "+6281234567890" } });
  expect(user).toMatchObject({ role: "CLIENT", email: null, phoneVerifiedAt: null });
  const session = await verifySessionToken(result.token);
  expect(session?.userId).toBe(user.id);
  const login = await loginWithPassword(
    { identifier: "+6281234567890", password: "password-uji-aman", next: "/admin" },
    [],
    result.token,
  );
  expect(login.ok).toBe(true);
  if (!login.ok || login.otpRequired) throw new Error("failed");
  expect(login.redirectTo).toBe("/dashboard");
  expect(await verifySessionToken(result.token)).toBeNull();
  expect(await verifySessionToken(login.token)).toMatchObject({ userId: user.id, role: "CLIENT" });
  expect(await listOwnedInvitations(user.id)).toEqual([]);
  await client.userSession.updateMany({
    where: { userId: user.id },
    data: { revokedAt: new Date() },
  });
  expect(await verifySessionToken(login.token)).toBeNull();
});
it("concurrent duplicate signup creates exactly one account and no partial credential", async () => {
  const results = await Promise.all(
    [1, 2].map(() =>
      registerWithPassword(
        { name: "Uji", identifier: "race@example.invalid", password: "password-uji-aman" },
        [],
      ),
    ),
  );
  expect(results.filter((r) => r.ok)).toHaveLength(1);
  expect(await client.user.count({ where: { email: "race@example.invalid" } })).toBe(1);
});
it("password version race prevents stale verification replacing a session", async () => {
  const user = await client.user.findUniqueOrThrow({ where: { email: "race@example.invalid" } });
  const before = await client.userSession.count({ where: { userId: user.id } });
  expect(
    await rotatePasswordSession(
      {
        userId: user.id,
        tokenHash: "unissued",
        expiresAt: new Date(Date.now() + 10000),
        reauthenticatedAt: new Date(),
      },
      "stale-password",
    ),
  ).toBeNull();
  expect(await client.userSession.count({ where: { userId: user.id } })).toBe(before);
});
it("registration rejects privilege fields before inserting", async () => {
  await expect(
    registerWithPassword(
      {
        name: "Uji",
        identifier: "evil@example.invalid",
        password: "password-uji-aman",
        role: "SUPERADMIN",
      } as never,
      [],
    ),
  ).rejects.toThrow();
  expect(await client.user.findUnique({ where: { email: "evil@example.invalid" } })).toBeNull();
});

import { createOwnedDraft } from "../invitations/repository";
it("CLIENT domain ownership is allowed while VENDOR and SUPERADMIN stay isolated", async () => {
  const customer = await client.user.findUniqueOrThrow({ where: { phone: "+6281234567890" } });
  await client.template.create({
    data: {
      id: "menujuakad-seed-preproduction-template",
      slug: "seed-preproduction-internal",
      name: "Internal",
    },
  });
  const input = {
    title: "Draft client",
    weddingDate: null,
    slug: "client-draft",
    templateId: "menujuakad-seed-preproduction-template",
    timezone: "Asia/Jakarta" as const,
  };
  const draft = await createOwnedDraft(customer.id, input);
  expect((await listOwnedInvitations(customer.id)).map((r) => r.id)).toContain(draft.id);
  await client.user.update({ where: { id: customer.id }, data: { role: "VENDOR" } });
  expect(await listOwnedInvitations(customer.id)).toEqual([]);
  await expect(
    createOwnedDraft(customer.id, { ...input, slug: "vendor-draft" }),
  ).rejects.toMatchObject({ status: 403 });
  await client.user.update({ where: { id: customer.id }, data: { role: "SUPERADMIN" } });
  expect(await listOwnedInvitations(customer.id)).toEqual([]);
});
