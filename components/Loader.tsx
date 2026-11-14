// The loader is plain HTML and CSS. The only JavaScript is this short script,
// which runs before the page is first drawn and decides whether to show it:
// only on the first visit in this browser session, and never for visitors who
// asked for reduced motion. It marks <html data-loading="in"> while the
// counter runs to 100 and the name fills from grey to white. Then:
//
//  - on the home page it waits: data-loading="gate" shows an Enter button,
//    with keyboard focus. Browsers only let a page make sound after a click,
//    a key or a tap (scrolling never counts), so this one click is what lets
//    the home ring tick from its very first panel (lib/sound.ts);
//  - on any other page it lifts by itself.
//
// Lifting: "out" (a 0.4s fade), then the mark goes and the home ring's panels
// fly in. The styles that react to these marks are under "Loader" in
// app/globals.css.
const SCRIPT = `(function () {
  try {
    var html = document.documentElement;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // The home ring is on its way: keep its fallback list out of sight
    // (components/ring/Ring.tsx clears this when it starts, or if it cannot).
    html.dataset.ring = "wait";
    setTimeout(function () {
      if (!document.querySelector('.ring[data-state="on"]')) delete html.dataset.ring;
    }, 6000);
    if (sessionStorage.getItem("loaded")) return;
    sessionStorage.setItem("loaded", "1");
    html.dataset.loading = "in";
    var lift = function () {
      html.dataset.loading = "out";
      setTimeout(function () { delete html.dataset.loading; }, 400);
    };
    setTimeout(function () {
      var enter = document.querySelector(".loader-enter");
      if (location.pathname !== "/" || !enter) return lift();
      html.dataset.loading = "gate";
      enter.focus({ preventScroll: true });
    }, 1500); // just after the count and the fill finish (1.4s, globals.css)
    // Pressing Enter. Listened for on the whole page, so it still works if
    // React redraws the button as the page starts up.
    document.addEventListener("click", function onEnter(event) {
      if (html.dataset.loading !== "gate") return;
      if (!event.target.closest || !event.target.closest(".loader-enter")) return;
      document.removeEventListener("click", onEnter, true);
      lift();
    }, true);
  } catch (error) {}
})();`;

export function Loader() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
      <div className="loader px-gutter" data-theme="ink">
        <p aria-hidden className="loader-count label text-muted py-5" />
        {/* The name, across the window: grey, filling with white from left to
            right as the counter runs to 100 (the copy on top is clipped). */}
        <div
          aria-hidden
          className="@container flex flex-1 flex-col justify-center"
        >
          <p className="loader-name">
            <span>Harshavardhanan</span>
            <span className="loader-fill">Harshavardhanan</span>
          </p>
        </div>
        {/* Shown on the home page once the count is done. */}
        <button type="button" className="loader-enter label">
          Enter
        </button>
      </div>
    </>
  );
}
