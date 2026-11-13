"use client";

import { useSyncExternalStore } from "react";
import { formatIST } from "@/lib/ist";

// Asks React to re-check the time once a second.
function subscribe(onTick: () => void) {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
}

const getTime = () => formatIST(new Date());
// The server cannot know when the page will be read, so it sends a blank.
const getServerTime = () => "--:--";

// useSyncExternalStore re-renders only when the "HH:MM" text really changes
// (once a minute), and avoids a mismatch between server and browser HTML.
export function Clock() {
  const time = useSyncExternalStore(subscribe, getTime, getServerTime);
  return <time dateTime={time === "--:--" ? undefined : time}>{time} IST</time>;
}
