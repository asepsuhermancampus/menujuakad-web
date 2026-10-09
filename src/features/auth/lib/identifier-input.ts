/** Pembersihan untuk UX; server tetap memeriksa normalisasi dan keunikan. */
export function cleanIdentifierInput(value: string): string {
  const input = value.trim();
  return input.includes("@") ? input : input.replace(/[ ()-]/g, "");
}
/** Validasi format untuk UX; normalisasi dan keunikan tetap diperiksa server. */
export function identifierError(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim() || value.length > 254)
    return "Masukkan email atau nomor telepon.";
  const input = cleanIdentifierInput(value);
  if (input.includes("@"))
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) ? null : "Periksa format email Anda.";
  const international = /^08\d+$/.test(input)
    ? `+62${input.slice(1)}`
    : /^628\d+$/.test(input)
      ? `+${input}`
      : input;
  return /^\+[1-9]\d{7,14}$/.test(international) ? null : "Periksa format nomor telepon Anda.";
}
