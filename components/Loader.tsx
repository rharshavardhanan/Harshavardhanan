// The loader is plain HTML and CSS. The only JavaScript is this short script,
// which runs before the page is first drawn and decides whether to show it:
// only on the first visit in this browser session, and never for visitors who
// asked for reduced motion. It marks <html data-loading="in">, switches to
// "out" (the fade) after 1.4s, and removes the mark after 2s. When the mark
// goes, the particles burst out and the name's letters rise. The styles that
// react to those marks are under "Loader" in app/globals.css.
const SCRIPT = `(function () {
  try {
    var html = document.documentElement;
    if (sessionStorage.getItem("loaded")) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    sessionStorage.setItem("loaded", "1");
    html.dataset.loading = "in";
    setTimeout(function () { html.dataset.loading = "out"; }, 1400);
    setTimeout(function () { delete html.dataset.loading; }, 2000);
  } catch (error) {}
})();`;

export function Loader() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
      <div aria-hidden className="loader px-gutter">
        <p className="loader-count label text-muted py-5" />
        {/* Same size and place as the name in the hero. */}
        <div className="@container flex flex-1 flex-col justify-center pb-[3.25rem]">
          <p className="name loader-initials font-serif">H.R.</p>
        </div>
      </div>
    </>
  );
}
