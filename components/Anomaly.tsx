"use client";

import { useSyncExternalStore } from "react";
import {
  type AnomalyId,
  fix,
  getFixed,
  getFixedOnServer,
  subscribe,
} from "@/lib/anomalies";

// One hidden glitch: a tiny flickering mark that is really a button. Clicking
// it fixes it for good. How it looks is under "Anomaly hunt" in globals.css.
export function Anomaly({ id }: { id: AnomalyId }) {
  const fixed = useSyncExternalStore(subscribe, getFixed, getFixedOnServer);
  const done = fixed.split(",").includes(id);

  return (
    <button
      type="button"
      className="anomaly"
      data-fixed={done}
      aria-label={done ? "Anomaly fixed" : "Anomaly: fix it"}
      aria-disabled={done}
      onClick={() => fix(id)}
    >
      <i />
      <i />
    </button>
  );
}
