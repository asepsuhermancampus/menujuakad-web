import "server-only";
import { z } from "zod";
export function normalizeEmail(value: string): string {
  return z.string().trim().toLowerCase().max(254).email().parse(value);
}
export function normalizePhone(value: string): string {
  let phone = value.trim();
  if (/^08\d+$/.test(phone)) phone = `+62${phone.slice(1)}`;
  else if (/^628\d+$/.test(phone)) phone = `+${phone}`;
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) throw new Error("Nomor telepon tidak valid.");
  return phone;
}
export type AuthIdentifier = { kind: "email" | "phone"; value: string };
export function normalizeIdentifier(value: string): AuthIdentifier {
  if (typeof value !== "string" || value.length > 254) throw new Error("Identitas tidak valid.");
  return value.includes("@")
    ? { kind: "email", value: normalizeEmail(value) }
    : { kind: "phone", value: normalizePhone(value) };
}
export const loginPasswordSchema = z
  .string()
  .min(1)
  .max(256)
  .refine((value) => Buffer.byteLength(value, "utf8") <= 1024);
export const newPasswordSchema = z
  .string()
  .min(12)
  .max(256)
  .refine((value) => Buffer.byteLength(value, "utf8") <= 1024);
