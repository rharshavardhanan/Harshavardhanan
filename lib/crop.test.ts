import { describe, expect, it } from "vitest";
import { type FilmCrop, projects } from "../content/projects";
import { cropStyle, shown } from "./crop";

// Where the generator's ✦ sits in each 1280 × 720 film, with 4px to spare:
// u across from the left, v up from the bottom (as the ring's shader reads
// the picture). Measured on 2026-11-14; the hallucination film's border was
// cropped when it was encoded, which moved its mark.
const MARK = { u: [0.884, 0.928], v: [0.128, 0.206] };
const MARK_HALLUC = { u: [0.912, 0.956], v: [0.103, 0.177] };

// Two films have a dark border baked in down their sides (ffmpeg
// cropdetect: robot 24px left, road 26px left, with rounded corners): the
// frame must start clear of it.
const BORDER: Partial<Record<string, number>> = { scp: 0.03, road: 0.03 };

// Every shape of box a film is shown in (width ÷ height).
const BOXES: Record<string, number> = {
  "a phone's ring panel": 0.6,
  "a phone's project page": 0.46,
  "a 4:3 page": 4 / 3,
  "a ring panel": 1.48,
  "a 16:10 page": 1.6,
  "a 16:9 page": 16 / 9,
  "a 21:9 page": 21 / 9,
};

const hides = (crop: FilmCrop, mark: typeof MARK, aspect: number) => {
  const { u, v } = shown(crop, aspect);
  return (
    u[1] < mark.u[0] || u[0] > mark.u[1] || v[1] < mark.v[0] || v[0] > mark.v[1]
  );
};

describe("film crop", () => {
  for (const project of projects) {
    const mark = project.slug === "hallucination" ? MARK_HALLUC : MARK;
    it(`${project.slug}: the ✦ is out of frame, and nothing beyond the picture shows`, () => {
      for (const [box, aspect] of Object.entries(BOXES)) {
        expect(hides(project.filmCrop, mark, aspect), box).toBe(true);
        const { u, v } = shown(project.filmCrop, aspect);
        expect(u[0], box).toBeGreaterThanOrEqual(BORDER[project.slug] ?? 0);
        expect(u[1], box).toBeLessThanOrEqual(1);
        expect(v[0], box).toBeGreaterThanOrEqual(0);
        expect(v[1], box).toBeLessThanOrEqual(1);
      }
    });
  }

  it("the spec's first guess (1.10, shift −0.03 / +0.03) would show the ✦ on a 16:9 page", () => {
    expect(hides({ zoom: 1.1, shift: [-0.03, 0.03] }, MARK, 16 / 9)).toBe(
      false,
    );
  });

  it("gives the CSS its three numbers", () => {
    expect(cropStyle({ zoom: 1.15, shift: [-0.06, 0.03] })).toEqual({
      "--crop": 1.15,
      "--crop-x": -0.06,
      "--crop-y": 0.03,
    });
  });
});
