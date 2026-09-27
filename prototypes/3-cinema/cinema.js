// Cinema: the opening life as a short film. The design note is at the top
// of index.html. The words, pictures and the life's shape all come from the
// shared modules; this file only decides how they look and move.
import { loadLife } from '../shared/life.js';
import { createFlow } from '../shared/flow.js';
import { drag, spring, buzz } from '../shared/drag.js';

const $ = (sel, root = document) => root.querySelector(sel);
const els = {
  app: $('#app'),
  stage: $('#stage'),
  shots: $('#shots'),
  fade: $('#fade'),
  bloom: $('#bloom'),
  embers: $('#embers'),
  edges: $('#edges'),
  peek: $('#peek'),
  peekText: $('#peekText'),
  helper: $('#helper'),
  words: $('#words'),
  answers: $('#answers'),
  left: $('#answerLeft'),
  right: $('#answerRight'),
  cont: $('#continue'),
  live: $('#live'),
  probe: $('#probe'),
};

const motion = matchMedia('(prefers-reduced-motion: reduce)');
const still = () => motion.matches;
const now = () => performance.now();
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const other = (side) => (side === 'left' ? 'right' : 'left');
const button = (side) => (side === 'left' ? els.left : els.right);

const CHEV = {
  left: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>',
  right: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 5.5 16 12l-6.5 6.5"/></svg>',
};

const FL = 170;       // the frame's fade into night, px (matches --fl)
const OVERLAP = 38;   // how far the subtitles sit up into the foot of that fade

let life;
let flow;
let U;
let current = null;   // the step on screen
let stepAt = 0;       // when it appeared
let armAt = 0;        // when a press starts to count on it
let downAt = -Infinity; // when the latest press began
let mode = 'black';   // how the picture is framed: arrival, card, result, reveal or black
let seq = 0;          // bumps with every step, so a superseded transition stops
let shotCount = 0;

// A press that began before this step appeared (or in its first moments,
// while it's still arriving) is ignored. A keyboard click has no press.
const fresh = (e) => (e && e.detail === 0 ? now() >= armAt : downAt >= armAt);
// Focus only follows the story for someone using the keyboard; a finger
// never sees a focus ring.
let lastInput = 'pointer';
addEventListener('pointerdown', () => { downAt = now(); lastInput = 'pointer'; }, true);
addEventListener('keydown', () => { lastInput = 'key'; }, true);

// ---- Sentences --------------------------------------------------------

