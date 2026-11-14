import { existsSync } from "node:fs";
import path from "node:path";
import { type FilmCrop, project, type Slug } from "../content/projects";

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
  /** True for an AI-generated film (credited as such on its page). */
  ai: boolean;
  /** Its framing (lib/crop.ts): a mood film is cropped so the generator's
   *  mark is out of frame; a particle recording has no mark and is not. */
  crop: FilmCrop;
};

const UNCROPPED: FilmCrop = { zoom: 1, shift: [0, 0] };

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
    return {
      src,
      poster: `/media/mood/poster-${name}.avif`,
      ai: true,
      crop: project(slug)!.filmCrop,
    };
  }
  return {
    src: `/media/case-${slug}.mp4`,
    poster: `/media/cover-${slug}.avif`,
    ai: false,
    crop: UNCROPPED,
  };
}

// ---------------------------------------------------------------------------
// Real screens and recordings
// ---------------------------------------------------------------------------

export type Media = {
  src: string;
  video: boolean;
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
      placeholder: true,
      file,
    };
  }
  return {
    src,
    video: file.endsWith(".mp4"),
    placeholder: false,
    file,
  };
}
