import type { Project } from "@/content/projects";
import { media } from "@/lib/media";
import { OdovoxDemo } from "../demos/OdovoxDemo";
import { Frame } from "../Frame";
import { MediaView } from "../MediaView";
import { SectionPaint } from "../SectionPaint";
import { ChapterLabel, ChapterLinks, Stats } from "./parts";

// 01 · Odovox, the lead project, three screens long:
//   1. the name very large, the pitch, and the real queue board in a browser
//      frame that straightens as it scrolls in;
//   2. the Speak → Verify demo beside a recording of the real thing, which
//      stays on screen while the demo scrolls past;
//   3. the three figures across the full width.
export function Odovox({
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
      aria-labelledby={`${project.slug}-title`}
      className="paint scroll-mt-8"
    >
      <SectionPaint prev={prev} />

      <div className="px-gutter pt-40 pb-24">
        <ChapterLabel project={project} index={index} />
        <h2
          id={`${project.slug}-title`}
          data-lines
          className="text-display mt-8"
        >
          {project.title}
        </h2>
        <div className="mt-16 grid grid-cols-12 gap-x-4 gap-y-16">
          <p
            data-lines
            className="col-span-12 max-w-[38ch] lg:col-span-4 lg:pt-6"
          >
            {project.pitch}
          </p>
          <Frame
            kind="browser"
            tilt
            cursor="View"
            className="col-span-12 lg:col-span-8"
          >
            <MediaView
              media={media("odovox-queue.png", "odovox")}
              alt="Odovox live queue board: patients waiting, in the chair and at checkout"
              sizes="(min-width: 1024px) 64vw, 100vw"
              className="absolute inset-0"
            />
          </Frame>
        </div>
      </div>

      <div className="px-gutter grid grid-cols-12 gap-x-4 gap-y-16 py-24">
        <div className="col-span-12 lg:col-span-6">
          <OdovoxDemo />
        </div>
        <div className="col-span-12 lg:col-span-5 lg:col-start-8">
          <div className="lg:sticky lg:top-28">
            <Frame kind="laptop" cursor="Play">
              <MediaView
                media={media("odovox-record.mp4", "odovox")}
                alt="Recording: a doctor records a consultation and confirms the record"
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="absolute inset-0"
              />
            </Frame>
            <p className="label text-muted mt-6">
              The real product, in the demo clinic (fake patients only)
            </p>
          </div>
        </div>
      </div>

      <div className="px-gutter pt-24 pb-40">
        <Stats stats={project.stats} />
        <ChapterLinks project={project} className="mt-20" />
      </div>
    </section>
  );
}
