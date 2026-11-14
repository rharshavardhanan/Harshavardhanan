"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  ViewTransition,
} from "react";
import type { Slug } from "@/content/projects";
import { afterLoad } from "@/lib/after-load";
import { ease, nearest, type RingLayout, ringLayout, wrap } from "@/lib/ring";
import { play } from "@/lib/sound";
import { FILM_TIME } from "../Film";
import type { RingGL } from "./gl";
import type { Smoke } from "./smoke";

export type RingItem = {
  slug: Slug;
  title: string;
  tone: "dark" | "light";
  src: string;
  poster: string;
  ai: boolean;
};

const REDUCE = "(prefers-reduced-motion: reduce)";
/** Which panel was opened, so coming back can start from it. */
const RING_FROM = "ring-from";

/** 0 → 1, slow at both ends (cubic ease-in-out). */
const inOut = (p: number) =>
  p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

// The home page's ring of films.
//
// Underneath is a plain list of the seven projects (the `children`), which is
// all that visitors without JavaScript, without WebGL or with reduced motion
// get. Once the page has loaded, this fetches components/ring/gl.ts, draws the
// ring over the list, and hides the list from sight (it stays in the page for
// keyboards and screen readers: focusing a project's link turns the ring to it).
//
// The ring turns with the mouse wheel, dragging, swiping and the arrow keys.
// `target` is where it is heading, `offset` where it is now; every frame the
// offset glides 8% of the way there (lib/ring.ts), and when input stops the
// target snaps to the nearest panel.
//
// Opening a project: the middle panel unbends and grows until it fills the
// window (`expand`, 0 → 1), then the page changes. The canvas and the project
// page's film share a name (film-<slug>), so the browser morphs one into the
// other (a view transition) and the film carries on from the same moment.
// Coming back, the ring starts with that panel filling the window and lets it
// shrink back into place.
export function Ring({
  items,
  children,
}: {
  items: RingItem[];
  children: React.ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const backdrop = useRef<HTMLCanvasElement>(null); // the smoke
  const dragged = useRef(false); // so the end of a drag does not also click
  const [on, setOn] = useState(false);
  const [centre, setCentre] = useState(0);
  const [size, setSize] = useState<RingLayout | null>(null);
  // The project being opened: only then does the canvas carry its film's
  // name (two things on a page must never share one).
  const [opening, setOpening] = useState<string | null>(null);
  const router = useRouter();

  // Hide the list before the first paint while the ring is on its way, so it
  // does not flash up and vanish (app/globals.css, "Ring"). The loader's
  // script does the same on a first visit.
  useLayoutEffect(() => {
    if (!window.matchMedia(REDUCE).matches) {
      document.documentElement.dataset.ring = "wait";
    }
  }, []);

  useEffect(() => {
    if (window.matchMedia(REDUCE).matches) return;
    const el = root.current!;
    const html = document.documentElement;
    const n = items.length;
    const links = () =>
      Array.from(el.querySelectorAll<HTMLAnchorElement>("[data-ring-link]"));
    let ring: RingGL | null = null;
    let smoke: Smoke | null = null;
    let frame = 0;
    let cancelled = false;
    let detach = () => {};

    const start = (
      createRing: typeof import("./gl").createRing,
      createSmoke: typeof import("./smoke").createSmoke,
    ) => {
      let dims = ringLayout(window.innerWidth, window.innerHeight);
      ring = createRing(canvas.current!, items, dims.vertical);
      // The smoke behind is a nicety: if it cannot start, the ring still runs
      // over the plain dark background.
      smoke = createSmoke(backdrop.current!);
      if (!ring) {
        delete html.dataset.ring; // no WebGL2: the list stays as it is
        return;
      }
      const gl = ring;

      const s = {
        offset: 0,
        target: 0,
        anchor: 0, // the panel the current gesture started from
        speed: 0,
        // The pointer across the window (0..1 from the bottom left), and how
        // far it has moved since the last frame: the cursor's trail.
        mouse: [0.5, 0.5] as [number, number],
        move: [0, 0] as [number, number],
        // The head, turned a little towards the pointer (yaw, pitch), and the
        // smoke's drift after it: both eased, so they lag gently behind.
        look: [0, 0] as [number, number],
        drift: [0, 0] as [number, number],
        ticked: -1, // the last panel that reached the centre, for the tick
        lastInput: 0,
        dragging: false,
        dragAt: 0,
        dragFrom: 0,
        centre: -1,
        introAt: -1,
        last: performance.now(),
        born: performance.now(),
        expand: 0,
        // When the films may start loading: after the loader and the fly-in.
        filmsAt: performance.now() + (html.dataset.loading ? 2600 : 1200),
        leaving: null as null | { at: number; href: string },
        closing: -1,
      };

      // Back from a project: start on its panel, filling the window.
      try {
        const from = Number(sessionStorage.getItem(RING_FROM) ?? -1);
        sessionStorage.removeItem(RING_FROM);
        if (from >= 0 && from < n) {
          s.offset = s.target = s.anchor = from;
          s.expand = 1;
          s.closing = performance.now();
          s.introAt = 0; // no fly-in
        }
      } catch {}

      // Open a project: remember where its film had got to, then grow.
      const leave = (index: number) => {
        if (s.leaving) return;
        play("click");
        s.anchor = s.target = s.offset + wrap(index - s.offset, n);
        try {
          sessionStorage.setItem(RING_FROM, String(index));
          sessionStorage.setItem(
            FILM_TIME,
            JSON.stringify({
              slug: items[index].slug,
              time: gl.video(index)?.currentTime ?? 0,
            }),
          );
        } catch {}
        s.leaving = {
          at: performance.now(),
          href: `/work/${items[index].slug}`,
        };
        setOpening(items[index].slug);
      };

      const touched = () => {
        if (s.lastInput === 0 || performance.now() - s.lastInput > 140) {
          s.anchor = Math.round(s.target);
        }
        s.lastInput = performance.now();
      };

      // A new project faces you: name it, colour the page, play its film.
      const show = (index: number) => {
        if (cancelled) return; // the page has moved on
        s.centre = index;
        setCentre(index);
        html.dataset.active = items[index].slug;
        // The frame is paper over the dark smoke; on phones, where the next
        // and previous films slide under its corners, on a dark band too.
        el.dataset.tone = dims.vertical ? "media" : "dark";
        window.dispatchEvent(new Event("tone"));
        // The very first films wait until the panels have landed (posters
        // show until then), so they never slow down the first screen.
        if (s.filmsAt > performance.now()) {
          window.setTimeout(() => show(s.centre), s.filmsAt - performance.now());
          return;
        }
        gl.play([(index + n - 1) % n, index, (index + 1) % n]);
      };

      const tick = (now: number) => {
        frame = requestAnimationFrame(tick);
        const dt = Math.min((now - s.last) / 1000, 0.1);
        s.last = now;

        // Input has stopped: settle on a panel. Even a small nudge (a fifth of
        // a panel) moves on to the next one, in the direction it was pushed.
        if (!s.dragging && s.lastInput && now - s.lastInput > 140) {
          const pushed = s.target - s.anchor;
          s.target =
            Math.abs(pushed) < 0.2
              ? s.anchor
              : s.anchor +
                Math.sign(pushed) * Math.max(1, Math.round(Math.abs(pushed)));
          s.anchor = s.target;
          s.lastInput = 0;
        }

        const before = s.offset;
        s.offset = ease(s.offset, s.target, dt);
        if (Math.abs(s.target - s.offset) < 0.0005) s.offset = s.target;
        const velocity = dt ? Math.abs(s.offset - before) / dt : 0;
        s.speed = ease(s.speed, Math.min(1, velocity / 4), dt, 0.2);
        // Turning the head: up to 3° left or right and 1.5° up or down,
        // towards the pointer, easing 5% of the way each sixtieth of a second.
        const degrees = Math.PI / 180;
        const toward = [(s.mouse[0] - 0.5) * 2, (s.mouse[1] - 0.5) * 2];
        s.look = [
          ease(s.look[0], toward[0] * 3 * degrees, dt, 0.05),
          ease(s.look[1], toward[1] * 1.5 * degrees, dt, 0.05),
        ];
        s.drift = [
          ease(s.drift[0], s.mouse[0] - 0.5, dt, 0.05),
          ease(s.drift[1], s.mouse[1] - 0.5, dt, 0.05),
        ];

        // A tick each time a new panel reaches the centre (if sound is on):
        // a slow turn ticks once, a fast flick makes a quick run of ticks.
        const active = nearest(s.offset, n);
        if (active !== s.ticked) {
          s.ticked = active;
          play("tick");
        }

        const middle = nearest(s.offset, n);
        if (middle !== s.centre) show(middle);

        if (s.leaving) {
          const p = Math.min(1, (now - s.leaving.at) / 700);
          s.expand = inOut(p);
          if (p === 1) {
            router.push(s.leaving.href);
            s.leaving.at = Infinity; // asked once; wait for the new page
          }
        } else if (s.closing >= 0) {
          const p = Math.min(1, (now - s.closing) / 800);
          s.expand = 1 - inOut(p);
          if (p === 1) s.closing = -1;
        }

        // The fly-in starts when the loader has gone, nearest panels first.
        if (s.introAt < 0 && !html.dataset.loading) s.introAt = now;
        const intro = items.map((_, index) => {
          if (s.introAt < 0) return 0;
          const order = Math.abs(wrap(index - s.target, n));
          return Math.min(
            1,
            Math.max(0, (now - s.introAt - order * 60) / 900),
          );
        });

        gl.draw({
          offset: s.offset,
          speed: s.speed,
          time: (now - s.born) / 1000,
          mouse: s.mouse,
          move: s.move,
          look: s.look,
          expand: s.expand,
          intro,
          layout: dims,
        });
        smoke?.draw({
          time: (now - s.born) / 1000,
          speed: s.speed,
          mouse: s.drift,
        });
        s.move = [0, 0]; // painted into the trail; start counting again
      };

      // --- input ----------------------------------------------------------
      const along = (event: PointerEvent | MouseEvent) =>
        dims.vertical ? event.clientY : event.clientX;

      const onWheel = (event: WheelEvent) => {
        event.preventDefault();
        if (s.leaving) return;
        const delta =
          Math.abs(event.deltaY) >= Math.abs(event.deltaX)
            ? event.deltaY
            : event.deltaX;
        touched();
        s.target +=
          ((event.deltaMode === 1 ? delta * 16 : delta) / dims.pxPerPanel) * 1.5;
      };

      const onDown = (event: PointerEvent) => {
        if (event.button !== 0 || s.leaving) return;
        touched();
        s.dragging = true;
        s.dragAt = along(event);
        s.dragFrom = s.target;
        dragged.current = false;
      };

      const onMove = (event: PointerEvent) => {
        // The cursor's trail: where it is, and how far it went since the
        // last frame (both as shares of the window, measured from the
        // bottom left as WebGL counts).
        const x = event.clientX / window.innerWidth;
        const y = 1 - event.clientY / window.innerHeight;
        s.move = [s.move[0] + x - s.mouse[0], s.move[1] + y - s.mouse[1]];
        s.mouse = [x, y];
        if (!s.dragging) return;
        const moved = along(event) - s.dragAt;
        if (Math.abs(moved) > 6) dragged.current = true;
        touched();
        s.target = s.dragFrom - moved / dims.pxPerPanel;
      };

      const onUp = (event: PointerEvent) => {
        if (!s.dragging) return;
        s.dragging = false;
        touched();
        // A plain click beside the middle panel turns the ring to that side.
        const onHit = (event.target as Element).closest?.("[data-ring-hit]");
        if (!dragged.current && !onHit && el.contains(event.target as Node)) {
          const fromMiddle =
            along(event) -
            (dims.vertical ? window.innerHeight : window.innerWidth) / 2;
          const half = (dims.vertical ? dims.hit.h : dims.hit.w) / 2;
          if (Math.abs(fromMiddle) > half) {
            s.anchor = s.target = Math.round(s.target) + Math.sign(fromMiddle);
          }
        }
      };

      const step = (by: number) => {
        touched();
        s.anchor = s.target = Math.round(s.target) + by;
        s.lastInput = 0;
        // Keep keyboard focus on the project now in the middle, so Enter
        // opens it and a screen reader says its name.
        links()[nearest(s.target, n)]?.focus({ preventScroll: true });
      };

      const onKey = (event: KeyboardEvent) => {
        if (document.querySelector("dialog[open]")) return;
        if ((event.target as Element).closest?.("input, textarea")) return;
        const by = {
          ArrowRight: 1,
          ArrowDown: 1,
          ArrowLeft: -1,
          ArrowUp: -1,
        }[event.key];
        if (!by || s.leaving) return;
        event.preventDefault();
        step(by);
      };

      // Tabbing to a project's link turns the ring to it (the shortest way).
      const onFocus = (event: FocusEvent) => {
        const link = (event.target as Element).closest<HTMLElement>(
          "[data-ring-link]",
        );
        if (!link) return;
        const index = Number(link.dataset.ringLink);
        s.anchor = s.target = s.offset + wrap(index - s.offset, n);
        s.lastInput = 0;
      };

      // A click on the middle panel, or Enter on a project's link, opens it
      // with the transition (new-tab clicks are left to the browser).
      const onClick = (event: MouseEvent) => {
        const link = (event.target as Element).closest<HTMLElement>(
          "[data-ring-link], [data-ring-hit]",
        );
        if (!link || event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey) return;
        event.preventDefault();
        if (dragged.current) return;
        const index = link.dataset.ringLink;
        leave(index === undefined ? s.centre : Number(index));
      };

      const onResize = () => {
        dims = ringLayout(window.innerWidth, window.innerHeight);
        setSize(dims);
      };

      const onVisibility = () => {
        if (document.hidden) gl.pause();
        else gl.play([(s.centre + n - 1) % n, s.centre, (s.centre + 1) % n]);
      };

      el.addEventListener("wheel", onWheel, { passive: false });
      el.addEventListener("pointerdown", onDown);
      el.addEventListener("focusin", onFocus);
      el.addEventListener("click", onClick, true);
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerup", onUp);
      window.addEventListener("keydown", onKey);
      window.addEventListener("resize", onResize);
      document.addEventListener("visibilitychange", onVisibility);
      detach = () => {
        el.removeEventListener("wheel", onWheel);
        el.removeEventListener("pointerdown", onDown);
        el.removeEventListener("focusin", onFocus);
        el.removeEventListener("click", onClick, true);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("resize", onResize);
        document.removeEventListener("visibilitychange", onVisibility);
      };

      // No tick for where we start.
      s.ticked = nearest(s.offset, n);
      setSize(dims);
      setOn(true);
      delete html.dataset.ring;
      frame = requestAnimationFrame(tick);
    };

    const cancelIdle = afterLoad(() => {
      Promise.all([import("./gl"), import("./smoke")])
        .then(([{ createRing }, { createSmoke }]) => {
          if (!cancelled) start(createRing, createSmoke);
        })
        .catch(() => delete html.dataset.ring);
    });

    return () => {
      cancelled = true;
      cancelIdle();
      cancelAnimationFrame(frame);
      detach();
      ring?.destroy();
      smoke?.destroy();
      delete html.dataset.active;
      // (Next.js may keep this page alive for the Back button and run this
      // effect again later, so leave the state ready for a fresh start.)
      setOn(false);
      setSize(null);
      setOpening(null);
    };
  }, [items, router]);

  const item = items[centre];

  return (
    <div
      ref={root}
      role="region"
      aria-label="Selected work: seven projects"
      className="ring bg-bg text-fg"
      data-theme={item.slug}
      data-tone={item.tone}
      data-state={on ? "on" : "off"}
      data-lenis-prevent
    >
      {children}
      <canvas ref={backdrop} aria-hidden className="bg-canvas" />
      <ViewTransition
        name={opening ? `film-${opening}` : undefined}
        share="film-morph"
        default="none"
      >
        <canvas ref={canvas} aria-hidden className="ring-canvas" />
      </ViewTransition>
      {on && size && (
        // The middle panel, as something to point at and click. Keyboards
        // and screen readers use the list's links instead, so it is hidden
        // from them.
        <Link
          href={`/work/${item.slug}`}
          data-ring-hit
          data-no-wipe
          aria-hidden
          tabIndex={-1}
          data-cursor="View"
          className="ring-hit"
          style={{ width: size.hit.w, height: size.hit.h }}
        >
          {item.ai && <span className="label ring-ai">AI-generated film</span>}
        </Link>
      )}
    </div>
  );
}
