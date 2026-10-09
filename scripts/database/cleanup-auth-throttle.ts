// Membersihkan sisa baris throttle dari pengujian rate-limit, lalu melaporkan
// keadaan tabel auth agar tidak meninggalkan jejak uji di database.
import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../../src/generated/prisma/client";

const url = process.env.DIRECT_URL;
if (!url) throw new Error("DIRECT_URL belum di-set.");
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: url }) });

const before = await prisma.authLoginThrottle.count();
const removed = await prisma.authLoginThrottle.deleteMany({});
const after = await prisma.authLoginThrottle.count();

console.log(
  JSON.stringify(
    {
      throttleBefore: before,
      throttleRemoved: removed.count,
      throttleAfter: after,
      users: await prisma.user.count(),
      sessions: await prisma.userSession.count(),
      credentials: await prisma.authCredential.count(),
      accounts: await prisma.authAccount.count(),
      verificationTokens: await prisma.authVerificationToken.count(),
    },
    null,
    2,
  ),
);
await prisma.$disconnect();
