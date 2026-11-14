"use client";

import { useEffect, useSyncExternalStore } from "react";
import { install, onSoundChange, setEnabled, soundOn } from "@/lib/sound";

// The SOUND switch, off by default, remembered once switched. The sounds
// themselves are made in lib/sound.ts. There can be two of these (the
// frame's and the phone menu's); both read the same setting, so they always
// agree.
export function Sound() {
  const on = useSyncExternalStore(onSoundChange, soundOn, () => false);

  // Sets up the sounds (once, however many switches there are).
  useEffect(install, []);

  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => setEnabled(!on)}
      className="py-2 underline underline-offset-4"
    >
      sound {on ? "on" : "off"}
    </button>
  );
}
