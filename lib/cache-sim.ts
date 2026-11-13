// A small cache simulation for the "Cache Wars" demo. It runs entirely in the
// browser. A cache holds a few items; each request is either a HIT (the item
// is already in the cache) or a MISS (it is not, so it is fetched and
// something else is thrown away). A policy is the rule for what to throw away.
//
// This is a miniature for the demo, not the Edge Cache RL project's code or
// its benchmark. The numbers it produces are its own.

export type PolicyName = "lru" | "lfu" | "q";

export const policyLabels: Record<PolicyName, string> = {
  lru: "LRU",
  lfu: "LFU",
  q: "Q-Learning",
};

/** A cache with one policy. `request` returns true for a hit. */
type Cache = { request: (key: number) => boolean };

/** A random-number generator that gives the same numbers every time. */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// What the cache remembers about each item it holds.
type Entry = { count: number; last: number };

/** The key used longest ago. */
const oldest = (items: Map<number, Entry>) =>
  [...items].reduce((a, b) => (b[1].last < a[1].last ? b : a))[0];

/** The key used least often (the older one if two are tied). */
const rarest = (items: Map<number, Entry>) =>
  [...items].reduce((a, b) =>
    b[1].count < a[1].count ||
    (b[1].count === a[1].count && b[1].last < a[1].last)
      ? b
      : a,
  )[0];

/** Builds a cache whose `choose` function picks the key to throw away. */
function cache(
  size: number,
  choose: (items: Map<number, Entry>, key: number, now: number) => number,
  onRequest?: (key: number, hit: boolean, now: number) => void,
  forgetEvery = 0, // if set, halve every item's use count this often
): Cache {
  const items = new Map<number, Entry>();
  let now = 0;
  return {
    request(key) {
      now++;
      if (forgetEvery && now % forgetEvery === 0) {
        for (const item of items.values()) item.count /= 2;
      }
      const entry = items.get(key);
      onRequest?.(key, !!entry, now);
      if (entry) {
        entry.count++;
        entry.last = now;
        return true;
      }
      if (items.size >= size) items.delete(choose(items, key, now));
      items.set(key, { count: 1, last: now });
      return false;
    },
  };
}

export const policies: Record<PolicyName, (size: number) => Cache> = {
  // Least Recently Used: throw away whatever was used longest ago.
  lru: (size) => cache(size, oldest),

  // Least Frequently Used: throw away whatever was used least often.
  lfu: (size) => cache(size, rarest),

  // A learning agent. Each time it must throw something away it chooses
  // between the LRU answer and the LFU answer. It keeps a score (a "Q value")
  // for each choice in each kind of traffic, and learns from regret: if an
  // item it threw away is asked for again soon, the choice that threw it away
  // loses score. It also lets old popularity fade (use counts are halved
  // every 150 requests), so yesterday's favourites cannot squat in the cache.
  q: (size) => {
    const rand = seeded(7);
    const LEARN = 0.2; // how fast scores move
    const EXPLORE = 0.05; // how often it tries the other choice anyway
    // q[state][choice]; choice 0 = act like LRU, 1 = act like LFU.
    const q = [
      [0, 0],
      [0, 0],
      [0, 0],
    ];
    // Recently thrown-away keys: key -> the state and choice that did it.
    const regret = new Map<number, { state: number; choice: number }>();
    // How much of recent traffic was new to the cache: 0 little, 1 some, 2 a lot.
    let missStreak = 0;
    const state = () => (missStreak < 0.35 ? 0 : missStreak < 0.7 ? 1 : 2);

    return cache(
      size,
      (items) => {
        const s = state();
        const best = q[s][0] >= q[s][1] ? 0 : 1;
        const choice = rand() < EXPLORE ? 1 - best : best;
        const victim = choice === 0 ? oldest(items) : rarest(items);
        regret.set(victim, { state: s, choice });
        // Only remember as many thrown-away keys as the cache holds.
        if (regret.size > size) regret.delete(regret.keys().next().value!);
        return victim;
      },
      (key, hit) => {
        missStreak = missStreak * 0.95 + (hit ? 0 : 0.05);
        const mistake = regret.get(key);
        if (mistake) {
          // This key was thrown away and is wanted again: that choice was wrong.
          const { state: s, choice } = mistake;
          q[s][choice] += LEARN * (-1 - q[s][choice]);
          q[s][1 - choice] += LEARN * (0 - q[s][1 - choice]) * 0.1;
          regret.delete(key);
        }
      },
      150,
    );
  },
};

/**
 * The requests every policy is tested on. Traffic alternates between two
 * moods. In the steady mood a set of favourites is mixed with one-off items
 * that are never asked for again; LRU wastes space on the one-offs, LFU does
 * not. In the bursty mood brand-new items are each wanted several times and
 * then dropped; LFU clings to old favourites, LRU does not. Neither fixed rule
 * is right for both.
 */
export function makeTrace(length = 6000): number[] {
  const rand = seeded(42);
  const trace: number[] = [];
  let fresh = 1000; // ids for new items, counting up
  const burst: number[] = [];
  // A favourite: low numbers are asked for far more often than high ones.
  const favourite = () => Math.floor(40 * rand() ** 2);
  for (let i = 0; i < length; i++) {
    const bursty = Math.floor(i / 750) % 2 === 1;
    if (bursty && rand() < 0.75) {
      // One of a dozen recent newcomers.
      if (burst.length < 12 || rand() < 0.2) burst.push(fresh++);
      if (burst.length > 12) burst.shift();
      trace.push(burst[Math.floor(rand() * burst.length)]);
    } else if (!bursty && rand() < 0.4) {
      trace.push(fresh++); // a one-off
    } else {
      trace.push(favourite());
    }
  }
  return trace;
}

export type Run = Record<PolicyName, { hits: boolean[]; rate: number }>;

/** Runs all three policies on the same trace with the same cache size. */
export function simulate(size = 24): Run {
  const trace = makeTrace();
  const run = {} as Run;
  for (const name of Object.keys(policies) as PolicyName[]) {
    const policy = policies[name](size);
    const hits = trace.map((key) => policy.request(key));
    run[name] = { hits, rate: hits.filter(Boolean).length / hits.length };
  }
  return run;
}
