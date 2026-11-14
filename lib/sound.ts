// The site's sounds, all made here with the Web Audio API: no sound files.
//
//   tick       a crisp, woody click: each panel passing the ring's centre, and
//              every 90px of scrolling a page
//   click      a lower, softer tick: opening a panel
//   select     a short falling "blip": any other link
//   menuOpen   a soft whoosh rising (the menu opening)
//   menuClose  the same whoosh falling (closing)
//
// How Web Audio works, in one paragraph: an AudioContext is a little sound
// studio. You make "nodes" (a source of sound, a filter, a volume knob) and
// plug them into each other like guitar pedals, ending at the speakers
// (context.destination). Every sound here goes through one shared volume knob,
// the master gain, which the SOUND switch turns between 0.8 and 0.
//
// Sound is off until the visitor switches it on, and the choice is
// remembered. Browsers only allow sound after the visitor has done something
// (a click, a key, a tap), so the studio is opened on the first of those.

export type SoundName = "tick" | "click" | "select" | "menuOpen" | "menuClose";

const KEY = "sound"; // where the choice is remembered (localStorage)
const VOLUME = 0.8; // the master gain when sound is on

let audio: AudioContext | null = null;
let master: GainNode | null = null;
const buffers = new Map<"tick" | "click" | "whoosh", AudioBuffer>();
let lastTick = 0;

// ---------------------------------------------------------------------------
// Whether sound is on. It lives on <html data-sound="on">, so both SOUND
// switches (the frame's and the phone menu's) always agree.
// ---------------------------------------------------------------------------

export const soundOn = () => document.documentElement.dataset.sound === "on";

/** Calls `onChange` whenever sound is switched on or off; returns a function
 *  that stops listening. */
export function onSoundChange(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributeFilter: ["data-sound"],
  });
  return () => observer.disconnect();
}

// ---------------------------------------------------------------------------
// Making the sounds
// ---------------------------------------------------------------------------

/**
 * A burst of noise that dies away: the raw material of the tick, the click
 * and the whoosh. `seconds` is its length; `shape(t)` is how loud it is at
 * time t (1 = full).
 *
 * White noise is every pitch at once, at random: on its own it is a hiss.
 * Multiplying it by a fast-falling curve turns the hiss into a single hit,
 * because it is only loud for a moment.
 */
function noise(
  context: AudioContext,
  seconds: number,
  shape: (t: number) => number,
) {
  const length = Math.round(context.sampleRate * seconds);
  // One channel (mono), `length` samples, at the studio's rate (usually
  // 48,000 samples a second).
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    const t = i / context.sampleRate; // this sample's time, in seconds
    data[i] = (Math.random() * 2 - 1) * shape(t);
  }
  return buffer;
}

/** Makes the three recorded-once sounds (the others are played live). */
function build(context: AudioContext) {
  // Tick: 12ms long, but the curve exp(-t / 1.5ms) has fallen to 13% by 3ms
  // and to almost nothing by 7ms. A sound that short has no time to be a
  // hiss: the ear hears a tick.
  buffers.set(
    "tick",
    noise(context, 0.012, (t) => Math.exp(-t / 0.0015)),
  );
  // Click: the same, dying more slowly (4ms), so it is rounder and softer.
  buffers.set(
    "click",
    noise(context, 0.06, (t) => Math.exp(-t / 0.004)),
  );
  // Whoosh: 120ms that swells up and dies away (half a sine wave), so it
  // has no hard start or end.
  buffers.set(
    "whoosh",
    noise(context, 0.12, (t) => Math.sin((Math.PI * t) / 0.12)),
  );
}

// ---------------------------------------------------------------------------
// The studio
// ---------------------------------------------------------------------------

/** Opens the sound studio. Call it from a click, a key or a tap: browsers
 *  refuse to start sound any other way. Safe to call again. */
export function unlock() {
  if (!audio) {
    audio = new AudioContext();
    // The master volume knob: every sound plugs into this, this plugs into
    // the speakers.
    master = audio.createGain();
    master.gain.value = soundOn() ? VOLUME : 0;
    master.connect(audio.destination);
    build(audio);
  }
  if (audio.state === "suspended" && !document.hidden) void audio.resume();
}

