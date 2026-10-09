import "server-only";
import { z } from "zod";
import { loginPasswordSchema, newPasswordSchema } from "../auth/identifiers";
import { AccountError } from "./errors";
export const emptyInput = z.object({}).strict();
export const profileInput = z.object({ name: z.string().trim().min(1).max(100) }).strict();
export const passwordInput = z
  .object({ password: newPasswordSchema, currentPassword: loginPasswordSchema.optional() })
  .strict();
export const reauthInput = z.object({ password: loginPasswordSchema }).strict();
export const securityInput = z.object({ smsOtpEnabled: z.boolean() }).strict();
export function parseInput<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) throw new AccountError(400, "INVALID_INPUT", "Data permintaan tidak valid.");
  return result.data;
}
