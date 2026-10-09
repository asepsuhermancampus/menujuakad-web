import "server-only";
import { z } from "zod";
export const billingIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,128}$/);
export const createTestSchema = z
  .object({
    invitationId: billingIdSchema,
    packageSlug: z.enum(["TEST_BASIC", "TEST_STANDARD", "TEST_PLUS"]),
    reference: z
      .string()
      .trim()
      .max(160)
      .regex(/^[^\x00-\x1f\x7f]*$/)
      .optional(),
  })
  .strict();
export const reviewTestSchema = z
  .object({ status: z.enum(["APPROVED_TEST", "REJECTED"]) })
  .strict();
export type CreateTestInput = z.infer<typeof createTestSchema> & { amountIdr: number };
export type ReviewStatus = z.infer<typeof reviewTestSchema>["status"];
