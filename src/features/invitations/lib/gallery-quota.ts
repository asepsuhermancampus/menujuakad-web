import type { GalleryItemDto } from "@/features/design-preview/data/fixtures";
/** Kuota snapshot dapat mencakup ilustrasi yang tidak seluruhnya dirender. */
export function galleryUsed(
  initial: readonly GalleryItemDto[],
  current: readonly GalleryItemDto[],
  sourceUsed: number,
): number {
  const countReady = (items: readonly GalleryItemDto[]) =>
    items.filter((item) => item.status === "READY").length;
  const notRendered = Math.max(0, sourceUsed - countReady(initial));
  return notRendered + countReady(current);
}
