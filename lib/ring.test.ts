import { describe, expect, it } from "vitest";
import { ease, nearest, panelSize, wrap } from "./ring";

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

describe("panelSize", () => {
  it("runs sideways on a wide window", () => {
    const size = panelSize(1440, 900);
    expect(size.vertical).toBe(false);
    expect(size.w / size.h).toBeCloseTo(16 / 9);
    expect(size.step).toBeCloseTo(size.w + size.gap);
  });
  it("runs downwards on a phone, one panel per screen", () => {
    const size = panelSize(360, 740);
    expect(size.vertical).toBe(true);
    expect(size.w).toBeLessThan(360);
    expect(size.step).toBeCloseTo(size.h + size.gap);
  });
});
