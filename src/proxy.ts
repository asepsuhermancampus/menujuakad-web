import { NextResponse, type NextRequest } from "next/server";
import { getPreviewScreen } from "@/features/design-preview/data/screens";
import { invitationFixture, templatesFixture } from "@/features/design-preview/data/fixtures";
import { resolveScreenVariant } from "@/features/design-preview/lib/resolve-variant";
/** Tolak alamat contoh tak dikenal sebelum loading/streaming mengirim header HTTP. */
export function proxy(request: NextRequest) {
  const segments = request.nextUrl.pathname.split("/").filter(Boolean);
  const [root, code] = segments;
  let valid = true;
  if (root === "preview-ui" && code) {
    const screen = getPreviewScreen(code);
    const variants = request.nextUrl.searchParams.getAll("variant");
    valid =
      segments.length === 2 &&
      !!screen &&
      variants.length <= 1 &&
      !!resolveScreenVariant(screen, variants[0]);
  }
  if ((root === "templates" || root === "demo") && code) {
    valid = segments.length === 2 && templatesFixture.some((template) => template.slug === code);
  }
  if (root === "invitation" && code)
    valid = segments.length === 2 && code === invitationFixture.slug;
  if (!valid) {
    const destination = request.nextUrl.clone();
    destination.pathname = "/_not-found";
    destination.search = "";
    return NextResponse.rewrite(destination, { status: 404 });
  }
  return NextResponse.next();
}
export const config = {
  matcher: ["/preview-ui/:path*", "/templates/:path*", "/demo/:path*", "/invitation/:path*"],
};
