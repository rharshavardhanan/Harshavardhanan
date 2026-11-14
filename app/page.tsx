import { About } from "@/components/About";
import { Aftermeet } from "@/components/chapters/Aftermeet";
import { Cache } from "@/components/chapters/Cache";
import { Hallucination } from "@/components/chapters/Hallucination";
import { Kattral } from "@/components/chapters/Kattral";
import { Odovox } from "@/components/chapters/Odovox";
import { Road } from "@/components/chapters/Road";
import { Scp } from "@/components/chapters/Scp";
import { Contact } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import { Motion } from "@/components/Motion";
import { ParticleStage } from "@/components/ParticleStage";
import { ThemeWatcher } from "@/components/ThemeWatcher";
import { WorkIndex } from "@/components/WorkIndex";
import { projects } from "@/content/projects";
import { previews } from "@/lib/media";

// The home page, top to bottom. Each part is its own file in components/.

const CHAPTERS = {
  odovox: Odovox,
  scp: Scp,
  aftermeet: Aftermeet,
  road: Road,
  kattral: Kattral,
  cache: Cache,
  hallucination: Hallucination,
};

export default function Home() {
  return (
    <>
      <ThemeWatcher />

      {/* The particle object stays on screen from the hero to the end of the
          last chapter, so everything it accompanies sits in this one box. */}
      <div>
        <ParticleStage />
        <Hero />
        <WorkIndex media={previews()} />
        {projects.map((project, index) => {
          // Each project has its own chapter layout, in components/chapters/.
          const Chapter = CHAPTERS[project.slug];
          const prev = index === 0 ? "neutral" : projects[index - 1].slug;
          return (
            <Chapter
              key={project.slug}
              project={project}
              index={index}
              prev={prev}
            />
          );
        })}
      </div>

      {/* PLACEHOLDER, as the brief asks: other projects go here later. */}
      <section
        aria-labelledby="more-title"
        className="px-gutter border-line grid grid-cols-12 gap-x-4 gap-y-4 border-b pt-32 pb-16"
      >
        <h2
          id="more-title"
          className="text-h3 col-span-12 font-serif lg:col-span-4"
        >
          More work
        </h2>
        <p className="label text-muted col-span-12 font-mono lg:col-span-8">
          Other projects will be listed here.
        </p>
      </section>

      <About />
      <Contact />
      <Motion />
    </>
  );
}
