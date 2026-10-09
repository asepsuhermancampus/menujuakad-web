import { notFound } from "next/navigation";
import { getPreviewScreen } from "@/features/design-preview/data/screens";
import { resolveScreenVariant } from "@/features/design-preview/lib/resolve-variant";
import { DesignPreviewView } from "@/features/design-preview/components/design-preview-view";
import { PreviewBanner } from "@/features/design-preview/components/preview-banner";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ variant?: string | string[] }>;
}) {
  const { code } = await params;
  const screen = getPreviewScreen(code);
  if (!screen) notFound();
  const { variant } = await searchParams;
  if (Array.isArray(variant)) notFound();
  const resolved = resolveScreenVariant(screen, variant);
  if (!resolved) notFound();
  return (
    <>
      <PreviewBanner screen={resolved} />
      <DesignPreviewView key={resolved.id} screen={resolved} />
    </>
  );
}
