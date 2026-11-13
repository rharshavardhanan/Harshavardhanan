import Image from "next/image";
import { bio, bioIsDraft, skills, spec, wins } from "@/content/about";
import { Anomaly } from "./Anomaly";

// Who Harsha is: portrait, a few sentences, the facts, the skills, the wins.
// All the words come from content/about.ts.
export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="pt-32">
      <div className="px-gutter grid grid-cols-12 gap-x-4 gap-y-12">
        {/* The portrait's paper is warmer than the page's, so it is shown as
            a print in a thin frame, not blended into the background. */}
        <figure className="col-span-12 sm:col-span-6 lg:col-span-4">
          <Image
            src="/media/portrait.avif"
            alt="Illustrated portrait of Harsha, arms folded, smiling"
            width={1122}
            height={1402}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
            className="border-line w-full border"
          />
        </figure>

        <div className="col-span-12 lg:col-span-7 lg:col-start-6">
          <h2 id="about-title" data-reveal className="text-title">
            About
          </h2>
          {bioIsDraft && (
            <p className="text-label border-fg mt-6 inline-block border px-2 py-0.5 font-mono">
              Draft · Harsha to rewrite
            </p>
          )}
          <div className="text-lead mt-6 max-w-[40ch] space-y-4">
            {bio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <dl className="text-label border-line mt-12 border-t font-mono">
            {spec.map(([term, detail]) => (
              <div
                key={term}
                className="border-line grid grid-cols-3 gap-x-4 border-b py-3"
              >
                <dt className="text-muted">{term}</dt>
                <dd className="col-span-2">{detail}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="col-span-12 mt-8">
          <h3 className="text-lead font-serif">
            Skills <Anomaly id="about" />
          </h3>
          <dl className="border-line mt-4 grid gap-x-4 border-t sm:grid-cols-2 lg:grid-cols-5">
            {skills.map(([group, items]) => (
              <div key={group} className="pt-4 pb-6">
                <dt className="text-label text-muted font-mono">{group}</dt>
                <dd className="mt-2">
                  <ul>
                    {items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* The wins scroll sideways for ever. The second copy only exists to
          make the loop seamless, so it is hidden from screen readers. */}
      <div className="marquee border-line text-lead mt-16 border-y py-4 font-serif">
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
