import { guestResource } from "@/server/guests/http";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string; guestId: string }> };
async function resource(request: Request, { params }: Context) {
  const { id, guestId } = await params;
  return guestResource(request, id, guestId);
}
export const PATCH = resource;
export const DELETE = resource;
