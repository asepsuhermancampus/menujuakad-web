import { guestCollection } from "@/server/guests/http";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
async function collection(request: Request, { params }: Context) {
  return guestCollection(request, (await params).id);
}
export const GET = collection;
export const POST = collection;
export const PUT = collection;
