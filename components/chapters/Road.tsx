import type { Project } from "@/content/projects";
import { media } from "@/lib/media";
import { RoadDemo } from "../demos/RoadDemo";
import { MediaView } from "../MediaView";
import { SectionPaint } from "../SectionPaint";
import { ChapterLabel, ChapterLinks, Stats } from "./parts";

// 02 · Road Damage: a real frame of the detector’s output fills the screen behind the
// title; below it the measured scores as one wide chart, and the two models
// compared on the scored clip.
export function Road({
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

      <div
        className="px-gutter relative isolate flex min-h-svh flex-col justify-end pt-40 pb-20"
        data-cursor="View"
        data-tone="media"
      >
        <MediaView
          media={media("road-detections.png", "road")}
          position="object-left"
          alt="A dashcam frame from an Indian road with the detector’s boxes drawn on two potholes"
          sizes="100vw"
          className="absolute inset-0 -z-10"
        />
        {/* Darkens the bottom-left, behind the title, and leaves the
            detection boxes on the right clear. */}
        <div
          aria-hidden
          className="from-bg via-bg/60 absolute inset-0 -z-10 bg-linear-to-tr from-10% via-35% to-transparent to-65%"
        />

        <ChapterLabel project={project} index={index} />
        <h2
          id={`${project.slug}-title`}
          data-lines
          className="text-h2 mt-6 max-w-[13ch]"
        >
          {project.title}
        </h2>
        <p data-lines className="mt-8 max-w-[44ch]">
          {project.pitch}
        </p>
      </div>

      <div className="px-gutter py-32">
        <RoadDemo />
      </div>

      <div className="px-gutter pb-40">
        <Stats stats={project.stats} />
        <ChapterLinks project={project} className="mt-20" />
      </div>
    </section>
  );
}
