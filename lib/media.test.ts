import { existsSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { film } from "./media";

// The real file check, wrapped so one test can pretend a film is missing.
vi.mock("node:fs", async (importOriginal) => {
  const fs = await importOriginal<typeof import("node:fs")>();
  return { ...fs, existsSync: vi.fn(fs.existsSync) };
});

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

  it("uses the hallucination film (named halluc)", () => {
    expect(film("hallucination")).toEqual({
      src: "/media/mood/mood-halluc.mp4",
      poster: "/media/mood/poster-halluc.avif",
      ai: true,
    });
  });

  it("falls back to the particle recording when a project has no film", () => {
    vi.mocked(existsSync).mockReturnValueOnce(false);
    expect(film("hallucination")).toEqual({
      src: "/media/case-hallucination.mp4",
      poster: "/media/cover-hallucination.avif",
      ai: false,
    });
  });
});
