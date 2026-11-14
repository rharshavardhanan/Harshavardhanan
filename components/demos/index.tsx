import type { ComponentType } from "react";
import type { Slug } from "@/content/projects";
import { AftermeetDemo } from "./AftermeetDemo";
import { CacheDemo } from "./CacheDemo";
import { HallucinationDemo } from "./HallucinationDemo";
import { KattralDemo } from "./KattralDemo";
import { OdovoxDemo } from "./OdovoxDemo";
import { RoadDemo } from "./RoadDemo";
import { ScpDemo } from "./ScpDemo";

// Which demo belongs to which project.
export const demos: Record<Slug, ComponentType> = {
  odovox: OdovoxDemo,
  scp: ScpDemo,
  aftermeet: AftermeetDemo,
  road: RoadDemo,
  kattral: KattralDemo,
  cache: CacheDemo,
  hallucination: HallucinationDemo,
};
