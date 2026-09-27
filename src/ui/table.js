// The table: the deck a moment of the game is dealt from, and the physics
// of the card in play (design-notes.md, "The play screen is The Card"). A
// life is a small face-down deck: the character card, six decisions, the
// reveal and the epitaph. The card on top is held and swiped; choosing
// throws it over to show its result on the back; moving on slides it away
// and turns the next one up. It knows nothing about the story: app.js hands
// it steps and hears back what the player did.
//
//   const table = createTable({ deck, table, calm, canPress, onChoose, onNext, onAction });
//   table.show(step)     deal a new deck, turn the next card up, or turn this one over
//   table.choose(side)   throw the card toward a side (the arrow keys)
//   table.next()         move a card that isn't a decision along (Enter)
//   table.layout()       sizes, after a resize or a text-size change
//
// A step is one card:
//   deck      which deck it belongs to ('life:C05', 'proposals', ...)
//   pos       its place in that deck, from 0
//   variants  every card's edge in the deck, top to bottom: 'plain' | 'gilt' | 'mourn'
//   kind      'choice': two answers, swipe or tap
//             'result': the back of the card just chosen; tap anywhere or throw it away
//             'single': one action; tap it, or throw the card away
//             'fixed':  buttons only; it doesn't move
//   cls       the face's class ('choice', 'arrival', 'reveal', ...)
//   face      its HTML (for a result, the back's)
//   under     for a result: the front it turned over from (drawn after a reload)
//   labels    for a choice: { left, right }, for the stamp
//   measure   every choice and result face in the deck, so the picture can
//             be the same size on every card: [{ cls, html }]
//   hint      the card wobbles if nobody touches it for a while
import { drag, spring, buzz } from './drag.js';
import { backArt } from './marks.js';

const $ = (sel, root = document) => root.querySelector(sel);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const now = () => performance.now();
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const DEG = Math.PI / 180;

// ---- Feel

const TILT = 0.05;      // degrees of swing per px of drag
const COMMIT = 0.3;     // of the card's width: past this, letting go chooses
const FLICK = 0.5;      // px per ms: a quick flick chooses from anywhere
const LEAST = 90;       // the smallest the picture gets before the words scroll

// Where a card sits in the stack: each one a little lower, smaller and askew
const DEPTH = [
  { drop: 0, rz: 0, s: 1 },
  { drop: 7.5, rz: -1.5, s: 0.986 },
  { drop: 14.5, rz: 1.2, s: 0.972 },
  { drop: 21, rz: -0.6, s: 0.958 },
  { drop: 26, rz: 0.4, s: 0.944 },
];

