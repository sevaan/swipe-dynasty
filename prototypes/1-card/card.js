// The Card: one tactile card, dealt from a small deck. The design note is
// at the top of index.html.
//
// A life is a face-down deck of nine cards: the character card, six
// decisions, the reveal (after the fourth) and the epitaph. The card on top
// is held and swiped; choosing throws it over to show its result on the
// back; moving on slides it away and turns the next one up from the deck.
import { loadLife } from '../shared/life.js';
import { createFlow } from '../shared/flow.js';
import { drag, spring, buzz } from '../shared/drag.js';

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const now = () => performance.now();
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const DEG = Math.PI / 180;
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const calm = () => motion.matches;

const els = {
  root: document.documentElement,
  deck: $('#deck'),
  table: $('#table'),
  who: $('#who'),
  era: $('#era'),
  pips: $('#pips'),
  live: $('#live'),
  stars: $('#stars'),
};

// ---- Feel

const TILT = 0.05;      // degrees of swing per px of drag
const COMMIT = 0.3;     // of the card's width: past this, letting go chooses
const FLICK = 0.5;      // px per ms: a quick flick chooses from anywhere
const S = { W: 362, H: 620, P: 240 };   // card width, height and picture height (layout())

// ---- The life as a deck, top to bottom

const SEQ = ['arrival', 0, 1, 2, 3, 'reveal', 4, 5, 'epitaph'];
const posOf = (step) => {
  if (step.type === 'arrival') return 0;
  if (step.type === 'reveal') return 5;
  if (step.type === 'epitaph') return 8;
  return step.index < 4 ? step.index + 1 : step.index + 2;
};
const variantAt = (pos) => (SEQ[pos] === 'reveal' ? 'gilt' : SEQ[pos] === 'epitaph' ? 'mourn' : 'plain');

// Where a card sits in the stack: each one a little lower, smaller and askew
const DEPTH = [
  { drop: 0, rz: 0, s: 1 },
  { drop: 7.5, rz: -1.5, s: 0.986 },
  { drop: 14.5, rz: 1.2, s: 0.972 },
  { drop: 21, rz: -0.6, s: 0.958 },
  { drop: 26, rz: 0.4, s: 0.944 },
];
function depthPose(d) {
  const k = DEPTH[Math.min(d, DEPTH.length - 1)];
  const th = k.rz * DEG;
  // The card turns on a point one card-height below its centre, so undo
  // that swing to turn it about its own centre, then drop it so its lower
  // edge peeks out under the card above
  return {
    x: -S.H * Math.sin(th),
    y: k.drop + ((1 - k.s) * S.H) / 2 - S.H * (1 - Math.cos(th)),
    rz: k.rz,
    ry: d ? 180 : 0,
    s: k.s,
    lift: 0,
  };
}

// ---- State

let life, ui, flow;
let top = null;          // the card in play
let stack = [];          // face-down cards under it, nearest first
let busy = true;         // a card is moving on its own; input waits
let readyAt = Infinity;  // when the current step could first be touched
let downAt = 0;          // when the latest press began
let toss = null;         // the throw that made the last choice: { v } px/s
let fling = null;        // the throw that sent the last card away: { vx, vy } px/s
let unbind = null;       // the top card's drag handler
let idle = 0;            // a timer for the first card's hint
let touched = false;     // no haptics until the player has touched the page
let keyboard = false;    // the last input was a key, so focus should follow the cards
const thud = (ms) => { if (touched) buzz(ms); };

// ---- Little drawings (inline SVG, no emoji)

