// The Notebook: the opening life as the inventor's own notebook. Each step
// is a page; see the design note in index.html.
import { loadLife } from '../shared/life.js';
import { createFlow } from '../shared/flow.js';
import { drag, spring, buzz } from '../shared/drag.js';
import { createTurn } from './turn.js';
import {
  rng, boxPath, tickPath, ringPath, underlinePath, arrowPath,
  prep, setStroke, strokeAt, drawTo, tween, ease, writeText, reduced,
} from './ink.js';

const R = 28;               // the rule
const HEAD = 2;             // rows: the page's top margin, and the heading line
const FOOT = 1;             // rows: the foot, with the corner's label
const CHOOSE_AT = 0.28;     // a swipe past this share of the page's width chooses
const TICK_SHARE = 0.34;    // of a swipe: first the tick, then the ring round the line
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const book = $('#book');
const cornerBtn = $('#corner');
const live = $('#live');
const rootStyle = document.documentElement.style;

let life;
let flow;
let turn;
let top = null;             // the page on top
let under = null;           // the page beneath it, ready for the turn
let phase = 'boot';         // card | choosing | writing | entering | ready | turning
let stepAt = 0;             // when the current step appeared: presses that began earlier are ignored
let readyAt = 0;            // when the corner appeared
let downAt = -Infinity;     // when the last press began
let writer = null;          // the result being written in
let rest = null;            // the fold at rest: the lifted corner, or null when flat
let cornerAnim = null;      // cancels whatever the corner is doing
let turnFromDrag = false;
let viaKeys = false;
const G = { W: 390, H: 844, safeT: 0, safeB: 0, gridTop: 0, rows: 23, textX: 60, right: 18 };

// ---------------------------------------------------------------- Layout

function measure() {
  const cs = getComputedStyle($('#safe'));
  let safeT = parseFloat(cs.paddingTop) || 0;
  let safeB = parseFloat(cs.paddingBottom) || 0;
  // ?safe=47,34 stands in for a notched phone when testing on a desktop
  const fake = new URLSearchParams(location.search).get('safe');
  if (fake) [safeT, safeB] = fake.split(',').map((n) => Number(n) || 0);
  Object.assign(G, { safeT, safeB });
  rootStyle.setProperty('--safe-b', `${safeB}px`);
  G.W = book.clientWidth || innerWidth;
  G.H = book.clientHeight || innerHeight - safeB;
  // The first row is the page's top margin; on a notched phone it sits
  // under the status bar
  G.gridTop = Math.round(safeT - 8);
  G.rows = Math.floor((G.H - G.gridTop - 16) / R);
  rootStyle.setProperty('--grid-top', `${G.gridTop}px`);
  rootStyle.setProperty('--rows', G.rows);
  const root = getComputedStyle(document.documentElement);
  G.textX = parseFloat(root.getPropertyValue('--text-x')) || 60;
  G.right = parseFloat(root.getPropertyValue('--right')) || 18;
  turn?.size(G.W, G.H);
}

const rowsOf = (el) => Math.max(0, Math.round(el.getBoundingClientRect().height / R - 0.02));
const setRows = (el, n) => { el.style.height = `${n * R}px`; };

// How many lines a text takes in the result's style, at this page's measure
function linesOf(sheet, text, cls = 'result') {
  const probe = document.createElement('div');
  probe.className = cls;
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText = `position:absolute;visibility:hidden;left:${G.textX}px;right:${G.right}px;top:0;height:auto`;
  probe.textContent = text;
  sheet.append(probe);
  const n = Math.round(probe.getBoundingClientRect().height / R);
  probe.remove();
  return n;
}

// Moves a heading so its last baseline sits just on a rule
function sitOnRule(el) {
  el.style.top = '0px';
  const mark = document.createElement('span');
  mark.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
  el.append(mark);
  const sheet = el.closest('.sheet').getBoundingClientRect();
  const y = mark.getBoundingClientRect().top - sheet.top;
  mark.remove();
  const target = Math.round((y - 21) / R) * R + 21;
  el.style.top = `${target - y}px`;
}

// ---------------------------------------------------------------- Pages

const keyOf = (s) => `${s.type}:${s.index ?? ''}`;
const folioOf = (s) => ({ arrival: 1, reveal: 6, epitaph: 9 }[s.type] ?? (s.index < 4 ? s.index + 2 : s.index + 3));

function newPage(cls) {
  const p = document.createElement('section');
  p.className = `page ${cls}`;
  p.innerHTML = '<div class="paper" aria-hidden="true"></div><div class="sheet" tabindex="-1"></div>';
  if (cls === 'under') { p.inert = true; p.setAttribute('aria-hidden', 'true'); }
  book.prepend(p);
  return p;
}

// The heading: the era written on the heading line, and the page number
const headHTML = (folio) => `<header class="head"><p class="era hand">${esc(life.era)}</p><p class="folio hand" aria-hidden="true">${folio}</p></header>`;

