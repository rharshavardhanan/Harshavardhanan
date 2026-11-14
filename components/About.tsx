import Image from "next/image";
import { bio, bioIsDraft, skills, spec, wins } from "@/content/about";
import { Anomaly } from "./Anomaly";

// Who Harsha is: a large portrait, a few sentences, the facts, the skills as
// big lines, and the wins scrolling past. All the words come from
// content/about.ts.
export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="pt-32 pb-24">
      <div className="px-gutter grid grid-cols-12 gap-x-4 gap-y-16">
        {/* The portrait's paper is warmer than the page's, so it is shown as
            a print. Hovering it makes its grain shift (see .portrait). */}
        <figure className="portrait col-span-12 sm:col-span-8 lg:col-span-5">
          <Image
            src="/media/portrait.avif"
            alt="Illustrated portrait of Harsha, arms folded, smiling"
            width={1122}
            height={1402}
            sizes="(min-width: 1024px) 40vw, (min-width: 640px) 66vw, 100vw"
            className="w-full"
          />
        </figure>

        <div className="col-span-12 lg:col-span-6 lg:col-start-7">
          <h1 id="about-title" data-lines className="text-h2">
            About
          </h1>
          {bioIsDraft && (
            <p className="label border-fg mt-8 inline-block border px-2 py-1">
              Draft · Harsha to rewrite
            </p>
          )}
          <div className="text-h3 mt-8 space-y-6 font-serif">
            {bio.map((paragraph) => (
              <p key={paragraph} data-lines>
                {paragraph}
              </p>
            ))}
          </div>

          <dl className="label border-line mt-16 border-t">
            {spec.map(([term, detail]) => (
              <div
                key={term}
                className="border-line grid grid-cols-3 gap-x-4 border-b py-4"
              >
                <dt className="text-muted">{term}</dt>
                <dd className="col-span-2">{detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Skills: one line per group, in large type. */}
      <div className="px-gutter mt-40">
        <h2 className="label text-muted flex items-center font-sans">
          Skills <Anomaly id="about" />
        </h2>
        <dl className="mt-10">
          {skills.map(([group, items]) => (
            <div
              key={group}
              className="border-line grid grid-cols-12 gap-x-4 gap-y-2 border-t py-6 last:border-b"
            >
              <dt className="label text-muted col-span-12 pt-3 lg:col-span-3">
                {group}
              </dt>
              <dd
                data-lines
                className="text-h3 col-span-12 font-serif lg:col-span-9"
              >
                {items.join(", ")}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* The wins scroll sideways for ever. The second copy only exists to
          make the loop seamless, so it is hidden from screen readers. */}
      <div className="marquee text-h2 mt-32 py-6 font-serif">
        {[false, true].map((copy) => (
          <ul key={String(copy)} aria-hidden={copy || undefined}>
            {[...wins, ...wins].map((win, index) => (
              <li key={index}>{win}</li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
