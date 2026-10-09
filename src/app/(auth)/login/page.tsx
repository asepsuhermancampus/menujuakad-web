import { LoginForm } from "@/features/auth/components/login-form";
export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const query = await searchParams;
  return (
    <main id="main">
      <LoginForm next={typeof query.next === "string" ? query.next : undefined} />
    </main>
  );
}