// The way back to the prototypes: shown quietly in the top margin, but last
// in the page, so Tab and screen readers reach the story and answers first
const backHTML = '<a class="back" href="../"><svg viewBox="0 0 14 14" aria-hidden="true"><path d="M8.6 2.6 4.2 7l4.4 4.4"/></svg>Prototypes</a>';

const footHTML = (label) => `<footer class="foot"><p class="pto hand" aria-hidden="true">${esc(label)}</p></footer>`;

function printHTML(pic, seed) {
  const r = rng(seed * 97 + 11);
  const rot = ((r() - 0.5) * 2.8).toFixed(2);
  const ta = (-38 + (r() - 0.5) * 12).toFixed(1);
  const tb = (40 + (r() - 0.5) * 12).toFixed(1);
  return `<figure class="print" role="img" aria-label="${esc(pic.label || '')}" style="--rot:${rot}deg" data-jitter="${((r() - 0.5) * 12).toFixed(1)}">
    <div class="art"><div class="layers">${pic.layers.map((u) => `<img src="${esc(u)}" alt="" draggable="false">`).join('')}</div></div>
    <i class="tape a" style="transform:rotate(${ta}deg)"></i><i class="tape b" style="transform:rotate(${tb}deg)"></i>
  </figure>`;
}

function portraitHTML(src, name, seed, extra = '') {
  const r = rng(seed);
  return `<figure class="portrait" role="img" aria-label="${esc(name)}" style="--rot:${(-2.2 - r() * 2).toFixed(1)}deg">
    <div class="frame"><img src="${esc(src)}" alt="" draggable="false"></div>${extra}
    <i class="tape a"></i><i class="tape b"></i>
  </figure>`;
}

const optionHTML = (side, label) => `<button class="option" type="button" data-side="${side}">
  <svg class="dir" viewBox="0 0 26 16" aria-hidden="true"><path class="dir-line"/></svg>
  <span class="mark" aria-hidden="true"><svg viewBox="0 0 22 22"><path class="box-line" transform="translate(1 1)"/><path class="tick-line" transform="translate(1 1)"/></svg></span>
  <span class="label">${esc(label)}</span>
  <svg class="ring" aria-hidden="true"><path class="ring-line"/></svg>
</button>`;

function cardHTML(step) {
  const c = step.card;
  const pic = life.picture(step.index, 'before', flow.choices);
  const helper = [life.ui.helperFirst, life.ui.helperSecond][step.index] || '';
  const who = c.speaker?.name
    ? `<div class="who"><p class="name hand">${esc(c.speaker.name)}</p>${c.speaker.portrait ? `<span class="face" aria-hidden="true"><img src="${esc(c.speaker.portrait)}" alt="" draggable="false"></span>` : ''}</div>`
    : '';
  return `${headHTML(folioOf(step))}
    <div class="gap g0"></div>
    <div class="print-block">${printHTML(pic, step.index + 1)}</div>
    <div class="gap g1"></div>
    <div class="story-block">${who}<p class="story">${esc(c.text)}</p></div>
    <div class="gap g2"></div>
    <div class="options">${optionHTML('left', c.left.label)}${optionHTML('right', c.right.label)}</div>
    <div class="result-area">${helper ? `<p class="note hand">${esc(helper)}</p>` : ''}<div class="result" aria-live="polite"></div></div>
    ${footHTML('Turn the page')}`;
}

function arrivalHTML() {
  const inv = life.inventor;
  return `${headHTML(1)}
    <div class="gap g0"></div>
    <div class="title-block"><h1 class="title">${esc(life.title)}</h1></div>
    <div class="gap g1"></div>
    <div class="who-block">${portraitHTML(inv.portrait, inv.name, 5)}
      <div class="who-text"><p class="big-name hand">${esc(inv.name)}</p><p class="role">${esc(inv.role)}</p></div>
    </div>
    <div class="gap g2"></div>
    <p class="story">${esc(life.arrival)}</p>
    <div class="gap g3"></div>
    <div class="want-block"><p class="want-label hand">${esc(life.ui.wantPrefix)}</p><p class="want">${esc(inv.want)}<svg aria-hidden="true"><path class="underline-line"/></svg></p></div>
    ${footHTML(life.ui.beginLife)}`;
}

function revealHTML() {
  const pic = life.picture(3, flow.choices[life.cards[3].id] || 'left', flow.choices);
  return `${headHTML(6)}
    <p class="kicker hand">${esc(life.ui.revealKicker)}</p>
    <div class="gap g0"></div>
    <div class="print-block big">${printHTML(pic, 17)}<svg class="spark" viewBox="0 0 50 50" aria-hidden="true"></svg></div>
    <div class="inv-block"><h1 class="inv-name">${esc(life.invention.name)}<svg aria-hidden="true"></svg></h1></div>
    <div class="gap g1"></div>
    <p class="story">${esc(life.invention.description)}</p>
    <div class="gap g2"></div>
    <p class="note hand first">${esc(life.ui.revealFirst)}</p>
    ${footHTML(life.ui.revealAction)}`;
}

