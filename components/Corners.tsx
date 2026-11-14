import Link from "next/link";
import { projects, type Slug } from "@/content/projects";
import { film } from "@/lib/media";
import { CornerStatus } from "./CornerStatus";
import { Inquire } from "./Inquire";
import { Menu } from "./Menu";
import { Sounds } from "./Sounds";

// The frame around every page: small capitals pinned to the four corners of
// the window, like the credits on a film print.
//
//   MENU · SOUND        HARSHAVARDHANAN        INQUIRE
//   (project name)      SELECTED WORK          03 / 07
//
// It has no colours of its own: components/Tone.tsx looks at what is under
// the top row and under the bottom row and makes each ink or paper to suit
// (see "Corners" in app/globals.css). The frame ignores the pointer except on
// its links, so it never blocks the page.
export function Corners() {
  // Each project's poster, for the menu to show behind its name.
  const posters = Object.fromEntries(
    projects.map((project) => [project.slug, film(project.slug).poster]),
  ) as Record<Slug, string>;

  return (
    <div className="corners label">
      <header className="corner-row corner-top">
        <div className="flex items-center gap-x-6">
          <Menu posters={posters} />
        </div>
        <Link href="/" className="corner-name">
          Harshavardhanan
        </Link>
        <div className="flex items-center gap-x-6 justify-self-end">
          {/* No room beside INQUIRE on a phone: there, About is a large
              line in the menu. */}
          <Link href="/about" className="inline-block py-2 max-sm:hidden">
            About
          </Link>
          <Inquire />
        </div>
      </header>
      <CornerStatus />
      <Sounds />
    </div>
  );
}
