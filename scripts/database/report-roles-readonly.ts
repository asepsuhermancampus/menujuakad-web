// READ ONLY: melaporkan nilai enum UserRole di database dan jumlah user per role.
import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../../src/generated/prisma/client";

const url = process.env.DIRECT_URL;
if (!url) throw new Error("DIRECT_URL belum di-set.");
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: url }) });

const enumValues = await prisma.$queryRawUnsafe<{ value: string }[]>(
  `SELECT e.enumlabel::text AS value FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
   WHERE t.typname = 'UserRole' ORDER BY e.enumsortorder`,
);
const counts = await prisma.$queryRawUnsafe<{ role: string; count: number }[]>(
  `SELECT "role"::text AS role, count(*)::int AS count FROM "User" GROUP BY "role" ORDER BY "role"`,
);
const defaultRole = await prisma.$queryRawUnsafe<{ def: string | null }[]>(
  `SELECT column_default AS def FROM information_schema.columns
   WHERE table_name = 'User' AND column_name = 'role'`,
);
console.log(JSON.stringify({
  enumUserRole: enumValues.map((r) => r.value),
  defaultRole: defaultRole[0]?.def ?? null,
  usersPerRole: counts,
  totalUsers: counts.reduce((sum, r) => sum + r.count, 0),
}, null, 2));
await prisma.$disconnect();