function epitaphHTML() {
  const e = flow.epitaph();
  const inv = life.inventor;
  return `${headHTML(9)}
    <div class="gap g0"></div>
    <div class="obit">
      <div class="obit-photo">${portraitHTML(inv.portrait, e.name, 9, '<i class="band" aria-hidden="true"></i>')}</div>
      <div class="obit-name-block"><h1 class="obit-name">${esc(e.name)}</h1></div>
      <p class="obit-invented">${esc(e.invented)}</p>
      <div class="obit-rule"><svg viewBox="0 0 150 10" aria-hidden="true"><path class="divider-line thick"/><path class="divider-line thin"/></svg></div>
      <p class="story blue">${esc(e.death)}</p>
      <div class="gap g1"></div>
      <p class="story blue">${esc(e.legacy)}</p>
    </div>
    ${footHTML(life.ui.epitaphAction)}`;
}

function build(page, step) {
  page._step = step;
  page.dataset.key = keyOf(step);
  page.dataset.kind = step.type;
  page.classList.remove('decided', 'ready');
  const sheet = $('.sheet', page);
  sheet.innerHTML = { card: cardHTML, arrival: arrivalHTML, reveal: revealHTML, epitaph: epitaphHTML }[step.type](step) + backHTML;
  fit(page);
}

// ---------------------------------------------------------------- Fitting a page to its rules

function fit(page) {
  const kind = page.dataset.kind;
  if (kind === 'card') fitCard(page);
  else if (kind === 'arrival') fitArrival(page);
  else if (kind === 'reveal') fitReveal(page);
  else if (kind === 'epitaph') fitEpitaph(page);
}

// A taped print in its block of rows: never wider than 2:1
function sizePrint(page, rows, maxW) {
  const block = $('.print-block', page);
  setRows(block, rows);
  const print = $('.print', block);
  const ph = rows * R - 24;
  const col = G.W - G.textX - G.right;
  const pw = Math.round(Math.min(maxW ?? col + 14, ph * 2));
  const jitter = Number(print.dataset.jitter) || 0;
  const centre = G.textX + col / 2 - G.W / 2;
  print.style.setProperty('--pw', `${pw}px`);
  print.style.setProperty('--ph', `${ph}px`);
  print.style.setProperty('--px', `${(centre + jitter - (pw > col ? 6 : 0)).toFixed(1)}px`);
}

function fitCard(page) {
  const sheet = $('.sheet', page);
  const c = page._step.card;
  const seed = page._step.index * 31 + 7;
  // the answers: one row per line of label, and a blank row under each
  let optRows = 0;
  for (const o of $$('.option', page)) {
    o.style.height = '';
    const lines = Math.max(1, Math.round($('.label', o).getBoundingClientRect().height / R));
    setRows(o, lines + 1);
    optRows += lines + 1;
  }
  const note = $('.note', page);
  const resRows = Math.max(linesOf(sheet, c.left.result), linesOf(sheet, c.right.result), note ? rowsOf(note) : 0);
  setRows($('.result-area', page), resRows);
  const story = rowsOf($('.story', page));
  const avail = G.rows - HEAD - FOOT; // below the heading, above the foot
  let free = avail - story - optRows - resRows;
  // Spend the room: the picture first, then a line before the answers, a
  // line kept clear above the foot (the leftover lands there), a bigger
  // picture, a line after the picture, and the biggest picture
  let pic = Math.min(free, 4);
  free -= pic;
  const g2 = free >= 1 ? 1 : 0; free -= g2;
  const clear = free >= 1 ? 1 : 0; free -= clear;
  let more = Math.min(free, 2); pic += more; free -= more;
  const g1 = free >= 1 ? 1 : 0; free -= g1;
  more = Math.min(free, 3); pic += more; free -= more;
  const g0 = free >= 2 ? 1 : 0; free -= g0;
  setRows($('.g0', page), g0);
  setRows($('.g1', page), g1);
  setRows($('.g2', page), g2);
  // A page too short for a sketch keeps its words and lets the sketch go
  $('.print-block', page).hidden = pic < 3;
  if (pic >= 3) sizePrint(page, pic);
  decorateOptions(page, seed);
  fitPto(page);
}

// The corner's label fits between the way back and the dog-ear
function fitPto(page) {
  const pto = $('.pto', page);
  if (!pto) return;
  pto.style.removeProperty('--pto-size');
  const room = G.W - 56 - G.right - G.textX;
  const w = pto.scrollWidth;
  if (w > room) pto.style.setProperty('--pto-size', `${Math.max(21, Math.floor(27 * room / w))}px`);
}

