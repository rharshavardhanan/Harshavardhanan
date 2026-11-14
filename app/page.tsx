import Image from "next/image";
import Link from "next/link";
import { Ring, type RingItem } from "@/components/ring/Ring";
import { projects } from "@/content/projects";
import { film } from "@/lib/media";

// The home page: one screen, the seven projects as a ring of films
// (components/ring/). Underneath the ring is this plain list of links, one per
// project, with its poster and name; it is what you get without JavaScript or
// with reduced motion, and what keyboards and screen readers use always.
export default function Home() {
  const items: RingItem[] = projects.map((project) => ({
    slug: project.slug,
    title: project.title,
    tone: project.tone ?? "dark",
    ...film(project.slug),
  }));

  return (
    <Ring items={items}>
      <h1 className="sr-only">Harshavardhanan: selected work</h1>
      <ol id="projects" className="reel">
        {items.map((item, index) => (
          <li key={item.slug} data-theme={item.slug} data-tone={item.tone}>
            <Link
              href={`/work/${item.slug}`}
              data-ring-link={index}
              className="reel-item bg-bg text-fg"
            >
              <Image
                src={item.poster}
                alt=""
                width={1280}
                height={720}
                unoptimized
                preload={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                sizes="(min-width: 768px) 60vw, 100vw"
                className="reel-poster"
              />
              <span className="reel-caption">
                <span className="label">0{index + 1}</span>
                <span className="text-h2 block font-serif">{item.title}</span>
                {item.ai && (
                  <span className="label text-muted">AI-generated film</span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </Ring>
  );
}
