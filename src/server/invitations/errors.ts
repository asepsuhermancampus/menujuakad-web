import "server-only";
export class WorkspaceError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
export function unavailable(error: unknown): never {
  if (error instanceof WorkspaceError) throw error;
  if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002")
    throw new WorkspaceError(409, "Alamat undangan sudah digunakan.");
  throw new WorkspaceError(503, "Layanan data sedang tidak tersedia. Silakan coba lagi.");
}
