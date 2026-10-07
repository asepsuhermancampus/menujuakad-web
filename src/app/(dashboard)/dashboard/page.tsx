import { requireCustomerSession } from "@/server/authorization/guards";
export default async function Page() {
  await requireCustomerSession("/dashboard");
  return <main>Area terlindungi</main>;
}
