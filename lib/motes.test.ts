import { describe, expect, it } from "vitest";
import { MOTE, scatter, scrollWave } from "./motes";

describe("scatter", () => {
  const motes = scatter(400);

  it("gives every mote five numbers", () => {
    expect(MOTE).toBe(5);
    expect(motes).toBeInstanceOf(Float32Array);
    expect(motes.length).toBe(400 * MOTE);
  });

  it("keeps every number in its range", () => {
    for (let i = 0; i < 400; i++) {
      const [x, y, depth, phase, rate] = motes.slice(i * MOTE, i * MOTE + MOTE);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThan(1);
      expect(depth).toBeGreaterThanOrEqual(0.3);
      expect(depth).toBeLessThanOrEqual(1);
      expect(phase).toBeGreaterThanOrEqual(0);
      expect(phase).toBeLessThan(2 * Math.PI + 1e-6);
      expect(rate).toBeGreaterThanOrEqual(0.2);
      expect(rate).toBeLessThanOrEqual(0.6);
    }
  });
});

describe("scrollWave", () => {
  it("starts once when a scroll begins, and again only after it settles", () => {
    let wave = { at: -Infinity, moving: false };
    const speeds = [0, 0.02, 0.2, 0.6, 0.4, 0.03, 0.005, 0.3];
    const starts: number[] = [];
    speeds.forEach((speed, frame) => {
      const next = scrollWave(wave, speed, frame);
      if (next.at !== wave.at) starts.push(frame);
      wave = next;
    });
    // Begins at frame 2 (past 0.05); still moving until frame 6 (under
    // 0.01); a new scroll at frame 7.
    expect(starts).toEqual([2, 7]);
  });
});
