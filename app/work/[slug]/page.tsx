import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CountUp } from "@/components/CountUp";
import { demos } from "@/components/demos";
import { Flow } from "@/components/Flow";
import { LoopVideo } from "@/components/LoopVideo";
import { Motion } from "@/components/Motion";
import { ThemeSetter } from "@/components/ThemeSetter";
import { project, projects, type Stat } from "@/content/projects";
import { proofs } from "@/components/proof";

// One file makes all five case-study pages. The [slug] folder name means the
// last part of the address (/work/odovox) is handed to this page as `slug`,
// and everything shown comes from content/projects.ts and lib/media.ts.

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

function Figure({ stat }: { stat: Stat }) {
  return stat.n === undefined ? (
    stat.text
  ) : (
    <CountUp
      n={stat.n}
      decimals={stat.decimals}
      prefix={stat.prefix}
      suffix={stat.suffix}
    />
  );
}

// Problem, What I built, Result: each a statement on the left and one of the
// project's figures, very large, on the right.
function Statement({
  id,
  title,
  text,
  stat,
}: {
  id: string;
  title: string;
  text: string;
  stat?: Stat;
}) {
  return (
    <section
      aria-labelledby={id}
      className="px-gutter grid grid-cols-12 gap-x-4 gap-y-10 py-20 lg:py-28"
    >
      <div className="col-span-12 lg:col-span-7">
        <h2 id={id} className="label text-muted">
          {title}
        </h2>
        <p data-lines className="text-h3 mt-6 max-w-[32ch] font-serif">
          {text}
        </p>
      </div>
      {stat && (
        <p className="col-span-12 lg:col-span-4 lg:col-start-9 lg:self-end">
          <span className="text-display block font-serif tabular-nums">
            <Figure stat={stat} />
          </span>
          <span className="label text-muted mt-4 block max-w-[28ch]">
            {stat.label}
          </span>
        </p>
      )}
    </section>
  );
}

export default async function CaseStudy({ params }: Props) {
  const { slug } = await params;
  const item = project(slug);
  if (!item) notFound(); // any other address under /work/ is a 404

  const next = projects[(projects.indexOf(item) + 1) % projects.length];
  const Demo = demos[item.slug];
  const Proof = proofs[item.slug];
  const meta = [
    ["Role", item.role],
    ...(item.team ? [["Team", item.team]] : []),
    ...(item.year ? [["Year", item.year]] : []),
    ["Stack", item.stack.join(" · ")],
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

      {/* 1. The project's video across the whole screen, title over it. */}
      <header
        className="px-gutter relative isolate flex min-h-svh flex-col justify-end pt-32 pb-14"
        data-cursor="Play"
      >
        <LoopVideo slug={item.slug} />
        <div
          aria-hidden
          className="from-bg via-bg/60 absolute inset-0 -z-10 bg-linear-to-t to-transparent"
        />
        <h1 data-lines className="text-display max-w-[14ch] font-serif">
          {item.title}
        </h1>
        <dl className="label mt-12 grid gap-x-12 gap-y-4 sm:grid-cols-2 lg:grid-cols-[auto_auto_auto_1fr]">
          {meta.map(([term, detail]) => (
            <div key={term}>
              <dt className="text-muted">{term}</dt>
              <dd className="mt-1">{detail}</dd>
            </div>
          ))}
        </dl>
      </header>

      {/* 2. The pitch, large. */}
      <p
        data-lines
        className="px-gutter text-h3 max-w-[30ch] py-32 font-serif lg:py-48"
      >
        {item.pitch}
      </p>

      {/* 3. The real product: screens, recordings and charts. */}
      <section
        id="proof"
        aria-labelledby="proof-title"
        className="px-gutter space-y-32 py-16"
      >
        <h2 id="proof-title" className="sr-only">
          The real product
        </h2>
        <Proof />
      </section>

      {/* 4. Problem, what I built, result, each with a figure. */}
      <Statement
        id="problem"
        title="Problem"
        text={item.problem}
        stat={item.stats[0]}
      />
      <Statement
        id="built"
        title="What I built"
        text={item.built}
        stat={item.stats[1]}
      />
      <Statement
        id="result"
        title="Result"
        text={item.result}
        stat={item.stats[2]}
      />
      {(item.live || item.repo) && (
        <p className="px-gutter flex flex-wrap gap-6 pb-16">
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

      {/* 5. How it fits together. */}
      <section
        aria-labelledby="architecture"
        className="px-gutter grid grid-cols-12 gap-x-4 gap-y-12 py-28"
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

      {/* 7. What was hard, on the opposite colours. */}
      <section
        aria-labelledby="hard"
        // Inverted: paper on a dark project, ink on a light one.
        data-theme={item.tone === "light" ? "ink" : "neutral"}
        data-tone={item.tone === "light" ? "dark" : "light"}
        className="bg-bg text-fg px-gutter grid grid-cols-12 gap-x-4 gap-y-10 py-32 lg:py-44"
      >
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
      </section>

      {/* 8. The demo, full size. */}
      <section aria-labelledby="demo" className="px-gutter py-32">
        <h2 id="demo" data-lines className="text-h2">
          Try it
        </h2>
        <div className="mx-auto mt-20 max-w-6xl">
          <Demo />
        </div>
      </section>

      {/* 9. The next project, very large, already wearing its colours. */}
      <Link
        href={`/work/${next.slug}`}
        data-theme={next.slug}
        data-tone={next.tone ?? "dark"}
        data-cursor="View"
        className="bg-bg text-fg px-gutter group flex min-h-[80svh] flex-col justify-end pt-32 pb-20 no-underline"
      >
        <span className="label text-muted">Next project</span>
        <span className="text-display mt-6 block max-w-[14ch] font-serif transition-transform duration-700 ease-[var(--ease-out)] group-hover:translate-x-4 motion-reduce:transition-none">
          {next.title} →
        </span>
      </Link>
      <Motion />
    </article>
  );
}
