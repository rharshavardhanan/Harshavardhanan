import { expect, test } from "vitest";
import { formatIST } from "./ist";

test("shows Chennai time whatever the machine's time zone", () => {
  // Chennai is UTC+5:30, so 06:11 UTC is 11:41 there.
  expect(formatIST(new Date("2026-06-15T06:11:00Z"))).toBe("11:41");
});

test("rolls past midnight as 00, not 24", () => {
  expect(formatIST(new Date("2026-01-01T18:35:00Z"))).toBe("00:05");
});
