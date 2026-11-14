"use client";

import { useState } from "react";
import { type Extraction, extract } from "@/lib/meeting-extract";
import { DemoFrame } from "./DemoFrame";

// A made-up meeting, so the demo has something to work on. Edit it freely.
const SAMPLE =
  "Priya, Arun, Meera and Karthik on the call. We agreed to move the beta launch to the 21st. Arun will send the revised pricing deck by Friday. Meera needs to review the onboarding copy before next week. Karthik should follow up with the payments team about the refund bug, it's urgent. The analytics dashboard can wait until after launch. Let's ship the Android build to testers by Monday.";

// Transcript in, tasks out: a miniature of Aftermeet's no-AI demo mode, run
// in the browser by lib/meeting-extract.ts. Nothing is sent anywhere.
export function AftermeetDemo() {
  const [result, setResult] = useState<Extraction | null>(null);

  return (
    <DemoFrame
      title="Transcript in, tasks out"
      note="Aftermeet’s demo mode, run in your browser · rules, no AI"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          // Read the box itself (it is not held in React state), so text
          // typed before the page's scripts have started is never lost.
          const transcript = new FormData(event.currentTarget).get(
            "transcript",
          );
          setResult(extract(String(transcript ?? "")));
        }}
      >
        <label className="label text-muted block">
          Transcript (a made-up meeting; edit it or paste your own)
          <textarea
            name="transcript"
            defaultValue={SAMPLE}
            rows={6}
            className="border-line text-body focus:border-fg mt-3 block w-full resize-y border-0 border-b bg-transparent pb-3 font-sans normal-case tracking-normal outline-none"
          />
        </label>
        <button type="submit" className="btn label mt-6">
          Extract
        </button>
      </form>

      <p role="status" className="label mt-8">
        {result &&
          `${result.tasks.length} task${result.tasks.length === 1 ? "" : "s"} · ${result.decisions.length} decision${result.decisions.length === 1 ? "" : "s"} · people: ${result.participants.join(", ") || "none found"}`}
      </p>

      {result && (
        <div className="mt-8 grid gap-x-10 gap-y-12 lg:grid-cols-[3fr_2fr]">
          <div>
            <h4 className="label text-muted">Action items</h4>
            <ol className="mt-4 space-y-6">
              {result.tasks.map((task, index) => (
                <li
                  key={task.quote}
                  className="demo-in border-line border-t pt-4"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <p className="text-h3 font-serif">{task.title}</p>
                  <p className="label text-muted mt-2 flex flex-wrap gap-x-5 gap-y-1">
                    <span>{task.owner ?? "No owner named"}</span>
                    <span>{task.due ? `By ${task.due}` : "No date"}</span>
                    <span
                      className={task.urgency === "HIGH" ? "text-accent" : ""}
                    >
                      {task.urgency === "HIGH" ? "Urgent" : "Normal"}
                    </span>
                    <span>{Math.round(task.confidence * 100)}% sure</span>
                  </p>
                  <p className="text-muted mt-2 italic">“{task.quote}”</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="space-y-10">
            <div>
              <h4 className="label text-muted">Decisions</h4>
              <ul className="mt-4 space-y-2">
                {result.decisions.length ? (
                  result.decisions.map((d) => <li key={d}>{d}</li>)
                ) : (
                  <li className="text-muted">None said out loud.</li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="label text-muted">Follow-up email</h4>
              <pre className="border-line mt-4 border-l pl-4 font-sans whitespace-pre-wrap">
                {result.email}
              </pre>
            </div>
          </div>
        </div>
      )}
    </DemoFrame>
  );
}
