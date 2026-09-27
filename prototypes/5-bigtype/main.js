// Big Type: how the prototype behaves. The design note is at the top of
// index.html. Every word comes from the life (the script) or its ui words.
import { loadLife } from '../shared/life.js';
import { createFlow } from '../shared/flow.js';
import { drag, spring, buzz } from '../shared/drag.js';

const stage = document.getElementById('stage');
const bar = document.getElementById('bar');
const live = document.getElementById('live');
const themeMeta = document.getElementById('themeColor');

const motion = matchMedia('(prefers-reduced-motion: reduce)');
const still = () => motion.matches;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const easeOut = (t) => 1 - (1 - t) ** 3;

const THRESHOLD = 0.3; // of the page width: a drag this far chooses
const FLICK = 0.5;     // px per ms: a flick this fast chooses from any distance
const PRESS = 0.14;    // how far a row fills while it's held down

// ?safe fakes an iPhone's safe areas, for testing in a desktop browser
if (new URLSearchParams(location.search).has('safe')) {
  document.documentElement.style.setProperty('--safe-t', '47px');
  document.documentElement.style.setProperty('--safe-b', '34px');
}

let life = null;
let flow = null;
let current = null;  // the page on screen
let busy = true;     // true while a page is changing
let shownAt = 0;     // when the current page finished arriving
let lastDown = -1e9; // when a pointer last went down
let pending = null;  // how the next page should arrive
let stopHint = () => {};
let hinted = false;

// ---------- Small helpers ----------

function el(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else e.setAttribute(k, v === true ? '' : String(v));
  }
  for (const kid of kids.flat()) if (kid != null) e.append(kid);
  return e;
}

const ARROWS = {
  left: '<svg class="arrow" viewBox="0 0 28 16" aria-hidden="true" focusable="false"><path d="M26 8H2.5M9 1.8 2.5 8 9 14.2"/></svg>',
  right: '<svg class="arrow" viewBox="0 0 28 16" aria-hidden="true" focusable="false"><path d="M2 8h23.5M19 1.8 25.5 8 19 14.2"/></svg>',
};
function arrow(dir) {
  const t = document.createElement('template');
  t.innerHTML = ARROWS[dir];
  return t.content.firstChild;
}

const img = (src, cls) => el('img', { src, alt: '', class: cls, draggable: 'false', decoding: 'async' });

// ---------- Colour: the life's accent, and cousins that read as text ----------

const hex2rgb = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const rgb2hex = (c) => `#${c.map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('')}`;
function luminance(c) {
  const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
function rgb2hsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
}
function hsl2rgb([h, s, l]) {
  const f = (n) => { const k = (n + h * 12) % 12; const a = s * Math.min(l, 1 - l); return 255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))); };
  return [f(0), f(8), f(4)];
}
// Move the colour's lightness (down, dir -1; up, dir 1) until it reaches the contrast target
function towards(hex, bg, target, dir) {
  const B = hex2rgb(bg);
  let [h, s, l] = rgb2hsl(hex2rgb(hex));
  let c = hex2rgb(hex);
  for (let i = 0; i < 100 && contrast(c, B) < target; i++) { l = clamp(l + dir * 0.01, 0, 1); c = hsl2rgb([h, s, l]); }
  return rgb2hex(c);
}
function applyTheme(theme) {
  const a = /^#[0-9a-f]{6}$/i.test(theme?.accent || '') ? theme.accent : '#e8793a';
  const s = document.documentElement.style;
  s.setProperty('--accent', a);
  s.setProperty('--accent-ink', towards(a, '#f4eee3', 6.2, -1));
  s.setProperty('--accent-lite', towards(a, '#25221f', 7, 1));
}

// ---------- Fills: the accent wiping across a row ----------

