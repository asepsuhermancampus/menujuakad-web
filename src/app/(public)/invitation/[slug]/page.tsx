import { notFound } from "next/navigation";
import { invitationFixture } from "@/features/design-preview/data/fixtures";
import { InvitationView } from "@/features/invitations/components/invitation/invitation-view";
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug !== invitationFixture.slug) notFound();
  return (
    <main id="main">
      <div className="invitation-demo-label">
        Undangan contoh · belum diterbitkan · respons tidak dikirim
      </div>
      <InvitationView />
    </main>
  );
}
