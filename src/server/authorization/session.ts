import "server-only";

/** Konteks internal server; hanya resolver provider terverifikasi boleh membentuknya. */
export type VerifiedSession = Readonly<{
  userId: string;
  role: "CUSTOMER" | "SUPERADMIN";
  /** Masa berlaku dalam epoch milidetik, bukan epoch detik. */
  expiresAt: number;
}>;

export async function getVerifiedSession(): Promise<VerifiedSession | null> {
  // Auth belum terintegrasi: cookie, query, fixture, dan environment bukan bukti sesi.
  return null;
}