function tween(from, to, ms, onFrame) {
  let raf = 0;
  let guard = 0;
  let done;
  const finished = new Promise((r) => { done = () => { clearTimeout(guard); r(); }; });
  if (still() || ms <= 0 || from === to) { onFrame(to); done(); return { finished, cancel() {} }; }
  const t0 = performance.now();
  const tick = (t) => {
    const k = Math.min(1, Math.max(0, t - t0) / ms);
    onFrame(from + (to - from) * easeOut(k));
    if (k < 1) raf = requestAnimationFrame(tick); else done();
  };
  raf = requestAnimationFrame(tick);
  // If frames stop (a hidden or throttled page), finish on time anyway
  guard = setTimeout(() => { cancelAnimationFrame(raf); onFrame(to); done(); }, ms + 150);
  return { finished, cancel() { cancelAnimationFrame(raf); done(); } };
}

// An animation's end, or its planned end if the page stops drawing frames:
// a page change must never leave the game waiting
function ended(anim) {
  const t = anim.effect.getComputedTiming();
  return Promise.race([anim.finished.catch(() => {}), wait((t.endTime || 0) + 250)]);
}

const paint = (row, f) => { row._f = f; row.style.setProperty('--f', f.toFixed(4)); };
function setFill(row, f) { row._tw?.cancel(); row._tw = null; paint(row, f); }
function fillTo(row, to, ms) {
  row._tw?.cancel();
  row._tw = tween(row._f || 0, to, ms, (v) => paint(row, v));
  return row._tw.finished;
}

// ---------- Building the pages ----------

function sheet(cls) {
  return el('section', { class: `page ${cls}`, tabindex: '-1' });
}

// A full-width answer row: an arrow on its side, a bold label, and an accent
// copy of both that the wipe reveals from that side.
function row(kind, label, aria) {
  const b = el('button', { type: 'button', class: `row ${kind}`, 'data-side': kind, 'aria-label': aria });
  const content = () => [arrow(kind === 'left' ? 'left' : 'right'), el('span', { class: 'label', text: label })];
  b.append(...content(), el('span', { class: 'fill', 'aria-hidden': 'true' }, ...content()));
  b.addEventListener('pointerdown', onRowDown);
  b.addEventListener('click', onRowClick);
  return b;
}

function picture(p, before) {
  const frame = el('div', { class: 'frame' });
  const [bench, ...objects] = p.layers;
  frame.append(img(bench));
  const was = before ? before.layers.slice(1) : null;
  if (was && was.join() !== objects.join()) {
    // A result: the old state, then the new one to develop over it
    was.forEach((u) => frame.append(img(u, 'before')));
    objects.forEach((u) => frame.append(img(u, 'after')));
  } else {
    objects.forEach((u) => frame.append(img(u)));
  }
  return el('figure', { class: 'pic', role: 'img', 'aria-label': p.label }, frame);
}

const face = (person) => (person?.portrait ? el('span', { class: 'face', 'aria-hidden': 'true' }, img(person.portrait)) : null);

function backLink() {
  const a = el('a', { class: 'back', href: '../' }, arrow('left'), el('span', { text: 'Prototypes' }));
  a.addEventListener('pointerdown', (e) => e.stopPropagation());
  return a;
}

function buildArrival() {
  const pg = sheet('arrival cover');
  pg.append(
    el('div', { class: 'head', 'data-rise': 0 }, backLink()),
    el('h1', { class: 'name lines', 'data-rise': 80, text: life.inventor.name }),
    el('p', { class: 'role', 'data-rise': 320, text: life.inventor.role }),
    el('div', { class: 'rule', 'data-rise': 400, 'aria-hidden': 'true' }),
    el('p', { class: 'kicker dateline', 'data-rise': 440, text: life.era }),
    el('p', { class: 'lede', 'data-rise': 460, text: life.arrival }),
    el('div', { class: 'want', 'data-rise': 560 },
      el('p', { class: 'want-k', text: life.ui.wantPrefix }),
      el('p', { class: 'want-t', text: life.inventor.want })),
    el('div', { class: 'foot', 'data-rise': 680 }, row('go', life.ui.beginLife)),
  );
  return pg;
}

