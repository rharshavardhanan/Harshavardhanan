import type { Project } from "@/content/projects";
import { KattralDemo } from "../demos/KattralDemo";
import { SectionPaint } from "../SectionPaint";
import { ChapterLabel, ChapterLinks, Stats } from "./parts";

// 03 · Kattral Academy: one row of three panels that slides sideways while the
// section stays put (on wide screens; it stacks everywhere else). Zerofence
// has not allowed screenshots of the product, so the demo carries it.
export function Kattral({
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

      <div className="strip-wrap">
        <div data-strip className="strip px-gutter flex flex-col gap-24 py-40">
          <div>
            <ChapterLabel project={project} index={index} />
            <h2
              id={`${project.slug}-title`}
              data-lines
              className="text-h2 mt-6"
            >
              {project.title}
            </h2>
            <p data-lines className="mt-8 max-w-[40ch]">
              {project.pitch}
            </p>
          </div>
          <div>
            <KattralDemo />
          </div>
          <div>
            <Stats stats={project.stats} vertical />
            <p className="label text-muted mt-12 max-w-[44ch]">
              Built at Zerofence. The product belongs to them, so its screens
              are not shown here.
            </p>
            <ChapterLinks project={project} className="mt-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
