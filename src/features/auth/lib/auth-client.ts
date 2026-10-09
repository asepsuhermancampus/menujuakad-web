import type { AuthResponse } from "../types/auth-contracts";

export class AuthClientError extends Error {
  constructor(
    public status: number,
    public retryAfter = 0,
    public code = "",
  ) {
    super(
      status === 401
        ? "Sesi atau kredensial tidak sesuai. Silakan masuk kembali."
        : status === 429
          ? `Terlalu banyak percobaan. Coba lagi dalam ${retryAfter || 60} detik.`
          : status === 503
            ? "Layanan ini belum tersedia. Silakan coba lagi nanti."
            : status === 403 && code === "REAUTH_REQUIRED"
              ? "Konfirmasi identitas Anda terlebih dahulu."
              : status === 409
                ? "Perubahan belum dapat dilakukan. Periksa metode masuk Anda."
                : status === 400
                  ? "Periksa isian Anda. Tautan atau kode mungkin sudah kedaluwarsa."
                  : "Permintaan gagal. Silakan coba lagi.",
    );
  }
}
function allowedApi(path: string) {
  return /^\/api\/(auth|account)\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/.test(path);
}
async function readResponse<T>(response: Response): Promise<AuthResponse<T>> {
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.ok !== true) {
    const retry = Number(response.headers.get("Retry-After"));
    throw new AuthClientError(
      response.status,
      Number.isFinite(retry) ? Math.min(3600, Math.max(0, retry)) : 60,
      typeof result?.code === "string" ? result.code : "",
    );
  }
  return result;
}
export async function fetchCsrf(): Promise<string> {
  const response = await fetch("/api/auth/csrf", {
    credentials: "same-origin",
    cache: "no-store",
    redirect: "error",
  });
  const result = await readResponse<{ csrfToken: string }>(response);
  if (!result.data?.csrfToken || typeof result.data.csrfToken !== "string")
    throw new AuthClientError(503);
  return result.data.csrfToken;
}
export async function authRequest<T = unknown>(
  path: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  body?: unknown,
): Promise<AuthResponse<T>> {
  if (!allowedApi(path)) throw new AuthClientError(400);
  const headers: Record<string, string> = { Accept: "application/json" };
  if (method !== "GET") {
    headers["X-CSRF-Token"] = await fetchCsrf();
    headers["Content-Type"] = "application/json";
  }
  return readResponse<T>(
    await fetch(path, {
      method,
      headers,
      credentials: "same-origin",
      cache: "no-store",
      redirect: "error",
      ...(method === "GET" ? {} : { body: JSON.stringify(body ?? {}) }),
    }),
  );
}
export function isLocalAuthRedirect(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\/(dashboard|admin|account)(\/[A-Za-z0-9_-]+)*\/?$/.test(value)
  );
}
export function isGoogleAuthRedirect(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return (
      url.origin === "https://accounts.google.com" &&
      !url.username &&
      !url.password &&
      ["/o/oauth2/v2/auth", "/o/oauth2/auth"].includes(url.pathname)
    );
  } catch {
    return false;
  }
}
export function redirectAfterAuth(value: unknown) {
  if (!isLocalAuthRedirect(value)) throw new AuthClientError(503);
  window.location.assign(value);
}
