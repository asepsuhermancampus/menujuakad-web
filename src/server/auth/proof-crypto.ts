import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { getAuthConfig } from "./request-policy";
export const createOtp = () => String(randomInt(0, 1000000)).padStart(6, "0");
export function proofHmacWithSecret(secret: string, scope: string, ...parts: string[]) {
  return createHmac("sha256", secret)
    .update(JSON.stringify(["auth-proof-v1", scope, ...parts]))
    .digest("hex");
}
export const proofHmac = (scope: string, ...parts: string[]) =>
  proofHmacWithSecret(getAuthConfig().secret, scope, ...parts);
export const otpHash = (id: string, identifier: string, kind: string, code: string) =>
  proofHmac("otp", id, identifier, kind, code);
export function equalHash(a: string, b: string) {
  return (
    /^[a-f0-9]{64}$/.test(a) &&
    /^[a-f0-9]{64}$/.test(b) &&
    timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"))
  );
}
