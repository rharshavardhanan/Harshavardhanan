// Built once and reused: creating a formatter is slow, using one is fast.
const ist = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** The time in Chennai as "HH:MM", wherever the visitor is. */
export function formatIST(date: Date): string {
  return ist.format(date);
}
