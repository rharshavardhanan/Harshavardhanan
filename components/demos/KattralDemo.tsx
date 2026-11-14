"use client";

import { useEffect, useRef, useState } from "react";
import { DemoFrame, reducedMotion, useStartInView } from "./DemoFrame";

const SEATS = 6; // one teacher and five students

// Chat lines appear once enough people have joined. `speaker` is the seat
// whose ring pulses while that line is the latest.
const CHAT = [
  { after: 3, who: "Teacher", speaker: 0, text: "Can everyone see my screen?" },
  { after: 6, who: "Student", speaker: 4, text: "Yes, it’s clear." },
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

  const said = CHAT.filter((line) => joined >= line.after);
  const speaking = said.at(-1)?.speaker;

  return (
    <DemoFrame title="A class filling up" note="Scripted example">
      <div ref={box}>
        <p role="status" className="label flex items-center gap-2">
          <span className="status-dot bg-accent" />
          {joined} in class
        </p>

        {/* Each person is a soft gradient, not a face; --hue varies the tone. */}
        <ul aria-hidden className="mt-6 grid grid-cols-3 gap-3">
          {Array.from({ length: SEATS }, (_, seat) => (
            <li
              key={seat}
              data-on={seat < joined}
              data-speaking={seat < joined && seat === speaking}
              className="tile"
              style={{ "--hue": `${18 + seat * 7}deg` } as React.CSSProperties}
            >
              <span className="label">
                {seat === 0 ? "Teacher · sharing" : `Student ${seat}`}
              </span>
            </li>
          ))}
        </ul>

        <ul className="mt-8 min-h-[5.5rem] space-y-2">
          {said.map((line) => (
            <li key={line.text} className="demo-in text-h3 font-serif">
              <span className="label text-muted mr-3 align-middle">
                {line.who}
              </span>
              {line.text}
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="btn-quiet label"
          onClick={play}
          disabled={running}
        >
          Replay
        </button>
      </div>
    </DemoFrame>
  );
}
