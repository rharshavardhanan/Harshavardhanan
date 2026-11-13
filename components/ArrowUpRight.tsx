// The "leaves this page" arrow. Drawn as SVG so it looks the same in every
// font, and sized in em so it scales with the text beside it. Pass
// className="rotate-45" to make it point right ("go on to the next thing").
export function ArrowUpRight({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 10 10"
      className={`ml-1 inline-block size-[0.7em] fill-none stroke-current ${className}`}
      strokeWidth="1.25"
    >
      <path d="M1.5 8.5 8.5 1.5M3 1.5h5.5V7" />
    </svg>
  );
}
