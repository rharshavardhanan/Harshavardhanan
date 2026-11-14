"use client";

import { useEffect, useRef, useState } from "react";
import {
  type PolicyName,
  policyLabels,
  type Run,
  simulate,
} from "@/lib/cache-sim";
import { DemoFrame, reducedMotion } from "./DemoFrame";

const NAMES = Object.keys(policyLabels) as PolicyName[];
const TOTAL = 6000; // requests in the simulated trace
const PER_FRAME = 40; // requests replayed per screen refresh (about 2.5s in all)

type Counts = Record<PolicyName, number>;
const zero = (): Counts => ({ lru: 0, lfu: 0, q: 0 });

export function CacheDemo() {
  const [pick, setPick] = useState<PolicyName>("q"); // the visitor's bet
  const [done, setDone] = useState(0); // requests replayed so far
  const [hits, setHits] = useState<Counts>(zero);
  const [running, setRunning] = useState(false);
  const run = useRef<Run | null>(null);

  const start = () => {
    // The whole simulation is computed at once; the race only replays it.
    run.current = simulate();
    if (reducedMotion()) {
      setDone(TOTAL);
      setHits({
        lru: run.current.lru.rate * TOTAL,
        lfu: run.current.lfu.rate * TOTAL,
        q: run.current.q.rate * TOTAL,
      });
      return;
    }
    setDone(0);
    setHits(zero());
    setRunning(true);
  };

  useEffect(() => {
    if (!running) return;
    const frame = requestAnimationFrame(() => {
      const end = Math.min(done + PER_FRAME, TOTAL);
      const next = { ...hits };
      for (const name of NAMES) {
        for (let i = done; i < end; i++)
          if (run.current![name].hits[i]) next[name]++;
      }
      setHits(next);
      setDone(end);
      if (end === TOTAL) setRunning(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [running, done, hits]);

  const rate = (name: PolicyName) => (done ? (hits[name] / done) * 100 : 0);
  const finished = done === TOTAL;
  const winner = NAMES.reduce((a, b) => (hits[b] > hits[a] ? b : a));

  return (
    <DemoFrame title="Cache Wars" note="Simulated in your browser">
      <fieldset disabled={running}>
        <legend className="label text-muted mx-auto">
          Pick the policy you think keeps the most hits
        </legend>
        <div className="text-h3 mt-4 flex flex-wrap justify-center gap-x-10 gap-y-2 font-serif">
          {NAMES.map((name) => (
            <label key={name} className="word">
              <input
                type="radio"
                name="cache-pick"
                className="sr-only"
                checked={pick === name}
                onChange={() => setPick(name)}
              />
              {policyLabels[name]}
            </label>
          ))}
        </div>
      </fieldset>

      {/* The three hit rates, very large, racing as the requests replay. */}
      <dl className="mt-16 grid gap-y-10 md:grid-cols-3">
        {NAMES.map((name) => (
          <div key={name} className="flex flex-col-reverse items-center">
            <dt
              className={`label mt-3 ${name === pick ? "text-accent" : "text-muted"}`}
            >
              {policyLabels[name]}
            </dt>
            <dd
              className={`text-h2 font-serif tabular-nums ${name === pick ? "text-accent" : ""}`}
            >
              {rate(name).toFixed(1)}%
            </dd>
          </div>
        ))}
      </dl>

      <p
        role="status"
        className="mx-auto mt-10 min-h-[3lh] max-w-[40ch] sm:min-h-[2lh]"
      >
        {finished &&
          `${policyLabels[winner]} kept the most hits, at ${rate(winner).toFixed(1)}%. ${
            winner === pick
              ? "You called it."
              : `You backed ${policyLabels[pick]}.`
          }`}
        {running && `${done.toLocaleString("en-IN")} of 6,000 requests…`}
      </p>

      {/* A big round button. */}
      <button
        type="button"
        onClick={start}
        disabled={running}
        className="label border-accent text-accent hover:bg-accent hover:text-bg mx-auto mt-8 flex size-36 items-center justify-center rounded-full border transition-colors duration-300 disabled:opacity-45"
      >
        {finished ? "Run again" : "Run"}
      </button>
      <p className="label text-muted mx-auto mt-10 max-w-[60ch]">
        A miniature: 6,000 requests, a cache of 24 items, and a simple learning
        agent. These are this simulation’s numbers, not the project’s.
      </p>
    </DemoFrame>
  );
}
