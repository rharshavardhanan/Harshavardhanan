// The two colour layers behind a themed section: the previous section's
// colour underneath, and this section's own colour on top. The top one is
// what components/Motion.tsx reveals as a circle (the colour wipe).
// Put it first inside a <section data-theme="..." className="paint">.
export function SectionPaint({ prev }: { prev: string }) {
  return (
    <>
      <div aria-hidden data-theme={prev} className="paint-prev" />
      <div aria-hidden data-wipe-layer className="paint-own" />
    </>
  );
}
