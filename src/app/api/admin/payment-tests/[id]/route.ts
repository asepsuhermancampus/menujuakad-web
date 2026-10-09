import { adminPaymentReview } from "@/server/billing/http";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return adminPaymentReview(request, (await params).id);
}
