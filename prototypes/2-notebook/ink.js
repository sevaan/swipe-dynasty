// Ink for the Notebook: hand-drawn marks (boxes, ticks, rings, underlines,
// arrows) as SVG paths, drawn with a stroke that grows along its length, and
// the handwriting-like reveal that writes a result in word by word.
// Every mark is generated from a seed, so a page always looks the same but
// no two pages are drawn quite alike.

export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// A small seeded random (mulberry32)
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n) => Math.round(n * 10) / 10;
const pt = (p) => `${f(p[0])} ${f(p[1])}`;

// A smooth stroke through points (Catmull-Rom as cubic Béziers)
export function smooth(pts) {
  let d = `M${pt(pts[0])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return d;
}

// A square box, s wide, drawn as one quick stroke: slightly bowed sides,
// sharp corners, and a small overshoot where the pen comes back round
export function boxPath(s, r) {
  const j = (a) => (r() - 0.5) * a;
  const c = [[j(1.4), j(1.4)], [s + j(1.4), j(1.2)], [s + j(1.2), s + j(1.4)], [j(1.4), s + j(1.2)]];
  const mid = (a, b, bow) => [(a[0] + b[0]) / 2 + bow[0], (a[1] + b[1]) / 2 + bow[1]];
  const end = [c[0][0] + 3 + j(1), c[0][1] - 1.2 + j(0.8)];
  return `M${pt(c[0])}Q${pt(mid(c[0], c[1], [0, j(1.6)]))} ${pt(c[1])}`
    + `Q${pt(mid(c[1], c[2], [j(1.6), 0]))} ${pt(c[2])}`
    + `Q${pt(mid(c[2], c[3], [0, j(1.6)]))} ${pt(c[3])}`
    + `Q${pt(mid(c[3], c[0], [j(1.6), 0]))} ${pt(c[0])}`
    + `L${pt(end)}`;
}

// A tick in a box s wide: a short stroke down, then a long flick up and out
export function tickPath(s, r) {
  const j = (a) => (r() - 0.5) * a;
  const a = [s * 0.14 + j(2), s * 0.5 + j(2)];
  const b = [s * 0.42 + j(1.5), s * 0.9 + j(1)];
  const c = [s * 1.2 + j(3), s * -0.34 + j(3)];
  const q1 = [(a[0] + b[0]) / 2 - 1.5, (a[1] + b[1]) / 2 + 1.5];
  const q2 = [b[0] + (c[0] - b[0]) * 0.3, b[1] + (c[1] - b[1]) * 0.5 + 3];
  return `M${pt(a)}Q${pt(q1)} ${pt(b)}Q${pt(q2)} ${pt(c)}`;
}

// A loose loop round a line of text (the box x, y, w, h): a rounded,
// slightly tilted oval, drawn a little more than once round so the ends overlap
export function ringPath(x, y, w, h, r) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const rx = w / 2 + 11;
  const ry = h / 2 + 7;
  const tilt = (r() - 0.5) * 0.035;
  const w1 = r() * 6.28;
  const w2 = r() * 6.28;
  const start = Math.PI * (0.94 + r() * 0.08); // begins on the left, a touch above the middle
  const turn = 2 * Math.PI * 1.07;
  const pts = [];
  const n = 56;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = start - t * turn; // anticlockwise, as most hands draw it
    const k = 1 + 0.03 * Math.sin(a * 2 + w1) + 0.018 * Math.sin(a * 3 + w2) + (t - 0.5) * 0.06;
    // a superellipse, so a long line gets a rounded-rectangle loop, not a lemon
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const px = rx * k * Math.sign(ca) * Math.abs(ca) ** 0.62;
    const py = ry * k * Math.sign(sa) * Math.abs(sa) ** 0.62;
    pts.push([cx + px * Math.cos(tilt) - py * Math.sin(tilt), cy + px * Math.sin(tilt) + py * Math.cos(tilt)]);
  }
  return smooth(pts);
}

// An underline w long: a slightly wavering line that lifts at the end
export function underlinePath(w, r, y = 0) {
  const j = (a) => (r() - 0.5) * a;
  const n = 7;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push([t * w + j(2), y + j(1.4) - t * 1.6 + Math.sin(t * Math.PI) * 0.8]);
  }
  pts[n][1] -= 2.5;
  return smooth(pts);
}

// A little arrow for the margin, w long, pointing left or right
export function arrowPath(w, dir, r) {
  const j = (a) => (r() - 0.5) * a;
  const y = 8;
  const from = dir === 'left' ? w : 0;
  const to = dir === 'left' ? 0 : w;
  const s = Math.sign(to - from);
  const shaft = smooth([[from, y + j(1)], [(from + to) / 2, y + j(1.6)], [to, y + j(0.8)]]);
  const head = `M${f(to - s * 6.5)} ${f(y - 5 + j(1))}L${f(to)} ${f(y)}L${f(to - s * 6.5)} ${f(y + 5 + j(1))}`;
  return `${shaft}${head}`;
}

// ---- Strokes that draw themselves

// Get a path ready to be drawn: hidden, with its length known
export function prep(path, shown = 0) {
  const L = path.getTotalLength() + 1;
  path.dataset.len = L;
  path.style.strokeDasharray = `${L} ${L}`;
  setStroke(path, shown);
  return L;
}

// Show a path drawn to p (0 to 1) of its length
export function setStroke(path, p) {
  const L = Number(path.dataset.len) || 1;
  const q = Math.max(0, Math.min(1, p));
  path.style.strokeDashoffset = `${L * (1 - q)}`;
  path.dataset.p = q;
}
export const strokeAt = (path) => Number(path.dataset.p) || 0;

// ---- Timing

export const ease = {
  out: (t) => 1 - (1 - t) ** 3,
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  // the pen: a quick start and a soft finish
  pen: (t) => 1 - (1 - t) ** 2.2,
  // a page turn: a gentle lift, a quick sweep, a soft landing
  turn: (t) => (t < 0.42 ? 0.5 * (t / 0.42) ** 2.1 : 1 - 0.5 * ((1 - t) / 0.58) ** 2.4),
};

// A frame-by-frame tween: onFrame gets the eased progress, 0 to 1.
// Returns { done, cancel, finish }.
export function tween(duration, onFrame, { easing = ease.out, delay = 0 } = {}) {
  let raf = 0;
  let over = false;
  let resolve;
  const done = new Promise((r) => { resolve = r; });
  const stop = (last) => {
    if (over) return;
    over = true;
    cancelAnimationFrame(raf);
    if (last != null) onFrame(last);
    resolve();
  };
  if (duration <= 0 || reduced()) {
    onFrame(1);
    over = true;
    resolve();
    return { done, cancel() {}, finish() {} };
  }
  const t0 = performance.now() + delay;
  const tick = (now) => {
    if (over) return;
    const t = Math.min(1, Math.max(0, (now - t0) / duration));
    onFrame(easing(t));
    if (t < 1) raf = requestAnimationFrame(tick);
    else stop();
  };
  raf = requestAnimationFrame(tick);
  return { done, cancel: () => stop(), finish: () => stop(1) };
}

// Draw a path from where it is to p over a duration
export function drawTo(path, p, duration, opts = {}) {
  const from = strokeAt(path);
  return tween(duration * Math.abs(p - from), (e) => setStroke(path, from + (p - from) * e), opts);
}

// ---- Writing a result in

// Splits text into sentences and words, then reveals each word left to
// right, the way ink follows a pen: sentence by sentence, with a breath
// between them. Returns { done, finish }: finish() writes the rest at once.
export function writeText(el, text, { msPerChar = 7.5, pause = 130, delay = 0 } = {}) {
  el.textContent = '';
  const sentences = text.match(/[^.!?]+[.!?]+["'”’)]*\s*|[^.!?]+$/g) || [text];
  const words = [];
  let t = delay;
  for (const sentence of sentences) {
    const s = document.createElement('span');
    s.className = 'sentence';
    for (const part of sentence.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) { s.append(' '); continue; }
      const w = document.createElement('span');
      w.className = 'w';
      w.textContent = part;
      s.append(w);
      words.push({ w, at: t, dur: Math.max(70, part.length * msPerChar * 2.1) });
      t += (part.length + 1) * msPerChar;
    }
    el.append(s);
    t += pause;
  }
  if (reduced()) {
    const a = el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: 'ease-out' });
    return { done: a.finished.catch(() => {}), finish() { a.finish(); } };
  }
  const anims = words.map(({ w, at, dur }) => w.animate(
    [{ clipPath: 'inset(0 100% 0 0)', opacity: 0.35 }, { clipPath: 'inset(0 0 0 0)', opacity: 1 }],
    { delay: at, duration: dur, easing: 'cubic-bezier(.3,.55,.35,1)', fill: 'backwards' },
  ));
  const done = Promise.all(anims.map((a) => a.finished.catch(() => {}))).then(() => {});
  return { done, finish() { for (const a of anims) { try { a.finish(); } catch { /* already done */ } } } };
}
