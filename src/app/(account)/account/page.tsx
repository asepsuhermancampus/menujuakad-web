import { requireAccountSession } from "@/server/authorization/guards";
import { ProfileForm } from "@/features/account/components/profile-form";
export default async function Page() {
  await requireAccountSession("/account");
  return <ProfileForm />;
}
