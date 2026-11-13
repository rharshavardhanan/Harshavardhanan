import { ArrowUpRight } from "@/components/ArrowUpRight";
import { ParticleStage } from "@/components/ParticleStage";
import { ThemeWatcher } from "@/components/ThemeWatcher";
import { projects } from "@/content/projects";

// The hero at the top is real. Below it is still the Phase 1 skeleton: Phase 3
// replaces the chapters with the real ones; Phase 5 replaces About and Contact.

const NAME = "Harshavardhanan";

// Each letter is its own box so it can rise on its own. Separate boxes lose the
// font's built-in tightening between certain pairs (A next to V), so it is put
// back here by hand: letter number -> how far to pull it left, in em. The
// values were measured from Instrument Serif itself; AV and VA are the big ones.
const KERN: Record<number, number> = {
  1: -0.016, // HA
  2: -0.01, // AR
  4: -0.006, // SH
  5: -0.016, // HA
  6: -0.068, // AV
  7: -0.068, // VA
  8: -0.01, // AR
  9: -0.012, // RD
  10: -0.01, // DH
  11: -0.016, // HA
  12: -0.01, // AN
  13: -0.02, // NA
  14: -0.01, // AN
};

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
      {/* The particle object stays on screen from here to the end of the last chapter. */}
      <div>
        <ParticleStage />
        <section
          data-hero
          className="px-gutter pt-6 pb-20 lg:flex lg:min-h-[calc(100svh-3.625rem)] lg:flex-col-reverse lg:justify-between lg:pt-[9svh] lg:pb-10"
        >
          {/* @container lets the name size itself from this box's width. */}
          <div className="@container">
            <h1 className="name" aria-label={NAME}>
              {[...NAME].map((letter, index) => (
                <span
                  key={index}
                  aria-hidden
                  style={
                    {
                      "--i": index,
                      marginLeft: KERN[index] ? `${KERN[index]}em` : undefined,
                    } as React.CSSProperties
                  }
                >
                  {letter}
                </span>
              ))}
            </h1>
          </div>
          <div className="mt-6 lg:mt-0 lg:max-w-[42%]">
            <p className="text-lead max-w-[34ch]">
              Software engineer &amp; founder. I build AI products end to end,
              from model to interface.
            </p>
            <p className="text-label border-line mt-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono">
              <span className="status-dot" />
              currently building Odovox
            </p>
          </div>
        </section>

        {/* One chapter per project. data-chapter is what selects the theme. */}
        <div id="work">
          {projects.map((project, index) => (
            <section
              key={project.slug}
              data-chapter={project.slug}
              aria-labelledby={project.slug}
              className="px-gutter grid min-h-[80vh] grid-cols-12 content-center gap-x-4 py-24"
            >
              <p
                aria-hidden
                className="text-label text-accent col-span-2 pt-[0.9em] font-mono md:pt-[1.6em]"
              >
                0{index + 1}
              </p>
              <div className="col-span-10 lg:col-span-5">
                <h2 id={project.slug} className="text-title">
                  {project.title}
                </h2>
                {project.role && (
                  <p className="text-label text-muted mt-3 font-mono">
                    {project.role}
                  </p>
                )}
                <p className="text-lead mt-8 max-w-[44ch]">{project.pitch}</p>
              </div>
            </section>
          ))}
        </div>
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
        <p className="text-label text-muted mt-24 font-mono">
          Phase 1 of 6: foundation. The hero, demos and case studies come next.
        </p>
      </section>
    </>
  );
}
