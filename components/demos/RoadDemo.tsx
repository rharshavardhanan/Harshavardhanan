"use client";

import { useState } from "react";
import { DemoFrame } from "./DemoFrame";

// The three measured mAP50 scores (how good the detector is; higher is better).
const SCORES = [
  ["Trained abroad, tested abroad", 0.578],
  ["Trained abroad, tested in India", 0.101],
  ["Fine-tuned, tested in India", 0.389],
] as const;

// 17 potholes along a stretch of road: [how far along, how far across].
// The positions are made up for the picture; the counts (17, 4, 10) are real.
const POTHOLES: [number, number][] = [
  [22, 30],
  [58, 66],
  [96, 40],
  [131, 74],
  [170, 28],
  [205, 58],
  [241, 80],
  [276, 36],
  [314, 62],
  [352, 24],
  [388, 72],
  [424, 44],
  [461, 30],
  [498, 70],
  [536, 50],
  [574, 26],
  [612, 64],
];

const MODELS = {
  general: { label: "General model", found: [2, 7, 11, 15] },
  pothole: {
    label: "Pothole model",
    found: [0, 2, 4, 5, 7, 9, 11, 12, 14, 15],
  },
};
type Model = keyof typeof MODELS;

export function RoadDemo() {
  const [model, setModel] = useState<Model>("general");
  const found = MODELS[model].found;

  return (
    <DemoFrame
      title="What the detector sees"
      note="Counts measured · positions illustrative"
    >
      {/* A chart across the full width. Each bar's length is its score,
          measured against 0.6; the bars draw in as they scroll into view. */}
      <dl className="grid gap-y-10">
        {SCORES.map(([label, score]) => (
          <div
            key={label}
            className="grid grid-cols-[1fr_auto] items-end gap-x-6 gap-y-3"
          >
            <dt className="label text-muted">{label}</dt>
            <dd className="text-h2 row-span-2 font-serif tabular-nums">
              {score.toFixed(3)}
            </dd>
            <dd className="bg-[color-mix(in_srgb,var(--fg)_10%,transparent)]">
              <span
                data-bar
                className="bg-accent block h-3"
                style={{ width: `${(score / 0.6) * 100}%` }}
              />
            </dd>
          </div>
        ))}
      </dl>
      <p className="label text-muted mt-4">mAP50 on a held-out test set</p>

      <fieldset className="mt-24">
        <legend className="label text-muted">
          A scored 60-second dashcam clip, 17 potholes. Which model?
        </legend>
        <div className="text-h2 mt-6 flex flex-wrap gap-x-12 gap-y-2 font-serif">
          {(Object.keys(MODELS) as Model[]).map((key) => (
            <label key={key} className="word">
              <input
                type="radio"
                name="road-model"
                className="sr-only"
                checked={model === key}
                onChange={() => setModel(key)}
              />
              {MODELS[key].label}
            </label>
          ))}
        </div>
      </fieldset>

      <svg
        viewBox="0 0 640 100"
        role="img"
        aria-label={`${MODELS[model].label}: ${found.length} of 17 potholes found`}
        className="mt-10 w-full"
      >
        <rect
          width="640"
          height="100"
          fill="color-mix(in srgb, currentColor 6%, transparent)"
        />
        <line
          x1="0"
          y1="50"
          x2="640"
          y2="50"
          stroke="currentColor"
          strokeOpacity="0.35"
          strokeWidth="2"
          strokeDasharray="22 26"
        />
        {POTHOLES.map(([x, y], index) => (
          <g key={index}>
            <ellipse
              cx={x}
              cy={y}
              rx="9"
              ry="6"
              fill="var(--bg)"
              stroke="currentColor"
              strokeOpacity="0.5"
            />
            {found.includes(index) && (
              <rect
                x={x - 14}
                y={y - 11}
                width="28"
                height="22"
                className="demo-in"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
              />
            )}
          </g>
        ))}
      </svg>
      <p role="status" className="text-h3 mt-6 font-serif">
        <span className="text-accent">{found.length}</span> of 17 found
      </p>
    </DemoFrame>
  );
}
