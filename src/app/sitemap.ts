import type { MetadataRoute } from "next";
import { publicSeoPages, seoOrigin } from "@/config/seo";
import { templatesFixture } from "@/features/design-preview/data/invitations-fixtures";
import { blogArticles } from "@/features/marketing/config/blog-articles";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...publicSeoPages.map(([path]) => path),
    ...templatesFixture.map((item) => `/templates/${item.slug}`),
    ...blogArticles.map((article) => `/blog/${article.slug}`),
  ].map((path) => ({ url: `${seoOrigin}${path}` }));
}