const sentences = (text) => String(text).match(/[^.!?]+[.!?]+["'’”)]*\s*|[^.!?]+$/g) || [String(text)];
const sentencesHTML = (text, d = 0) => sentences(text).map((s, i) => `<span class="s" style="--i:${i};--d:${d}ms">${esc(s)}</span>`).join('');

// ---- Pictures ---------------------------------------------------------
// Each layer is an SVG drawn on a 320 x 240 frame that paints 80 units past
// every edge. Widening its viewBox to the whole bleed lets a camera frame it
// any shape without running out of drawing.

const BX = -80;
const BY = -80;
const BW = 480;
const BH = 400;
const bleeds = new Map();

function bleed(url) {
  if (!bleeds.has(url)) {
    bleeds.set(url, fetch(url)
      .then((r) => { if (!r.ok) throw new Error(`${r.status} ${url}`); return r.text(); })
      .then((svg) => {
        const open = svg.match(/<svg\b[^>]*>/);
        if (!open || !/viewBox="0 0 320 240"/.test(open[0])) throw new Error('not a 320 x 240 picture');
        const tag = open[0]
          .replace(/\swidth="[^"]*"/, ' width="480"')
          .replace(/\sheight="[^"]*"/, ' height="400"')
          .replace(/viewBox="0 0 320 240"/, 'viewBox="-80 -80 480 400"');
        const blob = new Blob([svg.replace(open[0], tag)], { type: 'image/svg+xml' });
        return { src: URL.createObjectURL(blob), full: true };
      })
      .catch(() => ({ src: url, full: false })));
  }
  return bleeds.get(url);
}

async function preload() {
  const urls = new Set();
  for (let i = 0; i < life.cards.length; i++) {
    for (const phase of ['before', 'left', 'right']) for (const u of life.picture(i, phase, {}).layers) urls.add(u);
  }
  const faces = [life.inventor.portrait, ...life.cards.map((c) => c.speaker.portrait)].filter(Boolean);
  await Promise.all([
    ...[...urls].map(async (u) => { const b = await bleed(u); const img = new Image(); img.src = b.src; await img.decode().catch(() => {}); }),
    ...[...new Set(faces)].map((u) => { const img = new Image(); img.src = u; return img.decode().catch(() => {}); }),
  ]);
}

// A camera: s pixels per drawing unit, with drawing point (ux, uy) at frame
// point (fx, fy). The rig is the whole bleed, laid out by the camera.
const rigBox = (c) => ({ x: c.fx - (c.ux - BX) * c.s, y: c.fy - (c.uy - BY) * c.s, w: BW * c.s, h: BH * c.s });
function place(rig, c) {
  const b = rigBox(c);
  rig.style.left = `${b.x}px`;
  rig.style.top = `${b.y}px`;
  rig.style.width = `${b.w}px`;
  rig.style.height = `${b.h}px`;
}

async function makeShot(pic, cam) {
  const layers = await Promise.all(pic.layers.map(bleed));
  const shot = document.createElement('div');
  shot.className = 'shot';
  shot.innerHTML = '<div class="drift"><div class="rig"></div></div>';
  const drift = shot.firstChild;
  const rig = drift.firstChild;
  // The bench sits back, the object forward: a pan moves them differently
  const imgs = layers.map((l, i) => {
    const img = new Image();
    img.alt = '';
    img.draggable = false;
    img.src = l.src;
    if (!l.full) img.className = 'inset';
    img.dataset.depth = i === 0 ? '0.55' : String(1 + 0.12 * (i - 1));
    rig.append(img);
    return img;
  });
  await Promise.all(imgs.map((img) => img.decode().catch(() => {})));
  // Once there's fire on the bench, it lights the cave
  if (pic.layers.some((u) => /flame|hearths|ember|warm/.test(u))) {
    const glow = document.createElement('div');
    glow.className = 'glow';
    glow.dataset.depth = '1';
    rig.append(glow);
    imgs.push(glow);
  }
  place(rig, cam);
  // Each shot drifts toward a slightly different point, like a new setup
  const lean = [0, -0.16, 0.16][shotCount++ % 3];
  drift.style.transformOrigin = `${Math.round(cam.fx + lean * L.W)}px ${Math.round(cam.fy - 40)}px`;
  return Object.assign(shot, { drift, rig, imgs, cam, label: pic.label });
}

const liveShot = () => els.shots.lastElementChild;

// A cut: the next shot crossfades in over the last. The old one travels
// toward the new framing as it goes, so a cut to a closer (or wider) shot
// reads as one camera move with only the scene changing, never a double
// image; a choice also whips it a little toward the chosen side.
async function cut(pic, cam, { ms = 320, whip = 0 } = {}) {
  const my = seq;
  const shot = await makeShot(pic, cam);
  if (my !== seq) return;
  const old = [...els.shots.children];
  els.shots.append(shot);
  els.stage.setAttribute('aria-label', pic.label || '');
  if (still() || !ms) { old.forEach((o) => o.remove()); return; }
  shot.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms, easing: 'cubic-bezier(.3,0,.2,1)' });
  for (const o of old) {
    if (!o.cam || !o.rig) continue;
    const a = rigBox(o.cam);
    const b = rigBox(cam);
    if (Math.abs(a.w - b.w) < 1 && Math.abs(a.x - b.x) < 1 && Math.abs(a.y - b.y) < 1) continue;
    // Take over from any camera move still running, from where it has got to
    for (const run of o.rig.getAnimations()) { try { run.commitStyles(); } catch { /* not rendered */ } run.cancel(); }
    const from = o.rig.style.transform || 'none';
    o.rig.animate([
      { transform: from },
      { transform: `translate(${(b.x - a.x).toFixed(2)}px, ${(b.y - a.y).toFixed(2)}px) scale(${(b.w / a.w).toFixed(4)})` },
    ], { duration: ms, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });
  }
  if (whip) {
    for (const o of old) {
      for (const img of o.imgs) {
        const from = img.style.transform || 'translateX(0px)';
        img.animate([{ transform: from }, { transform: `translateX(${(whip * Number(img.dataset.depth)).toFixed(1)}px)` }], { duration: ms, easing: 'cubic-bezier(.4,0,.7,.2)', fill: 'forwards' });
      }
    }
  }
  setTimeout(() => old.forEach((o) => o.remove()), ms + 40);
}

