"use client";

import { useState } from "react";
import { DemoFrame } from "./DemoFrame";

// The project's central measurement, from its ablation (docs/ablation-result.md
// in the project repository). ΔTPR = how many more failures the stage-aware
// monitor catches than one global threshold (positive = stage-aware better).
//
// Compared at the same α, the two monitors run at different false-alarm
// rates, so the comparison is invalid and points the wrong way. Compared at
// the same achieved false-alarm rate (FAR), stage-aware wins.
const SAME_FAR = [
  ["0.05", 0.025],
  ["0.10", 0.059],
  ["0.15", 0.071],
  ["0.20", 0.114],
  ["0.25", 0.151],
  ["0.30", 0.139],
] as const;
const SAME_ALPHA = [
  ["0.05", -0.223],
  ["0.10", -0.084],
] as const;

const VIEWS = {
  alpha: {
    word: "Same α",
    axis: "α",
    rows: SAME_ALPHA,
    verdict:
      "At the same α (0.10) the stage-aware monitor looks 8.4 points worse. But it is then running at a false-alarm rate of 0.152 against the global monitor’s 0.207: two different points on the curve. The comparison is invalid.",
  },
  far: {
    word: "Same false-alarm rate",
    axis: "False-alarm rate",
    rows: SAME_FAR,
    verdict:
      "At the same false-alarm rate the order flips: stage-aware catches more failures at every rate from 0.10 up, on all three tasks. At the working point (about 0.15) it is 7.1 points better.",
  },
};
type View = keyof typeof VIEWS;

const H = 200; // chart height in SVG units; zero sits in the middle
const SCALE = 0.25; // a bar of full half-height means ±0.25

export function ScpDemo() {
  const [view, setView] = useState<View>("alpha");
  const { rows, verdict, axis } = VIEWS[view];
  const width = 640;
  // Every view uses the same bar width; a view with fewer bars is centred.
  const step = width / SAME_FAR.length;
  const offset = ((SAME_FAR.length - rows.length) * step) / 2;

  return (
    <DemoFrame
      title="The comparison that gets reported backwards"
      note="From the project’s ablation · 450 rollouts"
    >
      <fieldset>
        <legend className="label text-muted">
          Stage-aware monitor vs one global threshold. Compare them at the…
        </legend>
        <div className="text-h3 mt-4 flex flex-wrap gap-x-10 gap-y-2 font-serif">
          {(Object.keys(VIEWS) as View[]).map((key) => (
            <label key={key} className="word">
              <input
                type="radio"
                name="scp-view"
                className="sr-only"
                checked={view === key}
                onChange={() => setView(key)}
              />
              {VIEWS[key].word}
            </label>
          ))}
        </div>
      </fieldset>

      {/* A bar per setting: up = stage-aware catches more, down = fewer. */}
      <svg
        viewBox={`0 0 ${width} ${H + 40}`}
        role="img"
        aria-label={`Difference in failures caught, by ${axis.toLowerCase()}: ${rows
          .map(
            ([x, d]) =>
              `${x}: ${d > 0 ? "+" : ""}${(d * 100).toFixed(1)} points`,
          )
          .join(", ")}`}
        className="mt-10 w-full"
      >
        <line
          x1="0"
          x2={width}
          y1={H / 2}
          y2={H / 2}
          stroke="currentColor"
          strokeOpacity="0.4"
        />
        {rows.map(([x, d], index) => {
          const h = (Math.abs(d) / SCALE) * (H / 2);
          const cx = offset + step * index + step / 2;
          return (
            <g
              key={`${view}-${x}`}
              className="demo-in"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <rect
                x={cx - step * 0.3}
                width={step * 0.6}
                y={d > 0 ? H / 2 - h : H / 2}
                height={h}
                fill={d > 0 ? "var(--accent)" : "var(--muted)"}
              />
              <text
                x={cx}
                y={d > 0 ? H / 2 - h - 8 : H / 2 + h + 18}
                textAnchor="middle"
                fill="currentColor"
                fontSize="15"
              >
                {d > 0 ? "+" : "−"}
                {(Math.abs(d) * 100).toFixed(1)}
              </text>
              <text
                x={cx}
                y={H + 34}
                textAnchor="middle"
                fill="var(--muted)"
                fontSize="13"
              >
                {x}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="label text-muted mt-2">
        Points of detection rate, stage-aware minus global · by{" "}
        {/* normal-case: in capitals, α would turn into Α and read as "A". */}
        <span className="normal-case">{axis.toLowerCase()}</span>
      </p>

      <p role="status" className="text-h3 mt-10 max-w-[40ch] font-serif">
        {verdict}
      </p>
    </DemoFrame>
  );
}
