import "server-only";
import { z } from "zod";
export const analyticsInputSchema = z.strictObject({
  period: z.enum(["all", "7d", "30d"]).default("all"),
});
export type AnalyticsPeriod = z.infer<typeof analyticsInputSchema>["period"];
