/**
 * Minimal split-text utility (no paid SplitText plugin).
 * Wraps each word of an element in `.split-line > .split-word`
 * spans so GSAP can stagger-animate them with overflow clipping.
 */
export function splitWords(el: HTMLElement): HTMLElement[] {
  const text = el.textContent ?? "";
  const words = text.trim().split(/\s+/);
  el.textContent = "";
  el.setAttribute("aria-label", text.trim());

  const spans: HTMLElement[] = [];
  words.forEach((word, i) => {
    const line = document.createElement("span");
    line.className = "split-line";
    line.style.display = "inline-block";
    line.style.overflow = "clip";
    line.setAttribute("aria-hidden", "true");

    const inner = document.createElement("span");
    inner.className = "split-word";
    inner.textContent = word;

    line.appendChild(inner);
    el.appendChild(line);
    if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    spans.push(inner);
  });
  return spans;
}
