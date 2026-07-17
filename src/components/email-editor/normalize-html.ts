/**
 * Runs HTML through the browser's own parser so any structure the parser
 * would auto-correct (e.g. a <ul> the browser's execCommand nested inside
 * a <p>, which is invalid — <p> can't contain block content) gets fixed up
 * front. Without this, storing the raw live-DOM string and later
 * re-parsing it via innerHTML on undo/redo silently restructures the
 * paragraph tags each time, since HTML parsing auto-closes a <p> before
 * block-level children it can't legally contain.
 */
export function normalizeEditorHtml(html: string): string {
  const container = document.createElement("div");
  container.innerHTML = html;
  container.querySelectorAll("p").forEach((paragraph) => {
    if (paragraph.childNodes.length === 0) paragraph.remove();
  });
  return container.innerHTML;
}

/** Moves the caret to the end of an element's content — used after a full innerHTML replacement. */
export function moveCursorToEnd(element: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}
