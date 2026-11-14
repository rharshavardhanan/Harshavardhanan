// The architecture diagram: the steps a request or a piece of data passes
// through, top to bottom, joined by a line. Each step eases in as it is
// scrolled to (data-lines, see app/globals.css).
export function Flow({ steps }: { steps: string[] }) {
  return (
    <ol className="flow">
      {steps.map((step, index) => (
        <li key={step} data-lines>
          <span className="label text-accent font-mono">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-h3">{step}</span>
        </li>
      ))}
    </ol>
  );
}
