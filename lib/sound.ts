// Whether the visitor has switched sound on. It is kept on <html data-sound>,
// so every part of the page sees the same answer, it survives moving between
// pages, and anything can listen for it changing.

export const soundOn = () => document.documentElement.dataset.sound === "on";

export function setSound(on: boolean) {
  if (on) document.documentElement.dataset.sound = "on";
  else delete document.documentElement.dataset.sound;
}

/** Calls `onChange` whenever sound is switched on or off; returns a function
 *  that stops listening. */
export function onSoundChange(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ["data-sound"] });
  return () => observer.disconnect();
}
