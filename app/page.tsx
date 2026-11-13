import { ArrowUpRight } from "@/components/ArrowUpRight";
import { ThemeWatcher } from "@/components/ThemeWatcher";
import { projects } from "@/content/projects";

// TEMPORARY SKELETON. It proves the tokens, typefaces and themes with real
// copy. Phase 2 replaces the top with the hero; Phase 3 replaces the chapters
// with the real ones; Phase 5 replaces About and Contact.

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
      <section className="px-gutter pt-[14vh] pb-40">
        <h1 className="text-display">Harshavardhanan</h1>
        <p className="text-lead mt-8 max-w-[34ch]">
          Software engineer &amp; founder. I build AI products end to end, from
          model to interface.
        </p>
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
            <div className="col-span-10 md:col-span-9">
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