/** Plays one of the sounds, if sound is on and the studio is open. */
export function play(name: SoundName) {
  if (!audio || !master || !soundOn() || audio.state !== "running") return;
  const now = audio.currentTime;

  if (name === "tick" || name === "click") {
    // Ticks never come closer than 35ms: a fast flick makes a quick run of
    // them, not a buzz.
    if (name === "tick") {
      if (performance.now() - lastTick < 35) return;
      lastTick = performance.now();
    }
    const source = audio.createBufferSource();
    source.buffer = buffers.get(name)!;
    // Each one a touch higher or lower: up to 25 cents (a quarter of a
    // semitone), so a run of ticks never sounds like a machine.
    source.detune.value = (Math.random() * 2 - 1) * 25;
    // A band-pass filter lets through only the pitches near its frequency.
    // Raw noise hit through it at 3200Hz sounds like a crisp, woody click
    // rather than a burst of static; Q 1.2 keeps the band fairly wide, so
    // it is not a whistle. The click's band is lower, 1800Hz: a duller tap.
    const filter = audio.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = name === "tick" ? 3200 : 1800;
    filter.Q.value = 1.2;
    source.connect(filter).connect(master);
    source.start(now);
    return;
  }

  if (name === "select") {
    // A pure tone (a sine wave) that falls from 1200 to 900Hz in 60ms: a
    // small downward "blip". Its volume jumps in over 5ms and fades out by
    // 60ms; a sound that starts or stops instantly clicks.
    const tone = audio.createOscillator();
    tone.type = "sine";
    tone.frequency.setValueAtTime(1200, now);
    tone.frequency.exponentialRampToValueAtTime(900, now + 0.06);
    const volume = audio.createGain();
    volume.gain.setValueAtTime(0.0001, now);
    volume.gain.exponentialRampToValueAtTime(0.12, now + 0.005);
    volume.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
    tone.connect(volume).connect(master);
    tone.start(now);
    tone.stop(now + 0.07);
    return;
  }

  // menuOpen / menuClose: the whoosh through a low-pass filter (it lets
  // through everything BELOW its frequency). Sliding that frequency up from
  // 600 to 2400Hz lets more and more of the bright part through: it sounds
  // like air opening up. Sliding it down closes it again.
  const opening = name === "menuOpen";
  const source = audio.createBufferSource();
  source.buffer = buffers.get("whoosh")!;
  const filter = audio.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(opening ? 600 : 2400, now);
  filter.frequency.exponentialRampToValueAtTime(
    opening ? 2400 : 600,
    now + 0.12,
  );
  const volume = audio.createGain();
  volume.gain.value = 0.35;
  source.connect(filter).connect(volume).connect(master);
  source.start(now);
}

/** Switches sound on or off, and remembers the choice. Call it from a click
 *  (the SOUND switch), which also lets the studio open. */
export function setEnabled(on: boolean) {
  const html = document.documentElement;
  if (on) html.dataset.sound = "on";
  else delete html.dataset.sound;
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {} // storage blocked (a private window): just not remembered
  unlock();
  // Turn the master knob smoothly (over about 50ms), not with a jump.
  if (audio && master) {
    master.gain.setTargetAtTime(on ? VOLUME : 0, audio.currentTime, 0.015);
  }
  if (on) play("tick"); // one tick to say it is on
}

// ---------------------------------------------------------------------------
// Setting it all up, once per page load (components/Sound.tsx calls this)
// ---------------------------------------------------------------------------

let installed = false;

export function install() {
  if (installed) return;
  installed = true;
  const html = document.documentElement;

  // The remembered choice. Off unless the visitor switched it on before
  // (so reduced-motion visitors, like everyone, start in silence).
  try {
    if (localStorage.getItem(KEY) === "on") html.dataset.sound = "on";
  } catch {}

  // Open the studio on the first click, key or tap.
  const first = () => {
    unlock();
    for (const type of ["pointerdown", "keydown", "touchend"]) {
      window.removeEventListener(type, first, true);
    }
  };
  for (const type of ["pointerdown", "keydown", "touchend"]) {
    window.addEventListener(type, first, true);
  }

  // A hidden tab makes no sound and uses no sound hardware.
  document.addEventListener("visibilitychange", () => {
    if (!audio) return;
    if (document.hidden) void audio.suspend();
    else void audio.resume();
  });

  // Any ordinary link: a blip. (Not the ring's panels, which click; not
  // links that open a dialog, which whoosh.)
  document.addEventListener(
    "click",
    (event) => {
      const link = (event.target as Element).closest?.("a");
      if (!link) return;
      if (link.closest("[data-ring-hit], [data-ring-link], [aria-haspopup]")) {
        return;
      }
      play("select");
    },
    true,
  );

  // Scrolling a page: a tick every 90px travelled, up or down.
  let travelled = 0;
  let lastY = window.scrollY;
  window.addEventListener(
    "scroll",
    () => {
      travelled += Math.abs(window.scrollY - lastY);
      lastY = window.scrollY;
      if (travelled >= 90) {
        travelled %= 90;
        play("tick");
      }
    },
    { passive: true },
  );
}
