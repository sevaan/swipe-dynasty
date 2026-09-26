// Swipe input. Dragging previews an answer; letting go past the threshold
// (or flicking) commits it; letting go early cancels. Nothing here changes
// the game: it only reports what the finger did.

export function bindSwipe(el, { canStart, onMove, onCancel, onCommit }) {
  let drag = null;
  const threshold = () => Math.min(110, el.offsetWidth * 0.34);

  el.addEventListener('pointerdown', (e) => {
    if (drag || !canStart()) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), dx: 0, lastX: e.clientX, lastT: performance.now(), v: 0 };
    try { el.setPointerCapture(e.pointerId); } catch { /* some browsers refuse; drag still works */ }
    e.preventDefault();
  });

  el.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const now = performance.now();
    drag.v = (e.clientX - drag.lastX) / Math.max(now - drag.lastT, 1);
    drag.lastX = e.clientX;
    drag.lastT = now;
    drag.dx = e.clientX - drag.x;
    onMove(drag.dx, e.clientY - drag.y, threshold());
  });

  const finish = (e, cancelled) => {
    if (!drag || e.pointerId !== drag.id) return;
    const { dx, v, lastT } = drag;
    drag = null;
    // A flick only counts if the finger was still moving when it let go;
    // pausing to read the preview and then releasing is a cancel.
    const moving = performance.now() - lastT < 90;
    const flick = moving && Math.abs(dx) > 40 && Math.abs(v) > 0.55 && Math.sign(v) === Math.sign(dx);
    if (!cancelled && (Math.abs(dx) >= threshold() || flick)) onCommit(dx < 0 ? 'left' : 'right');
    else onCancel();
  };

  el.addEventListener('pointerup', (e) => finish(e, false));
  el.addEventListener('pointercancel', (e) => finish(e, true));
  el.addEventListener('lostpointercapture', (e) => finish(e, true));
  // If pointer capture was refused, the release can land elsewhere.
  window.addEventListener('pointerup', (e) => finish(e, false));
  window.addEventListener('pointercancel', (e) => finish(e, true));
}

export function bindTap(el, handler, { guardMs = 450 } = {}) {
  let shownAt = 0;
  const observer = new MutationObserver(() => { if (!el.hidden) shownAt = performance.now(); });
  observer.observe(el, { attributes: true, attributeFilter: ['hidden'] });
  el.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (performance.now() - shownAt < guardMs) return; // the swipe that ended a life isn't a tap
    handler();
  });
}
