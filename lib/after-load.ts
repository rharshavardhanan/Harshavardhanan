// Runs `task` once the page has loaded and the browser has a quiet moment,
// so that work which is not needed for the first screen (the scroll
// animations, smooth scrolling) never competes with drawing it.
// Returns a function that cancels it if it has not run yet.
export function afterLoad(task: () => void): () => void {
  let idle = 0;
  let timer = 0;
  const schedule = () => {
    // Safari has no requestIdleCallback; a short wait does the same job.
    if (typeof window.requestIdleCallback === "function") {
      idle = window.requestIdleCallback(task, { timeout: 1500 });
    } else {
      timer = setTimeout(task, 200) as unknown as number;
    }
  };
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });
  return () => {
    window.removeEventListener("load", schedule);
    if (idle) window.cancelIdleCallback(idle);
    clearTimeout(timer);
  };
}
