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
  // Targets measured from zenobasi.com/work on a 1440 × 900 screen.
  const l = ringLayout(1440, 900);

  it("each panel covers 45° of the circle, with a 0.045 rad gap", () => {
    expect(l.vertical).toBe(false);
    expect(l.halfAngle * 2).toBeCloseTo(0.785, 3);
    expect(l.step).toBeCloseTo(0.83, 3);
    expect(l.camera).toBe(0); // you stand at the middle of the circle
  });

  it("the front panel is about 935px wide and 585px tall in the middle", () => {
    expect(l.hit.w).toBeGreaterThan(900);
    expect(l.hit.w).toBeLessThan(950);
    expect(l.middlePx).toBeGreaterThan(575);
    expect(l.middlePx).toBeLessThan(600);
  });

  it("its edges are about 8% taller than its middle (1 / cos 22.5°)", () => {
    expect(l.hit.h / l.middlePx).toBeCloseTo(1 / Math.cos(Math.PI / 8), 3);
    expect(l.hit.h).toBeGreaterThan(620);
    expect(l.hit.h).toBeLessThan(645);
  });

  it("shows about 190px of each neighbour", () => {
    // The neighbour's inner edge is half a panel plus the gap round.
    const inner = Math.tan(l.halfAngle + 0.045) / l.tanAlong;
    const visible = (1 - inner) * 720;
    expect(visible).toBeGreaterThan(170);
    expect(visible).toBeLessThan(215);
  });

  it("on a phone the ring runs up and down, one panel per screen", () => {
    const phone = ringLayout(360, 740);
    expect(phone.vertical).toBe(true);
    expect(phone.hit.h / 740).toBeGreaterThan(0.6);
    expect(phone.hit.h / 740).toBeLessThan(0.72);
    expect(phone.hit.w).toBeLessThan(360);
  });
});
