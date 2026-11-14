import { media } from "@/lib/media";
import { MediaView } from "../MediaView";

// A real frame of the detector's output, and the repair plan it fed.
export function RoadProof() {
  return (
    <div className="grid gap-x-8 gap-y-16 lg:grid-cols-[3fr_2fr] lg:items-end">
      <div data-cursor="View">
        <MediaView
          media={media("road-detections.png", "road")}
          position="object-left"
          alt="A dashcam frame from an Indian road with the detector’s boxes drawn on two potholes"
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="aspect-[16/9] rounded-xl"
        />
        <p className="label text-muted mt-5">
          The detector on an Indian road: two potholes boxed
        </p>
      </div>
      <div data-cursor="View">
        <MediaView
          media={media("road-map.png", "road")}
          alt="Repair-allocation chart from the budget repair optimiser"
          sizes="(min-width: 1024px) 38vw, 100vw"
          className="aspect-[5/3] rounded-xl"
        />
        <p className="label text-muted mt-5">
          Where the budget optimiser sends the repairs
        </p>
      </div>
    </div>
  );
}
