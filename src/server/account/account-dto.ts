import "server-only";
import type { User, UserSession } from "@/generated/prisma/client";
import type {
  ProfileDto,
  SecurityDto,
  SessionDto,
} from "@/features/account/types/account-contracts";
import { getAuthCapabilities } from "../auth/capabilities";
import { recent } from "./account-repository";
export function profileDto(user: User): ProfileDto {
  let avatarUrl: string | null = null;
  try {
    const url = new URL(user.avatarUrl ?? "");
    if (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      (url.hostname === "googleusercontent.com" || url.hostname.endsWith(".googleusercontent.com"))
    )
      avatarUrl = url.href;
  } catch {}
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatarUrl,
    role: user.role,
    emailVerified: !!user.emailVerifiedAt,
    phoneVerified: !!user.phoneVerifiedAt,
  };
}
export function securityDto(
  user: User,
  hasPassword: boolean,
  googleLinked: boolean,
  at: Date | null,
): SecurityDto {
  return {
    hasPassword,
    googleLinked,
    emailVerified: !!user.emailVerifiedAt,
    phoneVerified: !!user.phoneVerifiedAt,
    smsOtpEnabled: user.smsOtpEnabled,
    reauthenticatedUntil: recent(at) ? new Date(at!.getTime() + 300000).toISOString() : null,
    capabilities: getAuthCapabilities(),
  };
}
export function sessionDto(session: UserSession, currentId: string): SessionDto {
  // Coarse labels avoid exposing raw user agent or treating it as a trusted device identity.
  const ua = session.userAgent ?? "";
  const browser = /Firefox/i.test(ua)
    ? "Firefox"
    : /Edg\//i.test(ua)
      ? "Edge"
      : /Chrome/i.test(ua)
        ? "Chrome"
        : /Safari/i.test(ua)
          ? "Safari"
          : "Peramban";
  const os = /Android/i.test(ua)
    ? "Android"
    : /iPhone|iPad/i.test(ua)
      ? "iOS"
      : /Windows/i.test(ua)
        ? "Windows"
        : /Macintosh/i.test(ua)
          ? "macOS"
          : /Linux/i.test(ua)
            ? "Linux"
            : "Perangkat";
  return {
    id: session.id,
    current: session.id === currentId,
    createdAt: session.createdAt.toISOString(),
    lastSeenAt: (session.lastSeenAt ?? session.createdAt).toISOString(),
    expiresAt: session.expiresAt.toISOString(),
    deviceLabel: `${browser} · ${os}`,
  };
}