// A camera move on the same shot: lay the rig out where it's going, then
// transform it back to where it was and let it travel (so it stays crisp).
function glide(cam, ms) {
  const shot = liveShot();
  if (!shot) return;
  const a = rigBox(shot.cam);
  const b = rigBox(cam);
  shot.cam = cam;
  place(shot.rig, cam);
  if (still() || !ms) return;
  shot.rig.animate([
    { transform: `translate(${(a.x - b.x).toFixed(2)}px, ${(a.y - b.y).toFixed(2)}px) scale(${(a.w / b.w).toFixed(4)})` },
    { transform: 'none' },
  ], { duration: ms, easing: 'cubic-bezier(.65,0,.35,1)' });
}

function setFade(y, ms = 0, ease = 'cubic-bezier(.65,0,.35,1)') {
  els.fade.style.transition = ms && !still() ? `transform ${ms}ms ${ease}` : 'none';
  els.fade.style.transform = `translateY(${Math.round(y)}px)`;
}

function setStage(opacity, ms = 0) {
  els.stage.style.transition = ms ? `opacity ${still() ? 200 : ms}ms cubic-bezier(.45,0,.4,1)` : 'none';
  els.stage.style.opacity = String(opacity);
}

// ---- Layout -----------------------------------------------------------
// The frame is as tall as it can be (up to 60% of the screen) while the
// tallest subtitle and answer pair still fit under it, so nothing moves
// from card to card.

const L = {};

function measureMax(htmls) {
  const m = document.createElement('div');
  m.style.cssText = 'position:absolute;left:0;right:0;top:0;visibility:hidden';
  m.setAttribute('aria-hidden', 'true');
  els.words.append(m);
  let max = 0;
  for (const h of htmls) { m.innerHTML = h; max = Math.max(max, m.firstElementChild.offsetHeight); }
  m.remove();
  return max;
}

function measureAnswers() {
  const box = els.answers.cloneNode(true);
  box.removeAttribute('id');
  box.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
  box.style.visibility = 'hidden';
  box.className = 'answers';
  els.app.append(box);
  let max = 0;
  const [a, b] = box.querySelectorAll('.label');
  for (const c of life.cards) { a.textContent = c.left.label; b.textContent = c.right.label; max = Math.max(max, box.offsetHeight); }
  box.remove();
  return max;
}

function layout() {
  L.W = els.app.clientWidth;
  L.H = els.app.clientHeight;
  const ps = getComputedStyle(els.probe);
  L.st = parseFloat(ps.paddingTop) || 0;
  L.sb = parseFloat(ps.paddingBottom) || 0;
  const subs = life.cards.map((c) => subtitleHTML(c));
  let size = 20;
  for (;;) {
    document.documentElement.style.setProperty('--sub-size', `${size}px`);
    L.subMax = measureMax(subs);
    L.ansMax = measureAnswers();
    const need = L.subMax + 16 + L.ansMax + 14 + L.sb;
    L.frameH = Math.round(clamp(L.H - need + OVERLAP, L.H * 0.4, L.H * 0.6));
    if (L.H - need + OVERLAP >= L.H * 0.4 || size <= 19) break;
    size -= 1;
  }
  L.subTop = L.frameH - OVERLAP;
  const root = document.documentElement.style;
  root.setProperty('--sub-top', `${L.subTop}px`);
  root.setProperty('--frame-h', `${L.frameH}px`);
}

