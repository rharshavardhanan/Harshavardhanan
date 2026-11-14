import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Anomaly } from "@/components/Anomaly";
import { demos } from "@/components/demos";
import { Film } from "@/components/Film";
import { Flow } from "@/components/Flow";
import { Laurel } from "@/components/Laurel";
import { Motion } from "@/components/Motion";
import { NextProject } from "@/components/NextProject";
import { proofs } from "@/components/proof";
import { ThemeSetter } from "@/components/ThemeSetter";
import { Torn } from "@/components/Torn";
import { project, projects } from "@/content/projects";
import { film } from "@/lib/media";

// One file makes all seven project pages. The [slug] folder name means the
// last part of the address (/work/odovox) is handed to this page as `slug`,
// and everything shown comes from content/projects.ts, lib/media.ts and the
// project's own proof file in components/proof/.
//
// It opens like a film poster, then gets down to the evidence:
//   1. the title and the credits, on the project's colour, torn along the bottom
//   2. the film, held behind them, revealed as they scroll away
//   3. the project's one line, word by word, over the film
//   4. the synopsis, with the figures set like festival laurels
//   5. the real product   6. the demo   7. the detail   8. the next project

type Props = { params: Promise<{ slug: string }> };

// Tells Next.js which pages to build ahead of time.
export function generateStaticParams() {
  return projects.map((item) => ({ slug: item.slug }));
}

// The browser tab title and search-result description for each page.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = project((await params).slug);
  if (!item) return {};
  const address = `/work/${item.slug}`;
  return {
    title: item.title,
    description: item.pitch,
    alternates: { canonical: address },
    openGraph: { title: item.title, description: item.pitch, url: address },
  };
}

// Problem, What I built, Result: a label on the left, the words large.
function Detail({
  id,
  title,
  text,
}: {
  id: string;
  title: string;
  text: string;
}) {
  return (
    <section
      aria-labelledby={id}
      className="border-line grid grid-cols-12 gap-x-4 gap-y-4 border-b py-12"
    >
      <h3 id={id} className="label text-muted col-span-12 lg:col-span-3">
        {title}
      </h3>
      <p
        data-lines
        className="text-h3 col-span-12 max-w-[36ch] font-serif lg:col-span-8"
      >
        {text}
      </p>
    </section>
  );
}

