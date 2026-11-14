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
        <legend className="label text-muted font-mono">
          Pick the policy you think keeps the most hits
        </legend>
        <div className="label mt-2 flex font-mono">
          {NAMES.map((name) => (
            <label key={name} className="seg">
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

      <dl className="mt-5 grid gap-y-3">
        {NAMES.map((name) => (
          <div
            key={name}
            className="grid grid-cols-[6.5rem_1fr_3.5rem] items-center gap-x-3"
          >
            <dt
              className={`label font-mono ${name === pick ? "text-accent" : "text-muted"}`}
            >
              {policyLabels[name]}
            </dt>
            <dd className="bg-line/50 h-2">
              <span
                className={`block h-full origin-left ${name === pick ? "bg-accent" : "bg-muted"}`}
                style={{ transform: `scaleX(${rate(name) / 100})` }}
              />
            </dd>
            <dd className="label text-right font-mono tabular-nums">
              {rate(name).toFixed(1)}%
            </dd>
          </div>
        ))}
      </dl>

      <p role="status" className="mt-4 min-h-[3lh] sm:min-h-[2lh]">
        {finished &&
          `${policyLabels[winner]} kept the most hits, at ${rate(winner).toFixed(1)}%. ${
            winner === pick
              ? "You called it."
              : `You backed ${policyLabels[pick]}.`
          }`}
        {running && `${done.toLocaleString("en-IN")} of 6,000 requests…`}
      </p>

      <button type="button" className="btn" onClick={start} disabled={running}>
        {finished ? "Run again" : "Run"}
      </button>
      <p className="label text-muted mt-4 max-w-[60ch] font-mono">
        A miniature: 6,000 requests, a cache of 24 items, and a simple learning
        agent. These are this simulation’s numbers, not the project’s.
      </p>
    </DemoFrame>
  );
}
