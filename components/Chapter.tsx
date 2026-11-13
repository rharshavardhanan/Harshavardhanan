import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/content/projects";
import { Anomaly } from "./Anomaly";
import { ArrowUpRight } from "./ArrowUpRight";
import { CountUp } from "./CountUp";
import { demos } from "./demos";

// One project on the home page. Every chapter has the same layout:
// title, role, pitch, three figures, a demo, and a link to the case study.
// data-chapter is what turns the whole page into this project's colours.
export function Chapter({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const Demo = demos[project.slug];

  return (
    <section
      id={project.slug}
      data-chapter={project.slug}
      aria-labelledby={`${project.slug}-title`}
      className="px-gutter grid scroll-mt-8 grid-cols-12 gap-x-4 py-28 lg:min-h-svh lg:content-center"
    >
      <p
        aria-hidden
        className="text-label text-accent col-span-12 mb-4 font-mono lg:col-span-1 lg:pt-[1.6em]"
      >
        0{index + 1}
      </p>

      <div className="col-span-12 lg:col-span-6">
        {/* Phones and tablets get a still picture; wide screens have the live
            particle object to the right instead. */}
        <Image
          src={`/media/cover-${project.slug}.avif`}
          alt=""
          width={1280}
          height={720}
          sizes="100vw"
          className="mb-8 aspect-video w-full object-cover lg:hidden"
        />

        <h2 id={`${project.slug}-title`} data-reveal className="text-title">
          {project.title}
        </h2>
        <p className="text-label text-muted mt-3 font-mono">
          {[project.role, project.year].filter(Boolean).join(" · ")}
          <Anomaly id={project.slug} />
        </p>
        <p data-reveal className="text-lead mt-8 max-w-[44ch]">
          {project.pitch}
        </p>

        <dl className="border-line mt-10 grid gap-x-6 border-t sm:grid-cols-3">
          {project.stats.map((stat) => (
            // The label comes first for screen readers; flex-col-reverse shows
            // the figure on top.
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

        <div className="mt-12">
          <Demo />
        </div>

        <p className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link href={`/work/${project.slug}`} className="btn">
            Open case study
            <ArrowUpRight className="rotate-45" />
          </Link>
          {project.live && (
            <a href={project.live} className="text-label py-2 font-mono">
              Live dashboard
              <ArrowUpRight />
            </a>
          )}
        </p>
      </div>
    </section>
  );
}
