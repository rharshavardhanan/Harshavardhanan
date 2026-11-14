import type { Project } from "@/content/projects";
import { media } from "@/lib/media";
import { AftermeetDemo } from "../demos/AftermeetDemo";
import { Frame } from "../Frame";
import { MediaView } from "../MediaView";
import { SectionPaint } from "../SectionPaint";
import { ChapterLabel, ChapterLinks, Stats } from "./parts";

// 03 · Aftermeet, laid out like a dossier on its own warm paper (the one light
// project): the facts stay pinned in a narrow column on the left while the
// material scrolls past on the right — the live site, the workspace, the
// demo, the phone and the extension.
export function Aftermeet({
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
      data-tone="light"
      aria-labelledby={`${project.slug}-title`}
      className="paint px-gutter grid scroll-mt-8 grid-cols-12 gap-x-4 gap-y-16 pt-40 pb-40"
    >
      <SectionPaint prev={prev} />

      {/* The facts, pinned while the material scrolls. */}
      <div className="col-span-12 lg:col-span-4">
        <div className="lg:sticky lg:top-28">
          <ChapterLabel project={project} index={index} />
          <h2 id={`${project.slug}-title`} data-lines className="text-h2 mt-6">
            {project.title}
          </h2>
          <p data-lines className="mt-8 max-w-[36ch]">
            {project.pitch}
          </p>
          <ChapterLinks project={project} className="mt-10" />
        </div>
      </div>

      <div className="col-span-12 space-y-28 lg:col-span-7 lg:col-start-6">
        <div>
          <Frame kind="browser" tilt cursor="View">
            <MediaView
              media={media("aftermeet-landing.png", "aftermeet")}
              alt="Aftermeet’s landing page: Turn meetings into execution"
              sizes="(min-width: 1024px) 56vw, 100vw"
              position="object-top"
              className="absolute inset-0"
            />
          </Frame>
          <p className="label text-muted mt-5">The live site</p>
        </div>

        <div data-cursor="View">
          <MediaView
            media={media("aftermeet-workspace.png", "aftermeet")}
            alt="Aftermeet’s workspace: the transcript, the AI output and the tasks side by side"
            sizes="(min-width: 1024px) 56vw, 100vw"
            className="aspect-[1600/576] rounded-xl"
          />
          <p className="label text-muted mt-5">
            One meeting, laid out: transcript, output, tasks. (Illustration from
            the landing page.)
          </p>
        </div>

        <AftermeetDemo />

        <div className="grid items-end gap-x-10 gap-y-12 sm:grid-cols-[2fr_3fr]">
          <div>
            <Frame kind="phone" cursor="View">
              <MediaView
                media={media("aftermeet-mobile.png", "aftermeet")}
                alt="Aftermeet on a phone"
                sizes="20rem"
                inPhone
                className="absolute inset-0"
              />
            </Frame>
            <p className="label text-muted mt-5">
              On a phone (the Android shell loads the same app)
            </p>
          </div>
          <div data-cursor="View">
            <MediaView
              media={media("aftermeet-extension.png", "aftermeet")}
              alt="Aftermeet’s Chrome extension panel in a Google Meet call, writing live tasks"
              sizes="(min-width: 1024px) 34vw, 100vw"
              className="aspect-[800/520] rounded-xl"
            />
            <p className="label text-muted mt-5">
              The Chrome extension, inside a call. (Illustration from the
              landing page.)
            </p>
          </div>
        </div>
      </div>

      <div className="col-span-12 pt-16">
        <Stats stats={project.stats} />
      </div>
    </section>
  );
}
