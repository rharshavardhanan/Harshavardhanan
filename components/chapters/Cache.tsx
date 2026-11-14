import type { Project } from "@/content/projects";
import { media } from "@/lib/media";
import { CacheDemo } from "../demos/CacheDemo";
import { Frame } from "../Frame";
import { MediaView } from "../MediaView";
import { SectionPaint } from "../SectionPaint";
import { ChapterLabel, ChapterLinks, Stats } from "./parts";

// 04 · Edge Cache RL, centred on its demo: three hit rates racing, then the
// real dashboard recording in a laptop frame.
export function Cache({
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
      className="paint px-gutter scroll-mt-8 py-40 text-center"
    >
      <SectionPaint prev={prev} />

      <ChapterLabel
        project={project}
        index={index}
        className="justify-center"
      />
      <h2 id={`${project.slug}-title`} data-lines className="text-display mt-8">
        {project.title}
      </h2>
      <p data-lines className="mx-auto mt-8 max-w-[36ch]">
        {project.pitch}
      </p>

      <div className="mx-auto mt-32 max-w-6xl">
        <CacheDemo />
      </div>

      <Frame kind="laptop" cursor="Play" className="mx-auto mt-40 max-w-5xl">
        <MediaView
          media={media("cache-dashboard.mp4", "cache")}
          alt="Recording: the Edge Cache RL dashboard running and comparing policies"
          sizes="(min-width: 1024px) 64rem, 100vw"
          className="absolute inset-0"
        />
      </Frame>
      <p className="label text-muted mx-auto mt-6 max-w-[60ch]">
        A 10-second live run of the real dashboard. On this short run all four
        policies happen to tie.
      </p>

      <Stats stats={project.stats} className="mt-40 text-left" />
      <ChapterLinks project={project} className="mt-20 justify-center" />
    </section>
  );
}