function decorateOptions(page, seed) {
  const r = rng(seed);
  for (const o of $$('.option', page)) {
    const side = o.dataset.side;
    const box = $('.box-line', o);
    box.setAttribute('d', boxPath(20, r));
    prep(box, 1);
    const tick = $('.tick-line', o);
    tick.setAttribute('d', tickPath(20, r));
    prep(tick, 0);
    const dir = $('.dir-line', o);
    dir.setAttribute('d', arrowPath(22, side, r));
    prep(dir, 1);
    // the ring hugs the words, not the button
    const lab = $('.label', o);
    const range = document.createRange();
    range.selectNodeContents(lab);
    const rects = [...range.getClientRects()];
    const ob = o.getBoundingClientRect();
    const x0 = Math.min(...rects.map((q) => q.left)) - ob.left;
    const x1 = Math.max(...rects.map((q) => q.right)) - ob.left;
    const y0 = Math.min(...rects.map((q) => q.top)) - ob.top;
    const y1 = Math.max(...rects.map((q) => q.bottom)) - ob.top;
    const ring = $('.ring-line', o);
    ring.setAttribute('d', ringPath(x0 - 5, y0 + 2, x1 - x0 + 10, y1 - y0 - 4, r));
    prep(ring, 0);
    setMarks(o, o._p || 0);
  }
}

function fitArrival(page) {
  const title = $('.title', page);
  const tb = $('.title-block', page);
  tb.style.height = '';
  setRows(tb, Math.max(2, Math.ceil(title.getBoundingClientRect().height / R - 0.1)));
  const story = rowsOf($('.story', page));
  const wb = $('.want-block', page);
  wb.style.height = '';
  const want = Math.ceil(wb.getBoundingClientRect().height / R - 0.1);
  setRows(wb, want);
  // The portrait gets four lines, then the breathing room, then the rest
  let free = G.rows - HEAD - FOOT - rowsOf(tb) - story - want;
  let who = Math.min(4, free); free -= who;
  const take = (n = 1) => { const t = Math.min(n, Math.max(0, free)); free -= t; return t; };
  const g3 = take();
  const g2 = take();
  free -= 1; // a line kept clear above the foot
  const g1 = take();
  who += take(3);
  const g0 = take();
  free += 1;
  const wbk = $('.who-block', page);
  setRows(wbk, who);
  $('.portrait', wbk).style.setProperty('--fw', `${Math.round((who * R - 24) * 0.8)}px`);
  setRows($('.g0', page), g0);
  setRows($('.g1', page), g1);
  setRows($('.g2', page), g2);
  setRows($('.g3', page), g3);
  sitOnRule(title);
  // the want, underlined in red pencil, line by line
  const wantEl = $('.want', page);
  const svg = $('.want svg', page);
  const wr = wantEl.getBoundingClientRect();
  svg.setAttribute('viewBox', `0 0 ${wr.width + 8} ${wr.height + 10}`);
  svg.style.cssText = `left:-4px;top:0;bottom:auto;width:${wr.width + 8}px;height:${wr.height + 10}px`;
  const range = document.createRange();
  range.selectNodeContents(wantEl.firstChild);
  const r = rng(3);
  svg.innerHTML = [...range.getClientRects()].map((q) => `<path class="underline-line" transform="translate(${(q.left - wr.left + 2).toFixed(1)} ${(q.bottom - wr.top + 1).toFixed(1)})" d="${underlinePath(q.width + 4, r, 0)}"/>`).join('');
  for (const p of $$('path', svg)) prep(p, page.classList.contains('drawn') ? 1 : 0);
  fitPto(page);
}

function fitReveal(page) {
  const name = $('.inv-name', page);
  const ib = $('.inv-block', page);
  ib.style.height = '';
  setRows(ib, Math.max(2, Math.ceil(name.getBoundingClientRect().height / R + 0.2)));
  const story = rowsOf($('.story', page));
  const note = rowsOf($('.note', page)) || 1;
  let free = G.rows - HEAD - FOOT - 1 - rowsOf(ib) - story - note;
  let pic = Math.min(free, 6); free -= pic;
  const g0 = free >= 1 ? 1 : 0; free -= g0;
  const g1 = free >= 1 ? 1 : 0; free -= g1;
  const g2 = free >= 1 ? 1 : 0; free -= g2;
  const more = Math.min(free, 4); pic += more; free -= more;
  setRows($('.g0', page), g0);
  setRows($('.g1', page), g1);
  setRows($('.g2', page), g2);
  sizePrint(page, Math.max(4, pic));
  sitOnRule(name);
  // the invention's name, underlined line by line in red pencil
  const svg = $('.inv-name svg', page);
  const nb = name.getBoundingClientRect();
  svg.setAttribute('viewBox', `0 0 ${nb.width + 8} ${nb.height + 14}`);
  svg.style.cssText = `left:-4px;top:0;bottom:auto;width:${nb.width + 8}px;height:${nb.height + 14}px`;
  const range = document.createRange();
  range.selectNodeContents(name.firstChild);
  const lines = [...range.getClientRects()];
  const r = rng(41);
  svg.innerHTML = lines.map((q) => `<path class="underline-line" transform="translate(${(q.left - nb.left + 2).toFixed(1)} ${(q.bottom - nb.top - 1).toFixed(1)})" d="${underlinePath(q.width + 6, r, 0)}"/>`).join('');
  for (const p of $$('path', svg)) prep(p, page.classList.contains('drawn') ? 1 : 0);
  // a few strokes of excitement off the drawing's corner, out in the margin
  const spark = $('.spark', page);
  const blk = $('.print-block', page).getBoundingClientRect();
  const pr = $('.print', page).getBoundingClientRect();
  spark.style.cssText = `left:${(pr.left - blk.left - 44).toFixed(1)}px;top:${(pr.top - blk.top - 36).toFixed(1)}px;width:50px;height:50px`;
  const rs = rng(77);
  spark.innerHTML = [-160, -125, -90].map((a) => {
    const t = (a + (rs() - 0.5) * 8) * Math.PI / 180;
    const r0 = 10 + rs() * 2;
    const r1 = 21 + rs() * 4;
    return `<path d="M${(44 + Math.cos(t) * r0).toFixed(1)} ${(40 + Math.sin(t) * r0).toFixed(1)}L${(44 + Math.cos(t) * r1).toFixed(1)} ${(40 + Math.sin(t) * r1).toFixed(1)}"/>`;
  }).join('');
  for (const p of $$('path', spark)) prep(p, page.classList.contains('drawn') ? 1 : 0);
  fitPto(page);
}

