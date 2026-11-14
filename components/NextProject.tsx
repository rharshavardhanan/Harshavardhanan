"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, ViewTransition } from "react";

const REDUCE = "(prefers-reduced-motion: reduce)";

// The end of a project page: the next project's poster, small in the middle
// of a long stretch of its own colour. Scrolling grows it until it fills the
// window; held there for a moment, it opens the next project, and because it
// shares a name with that page's film (film-<slug>) the poster becomes the
// film without a cut. It is also an ordinary link to click.
//
// With reduced motion it is simply the full-size poster and a link; nothing
// moves or opens by itself. Without JavaScript the same.
export function NextProject({
  slug,
  title,
  poster,
}: {
  slug: string;
  title: string;
  poster: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLAnchorElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (window.matchMedia(REDUCE).matches) return;
    const box = track.current!;
    const el = card.current!;
    let frame = 0;
    let wait = 0;
    let gone = false;

    const update = () => {
      frame = 0;
      const rect = box.getBoundingClientRect();
      // 0 when the track's top reaches the top of the window, 1 at its end.
      const run = rect.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / run));
      // Eased, so it grows fast at first and settles into the frame.
      const grown = 1 - Math.pow(1 - p, 3);
      el.style.setProperty("--grow", String(0.42 + 0.58 * grown));

      // Held full size for a third of a second: go.
      if (p > 0.985 && !gone) {
        wait ||= window.setTimeout(() => {
          gone = true;
          router.push(`/work/${slug}`);
        }, 350);
      } else if (wait) {
        clearTimeout(wait);
        wait = 0;
      }
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(wait);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
    };
  }, [slug, router]);

  return (
    <div ref={track} data-theme={slug} className="next-track bg-bg">
      <div className="next-stage">
        <Link
          ref={card}
          href={`/work/${slug}`}
          data-no-wipe
          data-cursor="View"
          data-tone="media"
          className="next-card"
        >
          <ViewTransition
            name={`film-${slug}`}
            share="film-morph"
            default="none"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={poster} alt="" loading="lazy" />
          </ViewTransition>
          <span className="next-caption">
            <span className="label block">Next project</span>
            <span className="text-h2 mt-3 block font-serif">{title} →</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
