"use client";

import { useEffect } from "react";
import { install } from "@/lib/sound";

// Renders nothing. Sets up the site's sounds once (lib/sound.ts): the home
// ring's tick, and the small click, blip and whoosh.
export function Sounds() {
  useEffect(install, []);
  return null;
}
