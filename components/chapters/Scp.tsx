import type { Project } from "@/content/projects";
import { ScpDemo } from "../demos/ScpDemo";
import { SectionPaint } from "../SectionPaint";
import { SyncedClips } from "../SyncedClips";
import { ChapterLabel, ChapterLinks, Stats } from "./parts";

// The same simulated task, same starting position (seed 230044), three ways.
// Recordings from the project repository, slowed to a quarter of real speed.
const SAME_START = [
  {
    src: "/media/real/scp-cheap.mp4",
    title: "Cheap policy alone",
    outcome: "Fails",
    good: false,
    note: "The small, fast policy reaches the cube but never pushes it home.",
  },
  {
    src: "/media/real/scp-arbitrated.mp4",
    title: "Cheap, with the monitor",
    outcome: "Succeeds",
    good: true,
    note: "The monitor’s score crosses its threshold, so control passes to the expert, which finishes the push.",
  },
  {
    src: "/media/real/scp-expert.mp4",
    title: "Expert alone",
    outcome: "Succeeds",
    good: true,
    note: "The large policy succeeds too, but uses the expensive model for every step.",
  },
];

// 02 · Sequential Conformal Prediction: a lab notebook. The title, then the
// same task three ways side by side, then the monitor itself at work on a
// LIBERO task (one run it flags, one it leaves alone), then the comparison
// that gets reported backwards, then the figures.
export function Scp({
  project,
  index,
  prev,
}: {
  project: Project;
  index: number;
  prev: string;
}) {
  return (
    <section
      id={project.slug}
      data-chapter={project.slug}
      data-zone={project.slug}
      data-theme={project.slug}
      data-tone="dark"
      aria-labelledby={`${project.slug}-title`}
      className="paint scroll-mt-8"
    >
      <SectionPaint prev={prev} />

      <div className="px-gutter grid grid-cols-12 gap-x-4 gap-y-10 pt-40 pb-24">
        <div className="col-span-12 lg:col-span-8">
          <ChapterLabel project={project} index={index} />
          <h2 id={`${project.slug}-title`} data-lines className="text-h2 mt-6">
            {project.title}
          </h2>
        </div>
        <div className="col-span-12 lg:col-span-4 lg:self-end">
          <p data-lines>{project.pitch}</p>
          <p className="label text-muted mt-6">{project.team}</p>
        </div>
      </div>

      <div className="px-gutter pb-32">
        <h3 className="label text-muted mb-8">
          One starting position, three ways · simulated, quarter speed
        </h3>
        <SyncedClips clips={SAME_START} />
        <p className="label text-muted mt-10 max-w-[70ch]">
          One seed is an anecdote. Over 500 seeds the monitor-triggered handover
          beat the cheap policy by 9 points, but did not beat handing over at
          random moments with the same expert budget.
        </p>
      </div>

      <div className="px-gutter grid grid-cols-12 gap-x-4 gap-y-12 pb-32">
        <div className="col-span-12 lg:col-span-4">
          <h3 data-lines className="text-h3 font-serif">
            The monitor, watching a robot in LIBERO
          </h3>
          <p className="text-muted mt-6 max-w-[38ch]">
            A frozen diffusion policy works a kitchen task. The tracking error
            (dark line) is checked against the threshold for the current stage
            (dashed). Press play, or drag through it.
          </p>
        </div>
        <div className="col-span-12 grid gap-x-6 gap-y-12 md:grid-cols-2 lg:col-span-8">
          <Watch
            src="/media/real/scp-monitor-fail.mp4"
            title="Flagged mid-episode"
            note="The error stays over the reach threshold and the arm stalls: violation, long before the episode ends."
          />
          <Watch
            src="/media/real/scp-monitor-safe.mp4"
            title="Left alone"
            note="A normal run crosses every stage under its threshold. No alarm."
          />
        </div>
      </div>

      <div className="px-gutter pb-32">
        <div className="mx-auto max-w-6xl">
          <ScpDemo />
        </div>
      </div>

      <div className="px-gutter pb-40">
        <Stats stats={project.stats} />
        <ChapterLinks project={project} className="mt-20" />
      </div>
    </section>
  );
}

// A recording with the browser's own controls. (Not a <figure>: the chapter's
// one figure is its demo.)
function Watch({
  src,
  title,
  note,
}: {
  src: string;
  title: string;
  note: string;
}) {
  return (
    <div>
      <video
        controls
        muted
        playsInline
        preload="metadata"
        aria-label={`${title}: ${note}`}
        className="aspect-[5/3] w-full rounded-lg bg-[#0b0b0b] object-contain"
      >
        <source src={src} type="video/mp4" />
      </video>
      <p className="label mt-4">{title}</p>
      <p className="text-muted mt-2">{note}</p>
    </div>
  );
}
