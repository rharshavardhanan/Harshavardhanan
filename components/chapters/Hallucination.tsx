import type { Project } from "@/content/projects";
import { media } from "@/lib/media";
import { HallucinationDemo } from "../demos/HallucinationDemo";
import { MediaView } from "../MediaView";
import { SectionPaint } from "../SectionPaint";
import { ChapterLabel, ChapterLinks, Stats } from "./parts";

// 05 · Hallucination Detection: the quiz is the section. One answer at a time,
// very large, in the middle; then the figures and the real ROC chart.
export function Hallucination({
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
      className="paint px-gutter scroll-mt-8 py-40"
    >
      <SectionPaint prev={prev} />

      <div className="grid grid-cols-12 gap-x-4 gap-y-8">
        <div className="col-span-12 lg:col-span-7">
          <ChapterLabel project={project} index={index} />
          <h2 id={`${project.slug}-title`} data-lines className="text-h2 mt-6">
            {project.title}
          </h2>
        </div>
        <p
          data-lines
          className="col-span-12 max-w-[34ch] self-end lg:col-span-4 lg:col-start-9"
        >
          {project.pitch}
        </p>
      </div>

      <div className="mx-auto mt-40 max-w-6xl">
        <HallucinationDemo />
      </div>

      <div className="mt-40 grid grid-cols-12 gap-x-4 gap-y-16">
        <Stats
          stats={project.stats}
          vertical
          className="col-span-12 lg:col-span-4"
        />
        <div
          className="col-span-12 lg:col-span-7 lg:col-start-6"
          data-cursor="View"
        >
          <MediaView
            media={media("halluc-roc.png", "hallucination")}
            alt="ROC curve of the LightGBM and CatBoost ensemble"
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="aspect-[4/3]"
          />
          <p className="label text-muted mt-4">ROC curve, held-out test set</p>
        </div>
      </div>
      <ChapterLinks project={project} className="mt-20" />
    </section>
  );
}
