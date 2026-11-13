"use client";

import { useRef, useState } from "react";
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
  // keyboard focus is handed to the first choice of the new question.
  const focusFirstChoice = () =>
    requestAnimationFrame(() => box.current?.querySelector("button")?.focus());

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
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-label text-muted font-mono">You</dt>
            <dd className="text-title font-serif">{score} / 5</dd>
          </div>
          <div>
            <dt className="text-label text-muted font-mono">The model</dt>
            <dd className="text-title text-accent font-serif">94%</dd>
          </div>
        </dl>
        <p className="text-label text-muted mt-2 font-mono">
          Accuracy on 25,000+ samples; five questions is not a fair fight.
        </p>
        <button
          type="button"
          autoFocus
          className="btn mt-5"
          onClick={() => {
            setResults([]);
            focusFirstChoice();
          }}
        >
          Try again
        </button>
      </DemoFrame>
    );
  }

  return (
    <DemoFrame title="Spot the Hallucination" note={`${index + 1} of 5`}>
      <p className="text-label text-muted font-mono">{item.question}</p>
      <p className="text-lead mt-2 min-h-[4lh] sm:min-h-[3lh]">
        “{item.answer}”
      </p>

      {revealed ? (
        <div key="verdict" className="demo-in mt-4">
          <p role="status">
            <strong className={results[index] ? "text-accent" : undefined}>
              {results[index] ? "Correct." : "Not quite."}
            </strong>{" "}
            {item.made ? "Made up." : "Supported."} {item.why}
          </p>
          <button
            type="button"
            autoFocus
            className="btn mt-4"
            onClick={() => {
              setRevealed(false);
              focusFirstChoice();
            }}
          >
            {index === ITEMS.length - 1 ? "See the score" : "Next"}
          </button>
        </div>
      ) : (
        <div key="choices" ref={box} className="mt-4 flex flex-wrap gap-3">
          <button type="button" className="btn" onClick={() => guess(false)}>
            Supported
          </button>
          <button type="button" className="btn" onClick={() => guess(true)}>
            Made up
          </button>
        </div>
      )}
    </DemoFrame>
  );
}
