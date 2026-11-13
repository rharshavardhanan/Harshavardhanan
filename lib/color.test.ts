import { expect, test } from "vitest";
import { parseColor } from "./color";

const rounded = (css: string) =>
  parseColor(css).map((n) => Math.round(n * 255));

test("reads the forms a browser reports a colour in", () => {
  expect(rounded("rgb(127, 242, 201)")).toEqual([127, 242, 201]);
  expect(rounded("rgba(127, 242, 201, 0.5)")).toEqual([127, 242, 201]);
  expect(rounded("color(srgb 0.498 0.949 0.788)")).toEqual([127, 242, 201]);
  expect(rounded(" #7ff2c9")).toEqual([127, 242, 201]);
});
