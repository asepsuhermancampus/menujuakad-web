import { LoginForm } from "@/features/auth/components/login-form";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const query = await searchParams;
  return (
    <main id="main">
      <LoginForm
        next={typeof query.next === "string" ? query.next : undefined}
        error={typeof query.error === "string" ? query.error : undefined}
      />
    </main>
  );
}
