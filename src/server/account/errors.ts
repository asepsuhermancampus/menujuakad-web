import "server-only";
export class AccountError extends Error {
  constructor(
    public status: number,
    public code: string,
    message = "Permintaan tidak dapat diproses.",
  ) {
    super(message);
  }
}
export const invalidProof = () =>
  new AccountError(400, "INVALID_PROOF", "Bukti tidak berlaku atau kedaluwarsa.");
export const unavailable = () =>
  new AccountError(503, "UNAVAILABLE", "Layanan autentikasi sementara tidak tersedia.");
