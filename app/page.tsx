import { About } from "@/components/About";
import { Chapter } from "@/components/Chapter";
import { Contact } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import { ParticleStage } from "@/components/ParticleStage";
import { ThemeWatcher } from "@/components/ThemeWatcher";
import { WorkIndex } from "@/components/WorkIndex";
import { projects } from "@/content/projects";

// The home page, top to bottom. Each part is its own file in components/.
export default function Home() {
  return (
    <>
      <ThemeWatcher />

      {/* The particle object stays on screen from the hero to the end of the
          last chapter, so everything it accompanies sits in this one box. */}
      <div>
        <ParticleStage />
        <Hero />
        <WorkIndex />
        {projects.map((project, index) => (
          <Chapter key={project.slug} project={project} index={index} />
        ))}
      </div>

      {/* PLACEHOLDER, as the brief asks: other projects go here later. */}
      <section
        aria-labelledby="more-title"
        className="px-gutter border-line grid grid-cols-12 gap-x-4 gap-y-4 border-b pt-32 pb-16"
      >
        <h2
          id="more-title"
          className="text-lead col-span-12 font-serif lg:col-span-4"
        >
          More work
        </h2>
        <p className="text-label text-muted col-span-12 font-mono lg:col-span-8">
          Other projects will be listed here.
        </p>
      </section>

      <About />
      <Contact />
    </>
  );
}
