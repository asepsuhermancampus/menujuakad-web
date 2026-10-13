import { publicRsvpResource } from "@/server/guests/public-http";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ token: string }> };
export async function PUT(request: Request, { params }: Context) {
  return publicRsvpResource(request, (await params).token);
}
