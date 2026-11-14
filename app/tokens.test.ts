import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

// Reads the themes straight out of the stylesheet, so there is one place to
// change a colour and this test always checks the real values.
const css = readFileSync(new URL("./globals.css", import.meta.url), "utf8");

// Finds every block that starts [data-theme="name"] and collects its roles,
// for example { name: "road", roles: { bg: "#121212", accent: "#ffc93c" } }.
const themes = [...css.matchAll(/\[data-theme="([a-z]+)"\][^{}]*\{([^}]*)\}/g)]
  .map(([, name, body]) => ({
    name,
    roles: Object.fromEntries(
      [...body.matchAll(/--([a-z]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [
        m[1],
        m[2],
      ]),
    ),
  }))
  // Other rules also mention data-theme (cursors, for one). A theme is a
  // block that sets the background role.
  .filter((theme) => theme.roles.bg);

// WCAG relative luminance of a #rrggbb colour.
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

test("the stylesheet defines all seven themes", () => {
  expect(themes.map((theme) => theme.name).sort()).toEqual([
    "cache",
    "hallucination",
    "ink",
    "kattral",
    "neutral",
    "odovox",
    "road",
  ]);
});

// On the dark themes the small grey labels must be easy, not just legal:
// at least 7:1 (WCAG AAA) instead of 4.5:1.
test.each(themes.filter((theme) => theme.name !== "neutral"))(
  "$name theme: label grey is at least 7:1",
  ({ roles }) => {
    expect(contrast(roles.muted, roles.bg)).toBeGreaterThanOrEqual(7);
  },
);

describe.each(themes)("$name theme", ({ roles }) => {
  test.each(["fg", "muted", "accent"])(
    "%s text on the background meets WCAG AA",
    (role) => {
      expect(contrast(roles[role], roles.bg)).toBeGreaterThanOrEqual(4.5);
    },
  );
});
