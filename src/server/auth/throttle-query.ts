import "server-only";
import { Prisma } from "@/generated/prisma/client";
import type { ThrottleKey } from "./request-policy";
/** Reserve before hashing; successful email reservation is released, IP reservation persists. */
export function throttleReservation(key: ThrottleKey) {
  return Prisma.sql`
    INSERT INTO "AuthLoginThrottle" ("keyHash", "failedAttempts", "windowStartsAt", "blockedUntil")
    VALUES (${key.keyHash}, 1, CURRENT_TIMESTAMP, NULL)
    ON CONFLICT ("keyHash") DO UPDATE SET
      "failedAttempts" = CASE WHEN "AuthLoginThrottle"."windowStartsAt" <= CURRENT_TIMESTAMP - INTERVAL '15 minutes'
        AND ("AuthLoginThrottle"."blockedUntil" IS NULL OR "AuthLoginThrottle"."blockedUntil" <= CURRENT_TIMESTAMP)
        THEN 1 ELSE LEAST("AuthLoginThrottle"."failedAttempts" + 1, 10000) END,
      "windowStartsAt" = CASE WHEN "AuthLoginThrottle"."windowStartsAt" <= CURRENT_TIMESTAMP - INTERVAL '15 minutes'
        AND ("AuthLoginThrottle"."blockedUntil" IS NULL OR "AuthLoginThrottle"."blockedUntil" <= CURRENT_TIMESTAMP)
        THEN CURRENT_TIMESTAMP ELSE "AuthLoginThrottle"."windowStartsAt" END,
      "blockedUntil" = CASE
        WHEN "AuthLoginThrottle"."blockedUntil" > CURRENT_TIMESTAMP THEN "AuthLoginThrottle"."blockedUntil"
        WHEN "AuthLoginThrottle"."windowStartsAt" <= CURRENT_TIMESTAMP - INTERVAL '15 minutes' THEN NULL
        WHEN "AuthLoginThrottle"."failedAttempts" >= ${key.limit} THEN CURRENT_TIMESTAMP + INTERVAL '15 minutes'
        ELSE NULL END
    RETURNING ("blockedUntil" > CURRENT_TIMESTAMP) IS TRUE AS blocked
  `;
}