const topOf = (sel) => { const el = $(`.words > ${sel}:not(.out)`); return el ? el.offsetTop : L.H * 0.5; };

// Where the camera stands, and where the frame fades out, for each framing
function framing(m) {
  const { W } = L;
  if (m === 'card') {
    const fy = Math.round(L.frameH * 0.72);
    const s = Math.max(W / 290, (fy + 6) / 276);
    return { cam: { s, ux: 160, uy: 196, fx: W / 2, fy }, fadeY: L.frameH - FL };
  }
  if (m === 'arrival') {
    // The establishing shot: wide, the whole cave, its top at the top of
    // the screen and the floor fading into the title
    const top = topOf('.opening');
    const s = Math.max(W / 330, (top + 40) / BH);
    const fy = Math.round(Math.min(276 * s - 8, top - 60));
    const cam = { s, ux: 160, uy: 196, fx: W / 2, fy };
    return { cam, fadeY: Math.min(top + 70, fy + 124 * s - 6) - FL };
  }
  if (m === 'result') {
    // A bigger shot of what just happened: the answers have gone, so the
    // picture grows down to the result, which sits just above Continue.
    // A taller frame needs a closer camera to stay full of drawing.
    const end = topOf('.sub.result') + OVERLAP;
    const s = Math.max(W / 290, (end + 12) / BH);
    const fy = Math.round(clamp(end * 0.72, end + 6 - 124 * s, 276 * s - 6));
    return { cam: { s, ux: 162, uy: 196, fx: W / 2, fy }, fadeY: end - FL };
  }
  if (m === 'reveal') {
    // The hero shot: close on the object, which sits on the title card
    const top = topOf('.titlecard');
    const fy = Math.round(top - 30);
    const s = Math.max(W / 196, (fy + 6) / 276);
    const cam = { s, ux: 178, uy: 196, fx: W / 2, fy };
    return { cam, fadeY: Math.min(top + 110, fy + 124 * s - 6) - FL };
  }
  return null;
}

function reframe() {
  if (!life) return;
  layout();
  const f = framing(mode);
  if (!f) return;
  setFade(f.fadeY, 0);
  const shot = liveShot();
  if (shot) { shot.cam = f.cam; place(shot.rig, f.cam); }
  if (mode === 'reveal') placeBloom(f.cam);
}

// ---- The words for each step -----------------------------------------

function subtitleHTML(card, d = 0) {
  const sp = card.speaker;
  return `<section class="sub">
    <div class="speaker enter" style="--d:${d}ms">
      <span class="face">${sp.portrait ? `<img src="${esc(sp.portrait)}" alt="">` : ''}</span>
      <span class="who">${esc(sp.name)}</span>
    </div>
    <p class="line">${sentencesHTML(card.text, d + 100)}</p>
  </section>`;
}

function resultHTML(card, side, d = 0) {
  const o = card[side];
  return `<section class="sub result">
    <p class="chosen enter" style="--d:${d}ms">${CHEV[side]}<span>${esc(o.label)}</span></p>
    <p class="line">${sentencesHTML(o.result, d + 120)}</p>
  </section>`;
}

function openingHTML() {
  const i = life.inventor;
  return `<section class="opening">
    <p class="era enter" style="--d:350ms">${esc(life.era)}</p>
    <h1 class="name focus-in" style="--d:560ms">${esc(i.name)}</h1>
    <p class="role enter" style="--d:900ms">${esc(i.role)}</p>
    <p class="arrival">${sentencesHTML(life.arrival, 1050)}</p>
    <p class="want enter" style="--d:1450ms"><span class="k">${esc(U.wantPrefix)}</span> ${esc(i.want)}</p>
    <button class="primary enter" type="button" data-act="next" style="--d:1600ms">${esc(U.beginLife)}</button>
  </section>`;
}

