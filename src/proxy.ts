import { NextResponse, type NextRequest } from "next/server";
import { getPreviewScreen } from "@/features/design-preview/data/screens";
import { invitationFixture, templatesFixture } from "@/features/design-preview/data/fixtures";
import { resolveScreenVariant } from "@/features/design-preview/lib/resolve-variant";

/*
 * Token personal RSVP: 32 byte base64url = 43 karakter [A-Za-z0-9_-].
 * Bentuk yang salah ditolak di sini dengan 404 asli SEBELUM halaman streaming,
 * sehingga tautan rusak tidak pernah mengembalikan shell 200 (soft-404).
 * Token yang bentuknya benar tetapi tidak ada tetap dicek halaman (butuh DB).
 */
const PERSONAL_TOKEN = /^[A-Za-z0-9_-]{43}$/;

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
  if (root === "u" && code) valid = segments.length === 2 && PERSONAL_TOKEN.test(code);
  if (!valid) {
    const destination = request.nextUrl.clone();
    destination.pathname = "/_not-found";
    destination.search = "";
    return NextResponse.rewrite(destination, { status: 404 });
  }
  return NextResponse.next();
}
export const config = {
  matcher: [
    "/preview-ui/:path*",
    "/templates/:path*",
    "/demo/:path*",
    "/invitation/:path*",
    "/u/:path*",
  ],
};