function buildCard({ index, card }) {
  const pg = sheet('bench decide');
  const help = index === 0 ? life.ui.helperFirst : index === 1 ? life.ui.helperSecond : '';
  pg.append(
    picture(life.picture(index, 'before', flow.choices)),
    el('div', { class: 'gap above', 'aria-hidden': 'true' }),
    el('div', { class: 'words' },
      el('p', { class: 'speaker' }, face(card.speaker), el('span', { text: card.speaker.name })),
      el('p', { class: 'say', text: card.text })),
    el('div', { class: 'gap below', 'aria-hidden': 'true' }),
    el('div', { class: 'foot' },
      help ? el('p', { class: 'helper', text: help }) : null,
      row('left', card.left.label, `Left: ${card.left.label}`),
      row('right', card.right.label, `Right: ${card.right.label}`)),
  );
  return pg;
}

function buildResult({ index, side, option }) {
  const pg = sheet('bench result');
  const tag = el('span', { class: 'tag' });
  const label = el('span', { text: option.label });
  if (side === 'left') tag.append(arrow('left'), label); else tag.append(label, arrow('right'));
  pg.append(
    el('div', { class: 'words' },
      el('p', { class: 'chosen' }, tag),
      el('p', { class: 'say', text: option.result })),
    picture(life.picture(index, side, flow.choices), life.picture(index, 'before', flow.choices)),
    el('div', { class: 'foot' }, row('go', life.ui.resultContinue)),
  );
  return pg;
}

function buildReveal() {
  const side = flow.choices[life.cards[3].id] || 'left';
  const p = life.picture(3, side, flow.choices);
  // On the plinth the object is at rest: no smoke, flames, steam or glints
  const objects = p.layers.slice(1).filter((u) => !/\/overlays\/(smoke|flames|steam|glint)\.svg$/.test(u));
  const pg = sheet('reveal cover dark');
  pg.append(
    el('p', { class: 'kicker', 'data-rise': 40, text: life.ui.revealKicker }),
    el('h1', { class: 'inv lines', 'data-rise': 140, text: life.invention.name }),
    el('figure', { class: 'exhibit', 'data-rise': 380, role: 'img', 'aria-label': p.label }, [life.exhibit, ...objects].map((u) => img(u))),
    el('p', { class: 'desc', 'data-rise': 600, text: life.invention.description }),
    el('p', { class: 'first', 'data-rise': 720, text: life.ui.revealFirst }),
    el('div', { class: 'foot', 'data-rise': 820 }, row('go', life.ui.revealAction)),
  );
  return pg;
}

function buildEpitaph() {
  const e = flow.epitaph();
  const pg = sheet('epitaph cover dark');
  pg.append(
    el('div', { class: 'head', 'data-rise': 880 }, backLink()),
    el('div', { class: 'gap above', 'aria-hidden': 'true' }),
    el('h1', { class: 'name lines', 'data-rise': 60, 'data-dur': 1100, text: e.name }),
    el('p', { class: 'invented', 'data-rise': 380, text: e.invented }),
    el('div', { class: 'rule', 'data-rise': 520, 'aria-hidden': 'true' }),
    el('p', { class: 'obit', 'data-rise': 580, text: e.death }),
    el('p', { class: 'legacy', 'data-rise': 760, text: e.legacy }),
    el('div', { class: 'gap below', 'aria-hidden': 'true' }),
    el('div', { class: 'foot', 'data-rise': 900 }, row('go', life.ui.epitaphAction)),
  );
  return pg;
}

function build(step) {
  const pg = step.type === 'arrival' ? buildArrival()
    : step.type === 'card' ? buildCard(step)
    : step.type === 'result' ? buildResult(step)
    : step.type === 'reveal' ? buildReveal()
    : buildEpitaph();
  pg.dataset.step = step.type;
  return pg;
}