function titlecardHTML() {
  const inv = life.invention;
  return `<section class="titlecard">
    <p class="kicker enter" style="--d:620ms">${esc(U.revealKicker)}</p>
    <h1 class="title focus-in" style="--d:800ms">${esc(inv.name)}</h1>
    <p class="desc">${sentencesHTML(inv.description, 1150)}</p>
    <p class="first enter" style="--d:1350ms">${esc(U.revealFirst)}</p>
    <button class="primary enter" type="button" data-act="next" style="--d:1500ms">${esc(U.revealAction)}</button>
  </section>`;
}

function creditsHTML() {
  const e = flow.epitaph();
  return `<section class="credits">
    <h1 class="name focus-in" style="--d:450ms">${esc(e.name)}</h1>
    <p class="invented rise" style="--d:700ms">${esc(e.invented)}</p>
    <span class="rule rise" style="--d:880ms" aria-hidden="true"></span>
    <p class="death rise" style="--d:980ms">${esc(e.death)}</p>
    <p class="legacy rise" style="--d:1250ms">${esc(e.legacy)}</p>
    <button class="primary enter" type="button" data-act="next" style="--d:1100ms">${esc(U.epitaphAction)}</button>
  </section>`;
}

function swapWords(html) {
  for (const old of [...els.words.children]) {
    old.classList.add('out');
    old.inert = true;
    setTimeout(() => old.remove(), still() ? 0 : 160);
  }
  els.words.insertAdjacentHTML('beforeend', html);
  return els.words.lastElementChild;
}

const say = (text) => { els.live.textContent = text; };

// A control that's on screen now (not leaving, not hidden)
const live = (el) => Boolean(el && el.isConnected && !el.closest('.out, [hidden], .answers:not(.in)') && getComputedStyle(el).visibility !== 'hidden');

function focusSoon(el, ms) {
  if (lastInput !== 'key') return;
  setTimeout(() => { if (lastInput === 'key' && live(el)) el.focus({ preventScroll: true }); }, still() ? 0 : ms);
}

// ---- The answers, the continue chevron, the helper --------------------

function light(side, v) {
  button(side).style.setProperty('--lit', v.toFixed(3));
}

function showAnswers(card, delay = 240) {
  $('.label', els.left).textContent = card.left.label;
  $('.label', els.right).textContent = card.right.label;
  for (const side of ['left', 'right']) { const b = button(side); b.classList.remove('chosen'); light(side, 0); }
  els.left.style.setProperty('--n', 0);
  els.right.style.setProperty('--n', 1);
  els.answers.style.setProperty('--d', `${delay}ms`);
  els.answers.className = 'answers';
  void els.answers.offsetWidth;
  els.answers.className = 'answers in';
}

function hideAnswers(side) {
  if (!els.answers.classList.contains('in')) { els.answers.className = 'answers'; return; }
  if (side) { button(side).classList.add('chosen'); light(side, 1); light(other(side), 0); }
  els.answers.className = 'answers out';
}

function showContinue(delay) {
  const c = els.cont;
  c.hidden = false;
  c.style.setProperty('--d', `${delay}ms`);
  c.className = 'continue';
  void c.offsetWidth;
  c.className = 'continue in';
}

function hideContinue() {
  const c = els.cont;
  if (c.hidden) return;
  c.className = 'continue out';
  setTimeout(() => { if (c.classList.contains('out')) c.hidden = true; }, 200);
}

function showHelper(index) {
  const text = index === 0 ? U.helperFirst : index === 1 ? U.helperSecond : '';
  const h = els.helper;
  if (!text) { hideHelper(); return; }
  $('span', h).textContent = text;
  $('svg', h).style.display = index === 0 ? '' : 'none'; // the arrows are about swiping
  h.hidden = false;
  h.className = 'helper';
  void h.offsetWidth;
  h.className = 'helper in';
}

function hideHelper() {
  const h = els.helper;
  if (h.hidden) return;
  if (h.classList.contains('aside')) { h.hidden = true; h.className = 'helper'; return; } // already out of the way
  h.className = 'helper out';
  setTimeout(() => { if (h.classList.contains('out')) h.hidden = true; }, 220);
}

