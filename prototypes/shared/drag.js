// Dragging with real physics, for the prototypes. It reports where the
// finger is and how fast it's moving; the prototype decides what that
// means. Works with touch and mouse. Touch needs care: a phone captures a
// finger to whatever it touched first, so capture is taken only once the
// drag is clearly sideways (or vertical, if asked), and a lost capture
// that bubbles up from inside the element is ignored.
//
//   const stop = drag(el, {
//     axis: 'x',                       // 'x', 'y' or 'both'
//     start(e) { return true },        // false to ignore this press
//     move({ dx, dy, vx, vy }) {},     // px, and px per ms
//     end({ dx, dy, vx, vy, cancelled }) {},
//     tap(e) {},                       // a press that didn't move
//   });

export function drag(el, { axis = 'x', start = () => true, move = () => {}, end = () => {}, tap = () => {} } = {}) {
  let d = null;
  const now = () => performance.now();
  const down = (e) => {
    if (d || (e.pointerType === 'mouse' && e.button !== 0) || start(e) === false) return;
    d = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, t: now(), vx: 0, vy: 0, dir: null, target: e.target };
  };
  const moveH = (e) => {
    if (!d || e.pointerId !== d.id) return;
    const t = now();
    const dt = Math.max(1, t - d.t);
    // An exponentially smoothed velocity, so one jittery sample doesn't dominate
    d.vx = 0.8 * ((e.clientX - d.x) / dt) + 0.2 * d.vx;
    d.vy = 0.8 * ((e.clientY - d.y) / dt) + 0.2 * d.vy;
    d.x = e.clientX; d.y = e.clientY; d.t = t;
    const dx = d.x - d.x0;
    const dy = d.y - d.y0;
    if (!d.dir && Math.hypot(dx, dy) > 8) {
      d.dir = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (axis === 'both' || axis === d.dir) { try { el.setPointerCapture(e.pointerId); } catch { /* fine without */ } }
    }
    if (!d.dir || (axis !== 'both' && d.dir !== axis)) return;
    e.preventDefault();
    move({ dx, dy, vx: d.vx, vy: d.vy });
  };
  const finish = (e, cancelled) => {
    if (!d || e.pointerId !== d.id) return;
    const r = { dx: d.x - d.x0, dy: d.y - d.y0, vx: d.vx, vy: d.vy, cancelled };
    const was = d;
    d = null;
    // A release after a pause isn't a flick
    if (now() - was.t > 90) { r.vx = 0; r.vy = 0; }
    if (!was.dir) { if (!cancelled) tap(e); return; }
    if (axis !== 'both' && was.dir !== axis) return;
    end(r);
  };
  const up = (e) => finish(e, false);
  const cancel = (e) => finish(e, true);
  const lost = (e) => { if (e.target === el) finish(e, true); };
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', moveH);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', cancel);
  el.addEventListener('lostpointercapture', lost);
  window.addEventListener('pointerup', up);
  return () => {
    el.removeEventListener('pointerdown', down);
    el.removeEventListener('pointermove', moveH);
    el.removeEventListener('pointerup', up);
    el.removeEventListener('pointercancel', cancel);
    el.removeEventListener('lostpointercapture', lost);
    window.removeEventListener('pointerup', up);
  };
}

// A spring for settling things back: animate(el, from, to, onFrame) with a
// damped spring, so motion eases in naturally rather than on a fixed curve.
export function spring(from, to, onFrame, { stiffness = 260, damping = 22, mass = 1, done = () => {} } = {}) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { onFrame(to); done(); return () => {}; }
  let x = from;
  let v = 0;
  let last = performance.now();
  let raf = 0;
  const tick = (t) => {
    const dt = Math.min(0.032, (t - last) / 1000);
    last = t;
    const f = -stiffness * (x - to) - damping * v;
    v += (f / mass) * dt;
    x += v * dt;
    onFrame(x);
    if (Math.abs(v) < 0.01 && Math.abs(x - to) < 0.1) { onFrame(to); done(); return; }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

// A light tap of the phone's vibration motor, where there is one (Android)
export const buzz = (ms = 8) => { try { navigator.vibrate?.(ms); } catch { /* no motor */ } };
