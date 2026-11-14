import { media } from "@/lib/media";
import { MediaView } from "../MediaView";
import { SyncedClips } from "../SyncedClips";

// The same simulated task, same starting position (seed 230044), three ways.
// Recordings from the project repository, slowed to a quarter of real speed.
const SAME_START = [
  {
    src: "/media/real/scp-cheap.mp4",
    title: "Cheap policy alone",
    outcome: "Fails",
    good: false,
    note: "The small, fast policy reaches the cube but never pushes it home.",
  },
  {
    src: "/media/real/scp-arbitrated.mp4",
    title: "Cheap, with the monitor",
    outcome: "Succeeds",
    good: true,
    note: "The monitor’s score crosses its threshold, so control passes to the expert, which finishes the push.",
  },
  {
    src: "/media/real/scp-expert.mp4",
    title: "Expert alone",
    outcome: "Succeeds",
    good: true,
    note: "The large policy succeeds too, but uses the expensive model for every step.",
  },
];

// A lab notebook: the same task three ways side by side, the handover live on
// its dashboard, then the monitor itself at work on a LIBERO task (one run it
// flags, one it leaves alone).
export function ScpProof() {
  return (
    <>
      <div>
        <h3 className="label text-muted mb-8">
          One starting position, three ways · simulated, quarter speed
        </h3>
        <SyncedClips clips={SAME_START} />
        <p className="label text-muted mt-10 max-w-[70ch]">
          One seed is an anecdote. Over 500 seeds the monitor-triggered handover
          beat the cheap policy by 9 points, but did not beat handing over at
          random moments with the same expert budget.
        </p>
      </div>

      <div data-cursor="Play" className="mx-auto max-w-4xl">
        <MediaView
          media={media("scp-arena.mp4", "scp")}
          alt="Recording of the handover dashboard: the run starts on the cheap policy, the monitor escalates to the expert, and the push succeeds"
          sizes="(min-width: 1024px) 56rem, 100vw"
          className="aspect-[1500/1076] rounded-lg bg-[#0b0b0b]"
        />
        <p className="label text-muted mt-5">
          The handover, live (seed 400016): cheap policy, escalated to the
          expert, pushed home
        </p>
      </div>

      <div className="grid grid-cols-12 gap-x-4 gap-y-12">
        <div className="col-span-12 lg:col-span-4">
          <h3 className="text-h3 font-serif">
            The monitor, watching a robot in LIBERO
          </h3>
          <p className="text-muted mt-6 max-w-[38ch]">
            A frozen diffusion policy works a kitchen task. The tracking error
            (dark line) is checked against the threshold for the current stage
            (dashed). Press play, or drag through it.
          </p>
        </div>
        <div className="col-span-12 grid gap-x-6 gap-y-12 md:grid-cols-2 lg:col-span-8">
          <Watch
            src="/media/real/scp-monitor-fail.mp4"
            title="Flagged mid-episode"
            note="The error stays over the reach threshold and the arm stalls: violation, long before the episode ends."
          />
          <Watch
            src="/media/real/scp-monitor-safe.mp4"
            title="Left alone"
            note="A normal run crosses every stage under its threshold. No alarm."
          />
        </div>
      </div>
    </>
  );
}

// A recording with the browser's own controls. (Not a <figure>: the page's
// one figure is its demo.)
function Watch({
  src,
  title,
  note,
}: {
  src: string;
  title: string;
  note: string;
}) {
  return (
    <div>
      <video
        controls
        muted
        playsInline
        preload="metadata"
        aria-label={`${title}: ${note}`}
        className="aspect-[5/3] w-full rounded-lg bg-[#0b0b0b] object-contain"
      >
        <source src={src} type="video/mp4" />
      </video>
      <p className="label mt-4">{title}</p>
      <p className="text-muted mt-2">{note}</p>
    </div>
  );
}