function placeBloom(cam) {
  // A warm glow where the object's light would be
  const x = cam.fx + (186 - cam.ux) * cam.s;
  const y = cam.fy + (160 - cam.uy) * cam.s;
  els.bloom.style.setProperty('--bx', `${Math.round(x)}px`);
  els.bloom.style.setProperty('--by', `${Math.round(y)}px`);
}

// ---- The steps --------------------------------------------------------

function render(step) {
  const prev = current;
  current = step;
  seq++;
  stepAt = now();
  // Whatever had focus belonged to the last step
  if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
  const arm = { arrival: 1500, card: 400, result: 450, reveal: 1350, epitaph: 1100 }[step.type] ?? 400;
  armAt = stepAt + (still() ? Math.min(arm, 300) : arm);
  endDrag(true);
  ({ arrival: showArrival, card: showCard, result: showResult, reveal: showReveal, epitaph: showEpitaph })[step.type](step, prev);
}

async function showArrival() {
  hideAnswers();
  hideContinue();
  hideHelper();
  els.embers.classList.remove('on');
  els.bloom.classList.remove('on');
  const el = swapWords(openingHTML());
  mode = 'arrival';
  const f = framing('arrival');
  setStage(0, 0);
  setFade(f.fadeY, 0);
  await cut(life.picture(0, 'before', flow.choices), f.cam, { ms: 0 });
  // Fade up from black, the way a film opens
  requestAnimationFrame(() => setStage(1, 1500));
  focusSoon($('.primary', el), 1700);
  say(`${life.era}. ${life.inventor.name}, ${life.inventor.role}. ${life.arrival} ${U.wantPrefix} ${life.inventor.want}`);
}

async function showCard(step, prev) {
  const from = mode;
  mode = 'card';
  const f = framing('card');
  hideContinue();
  const fromArrival = prev?.type === 'arrival';
  // The last subtitle clears before the next one comes up: no double exposure
  swapWords(subtitleHTML(step.card, fromArrival ? 260 : 150));
  showAnswers(step.card, fromArrival ? 460 : 240);
  showHelper(step.index);
  els.bloom.classList.remove('on');
  say(`${step.card.speaker.name}: ${step.card.text} ${step.card.left.label}; ${step.card.right.label}`);
  const pic = life.picture(step.index, 'before', flow.choices);
  if (fromArrival && from === 'arrival') {
    // The opening title clears and the camera settles in on the bench
    glide(f.cam, 1000);
    setFade(f.fadeY, 1000);
  } else if (prev?.type === 'reveal') {
    setFade(f.fadeY, 650);
    await cut(pic, f.cam, { ms: 450 });
  } else {
    // From a result, the frame closes back up to make room for the answers
    setFade(f.fadeY, prev?.type === 'result' ? 400 : 0, 'cubic-bezier(.22,1,.36,1)');
    await cut(pic, f.cam, { ms: 320 });
  }
}

async function showResult(step) {
  const dir = step.side === 'left' ? -1 : 1;
  hideHelper();
  hideAnswers(step.side);
  swapWords(resultHTML(step.card, step.side, 230)); // after the answers have cleared
  mode = 'result';
  const f = framing('result');
  // The picture grows into the space the answers leave
  setFade(f.fadeY, 440, 'cubic-bezier(.22,1,.36,1)');
  showContinue(still() ? 150 : 650);
  focusSoon(els.cont, 700);
  say(`${step.option.label} ${step.option.result}`);
  const pan = panX;
  panX = 0;
  await cut(life.picture(step.index, step.side, flow.choices), f.cam, { ms: 320, whip: dir * (Math.abs(pan) + 44) });
}

function showReveal() {
  hideContinue();
  const el = swapWords(titlecardHTML());
  mode = 'reveal';
  const f = framing('reveal');
  // The frame opens down the screen and pushes in on the flame
  glide(f.cam, 1100);
  setFade(f.fadeY, 1100);
  placeBloom(f.cam);
  els.bloom.classList.add('on');
  focusSoon($('.primary', el), 1600);
  say(`${U.revealKicker} ${life.invention.name}. ${life.invention.description} ${U.revealFirst}`);
}

