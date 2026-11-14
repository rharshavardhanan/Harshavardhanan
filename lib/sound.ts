// The site's one sound: a soft wooden tick while you scroll, like a ratchet or
// a fidget wheel. Off until the visitor switches it on (components/Sound.tsx).
//
// Whether it is on lives on <html data-sound="on">, so every part of the page
// sees the same answer and it survives moving between pages. The tick is made
// in the browser (Web Audio), so there are no sound files to download.

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

let audio: AudioContext | null = null;
let click: AudioBuffer | null = null;
let lastTick = 0;

/** 25 milliseconds of noise that dies away fast: a small wooden "tk". */
function makeClick(context: AudioContext) {
  const length = Math.round(context.sampleRate * 0.025);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 6);
  }
  return buffer;
}

/** One tick, if sound is on. Never more than one every 45ms, so fast
 *  scrolling becomes a gentle purr rather than a buzz. */
export function tick() {
  if (!soundOn()) return;
  const now = performance.now();
  if (now - lastTick < 45) return;
  lastTick = now;

  audio ??= new AudioContext();
  click ??= makeClick(audio);
  const source = audio.createBufferSource();
  source.buffer = click;
  // Each tick a touch higher or lower than the last, so it never sounds
  // like a machine.
  source.playbackRate.value = 0.9 + Math.random() * 0.2;
  // Only the middle of the noise passes: a soft click, not a hiss.
  const filter = audio.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1900;
  filter.Q.value = 3;
  const volume = audio.createGain();
  volume.gain.value = 0.18;
  source.connect(filter).connect(volume).connect(audio.destination);
  source.start();
}

// Scrolling a page ticks once every 90 pixels travelled, up or down.
const STEP = 90;
let travelled = 0;
let lastY = 0;
const onScroll = () => {
  travelled += Math.abs(window.scrollY - lastY);
  lastY = window.scrollY;
  if (travelled >= STEP) {
    travelled %= STEP;
    tick();
  }
};

/** Switches sound on or off. Called from a click, which is also what lets
 *  the browser start making sound at all. */
export function setSound(on: boolean) {
  const html = document.documentElement;
  if (on) {
    html.dataset.sound = "on";
    audio ??= new AudioContext();
    void audio.resume();
    lastY = window.scrollY;
    travelled = 0;
    window.addEventListener("scroll", onScroll, { passive: true });
    tick(); // one tick to say it is on
  } else {
    delete html.dataset.sound;
    window.removeEventListener("scroll", onScroll);
  }
}
