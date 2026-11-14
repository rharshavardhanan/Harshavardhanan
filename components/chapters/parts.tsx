import Link from "next/link";
import type { Project, Stat } from "@/content/projects";
import { Anomaly } from "../Anomaly";
import { ArrowUpRight } from "../ArrowUpRight";
import { CountUp } from "../CountUp";

// Pieces every chapter uses, so each chapter file only has to arrange them.

/** "01 · FOUNDER · 2026" plus that chapter's hidden anomaly. */
export function ChapterLabel({
  project,
  index,
  className = "",
}: {
  project: Project;
  index: number;
  className?: string;
}) {
  return (
    <p
      className={`label text-muted flex flex-wrap items-center gap-x-6 gap-y-2 ${className}`}
    >
      <span className="text-accent">0{index + 1}</span>
      <span>{[project.role, project.year].filter(Boolean).join(" · ")}</span>
      <Anomaly id={project.slug} />
    </p>
  );
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

/** A project's figures, very large, each with its label underneath. */
export function Stats({
  stats,
  className = "",
  vertical = false,
}: {
  stats: Stat[];
  className?: string;
  vertical?: boolean;
}) {
  return (
    <dl
      data-stats
      className={`grid gap-x-8 gap-y-12 ${vertical ? "" : "md:grid-cols-3"} ${className}`}
    >
      {stats.map((stat) => (
        // The label comes first for screen readers; flex-col-reverse shows
        // the figure on top.
        <div key={stat.label} className="flex flex-col-reverse justify-end">
          <dt className="label text-muted mt-4 max-w-[30ch]">{stat.label}</dt>
          <dd className="text-h2 font-serif tabular-nums">
            <Figure stat={stat} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** "Open case study →", and the live link if the project has one. */
export function ChapterLinks({
  project,
  className = "",
}: {
  project: Project;
  className?: string;
}) {
  return (
    <p className={`flex flex-wrap items-center gap-x-10 gap-y-4 ${className}`}>
      <Link href={`/work/${project.slug}`} className="btn label">
        Open case study
        <ArrowUpRight className="rotate-45" />
      </Link>
      {project.live && (
        <a href={project.live} className="label py-2">
          Live dashboard
          <ArrowUpRight />
        </a>
      )}
    </p>
  );
}
