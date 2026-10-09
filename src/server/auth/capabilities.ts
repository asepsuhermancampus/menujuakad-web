import "server-only";
import { getAuthConfig } from "./request-policy";
export function getGoogleConfig() {
  const auth = getAuthConfig();
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const redirectUri = process.env.GOOGLE_REDIRECT_URI?.trim();
  if (
    !clientId ||
    !/^[-a-zA-Z0-9.]+\.apps\.googleusercontent\.com$/.test(clientId) ||
    !clientSecret ||
    clientSecret.length < 8 ||
    redirectUri !== `${auth.origin}/api/auth/google/callback`
  )
    throw new Error("Google belum dikonfigurasi.");
  return { clientId, clientSecret, redirectUri };
}
export function getAuthCapabilities() {
  try {
    getAuthConfig();
  } catch {
    return { google: false, emailRecovery: false, smsOtp: false };
  }
  let google = false;
  try {
    getGoogleConfig();
    google = true;
  } catch {}
  const from = process.env.AUTH_EMAIL_FROM?.trim() ?? "";
  const emailRecovery =
    /^re_[A-Za-z0-9_-]+$/.test(process.env.RESEND_API_KEY ?? "") &&
    /^[^\r\n]*[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}>?$/.test(from);
  const smsOtp =
    /^AC[a-fA-F0-9]{32}$/.test(process.env.TWILIO_ACCOUNT_SID ?? "") &&
    /^[a-fA-F0-9]{32}$/.test(process.env.TWILIO_AUTH_TOKEN ?? "") &&
    /^\+[1-9]\d{7,14}$/.test(process.env.TWILIO_FROM_NUMBER ?? "");
  return { google, emailRecovery, smsOtp };
}