function showEpitaph() {
  hideContinue();
  hideHelper();
  const el = swapWords(creditsHTML());
  mode = 'black';
  // Fade to black; the credits start rolling as it goes, and the button is
  // there as soon as the picture has gone
  setStage(0, 1000);
  els.bloom.classList.remove('on');
  setTimeout(() => { if (current?.type === 'epitaph') els.embers.classList.add('on'); }, still() ? 0 : 800);
  focusSoon($('.primary', el), 1300);
  const e = flow.epitaph();
  say(`${e.name}. ${e.invented} ${e.death} ${e.legacy}`);
}

function goNext(e) {
  if (!current || current.type === 'card') return;
  if (e && !fresh(e)) return;
  if (!e && now() < armAt) return;
  if (current.type === 'epitaph') {
    // The credits clear before the opening fades up again
    const my = seq;
    swapWords('');
    els.embers.classList.remove('on');
    seq++;
    setTimeout(() => { if (seq === my + 1) flow.next(); }, still() ? 0 : 450);
    return;
  }
  flow.next();
}

function chooseSide(side) {
  if (current?.type !== 'card') return;
  stopSpring?.();
  hidePeek();
  press(false);
  buzz(12);
  flow.choose(side);
}

// ---- Swiping across the picture --------------------------------------

let panX = 0;
let dragging = false;
let armedSide = null;
let stopSpring = null;

const threshold = () => Math.min(108, L.W * 0.26);

function setPan(x) {
  panX = x;
  const shot = liveShot();
  if (!shot) return;
  for (const img of shot.imgs) img.style.transform = x ? `translateX(${(x * Number(img.dataset.depth)).toFixed(2)}px)` : '';
}

function press(on) {
  els.edges.classList.toggle('show', Boolean(on) && current?.type === 'card');
  if (!on) delete els.edges.dataset.side;
}

function preview(dx) {
  stopSpring?.();
  const side = dx < 0 ? 'left' : 'right';
  const prog = Math.min(1, Math.abs(dx) / threshold());
  const armed = prog >= 1;
  const p = still() ? 0 : 42 * Math.tanh(dx / 150);
  setPan(p);
  if (els.peek.dataset.side !== side) {
    els.peek.dataset.side = side;
    els.peekText.textContent = current.card[side].label;
  }
  els.peek.style.opacity = clamp(prog * 1.7 - 0.12, 0, 1).toFixed(3);
  els.peek.style.transform = `translateX(${(p * 0.8).toFixed(1)}px)`;
  els.peek.classList.toggle('armed', armed);
  els.edges.dataset.side = side;
  light(side, armed ? 1 : prog * 0.42);
  light(other(side), 0);
  if (armed && armedSide !== side) { armedSide = side; buzz(); }
  if (!armed) armedSide = null;
}

function hidePeek() {
  els.peek.style.transition = 'opacity 160ms ease';
  els.peek.style.opacity = '0';
  els.peek.classList.remove('armed');
  setTimeout(() => { els.peek.style.transition = ''; }, 170);
}

// Let go too soon: the shot springs back and the helper returns
function settle() {
  hidePeek();
  press(false);
  light('left', 0);
  light('right', 0);
  armedSide = null;
  els.helper.classList.remove('aside');
  const from = panX;
  stopSpring = spring(from, 0, (x) => setPan(x), { stiffness: 320, damping: 25 });
}

// A new step: forget any drag (the helper is the new step's business)
function endDrag(reset) {
  dragging = false;
  armedSide = null;
  els.app.classList.remove('dragging');
  if (reset) { hidePeek(); press(false); }
}

// A tap on the picture: the shot shrugs, to show it moves
function nudge() {
  if (els.helper.classList.contains('in')) {
    els.helper.classList.remove('flash');
    void els.helper.offsetWidth;
    els.helper.classList.add('flash');
  }
  press(true);
  setTimeout(() => { if (!dragging) press(false); }, 700);
  if (still()) return;
  const shot = liveShot();
  if (!shot) return;
  for (const img of shot.imgs) {
    const d = Number(img.dataset.depth);
    img.animate([
      { transform: 'translateX(0)' },
      { transform: `translateX(${(-13 * d).toFixed(1)}px)`, offset: 0.3 },
      { transform: `translateX(${(9 * d).toFixed(1)}px)`, offset: 0.65 },
      { transform: 'translateX(0)' },
    ], { duration: 720, easing: 'ease-in-out' });
  }
}

