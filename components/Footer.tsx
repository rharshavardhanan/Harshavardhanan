import { AnomalyCount } from "./Anomaly";
import { Sound } from "./Sound";

// The end of every page, in the inverted neutral colours (paper on ink).
// The big line is sized from its container, like the name in the hero.
export function Footer() {
  return (
    <footer data-theme="ink" className="bg-bg text-fg px-gutter pt-24 pb-8">
      <div className="@container">
        <p
          data-reveal
          aria-label="Let’s build"
          className="lets-build font-serif"
        >
          <span aria-hidden>Let’s build</span>
        </p>
      </div>
      <div className="text-label text-muted border-line mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-t pt-4 font-mono">
        <AnomalyCount />
        <Sound />
        <span>© 2026 · designed &amp; built by Harsha</span>
      </div>
    </footer>
  );
}
