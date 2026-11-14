import type { Project } from "@/content/projects";
import { media } from "@/lib/media";
import { OdovoxDemo } from "../demos/OdovoxDemo";
import { Frame } from "../Frame";
import { MediaView } from "../MediaView";
import { SectionPaint } from "../SectionPaint";
import { ChapterLabel, ChapterLinks, Stats } from "./parts";

// The three phone screens on the first screen: [file, description, size].
const PHONES = [
  [
    "odovox-verify.png",
    "Odovox review screen: tooth 36, fees, and an allergy conflict flagged on a medicine",
    "hidden w-[28%] translate-y-12 sm:block",
  ],
  [
    "odovox-queue.png",
    "Odovox today screen: money collected, the patient in the chair, and the checkout queue",
    "w-[70%] sm:w-[36%]",
  ],
  [
    "odovox-bill.png",
    "Odovox new prescription screen with dose, frequency and duration",
    "hidden w-[28%] translate-y-20 sm:block",
  ],
] as const;

// 01 · Odovox, the lead project, three screens long:
//   1. the name very large, the pitch, and three real phone screens that
//      straighten as they scroll in;
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
      data-tone="dark"
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
          {/* Three real screens of the app (it is a phone app): the day's
              queue in front, the review and a prescription behind it. */}
          <div
            data-tilt
            data-cursor="View"
            className="col-span-12 flex items-end justify-center gap-4 sm:gap-8 lg:col-span-8"
          >
            {PHONES.map(([file, alt, size]) => (
              <Frame key={file} kind="phone" className={size}>
                <MediaView
                  media={media(file, "odovox")}
                  alt={alt}
                  sizes="(min-width: 1024px) 20vw, 60vw"
                  inPhone
                  className="absolute inset-0"
                />
              </Frame>
            ))}
          </div>
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
