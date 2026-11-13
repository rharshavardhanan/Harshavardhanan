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

// The first screen: the name, the one-line introduction and the status pill.
// The particle object beside it is drawn by ParticleStage (see app/page.tsx).
export function Hero() {
  return (
    <section
      data-hero
      className="px-gutter pt-6 pb-20 lg:flex lg:min-h-[calc(100svh-3.625rem)] lg:flex-col-reverse lg:justify-between lg:pt-[9svh] lg:pb-10"
    >
      {/* @container lets the name size itself from this box's width. */}
      <div className="@container">
        <h1 className="name" aria-label={NAME}>
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
      <div className="mt-6 lg:mt-0 lg:max-w-[42%]">
        <p className="text-lead max-w-[34ch]">
          Software engineer &amp; founder. I build AI products end to end, from
          model to interface.
        </p>
        <p className="text-label border-line mt-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono">
          <span className="status-dot" />
          currently building Odovox
        </p>
      </div>
    </section>
  );
}