drag(els.app, {
  axis: 'x',
  start(e) {
    if (e.target.closest('button, a')) return false;
    // On a result, a press anywhere presses Continue
    if (current?.type === 'result') { if (now() >= armAt) els.cont.classList.add('pressed'); return true; }
    if (current?.type !== 'card' || now() < armAt) return false;
    press(true);
    return true;
  },
  move({ dx }) {
    if (current?.type !== 'card') return;
    if (!dragging) els.helper.classList.add('aside');
    dragging = true;
    els.app.classList.add('dragging');
    preview(dx);
  },
  end({ dx, cancelled }) {
    if (current?.type !== 'card' || !dragging) return;
    const commit = !cancelled && Math.abs(dx) >= threshold();
    dragging = false;
    els.app.classList.remove('dragging');
    if (commit) { chooseSide(dx < 0 ? 'left' : 'right'); return; }
    settle();
  },
  tap(e) {
    if (current?.type === 'result') goNext(e);
    else if (current?.type === 'card') nudge();
  },
});
// Lifting a finger clears the press states. Capture phase, so it runs
// before drag.js reports a tap (a tap on the picture shows them again).
const lift = () => { if (!dragging) press(false); els.cont.classList.remove('pressed'); };
addEventListener('pointerup', lift, true);
addEventListener('pointercancel', lift, true);

// ---- Buttons and keys -------------------------------------------------

for (const side of ['left', 'right']) {
  button(side).addEventListener('click', (e) => {
    if (current?.type !== 'card' || !fresh(e)) return;
    chooseSide(side);
  });
}
els.cont.addEventListener('click', (e) => goNext(e));
els.words.addEventListener('click', (e) => { if (e.target.closest('[data-act="next"]')) goNext(e); });

addEventListener('keydown', (e) => {
  if (e.repeat || e.altKey || e.metaKey || e.ctrlKey) return;
  const t = current?.type;
  if (t === 'card' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
    e.preventDefault();
    if (now() < armAt) return;
    const side = e.key === 'ArrowLeft' ? 'left' : 'right';
    light(side, 1);
    chooseSide(side);
    return;
  }
  if ((e.key === 'Enter' || e.key === ' ') && t && t !== 'card') {
    if (e.target.closest?.('a') || (e.target.closest?.('button') && live(e.target.closest('button')))) return; // it clicks itself
    e.preventDefault();
    goNext();
  }
});

// No pinch-zoom in Safari; and a touch listener, without which iOS never
// shows a button's pressed state
for (const type of ['gesturestart', 'gesturechange']) document.addEventListener(type, (e) => e.preventDefault());
document.addEventListener('touchstart', () => {}, { passive: true });

let resizeRaf = 0;
addEventListener('resize', () => { cancelAnimationFrame(resizeRaf); resizeRaf = requestAnimationFrame(reframe); });

// ---- Start ------------------------------------------------------------

async function init() {
  life = await loadLife();
  U = life.ui;
  $('.continue-label', els.cont).textContent = U.resultContinue;
  // Both faces, before anything is measured (Fraunces isn't on screen yet)
  await Promise.race([
    Promise.all([
      document.fonts.load('500 20px "Atkinson Hyperlegible Next"'),
      document.fonts.load('560 68px "Fraunces"'),
    ]).then(() => document.fonts.ready),
    wait(2500),
  ]).catch(() => {});
  await preload();
  layout();
  flow = createFlow(life, render);
  // For the test driver: what's on screen
  window.cinema = { flow, life, L, get step() { return current; }, get armAt() { return armAt; } };
  flow.start();
}

init().catch((err) => {
  console.error(err);
  document.body.insertAdjacentHTML('beforeend', `<p class="oops">${esc(err.message)}</p>`);
});
