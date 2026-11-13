import { ArrowUpRight } from "@/components/ArrowUpRight";
import { Chapter } from "@/components/Chapter";
import { Hero } from "@/components/Hero";
import { ParticleStage } from "@/components/ParticleStage";
import { ThemeWatcher } from "@/components/ThemeWatcher";
import { WorkIndex } from "@/components/WorkIndex";
import { projects } from "@/content/projects";

// The home page, top to bottom. Each part is its own file in components/.

const facts = [
  ["Based in", "Chennai, India"],
  ["Studying", "B.Tech CSE (AI & Robotics), VIT Chennai, 2023–27"],
  ["Now", "Founder, Odovox"],
  ["Previously", "Software Developer, Zerofence"],
];

const links = [
  { label: "Email", href: "mailto:harshavardhananrajasimhan@gmail.com" },
  { label: "GitHub", href: "https://github.com/rharshavardhanan" },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/harshavardhanan-rajasimhan",
  },
];

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

      <section
        id="about"
        aria-labelledby="about-title"
        className="px-gutter grid grid-cols-12 gap-x-4 gap-y-10 pt-40 pb-24"
      >
        <h2 id="about-title" className="text-title col-span-12 md:col-span-5">
          About
        </h2>
        <dl className="text-label border-line col-span-12 border-t font-mono md:col-span-7">
          {facts.map(([term, detail]) => (
            <div
              key={term}
              className="border-line grid grid-cols-3 gap-x-4 border-b py-3"
            >
              <dt className="text-muted">{term}</dt>
              <dd className="col-span-2">{detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        id="contact"
        aria-labelledby="contact-title"
        className="px-gutter pt-24 pb-16"
      >
        <h2 id="contact-title" className="text-title max-w-[14ch]">
          Have a hard problem? <em>Let’s build it.</em>
        </h2>
        <ul className="text-label mt-10 flex flex-wrap gap-x-8 gap-y-2 font-mono">
          {links.map((link) => (
            <li key={link.label}>
              <a href={link.href} className="inline-block py-2">
                {link.label}
                {link.href.startsWith("http") && <ArrowUpRight />}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
