export type AuthCapabilities = { google: boolean; emailRecovery: boolean; smsOtp: boolean };
export type AuthResponse<T = unknown> = { ok: true; data?: T; redirectTo?: string };
export type OtpChallenge = { token: string; expiresIn: number; resendAfter: number };
export const unavailableCapabilities: AuthCapabilities = {
  google: false,
  emailRecovery: false,
  smsOtp: false,
};

export type RegistrationVerification = {
  verificationRequired: boolean;
  channel: "email" | "sms";
  verificationAvailable: boolean;
};
export type LoginData = OtpChallenge & { otpRequired: true };
