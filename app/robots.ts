import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Becomes /robots.txt: search engines may read everything.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
