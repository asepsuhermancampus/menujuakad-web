// Verifikasi role runtime (pooled DATABASE_URL) dapat menjalankan alur auth:
// registrasi user CLIENT, kredensial, sesi, dan throttle — lalu bersihkan.
// Membuktikan grant cukup tanpa membuka hak berlebih.
import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../../src/generated/prisma/client";

const runtimeUrl = process.env.DATABASE_URL;
const ownerUrl = process.env.DIRECT_URL;
if (!runtimeUrl || !ownerUrl) throw new Error("DATABASE_URL dan DIRECT_URL wajib di-set.");
if (runtimeUrl === ownerUrl) throw new Error("Uji ini harus memakai role runtime terpisah.");

const runtime = new PrismaClient({ adapter: new PrismaNeon({ connectionString: runtimeUrl }) });
const owner = new PrismaClient({ adapter: new PrismaNeon({ connectionString: ownerUrl }) });
const results: Record<string, string> = {};
const testEmail = `runtime-probe-${Date.now()}@menujuakad.invalid`;

try {
  // 1. Identitas role runtime (cast ::text karena tipe 'name' tidak didukung deserializer Prisma)
  const who = await runtime.$queryRawUnsafe<{ u: string; super: boolean; createrole: boolean }[]>(
    "SELECT current_user::text AS u, rolsuper AS super, rolcreaterole AS createrole FROM pg_roles WHERE rolname = current_user",
  );
  results.role = who[0].u;
  results.isSuperuser = String(who[0].super);
  results.canCreateRole = String(who[0].createrole);

  // 2. INSERT User (registrasi) harus berhasil dengan role CLIENT
  const created = await runtime.user.create({
    data: { email: testEmail, name: "Probe Runtime", role: "CLIENT", status: "ACTIVE" },
    select: { id: true, email: true, role: true, status: true },
  });
  results.insertUser = `OK (${created.role}/${created.status})`;

  // 3. Trigger harus menolak role selain CLIENT
  try {
    await runtime.user.create({
      data: { email: `runtime-probe-admin-${Date.now()}@menujuakad.invalid`, role: "SUPERADMIN", status: "ACTIVE" },
    });
    results.triggerBlocksSuperadmin = "GAGAL: SUPERADMIN diterima (bahaya)";
  } catch (error) {
    const msg = String(error);
    results.triggerBlocksSuperadmin = /AUTH_REGISTRATION_ROLE_FORBIDDEN|permission denied|42501/i.test(msg)
      ? "OK: ditolak"
      : "ditolak dengan pesan lain: " + msg.slice(0, 120);
  }

  // 4. AuthCredential INSERT + UPDATE passwordHash (signup/reset)
  await runtime.authCredential.create({
    data: { userId: created.id, passwordHash: "probe-hash-tidak-nyata" },
  });
  await runtime.authCredential.update({ where: { userId: created.id }, data: { passwordHash: "probe-hash-baru" } });
  results.authCredential = "OK insert+update(passwordHash)";

  // 5. UserSession INSERT + UPDATE lastSeenAt (sesi)
  const session = await runtime.userSession.create({
    data: {
      userId: created.id,
      tokenHash: `probe-${Date.now()}`,
      expiresAt: new Date(Date.now() + 3600_000),
    },
    select: { id: true },
  });
  await runtime.userSession.update({ where: { id: session.id }, data: { lastSeenAt: new Date() } });
  results.userSession = "OK insert+update(lastSeenAt)";

  // 6. AuthLoginThrottle upsert (throttle login)
  const keyHash = `probe-${Date.now()}`;
  await runtime.authLoginThrottle.upsert({
    where: { keyHash },
    update: { failedAttempts: { increment: 1 } },
    create: { keyHash, failedAttempts: 1, windowStartsAt: new Date() },
  });
  await runtime.authLoginThrottle.update({ where: { keyHash }, data: { failedAttempts: { increment: 1 } } });
  results.authLoginThrottle = "OK upsert+increment";

  // 7. AuthAccount & AuthVerificationToken (Google + verifikasi email)
  await runtime.authAccount.create({
    data: { userId: created.id, provider: "probe", providerAccountId: `probe-${Date.now()}` },
  });
  await runtime.authVerificationToken.create({
    data: {
      tokenHash: `probe-token-${Date.now()}`,
      purpose: "EMAIL_VERIFY",
      userId: created.id,
      expiresAt: new Date(Date.now() + 3600_000),
    },
  });
  results.authAccount = "OK insert";
  results.authVerificationToken = "OK insert";

  // 8. Harus TIDAK boleh menaikkan role sendiri (escalation)
  try {
    await runtime.user.update({ where: { id: created.id }, data: { role: "SUPERADMIN" } });
    results.roleEscalation = "GAGAL: role bisa dinaikkan (bahaya)";
  } catch {
    results.roleEscalation = "OK: ditolak";
  }

  // 9. Harus TIDAK boleh DDL
  try {
    await runtime.$executeRawUnsafe('CREATE TABLE "probe_ddl_tidak_boleh" ("id" text)');
    results.ddl = "GAGAL: DDL diizinkan (bahaya)";
  } catch {
    results.ddl = "OK: ditolak";
  }

  // 10. Harus TIDAK boleh DELETE sesi milik user lain / drop data
  try {
    await runtime.$executeRawUnsafe('DELETE FROM "User" WHERE "id" = $1', created.id);
    results.deleteUser = "GAGAL: DELETE User diizinkan (bahaya)";
  } catch {
    results.deleteUser = "OK: ditolak";
  }

  console.log(JSON.stringify(results, null, 2));
} finally {
  // Bersihkan via owner (cascade menghapus anak-anaknya).
  await owner.user.deleteMany({ where: { email: testEmail } });
  await owner.user.deleteMany({ where: { email: { startsWith: "runtime-probe-admin-" } } });
  await owner.authLoginThrottle.deleteMany({ where: { keyHash: { startsWith: "probe-" } } });
  await owner.$disconnect();
  await runtime.$disconnect();
}
