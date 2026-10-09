-- Additive: tidak mengubah tabel, data, CHECK, atau baseline fondasi.
CREATE TABLE "AuthCredential" (
    "userId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    CONSTRAINT "AuthCredential_pkey" PRIMARY KEY ("userId")
);

CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuthLoginThrottle" (
    "keyHash" TEXT NOT NULL,
    "failedAttempts" INTEGER NOT NULL,
    "windowStartsAt" TIMESTAMPTZ(3) NOT NULL,
    "blockedUntil" TIMESTAMPTZ(3),
    CONSTRAINT "AuthLoginThrottle_pkey" PRIMARY KEY ("keyHash")
);

CREATE UNIQUE INDEX "UserSession_tokenHash_key" ON "UserSession"("tokenHash");
CREATE INDEX "UserSession_userId_idx" ON "UserSession"("userId");
CREATE INDEX "UserSession_expiresAt_idx" ON "UserSession"("expiresAt");

ALTER TABLE "AuthCredential" ADD CONSTRAINT "AuthCredential_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