// ---------- Fitting the type to the screen ----------

// The largest size, up to max, at which no word overflows the measure and
// the text takes no more than `lines` lines (and no more than maxH px)
function fitHeadline(h, { max, min, lines, lh, maxH }) {
  const fits = (s) => {
    h.style.fontSize = `${s}px`;
    return h.scrollWidth <= h.clientWidth + 1 && h.getBoundingClientRect().height <= Math.min(maxH, lines * s * lh) + 2;
  };
  if (fits(max)) return;
  let lo = min;
  let hi = max;
  for (let i = 0; i < 14; i++) {
    const mid = (lo + hi) / 2;
    if (fits(mid)) lo = mid; else hi = mid;
  }
  h.style.fontSize = `${Math.floor(lo * 2) / 2}px`;
}

// Split a fitted headline into its lines, each in a mask it can rise out of
function splitLines(h) {
  const words = h.textContent.trim().split(/\s+/);
  h.textContent = '';
  const spans = words.map((w, i) => {
    const s = el('span', { text: w });
    h.append(s);
    if (i < words.length - 1) h.append(' ');
    return s;
  });
  const lines = [];
  let top = null;
  for (const s of spans) {
    if (top === null || Math.abs(s.offsetTop - top) > 2) { lines.push([]); top = s.offsetTop; }
    lines.at(-1).push(s.textContent);
  }
  h.textContent = '';
  for (const words of lines) h.append(el('span', { class: 'ln' }, el('span', { class: 'ln-i', text: words.join(' ') })));
}

function layout(pg) {
  const H = pg.clientHeight;
  for (let i = 0; i <= 8; i++) {
    const k = 1 - i * 0.04;
    pg.style.setProperty('--k', k.toFixed(2));
    for (const h of pg.querySelectorAll('.name')) {
      const many = h.textContent.trim().split(/\s+/).length > 1;
      // The huge name gives way fastest: the words under it have a floor
      fitHeadline(h, { max: 230, min: 56, lines: many ? 2 : 1, lh: 0.8, maxH: H * 0.25 * k * k });
    }
    for (const h of pg.querySelectorAll('.inv')) fitHeadline(h, { max: 64 * k, min: 34, lines: 3, lh: 0.95, maxH: H * 0.24 * k });
    if (pg.scrollHeight <= pg.clientHeight) break;
  }
  pg.querySelectorAll('.lines').forEach(splitLines);
}

// ---------- Moving pages ----------

function setX(pg, x) {
  pg._x = x;
  pg.style.transform = x ? `translate3d(${x.toFixed(2)}px,0,0)` : '';
}

// The page follows the finger, but less and less the further it goes
function rubber(dx, W) {
  const M = 0.2 * W;
  const a = Math.abs(dx) * 0.55;
  return Math.sign(dx) * M * (a / (a + M));
}

function mount(pg, before = null) {
  pg.append(el('div', { class: 'shade', 'aria-hidden': 'true' }));
  stage.insertBefore(pg, before);
  layout(pg);
  attachDrag(pg);
}

function unmount(pg) {
  pg._stop?.();
  pg._spring?.();
  pg.remove();
}

