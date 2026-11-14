import { describe, expect, it } from "vitest";
import { tornPath } from "./torn";

describe("tornPath", () => {
  it("is the same every time for the same seed, so the page never changes", () => {
    expect(tornPath(3)).toBe(tornPath(3));
    expect(tornPath(3)).not.toBe(tornPath(4));
  });

  it("covers the full width, solid along the top, ragged along the bottom", () => {
    const path = tornPath(7, 1440, 60);
    expect(path.startsWith("M0 0H1440V")).toBe(true);
    expect(path.endsWith("Z")).toBe(true);
    const ys = [...path.matchAll(/L[\d.]+ ([\d.]+)/g)].map((m) => Number(m[1]));
    expect(ys.length).toBeGreaterThan(40);
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...ys)).toBeLessThanOrEqual(60);
  });
});
