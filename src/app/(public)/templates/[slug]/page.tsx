import { notFound } from "next/navigation";
import { templatesFixture } from "@/features/design-preview/data/fixtures";
import { TemplateDetail } from "@/features/templates/components/template-detail";
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const template = templatesFixture.find((t) => t.slug === slug);
  if (!template) notFound();
  return (
    <main id="main">
      <TemplateDetail template={template} />
    </main>
  );
}
