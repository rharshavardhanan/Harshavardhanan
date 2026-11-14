"use client";

import { useLayoutEffect, useRef } from "react";
import { scramble } from "@/lib/scramble";

// Text that plays the decode (lib/scramble.ts) each time it changes, and
// each time `active` turns true (the menu opening). `delay` holds it blank
// first, to stagger a list. The real text is always in the page: with
// JavaScript off, or for visitors who asked for reduced motion, that is all
// there is. A layout effect, so the decode starts before the new text is
// ever painted plain.
export function Decode({
  text,
  active = true,
  delay = 0,
  className,
}: {
  text: string;
  active?: boolean;
  delay?: number;
  className?: string;
}) {
  const box = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!active) return;
    return scramble(box.current!, text, { delay });
  }, [text, active, delay]);

  return (
    <span ref={box} className={className ? `decode ${className}` : "decode"}>
      <span className="decode-text">{text}</span>
      <span aria-hidden className="decode-noise" />
    </span>
  );
}
