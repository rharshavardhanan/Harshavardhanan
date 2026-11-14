"use client";

import { useEffect, useRef, useState } from "react";
import { DemoFrame, reducedMotion, useStartInView } from "./DemoFrame";

const SEATS = 6; // one teacher and five students

// Chat lines appear once enough people have joined.
const CHAT = [
  { after: 3, who: "Teacher", text: "Can everyone see my screen?" },
  { after: 6, who: "Student", text: "Yes, it’s clear." },
];

export function KattralDemo() {
  const [joined, setJoined] = useState(0); // how many tiles are lit
  const [running, setRunning] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  const play = () => {
    if (reducedMotion()) return setJoined(SEATS);
    setJoined(0);
    setRunning(true);
  };
  useStartInView(box, play);

  // While running, one more person joins every half second.
  useEffect(() => {
    if (!running) return;
    if (joined >= SEATS) {
      const stop = setTimeout(() => setRunning(false), 0);
      return () => clearTimeout(stop);
    }
    const next = setTimeout(() => setJoined(joined + 1), 500);
    return () => clearTimeout(next);
  }, [running, joined]);

  return (
    <DemoFrame title="A class filling up" note="Scripted example">
      <div ref={box}>
        <p role="status" className="label font-mono">
          <span className="status-dot bg-accent mr-2 inline-block" />
          {joined} in class
        </p>

        <ul aria-hidden className="mt-3 grid grid-cols-3 gap-2">
          {Array.from({ length: SEATS }, (_, seat) => (
            <li key={seat} data-on={seat < joined} className="tile">
              <span className="label font-mono">
                {seat === 0 ? "Teacher · sharing screen" : `Student ${seat}`}
              </span>
            </li>
          ))}
        </ul>

        <ul className="mt-4 min-h-[4.5rem] space-y-1">
          {CHAT.filter((line) => joined >= line.after).map((line) => (
            <li key={line.text} className="demo-in">
              <span className="label text-muted mr-2 font-mono">
                {line.who}
              </span>
              {line.text}
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="btn-quiet"
          onClick={play}
          disabled={running}
        >
          Replay
        </button>
      </div>
    </DemoFrame>
  );
}