const arrow = (dir) => `<svg class="arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="${dir === 'left' ? 'M19 12H6M11.5 6 5.5 12l6 6' : 'M5 12h13M12.5 6l6 6-6 6'}" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
// An answer's words with its arrow held to the first (left) or last (right) word
function labelHTML(words, side) {
  const w = String(words).split(' ');
  if (side === 'left') {
    const [first, ...more] = w;
    return `<span class="hold">${arrow('left')}${esc(first)}</span> ${esc(more.join(' '))}`;
  }
  const last = w.pop();
  return `${esc(w.join(' '))} <span class="hold">${esc(last)}${arrow('right')}</span>`;
}
const stub = (cls, label) => `<div class="tabs one"><button class="tab wide ${cls}" type="button" data-act="next"><span class="label">${esc(label)}</span>${arrow('right')}</button></div>`;
const swipeIcon = '<svg viewBox="0 0 30 20" aria-hidden="true"><path d="M8 5 3 10l5 5M22 5l5 5-5 5M4 10h22"/></svg>';
// The deck's emblem: a spark, the game's one bright idea
const spark = (fill, core) => `<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="${fill}" d="M24 3c1.6 9.4 4.9 13.8 21 21-16.1 7.2-19.4 11.6-21 21-1.6-9.4-4.9-13.8-21-21 16.1-7.2 19.4-11.6 21-21Z"/><circle cx="24" cy="24" r="4.2" fill="${core}"/></svg>`;

function starsSVG() {
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  let out = '';
  for (let i = 0; i < 38; i++) {
    const x = (rnd() * 100).toFixed(2);
    const y = (rnd() * 100).toFixed(2);
    const r = (0.5 + rnd() * rnd() * 1.3).toFixed(2);
    const o = (0.14 + rnd() * 0.42 * (1 - y / 130)).toFixed(2);
    out += `<circle cx="${x}%" cy="${y}%" r="${r}" opacity="${o}"/>`;
  }
  return out;
}

// ---- Faces

const picHTML = (layers) => `<div class="pic" aria-hidden="true">${layers.map((u, i) => `<img src="${esc(u)}" alt="" draggable="false" data-depth="${i}">`).join('')}</div>`;
const faceCrop = (sp) => `<span class="face-crop" aria-hidden="true">${sp.portrait ? `<img src="${esc(sp.portrait)}" alt="" draggable="false">` : ''}</span>`;

function choiceFace(step) {
  const { card, index } = step;
  const pic = life.picture(index, 'before', flow.choices);
  return `<div class="sheet">
      ${picHTML(pic.layers)}
      <div class="stamp" aria-hidden="true"><span class="stamp-in"></span></div>
      <div class="words">
        <div class="who">${faceCrop(card.speaker)}<span class="name">${esc(card.speaker.name)}</span><span class="rule" aria-hidden="true"></span></div>
        <p class="text">${esc(card.text)}</p>
        ${index === 0 ? `<p class="hint">${swipeIcon}<span>${esc(ui.helperFirst)}</span></p>` : ''}
      </div>
    </div>
    <div class="tabs">
      <button class="tab left" type="button" data-act="left" aria-label="${esc(card.left.label)}"><span class="fill" aria-hidden="true"></span><span class="label">${labelHTML(card.left.label, 'left')}</span></button>
      <button class="tab right" type="button" data-act="right" aria-label="${esc(card.right.label)}"><span class="fill" aria-hidden="true"></span><span class="label">${labelHTML(card.right.label, 'right')}</span></button>
    </div>`;
}

function resultFace(step) {
  const pic = life.picture(step.index, step.side, flow.choices);
  return `<div class="sheet">
      ${picHTML(pic.layers)}
      <h2 class="chosen"><span class="mark">${arrow(step.side)}</span><span>${esc(step.option.label)}</span></h2>
      <p class="text">${esc(step.option.result)}</p>
      <div class="spare" aria-hidden="true"><div class="field"></div><div class="emblem">${spark('var(--accent)', 'var(--kraft)')}</div></div>
    </div>
    ${stub('on', ui.resultContinue)}`;
}

function arrivalFace() {
  const who = life.inventor;
  return `<div class="sheet">
      <div class="portrait">${who.portrait ? `<img src="${esc(who.portrait)}" alt="" draggable="false">` : ''}<span class="chip">${esc(life.era)}</span></div>
      <h1 class="plate">${esc(who.name)}</h1>
      <p class="role">${esc(who.role)}</p>
      <p class="text">${esc(life.arrival)}</p>
      <p class="want"><span class="pre">${esc(ui.wantPrefix)}</span>${esc(who.want)}</p>
    </div>
    ${stub('go', ui.beginLife)}`;
}

// The exhibit: the plinth, with the object as it ended up after card four
function revealLayers() {
  const side = flow.choices[life.cards[3].id] || 'left';
  const pic = life.picture(3, side, flow.choices);
  return [life.exhibit, ...pic.layers.slice(1).filter((u) => !/overlays\/(smoke|flames|steam|glint)\./.test(u))];
}

function revealFace() {
  return `<div class="gilt" aria-hidden="true"></div>
    <p class="kicker">${esc(ui.revealKicker)}</p>
    ${picHTML(revealLayers())}
    <h2 class="invention">${esc(life.invention.name)}</h2>
    <p class="text">${esc(life.invention.description)}</p>
    ${stub('gold', ui.revealAction)}`;
}

function epitaphFace() {
  const e = flow.epitaph();
  return `<div class="cameo" aria-hidden="true">${life.inventor.portrait ? `<img src="${esc(life.inventor.portrait)}" alt="" draggable="false">` : ''}</div>
    <h2 class="name">${esc(e.name)}</h2>
    <p class="invented">${esc(e.invented)}</p>
    <div class="orn" aria-hidden="true"><i></i></div>
    <p class="text">${esc(e.death)}</p>
    <p class="text legacy">${esc(e.legacy)}</p>
    ${stub('mourn', ui.epitaphAction)}`;
}

const backArt = (variant) => {
  const fill = variant === 'gilt' ? '#d7a445' : variant === 'mourn' ? 'var(--paper)' : 'var(--accent)';
  const core = variant === 'mourn' ? 'var(--mourn)' : 'var(--paper)';
  return `<div class="back-art" aria-hidden="true"><div class="emblem">${spark(fill, core)}</div></div>`;
};

// ---- Cards

function makeCard(variant) {
  const el = document.createElement('div');
  el.className = 'card';
  el.innerHTML = `<div class="shade far"></div><div class="shade near"></div>
    <div class="flipper"><section class="face front"></section><section class="face back v-${variant}">${backArt(variant)}</section></div>`;
  const c = {
    el,
    variant,
    kind: 'deck',
    flipper: $('.flipper', el),
    front: $('.front', el),
    back: $('.back', el),
    far: $('.far', el),
    near: $('.near', el),
    pose: { x: 0, y: 0, rz: 0, ry: 180, s: 1, lift: 0 },
    anim: 0,
    up: null,
    off: 0,
    dy: 0,
    grabY: 0,
  };
  quiet(el, true);
  return c;
}

function quiet(node, yes) {
  node.inert = yes;
  if (yes) node.setAttribute('aria-hidden', 'true');
  else node.removeAttribute('aria-hidden');
}

// Draw a card's pose. The outer element swings on its pivot below the card;
// the flipper turns it over, rising toward the eye while it's edge-on; the
// shadows narrow as it turns and spread and soften as it lifts.
function applyPose(c) {
  const p = c.pose;
  const air = Math.abs(Math.sin(p.ry * DEG));
  const lift = clamp(Math.max(p.lift, air), 0, 1);
  const sc = p.s * (1 + 0.075 * air);
  const w = Math.max(0.02, Math.abs(Math.cos(p.ry * DEG))) * sc;
  c.el.style.transform = `translate3d(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px, 0) rotate(${p.rz.toFixed(3)}deg)`;
  c.flipper.style.transform = `translateY(${(-18 * air).toFixed(2)}px) rotateY(${p.ry.toFixed(2)}deg) scale(${sc.toFixed(4)})`;
  c.near.style.opacity = clamp(1 - lift * 1.5, 0, 1).toFixed(3);
  c.near.style.transform = `scale(${w.toFixed(4)}, ${sc.toFixed(4)})`;
  c.far.style.opacity = clamp(lift * 1.4, 0, 0.85).toFixed(3);
  c.far.style.transform = `translateY(${(30 * lift).toFixed(2)}px) scale(${(w * (1 + 0.05 * lift)).toFixed(4)}, ${(sc * (1 + 0.05 * lift)).toFixed(4)})`;
  // The picture sits a little way into the paper: a hint of parallax as it swings
  if (c.layers) {
    const shift = clamp(p.rz, -20, 20);
    c.layers.forEach((img, i) => { img.style.transform = `translate3d(${(-shift * (0.12 + 0.1 * i)).toFixed(2)}px, 0, 0)`; });
  }
  const r = ((p.ry % 360) + 360) % 360;
  const up = r < 90 || r > 270;
  if (up !== c.up) {
    c.up = up;
    if (c === top) { quiet(c.front, !up); quiet(c.back, up); }
  }
}

// Several damped springs at once, each keeping its own starting velocity,
// so a thrown card carries the finger's momentum. (drag.js's spring()
// starts from rest; it's used below for springing back.)
const SETTLE = { x: [0.4, 16], y: [0.4, 16], rz: [0.05, 1.5], ry: [0.8, 16], s: [0.001, 0.015], lift: [0.005, 0.08] };
function animate(c, spec, done) {
  halt(c);
  if (calm()) {
    for (const [k, o] of Object.entries(spec)) c.pose[k] = o.to;
    applyPose(c);
    done?.();
    return;
  }
  const parts = Object.entries(spec).map(([key, o]) => ({ key, to: o.to, k: o.k ?? 200, d: o.d ?? 22, v: o.v ?? 0 }));
  let last = now();
  const t0 = last;
  const tick = (t) => {
    const dt = clamp((t - last) / 1000, 0.001, 0.034);
    last = t;
    const n = Math.ceil(dt / 0.004);
    const h = dt / n;
    for (let i = 0; i < n; i++) {
      for (const q of parts) {
        const x = c.pose[q.key];
        q.v += (-q.k * (x - q.to) - q.d * q.v) * h;
        c.pose[q.key] = x + q.v * h;
      }
    }
    const rest = t - t0 > 2400 || parts.every((q) => Math.abs(c.pose[q.key] - q.to) < SETTLE[q.key][0] && Math.abs(q.v) < SETTLE[q.key][1]);
    if (rest) for (const q of parts) c.pose[q.key] = q.to;
    applyPose(c);
    if (rest) { c.anim = 0; done?.(); } else c.anim = requestAnimationFrame(tick);
  };
  c.anim = requestAnimationFrame(tick);
}

function halt(c) {
  if (c.anim) cancelAnimationFrame(c.anim);
  c.anim = 0;
  c.unspring?.();
  c.unspring = null;
}

const fade = (el, from, to, ms) => el.animate([{ opacity: from }, { opacity: to }], { duration: ms, easing: 'ease-out', fill: 'forwards' }).finished.catch(() => {});

// A used card slides off the table: thrown with the finger's velocity, or
// pushed toward a side, speeding up as it goes
function slideAway(c, { vx = 0, vy = 0, dir = 1 } = {}) {
  halt(c);
  quiet(c.el, true);
  c.el.classList.remove('top');
  c.el.style.zIndex = '20';
  if (calm()) { fade(c.el, 1, 0, 140).then(() => c.el.remove()); return; }
  const speed = Math.hypot(vx, vy);
  let ux = dir;
  let uy = 0.22;
  if (speed > 250) { ux = vx / speed; uy = vy / speed; }
  const n = Math.hypot(ux, uy);
  ux /= n; uy /= n;
  let v = Math.max(speed, 650);
  let vr = (ux >= 0 ? 1 : -1) * 70;
  const reach = innerWidth / 2 + S.W * 0.8 + 40;
  const reachY = innerHeight / 2 + S.H * 0.8 + 40;
  let last = now();
  const t0 = last;
  const tick = (t) => {
    const dt = clamp((t - last) / 1000, 0.001, 0.034);
    last = t;
    v += 5200 * dt;
    vr += (ux >= 0 ? 1 : -1) * 260 * dt;
    c.pose.x += ux * v * dt;
    c.pose.y += uy * v * dt;
    c.pose.rz += vr * dt;
    c.pose.lift = Math.min(0.5, c.pose.lift + dt * 3);
    applyPose(c);
    if (Math.abs(c.pose.x) > reach || Math.abs(c.pose.y) > reachY || t - t0 > 900) { c.el.remove(); return; }
    c.anim = requestAnimationFrame(tick);
  };
  c.anim = requestAnimationFrame(tick);
}

// ---- Filling a card

function fill(c, step) {
  const kind = step.type === 'card' ? 'choice' : step.type;
  c.kind = kind;
  c.step = step;
  quiet(c.el, false);
  c.up = null;
  c.front.className = `face front ${kind}`;
  c.front.innerHTML = kind === 'choice' ? choiceFace(step) : kind === 'arrival' ? arrivalFace() : kind === 'reveal' ? revealFace() : epitaphFace();
  c.layers = [...c.front.querySelectorAll('.pic img')];
  if (kind === 'choice') {
    c.stamp = $('.stamp', c.front);
    c.stampText = $('.stamp-in', c.front);
    c.tab = { left: $('.tab.left', c.front), right: $('.tab.right', c.front) };
    c.fill = { left: $('.tab.left .fill', c.front), right: $('.tab.right .fill', c.front) };
    c.side = null;
    c.inked = false;
  }
}

// ---- The drag

// The pose for a drag: the grabbed point stays under the finger while the
// card swings on its pivot below; it lifts as soon as it moves
function dragPose(c, off, dy) {
  const th = clamp(off * TILT, -24, 24);
  const L = 1.5 * S.H - c.grabY;
  const reach = clamp(Math.abs(off) / 30, 0, 1);
  return { x: off - L * Math.sin(th * DEG), y: clamp(dy * 0.25, -26, 26), rz: th, ry: 0, s: 1 + 0.02 * reach, lift: 0.42 * reach };
}

// The answer being chosen: the stamp comes down and the tab fills as the
// drag goes on, and both land once letting go would choose
function intent(c, off, quietly = false) {
  if (c.kind !== 'choice') return;
  const p = Math.abs(off) / (COMMIT * S.W);
  const side = off >= 0 ? 'right' : 'left';
  const other = side === 'right' ? 'left' : 'right';
  if (side !== c.side) {
    c.side = side;
    c.stampText.textContent = c.step.card[side].label;
    c.stamp.classList.toggle('on-right', side === 'left');
    c.fill[other].style.transform = 'scaleX(0)';
    c.tab[other].classList.remove('lit');
    c.inked = null;
  }
  const q = clamp(p, 0, 1);
  const inked = p >= 1;
  if (inked !== c.inked) {
    c.inked = inked;
    c.stamp.classList.toggle('inked', inked);
    c.tab[side].classList.toggle('lit', inked);
    if (inked && !quietly) thud(6);
  }
  // The stamp grows in as the card tilts, hovering (lifted, with a shadow)
  // until the line, where it thumps down flat
  const shown = clamp((p - 0.08) / 0.4, 0, 1);
  const size = inked ? 1 : 0.8 + 0.2 * q;
  c.stamp.style.opacity = shown.toFixed(3);
  c.stamp.style.transform = `rotate(${side === 'right' ? -10 : 10}deg) translateY(${((1 - q) * -5).toFixed(2)}px) scale(${size.toFixed(4)})`;
  c.fill[side].style.transform = `scaleX(${q.toFixed(4)})`;
}

function bindTop() {
  unbind?.();
  const c = top;
  const choosing = c.kind === 'choice';
  c.el.classList.add('top');
  unbind = drag(c.el, {
    axis: choosing ? 'x' : 'both',
    start: (e) => {
      if (busy || c !== top) return false;
      halt(c);
      const box = els.deck.getBoundingClientRect();
      c.grabY = clamp(e.clientY - box.top - c.pose.y, 0, S.H);
      c.base = c.off;
      c.home = { ...c.pose };
      c.el.classList.add('held');
      return true;
    },
    move: ({ dx, dy }) => {
      c.el.classList.remove('held');
      if (choosing) follow(c, c.base + dx, dy);
      else carry(c, dx, dy);
    },
    end: (r) => {
      c.el.classList.remove('held');
      if (choosing) release(c, r);
      else letGo(c, r);
    },
    tap: (e) => {
      c.el.classList.remove('held');
      tapped(c, e);
    },
  });
}

function follow(c, off, dy) {
  c.off = off;
  c.dy = dy;
  Object.assign(c.pose, dragPose(c, off, dy));
  applyPose(c);
  intent(c, off);
}

function release(c, r) {
  const off = c.off;
  const dir = off >= 0 ? 1 : -1;
  const past = Math.abs(off) >= COMMIT * S.W;
  const flick = Math.abs(r.vx) >= FLICK && Math.sign(r.vx) === dir && Math.abs(off) > 12;
  const reversing = Math.sign(r.vx) === -dir && Math.abs(r.vx) > 0.3;
  if (!r.cancelled && ((past && !reversing) || flick)) choose(dir > 0 ? 'right' : 'left', r.vx * 1000);
  else springHome(c);
}

// Letting go early: home on drag.js's spring, overshooting a touch
function springHome(c) {
  const from = c.off;
  const dy = c.dy;
  c.unspring = spring(1, 0, (k) => {
    c.off = from * k;
    Object.assign(c.pose, dragPose(c, from * k, dy * k));
    applyPose(c);
    intent(c, from * k);
  }, { done: () => { c.off = 0; c.unspring = null; } });
}

// A card that isn't a decision can be carried anywhere and thrown away
function carry(c, dx, dy) {
  const h = c.home;
  c.pose.x = h.x + dx;
  c.pose.y = h.y + dy;
  c.pose.rz = clamp(h.rz + dx * TILT * 0.7, -20, 20);
  c.pose.s = 1.02;
  c.pose.lift = 0.42;
  applyPose(c);
}

function letGo(c, r) {
  const dx = c.pose.x;
  const dy = c.pose.y;
  const dist = Math.hypot(dx, dy);
  const along = dist ? (dx * r.vx + dy * r.vy) / dist : 0;
  if (!r.cancelled && downAt >= readyAt && (dist > COMMIT * S.W || (along > FLICK && dist > 16))) {
    fling = { vx: r.vx * 1000, vy: r.vy * 1000 };
    next();
    return;
  }
  const from = { ...c.pose };
  c.unspring = spring(1, 0, (k) => {
    const m = Math.max(0, k);
    c.pose.x = from.x * k;
    c.pose.y = from.y * k;
    c.pose.rz = from.rz * k;
    c.pose.s = 1 + (from.s - 1) * m;
    c.pose.lift = from.lift * m;
    applyPose(c);
  }, { done: () => { c.unspring = null; } });
}

function tapped(c, e) {
  if (e.target.closest?.('button')) return;   // the button's own click handles it
  if (busy || downAt < readyAt) return;
  if (c.kind === 'result') next();
  else if (c.kind === 'choice') nudge(c);
}

// A tap on the picture or the words: the card wobbles, to say it moves
function nudge(c) {
  if (c.anim || c.unspring || busy) return;
  const dir = Math.random() < 0.5 ? -1 : 1;
  animate(c, { x: { to: 0, k: 340, d: 11, v: dir * 300 }, rz: { to: 0, k: 340, d: 11, v: dir * 24 } });
}

// ---- Moving the story on

function choose(side, v) {
  if (busy || flow.step?.type !== 'card') return;
  busy = true;
  clearTimeout(idle);
  unbind?.();
  unbind = null;
  toss = { v };
  flow.choose(side);
}

function next() {
  if (busy || !flow.step || flow.step.type === 'card') return;
  busy = true;
  unbind?.();
  unbind = null;
  flow.next();
}

function render(step) {
  chrome(step);
  announce(step);
  if (step.type === 'arrival') dealDeck(step);
  else if (step.type === 'result') turnOver(step);
  else dealNext(step);
}

// A step is ready: presses from now on count
function settled() {
  busy = false;
  readyAt = now();
  bindTop();
  const a = document.activeElement;
  const lost = !a || a === document.body || !a.isConnected || els.deck.contains(a);
  if (lost && keyboard) {
    const face = top.up ? top.front : top.back;
    face.querySelector('[data-act]')?.focus({ preventScroll: true });
  } else if (lost && a && a !== document.body) a.blur();
  if (flow.step.type === 'card' && flow.step.index === 0) {
    clearTimeout(idle);
    idle = setTimeout(() => { if (top?.kind === 'choice' && !busy) nudge(top); }, 4200);
  }
}

// The whole deck falls onto the table, deepest card first, and the top one
// turns over
async function dealDeck(step) {
  busy = true;
  const old = top;
  top = null;
  for (const c of stack) c.el.remove();
  stack = [];
  if (old) { slideAway(old, fling || { dir: 1 }); fling = null; }
  const cards = [0, 1, 2, 3].map((d) => makeCard(variantAt(d)));
  top = cards[0];
  stack = cards.slice(1);
  fill(top, step);
  cards.forEach((c, d) => { c.el.style.zIndex = String(10 - d); els.deck.append(c.el); });
  els.deck.classList.remove('laid');
  if (calm()) {
    cards.forEach((c, d) => { c.pose = depthPose(d); applyPose(c); fade(c.el, 0, 1, 160); });
    els.deck.classList.add('laid');
    await wait(old ? 160 : 0);
    settled();
    return;
  }
  // Start fully above the screen, the last to fall highest
  const above = els.deck.getBoundingClientRect().top + S.H + 60;
  cards.forEach((c, d) => {
    c.pose = { x: (d % 2 ? -1 : 1) * (12 + d * 9), y: -(above + (3 - d) * 70), rz: (d % 2 ? 7 : -9) + d, ry: 180, s: 1.03, lift: 0.7 };
    applyPose(c);
  });
  await wait(old ? 380 : 140);
  [3, 2, 1, 0].forEach((d, i) => {
    setTimeout(() => {
      const to = { ...depthPose(d), ry: 180 };
      animate(cards[d], {
        x: { to: to.x, k: 190, d: 21 },
        y: { to: to.y, k: 190, d: 20 },
        rz: { to: to.rz, k: 170, d: 19 },
        s: { to: to.s, k: 220, d: 24 },
        lift: { to: 0, k: 200, d: 26 },
      });
      if (d === 3) setTimeout(() => els.deck.classList.add('laid'), 120);
      // The top card lands, a beat, and it turns over (no waiting for the
      // last sub-pixel of its bounce)
      if (d === 0) setTimeout(() => { thud(5); turnUp(top, 360, settled); }, 330);
    }, i * 75);
  });
}

// The top card lifts off the deck and turns face up
function turnUp(c, to, done) {
  animate(c, {
    x: { to: 0, k: 210, d: 24 },
    y: { to: 0, k: 230, d: 22, v: -420 },
    rz: { to: 0, k: 200, d: 22 },
    ry: { to, k: 115, d: 17.5, v: (to > 180 ? 1 : -1) * 240 },
    s: { to: 1, k: 230, d: 23 },
    lift: { to: 0, k: 200, d: 26 },
  }, () => {
    c.pose.ry = ((c.pose.ry % 360) + 360) % 360;
    applyPose(c);
    if (c.kind === 'reveal') c.el.classList.add('shine');
    done?.();
  });
}

// The used card slides off, the next one rises from the deck and turns
// face up, and the stack shuffles forward
function dealNext(step) {
  busy = true;
  const old = top;
  const pos = posOf(step);
  const c = stack.shift();
  top = c;
  fill(c, step);
  c.el.style.zIndex = '10';
  const leaveDir = old?.kind === 'result' ? (old.step.side === 'right' ? 1 : -1) : -1;
  if (old) slideAway(old, fling || { dir: leaveDir });
  fling = null;
  // Keep up to three cards waiting: as many as the life has left
  const left = SEQ.length - 1 - pos;
  while (stack.length < Math.min(3, left)) {
    const n = makeCard(variantAt(pos + stack.length + 1));
    n.pose = depthPose(4);
    applyPose(n);
    els.deck.prepend(n.el);
    if (!calm()) fade(n.el, 0, 1, 260);
    stack.push(n);
  }
  stack.forEach((s, i) => {
    s.el.style.zIndex = String(9 - i);
    const to = depthPose(i + 1);
    setTimeout(() => animate(s, { x: { to: to.x, k: 260, d: 25 }, y: { to: to.y, k: 260, d: 25 }, rz: { to: to.rz, k: 240, d: 24 }, s: { to: to.s, k: 260, d: 26 } }), 40 + i * 35);
  });
  if (calm()) {
    c.pose = depthPose(0);
    applyPose(c);
    fade(c.el, 0, 1, 150);
    settled();
    return;
  }
  // Turn toward the side the used card went, as if the same hand turns it
  setTimeout(() => turnUp(c, leaveDir > 0 ? 360 : 0, settled), 50);
}

// The choice: the card is thrown with the finger's momentum, turns over in
// the air and lands showing what happened on its back
function turnOver(step) {
  busy = true;
  const c = top;
  const dir = step.side === 'right' ? 1 : -1;
  c.back.className = 'face back result';
  c.back.innerHTML = resultFace(step);
  intent(c, dir * COMMIT * S.W * 1.05, true);
  c.kind = 'result';
  c.off = 0;
  let v = toss?.v ?? dir * 1500;
  toss = null;
  if (Math.sign(v) !== dir || Math.abs(v) < 800) v = dir * Math.max(800, Math.abs(v));
  v = clamp(v, -3400, 3400);
  thud(8);
  if (calm()) {
    fade(c.el, 1, 0, 90).then(() => {
      c.pose = { ...depthPose(0), ry: dir * 180 };
      applyPose(c);
      c.layers = [...c.back.querySelectorAll('.pic img')];
      fade(c.el, 0, 1, 130);
      settled();
    });
    return;
  }
  animate(c, {
    x: { to: 0, k: 88, d: 14.5, v: v * 0.75 },
    y: { to: 0, k: 170, d: 22 },
    rz: { to: 0, k: 120, d: 17, v: clamp(v * TILT, -75, 75) },
    ry: { to: dir * 180, k: 100, d: 15.5, v: dir * (220 + Math.abs(v) * 0.12) },
    s: { to: 1, k: 220, d: 24 },
    lift: { to: 0, k: 170, d: 22 },
  }, () => { thud(5); settled(); });
  // Once it's edge-on, the parallax follows the back's picture
  setTimeout(() => { c.layers = [...c.back.querySelectorAll('.pic img')]; }, 120);
}

// ---- The frame around the deck

// Firelight behind the deck, step by step: none in the cold, a glow once
// there's a flame, brightest at the reveal, low and steady at the end
const WARMTH = { arrival: 0, card: [0.03, 0.1, 0.18, 0.42, 0.62, 0.7], result: [0.08, 0.14, 0.42, 0.6, 0.78, 0.66], reveal: 1, epitaph: 0.32 };

function chrome(step) {
  const decided = step.type === 'arrival' ? 0 : step.type === 'card' ? step.index : step.type === 'result' ? step.index + 1 : step.type === 'reveal' ? 4 : 6;
  const current = step.type === 'card' ? step.index : -1;
  [...els.pips.children].forEach((pip, i) => {
    pip.classList.toggle('done', i < decided);
    pip.classList.toggle('now', i === current);
  });
  els.pips.setAttribute('aria-label', current >= 0 ? `${current + 1} / 6` : `${decided} / 6`);
  const w = Array.isArray(WARMTH[step.type]) ? WARMTH[step.type][step.index] : WARMTH[step.type];
  els.root.style.setProperty('--warmth', String(w));
}

function announce(step) {
  let t = '';
  if (step.type === 'arrival') t = [life.inventor.name, life.inventor.role, life.era, life.arrival, `${ui.wantPrefix} ${life.inventor.want}`].join('. ');
  else if (step.type === 'card') t = `${step.card.speaker.name}. ${step.card.text}`;
  else if (step.type === 'result') t = `${step.option.label} ${step.option.result}`;
  else if (step.type === 'reveal') t = `${ui.revealKicker} ${life.invention.name}. ${life.invention.description}`;
  else { const e = flow.epitaph(); t = `${e.name}. ${e.invented} ${e.death} ${e.legacy}`; }
  els.live.textContent = t;
}

// ---- Sizes: the card as large as the screen allows, the picture sharing
// what's left after the longest words

function layout() {
  const box = els.table.getBoundingClientRect();
  const cs = getComputedStyle(els.table);
  const h = box.height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - 26;
  S.W = Math.round(Math.min(368, box.width - 20));
  S.H = Math.round(Math.min(h, S.W * 1.72));
  const short = S.H < 600;
  els.root.classList.toggle('short', short);
  els.root.style.setProperty('--w', `${S.W}px`);
  els.root.style.setProperty('--h', `${S.H}px`);
  // Measure every decision and result without its picture: the picture
  // takes the rest, up to 4:3, and is the same size on every card
  const probe = document.createElement('div');
  probe.style.cssText = `position:absolute;left:-10000px;top:0;width:${S.W}px;visibility:hidden;--pic:0px`;
  els.deck.append(probe);
  let need = 0;
  const measure = (cls, html) => {
    probe.innerHTML = `<section class="face ${cls}" style="position:relative;height:auto;inset:auto;transform:none">${html}</section>`;
    need = Math.max(need, probe.firstElementChild.getBoundingClientRect().height);
  };
  life.cards.forEach((card, index) => {
    measure('front choice', choiceFace({ card, index }));
    for (const side of ['left', 'right']) measure('back result', resultFace({ index, side, option: card[side] }));
  });
  probe.remove();
  S.P = Math.round(clamp(S.H - need, 110, (S.W - 24) * 0.75));
  els.root.style.setProperty('--pic', `${S.P}px`);
  for (const [i, c] of stack.entries()) { if (!c.anim) { c.pose = depthPose(i + 1); applyPose(c); } }
}

// ---- Input

function wire() {
  // When each press began, to ignore one that started before its step appeared
  document.addEventListener('pointerdown', () => { downAt = now(); touched = true; keyboard = false; clearTimeout(idle); }, true);
  document.addEventListener('keydown', () => { keyboard = true; }, true);
  addEventListener('pointerup', () => top?.el.classList.remove('held'));
  addEventListener('pointercancel', () => top?.el.classList.remove('held'));

  els.deck.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-act]');
    if (!b || !top || !top.el.contains(b)) return;
    if (busy || (e.detail > 0 && downAt < readyAt)) return;
    const act = b.dataset.act;
    if (act === 'left' || act === 'right') choose(act, (act === 'right' ? 1 : -1) * 1500);
    else next();
  });

  document.addEventListener('keydown', (e) => {
    if (e.repeat || e.metaKey || e.ctrlKey || e.altKey || busy || !flow?.step) return;
    const type = flow.step.type;
    if (type === 'card' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      choose(e.key === 'ArrowLeft' ? 'left' : 'right', (e.key === 'ArrowLeft' ? -1 : 1) * 1500);
    } else if (type !== 'card' && (e.key === 'Enter' || e.key === ' ')) {
      if (e.target.closest?.('button, a')) return;   // a focused control activates itself
      e.preventDefault();
      next();
    }
  });

  // No pinch zoom on iOS
  document.addEventListener('gesturestart', (e) => e.preventDefault());

  let raf = 0;
  addEventListener('resize', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(layout); });
}

// ---- Start

// Two hex colours mixed, a of the first (the status bar matches the top of the sky)
function mix(a, b, k) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `#${x.map((v, i) => Math.round(v * k + y[i] * (1 - k)).toString(16).padStart(2, '0')).join('')}`;
}

