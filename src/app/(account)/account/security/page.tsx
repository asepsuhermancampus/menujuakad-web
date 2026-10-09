import { OAuthFeedback } from "@/features/auth/components/oauth-feedback";
import { requireAccountSession } from "@/server/authorization/guards";
import { SecuritySettings } from "@/features/account/components/security-settings";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  await requireAccountSession("/account/security");
  return (
    <>
      <OAuthFeedback code={typeof error === "string" ? error : undefined} />
      <SecuritySettings />
    </>
  );
}
