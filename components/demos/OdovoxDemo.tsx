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
        <p className="label text-muted flex items-center gap-2">
          <span className="status-dot bg-accent" />
          Dictation
        </p>
        <p className="text-h3 mt-4 min-h-[5lh] font-serif sm:min-h-[4lh]">
          {/* Screen readers get the whole sentence at once, not letter by letter. */}
          <span className="sr-only">{DICTATION}</span>
          <span aria-hidden>
            “{DICTATION.slice(0, typed)}
            {step === "typing" ? <span className="caret" /> : "”"}
          </span>
        </p>

        {showCard && (
          <div className="mt-10">
            <dl className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
              {FIELDS.map(([name, value], index) => (
                // Each field arrives a moment after the one before it.
                <div
                  key={name}
                  className="demo-in"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <dt className="label text-muted">{name}</dt>
                  <dd className="mt-1">{value}</dd>
                </div>
              ))}
            </dl>

            <ol
              aria-label="Lower jaw, tooth 36 marked"
              className="label demo-in mt-10 grid grid-cols-8 gap-1 sm:grid-cols-16"
              style={{ animationDelay: "360ms" }}
            >
              {LOWER_ARCH.map((tooth) => (
                <li
                  key={tooth}
                  aria-current={tooth === 36 ? "true" : undefined}
                  className="text-muted aria-[current]:bg-accent aria-[current]:text-bg rounded-b-[40%] bg-[color-mix(in_srgb,var(--fg)_8%,transparent)] py-4 text-center"
                >
                  {tooth}
                </li>
              ))}
            </ol>

            <div
              className="demo-in mt-10 flex flex-wrap items-center gap-6"
              style={{ animationDelay: "450ms" }}
            >
              {step === "card" ? (
                <button
                  type="button"
                  className="btn label"
                  onClick={() => setStep("verified")}
                >
                  Verify record
                </button>
              ) : (
                <p role="status" className="label text-accent">
                  Doctor verified ✓ · saved in one transaction
                </p>
              )}
              <button type="button" className="btn-quiet label" onClick={play}>
                Replay
              </button>
            </div>
          </div>
        )}
      </div>
    </DemoFrame>
  );
}
