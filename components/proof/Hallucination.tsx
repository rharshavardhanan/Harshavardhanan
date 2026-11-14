import { media } from "@/lib/media";
import { MediaView } from "../MediaView";

// The ensemble's ROC curve on the held-out test set.
export function HallucinationProof() {
  return (
    <div className="mx-auto max-w-4xl" data-cursor="View">
      <MediaView
        media={media("halluc-roc.png", "hallucination")}
        alt="ROC curve of the LightGBM and CatBoost ensemble"
        sizes="(min-width: 1024px) 56rem, 100vw"
        className="aspect-[4/3] rounded-xl"
      />
      <p className="label text-muted mt-5">ROC curve, held-out test set</p>
    </div>
  );
}
