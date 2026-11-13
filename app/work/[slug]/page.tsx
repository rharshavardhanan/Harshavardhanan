import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "@/components/ArrowUpRight";
import { CountUp } from "@/components/CountUp";
import { demos } from "@/components/demos";
import { Flow } from "@/components/Flow";
import { LoopVideo } from "@/components/LoopVideo";
import { ThemeSetter } from "@/components/ThemeSetter";
import { project, projects } from "@/content/projects";

// One file makes all five case-study pages. The [slug] folder name means the
// last part of the address (/work/odovox) is handed to this page as `slug`,
// and everything shown comes from content/projects.ts.

type Props = { params: Promise<{ slug: string }> };

// Tells Next.js which pages to build ahead of time.
export function generateStaticParams() {
  return projects.map((item) => ({ slug: item.slug }));
}

// The browser tab title and search-result description for each page.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = project((await params).slug);
  return item ? { title: item.title, description: item.pitch } : {};
}

// One titled part of the page: heading on the left, content on the right.
function Block({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="px-gutter border-line grid grid-cols-12 gap-x-4 gap-y-6 border-t py-16 lg:py-24"
    >
      <h2 id={id} data-reveal className="text-title col-span-12 lg:col-span-4">
        {title}
      </h2>
      <div className="col-span-12 lg:col-span-8">{children}</div>
    </section>
  );
}

export default async function CaseStudy({ params }: Props) {
  const { slug } = await params;
  const item = project(slug);
  if (!item) notFound(); // any other address under /work/ is a 404

  const next = projects[(projects.indexOf(item) + 1) % projects.length];
  const Demo = demos[item.slug];
  const meta = [
    ["Role", item.role],
    ...(item.year ? [["Year", item.year]] : []),
    ["Stack", item.stack.join(" · ")],
  ];

  return (
    // data-theme here colours the page even with JavaScript off;
    // ThemeSetter then extends the theme to the whole window.
    <article data-theme={item.slug} className="bg-bg text-fg">
      <ThemeSetter theme={item.slug} />

      <header className="px-gutter relative isolate flex min-h-[calc(100svh-3.625rem)] flex-col justify-end pt-[45svh] pb-12 lg:pt-24">
        <LoopVideo slug={item.slug} />
        <h1 className="text-display max-w-[14ch] font-serif">{item.title}</h1>
        <p className="text-lead mt-6 max-w-[40ch]">{item.pitch}</p>
        <dl className="text-label border-line mt-10 grid gap-x-8 gap-y-3 border-t pt-4 font-mono sm:grid-cols-[auto_auto_1fr]">
          {meta.map(([term, detail]) => (
            <div key={term}>
              <dt className="text-muted">{term}</dt>
              <dd>{detail}</dd>
            </div>
          ))}
        </dl>
      </header>

      <Block id="problem" title="Problem">
        <p className="text-lead max-w-[46ch]">{item.problem}</p>
      </Block>

      <Block id="built" title="What I built">
        <p className="text-lead max-w-[46ch]">{item.built}</p>
      </Block>

      <Block id="result" title="Result">
        <p className="text-lead max-w-[46ch]">{item.result}</p>
        <dl className="border-line mt-10 grid gap-x-6 border-t sm:grid-cols-3">
          {item.stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col-reverse justify-end pt-4 pb-2"
            >
              <dt className="text-label text-muted mt-1 font-mono">
                {stat.label}
              </dt>
              <dd className="stat">
                {stat.n === undefined ? (
                  stat.text
                ) : (
                  <CountUp
                    n={stat.n}
                    decimals={stat.decimals}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                )}
              </dd>
            </div>
          ))}
        </dl>
        {item.live && (
          <p className="mt-8">
            <a href={item.live} className="btn">
              Open the live dashboard
              <ArrowUpRight />
            </a>
          </p>
        )}
      </Block>

      <Block id="architecture" title="How it fits together">
        <Flow steps={item.flow} />
      </Block>

      <Block
        id="hard"
        title={item.slug === "road" ? "Where it broke" : "What was hard"}
      >
        {item.draft && (
          <p className="text-label border-accent text-accent mb-4 inline-block border px-2 py-0.5 font-mono">
            Draft · Harsha to confirm
          </p>
        )}
        <p className="text-lead max-w-[46ch]">{item.hard}</p>
      </Block>

      <Block id="demo" title="Try it">
        <Demo />
      </Block>

      {/* The link to the next project already wears that project's colours. */}
      <Link
        href={`/work/${next.slug}`}
        data-theme={next.slug}
        className="bg-bg text-fg px-gutter group block py-24 no-underline lg:py-32"
      >
        <span className="text-label text-muted font-mono">Next project</span>
        <span className="text-display mt-4 block max-w-[16ch] font-serif">
          {next.title}
          <ArrowUpRight className="rotate-45 transition-transform duration-300 ease-out group-hover:translate-x-3 motion-reduce:transition-none" />
        </span>
      </Link>
    </article>
  );
}
