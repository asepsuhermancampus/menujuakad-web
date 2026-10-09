// Memverifikasi bahwa role SUPERADMIN masih dapat dibuat/dihapus dengan enum baru,
// lalu membersihkan akun uji. Hanya untuk pemeriksaan migrasi role.
import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../../src/generated/prisma/client";

const url = process.env.DIRECT_URL;
if (!url) throw new Error("DIRECT_URL belum di-set.");
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: url }) });

const email = "admin-roles-check@menujuakad.test";
await prisma.user.deleteMany({ where: { email } });
const created = await prisma.user.create({
  data: { email, name: "Admin Uji", role: "SUPERADMIN", status: "ACTIVE" },
  select: { id: true, role: true, status: true },
});
console.log("SUPERADMIN dapat dibuat:", JSON.stringify(created));

// Role runtime tidak boleh membuat SUPERADMIN (dibuktikan terpisah oleh verify-auth-runtime-grants).
await prisma.user.delete({ where: { id: created.id } });
const remaining = await prisma.user.count({ where: { email } });
console.log("dibersihkan, sisa:", remaining);
await prisma.$disconnect();
