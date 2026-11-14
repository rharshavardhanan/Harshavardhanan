import type { ComponentType } from "react";
import type { Slug } from "@/content/projects";
import { AftermeetProof } from "./Aftermeet";
import { CacheProof } from "./Cache";
import { HallucinationProof } from "./Hallucination";
import { KattralProof } from "./Kattral";
import { OdovoxProof } from "./Odovox";
import { RoadProof } from "./Road";
import { ScpProof } from "./Scp";

// Each project's real material: screens, recordings and charts, arranged for
// its page. Every file in this folder is one project's.
export const proofs: Record<Slug, ComponentType> = {
  odovox: OdovoxProof,
  aftermeet: AftermeetProof,
  scp: ScpProof,
  road: RoadProof,
  kattral: KattralProof,
  cache: CacheProof,
  hallucination: HallucinationProof,
};
