import { publicPageMetadata } from "@/config/seo";
import { notFound } from "next/navigation";
import { templatesFixture } from "@/features/design-preview/data/fixtures";
import { TemplateDetail } from "@/features/templates/components/template-detail";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const template = templatesFixture.find((item) => item.slug === slug);
  if (!template) notFound();
  return publicPageMetadata(
    `/templates/${template.slug}`,
    template.name,
    `${template.description} Ilustrasi desain contoh Menuju Akad.`,
  );
}
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
