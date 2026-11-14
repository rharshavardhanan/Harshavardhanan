import { media } from "@/lib/media";
import { Frame } from "../Frame";
import { MediaView } from "../MediaView";

// The real dashboard, recorded for ten seconds.
export function CacheProof() {
  return (
    <div className="mx-auto max-w-5xl">
      <Frame kind="laptop" cursor="Play">
        <MediaView
          media={media("cache-dashboard.mp4", "cache")}
          alt="Recording: the Edge Cache RL dashboard running and comparing policies"
          sizes="(min-width: 1024px) 64rem, 100vw"
          className="absolute inset-0"
        />
      </Frame>
      <p className="label text-muted mt-5 max-w-[60ch]">
        A 10-second live run of the real dashboard. On this short run all four
        policies happen to tie.
      </p>
    </div>
  );
}