export default async function CaseStudy({ params }: Props) {
  const { slug } = await params;
  const item = project(slug);
  if (!item) notFound(); // any other address under /work/ is a 404

  const index = projects.indexOf(item);
  const next = projects[(index + 1) % projects.length];
  const Demo = demos[item.slug];
  const Proof = proofs[item.slug];
  const credits = [
    ["Role", item.role],
    ...(item.team ? [["Team", item.team]] : []),
    ["Built with", item.stack.join(" · ")],
    ...(item.year ? [["Year", item.year]] : []),
    ...(item.status ? [["Status", item.status]] : []),
  ];

  return (
    // data-theme here colours the page even with JavaScript off;
    // ThemeSetter then extends the theme to the whole window.
    <article
      data-theme={item.slug}
      data-tone={item.tone ?? "dark"}
      className="bg-bg text-fg"
    >
      <ThemeSetter theme={item.slug} />

      {/* 1–3. The poster. The film is held to the window behind the title,
          which scrolls away over it; then the quote is read out over the
          film. */}
      <div className="poster">
        <div className="poster-film">
          <Film slug={item.slug} film={film(item.slug)} title={item.title} />
        </div>

        <div className="poster-body">
          <header className="poster-title bg-bg">
            <p className="label text-muted">
              0{index + 1} / 0{projects.length}
            </p>
            <h1
              data-lines
              className="text-display mt-6 max-w-[16ch] font-serif"
            >
              {item.title}
            </h1>
            <dl className="credits label mt-12">
              {credits.map(([term, detail]) => (
                <div key={term}>
                  <dt className="text-muted">{term}</dt>
                  <dd className="mt-1">{detail}</dd>
                </div>
              ))}
            </dl>
            <p className="label text-muted mt-10 flex items-center">
              Scroll
              <Anomaly id={item.slug} />
            </p>
            <Torn seed={index * 7 + 3} side="bottom" />
          </header>

          <div className="poster-quote" data-words-track data-tone="media">
            <p data-words className="text-h2 font-serif">
              {item.quote}
            </p>
          </div>
        </div>
      </div>

      {/* 4. The synopsis, and the figures as laurels. */}
      <section
        aria-label="In short"
        className="synopsis bg-bg px-gutter grid grid-cols-12 gap-x-4 gap-y-20 pt-24 pb-32"
      >
        <Torn seed={index * 7 + 5} side="top" />
        <div className="col-span-12 lg:col-span-6">
          <p data-lines className="text-h3 max-w-[30ch] font-serif">
            {item.pitch}
          </p>
          {(item.live || item.repo) && (
            <p className="mt-12 flex flex-wrap gap-6">
              {item.live && (
                <a href={item.live} className="btn label">
                  Open the {(item.liveLabel ?? "live").toLowerCase()} ↗
                </a>
              )}
              {item.repo && (
                <a href={item.repo} className="btn label">
                  Code on GitHub ↗
                </a>
              )}
            </p>
          )}
        </div>
        <div className="col-span-12 grid gap-x-6 gap-y-12 sm:grid-cols-3 lg:col-span-6">
          {item.stats.map((stat) => (
            <Laurel key={stat.label} stat={stat} />
          ))}
        </div>
      </section>

      {/* 5. The real product: screens, recordings and charts. */}
      <section
        id="proof"
        aria-labelledby="proof-title"
        className="px-gutter space-y-32 py-24"
      >
        <h2 id="proof-title" className="text-h2">
          The real thing
        </h2>
        <Proof />
      </section>

      {/* 6. The demo, with room around it and no box. */}
      <section aria-labelledby="demo" className="px-gutter py-32">
        <h2 id="demo" data-lines className="text-h2">
          Try it
        </h2>
        <div className="mt-20">
          <Demo />
        </div>
      </section>

      {/* 7. The detail, for those who want it. */}
      <section aria-labelledby="detail" className="px-gutter py-32">
        <h2 id="detail" data-lines className="text-h2">
          The detail
        </h2>
        <div className="border-line mt-16 border-t">
          <Detail id="problem" title="Problem" text={item.problem} />
          <Detail id="built" title="What I built" text={item.built} />
          <Detail id="result" title="Result" text={item.result} />
        </div>
      </section>

      <section
        aria-labelledby="architecture"
        className="px-gutter grid grid-cols-12 gap-x-4 gap-y-12 pt-8 pb-40"
      >
        <h2
          id="architecture"
          data-lines
          className="text-h2 col-span-12 lg:col-span-5"
        >
          How it fits together
        </h2>
        <div className="col-span-12 lg:col-span-6 lg:col-start-7">
          <Flow steps={item.flow} />
        </div>
      </section>

      {/* What was hard, on the opposite colours, torn in and out. */}
      <section
        aria-labelledby="hard"
        // Inverted: paper on a dark project, ink on a light one.
        data-theme={item.tone === "light" ? "ink" : "neutral"}
        data-tone={item.tone === "light" ? "dark" : "light"}
        className="bg-bg text-fg px-gutter relative grid grid-cols-12 gap-x-4 gap-y-10 py-32 lg:py-44"
      >
        <Torn seed={index * 7 + 9} side="top" />
        <h2 id="hard" data-lines className="text-h2 col-span-12 lg:col-span-5">
          {item.slug === "road" ? "Where it broke" : "What was hard"}
        </h2>
        <div className="col-span-12 lg:col-span-7">
          {item.draft && (
            <p className="label border-fg mb-8 inline-block border px-2 py-1">
              Draft · Harsha to confirm
            </p>
          )}
          <p data-lines className="text-h3 max-w-[34ch] font-serif">
            {item.hard}
          </p>
        </div>
        <Torn seed={index * 7 + 11} side="bottom" />
      </section>

      {/* 8. The next project: its poster grows into its page. */}
      <NextProject
        slug={next.slug}
        title={next.title}
        poster={film(next.slug).poster}
      />
      <Motion />
    </article>
  );
}
