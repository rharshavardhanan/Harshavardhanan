import { tornPath } from "@/lib/torn";

// A torn paper edge in the colour of the section it belongs to (text-bg makes
// "currentColor" the section's background). `side="bottom"` hangs it below
// the section, ragged side down; `side="top"` sits it above the section,
// ragged side up. Scrolling fast stretches it a little (data-edge, see
// components/Motion.tsx). It is decoration, so screen readers skip it.
export function Torn({
  seed,
  side,
}: {
  seed: number;
  side: "top" | "bottom";
}) {
  return (
    <svg
      aria-hidden
      data-edge
      viewBox="0 0 1440 60"
      preserveAspectRatio="none"
      className={`torn text-bg ${side === "top" ? "torn-top" : "torn-bottom"}`}
    >
      <path
        d={tornPath(seed)}
        fill="currentColor"
        // Upside down for a top edge: solid along the bottom, ragged on top.
        transform={side === "top" ? "matrix(1 0 0 -1 0 60)" : undefined}
      />
    </svg>
  );
}
