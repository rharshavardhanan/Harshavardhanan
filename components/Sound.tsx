"use client";

import { useSyncExternalStore } from "react";
import { onSoundChange, setSound, soundOn } from "@/lib/sound";

// The sound switch, off by default. When on, scrolling makes a soft wooden
// tick, like a ratchet (lib/sound.ts); the home ring ticks as it turns too.
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
