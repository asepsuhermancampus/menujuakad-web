import type { AuthCapabilities } from "@/features/auth/types/auth-contracts";
export type ProfileDto = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: "CLIENT" | "SUPERADMIN";
  emailVerified: boolean;
  phoneVerified: boolean;
};
export type SecurityDto = {
  smsOtpEnabled: boolean;
  hasPassword: boolean;
  googleLinked: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  reauthenticatedUntil: string | null;
  capabilities: AuthCapabilities;
};
export type SessionDto = {
  id: string;
  current: boolean;
  createdAt: string;
  lastSeenAt: string | null;
  expiresAt: string;
  deviceLabel: string;
};
