// The anomaly hunt's memory. Which glitches a visitor has fixed is kept in the
// browser's localStorage, so the count survives a reload. Storage can be
// blocked (private windows), hence the try/catch: the hunt then still works,
// it just forgets when the page is closed.

export const ANOMALIES = [
  "odovox",
  "scp",
  "aftermeet",
  "road",
  "kattral",
  "cache",
  "hallucination",
  "about",
] as const;
export type AnomalyId = (typeof ANOMALIES)[number];

const KEY = "anomalies";
let memory = ""; // used when storage is blocked

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? memory;
  } catch {
    return memory;
  }
}

/** The ids fixed so far, as one string such as "road,about". */
export const getFixed = read;
export const getFixedOnServer = () => "";

export function subscribe(onChange: () => void) {
  window.addEventListener(KEY, onChange);
  return () => window.removeEventListener(KEY, onChange);
}

export function fix(id: AnomalyId) {
  const fixed = new Set(read().split(",").filter(Boolean));
  fixed.add(id);
  memory = [...fixed].join(",");
  try {
    localStorage.setItem(KEY, memory);
  } catch {}
  window.dispatchEvent(new Event(KEY));
}
