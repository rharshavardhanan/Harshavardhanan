import { existsSync } from "node:fs";
import path from "node:path";
import type { Slug } from "@/content/projects";

// Real screenshots and recordings live in public/media/real/ (see the
// README.txt there for the file names). This checks, while the site is being
// built, which of them exist. A missing one is shown as the project's particle
// cover with a small "placeholder" label until the file is added.

export type Media = {
  src: string;
  video: boolean;
  /** True when the real file is missing and the particle cover stands in. */
  placeholder: boolean;
  /** The real file's name, for the placeholder label. */
  file: string;
};

export function media(file: string, slug: Slug): Media {
  const real = existsSync(path.join(process.cwd(), "public/media/real", file));
  return real
    ? {
        src: `/media/real/${file}`,
        video: file.endsWith(".mp4"),
        placeholder: false,
        file,
      }
    : {
        src: `/media/cover-${slug}.avif`,
        video: false,
        placeholder: true,
        file,
      };
}

// The one picture or recording that stands for each project in the work index.
// Kattral has no real media (not allowed), so it always uses its cover.
export const PREVIEW: Record<Slug, string> = {
  odovox: "odovox-queue.png",
  road: "road-detections.mp4",
  kattral: "kattral-none",
  cache: "cache-dashboard.mp4",
  hallucination: "halluc-roc.png",
};

export const previews = () =>
  Object.fromEntries(
    (Object.keys(PREVIEW) as Slug[]).map((slug) => [
      slug,
      media(PREVIEW[slug], slug),
    ]),
  ) as Record<Slug, Media>;
