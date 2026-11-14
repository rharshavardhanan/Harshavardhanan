import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Slug } from "@/content/projects";

// Pictures and recordings, and which of them exist. This runs while the site
// is being built, so a file added to public/ shows up on the next build.
//
//  - public/media/mood/  the AI-generated "mood films" and their posters, one
//                        per project (see the README.txt there).
//  - public/media/real/  real screenshots and recordings of the products.
//  - public/media/       each project's particle recording and cover, which
//                        stand in for anything missing.

const PUBLIC = path.join(process.cwd(), "public");
const exists = (src: string) => existsSync(path.join(PUBLIC, src));

// ---------------------------------------------------------------------------
// Mood films
// ---------------------------------------------------------------------------

export type Film = {
  /** The video. */
  src: string;
  /** A still of it, shown until the video plays (and instead of it, for
   *  visitors who asked for reduced motion). */
  poster: string;
  /** True for an AI-generated film, which the page then labels as such. */
  ai: boolean;
};

// What each project's film file is called: mood-<name>.mp4 and
// poster-<name>.avif. Mostly the project's own name; the robot project's film
// is named after what it shows.
const FILM_NAME: Record<Slug, string> = {
  odovox: "odovox",
  aftermeet: "aftermeet",
  scp: "robot",
  road: "road",
  kattral: "kattral",
  cache: "cache",
  hallucination: "halluc",
};

/** A project's mood film, or its particle recording until there is one. */
export function film(slug: Slug): Film {
  const name = FILM_NAME[slug];
  const src = `/media/mood/mood-${name}.mp4`;
  if (exists(src)) {
    return { src, poster: `/media/mood/poster-${name}.avif`, ai: true };
  }
  return {
    src: `/media/case-${slug}.mp4`,
    poster: `/media/cover-${slug}.avif`,
    ai: false,
  };
}

// ---------------------------------------------------------------------------
// Real screens and recordings
// ---------------------------------------------------------------------------

export type Media = {
  src: string;
  video: boolean;
  /** True for a tall picture, such as a phone screenshot. */
  portrait: boolean;
  /** Width divided by height, for pictures whose size could be read. */
  ratio?: number;
  /** True when the real file is missing and the particle cover stands in. */
  placeholder: boolean;
  /** The real file's name, for the placeholder label. */
  file: string;
};

/** A real file from public/media/real/, or the project's cover in its place
 *  (with a small "placeholder" label) until the file is added. */
export function media(file: string, slug: Slug): Media {
  const src = `/media/real/${file}`;
  if (!exists(src)) {
    return {
      src: `/media/cover-${slug}.avif`,
      video: false,
      portrait: false,
      placeholder: true,
      file,
    };
  }
  return {
    src,
    video: file.endsWith(".mp4"),
    portrait: false,
    placeholder: false,
    file,
  };
}

/** The same, plus its shape: a PNG's width and height are read from its
 *  header. "use cache" makes Next.js read it once, while building: reading a
 *  file directly inside a page made the dev server report an error, because a
 *  library it loads stamps the time whenever a file is closed. */
export async function shapedMedia(file: string, slug: Slug): Promise<Media> {
  "use cache";
  const found = media(file, slug);
  if (found.placeholder || !file.endsWith(".png")) return found;
  const header = readFileSync(path.join(PUBLIC, found.src));
  const [width, height] = [header.readUInt32BE(16), header.readUInt32BE(20)];
  return { ...found, portrait: height > width, ratio: width / height };
}

// The one picture or recording that stands for each project in the work index.
// Kattral has no real media (not allowed), so it always uses its cover.
export const PREVIEW: Record<Slug, string> = {
  odovox: "odovox-queue.png",
  scp: "scp-arbitrated.mp4",
  aftermeet: "aftermeet-workspace.png",
  road: "road-detections.png",
  kattral: "kattral-none",
  cache: "cache-dashboard.mp4",
  hallucination: "halluc-roc.png",
};

export const previews = async () =>
  Object.fromEntries(
    await Promise.all(
      (Object.keys(PREVIEW) as Slug[]).map(async (slug) => [
        slug,
        await shapedMedia(PREVIEW[slug], slug),
      ]),
    ),
  ) as Record<Slug, Media>;

// What each case-study page shows: one wide picture or recording across the
// full width, then a gallery of further screens. Kattral has none: Zerofence
// has not allowed screenshots of the product.
export const CASE_MEDIA: Record<Slug, { wide?: string; gallery: string[] }> = {
  odovox: {
    wide: "odovox-queue.png",
    gallery: ["odovox-verify.png", "odovox-bill.png", "odovox-mobile.png"],
  },
  scp: {
    wide: "scp-monitor-fail.mp4",
    gallery: ["scp-arena.mp4", "scp-monitor-safe.mp4"],
  },
  aftermeet: {
    wide: "aftermeet-landing.png",
    gallery: [
      "aftermeet-workspace.png",
      "aftermeet-mobile.png",
      "aftermeet-extension.png",
    ],
  },
  road: { wide: "road-detections.png", gallery: ["road-map.png"] },
  kattral: { gallery: [] },
  cache: { wide: "cache-dashboard.mp4", gallery: [] },
  hallucination: { wide: "halluc-roc.png", gallery: [] },
};
