import { notFound } from "next/navigation";
import { templatesFixture } from "@/features/design-preview/data/fixtures";
import { InvitationView } from "@/features/invitations/components/invitation/invitation-view";
export default async function Page({ params }: { params: Promise<{ templateSlug: string }> }) {
  const { templateSlug } = await params;
  if (!templatesFixture.some((t) => t.slug === templateSlug)) notFound();
  return (
    <main id="main">
      <div className="invitation-demo-label">Demo desain · data contoh · respons tidak dikirim</div>
      <InvitationView opened />
    </main>
  );
}
