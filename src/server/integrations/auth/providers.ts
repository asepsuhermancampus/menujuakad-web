import "server-only";
import { unavailable } from "@/server/account/errors";
export type EmailDelivery = {
  recipient: string;
  url: string;
  kind: "reset" | "verify";
  idempotencyKey: string;
};
export type SmsDelivery = { phone: string; code: string; idempotencyKey: string };
export type Receipt = { accepted: true; receiptId: string };
export type DeliveryProviders = {
  email: { available: boolean; send: (input: EmailDelivery) => Promise<Receipt> };
  sms: { available: boolean; send: (input: SmsDelivery) => Promise<Receipt> };
};
async function accepted(response: Response, key: "id" | "sid"): Promise<Receipt> {
  if (!response.ok) throw unavailable();
  const data: unknown = await response.json();
  if (
    !data ||
    typeof data !== "object" ||
    !(key in data) ||
    typeof (data as Record<string, unknown>)[key] !== "string" ||
    !(data as Record<string, string>)[key]
  )
    throw unavailable();
  return { accepted: true, receiptId: (data as Record<string, string>)[key] };
}
export function createDeliveryProviders(): DeliveryProviders {
  const key = process.env.RESEND_API_KEY ?? "";
  const from = process.env.AUTH_EMAIL_FROM?.trim() ?? "";
  const sid = process.env.TWILIO_ACCOUNT_SID ?? "";
  const secret = process.env.TWILIO_AUTH_TOKEN ?? "";
  const sender = process.env.TWILIO_FROM_NUMBER ?? "";
  const emailAvailable =
    /^re_[A-Za-z0-9_-]+$/.test(key) &&
    /^[^\r\n]*[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}>?$/.test(from);
  const smsAvailable =
    /^AC[a-fA-F0-9]{32}$/.test(sid) &&
    /^[a-fA-F0-9]{32}$/.test(secret) &&
    /^\+[1-9]\d{7,14}$/.test(sender);
  return {
    email: {
      available: emailAvailable,
      async send(input) {
        if (!emailAvailable) throw unavailable();
        try {
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            redirect: "error",
            signal: AbortSignal.timeout(10000),
            headers: {
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
              "Idempotency-Key": input.idempotencyKey,
            },
            body: JSON.stringify({
              from,
              to: [input.recipient],
              subject:
                input.kind === "reset"
                  ? "Atur ulang kata sandi Menuju Akad"
                  : "Verifikasi email Menuju Akad",
              text: `${input.kind === "reset" ? "Atur ulang kata sandi" : "Verifikasi email"} melalui tautan berikut:\n${input.url}\nAbaikan jika Anda tidak meminta tindakan ini.`,
            }),
          });
          return await accepted(response, "id");
        } catch {
          throw unavailable();
        }
      },
    },
    sms: {
      available: smsAvailable,
      async send(input) {
        if (!smsAvailable) throw unavailable();
        try {
          // Programmable Messaging has no guaranteed client idempotency header: never retry this POST.
          const response = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
            {
              method: "POST",
              redirect: "error",
              signal: AbortSignal.timeout(10000),
              headers: {
                Authorization: `Basic ${Buffer.from(`${sid}:${secret}`).toString("base64")}`,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                To: input.phone,
                From: sender,
                Body: `Kode Menuju Akad: ${input.code}. Berlaku 5 menit. Jangan bagikan kode ini.`,
              }).toString(),
            },
          );
          return await accepted(response, "sid");
        } catch {
          throw unavailable();
        }
      },
    },
  };
}
