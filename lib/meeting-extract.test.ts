import { expect, test } from "vitest";
import { extract } from "./meeting-extract";

const SAMPLE =
  "Priya, Arun, Meera and Karthik on the call. We agreed to move the beta launch to the 21st. Arun will send the revised pricing deck by Friday. Meera needs to review the onboarding copy before next week. Karthik should follow up with the payments team about the refund bug, it's urgent. The analytics dashboard can wait until after launch. Let's ship the Android build to testers by Monday.";

test("finds the people, not the sentence openers or weekdays", () => {
  expect(extract(SAMPLE).participants).toEqual([
    "Priya",
    "Arun",
    "Meera",
    "Karthik",
  ]);
});

test("each task goes to the person named in its sentence", () => {
  const tasks = extract(SAMPLE).tasks;
  expect(tasks.map((t) => [t.owner, t.due])).toEqual([
    ["Arun", "Friday"],
    ["Meera", "Next week"],
    ["Karthik", null],
    [null, "Monday"],
  ]);
  expect(tasks.map((t) => t.title)).toEqual([
    "Send the revised pricing deck by Friday",
    "Review the onboarding copy before next week",
    "Follow up with the payments team about the refund bug, it's urgent",
    "Ship the Android build to testers by Monday",
  ]);
});

test("urgency, confidence and the source quote", () => {
  const [send, , refund, ship] = extract(SAMPLE).tasks;
  expect(refund.urgency).toBe("HIGH");
  expect(send.urgency).toBe("MEDIUM");
  expect(send.confidence).toBeCloseTo(0.9);
  expect(ship.confidence).toBeCloseTo(0.7);
  expect(send.quote).toBe("Arun will send the revised pricing deck by Friday.");
});

test("decisions are what was agreed, kept apart from the tasks", () => {
  const { decisions, tasks } = extract(SAMPLE);
  expect(decisions).toEqual(["We agreed to move the beta launch to the 21st."]);
  expect(tasks.some((t) => /agreed/.test(t.quote))).toBe(false);
});

test("an empty transcript gives an empty result, not an error", () => {
  expect(extract("   ")).toMatchObject({
    participants: [],
    decisions: [],
    tasks: [],
  });
});

test("the follow-up email does not repeat a date the task already says", () => {
  const { email } = extract(SAMPLE);
  expect(email).toContain("• Send the revised pricing deck by Friday (Arun)\n");
  expect(email).not.toMatch(/by Friday \(Arun\), by Friday/);
});
