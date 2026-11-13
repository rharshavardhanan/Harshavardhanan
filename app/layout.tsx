import type { Metadata, Viewport } from "next";
import {
  Instrument_Serif,
  Inter_Tight,
  JetBrains_Mono,
} from "next/font/google";
import { Cursor } from "@/components/Cursor";
import { Header } from "@/components/Header";
import { Loader } from "@/components/Loader";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";

// next/font downloads each typeface at build time and serves it from this
// site, so there is no request to Google when someone visits. `variable` is
// the CSS variable name that app/globals.css reads.
const serif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
});
const sans = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Harshavardhanan — Software engineer & founder",
    template: "%s — Harshavardhanan",
  },
  description:
    "Portfolio of Harshavardhanan Rajasimhan, software engineer and founder in Chennai. He builds AI products end to end: Odovox, road-damage detection, live classrooms, RL caching and hallucination detection.",
};

export const viewport: Viewport = {
  themeColor: "#f4f2ee",
};

// The design direction, kept in the page source so any later edit can be
// checked against it. React cannot write an HTML comment directly, so it
// travels inside a hidden element.
const CONTRACT = `<!--
THESIS: A quiet editorial shell about one engineer; each project takes the whole page over with its own colour world and a working miniature. Refuses the grid of same-size project cards.
OWN-WORLD: Paper #F4F2EE ground, ink #0E0E0E type, hairlines, film grain. Instrument Serif display, Inter Tight body, JetBrains Mono for labels and numbers. Five dark project worlds, each one background and one accent, reached by scrolling.
STORY: The visitor reads who he is, scrolls through five projects that each change the room, operates a demo, opens a case study, and writes to him.
FIRST VIEWPORT: The full name in giant serif at left; subtitle beneath; a calm particle object at right; header with H.R., Chennai clock, Work / About / Contact, Resume; status pill "currently building Odovox".
FORM: Pinned by the brief (docs/brief.md, v2), no roll. Key: brief-v2-pinned-2026-11-12.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: the loader's script marks <html> before React
    // starts, and this tells React that is expected.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="text-body font-sans antialiased">
        <Loader />
        <div hidden dangerouslySetInnerHTML={{ __html: CONTRACT }} />
        {/* Hidden above the window until a keyboard user tabs to it. */}
        <a
          href="#main"
          className="bg-fg text-label text-bg left-gutter fixed top-4 z-70 -translate-y-24 px-4 py-2 font-mono transition-transform duration-150 ease-out focus:translate-y-0"
        >
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <SmoothScroll />
        <Cursor />
      </body>
    </html>
  );
}
