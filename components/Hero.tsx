const NAME = "Harshavardhanan";

// Each letter is its own box so it can rise on its own. Separate boxes lose the
// font's built-in tightening between certain pairs (A next to V), so it is put
// back here by hand: letter number -> how far to pull it left, in em. The
// values were measured from Instrument Serif itself; AV and VA are the big ones.
const KERN: Record<number, number> = {
  1: -0.016, // HA
  2: -0.01, // AR
  4: -0.006, // SH
  5: -0.016, // HA
  6: -0.068, // AV
  7: -0.068, // VA
  8: -0.01, // AR
  9: -0.012, // RD
  10: -0.01, // DH
  11: -0.016, // HA
  12: -0.01, // AN
  13: -0.02, // NA
  14: -0.01, // AN
};

// The first screen. The name runs across the full width, in the middle, over
// the particle object (drawn by ParticleStage, see app/page.tsx), and inverts
// where it crosses the particles. The hero is two screens tall and its content
// stays put for the first of them, while the name shrinks up into the header
// (the movement is in components/Motion.tsx, under data-hero-name).
export function Hero() {
  return (
    <section data-hero data-zone="hero" className="hero">
      <div className="hero-pin px-gutter flex flex-col justify-center">
        {/* @container lets the name size itself from this box's width. */}
        <div className="@container">
          <h1 className="name" aria-label={NAME} data-hero-name>
            {[...NAME].map((letter, index) => (
              <span
                key={index}
                aria-hidden
                style={
                  {
                    "--i": index,
                    marginLeft: KERN[index] ? `${KERN[index]}em` : undefined,
                  } as React.CSSProperties
                }
              >
                {letter}
              </span>
            ))}
          </h1>
        </div>

        <div className="px-gutter absolute inset-x-0 bottom-8 flex items-end justify-between gap-8">
          <div>
            <p className="max-w-[30ch]">
              Software engineer &amp; founder. I build AI products end to end,
              from model to interface.
            </p>
            <p className="label mt-4 inline-flex items-center gap-2">
              <span className="status-dot" />
              currently building Odovox
            </p>
          </div>
          <p
            aria-hidden
            data-hero-fade
            className="scroll-cue label max-sm:hidden"
          >
            Scroll
          </p>
        </div>
      </div>
    </section>
  );
}
