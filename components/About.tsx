import Image from "next/image";
import { bio, bioIsDraft, skills, spec, wins } from "@/content/about";
import { Anomaly } from "./Anomaly";

// Who Harsha is, on one screen: the portrait large on the left; on the right
// a few sentences in large type, the facts set like film credits, and the
// skills, one short line per group. All the words come from content/about.ts.
export function About() {
  const credits = [...spec, ["Awards", wins.join(" · ")]];

  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="px-gutter grid grid-cols-12 gap-x-4 gap-y-12 pt-24 pb-20 lg:gap-x-8 lg:min-h-svh lg:items-center lg:pt-16 lg:pb-14"
    >
      {/* The portrait's paper is warmer than the page's, so it is shown as
          a print. Hovering it makes its grain shift (see .portrait). */}
      <figure className="portrait col-span-12 sm:col-span-7 lg:col-span-4">
        <Image
          src="/media/portrait.avif"
          alt="Illustrated portrait of Harsha, arms folded, smiling"
          width={1122}
          height={1402}
          preload
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 58vw, 100vw"
          className="w-full lg:max-h-[78svh] lg:w-auto"
        />
      </figure>

      <div className="col-span-12 lg:col-span-8">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <h1 id="about-title" className="label text-muted">
            About
          </h1>
          {bioIsDraft && (
            <p className="label border-fg border px-2 py-1">
              Draft · Harsha to rewrite
            </p>
          )}
        </div>
        {/* The first and last lines large; anything between them at reading
            size, so the whole page still fits one screen. */}
        <div className="mt-5 space-y-4">
          {bio.map((paragraph, index) => (
            <p
              key={paragraph}
              className={
                index === 0 || index === bio.length - 1
                  ? "text-h3 max-w-[30ch] font-serif"
                  : "text-muted max-w-[72ch]"
              }
            >
              {paragraph}
            </p>
          ))}
        </div>

        <dl className="label border-line mt-6 grid gap-x-8 border-t sm:grid-cols-2">
          {credits.map(([term, detail]) => (
            <div
              key={term}
              className={`border-line grid grid-cols-[8rem_1fr] gap-x-4 border-b py-2.5 ${term === "Awards" ? "sm:col-span-2" : ""}`}
            >
              <dt className="text-muted">{term}</dt>
              <dd>{detail}</dd>
            </div>
          ))}
        </dl>

        <h2 className="label text-muted mt-6 flex items-center">
          Skills <Anomaly id="about" />
        </h2>
        <dl className="mt-3">
          {skills.map(([group, items]) => (
            <div
              key={group}
              className="grid grid-cols-[8rem_1fr] gap-x-4 py-1 max-sm:grid-cols-1"
            >
              <dt className="label text-muted pt-1">{group}</dt>
              <dd>{items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
