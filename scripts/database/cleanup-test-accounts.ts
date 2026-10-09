// Membersihkan akun uji yang dibuat selama verifikasi (hanya pola uji yang dikenal).
// Tidak menyentuh akun lain; mencetak hitungan sebelum/sesudah.
import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../../src/generated/prisma/client";

const url = process.env.DIRECT_URL;
if (!url) throw new Error("DIRECT_URL belum di-set.");
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: url }) });

const patterns = [
  { email: { startsWith: "verifikasi" } },
  { email: { startsWith: "daftar-" } },
  { email: { startsWith: "probe-" } },
  { email: { startsWith: "runtime-probe-" } },
];

const before = await prisma.user.findMany({ select: { email: true, role: true, status: true } });
console.log("user sebelum:", before.length, JSON.stringify(before.map((u) => u.email)));

let removed = 0;
for (const where of patterns) {
  const result = await prisma.user.deleteMany({ where });
  removed += result.count;
}
// Throttle sisa dari uji rate-limit.
const throttle = await prisma.authLoginThrottle.deleteMany({ where: { keyHash: { startsWith: "probe-" } } });

const after = await prisma.user.findMany({ select: { email: true } });
console.log("user dihapus:", removed, "| throttle dihapus:", throttle.count);
console.log("user sesudah:", after.length, JSON.stringify(after.map((u) => u.email)));
console.log("sesi tersisa:", await prisma.userSession.count(), "| kredensial tersisa:", await prisma.authCredential.count());
await prisma.$disconnect();
