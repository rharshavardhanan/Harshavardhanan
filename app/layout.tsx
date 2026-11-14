import type { Metadata, Viewport } from "next";
import {
  Instrument_Serif,
  Inter_Tight,
  JetBrains_Mono,
} from "next/font/google";
import { Cursor } from "@/components/Cursor";
import { Corners } from "@/components/Corners";
import { Loader } from "@/components/Loader";
import { Magnet } from "@/components/Magnet";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Tone } from "@/components/Tone";
import { Wipe } from "@/components/Wipe";
import { PERSON, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
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
// Monospace now appears only inside the demos, so it is not preloaded.
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  preload: false,
});

// What search engines and link previews are told about the site. Pages can
// add to this (each case study sets its own title and description).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Harshavardhanan — Software engineer · AI & machine learning",
    template: "%s — Harshavardhanan",
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "Harshavardhanan — Software engineer · AI & machine learning",
    description: SITE_DESCRIPTION,
    url: "/",
    images: [{ url: "/media/og.png", width: 1200, height: 630, alt: "Harsha" }],
  },
  twitter: { card: "summary_large_image", images: ["/media/og.png"] },
};

export const viewport: Viewport = {
  themeColor: "#f4f2ee",
};

// The design direction, kept in the page source so any later edit can be
// checked against it. React cannot write an HTML comment directly, so it
// travels inside a hidden element.
const CONTRACT = `<!--
THESIS: Image-first and almost wordless at the front, every piece of evidence behind it. The home page is one screen, a WebGL ring of seven project films; each project page opens like a film poster, then shows the real product, a working demo and the detail.
OWN-WORLD: Each project's own colours; paper #F4F2EE and ink #0E0E0E for the shell. Instrument Serif large, Inter Tight for everything else, 14px credit-style capitals in the four corners. Torn paper edges, film grain, laurels. Monospace only inside demos.
STORY: The visitor turns the ring, opens a film, reads its one line, checks the real screens, operates the demo, reads where it broke, and writes to him through INQUIRE.
FIRST VIEWPORT: The ring of films, the middle one sharp and playing; the frame: MENU, SOUND, HARSHAVARDHANAN, INQUIRE, the project's name, SELECTED WORK, "01 / 07".
FORM: Pinned by the brief (docs/brief-v3.md), no roll. Key: brief-v3-pinned-2026-11-14.
FINISH: unreviewed and undocumented is unfinished; this build ends with the test suite, Lighthouse and DESIGN.md.
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON) }}
        />
        {/* Hidden above the window until a keyboard user tabs to it. */}
        <a
          href="#main"
          className="bg-fg label text-bg left-gutter fixed top-4 z-70 -translate-y-24 px-4 py-2 transition-transform duration-150 ease-out focus:translate-y-0"
        >
          Skip to content
        </a>
        <Corners />
        <Tone />
        <main id="main">{children}</main>
        <SmoothScroll />
        <Cursor />
        <Magnet />
        <Wipe />
      </body>
    </html>
  );
}
