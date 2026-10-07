import type { PreviewScreen } from "../types";
/** Varian harus dimiliki layar yang sama, bukan sekadar ID valid di registry. */
export function resolveScreenVariant(
  screen: PreviewScreen,
  id?: string,
): PreviewScreen | undefined {
  if (id === undefined) return screen;
  const variant = screen.variants.find((candidate) => candidate.id === id);
  return variant ? { ...variant, variants: screen.variants } : undefined;
}
