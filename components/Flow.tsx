// The architecture diagram: the steps a request or a piece of data passes
// through, joined by a line that draws itself as you scroll (data-bar-y, see
// components/Motion.tsx). Each step's name is large; its number is small.
export function Flow({ steps }: { steps: string[] }) {
  return (
    <ol className="flow">
      {steps.map((step, index) => (
        <li key={step}>
          <span aria-hidden className="flow-node" />
          {index < steps.length - 1 && (
            <span aria-hidden data-bar-y className="flow-line" />
          )}
          <span className="label text-accent">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-h3 font-serif" data-lines>
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}
