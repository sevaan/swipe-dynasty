// Swipe input (spec 12.2–12.4). Dragging the card sideways previews an
// answer; letting go past about 28% of its width commits it, and anything
// less cancels. There is no flick shortcut, and a mostly vertical drag never
// commits. Nothing here changes the game: it only reports what the finger did.

export const COMMIT_FRACTION = 0.28;

export function bindSwipe(el, { canStart, onMove, onCancel, onCommit, onTap = () => {} }) {
  let drag = null;
  let quietUntil = 0;
  const threshold = () => el.offsetWidth * COMMIT_FRACTION;

  el.addEventListener('pointerdown', (e) => {
    if (drag || !canStart(e)) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, dy: 0, axis: null };
  });

  el.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    drag.dx = e.clientX - drag.x;
    drag.dy = e.clientY - drag.y;
    // Decide once whether this is a sideways drag or a vertical one. The
    // pointer is captured only for a sideways drag, so a plain tap on a
    // button inside the element still reaches that button.
    if (!drag.axis && Math.hypot(drag.dx, drag.dy) > 10) {
      drag.axis = Math.abs(drag.dx) > Math.abs(drag.dy) ? 'x' : 'y';
      if (drag.axis === 'x') { try { el.setPointerCapture(e.pointerId); } catch { /* the drag still works without capture */ } }
    }
    if (drag.axis !== 'x') return;
    e.preventDefault();
    onMove(drag.dx, drag.dy, threshold());
  });

  const finish = (e, cancelled) => {
    if (!drag || e.pointerId !== drag.id) return;
    const { dx, axis } = drag;
    drag = null;
    // Whatever a drag ends over, it isn't also a tap on it
    if (axis) quietUntil = performance.now() + 400;
    if (!axis && !cancelled) onTap();
    if (axis !== 'x') return;
    if (!cancelled && Math.abs(dx) >= threshold()) onCommit(dx < 0 ? 'left' : 'right');
    else onCancel();
  };
  el.addEventListener('pointerup', (e) => finish(e, false));
  el.addEventListener('pointercancel', (e) => finish(e, true));
  // Only the element's own capture ending counts. On a touch screen the
  // browser first captures the finger to whatever it touched inside the
  // element, and handing that capture to the element makes the inner piece
  // report a lost capture, which bubbles up here; that isn't the drag ending.
  el.addEventListener('lostpointercapture', (e) => { if (e.target === el) finish(e, true); });
  // Without capture, the release can land elsewhere.
  window.addEventListener('pointerup', (e) => finish(e, false));
  window.addEventListener('pointercancel', (e) => finish(e, true));
  el.addEventListener('click', (e) => {
    if (performance.now() < quietUntil) { e.stopPropagation(); e.preventDefault(); }
  }, true);
}

// A tap that only counts if it started after the element appeared or its
// contents last changed, so the press that ended the last screen can't also
// answer this one (spec 12.4).
export function bindTap(el, handler, { guardMs = 350 } = {}) {
  let shownAt = 0;
  let downAt = -1;
  const observer = new MutationObserver(() => { if (!el.hidden) shownAt = performance.now(); });
  observer.observe(el, { attributes: true, attributeFilter: ['hidden'], childList: true });
  // The page's own clock, not the event's timestamp, which some browsers count differently
  el.addEventListener('pointerdown', () => { downAt = performance.now(); });
  el.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (downAt < shownAt || performance.now() - shownAt < guardMs) return;
    handler(e);
  });
}
