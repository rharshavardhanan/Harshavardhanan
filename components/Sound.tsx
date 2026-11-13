"use client";

import { useEffect, useState } from "react";

// A sound switch, off by default. When on, pressing any link or button plays
// a very short, quiet tick made in the browser (no sound files).
export function Sound() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!on) return;
    const audio = new AudioContext();

    const tick = (event: MouseEvent) => {
      if (!(event.target as Element).closest("a, button, label")) return;
      const tone = audio.createOscillator();
      const volume = audio.createGain();
      tone.frequency.value = 660;
      volume.gain.setValueAtTime(0.04, audio.currentTime);
      volume.gain.exponentialRampToValueAtTime(
        0.0001,
        audio.currentTime + 0.06,
      );
      tone.connect(volume).connect(audio.destination);
      tone.start();
      tone.stop(audio.currentTime + 0.06);
    };

    document.addEventListener("click", tick);
    return () => {
      document.removeEventListener("click", tick);
      audio.close();
    };
  }, [on]);

  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => setOn(!on)}
      className="py-2 underline underline-offset-4"
    >
      sound {on ? "on" : "off"}
    </button>
  );
}
