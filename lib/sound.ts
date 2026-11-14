// The site's sounds, all made here with the Web Audio API: no sound files.
//
//   tick       a soft, dull "tok": each panel passing the home ring's
//              centre (pages scroll silently)
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
let tickReady: Promise<void> | null = null; // the tick is made in the background

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
  context: BaseAudioContext,
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

/**
 * The tick: a soft, dull "tok", made once. Measured on the reference: 10ms,
 * loudest (0.56) at the very first sample, down to a tenth within 1ms and
 * silent by about 7ms, its energy around 1kHz.
 *
 * Three steps, each changing what you hear:
 *  1. Envelope. Noise times exp(-t / 0.5ms) is down to 13% after 1ms: a
 *     single hit with no tail. That shortness is what makes it a tick at
 *     all, rather than a hiss.
 *  2. Band-pass at 1000Hz (Q 0.9, a wide band). Only the pitches around 1kHz
 *     get through, which gives the hit a body, a "tok" like a knuckle on
 *     wood, instead of the "tsk" of raw static.
 *  3. Low-pass at 3000Hz. It shaves off what the band-pass still lets
 *     through above 3kHz, the sparkle that would make it sound bright and
 *     clicky: what is left is soft and dull.
 *
 * The filtering is done once, ahead of time, in an OfflineAudioContext (a
 * studio that renders into a buffer as fast as it can instead of playing
 * to the speakers). Each tick is then just the finished buffer played back,
 * which costs nothing. Finally its loudest sample is set to 0.56.
 */
async function renderTick(sampleRate: number) {
  const seconds = 0.01;
  const offline = new OfflineAudioContext(
    1,
    Math.round(sampleRate * seconds),
    sampleRate,
  );
  const source = offline.createBufferSource();
  source.buffer = noise(offline, seconds, (t) => Math.exp(-t / 0.0005));
  const band = offline.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 1000;
  band.Q.value = 0.9;
  const low = offline.createBiquadFilter();
  low.type = "lowpass";
  low.frequency.value = 3000;
  source.connect(band).connect(low).connect(offline.destination);
  source.start();
  const tick = await offline.startRendering();

  // Normalise: scale every sample so the loudest is exactly 0.56.
  const data = tick.getChannelData(0);
  let peak = 0;
  for (const sample of data) peak = Math.max(peak, Math.abs(sample));
  if (peak > 0) for (let i = 0; i < data.length; i++) data[i] *= 0.56 / peak;
  return tick;
}

/** Makes the sounds that are recorded once (select is played live). */
function build(context: AudioContext) {
  tickReady = renderTick(context.sampleRate).then((tick) => {
    buffers.set("tick", tick);
  });
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
    const buffer = buffers.get(name);
    if (!buffer) return; // the tick is still being made
    // Ticks never come closer than 35ms: a fast flick makes a quick run of
    // them, not a buzz.
    if (name === "tick") {
      if (performance.now() - lastTick < 35) return;
      lastTick = performance.now();
    }
    const source = audio.createBufferSource();
    source.buffer = buffer;
    // Each one a touch higher or lower: up to 25 cents (a quarter of a
    // semitone), so a run of ticks never sounds like a machine.
    source.detune.value = (Math.random() * 2 - 1) * 25;
    if (name === "tick") {
      // Already filtered (renderTick): straight to the master knob.
      source.connect(master);
    } else {
      // The click: a band-pass at 1400Hz (only the pitches near it pass)
      // makes the noise a dull tap; Q 1.2 keeps the band wide, so it is not
      // a whistle.
      const filter = audio.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1400;
      filter.Q.value = 1.2;
      source.connect(filter).connect(master);
    }
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
  // One tick to say it is on (once the tick has been made).
  if (on) void tickReady?.then(() => play("tick"));
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
}
