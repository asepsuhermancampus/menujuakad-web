import "server-only";
import { getPrisma } from "@/server/db/client";
import { WorkspaceError } from "@/server/invitations/errors";
export const testCustomerEmails = Array.from(
  { length: 10 },
  (_, i) => `customer${String(i + 1).padStart(2, "0")}@menujuakad.test`,
);
export const testAccountEmails = ["admin@menujuakad.test", ...testCustomerEmails];
async function assertAdmin(userId: string) {
  const user = await getPrisma().user.findFirst({
    where: { id: userId, role: "SUPERADMIN", status: "ACTIVE" },
    select: { id: true },
  });
  if (!user) throw new WorkspaceError(403, "Akses ditolak.");
}
export async function readTestUsers(userId: string, page: number) {
  await assertAdmin(userId);
  return getPrisma().user.findMany({
    where: { email: { in: testAccountEmails } },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    orderBy: { email: "asc" },
    skip: (page - 1) * 25,
    take: 25,
  });
}
export async function readTestInvitations(userId: string, page: number) {
  await assertAdmin(userId);
  const rows = await getPrisma().invitation.findMany({
    where: {
      owner: { is: { email: { in: testCustomerEmails }, role: "CLIENT" } },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      isPublished: true,
      updatedAt: true,
      owner: { select: { name: true, email: true } },
    },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    skip: (page - 1) * 25,
    take: 25,
  });
  // Query hanya fixture email allowlist, sehingga DTO ini selalu mempunyai email nyata.
  return rows.flatMap((row) =>
    row.owner.email ? [{ ...row, owner: { ...row.owner, email: row.owner.email } }] : [],
  );
}
