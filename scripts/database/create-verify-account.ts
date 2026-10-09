// Membuat satu akun uji nyata (verified) memakai role owner, agar login produksi
// dapat diuji end-to-end. Password dibuat acak dan hanya dicetak ke stdout sekali
// untuk dipakai skrip uji login; tidak ditulis ke repo/dokumen/log.
import "dotenv/config";
import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../../src/generated/prisma/client";
import { hashPassword } from "../../src/server/auth/password-crypto";

const url = process.env.DIRECT_URL;
if (!url) throw new Error("DIRECT_URL belum di-set.");

const email = process.argv[2] ?? "verifikasi@menujuakad.test";
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: url }) });

const password = randomBytes(18).toString("base64url");
const passwordHash = await hashPassword(password);

const existing = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } });
const user = existing
  ? await prisma.user.update({
      where: { id: existing.id },
      data: { emailVerifiedAt: new Date(), status: "ACTIVE" },
      select: { id: true, email: true, role: true, status: true },
    })
  : await prisma.user.create({
      data: {
        email,
        name: "Akun Verifikasi Produksi",
        role: "CLIENT",
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
      },
      select: { id: true, email: true, role: true, status: true },
    });

await prisma.authCredential.upsert({
  where: { userId: user.id },
  update: { passwordHash },
  create: { userId: user.id, passwordHash },
});

// Hanya cetak status; kredensial ditulis ke file privat 0600 agar tidak muncul di log/transkrip.
const outPath = process.argv[3] ?? "/tmp/menujuakad-auth-20261010/verify-account.json";
writeFileSync(outPath, JSON.stringify({ email: user.email, password, userId: user.id }) + "\n", { mode: 0o600 });
console.log(JSON.stringify({ email: user.email, userId: user.id, role: user.role, status: user.status, credentialFile: outPath }));
await prisma.$disconnect();