function fitEpitaph(page) {
  const obit = $('.obit', page);
  const s = $$('.story', obit).map(rowsOf);
  const inv = $('.obit-invented', page);
  const invRows = rowsOf(inv);
  let free = G.rows - HEAD - FOOT - 2 - invRows - 1 - s[0] - s[1];
  let photo = clamp(free - 2, 4, 6); free -= photo;
  const g1 = free >= 1 ? 1 : 0; free -= g1;
  const g0 = Math.floor(free / 2); free -= g0; // centred between the heading and the foot
  setRows($('.obit-photo', page), photo);
  $('.obit-photo .portrait', page).style.setProperty('--fw', `${Math.round((photo * R - 26) * 0.8)}px`);
  setRows($('.obit-name-block', page), 2);
  setRows($('.obit-rule', page), 1);
  setRows($('.g0', page), g0);
  setRows($('.g1', page), g1);
  sitOnRule($('.obit-name', page));
  const r = rng(12);
  const [thick, thin] = $$('.divider-line', page);
  thick.setAttribute('d', underlinePath(146, r, 2));
  thin.setAttribute('d', underlinePath(118, r, 7));
  thin.setAttribute('transform', 'translate(14 0)');
  for (const p of [thick, thin]) prep(p, page.classList.contains('drawn') ? 1 : 0);
  fitPto(page);
}

// ---------------------------------------------------------------- Marks

function setMarks(opt, p) {
  opt._p = p;
  setStroke($('.tick-line', opt), clamp(p / TICK_SHARE));
  setStroke($('.ring-line', opt), clamp((p - TICK_SHARE) / (1 - TICK_SHARE)));
}

function animateMarks(opt, to, duration, easing = ease.pen) {
  const from = opt._p || 0;
  opt._anim?.cancel();
  opt._anim = tween(duration * Math.abs(to - from), (e) => setMarks(opt, lerp(from, to, e)), { easing });
  return opt._anim.done;
}

// ---------------------------------------------------------------- The steps

function render(step) {
  if (step.type === 'result') { showResult(step); return; }
  if (!top) {
    top = newPage('top');
    under = newPage('under');
    build(top, step);
    turn.setTop(top);
    top.classList.add('arrive');
    enterPage(true);
    return;
  }
  if (under.dataset.key !== keyOf(step) || step.type === 'arrival') build(under, step);
  turnOver();
}

function enterPage(first) {
  stepAt = performance.now();
  const page = top;
  const kind = page.dataset.kind;
  announce(page._step);
  if (viaKeys) $('.sheet', page).focus({ preventScroll: true });
  if (kind === 'card') { phase = 'card'; return; }
  phase = 'entering';
  const t0 = first ? 520 : 120;
  wait(t0).then(() => {
    if (top !== page) return;
    page.classList.add('drawn');
    const strokes = kind === 'reveal' ? [...$$('.spark path', page), ...$$('.inv-name path', page)]
      : kind === 'arrival' ? $$('.underline-line', page)
        : $$('.divider-line', page);
    strokes.forEach((p, i) => drawTo(p, 1, 420, { delay: i * 110, easing: ease.pen }));
    return wait(first ? 260 : 160);
  }).then(() => { if (top === page && phase === 'entering') makeReady(); });
}

