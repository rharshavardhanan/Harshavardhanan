import { describe, expect, it } from "vitest";
import { film } from "./media";

describe("film", () => {
  it("uses the project's mood film and its poster when they exist", () => {
    expect(film("odovox")).toEqual({
      src: "/media/mood/mood-odovox.mp4",
      poster: "/media/mood/poster-odovox.avif",
      ai: true,
    });
    // scp's film is named after what it shows: a robot.
    expect(film("scp").src).toBe("/media/mood/mood-robot.mp4");
  });

  it("falls back to the particle recording when there is no film yet", () => {
    expect(film("hallucination")).toEqual({
      src: "/media/case-hallucination.mp4",
      poster: "/media/cover-hallucination.avif",
      ai: false,
    });
  });
});
