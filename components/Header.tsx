import Link from "next/link";
import { ArrowUpRight } from "./ArrowUpRight";
import { Clock } from "./Clock";

// These jump to sections of the home page. The leading slash makes them work
// from the case-study pages too.
const sections = [
  { label: "Work", href: "/#work" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

export function Header() {
  return (
    <header className="px-gutter text-label flex flex-wrap items-baseline justify-between gap-x-8 py-3 font-mono">
      <p className="text-muted">
        <Link href="/" className="text-fg inline-block py-2">
          H.R.
        </Link>{" "}
        · Chennai · <Clock />
      </p>
      <nav aria-label="Primary">
        <ul className="flex gap-x-6">
          {sections.map((section) => (
            <li key={section.href}>
              <a href={section.href} className="inline-block py-2">
                {section.label}
              </a>
            </li>
          ))}
          <li>
            <a href="/resume.pdf" className="inline-block py-2">
              Résumé
              <ArrowUpRight />
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
