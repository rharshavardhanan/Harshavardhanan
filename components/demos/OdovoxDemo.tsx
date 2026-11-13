"use client";

import { useEffect, useRef, useState } from "react";
import { DemoFrame, reducedMotion, useStartInView } from "./DemoFrame";

// "Speak -> Verify". Everything here is scripted: no microphone, no network.
const DICTATION =
  "RCT on 36, review in 7 days, amoxicillin 500 three times a day for 5 days";

const FIELDS = [
  ["Tooth", "36 · lower left first molar"],
  ["Procedure", "Root canal treatment (RCT)"],
  ["Medicine", "Amoxicillin 500 · three times a day · 5 days"],
  ["Follow-up", "In 7 days"],
];

// The lower jaw in FDI numbering, as a dentist sees it: patient's right to left.
const LOWER_ARCH = [
  48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
];

// The demo moves through these steps in order.
type Step = "idle" | "typing" | "card" | "verified";

export function OdovoxDemo() {
  const [step, setStep] = useState<Step>("idle");
  const [typed, setTyped] = useState(0); // how many letters are showing
  const box = useRef<HTMLDivElement>(null);

  const play = () => {
    if (reducedMotion()) {
      setTyped(DICTATION.length);
      setStep("card");
    } else {
      setTyped(0);
      setStep("typing");
    }
  };
  useStartInView(box, play);

  // While typing, show one more letter every 30ms; then bring in the card.
  useEffect(() => {
    if (step !== "typing") return;
    if (typed >= DICTATION.length) {
      const pause = setTimeout(() => setStep("card"), 500);
      return () => clearTimeout(pause);
    }
    const next = setTimeout(() => setTyped(typed + 1), 30);
    return () => clearTimeout(next);
  }, [step, typed]);

  const showCard = step === "card" || step === "verified";

  return (
    <DemoFrame title="Speak → Verify" note="Scripted example">
      <div ref={box}>
        <p className="text-label text-muted font-mono">
          <span className="status-dot bg-accent mr-2 inline-block" />
          Dictation
        </p>
        <p className="text-lead mt-2 min-h-[4lh] sm:min-h-[3lh]">
          {/* Screen readers get the whole sentence at once, not letter by letter. */}
          <span className="sr-only">{DICTATION}</span>
          <span aria-hidden>
            “{DICTATION.slice(0, typed)}
            {step === "typing" ? <span className="caret" /> : "”"}
          </span>
        </p>

        {showCard && (
          <div className="demo-in border-line mt-4 border-t pt-4">
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {FIELDS.map(([name, value]) => (
                <div key={name}>
                  <dt className="text-label text-muted font-mono">{name}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>

            <ol
              aria-label="Lower jaw, tooth 36 marked"
              className="text-label mt-5 flex gap-px font-mono"
            >
              {LOWER_ARCH.map((tooth) => (
                <li
                  key={tooth}
                  aria-current={tooth === 36 ? "true" : undefined}
                  className="border-line text-muted aria-[current]:border-accent aria-[current]:bg-accent aria-[current]:text-bg flex-1 border py-1 text-center max-sm:text-[0.625rem]"
                >
                  {tooth}
                </li>
              ))}
            </ol>

            <div className="mt-5 flex flex-wrap items-center gap-4">
              {step === "card" ? (
                <button
                  type="button"
                  className="btn"
                  onClick={() => setStep("verified")}
                >
                  Verify record
                </button>
              ) : (
                <p role="status" className="text-label text-accent font-mono">
                  Doctor verified ✓ · saved in one transaction
                </p>
              )}
              <button type="button" className="btn-quiet" onClick={play}>
                Replay
              </button>
            </div>
          </div>
        )}
      </div>
    </DemoFrame>
  );
}
