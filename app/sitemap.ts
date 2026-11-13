import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { SITE_URL } from "@/lib/site";

// Becomes /sitemap.xml: the list of pages for search engines.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, priority: 1 },
    ...projects.map((project) => ({
      url: `${SITE_URL}/work/${project.slug}`,
      priority: 0.8,
    })),
  ];
}
