import type { Stat } from "@/content/projects";

// One leafy branch, curving up: a stem and seven leaves along it. Drawn once
// and mirrored for the right-hand side.
const LEAVES = Array.from({ length: 7 }, (_, i) => {
  const t = i / 6; // 0 at the bottom of the branch, 1 at the top
  const angle = Math.PI * (0.62 - t * 0.48);
  return {
    x: 30 + Math.cos(angle) * 26,
    y: 92 - t * 78,
    turn: (-angle * 180) / Math.PI + 70,
  };
});

function Branch({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 40 100"
      className="laurel-branch"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <path
        d="M30 96 C 6 74, 6 34, 34 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {LEAVES.map((leaf, i) => (
        <ellipse
          key={i}
          cx={leaf.x - 12}
          cy={leaf.y}
          rx="4"
          ry="9"
          fill="currentColor"
          transform={`rotate(${leaf.turn.toFixed(1)} ${(leaf.x - 12).toFixed(1)} ${leaf.y.toFixed(1)})`}
        />
      ))}
    </svg>
  );
}

// A figure set like a festival laurel on a film poster: the number between
// two branches, what it measures underneath.
export function Laurel({ stat }: { stat: Stat }) {
  const number = stat.n?.toLocaleString("en", {
    minimumFractionDigits: stat.decimals ?? 0,
    maximumFractionDigits: stat.decimals ?? 3,
  });
  const figure =
    stat.text ?? `${stat.prefix ?? ""}${number}${stat.suffix ?? ""}`;
  return (
    <div className="laurel">
      <div className="text-accent flex items-center justify-center gap-2">
        <Branch />
        <p className="text-h3 font-serif whitespace-nowrap tabular-nums">
          {figure}
        </p>
        <Branch flip />
      </div>
      <p className="label text-muted mx-auto mt-3 max-w-[24ch] text-center">
        {stat.label}
      </p>
    </div>
  );
}
