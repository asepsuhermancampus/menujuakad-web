import { PGlite } from "@electric-sql/pglite";
import { beforeAll, afterAll, expect, it, vi } from "vitest";
import { PrismaClient } from "@/generated/prisma/client";
import { workspaceTestAdapter } from "./workspace-test-adapter";
import { applyAuthMigrations } from "./auth-multimethod-fixture";
vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({ client: null as unknown }));
vi.mock("@/server/db/client", () => ({ getPrisma: () => state.client }));
import {
  createOwnedDraft,
  findOwnedInvitation,
  listOwnedInvitations,
  updateOwnedDraft,
  deleteOwnedDraft,
} from "@/server/invitations/repository";
import { readTestUsers, readTestInvitations } from "@/server/admin/repository";
const db = new PGlite();
let client: PrismaClient;
const template = "menujuakad-seed-preproduction-template";
beforeAll(async () => {
  await applyAuthMigrations(db);
  await db.exec(`INSERT INTO "User" ("id","email","role","updatedAt") VALUES ('customer1','customer01@menujuakad.test','CLIENT',now()),('customer2','customer02@menujuakad.test','CLIENT',now()),('admin','admin@menujuakad.test','SUPERADMIN',now()),('outside','real@example.test','CLIENT',now());
    INSERT INTO "Template" ("id","name","slug","updatedAt") VALUES ('${template}','TEST Internal','seed-preproduction-internal',now());`);
  client = new PrismaClient({ adapter: workspaceTestAdapter(db) });
  state.client = client;
}, 15000);
afterAll(async () => {
  await client?.$disconnect();
  await db.close();
});
const input = (slug: string) => ({
  title: "Undangan Uji",
  slug,
  templateId: template,
  weddingDate: "2027-01-02",
  timezone: "Asia/Jakarta" as const,
});
it("real Prisma CRUD persists typed sections and settings after reread", async () => {
  const created = await createOwnedDraft("customer1", input("persistensi-draft"));
  expect(created.status).toBe("DRAFT");
  expect(created.isPublished).toBe(false);
  await updateOwnedDraft("customer1", created.id, {
    title: "Judul Baru",
    slug: "alamat-baru",
    weddingDate: "2027-02-02",
    timezone: "Asia/Makassar",
    couple: {
      groomFullName: "Pria Uji",
      groomNickname: "Pria",
      groomParents: "Orang Tua",
      groomBio: "Profil",
      brideFullName: "Wanita Uji",
      brideNickname: "Wanita",
      brideParents: "Orang Tua",
      brideBio: "Profil",
    },
    sections: {
      cover: { heading: "Cover Uji", message: "Pesan" },
      event: { name: "Akad", date: "2027-02-02", time: "10:00", venue: "Aula", address: "Alamat" },
      story: { text: "Kisah tersimpan" },
      rsvp: { enabled: true, deadline: "2027-02-01" },
    },
  });
  const reread = await findOwnedInvitation("customer1", created.id);
  expect(reread).toMatchObject({
    title: "Judul Baru",
    slug: "alamat-baru",
    timezone: "Asia/Makassar",
    weddingDate: "2027-02-02",
    couple: { groomFullName: "Pria Uji" },
    sections: {
      cover: { heading: "Cover Uji" },
      story: { text: "Kisah tersimpan" },
      rsvp: { enabled: true },
    },
  });
  await updateOwnedDraft("customer1", created.id, {
    sections: { story: { text: "Kisah revisi" } },
  });
  expect((await findOwnedInvitation("customer1", created.id))?.sections.cover?.heading).toBe(
    "Cover Uji",
  );
  expect(
    (await db.query('SELECT * FROM "InvitationSection" WHERE "invitationId"=$1', [created.id]))
      .rows,
  ).toHaveLength(4);
  await deleteOwnedDraft("customer1", created.id);
  expect(await findOwnedInvitation("customer1", created.id)).toBeNull();
  expect(
    (await db.query('SELECT * FROM "CoupleProfile" WHERE "invitationId"=$1', [created.id])).rows,
  ).toHaveLength(0);
  expect(
    (await db.query('SELECT * FROM "InvitationSection" WHERE "invitationId"=$1', [created.id]))
      .rows,
  ).toHaveLength(0);
});
it("foreign owner cannot read edit or delete guessed invitation ID", async () => {
  const draft = await createOwnedDraft("customer1", input("owner-protected"));
  expect(await findOwnedInvitation("customer2", draft.id)).toBeNull();
  await expect(
    updateOwnedDraft("customer2", draft.id, { title: "Intruder" }),
  ).rejects.toMatchObject({ status: 404 });
  await expect(deleteOwnedDraft("customer2", draft.id)).rejects.toMatchObject({ status: 404 });
  expect((await findOwnedInvitation("customer1", draft.id))?.title).toBe("Undangan Uji");
  expect(await listOwnedInvitations("customer2")).toHaveLength(0);
});
it.each(["ACTIVE", "PENDING_PAYMENT", "ARCHIVED", "SUSPENDED"])(
  "rejects edits/deletion for status %s",
  async (status) => {
    const draft = await createOwnedDraft(
      "customer1",
      input(`status-${status.toLowerCase().replace("_", "-")}`),
    );
    await db.query('UPDATE "Invitation" SET "status"=$1::"InvitationStatus" WHERE "id"=$2', [
      status,
      draft.id,
    ]);
    await expect(
      updateOwnedDraft("customer1", draft.id, { title: "Invalid update" }),
    ).rejects.toMatchObject({ status: 409 });
    await expect(deleteOwnedDraft("customer1", draft.id)).rejects.toMatchObject({ status: 409 });
  },
);
it("rejects published DRAFT and suspended ownership even with stale user ID", async () => {
  const draft = await createOwnedDraft("customer2", input("draft-publication"));
  await db.query('UPDATE "Invitation" SET "isPublished"=true WHERE "id"=$1', [draft.id]);
  await expect(deleteOwnedDraft("customer2", draft.id)).rejects.toMatchObject({ status: 409 });
  await db.exec(`UPDATE "User" SET "status"='SUSPENDED' WHERE "id"='customer2'`);
  expect(await listOwnedInvitations("customer2")).toHaveLength(0);
  await expect(createOwnedDraft("customer2", input("blocked-user"))).rejects.toMatchObject({
    status: 403,
  });
  await db.exec(`UPDATE "User" SET "status"='ACTIVE' WHERE "id"='customer2'`);
});
it("unique slug collision rolls back update and does not wipe existing sections", async () => {
  const draft = await createOwnedDraft("customer1", input("collision-slug"));
  const other = await createOwnedDraft("customer1", input("safe-existing"));
  await updateOwnedDraft("customer1", other.id, { sections: { story: { text: "Keep me" } } });
  await expect(
    updateOwnedDraft("customer1", other.id, {
      slug: draft.slug,
      sections: { story: { text: "Replace me" } },
    }),
  ).rejects.toMatchObject({ code: "P2002" });
  expect((await findOwnedInvitation("customer1", other.id))?.sections.story?.text).toBe("Keep me");
});
it("only internal DRAFT template is allowed and admin cannot create customer draft", async () => {
  await expect(
    createOwnedDraft("customer1", { ...input("bad-template"), templateId: "unknown" }),
  ).rejects.toMatchObject({ status: 400 });
  await expect(createOwnedDraft("admin", input("bad-admin-create"))).rejects.toMatchObject({
    status: 403,
  });
});
it("failed section write rolls back metadata and earlier section changes atomically", async () => {
  const draft = await createOwnedDraft("customer1", input("atomic-draft"));
  await updateOwnedDraft("customer1", draft.id, {
    sections: {
      cover: { heading: "Original", message: "Before" },
      story: { text: "Original story" },
    },
  });
  await db.exec(`CREATE FUNCTION reject_workspace_story() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW."configJson"->>'text'='REJECT' THEN RAISE EXCEPTION 'test section failure'; END IF; RETURN NEW; END $$;
    CREATE TRIGGER workspace_story_failure BEFORE INSERT ON "InvitationSection" FOR EACH ROW EXECUTE FUNCTION reject_workspace_story();`);
  try {
    await expect(
      updateOwnedDraft("customer1", draft.id, {
        title: "Must rollback",
        sections: { cover: { heading: "Changed", message: "After" }, story: { text: "REJECT" } },
      }),
    ).rejects.toThrow();
    expect(await findOwnedInvitation("customer1", draft.id)).toMatchObject({
      title: "Undangan Uji",
      sections: { cover: { heading: "Original" }, story: { text: "Original story" } },
    });
  } finally {
    await db.exec(
      'DROP TRIGGER workspace_story_failure ON "InvitationSection"; DROP FUNCTION reject_workspace_story();',
    );
  }
});
it("preserves payment-test history by rejecting draft deletion", async () => {
  const draft = await createOwnedDraft("customer1", input("keep-payment-history"));
  await db.query(
    `INSERT INTO "PaymentTestRequest" ("id","invitationId","userId","amountIdr","packageSlug","updatedAt") VALUES ('test-history',$1,'customer1',1000,'test',now())`,
    [draft.id],
  );
  await expect(deleteOwnedDraft("customer1", draft.id)).rejects.toMatchObject({ status: 409 });
  expect(await findOwnedInvitation("customer1", draft.id)).not.toBeNull();
  expect(
    (await db.query('SELECT "id" FROM "PaymentTestRequest" WHERE "id"=$1', ["test-history"])).rows,
  ).toHaveLength(1);
});
it("admin DTO only contains safe whitelisted accounts and denies customer", async () => {
  await expect(readTestUsers("customer1", 1)).rejects.toMatchObject({ status: 403 });
  const users = await readTestUsers("admin", 1);
  expect(users).toHaveLength(3);
  expect(users.map((u) => u.email)).not.toContain("real@example.test");
  expect(users.every((u) => !("credential" in u) && !("sessions" in u))).toBe(true);
  const invitations = await readTestInvitations("admin", 1);
  expect(invitations.every((i) => i.owner.email.endsWith("@menujuakad.test"))).toBe(true);
  await db.exec(`UPDATE "User" SET "status"='SUSPENDED' WHERE "id"='admin'`);
  await expect(readTestInvitations("admin", 1)).rejects.toMatchObject({ status: 403 });
});
