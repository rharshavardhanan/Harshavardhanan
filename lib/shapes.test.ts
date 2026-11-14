import { expect, test } from "vitest";
import { COUNT, insideTooth, shape, shapeNames } from "./shapes";

test("there are ten shapes", () => {
  expect(shapeNames).toEqual([
    "dot",
    "cloud",
    "waveform",
    "tooth",
    "road",
    "tiles",
    "blocks",
    "bubble",
    "doc",
    "arm",
  ]);
});

test.each(shapeNames)("%s has one finite position per point", (name) => {
  const points = shape(name);
  expect(points).toHaveLength(COUNT * 3);
  expect(points.every(Number.isFinite)).toBe(true);
  expect(Math.max(...points.map(Math.abs))).toBeLessThan(1.7);
});

test("a shape is the same every time it is asked for", () => {
  expect(shape("road")).toBe(shape("road"));
});

test("the dot is tiny and every other shape is not", () => {
  const spread = (name: (typeof shapeNames)[number]) =>
    Math.max(...shape(name).map(Math.abs));
  expect(spread("dot")).toBeLessThan(0.05);
  for (const name of shapeNames.filter((n) => n !== "dot")) {
    expect(spread(name)).toBeGreaterThan(0.5);
  }
});

test("the tooth has a crown, two roots and a gap between them", () => {
  expect(insideTooth(0, 0.4)).toBe(true); // middle of the crown
  expect(insideTooth(0.3, -0.5)).toBe(true); // right root
  expect(insideTooth(-0.3, -0.5)).toBe(true); // left root
  expect(insideTooth(0, -0.6)).toBe(false); // between the roots
  expect(insideTooth(0, 0.9)).toBe(false); // above the crown
  expect(insideTooth(0.9, 0.4)).toBe(false); // beside the crown
});
