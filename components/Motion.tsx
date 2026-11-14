"use client";

import { useEffect } from "react";
import { afterLoad } from "@/lib/after-load";

// Renders nothing. It finds elements carrying one of the attributes below and
// animates them as they scroll into view, so the page's own files only have
// to say WHAT moves, not how:
//
//   data-wipe-layer   a section's colour layer: revealed as a growing circle
//   data-lines        text: each line slides up from behind a mask
//   data-scale-in     media: unclips from the bottom while settling from 110%
//   data-bar          a chart bar: draws from the left
//   data-bar-y        a vertical line: draws downwards
//   data-parallax     media: drifts slower than the page
//   data-tilt         a frame: tips back 12 degrees and straightens on scroll
//   data-hero-name    the hero name: shrinks up into the header while pinned
//   data-strip        a wide row: slides sideways while its section is pinned
//
// Nothing here runs for visitors who asked for reduced motion; they see the
// finished state of everything.
//
// Put <Motion /> LAST inside each page, not in the shared layout: it must run
// after the page's own content has been handed over to React ("hydrated"),
// or its changes to that content make React throw the content away.
export function Motion() {
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

        // The colour wipe. The circle grows from the bottom middle of the window.
        for (const layer of all("[data-wipe-layer]")) {
          const section = layer.parentElement!;
          const hidden = "circle(0% at 50% 28svh)";
          const shown = "circle(150vmax at 50% 28svh)";
          // Until a section is close, its colour is simply shown, so a page that
          // has not been scrolled (and anything measuring it) sees the real
          // colours. Just before it arrives, its colour is hidden, ready to wipe.
          ScrollTrigger.create({
            trigger: section,
            start: "top 180%",
            end: "top 72%",
            onEnter: () => gsap.set(layer, { clipPath: hidden }),
          });
          gsap.fromTo(
            layer,
            { clipPath: hidden },
            {
              clipPath: shown,
              duration: 0.8,
              ease: "expo.inOut",
              immediateRender: false,
              scrollTrigger: {
                trigger: section,
                start: "top 72%",
                toggleActions: "play none none reverse",
              },
              // Once open, drop the clip so a very tall section is never cut off.
              onComplete: () => gsap.set(layer, { clipPath: "none" }),
              onReverseComplete: () => gsap.set(layer, { clipPath: hidden }),
            },
          );
        }

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

        // The hero name: over the first screen of scrolling it shrinks toward
        // the top-left corner and fades, as if becoming the header.
        for (const name of all("[data-hero-name]")) {
          const hero = name.closest(".hero");
          gsap.to(name, {
            scale: 0.12,
            // Up from the middle of the window to the header's line.
            y: () => -(window.innerHeight / 2 - name.offsetHeight / 2 - 14),
            opacity: 0,
            ease: "power2.in",
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "bottom bottom",
              scrub: true,
            },
          });
          gsap.to(hero!.querySelectorAll("[data-hero-fade]"), {
            opacity: 0,
            ease: "none",
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "40% bottom",
              scrub: true,
            },
          });
        }
      });

      // Sideways strips need room, so wide screens only.
      media.add(
        "(prefers-reduced-motion: no-preference) and (min-width: 1024px)",
        () => {
          for (const strip of gsap.utils.toArray<HTMLElement>("[data-strip]")) {
            const distance = () => strip.scrollWidth - window.innerWidth;
            gsap.to(strip, {
              x: () => -distance(),
              ease: "none",
              scrollTrigger: {
                trigger: strip.parentElement,
                start: "top top",
                end: () => `+=${distance()}`,
                pin: true,
                scrub: true,
                invalidateOnRefresh: true,
              },
            });
          }
        },
      );
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