function preload(urls) {
  return Promise.all([...new Set(urls)].map((u) => new Promise((res) => {
    const img = new Image();
    img.onload = img.onerror = () => res();
    img.src = u;
  })));
}

async function main() {
  life = await loadLife();
  ui = life.ui;
  const t = life.theme;
  const night = life.sky?.find((s) => s.name === 'night')?.bg || t.bg;
  for (const [k, v] of Object.entries({ bg: t.bg, panel: t.panel, paper: t.card, ink: t.ink, text: t.text, accent: t.accent, night })) els.root.style.setProperty(`--${k}`, v);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', mix(night, t.bg, 0.72));
  els.who.textContent = life.inventor.name;
  els.era.textContent = life.era;
  els.pips.innerHTML = life.cards.map(() => '<li class="pip"></li>').join('');
  els.stars.innerHTML = starsSVG();

  const urls = [life.exhibit, life.bench, life.inventor.portrait];
  life.cards.forEach((card, i) => {
    urls.push(card.speaker.portrait);
    for (const phase of ['before', 'left', 'right']) urls.push(...life.picture(i, phase, {}).layers);
  });
  await Promise.race([Promise.all([preload(urls.filter(Boolean)), document.fonts.ready]), wait(3000)]);

  flow = createFlow(life, render);
  layout();
  wire();
  // If a font arrives late, measure again so every card still fits
  document.fonts.addEventListener?.('loadingdone', () => layout());
  flow.start();
}

main().catch((err) => {
  console.error(err);
  els.deck.innerHTML = `<p class="noscript">${esc(err.message)}</p>`;
});
