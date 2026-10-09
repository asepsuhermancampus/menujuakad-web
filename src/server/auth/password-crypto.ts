import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
const options = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, options, (error, key) => (error ? reject(error) : resolve(key)));
  });
}
function validPassword(password: string): boolean {
  return (
    typeof password === "string" &&
    password.length > 0 &&
    Buffer.byteLength(password, "utf8") <= 1024
  );
}
/** Pure Node crypto: shared by server authentication and private seed tooling. */
export async function hashPassword(password: string): Promise<string> {
  if (!validPassword(password)) throw new Error("Kata sandi tidak valid.");
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return `scrypt$32768$8$1$${salt.toString("base64url")}$${key.toString("base64url")}`;
}
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!validPassword(password) || typeof hash !== "string") return false;
  const match = /^scrypt\$32768\$8\$1\$([A-Za-z0-9_-]{22})\$([A-Za-z0-9_-]{86})$/.exec(hash);
  if (!match || match[0] !== hash) return false;
  const salt = Buffer.from(match[1], "base64url");
  const expected = Buffer.from(match[2], "base64url");
  if (salt.toString("base64url") !== match[1] || expected.toString("base64url") !== match[2])
    return false;
  const actual = await derive(password, salt);
  return timingSafeEqual(actual, expected);
}
