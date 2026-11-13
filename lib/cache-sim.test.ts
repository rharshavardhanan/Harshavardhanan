import { expect, test } from "vitest";
import { makeTrace, policies, simulate } from "./cache-sim";

test("LRU throws away the key used longest ago", () => {
  const lru = policies.lru(2);
  lru.request(1);
  lru.request(2);
  lru.request(1); // 2 is now the oldest
  lru.request(3); // evicts 2
  expect(lru.request(1)).toBe(true);
  expect(lru.request(2)).toBe(false);
});

test("LFU throws away the key used least often", () => {
  const lfu = policies.lfu(2);
  lfu.request(1);
  lfu.request(1);
  lfu.request(2);
  lfu.request(3); // evicts 2 (used once; 1 was used twice)
  expect(lfu.request(1)).toBe(true);
  expect(lfu.request(2)).toBe(false);
});

test("the trace is the same every time", () => {
  expect(makeTrace()).toEqual(makeTrace());
  expect(makeTrace()).toHaveLength(6000);
});

test("every policy reports a sensible hit rate, and runs are repeatable", () => {
  const first = simulate();
  expect(simulate()).toEqual(first);
  for (const name of ["lru", "lfu", "q"] as const) {
    const { hits, rate } = first[name];
    expect(hits).toHaveLength(6000);
    expect(rate).toBeGreaterThan(0.05);
    expect(rate).toBeLessThan(0.95);
  }
});
