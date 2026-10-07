import { AuthForm } from "@/features/auth/components/auth-form";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const q = await searchParams;
  return (
    <main id="main">
      <AuthForm mode={q.state === "conflict" ? "conflict" : "register"} />
    </main>
  );
}
