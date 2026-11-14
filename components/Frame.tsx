// Device frames drawn in CSS, for showing screenshots and recordings:
//   browser  a window with a title bar (desktop web apps)
//   laptop   a screen on a base
//   phone    a tall rounded phone
// `tilt` makes the frame tip back and straighten as it scrolls into view
// (data-tilt, see components/Motion.tsx). `cursor` is the word the custom
// cursor shows over it ("View", "Play").
type Kind = "browser" | "laptop" | "phone";

export function Frame({
  kind,
  children,
  tilt = false,
  cursor,
  className = "",
}: {
  kind: Kind;
  children: React.ReactNode;
  tilt?: boolean;
  cursor?: string;
  className?: string;
}) {
  const shell = {
    browser:
      "rounded-xl border border-line bg-[#0b0b0b] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.55)]",
    laptop: "rounded-t-2xl border-[10px] border-[#1d1d1d] bg-[#0b0b0b]",
    phone:
      "mx-auto max-w-[19rem] rounded-[2.6rem] border-[10px] border-[#1d1d1d] bg-[#0b0b0b]",
  }[kind];
  const screen = {
    browser: "aspect-[16/10]",
    laptop: "aspect-[16/10]",
    phone: "aspect-[9/19.5]",
  }[kind];

  return (
    <div
      data-tilt={tilt || undefined}
      data-cursor={cursor}
      className={className}
    >
      <div className={`overflow-hidden ${shell}`}>
        {kind === "browser" && (
          <div aria-hidden className="flex gap-1.5 px-4 py-3">
            {[0, 1, 2].map((dot) => (
              <span key={dot} className="size-2.5 rounded-full bg-[#3a3a3a]" />
            ))}
          </div>
        )}
        <div className={`relative ${screen}`}>{children}</div>
      </div>
      {kind === "laptop" && (
        <div aria-hidden className="mx-[-4%] h-3 rounded-b-xl bg-[#2a2a2a]" />
      )}
    </div>
  );
}
