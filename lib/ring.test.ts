import { describe, expect, it } from "vitest";
import { ease, nearest, ringLayout, wrap } from "./ring";

describe("wrap", () => {
  it("keeps a position within half a ring either side of the middle", () => {
    expect(wrap(6.4, 7)).toBeCloseTo(-0.6);
    expect(wrap(-4, 7)).toBeCloseTo(3);
    expect(wrap(0.2, 7)).toBeCloseTo(0.2);
  });
});

describe("nearest", () => {
  it("names the panel closest to the middle, going round the ring", () => {
    expect(nearest(0.4, 7)).toBe(0);
    expect(nearest(-0.6, 7)).toBe(6);
    expect(nearest(8.2, 7)).toBe(1);
  });
});

describe("ease", () => {
  it("moves 8% of the way per sixtieth of a second", () => {
    expect(ease(0, 1, 1 / 60)).toBeCloseTo(0.08);
  });
  it("covers the same ground at any frame rate", () => {
    let fast = 0;
    for (let i = 0; i < 4; i++) fast = ease(fast, 1, 1 / 240);
    expect(fast).toBeCloseTo(ease(0, 1, 1 / 60));
  });
});

describe("ringLayout", () => {
  // Where a point at `angle` on the circle lands across the screen, as a
  // share of half the screen's width (1 = the edge).
  const onScreen = (l: ReturnType<typeof ringLayout>, angle: number) =>
    (l.radius * Math.sin(angle)) /
    (l.camera + l.radius * Math.cos(angle)) /
    l.tanAlong;

  it("on a wide window, the front panel fills about 76% of the width", () => {
    const l = ringLayout(1440, 900);
    expect(l.vertical).toBe(false);
    expect(onScreen(l, l.halfAngle)).toBeCloseTo(0.76, 2);
    expect(l.hit.w / 1440).toBeCloseTo(0.76, 2);
  });

  it("leaves a gap, and the neighbours peek in at the edges", () => {
    const l = ringLayout(1440, 900);
    expect(l.step).toBeCloseTo(2 * l.halfAngle + 0.06);
    const neighbourInnerEdge = onScreen(l, l.halfAngle + 0.06);
    expect(neighbourInnerEdge).toBeLessThan(1);
    expect(neighbourInnerEdge).toBeGreaterThan(0.8);
  });

  it("keeps the panels 16:9 and clear of the frame's top and bottom rows", () => {
    const l = ringLayout(1440, 900);
    expect(l.along / l.across).toBeCloseTo(16 / 9);
    expect(l.hit.h).toBeLessThan(900 - 2 * 88);
  });

  it("on a phone the ring runs up and down, one panel per screen", () => {
    const l = ringLayout(360, 740);
    expect(l.vertical).toBe(true);
    expect(onScreen(l, l.halfAngle)).toBeCloseTo(0.62, 2);
    expect(l.hit.w).toBeLessThan(360);
  });
});
