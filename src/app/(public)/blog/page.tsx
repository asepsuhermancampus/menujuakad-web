import { publicPageMetadata } from "@/config/seo";
export const metadata = publicPageMetadata(
  "/blog",
  "Blog & Panduan Pernikahan",
  "Panduan perencanaan, desain, dan etiket pernikahan dari Menuju Akad. Artikel contoh untuk peninjauan tata letak; konten final belum diterbitkan.",
);
import { BlogOverview } from "@/features/marketing/components/blog-overview";
export default function Page() {
  return (
    <main id="main">
      <BlogOverview />
    </main>
  );
}
