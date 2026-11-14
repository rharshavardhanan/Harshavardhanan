// A miniature of Aftermeet's "demo mode": the rule-based extractor its backend
// falls back to when no AI provider is configured (Aftermeet repository,
// backend/api/src/ai/mock.ts). It runs entirely in the browser.
//
// Two changes from the original, so the demo reads sensibly: a task's owner is
// the person named in that sentence (the original assigns owners in turn), and
// decisions are sentences that say something was agreed or decided (the
// original reuses the first two action lines). The real product sends the
// transcript to a language model with a strict JSON schema instead.

export type Task = {
  title: string;
  owner: string | null;
  due: string | null;
  urgency: "HIGH" | "MEDIUM";
  /** How sure the rules are, 0 to 1. Higher when an owner and a date are named. */
  confidence: number;
  /** The sentence the task came from, word for word. */
  quote: string;
};

export type Extraction = {
  participants: string[];
  decisions: string[];
  tasks: Task[];
  email: string;
};

const ACTION =
  /\b(will|need to|needs to|should|let's|action|follow up|send|prepare|review|ship|by (monday|tuesday|wednesday|thursday|friday|next week|eod))\b/i;
const DECISION = /\b(agreed|decided|decision|we'll go with|going with)\b/i;
const DUE =
  /\b(today|tomorrow|eod|monday|tuesday|wednesday|thursday|friday|next week)\b/i;
const URGENT = /\b(asap|urgent|critical|today)\b/i;

export function extract(transcript: string): Extraction {
  const sentences = transcript
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s/)
    .map((s) => s.trim())
    .filter(Boolean);

  // People: capitalised words that are not the first word of a sentence and
  // not a weekday (as in the original, capped at four).
  const firstWords = new Set(sentences.map((s) => s.split(/[\s,]/)[0]));
  const weekdays =
    /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/;
  const candidates: string[] = transcript.match(/\b[A-Z][a-z]{2,12}\b/g) ?? [];
  const participants = Array.from(
    new Set(
      candidates.filter(
        (word, i) =>
          !weekdays.test(word) &&
          (!firstWords.has(word) ||
            candidates.indexOf(word) !== i ||
            isNamed(word, transcript)),
      ),
    ),
  ).slice(0, 4);

  const actionLines = sentences.filter(
    (s) => ACTION.test(s) && !DECISION.test(s),
  );

  const tasks: Task[] = actionLines.slice(0, 6).map((s) => {
    const owner =
      participants.find((name) => new RegExp(`\\b${name}\\b`).test(s)) ?? null;
    const due = s.match(DUE)?.[1] ?? null;
    // "Arun will send the deck." becomes "Send the deck".
    const title = s
      .replace(owner ? new RegExp(`^${owner}\\s+`) : /^$/, "")
      .replace(/^(we|i|they|let's)\s+/i, "")
      .replace(/^(will|should|needs? to)\s+/i, "")
      .replace(/[.!?]$/, "");
    return {
      title: title[0].toUpperCase() + title.slice(1),
      owner,
      due: due ? due[0].toUpperCase() + due.slice(1).toLowerCase() : null,
      urgency: URGENT.test(s) ? "HIGH" : "MEDIUM",
      confidence: 0.55 + (owner ? 0.2 : 0) + (due ? 0.15 : 0),
      quote: s,
    };
  });

  const decisions = sentences.filter((s) => DECISION.test(s)).slice(0, 3);

  const email = [
    "Hi team,",
    "",
    "Thanks for the time today. Quick recap and next steps:",
    "",
    ...tasks.map(
      (t) =>
        `• ${t.title}${t.owner ? ` (${t.owner})` : ""}` +
        // Add the date only if the task does not already say it.
        (t.due && !t.title.toLowerCase().includes(t.due.toLowerCase())
          ? `, by ${t.due}`
          : ""),
    ),
    "",
    "Shout if I missed anything.",
  ].join("\n");

  return { participants, decisions, tasks, email };
}

/** A sentence-first word still counts as a name if it is followed by a verb-ish word used for people. */
function isNamed(word: string, transcript: string) {
  return (
    new RegExp(`\\b${word}\\s+(will|should|needs|said|agreed|can)\\b`).test(
      transcript,
    ) || new RegExp(`\\b${word},`).test(transcript)
  );
}
