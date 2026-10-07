import { requireSuperadminSession } from "@/server/authorization/guards";
export default async function Page() {
  await requireSuperadminSession("/admin");
  return <main>Area terlindungi</main>;
}