// The rising entrance of a cover's type; returns when its last piece starts
function enter(pg, delay = 0) {
  if (still()) return 0;
  let last = 0;
  for (const it of pg.querySelectorAll('[data-rise]')) {
    const d = delay + Number(it.dataset.rise);
    if (it.classList.contains('lines')) {
      it.querySelectorAll('.ln-i').forEach((ln, j) => ln.animate(
        [{ transform: 'translate3d(0,calc(100% + .32em),0)' }, { transform: 'none' }],
        { duration: Number(it.dataset.dur || 820), delay: d + j * 90, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' },
      ));
    } else if (it.classList.contains('exhibit')) {
      it.animate([{ opacity: 0, transform: 'scale(1.05)' }, { opacity: 1, transform: 'none' }],
        { duration: 1000, delay: d, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
    } else if (it.classList.contains('rule')) {
      it.animate([{ transform: 'scaleX(0)', transformOrigin: 'left' }, { transform: 'scaleX(1)', transformOrigin: 'left' }],
        { duration: 700, delay: d, easing: 'cubic-bezier(.65,0,.2,1)', fill: 'backwards' });
    } else {
      it.animate([{ opacity: 0, transform: 'translate3d(0,18px,0)' }, { opacity: 1, transform: 'none' }],
        { duration: 640, delay: d, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
    }
    last = Math.max(last, d);
  }
  return last;
}

// The sheet slides toward `dir` (-1 left, 1 right) and dims; the new one slides over it
async function slide(prev, next, dir, from, step) {
  mount(next);
  const W = stage.clientWidth;
  const opts = { duration: 430, easing: 'cubic-bezier(.2,.82,.24,1)' };
  next.classList.add('moving');
  const a = next.animate([{ transform: `translate3d(${-dir * W}px,0,0)` }, { transform: 'translate3d(0,0,0)' }], opts);
  prev.animate([{ transform: `translate3d(${from}px,0,0)` }, { transform: `translate3d(${from + dir * W * 0.3}px,0,0)` }], { ...opts, fill: 'forwards' });
  prev.querySelector(':scope > .shade')?.animate([{ opacity: 0 }, { opacity: 0.18 }], { ...opts, fill: 'forwards' });
  const last = next.classList.contains('cover') ? enter(next, 220) : 0;
  setTimeout(() => setBar(step), 180);
  await ended(a);
  next.classList.remove('moving');
  unmount(prev);
  if (last) await wait(Math.max(0, last - 240));
}

// The screen floods with colour between the big moments. A spark is a band
// of the accent that rises from the row, fills the screen and keeps rising
// off the top, uncovering the dark gallery (no muddy crossfade). Night rises
// from the foot of the screen and stays: it is the epitaph's own colour.
async function flood(prev, next, { tone, rect }, step) {
  const f = el('div', { class: `flood ${tone}`, 'aria-hidden': 'true' });
  stage.append(f);
  const H = stage.clientHeight;
  const full = 'inset(0px 0px 0px 0px)';
  const from = tone === 'spark' ? `inset(${rect.top.toFixed(1)}px 0px ${(H - rect.bottom).toFixed(1)}px 0px)` : 'inset(100% 0px 0px 0px)';
  await ended(f.animate([{ clipPath: from }, { clipPath: full }],
    { duration: tone === 'spark' ? 340 : 540, easing: 'cubic-bezier(.62,0,.28,1)', fill: 'forwards' }));
  unmount(prev);
  mount(next, f);
  setBar(step);
  let last;
  if (tone === 'spark') {
    last = enter(next, 180);
    await ended(f.animate([{ clipPath: full }, { clipPath: 'inset(0px 0px 100% 0px)' }],
      { duration: 460, easing: 'cubic-bezier(.55,0,.25,1)', fill: 'forwards' }));
    f.remove();
    await wait(Math.max(0, last - 420));
  } else {
    last = enter(next, 0);
    f.remove();
    await wait(last);
  }
}

// The dark sheet lifts away, and the new arrival is underneath
async function curtain(prev, next, step) {
  mount(next, prev);
  setBar(step);
  const last = enter(next, 300);
  prev.classList.add('moving');
  await ended(prev.animate([{ transform: `translate3d(${prev._x || 0}px,0,0)` }, { transform: 'translate3d(0,-100%,0)' }],
    { duration: 660, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' }));
  unmount(prev);
  await wait(Math.max(0, last - 420));
}

async function run(prev, next, m, step) {
  if (prev) prev.classList.add('leaving');
  if (still()) {
    mount(next);
    setBar(step);
    await ended(next.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: 'ease-out' }));
    if (prev) unmount(prev);
    return;
  }
  if (!prev || m.kind === 'rise') {
    mount(next);
    setBar(step);
    const last = enter(next, 60);
    await wait(Math.min(last + 160, 1100));
    if (prev) unmount(prev);
    return;
  }
  if (m.kind === 'slide') return slide(prev, next, m.dir, m.from, step);
  if (m.kind === 'flood') return flood(prev, next, m, step);
  return curtain(prev, next, step);
}

// ---------- Showing each step ----------

function setBar(step) {
  const t = step.type;
  bar.classList.toggle('hidden', t === 'arrival');
  bar.classList.toggle('dark', t === 'reveal' || t === 'epitaph');
  const done = t === 'card' ? step.index : t === 'result' ? step.index + 1 : t === 'reveal' ? 4 : t === 'epitaph' ? 6 : 0;
  const now = t === 'card' ? step.index : -1;
  [...bar.children].forEach((seg, i) => { seg.className = i < done ? 'done' : i === now ? 'now' : ''; });
  themeMeta.content = t === 'reveal' || t === 'epitaph' ? '#25221f' : '#f4eee3';
}

function announce(step) {
  const U = life.ui;
  let t = '';
  if (step.type === 'arrival') t = `${life.inventor.name}. ${life.inventor.role}. ${life.era}. ${life.arrival} ${U.wantPrefix} ${life.inventor.want}`;
  else if (step.type === 'card') t = `${step.card.speaker.name}: ${step.card.text} Left: ${step.card.left.label} Right: ${step.card.right.label}`;
  else if (step.type === 'result') t = `${step.option.label} ${step.option.result}`;
  else if (step.type === 'reveal') t = `${U.revealKicker} ${life.invention.name}. ${life.invention.description}`;
  else { const e = flow.epitaph(); t = `${e.name}. ${e.invented} ${e.death} ${e.legacy}`; }
  live.textContent = t;
}

function render(step) {
  busy = true;
  const prev = current;
  const next = build(step);
  current = next;
  const m = pending || { kind: 'rise' };
  pending = null;
  announce(step);
  const hadFocus = !prev || prev.contains(document.activeElement) || document.activeElement === document.body;
  run(prev, next, m, step).then(() => {
    if (current !== next) return;
    busy = false;
    shownAt = performance.now();
    if (hadFocus) next.focus({ preventScroll: true });
    if (step.type === 'result') develop(next);
    if (step.type === 'card' && step.index === 0) hint(next);
  });
}

// On a result, the drawing develops into its new state once the page lands
function develop(pg) {
  const after = pg.querySelectorAll('.pic img.after');
  const before = pg.querySelectorAll('.pic img.before');
  if (!after.length) return;
  if (still()) { before.forEach((b) => b.remove()); after.forEach((a) => { a.style.opacity = 1; }); return; }
  after.forEach((a) => a.animate([{ opacity: 0, transform: 'scale(1.035)' }, { opacity: 1, transform: 'none' }],
    { duration: 640, delay: 220, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' }));
  before.forEach((b) => b.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 460, delay: 220, easing: 'ease-out', fill: 'forwards' }));
}

// The first card shows the gesture once: a small nudge left, then right
function hint(pg) {
  if (hinted || still()) return;
  hinted = true;
  const L = pg.querySelector('.row.left');
  const R = pg.querySelector('.row.right');
  let raf = 0;
  let t0 = null;
  const stop = () => {
    clearTimeout(timer);
    cancelAnimationFrame(raf);
    if (pg._hinting) { pg._hinting = false; setX(pg, 0); setFill(L, 0); setFill(R, 0); }
    stopHint = () => {};
  };
  const tick = (t) => {
    t0 ??= t;
    const p = (t - t0) / 1700;
    if (p >= 1) { stop(); return; }
    const v = -Math.sin(p * Math.PI * 2) * (1 - p * 0.25);
    setX(pg, v * 16);
    paint(L, Math.max(0, -v) * 0.24);
    paint(R, Math.max(0, v) * 0.24);
    raf = requestAnimationFrame(tick);
  };
  const timer = setTimeout(() => { pg._hinting = true; raf = requestAnimationFrame(tick); }, 1100);
  stopHint = stop;
}

// ---------- Choosing ----------

const targetRow = (pg, side) => pg.querySelector(pg.classList.contains('decide') ? `.row.${side}` : '.row.go');

async function choose(side, source) {
  if (busy || flow.step?.type !== 'card') return;
  busy = true;
  stopHint();
  const pg = current;
  const r = targetRow(pg, side);
  pg.querySelectorAll('.row').forEach((x) => { if (x !== r) fillTo(x, 0, 120); });
  buzz(10);
  await fillTo(r, 1, source === 'drag' ? 90 : 210);
  if (source !== 'drag') await wait(50);
  pending = { kind: 'slide', dir: side === 'left' ? -1 : 1, from: pg._x || 0 };
  flow.choose(side);
}

async function proceed(source, dir = -1) {
  const s = flow.step;
  if (busy || !s || s.type === 'card') return;
  busy = true;
  const pg = current;
  const r = pg.querySelector('.row.go');
  buzz(8);
  await fillTo(r, 1, source === 'drag' ? 90 : 210);
  if (source !== 'drag') await wait(50);
  const box = r.getBoundingClientRect();
  const top = stage.getBoundingClientRect().top;
  const rect = { top: box.top - top, bottom: box.bottom - top };
  if (s.type === 'result' && s.index === 3) pending = { kind: 'flood', tone: 'spark', rect };
  else if (s.type === 'result' && s.index === 5) pending = { kind: 'flood', tone: 'night', rect };
  else if (s.type === 'epitaph' && source !== 'drag') pending = { kind: 'curtain' };
  else pending = { kind: 'slide', dir, from: pg._x || 0 };
  flow.next();
}

function onRowDown(e) {
  const r = e.currentTarget;
  if (busy || r.closest('.page') !== current || (e.pointerType === 'mouse' && e.button !== 0)) return;
  stopHint();
  fillTo(r, PRESS, 110);
  const up = () => {
    removeEventListener('pointerup', up, true);
    removeEventListener('pointercancel', up, true);
    if (!busy && !r.closest('.page')?._dragging) fillTo(r, 0, 180);
  };
  addEventListener('pointerup', up, true);
  addEventListener('pointercancel', up, true);
}

function onRowClick(e) {
  const r = e.currentTarget;
  if (busy || r.closest('.page') !== current) return;
  // A tap that began before this page appeared is a leftover: ignore it
  if (e.detail > 0 && lastDown < shownAt && e.timeStamp - lastDown < 2500) return;
  const source = e.detail > 0 ? 'tap' : 'key';
  if (r.dataset.side === 'go') proceed(source); else choose(r.dataset.side, source);
}

function settle(pg) {
  pg._spring?.();
  pg._spring = spring(pg._x || 0, 0, (x) => setX(pg, x), { stiffness: 340, damping: 30, done: () => { pg._spring = null; } });
  pg.querySelectorAll('.row').forEach((r) => fillTo(r, 0, 220));
}

// Swiping the whole page: it follows the finger a little, the matching row
// fills from its side, and past the line (or with a flick) it's chosen
function attachDrag(pg) {
  let base = 0;
  let armed = null;
  pg._stop = drag(pg, {
    axis: 'x',
    start() {
      if (busy || pg !== current) return false;
      stopHint();
      pg._spring?.();
      base = pg._x || 0;
      return true;
    },
    move({ dx }) {
      pg._dragging = true;
      const W = pg.clientWidth;
      if (!still()) setX(pg, base + rubber(dx, W));
      const side = dx < 0 ? 'left' : 'right';
      const r = targetRow(pg, side);
      pg.querySelectorAll('.row').forEach((x) => { if (x !== r && (x._f || 0) > 0) setFill(x, 0); });
      const f = clamp(Math.abs(dx) / (THRESHOLD * W), 0, 1);
      setFill(r, f);
      const now = f >= 1 ? r : null;
      if (now !== armed) {
        armed?.classList.remove('armed');
        now?.classList.add('armed');
        if (now) buzz(6);
        armed = now;
      }
    },
    end({ dx, vx, cancelled }) {
      pg._dragging = false;
      armed?.classList.remove('armed');
      armed = null;
      const W = pg.clientWidth;
      const flick = Math.abs(vx) > FLICK && Math.sign(vx) === Math.sign(dx) && Math.abs(dx) > 24;
      if (!cancelled && !busy && pg === current && (Math.abs(dx) >= THRESHOLD * W || flick)) {
        if (flow.step.type === 'card') choose(dx < 0 ? 'left' : 'right', 'drag');
        else proceed('drag', dx < 0 ? -1 : 1);
      } else {
        settle(pg);
      }
    },
  });
}

// ---------- Keys: arrows choose, Enter or Space continues ----------

document.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey || !flow) return;
  const onControl = e.target instanceof Element && e.target.closest('button, a');
  if (e.repeat) { if (onControl && (e.key === 'Enter' || e.key === ' ')) e.preventDefault(); return; }
  if (busy) return;
  const t = flow.step?.type;
  if (t === 'card' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
    e.preventDefault();
    choose(e.key === 'ArrowLeft' ? 'left' : 'right', 'key');
  } else if (t && t !== 'card' && (e.key === 'Enter' || e.key === ' ') && !onControl) {
    e.preventDefault();
    proceed('key');
  }
});

addEventListener('pointerdown', (e) => { lastDown = e.timeStamp; }, true);

// A new screen size: set the current page again, without moving
let resizeTimer = 0;
function relayout() {
  if (!flow?.step) return;
  if (busy) { resizeTimer = setTimeout(relayout, 250); return; }
  const prev = current;
  const next = build(flow.step);
  current = next;
  mount(next);
  next.querySelectorAll('.pic img.before').forEach((i) => i.remove());
  next.querySelectorAll('.pic img.after').forEach((i) => { i.style.opacity = 1; });
  if (prev) unmount(prev);
  setBar(flow.step);
}
addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(relayout, 160); });

// ---------- Start ----------

function allArt() {
  const urls = new Set([life.exhibit, life.bench]);
  const every = (side) => Object.fromEntries(life.cards.map((c) => [c.id, side]));
  for (let i = 0; i < 6; i++) {
    for (const phase of ['before', 'left', 'right']) {
      for (const choices of [every('left'), every('right')]) life.picture(i, phase, choices).layers.forEach((u) => urls.add(u));
    }
  }
  for (const c of life.cards) if (c.speaker.portrait) urls.add(c.speaker.portrait);
  return [...urls];
}

async function boot() {
  try {
    life = await loadLife();
  } catch (err) {
    stage.append(el('p', { class: 'error', text: `The life didn't load. ${err.message}` }));
    return;
  }
  applyTheme(life.theme);
  const fonts = Promise.all([
    document.fonts.load('680 100px Newsreader'),
    document.fonts.load('500 26px "Atkinson Hyperlegible Next"'),
    document.fonts.load('700 20px "Atkinson Hyperlegible Next"'),
  ]).catch(() => {});
  const art = Promise.all(allArt().map((u) => { const i = new Image(); i.src = u; return i.decode().catch(() => {}); }));
  await Promise.race([Promise.all([fonts, art]), wait(3000)]);
  flow = createFlow(life, render);
  flow.start();
}

// For testing: what's on screen
window.bigType = {
  get step() { const s = flow?.step; return s ? `${s.type}${s.index != null ? `:${s.index}` : ''}` : 'loading'; },
  get busy() { return busy; },
};

boot();