function showResult(step) {
  const page = top;
  phase = 'writing';
  stepAt = performance.now();
  page.classList.add('decided');
  const chosen = $(`.option[data-side="${step.side}"]`, page);
  for (const o of $$('.option', page)) {
    o.classList.remove('pressing', 'leaning');
    o.setAttribute('aria-disabled', 'true');
    if (o !== chosen) animateMarks(o, 0, 220, ease.out);
  }
  chosen.classList.add('chosen');
  book.classList.remove('dragging');
  for (const o of $$('.option', page)) o.style.setProperty('--lean', '0px');
  const p0 = chosen._p || 0;
  animateMarks(chosen, 1, 460);
  swapArt(page, life.picture(step.index, step.side, flow.choices));
  const note = $('.result-area .note', page);
  if (note) { note.classList.add('out'); setTimeout(() => { note.hidden = true; }, 230); }
  const res = $('.result', page);
  writer = writeText(res, step.option.result, { delay: reduced() ? 0 : (note ? 200 : 120) + 220 * (1 - p0) });
  const mine = writer;
  writer.done.then(() => {
    if (writer !== mine || top !== page) return;
    writer = null;
    if (phase === 'writing') makeReady();
  });
}

// The sketch catches up with what happened
function swapArt(page, pic) {
  const layers = $('.print .layers', page);
  if (!layers) return;
  const now = $$('img', layers).map((i) => i.src);
  if (now.length === pic.layers.length && now.every((u, i) => u === pic.layers[i])) return;
  const next = document.createElement('div');
  next.className = 'layers';
  next.innerHTML = pic.layers.map((u) => `<img src="${esc(u)}" alt="" draggable="false">`).join('');
  layers.after(next);
  $('.print', page).setAttribute('aria-label', pic.label || '');
  const a = next.animate([{ opacity: 0 }, { opacity: 1 }], { duration: reduced() ? 120 : 420, delay: reduced() ? 0 : 140, easing: 'ease-out', fill: 'backwards' });
  a.finished.then(() => layers.remove()).catch(() => {});
}

function makeReady() {
  phase = 'ready';
  readyAt = performance.now();
  top.classList.add('ready');
  prepareUnder();
  $('.pto', top)?.classList.add('on');
  liftCorner();
  placeCorner();
}

// The next page, drawn beneath before it's needed, so the lifted corner and
// a dragged page show what's really there. A throwaway flow finds it.
function peek() {
  let seen = null;
  const probe = createFlow(life, (s) => { seen = s; });
  probe.step = flow.step;
  probe.choices = { ...flow.choices };
  probe.next();
  return seen;
}

function prepareUnder() {
  const next = peek();
  if (next && under.dataset.key !== keyOf(next)) build(under, next);
}

// ---------------------------------------------------------------- The corner and the turn

const restPoint = () => ({ x: G.W - 40, y: G.H - 50 });

function stopCorner() { cornerAnim?.(); cornerAnim = null; }

function foldTo(to, { stiffness = 230, damping = 15, done } = {}) {
  stopCorner();
  const from = turn.P || turn.corner;
  const tgt = to || turn.corner;
  cornerAnim = spring(0, 1, (u) => turn.set(u === 1 && !to ? null : { x: lerp(from.x, tgt.x, u), y: lerp(from.y, tgt.y, u) }), { stiffness, damping, done });
}

function liftCorner() {
  rest = restPoint();
  if (reduced()) { turn.set(rest); return; }
  turn.set(null);
  foldTo(rest, { stiffness: 220, damping: 15 });
}

function placeCorner() {
  const pto = $('.pto', top);
  if (!pto) return;
  const r = pto.getBoundingClientRect();
  const left = Math.max(G.W * 0.45, r.left - 16);
  cornerBtn.style.width = `${Math.round(G.W - left)}px`;
  cornerBtn.style.height = `${Math.round(Math.max(60, G.H - r.top + 12))}px`;
  cornerBtn.setAttribute('aria-label', pto.textContent.trim());
  cornerBtn.hidden = false;
}

// A tap elsewhere on a finished page: the corner lifts a little, to say "here"
function hintCorner() {
  if (!rest || reduced()) return;
  stopCorner();
  const from = turn.P || rest;
  const big = { x: G.W - 78, y: G.H - 96 };
  const t = tween(190, (e) => turn.set({ x: lerp(from.x, big.x, e), y: lerp(from.y, big.y, e) }));
  cornerAnim = t.cancel;
  t.done.then(() => { if (phase === 'ready' && cornerAnim === t.cancel) foldTo(rest, { stiffness: 200, damping: 11 }); });
}

function pressCorner(on) {
  if (phase !== 'ready' || !rest) return;
  $('.pto', top)?.classList.toggle('pressing', on);
  if (reduced()) return;
  foldTo(on ? { x: G.W - 60, y: G.H - 76 } : rest, on ? { stiffness: 420, damping: 26 } : { stiffness: 260, damping: 16 });
}

function turnPage() {
  if (phase !== 'ready') return;
  phase = 'turning';
  stopCorner();
  cornerBtn.hidden = true;
  flow.next(); // renders the next page into the one beneath, then turns
}

