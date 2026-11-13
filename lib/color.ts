/**
 * Turns a CSS colour, in any form a browser reports one, into three numbers
 * from 0 to 1 (red, green, blue). Handles "rgb(127, 242, 201)",
 * "color(srgb 0.5 0.95 0.79)" and "#7ff2c9".
 */
export function parseColor(css: string): [number, number, number] {
  const value = css.trim();
  if (value.startsWith("#")) {
    const n = parseInt(value.slice(1, 7), 16);
    return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  const [r, g, b] = (value.match(/[\d.]+/g) ?? []).map(Number);
  const scale = value.startsWith("rgb") ? 255 : 1;
  return [r / scale, g / scale, b / scale];
}
