import { describe, expect, it } from "vitest";
import { CHARS, frame, plan } from "./scramble";

// A repeatable "random": the same sequence every run.
function seeded(seed = 1) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

describe("plan and frame", () => {
  const text = "EDGE CACHE RL";
  const duration = 0.8;
  const letters = plan(text, duration, seeded());

  it("ends on the real text", () => {
    expect(frame(text, letters, duration)).toBe(text);
    expect(frame(text, letters, 5)).toBe(text);
  });

  it("locks letters left to right, one every duration / length", () => {
    const step = duration / text.length;
    letters.forEach((letter, i) => {
      expect(letter.lock).toBeCloseTo((i + 1) * step);
    });
    // Just after letter 4 locks: 0–4 are real, the rest are not yet.
    const shown = frame(text, letters, letters[4].lock + 0.001);
    expect(shown.slice(0, 5)).toBe(text.slice(0, 5));
    expect(shown.slice(6)).not.toBe(text.slice(6));
  });

  it("shows 3 to 6 random characters from the set before each letter locks", () => {
    letters.forEach((letter, i) => {
      if (text[i] === " ") return;
      expect(letter.noise.length).toBeGreaterThanOrEqual(3);
      expect(letter.noise.length).toBeLessThanOrEqual(6);
      for (const char of letter.noise) expect(CHARS).toContain(char);
      // Sampled finely, the letter goes through exactly its noise, in order.
      const seen: string[] = [];
      for (let t = letter.start; t < letter.lock; t += 0.0005) {
        const char = frame(text, letters, t)[i];
        if (seen.at(-1) !== char) seen.push(char);
      }
      expect(seen.join("")).toBe(letter.noise.join(""));
    });
  });

  it("keeps spaces as spaces, and is blank before a letter starts", () => {
    for (let t = 0; t < duration; t += 0.01) {
      const shown = frame(text, letters, t);
      expect(shown).toHaveLength(text.length);
      expect(shown[4]).toBe(" ");
      expect(shown[10]).toBe(" ");
    }
    const last = letters.at(-1)!;
    expect(last.start).toBeGreaterThan(0);
    expect(frame(text, letters, last.start / 2).at(-1)).toBe(" ");
  });
});
