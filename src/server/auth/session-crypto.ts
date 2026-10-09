import "server-only";
import { createHash, randomBytes } from "node:crypto";
export const isSessionToken = (value: unknown): value is string =>
  typeof value === "string" && /^[A-Za-z0-9_-]{43}$/.test(value) && value.length === 43;
export const hashSessionToken = (token: string) => createHash("sha256").update(token).digest("hex");
export const createSessionToken = () => randomBytes(32).toString("base64url");
