import { PublicShell } from "@/components/shared/public-shell";
import { HomeOverview } from "@/features/marketing/components/home-overview";
import { TemplateCatalog } from "@/features/templates/components/template-catalog";
import { TemplateDetail } from "@/features/templates/components/template-detail";
import { InvitationView } from "@/features/invitations/components/invitation/invitation-view";
import { PricingOverview } from "@/features/marketing/components/pricing-overview";
import { HowItWorksDetail } from "@/features/marketing/components/how-it-works-detail";
import { FaqSection } from "@/features/marketing/components/faq-section";
import { AboutOverview } from "@/features/marketing/components/about-overview";
import { ContactOverview } from "@/features/marketing/components/contact-overview";
import { LegalDocument } from "@/features/marketing/components/legal-document";
import { BlogOverview } from "@/features/marketing/components/blog-overview";
import { BlogDetail } from "@/features/marketing/components/blog-detail";
import { blogArticles } from "@/features/marketing/config/blog-articles";
import { templatesFixture } from "../data/fixtures";
const publicViews = {
  "PUB-01": <HomeOverview />,
  "PUB-02": <TemplateCatalog />,
  "PUB-03": <TemplateDetail template={templatesFixture[0]} />,
  "PUB-04": <InvitationView opened />,
  "PUB-05": <PricingOverview />,
  "PUB-06": <HowItWorksDetail />,
  "PUB-07": (
    <>
      <section className="container section">
        <h1>Pusat Pertanyaan</h1>
      </section>
      <FaqSection searchable />
    </>
  ),
  "PUB-08": <ContactOverview />,
  "PUB-09": <AboutOverview />,
  "PUB-10": <LegalDocument />,
  "PUB-11": <LegalDocument privacyMode />,
  "PUB-12": <BlogOverview />,
  "PUB-13": <BlogDetail article={blogArticles[0]} />,
} as const;
export function PublicPreviewView({ code }: { code: keyof typeof publicViews }) {
  return (
    <PublicShell>
      <main id="main">{publicViews[code]}</main>
    </PublicShell>
  );
}
export function hasPublicPreview(code: string): code is keyof typeof publicViews {
  return Object.hasOwn(publicViews, code);
}