export function createTable({ deck: deckEl, table: tableEl, root = document.documentElement, calm: calmSetting = () => false, canPress = () => true, onChoose, onNext, onAction = () => {}, onSettled = () => {} }) {
  const S = { W: 362, H: 620, P: 240 }; // card width, height and picture height (layout())
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const calm = () => calmSetting() || motion.matches;

  let top = null;          // the card in play
  let stack = [];          // face-down cards under it, nearest first
  let current = null;      // the step on top
  let measures = [];       // the deck's faces, for the picture's size
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

  // ---- Cards

  function makeCard(variant = 'plain') {
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

  // Draw a card's pose. The outer element swings on its pivot below the
  // card; the flipper turns it over, rising toward the eye while it's
  // edge-on; the shadows narrow as it turns and spread and soften as it lifts.
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
    c.kind = step.kind;
    c.step = step;
    quiet(c.el, false);
    c.up = null;
    if (step.kind === 'result') {
      c.front.className = `face front ${step.underCls || 'choice'}`;
      c.front.innerHTML = step.under || '';
      c.back.className = `face back result ${step.cls || ''}`;
      c.back.innerHTML = step.face;
      c.layers = [...c.back.querySelectorAll('.pic img[data-depth]')];
    } else {
      c.front.className = `face front ${step.cls || ''}`;
      c.front.innerHTML = step.face;
      c.layers = [...c.front.querySelectorAll('.pic img[data-depth]')];
    }
    if (step.kind === 'choice') {
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
    if (c.kind !== 'choice' || !c.stamp) return;
    const p = Math.abs(off) / (COMMIT * S.W);
    const side = off >= 0 ? 'right' : 'left';
    const other = side === 'right' ? 'left' : 'right';
    if (side !== c.side) {
      c.side = side;
      c.stampText.textContent = c.step.labels?.[side] || '';
      c.stamp.classList.toggle('on-right', side === 'left');
      if (c.fill[other]) c.fill[other].style.transform = 'scaleX(0)';
      c.tab[other]?.classList.remove('lit');
      c.inked = null;
    }
    const q = clamp(p, 0, 1);
    const inked = p >= 1;
    if (inked !== c.inked) {
      c.inked = inked;
      c.stamp.classList.toggle('inked', inked);
      c.tab[side]?.classList.toggle('lit', inked);
      if (inked && !quietly) thud(6);
    }
    // The stamp grows in as the card tilts, hovering (lifted, with a shadow)
    // until the line, where it thumps down flat
    const shown = clamp((p - 0.08) / 0.4, 0, 1);
    const size = inked ? 1 : 0.8 + 0.2 * q;
    c.stamp.style.opacity = shown.toFixed(3);
    c.stamp.style.transform = `rotate(${side === 'right' ? -10 : 10}deg) translateY(${((1 - q) * -5).toFixed(2)}px) scale(${size.toFixed(4)})`;
    if (c.fill[side]) c.fill[side].style.transform = `scaleX(${q.toFixed(4)})`;
  }

  function bindTop() {
    unbind?.();
    unbind = null;
    const c = top;
    if (!c) return;
    c.el.classList.add('top');
    if (c.kind === 'fixed') return; // buttons only
    const choosing = c.kind === 'choice';
    // When the words scroll, an upward drag scrolls them rather than carrying the card
    const tight = root.classList.contains('tight');
    unbind = drag(c.el, {
      axis: choosing || tight ? 'x' : 'both',
      start: (e) => {
        if (busy || c !== top || !canPress()) return false;
        halt(c);
        const box = deckEl.getBoundingClientRect();
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
    if (!r.cancelled && downAt >= readyAt && ((past && !reversing) || flick)) choose(dir > 0 ? 'right' : 'left', r.vx * 1000);
    else springHome(c);
  }

  // Letting go early: home on a spring, overshooting a touch
  function springHome(c) {
    const from = c.off;
    const dy = c.dy;
    c.unspring = spring(1, 0, (k) => {
      c.off = from * k;
      Object.assign(c.pose, dragPose(c, from * k, dy * k));
      applyPose(c);
      intent(c, from * k);
    }, { calm: calm(), done: () => { c.off = 0; c.unspring = null; } });
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
    const h = c.home || { x: 0, y: 0 };
    const dx = c.pose.x - h.x;
    const dy = c.pose.y - h.y;
    const dist = Math.hypot(dx, dy);
    const along = dist ? (dx * r.vx + dy * r.vy) / dist : 0;
    if (!r.cancelled && downAt >= readyAt && (dist > COMMIT * S.W || (along > FLICK && dist > 16))) {
      fling = { vx: r.vx * 1000, vy: r.vy * 1000 };
      if (next() !== false) return;
      fling = null;
    }
    const from = { ...c.pose };
    const home = { ...h };
    c.unspring = spring(1, 0, (k) => {
      const m = Math.max(0, k);
      c.pose.x = home.x + (from.x - home.x) * k;
      c.pose.y = home.y + (from.y - home.y) * k;
      c.pose.rz = (home.rz || 0) + (from.rz - (home.rz || 0)) * k;
      c.pose.s = 1 + (from.s - 1) * m;
      c.pose.lift = from.lift * m;
      applyPose(c);
    }, { calm: calm(), done: () => { c.unspring = null; } });
  }

  function tapped(c, e) {
    if (e.target.closest?.('button, a')) return; // the button's own click handles it
    if (busy || downAt < readyAt || !canPress()) return;
    if (c.kind === 'result') next();
    else if (c.kind === 'choice') nudge(c);
  }

  // A tap on the picture or the words: the card wobbles, to say it moves
  function nudge(c) {
    if (c.anim || c.unspring || busy || calm()) return;
    const dir = Math.random() < 0.5 ? -1 : 1;
    animate(c, { x: { to: 0, k: 340, d: 11, v: dir * 300 }, rz: { to: 0, k: 340, d: 11, v: dir * 24 } });
  }

  // ---- The player's moves, handed to app.js

  function choose(side, v = (side === 'right' ? 1 : -1) * 1500) {
    if (busy || current?.kind !== 'choice' || !canPress()) return false;
    busy = true;
    clearTimeout(idle);
    unbind?.();
    unbind = null;
    toss = { v };
    if (onChoose(side) === false) {
      // The engine said no (a stale input, say): the card goes back
      toss = null;
      busy = false;
      bindTop();
      if (top) springHome(top);
      return false;
    }
    return true;
  }

  function next() {
    if (busy || !current || current.kind === 'choice' || current.kind === 'fixed' || !canPress()) return false;
    busy = true;
    clearTimeout(idle);
    unbind?.();
    unbind = null;
    if (onNext() === false) { busy = false; bindTop(); return false; }
    return true;
  }

  // Words too long for the card scroll (only those, so a touch anywhere
  // else still moves the card): a fade at their foot says there's more,
  // until they've been read to the end
  function watchWords(c) {
    if (!c?.el.isConnected) return;
    for (const w of c.el.querySelectorAll('.words')) {
      w.classList.remove('scrolls');
      const over = w.scrollHeight - w.clientHeight > 2;
      w.classList.toggle('scrolls', over);
      const check = () => w.classList.toggle('more', over && w.scrollHeight - w.clientHeight - w.scrollTop > 2);
      check();
      if (!w.dataset.watched) { w.dataset.watched = '1'; w.addEventListener('scroll', check, { passive: true }); }
    }
  }

  // A step is ready: presses from now on count
  function settled() {
    busy = false;
    readyAt = now();
    bindTop();
    if (top) watchWords(top);
    const a = document.activeElement;
    const lost = !a || a === document.body || !a.isConnected || deckEl.contains(a);
    if (lost && keyboard && top) {
      const face = top.up ? top.front : top.back;
      face.querySelector('[data-act]')?.focus({ preventScroll: true });
    } else if (lost && a && a !== document.body) a.blur();
    if (current?.hint) {
      clearTimeout(idle);
      idle = setTimeout(() => { if (top?.kind === 'choice' && !busy) nudge(top); }, 4200);
    }
    onSettled(current);
  }

  // ---- Dealing

  // A new deck falls onto the table, deepest card first, and the top one turns over
  async function dealDeck(step) {
    busy = true;
    clearTimeout(idle);
    const old = top;
    top = null;
    for (const c of stack) { halt(c); c.el.remove(); }
    stack = [];
    if (old) { slideAway(old, fling || { dir: 1 }); fling = null; }
    measures = step.measure || [];
    layout();
    const n = clamp(step.variants.length - step.pos, 1, 4);
    const cards = Array.from({ length: n }, (_, d) => makeCard(step.variants[step.pos + d]));
    top = cards[0];
    stack = cards.slice(1);
    fill(top, step);
    cards.forEach((c, d) => { c.el.style.zIndex = String(10 - d); deckEl.append(c.el); });
    watchWords(top);
    deckEl.classList.remove('laid');
    // A result (after a reload) lands showing its back
    const face = step.kind === 'result' ? 180 : 360;
    if (calm()) {
      cards.forEach((c, d) => { c.pose = depthPose(d); if (d === 0) c.pose.ry = face % 360; applyPose(c); fade(c.el, 0, 1, 160); });
      deckEl.classList.add('laid');
      await wait(old ? 160 : 0);
      settled();
      return;
    }
    // Start fully above the screen, the last to fall highest
    const above = deckEl.getBoundingClientRect().top + S.H + 60;
    cards.forEach((c, d) => {
      c.pose = { x: (d % 2 ? -1 : 1) * (12 + d * 9), y: -(above + (n - 1 - d) * 70), rz: (d % 2 ? 7 : -9) + d, ry: 180, s: 1.03, lift: 0.7 };
      applyPose(c);
    });
    await wait(old ? 380 : 140);
    const order = cards.map((_, d) => d).reverse();
    order.forEach((d, i) => {
      setTimeout(() => {
        const to = { ...depthPose(d), ry: 180 };
        animate(cards[d], {
          x: { to: to.x, k: 190, d: 21 },
          y: { to: to.y, k: 190, d: 20 },
          rz: { to: to.rz, k: 170, d: 19 },
          s: { to: to.s, k: 220, d: 24 },
          lift: { to: 0, k: 200, d: 26 },
        });
        if (i === 0) setTimeout(() => deckEl.classList.add('laid'), 120);
        // The top card lands, a beat, and it turns over (no waiting for the
        // last sub-pixel of its bounce)
        if (d === 0) setTimeout(() => { if (top !== cards[0]) return; thud(5); turnUp(top, face, settled); }, 330);
      }, i * 75);
    });
  }

  // The top card lifts off the deck and turns face up (or, for a result
  // after a reload, settles showing its back)
  function turnUp(c, to, done) {
    animate(c, {
      x: { to: 0, k: 210, d: 24 },
      y: { to: 0, k: 230, d: 22, v: -420 },
      rz: { to: 0, k: 200, d: 22 },
      ry: { to, k: 115, d: 17.5, v: to === 180 ? 0 : (to > 180 ? 1 : -1) * 240 },
      s: { to: 1, k: 230, d: 23 },
      lift: { to: 0, k: 200, d: 26 },
    }, () => {
      c.pose.ry = ((c.pose.ry % 360) + 360) % 360;
      applyPose(c);
      if (c.step?.cls?.includes('reveal')) c.el.classList.add('shine');
      done?.();
    });
  }

  // The used card slides off, the next one rises from the deck and turns
  // face up, and the stack shuffles forward
  function dealNext(step) {
    busy = true;
    const old = top;
    const c = stack.shift() || makeCard(step.variants[step.pos]);
    if (!c.el.isConnected) { c.pose = depthPose(1); applyPose(c); deckEl.append(c.el); }
    top = c;
    fill(c, step);
    watchWords(c);
    c.el.style.zIndex = '10';
    const leaveDir = old?.kind === 'result' ? (old.step.side === 'right' ? 1 : -1) : -1;
    if (old) slideAway(old, fling || { dir: leaveDir });
    fling = null;
    // Keep up to three cards waiting: as many as the deck has left
    const left = step.variants.length - 1 - step.pos;
    while (stack.length < Math.min(3, left)) {
      const n = makeCard(step.variants[step.pos + stack.length + 1]);
      n.pose = depthPose(4);
      applyPose(n);
      deckEl.prepend(n.el);
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

  // The choice: the card is thrown with the finger's momentum, turns over
  // in the air and lands showing what happened on its back
  function turnOver(step) {
    busy = true;
    const c = top;
    const dir = step.side === 'right' ? 1 : -1;
    c.back.className = `face back result ${step.cls || ''}`;
    c.back.innerHTML = step.face;
    watchWords(c);
    intent(c, dir * COMMIT * S.W * 1.05, true);
    c.kind = 'result';
    c.step = step;
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
        c.layers = [...c.back.querySelectorAll('.pic img[data-depth]')];
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
    setTimeout(() => { c.layers = [...c.back.querySelectorAll('.pic img[data-depth]')]; }, 120);
  }

  // The same card again, redrawn in place (a text-size change, say)
  function refresh(step) {
    measures = step.measure || measures;
    if (!top) { dealDeck(step); return; }
    fill(top, step);
    top.up = null;
    applyPose(top);
    layout();
    watchWords(top);
    bindTop();
  }

  function show(step) {
    const prev = current;
    current = step;
    if (!top || !prev) return dealDeck(step);
    const sameDeck = step.deck === prev.deck;
    if (sameDeck && step.pos === prev.pos && step.kind === prev.kind) return refresh(step);
    if (sameDeck && step.pos === prev.pos && step.kind === 'result' && prev.kind === 'choice' && top.kind === 'choice') return turnOver(step);
    if (sameDeck && step.pos === prev.pos + 1) return dealNext(step);
    return dealDeck(step);
  }

  // ---- Sizes: the card as large as the screen allows, the picture sharing
  // what's left after the deck's longest words

  function layout() {
    const box = tableEl.getBoundingClientRect();
    const cs = getComputedStyle(tableEl);
    const h = box.height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - 26;
    S.W = Math.round(Math.min(368, box.width - 20));
    S.H = Math.round(Math.max(360, Math.min(h, S.W * 1.72)));
    root.classList.toggle('short', S.H < 600);
    root.style.setProperty('--w', `${S.W}px`);
    root.style.setProperty('--h', `${S.H}px`);
    // Measure every decision and result without its picture: the picture
    // takes the rest, up to 4:3, and is the same size on every card
    let need = 0;
    if (measures.length) {
      const probe = document.createElement('div');
      probe.style.cssText = `position:absolute;left:-10000px;top:0;width:${S.W}px;visibility:hidden;--pic:0px`;
      probe.className = 'probe';
      deckEl.append(probe);
      for (const m of measures) {
        probe.innerHTML = `<section class="face ${m.cls}" style="position:relative;height:auto;inset:auto;transform:none">${m.html}</section>`;
        need = Math.max(need, probe.firstElementChild.getBoundingClientRect().height);
      }
      probe.remove();
    }
    const room = S.H - need;
    S.P = Math.round(measures.length ? clamp(room, LEAST, (S.W - 24) * 0.75) : (S.W - 24) * 0.62);
    root.classList.toggle('tight', measures.length > 0 && room < LEAST);
    root.style.setProperty('--pic', `${S.P}px`);
    for (const [i, c] of stack.entries()) { if (!c.anim) { c.pose = depthPose(i + 1); applyPose(c); } }
    if (top && !top.anim && !top.unspring && !busy) { top.pose = { ...depthPose(0), ry: top.pose.ry }; applyPose(top); watchWords(top); }
  }

  // ---- Input

  // When each press began, to ignore one that started before its step appeared
  document.addEventListener('pointerdown', () => { downAt = now(); touched = true; keyboard = false; clearTimeout(idle); }, true);
  document.addEventListener('keydown', () => { keyboard = true; }, true);
  addEventListener('pointerup', () => top?.el.classList.remove('held'));
  addEventListener('pointercancel', () => top?.el.classList.remove('held'));

  deckEl.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-act]');
    if (!b || !top || !top.el.contains(b)) return;
    if (busy || !canPress() || (e.detail > 0 && downAt < readyAt)) return;
    const act = b.dataset.act;
    if (act === 'left' || act === 'right') choose(act);
    else if (act === 'next') next();
    else onAction(act, b);
  });

  // Keys: the arrows choose while a decision is showing; Enter and Space
  // move anything else along (a focused button activates itself)
  document.addEventListener('keydown', (e) => {
    if (e.repeat || e.metaKey || e.ctrlKey || e.altKey || busy || !current || !canPress()) return;
    if (current.kind === 'choice' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      choose(e.key === 'ArrowLeft' ? 'left' : 'right');
    } else if (current.kind !== 'choice' && (e.key === 'Enter' || e.key === ' ')) {
      if (e.target.closest?.('button, a, textarea, select, input')) return;
      e.preventDefault();
      next();
    }
  });

  return {
    show,
    choose,
    next,
    layout,
    get busy() { return busy; },
    get step() { return current; },
  };
}
