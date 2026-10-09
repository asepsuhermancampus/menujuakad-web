import type { MetadataRoute } from "next";
import { seoOrigin } from "@/config/seo";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard", "/admin"] },
    sitemap: `${seoOrigin}/sitemap.xml`,
  };
}
