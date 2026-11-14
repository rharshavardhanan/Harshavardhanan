"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { DemoFrame } from "./DemoFrame";

// Five answers an AI might give. `made` is true when the answer is made up.
// DRAFT: written for Harsha to check before launch.
const ITEMS = [
  {
    question: "Can you see the Great Wall of China from the Moon?",
    answer:
      "Yes. The Great Wall is the only human-made structure visible to the naked eye from the Moon.",
    made: true,
    why: "No human-made structure can be seen from the Moon with the naked eye.",
  },
  {
    question: "Does water boil at a lower temperature on a mountain?",
    answer:
      "Yes. Air pressure is lower at altitude, so water boils below 100 °C.",
    made: false,
    why: "Lower pressure does lower the boiling point.",
  },
  {
    question: "Why did Einstein win the Nobel Prize?",
    answer:
      "Albert Einstein won the 1921 Nobel Prize in Physics for his theory of relativity.",
    made: true,
    why: "The prize was for explaining the photoelectric effect, not for relativity.",
  },
  {
    question: "Where does the name Python come from?",
    answer:
      "Guido van Rossum named the language after the comedy show Monty Python’s Flying Circus.",
    made: false,
    why: "That is where the name comes from.",
  },
  {
    question: "What was Chennai called before?",
    answer: "Chennai was officially known as Madras until 1996.",
    made: false,
    why: "The city was renamed in 1996.",
  },
];

export function HallucinationDemo() {
  // One entry per answered question: true if the visitor guessed correctly.
  const [results, setResults] = useState<boolean[]>([]);
  const [revealed, setRevealed] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // After "Next" or "Try again" the button that was pressed disappears, so
  // keyboard focus is handed to the first choice of the new question. It is
  // done in the same render that shows the question (useLayoutEffect), so a
  // fast keyboard user can never have their own choice overridden.
  const wantFocus = useRef(false);
  const focusFirstChoice = () => {
    wantFocus.current = true;
  };
  useLayoutEffect(() => {
    if (!wantFocus.current || !box.current) return;
    wantFocus.current = false;
    box.current.querySelector("button")?.focus();
  });

  const index = revealed ? results.length - 1 : results.length;
  const item = ITEMS[index];
  const score = results.filter(Boolean).length;

  const guess = (made: boolean) => {
    setResults([...results, made === item.made]);
    setRevealed(true);
  };

  if (!item) {
    return (
      <DemoFrame title="Spot the Hallucination" note="5 of 5">
        <dl className="grid grid-cols-2 gap-8 text-center">
          <div className="flex flex-col-reverse">
            <dt className="label text-muted mt-3">You</dt>
            <dd className="text-display font-serif">{score} / 5</dd>
          </div>
          <div className="flex flex-col-reverse">
            <dt className="label text-muted mt-3">The model</dt>
            <dd className="text-display text-accent font-serif">94%</dd>
          </div>
        </dl>
        <p className="label text-muted mt-8 text-center">
          Accuracy on 25,000+ samples; five questions is not a fair fight.
        </p>
        <p className="mt-10 text-center">
          <button
            type="button"
            autoFocus
            className="btn label"
            onClick={() => {
              setResults([]);
              focusFirstChoice();
            }}
          >
            Try again
          </button>
        </p>
      </DemoFrame>
    );
  }

  return (
    <DemoFrame title="Spot the Hallucination" note={`${index + 1} of 5`}>
      <p className="label text-muted text-center">{item.question}</p>
      {/* The answer, very large, in the middle of the screen. */}
      <p className="text-h2 mx-auto mt-8 max-w-[18ch] text-center font-serif">
        “{item.answer}”
      </p>

      {revealed ? (
        <div key="verdict" className="scan-reveal mt-12 text-center">
          <p role="status" className="text-h3 font-serif">
            <strong
              className={`font-normal ${results[index] ? "text-accent" : ""}`}
            >
              {results[index] ? "Correct." : "Not quite."}
            </strong>{" "}
            {item.made ? "Made up." : "Supported."} {item.why}
          </p>
          <button
            type="button"
            autoFocus
            className="btn label mt-8"
            onClick={() => {
              setRevealed(false);
              focusFirstChoice();
            }}
          >
            {index === ITEMS.length - 1 ? "See the score" : "Next"}
          </button>
        </div>
      ) : (
        // Two big words, left and right.
        <div
          key="choices"
          ref={box}
          className="text-h2 mt-12 flex flex-wrap justify-between gap-x-8 gap-y-4 font-serif"
        >
          <button type="button" className="word" onClick={() => guess(false)}>
            Supported
          </button>
          <button type="button" className="word" onClick={() => guess(true)}>
            Made up
          </button>
        </div>
      )}
    </DemoFrame>
  );
}
