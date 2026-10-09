import { billingResource } from "@/server/billing/http";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return billingResource((await params).id);
}