async function turnOver() {
  phase = 'turning';
  cornerBtn.hidden = true;
  stopCorner();
  const page = top;
  if (reduced()) {
    turn.set(null);
    page.classList.add('fade-out');
    await wait(180);
  } else {
    const from = turn.P || turn.corner;
    const to = turn.end;
    const left = (from.x - to.x) / (2 * G.W); // how much of the turn remains
    const arc = Math.min(G.H * 0.13, 120) * clamp(left * 1.2);
    const dur = turnFromDrag ? 150 + 280 * left : 200 + 300 * left;
    await tween(dur, (e) => turn.set({ x: lerp(from.x, to.x, e), y: lerp(from.y, to.y, e) - arc * Math.sin(Math.PI * e) }),
      { easing: turnFromDrag ? ease.out : ease.turn }).done;
  }
  turnFromDrag = false;
  swap();
}

function swap() {
  const old = top;
  top = under;
  top.classList.replace('under', 'top');
  top.inert = false;
  top.removeAttribute('aria-hidden');
  old.remove();
  under = newPage('under');
  turn.setTop(top);
  turn.set(null);
  rest = null;
  buzz(6);
  enterPage(false);
}

// ---------------------------------------------------------------- Input

function choose(side, felt = false) {
  if (phase !== 'card') return;
  phase = 'choosing';
  if (!felt) buzz(8); // a swipe already buzzed when its ring closed
  flow.choose(side);
}

const fresh = (e, since = stepAt) => e.detail === 0 || downAt >= since;

function hintArrows() {
  if (reduced()) return;
  const opts = $('.options', top);
  opts.classList.remove('hint');
  void opts.offsetWidth;
  opts.classList.add('hint');
}

document.addEventListener('pointerdown', () => { downAt = performance.now(); viaKeys = false; }, true);

book.addEventListener('pointerdown', (e) => {
  const opt = e.target.closest('.option');
  if (opt && phase === 'card' && opt.closest('.page') === top) opt.classList.add('pressing');
  if (e.target.closest('#corner')) pressCorner(true);
});
const unpress = () => {
  for (const o of $$('.option.pressing', book)) o.classList.remove('pressing');
  if (phase === 'ready' && $('.pto.pressing', top)) pressCorner(false);
};
addEventListener('pointerup', unpress);
addEventListener('pointercancel', unpress);

book.addEventListener('click', (e) => {
  const opt = e.target.closest('.option');
  if (!opt) return;
  if (phase === 'card' && fresh(e)) choose(opt.dataset.side);
  else if (phase === 'ready' && fresh(e)) hintCorner(); // the choice is made: the corner is the way on
});

cornerBtn.addEventListener('click', (e) => {
  if (phase === 'ready' && fresh(e, readyAt)) turnPage();
});

// Swipes: on a card page they draw the choice; on a finished page they turn it
let mode = null;
let dragFrom = null;
let armed = false;
drag(book, {
  axis: 'x',
  start(e) {
    if (e.target.closest('a') || ['boot', 'turning', 'choosing'].includes(phase)) return false;
    mode = null;
    return true;
  },
  move({ dx, dy }) {
    if (!mode) {
      mode = { card: 'choose', ready: 'turn', writing: 'skip' }[phase] || 'none';
      for (const o of $$('.option.pressing', book)) o.classList.remove('pressing');
      if (mode === 'choose') book.classList.add('dragging');
      if (mode === 'turn') { stopCorner(); dragFrom = turn.P || turn.corner; cornerBtn.hidden = true; $('.pto', top)?.classList.remove('pressing'); }
    }
    if (mode === 'choose') dragChoose(dx);
    else if (mode === 'turn') dragTurn(dx, dy);
  },
  end({ dx, vx, cancelled }) {
    const m = mode;
    mode = null;
    book.classList.remove('dragging');
    if (m === 'choose') releaseChoose(dx, cancelled);
    else if (m === 'turn') releaseTurn(dx, vx, cancelled);
    else if (m === 'skip') writer?.finish();
  },
  tap(e) {
    if (e.target.closest('button, a') || downAt < stepAt) return;
    if (phase === 'writing') writer?.finish();
    else if (phase === 'card') hintArrows();
    else if (phase === 'ready') hintCorner();
  },
});

function dragChoose(dx) {
  if (phase !== 'card') return;
  const side = dx < 0 ? 'left' : 'right';
  const p = clamp(Math.abs(dx) / (CHOOSE_AT * G.W));
  for (const o of $$('.option', top)) {
    const mine = o.dataset.side === side;
    o._anim?.cancel();
    setMarks(o, mine ? p : 0);
    o.classList.toggle('leaning', mine && p > 0.02);
    o.style.setProperty('--lean', `${mine ? clamp(dx * 0.04, -8, 8).toFixed(1) : 0}px`);
  }
  if (p >= 1 && !armed) { armed = true; buzz(10); top.classList.add('armed'); }
  else if (p < 1 && armed) { armed = false; top.classList.remove('armed'); }
}

