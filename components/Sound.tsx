"use client";

import { useSyncExternalStore } from "react";
import { onSoundChange, setSound, soundOn } from "@/lib/sound";

// The sound switch, off by default. When on, the film you are looking at
// plays its own soundtrack: the middle film of the home ring, or the film at
// the top of a project page (components/ring/Ring.tsx, components/Film.tsx).
// There can be two of these (the frame's and the phone menu's); both read the
// same setting, so they always agree.
export function Sound() {
  const on = useSyncExternalStore(onSoundChange, soundOn, () => false);
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => setSound(!on)}
      className="py-2 underline underline-offset-4"
    >
      sound {on ? "on" : "off"}
    </button>
  );
}
