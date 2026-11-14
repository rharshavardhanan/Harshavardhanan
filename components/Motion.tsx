"use client";

import { useEffect, useLayoutEffect } from "react";
import { afterLoad } from "@/lib/after-load";
import { scramble, wrap } from "@/lib/scramble";

// Renders nothing. It finds elements carrying one of the attributes below and
// animates them as they scroll into view, so the page's own files only have
// to say WHAT moves, not how:
//
//   data-lines        text: each line slides up from behind a mask
//   data-words        text: each word brightens in turn as you scroll through
//                     the nearest [data-words-track] (a project's quote)
//   data-edge         a torn or curved edge: stretches with scrolling speed
//   data-scale-in     media: unclips from the bottom while settling from 110%
//   data-bar          a chart bar: draws from the left
//   data-bar-y        a vertical line: draws downwards
//   data-parallax     media: drifts slower than the page
//   data-tilt         a frame: tips back 12 degrees and straightens on scroll
//   data-decode       a small label: decodes (lib/scramble.ts) the first
//                     time it comes into view
//
// Nothing here runs for visitors who asked for reduced motion; they see the
// finished state of everything.
//
// Put <Motion /> LAST inside each page, not in the shared layout: it must run
// after the page's own content has been handed over to React ("hydrated"),
// or its changes to that content make React throw the content away.
export function Motion() {
  useDecodeOnView();

  useEffect(() => {
    let undo = () => {};
    let cancelled = false;

    // The animation library is fetched only after the page has finished
    // loading, so it never delays the first picture of the page.
    const start = async () => {
      const [{ gsap }, { ScrollTrigger }, { SplitText }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("gsap/SplitText"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger, SplitText);
      const media = gsap.matchMedia();
      undo = () => {
        media.revert();
        delete document.documentElement.dataset.motion;
      };

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const all = (selector: string) =>
          gsap.utils.toArray<HTMLElement>(selector);

        // Text reveals. SplitText wraps each line; the wrapper hides overflow,
        // so the line appears to rise out of nothing.
        for (const text of all("[data-lines]")) {
          SplitText.create(text, {
            type: "lines",
            mask: "lines",
            aria: "none",
            autoSplit: true, // split again if fonts load late or the width changes
            onSplit: (split) =>
              gsap.from(split.lines, {
                yPercent: 110,
                duration: 1.2,
                ease: "expo.out",
                stagger: 0.07,
                scrollTrigger: { trigger: text, start: "top 90%", once: true },
              }),
          });
        }

        // A quote read out word by word: each word starts faint and comes up
        // to full strength as you scroll through the quote's track.
        for (const text of all("[data-words]")) {
          const track = text.closest<HTMLElement>("[data-words-track]") ?? text;
          // Out of sight until its stretch of the page arrives: half-lit
          // words sitting below the fold would read as faint, unreadable text.
          gsap.set(text, { visibility: "hidden" });
          ScrollTrigger.create({
            trigger: track,
            start: "top 70%",
            onEnter: () => gsap.set(text, { visibility: "visible" }),
            onLeaveBack: () => gsap.set(text, { visibility: "hidden" }),
          });
          SplitText.create(text, {
            type: "words",
            aria: "none",
            onSplit: (split) =>
              gsap.fromTo(
                split.words,
                { opacity: 0.12 },
                {
                  opacity: 1,
                  ease: "none",
                  stagger: 0.12,
                  scrollTrigger: {
                    trigger: track,
                    start: "top 45%",
                    end: "bottom 90%",
                    scrub: true,
                  },
                },
              ),
          });
        }

        // Torn and curved edges stretch a little when the page moves fast,
        // then settle back.
        const edges = all("[data-edge]");
        if (edges.length) {
          ScrollTrigger.create({
            onUpdate: (self) => {
              const stretch = Math.min(
                Math.abs(self.getVelocity()) / 1500,
                1.5,
              );
              gsap.to(edges, {
                scaleY: 1 + stretch,
                duration: 0.3,
                ease: "power2.out",
                overwrite: true,
                onComplete: () => {
                  gsap.to(edges, {
                    scaleY: 1,
                    duration: 0.9,
                    ease: "power3.out",
                  });
                },
              });
            },
          });
        }

        for (const item of all("[data-scale-in]")) {
          gsap.from(item, {
            scale: 1.1,
            clipPath: "inset(100% 0 0 0)",
            duration: 1.4,
            ease: "expo.out",
            scrollTrigger: {
              trigger: item.parentElement,
              start: "top 88%",
              once: true,
            },
          });
        }

        for (const bar of all("[data-bar]")) {
          gsap.from(bar, {
            scaleX: 0,
            transformOrigin: "0 50%",
            duration: 1.4,
            ease: "power4.out",
            scrollTrigger: { trigger: bar, start: "top 92%", once: true },
          });
        }

        // A vertical line that draws downwards (the architecture diagram).
        for (const line of all("[data-bar-y]")) {
          gsap.from(line, {
            scaleY: 0,
            transformOrigin: "50% 0",
            duration: 1,
            ease: "power4.out",
            scrollTrigger: { trigger: line, start: "top 85%", once: true },
          });
        }

        // Media that drifts a little slower than the page (the gallery).
        for (const item of all("[data-parallax]")) {
          gsap.fromTo(
            item,
            { yPercent: 8 },
            {
              yPercent: -8,
              ease: "none",
              scrollTrigger: {
                trigger: item,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        }

        for (const frame of all("[data-tilt]")) {
          gsap.fromTo(
            frame,
            {
              rotateX: 12,
              transformPerspective: 1400,
              transformOrigin: "50% 100%",
            },
            {
              rotateX: 0,
              ease: "none",
              scrollTrigger: {
                trigger: frame,
                start: "top 95%",
                end: "top 30%",
                scrub: true,
              },
            },
          );
        }
      });

      // Lets anything that needs to know (the tests) see that it is set up.
      document.documentElement.dataset.motion = "ready";
    };

    const cancelWait = afterLoad(() => void start());

    // Undo everything when the page changes.
    return () => {
      cancelWait();
      cancelled = true;
      undo();
    };
  }, []);

  return null;
}

// [data-decode] labels decode the first time they come into view. This needs
// no GSAP, so it does not wait for it: a layout effect runs as soon as the
// page is handed to React, before it is painted, so labels already in view
// start decoding before anyone sees them plain (on a hard reload the server's
// HTML is painted first, for a moment). Labels further down are watched, and
// decode once, when they come up past the bottom 8% of the window.
function useDecodeOnView() {
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const labels = new Map(
      [...document.querySelectorAll<HTMLElement>("[data-decode]")].map((el) => {
        const label = wrap(el);
        return [label.box as Element, label];
      }),
    );
    const stops: (() => void)[] = [];
    const play = (box: Element) => {
      const label = labels.get(box)!;
      stops.push(scramble(label.box, label.text));
    };
    const seen = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          seen.unobserve(entry.target);
          play(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    for (const box of labels.keys()) {
      const { top, bottom } = box.getBoundingClientRect();
      if (bottom > 0 && top < window.innerHeight * 0.92) play(box);
      else seen.observe(box);
    }
    return () => {
      seen.disconnect();
      stops.forEach((stop) => stop());
      labels.forEach((label) => label.undo());
    };
  }, []);
}
