import { requireCustomerSession } from "@/server/authorization/guards";
export default async function Page({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  await requireCustomerSession("/dashboard/" + path.join("/"));
  return <main>Area terlindungi</main>;
}
