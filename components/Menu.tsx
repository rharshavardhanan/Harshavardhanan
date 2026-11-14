"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Fragment,
  useLayoutEffect,
  useRef,
  useState,
  ViewTransition,
} from "react";
import { contact } from "@/content/about";
import { projects, type Slug } from "@/content/projects";
import { play } from "@/lib/sound";
import { Decode } from "./Decode";

const REDUCE = "(prefers-reduced-motion: reduce)";
const reduced = () => window.matchMedia(REDUCE).matches;
/** 3 → "03". */
const two = (n: number) => String(n).padStart(2, "0");

// While a dialog is open the page underneath must not scroll: this mark on
// <html> locks it (app/globals.css) and pauses smooth scrolling
// (components/SmoothScroll.tsx).
export const lockPage = (on: boolean) => {
  if (on) document.documentElement.dataset.lock = "";
  else delete document.documentElement.dataset.lock;
};

// The site menu: every project by name, one per line, with a preview of the
// one you point at. MENU is a link to the home page's list of projects, so it
// still works with JavaScript off; with JavaScript it opens this dialog.
//
// The browser's <dialog>, opened with showModal(), keeps Tab inside it and
// lets Escape close it. Opening wipes the dark page down from the top, then
// the names rise in turn, then the preview fades in; closing plays it back,
// faster. Choosing a project fades the other names, and the preview poster
// grows to fill the window and becomes the new page's film (a view
// transition, like the home ring's). How it all looks is under "Site menu"
// in app/globals.css.
export function Menu({ posters }: { posters: Record<Slug, string> }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLAnchorElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  // The project whose page you are on, if any.
  const here =
    projects.find((project) => pathname === `/work/${project.slug}`)?.slug ??
    null;

  const [open, setOpen] = useState(false);
  // From the first opening on, all seven posters stay in the page, stacked,
  // so switching between them is instant.
  const [primed, setPrimed] = useState(false);
  const [shown, setShown] = useState<Slug>("odovox");
  const [leaving, setLeaving] = useState<Slug | null>(null);
  const [closing, setClosing] = useState(false);

  const projectLinks = () =>
    Array.from(
      dialog.current?.querySelectorAll<HTMLElement>("[data-menu-project]") ??
        [],
    );

  const show = () => {
    const el = dialog.current!;
    setShown(here ?? "odovox");
    setPrimed(true);
    setClosing(false);
    setOpen(true);
    el.showModal();
    lockPage(true);
    play("menuOpen");
    // Keyboard focus starts on the first project.
    requestAnimationFrame(() =>
      projectLinks()[0]?.focus({ preventScroll: true }),
    );
  };

  // Closes the menu: played back (0.45s; 0.2s with reduced motion), or at once.
  const shut = (now = false) => {
    const el = dialog.current;
    if (!el?.open) return;
    const finish = () => {
      el.close();
      setClosing(false);
      setOpen(false);
      lockPage(false);
      trigger.current?.focus({ preventScroll: true });
    };
    if (now) return finish();
    play("menuClose");
    setClosing(true);
    window.setTimeout(finish, reduced() ? 200 : 450);
  };

  // A new page has arrived (from this menu or anywhere else): the menu goes,
  // at once, so the new page is what you see. Its state is reset as the new
  // address is first drawn; the dialog itself is closed just after.
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setLeaving(null);
    setClosing(false);
    setOpen(false);
  }
  useLayoutEffect(() => {
    const el = dialog.current;
    if (!el?.open) return;
    el.close();
    lockPage(false);
  }, [pathname]);

  // Choosing a project. Ordinary clicks only: a cmd-click still opens a tab.
  const choose = (event: React.MouseEvent, slug: Slug) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button) {
      return;
    }
    event.preventDefault();
    if (slug === here) return shut(); // already here: just close
    setShown(slug);
    setLeaving(slug);
    // The other names fade first; then the page changes and the poster
    // grows into the new page's film.
    window.setTimeout(() => router.push(`/work/${slug}`), reduced() ? 0 : 250);
  };

  // Arrow keys move between the projects.
  const onKeyDown = (event: React.KeyboardEvent) => {
    const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];
    if (!step) return;
    const links = projectLinks();
    const at = links.indexOf(document.activeElement as HTMLElement);
    if (at < 0) return;
    event.preventDefault();
    links[(at + step + links.length) % links.length].focus();
  };

  // INQUIRE inside the menu: close it, then open the contact sheet
  // (components/Inquire.tsx listens for this).
  const inquire = (event: React.MouseEvent) => {
    event.preventDefault();
    shut(true);
    window.dispatchEvent(new Event("inquire"));
  };

  const preview = projects.find((project) => project.slug === shown)!;

  return (
    <>
      <Link
        ref={trigger}
        href="/#projects"
        aria-haspopup="dialog"
        aria-expanded={open}
        data-no-wipe
        className="inline-block py-2"
        onClick={(event) => {
          event.preventDefault();
          show();
        }}
      >
        Menu
      </Link>

      <dialog
        ref={dialog}
        aria-label="Site menu"
        aria-modal="true"
        className="site-menu"
        data-theme="ink"
        data-lenis-prevent
        data-closing={closing || undefined}
        data-leaving={leaving ?? undefined}
        // Escape: play the closing, rather than vanishing.
        onCancel={(event) => {
          event.preventDefault();
          shut();
        }}
      >
        <div className="menu-bar label">
          <button type="button" onClick={() => shut()}>
            Close&nbsp;<span aria-hidden>✕</span>
          </button>
          <Link href="/" className="corner-name justify-self-center">
            Harshavardhanan
          </Link>
          <a href="/contact" className="justify-self-end" onClick={inquire}>
            Inquire
          </a>
        </div>

        <div className="menu-main">
          <nav aria-label="Projects">
            <ol className="menu-list" onKeyDown={onKeyDown}>
              {projects.map((project, index) => (
                <li
                  key={project.slug}
                  style={{ "--i": index } as React.CSSProperties}
                >
                  <Link
                    href={`/work/${project.slug}`}
                    data-menu-project
                    data-no-wipe
                    data-chosen={leaving === project.slug || undefined}
                    aria-current={project.slug === here ? "page" : undefined}
                    className="menu-row"
                    onPointerEnter={() => !leaving && setShown(project.slug)}
                    onFocus={() => !leaving && setShown(project.slug)}
                    onClick={(event) => choose(event, project.slug)}
                  >
                    {primed && (
                      // A plain <img>: the posters are already small AVIF stills.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={posters[project.slug]}
                        alt=""
                        className="menu-thumb"
                      />
                    )}
                    <span className="menu-num label">
                      {project.slug === here && (
                        <span aria-hidden className="menu-dot" />
                      )}
                      {/* The number and the name decode as the menu opens,
                          row by row with the rise. */}
                      <Decode
                        text={two(index + 1)}
                        active={open}
                        delay={index * 0.05}
                      />
                    </span>
                    <span className="menu-name">
                      <span>
                        <Decode
                          text={project.title}
                          active={open}
                          delay={index * 0.05}
                        />
                      </span>
                    </span>
                    {project.slug === here && (
                      <span className="menu-here label">you’re here</span>
                    )}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>

          <div className="menu-side">
            {/* The other pages, large and close at hand. */}
            <nav aria-label="Pages" className="menu-pages">
              <Link href="/">Home</Link>
              <Link href="/about">About</Link>
              <a href="/contact" onClick={inquire}>
                Inquire
              </a>
              <a href="/resume.pdf">Résumé ↗</a>
              {contact.links
                .filter((link) => link.label !== "Résumé")
                .map((link) => (
                  <a key={link.label} href={link.href}>
                    {link.label} ↗
                  </a>
                ))}
            </nav>

            {/* The pointed-at project: its poster, its line, its role and year. */}
            <div aria-hidden className="menu-preview">
              <div className="menu-frame">
                {primed &&
                  projects.map((project) => {
                    const poster = (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={posters[project.slug]}
                        alt=""
                        className="menu-poster"
                        data-on={project.slug === shown}
                      />
                    );
                    // Only the chosen poster carries the film's name, and only
                    // while leaving, so no two things on the page share it.
                    return leaving === project.slug ? (
                      <ViewTransition
                        key={project.slug}
                        name={`film-${project.slug}`}
                        share="film-morph"
                        default="none"
                      >
                        {poster}
                      </ViewTransition>
                    ) : (
                      <Fragment key={project.slug}>{poster}</Fragment>
                    );
                  })}
              </div>
              <p className="menu-quote mt-5">{preview.quote}</p>
              <p className="label text-muted mt-2">
                {[preview.role, preview.year].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
        </div>

        <div className="menu-foot label text-muted">
          <span>© 2026 Harsha</span>
        </div>
      </dialog>
    </>
  );
}
