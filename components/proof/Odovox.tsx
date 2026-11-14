import { media } from "@/lib/media";
import { Frame } from "../Frame";
import { MediaView } from "../MediaView";

// The real app (it is a phone app): the day's queue, the review screen and a
// prescription; then a recording of a consultation in the demo clinic.
const PHONES = [
  [
    "odovox-queue.png",
    "Odovox today screen: money collected, the patient in the chair, and the checkout queue",
  ],
  [
    "odovox-verify.png",
    "Odovox review screen: tooth 36, fees, and an allergy conflict flagged on a medicine",
  ],
  [
    "odovox-bill.png",
    "Odovox new prescription screen with dose, frequency and duration",
  ],
] as const;

export function OdovoxProof() {
  return (
    <>
      <div className="grid gap-x-8 gap-y-16 sm:grid-cols-3">
        {PHONES.map(([file, alt], index) => (
          <div key={file} className={index === 1 ? "sm:mt-24" : ""}>
            <Frame kind="phone" cursor="View">
              <MediaView
                media={media(file, "odovox")}
                alt={alt}
                sizes="(min-width: 640px) 30vw, 80vw"
                inPhone
                className="absolute inset-0"
              />
            </Frame>
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-5xl">
        <Frame kind="laptop" cursor="Play">
          <MediaView
            media={media("odovox-record.mp4", "odovox")}
            alt="Recording: a doctor records a consultation and confirms the record"
            sizes="(min-width: 1024px) 64rem, 100vw"
            className="absolute inset-0"
          />
        </Frame>
        <p className="label text-muted mt-5">
          The real product, in the demo clinic (fake patients only)
        </p>
      </div>
    </>
  );
}
