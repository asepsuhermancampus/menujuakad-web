import { invitationResource } from "@/server/invitations/http";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
async function resource(request: Request, { params }: Context) {
  return invitationResource(request, (await params).id);
}
export const GET = resource;
export const PATCH = resource;
export const DELETE = resource;