function releaseChoose(dx, cancelled) {
  const felt = armed;
  armed = false;
  top.classList.remove('armed');
  if (!cancelled && phase === 'card' && Math.abs(dx) >= CHOOSE_AT * G.W) { choose(dx < 0 ? 'left' : 'right', felt); return; }
  for (const o of $$('.option', top)) {
    o.classList.remove('leaning');
    o.style.setProperty('--lean', '0px');
    animateMarks(o, 0, 260, ease.out);
  }
}

function dragTurn(dx, dy) {
  const f = dragFrom;
  if (dx <= 0) {
    const t = clamp(-dx / (1.3 * G.W));
    const arc = Math.min(G.H * 0.13, 120) * Math.sin(Math.PI * t) * 0.8;
    turn.set({ x: f.x + dx * 1.45, y: f.y + dy * 0.25 - arc });
  } else {
    // pushing the other way just lifts the corner: let go past a quarter to turn anyway
    const l = Math.min(54, dx * 0.4);
    turn.set({ x: f.x - l, y: f.y - l * 1.15 });
  }
}

function releaseTurn(dx, vx, cancelled) {
  const P = turn.P || turn.corner;
  const turned = (turn.corner.x - P.x) / (2 * G.W);
  if (!cancelled && phase === 'ready' && (turned > 0.2 || vx < -0.4 || dx > G.W * 0.25)) {
    turnFromDrag = dx < 0;
    turnPage();
  } else {
    foldTo(rest, { stiffness: 260, damping: 17, done: () => { if (phase === 'ready') placeCorner(); } });
  }
}

document.addEventListener('keydown', (e) => {
  viaKeys = true;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const control = e.target.closest?.('button, a');
  const spent = control?.getAttribute('aria-disabled') === 'true';
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    if (phase === 'card') { e.preventDefault(); choose(e.key === 'ArrowLeft' ? 'left' : 'right'); }
    return;
  }
  if ((e.key === 'Enter' || e.key === ' ') && (!control || spent)) {
    e.preventDefault();
    if (e.repeat) return;
    if (phase === 'writing') writer?.finish();
    else if (phase === 'ready') turnPage();
  }
});

function announce(step) {
  if (!step) return;
  const u = life.ui;
  let t = '';
  if (step.type === 'arrival') t = `${life.era}. ${life.title}. ${life.inventor.name}, ${life.inventor.role}. ${life.arrival} ${u.wantPrefix} ${life.inventor.want}`;
  else if (step.type === 'card') t = `${step.card.speaker?.name ? `${step.card.speaker.name}: ` : ''}${step.card.text} ${step.card.left.label} ${step.card.right.label}`;
  else if (step.type === 'reveal') t = `${u.revealKicker} ${life.invention.name}. ${life.invention.description}`;
  else if (step.type === 'epitaph') { const e = flow.epitaph(); t = `${e.name}. ${e.invented} ${e.death} ${e.legacy}`; }
  live.textContent = t;
}

// ---------------------------------------------------------------- Start

function relayout() {
  measure();
  for (const p of [top, under]) if (p?._step) fit(p);
  if (phase === 'ready') { rest = restPoint(); stopCorner(); turn.set(rest); placeCorner(); } else if (phase !== 'turning') turn.set(null);
}

function preload() {
  const urls = new Set([life.bench, life.exhibit, life.inventor.portrait]);
  for (const c of life.cards) if (c.speaker?.portrait) urls.add(c.speaker.portrait);
  const all = (side) => Object.fromEntries(life.cards.map((c) => [c.id, side]));
  for (let i = 0; i < 6; i++) {
    for (const ph of ['before', 'left', 'right']) {
      for (const ch of [all('left'), all('right')]) for (const u of life.picture(i, ph, ch).layers) urls.add(u);
    }
  }
  return Promise.all([...urls].map((u) => new Promise((res) => { const im = new Image(); im.onload = im.onerror = res; im.src = u; })));
}

async function fonts() {
  const loads = [
    '400 20px "Atkinson Hyperlegible Next"', '600 20px "Atkinson Hyperlegible Next"', '800 30px "Atkinson Hyperlegible Next"',
    '600 24px Caveat', '700 24px Caveat',
  ].map((f) => document.fonts.load(f));
  await Promise.race([Promise.all(loads).then(() => document.fonts.ready), wait(3000)]);
}

async function start() {
  try {
    [life] = await Promise.all([loadLife(), fonts()]);
    await Promise.race([preload(), wait(2500)]);
  } catch (err) {
    book.innerHTML = `<div class="page top"><div class="paper"></div><p class="story" style="position:absolute;left:60px;right:18px;top:80px">${esc(err.message)}</p></div>`;
    throw err;
  }
  turn = createTurn(book);
  measure();
  addEventListener('resize', () => { clearTimeout(start.t); start.t = setTimeout(relayout, 80); });
  flow = createFlow(life, render);
  flow.start();
}

// For testing: the state, and a way to hold the fold still for a screenshot
window.__nb = {
  get phase() { return phase; },
  get step() { return flow?.step; },
  fold(p) { stopCorner(); turn.set(p); },
  get G() { return G; },
};

start();
