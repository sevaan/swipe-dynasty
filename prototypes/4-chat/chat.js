// Chat: the life as one conversation. The design note is in index.html.
import { loadLife } from '../shared/life.js';
import { createFlow } from '../shared/flow.js';
import { drag, spring, buzz } from '../shared/drag.js';

const $ = (s, root = document) => root.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const now = () => performance.now();
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const calm = () => motion.matches;

const els = {
  who: $('#who'), hAv: $('#hAv'), hName: $('#hName'), hEra: $('#hEra'),
  log: $('#log'), thread: $('#thread'), jump: $('#jump'), tray: $('#tray'), trayIn: $('#trayIn'),
};

// The pace of the conversation (ms). Brisk: 350 to 600ms a bubble, a typing
// beat plus a short gap, longer sentences typing a little longer.
const PACE = {
  beat: 380, // before a card's first message
  gap: 90, // between a bubble and the next typing dots
  typing: (s) => Math.round(Math.max(260, Math.min(500, 150 + s.length * 4.5))),
  result: 620, // "what happens" types a little longer
  reply: 180, // after the last bubble, before the replies rise
};

// Show the workbench again after an answer when the answer changed what's on it
const RESULT_PICTURES = true;

const ICON = {
  arrow: (side) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${side === 'left' ? 'M19 12H6.5M12 5.5 5.5 12l6.5 6.5' : 'M5 12h12.5M12 5.5l6.5 6.5-6.5 6.5'}" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V6.5M5.5 12 12 5.5l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5c.6 5.2 3.3 7.9 8.5 8.5v1c-5.2.6-7.9 3.3-8.5 8.5h-1c-.6-5.2-3.3-7.9-8.5-8.5v-1c5.2-.6 7.9-3.3 8.5-8.5z" fill="currentColor"/></svg>',
};

const S = {
  mode: 'idle', // 'typing' | 'answers' | 'sending' | 'action' | 'idle'
  seq: null, // the messages arriving now
  readyAt: 0, // when the current controls came alive
  lastDown: -1, // when the latest press began
  keyboard: false, // was the last input a key?
  action: null, // the button that moves on from here
  lastPic: '', // the last workbench picture sent, so a repeat isn't sent twice
  group: null, // the speaker's run of bubbles being written
  pending: null, // the chip being sent
  noClickUntil: 0, // a swipe's release mustn't also count as a tap
  header: '', // who the header shows
  lead: null, // the space above the contact card, on the first screen
  named: null, // the speaker already named on this card
};

let life;
let flow;

// ---- Small builders

const sentences = (t) => (String(t).match(/[^.!?]+(?:[.!?]+["'”’)]*|$)/g) || [t]).map((s) => s.trim()).filter(Boolean);
const avHTML = (src, cls = '') => (src ? `<span class="av ${cls}" aria-hidden="true"><img src="${esc(src)}" alt="" draggable="false"></span>` : '');
const picHTML = (layers, label, cls = '') => `<figure class="pic ${cls}" role="img" aria-label="${esc(label)}">${layers.map((u) => `<img src="${esc(u)}" alt="" draggable="false">`).join('')}</figure>`;
const make = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };

// Run fn after ms, unless the flow has moved on by then
function later(ms, fn) {
  const step = flow.step;
  setTimeout(() => { if (flow.step === step) fn(); }, ms);
}

// ---- Scrolling: keep the newest message in view, unless the player has
// scrolled back to reread something

let pinned = true;
let autoRaf = 0;
const maxScroll = () => Math.max(0, els.log.scrollHeight - els.log.clientHeight);

function toEnd({ instant = false, force = false } = {}) {
  if (force) pinned = true;
  if (!pinned) { updateJump(); return; }
  cancelAnimationFrame(autoRaf);
  autoRaf = 0;
  els.jump.classList.add('hide');
  if (instant || calm()) { els.log.scrollTop = maxScroll(); return; }
  const from = els.log.scrollTop;
  const t0 = now();
  const tick = () => {
    const p = Math.min(1, (now() - t0) / 320);
    els.log.scrollTop = from + (maxScroll() - from) * (1 - (1 - p) ** 3);
    autoRaf = p < 1 ? requestAnimationFrame(tick) : 0;
  };
  autoRaf = requestAnimationFrame(tick);
}

function updateJump() {
  const far = !S.lead && maxScroll() - els.log.scrollTop > 220; // not on the first screen
  els.jump.classList.toggle('hide', !far);
  els.jump.tabIndex = far ? 0 : -1;
}

els.log.addEventListener('scroll', () => {
  if (autoRaf) return; // our own easing toward the newest message
  pinned = maxScroll() - els.log.scrollTop < 48;
  updateJump();
}, { passive: true });
for (const ev of ['touchstart', 'wheel']) {
  els.log.addEventListener(ev, () => { if (autoRaf) { cancelAnimationFrame(autoRaf); autoRaf = 0; } }, { passive: true });
}
els.jump.addEventListener('click', () => toEnd({ force: true }));
new ResizeObserver(() => { if (pinned && !autoRaf) els.log.scrollTop = maxScroll(); }).observe(els.thread);

// ---- The reply tray: pinned over the end of the thread, its height eased
// so the conversation above it moves smoothly

let trayH = 0;
let trayRaf = 0;
function applyTray(h) {
  trayH = h;
  els.tray.style.height = `${h}px`;
  els.thread.style.setProperty('--tray-h', `${h}px`);
  els.jump.style.bottom = `calc(max(${h}px, env(safe-area-inset-bottom)) + 12px)`;
  if (pinned && !autoRaf) els.log.scrollTop = maxScroll();
}
function trayTo(h) {
  cancelAnimationFrame(trayRaf);
  const from = trayH;
  if (calm() || Math.abs(h - from) < 1) { applyTray(h); return; }
  const t0 = now();
  const tick = () => {
    const p = Math.min(1, (now() - t0) / 300);
    applyTray(from + (h - from) * (1 - (1 - p) ** 3));
    if (p < 1) trayRaf = requestAnimationFrame(tick);
  };
  trayRaf = requestAnimationFrame(tick);
}
function trayShow(node, { keep = false } = {}) {
  els.trayIn.replaceChildren(node);
  els.tray.classList.remove('off');
  const natural = els.trayIn.offsetHeight;
  trayTo(keep ? Math.max(natural, trayH) : natural);
}
function trayEmpty() {
  for (const n of [...els.trayIn.children]) {
    n.classList.add('leave');
    setTimeout(() => { if (n.classList.contains('leave')) n.remove(); }, 190);
  }
}
function trayHide() {
  trayEmpty();
  els.tray.classList.add('off');
  trayTo(0);
}

// ---- Messages

function show(node, instant, cls = 'pop') {
  node.classList.add(instant ? 'fade' : cls);
  if (!instant) toEnd();
  return node;
}

// The speaker's current run of bubbles, or a new one with their face and name
function groupFor(speaker) {
  const g0 = S.group;
  if (g0 && g0.isConnected && g0 === els.thread.lastElementChild && g0.dataset.who === speaker.name) return g0;
  // Their name goes over their first run of messages on a card; a run that
  // picks up again after a line of narration doesn't repeat it
  const named = S.named !== speaker.name;
  S.named = speaker.name;
  const g = make('div', named ? 'g in' : 'g in cont');
  g.dataset.who = speaker.name;
  g.innerHTML = `${named ? `<p class="from">${esc(speaker.name)}</p>` : ''}<div class="row">${avHTML(speaker.portrait)}<div class="stack"></div></div>`;
  els.thread.append(g);
  g.querySelector('.from')?.classList.add('pop');
  g.querySelector('.av')?.classList.add('pop');
  S.group = g;
  return g;
}
const stackOf = (speaker) => groupFor(speaker).querySelector('.stack');

function sayPicture(speaker, pic, instant) {
  const stack = stackOf(speaker);
  stack.insertAdjacentHTML('beforeend', picHTML(pic.layers, pic.label, 'b'));
  show(stack.lastElementChild, instant);
}
function sayText(speaker, text, instant) {
  const b = make('div', 'b', text);
  stackOf(speaker).append(b);
  show(b, instant);
}
function narrate(text, instant, cls = '') {
  S.group = null;
  show(els.thread.appendChild(make('p', `narr ${cls}`, text)), instant);
}
function hint(text, instant) {
  S.group = null;
  show(els.thread.appendChild(make('p', 'hint', text)), instant);
}
function scene(pic, instant) {
  els.thread.insertAdjacentHTML('beforeend', picHTML(pic.layers, pic.label, 'scene'));
  show(els.thread.lastElementChild, instant);
}
function typingOn(kind, speaker) {
  const t = make('div', kind === 'in' ? 'b typing' : 'narr typing');
  t.setAttribute('aria-hidden', 'true');
  t.innerHTML = '<i></i><i></i><i></i>';
  if (kind === 'in') stackOf(speaker).append(t);
  else els.thread.append(t);
  return show(t, false);
}

// A run of messages, each after its delay and (optionally) a typing beat.
// flush() delivers the rest at once: a tap on the thread, or Enter.
function run(steps, done) {
  const s = { i: 0, timer: 0, typing: null, over: false };
  const finish = () => { if (s.over) return; s.over = true; if (S.seq === s) S.seq = null; done(); };
  const next = () => {
    if (s.over) return;
    if (s.i >= steps.length) { finish(); return; }
    const st = steps[s.i];
    s.timer = setTimeout(() => {
      if (!st.typing) { st.add(false); s.i++; next(); return; }
      s.typing = typingOn(st.typing, st.speaker);
      s.timer = setTimeout(() => {
        s.typing.remove();
        s.typing = null;
        st.add(false);
        s.i++;
        next();
      }, st.dur);
    }, st.delay || 0);
  };
  s.flush = () => {
    if (s.over) return;
    clearTimeout(s.timer);
    s.typing?.remove();
    s.typing = null;
    while (s.i < steps.length) steps[s.i++].add(true);
    toEnd();
    finish();
  };
  s.cancel = () => {
    s.over = true;
    clearTimeout(s.timer);
    s.typing?.remove();
    s.typing = null;
    if (S.seq === s) S.seq = null;
  };
  S.seq = s;
  next();
  return s;
}

// ---- The header: who you're with, and the era underneath

function setHeader(speaker) {
  const key = speaker ? `s:${speaker.name}` : 'title';
  if (key === S.header) return;
  const firstTime = !S.header;
  S.header = key;
  const apply = () => {
    if (speaker?.portrait) {
      els.hAv.innerHTML = `<img src="${esc(speaker.portrait)}" alt="" draggable="false">`;
      els.hAv.hidden = false;
    } else {
      els.hAv.hidden = true;
      els.hAv.replaceChildren();
    }
    els.hName.textContent = speaker ? speaker.name : life.title;
    els.hEra.textContent = life.era;
  };
  if (firstTime || calm()) { apply(); return; }
  els.who.classList.add('swap');
  setTimeout(() => { apply(); els.who.classList.remove('swap'); }, 150);
}

// ---- Buttons: an instant pressed look, and no stray taps

function press(btn) {
  btn.addEventListener('pointerdown', () => btn.classList.add('pressed'));
  const off = () => btn.classList.remove('pressed');
  for (const ev of ['pointerup', 'pointercancel', 'pointerleave', 'lostpointercapture']) btn.addEventListener(ev, off);
}

// A press that began before this control appeared doesn't count
const fresh = (e) => e.detail === 0 || S.lastDown >= S.readyAt;

function arm(btn, fn) {
  S.mode = 'action';
  S.action = btn;
  S.readyAt = now();
  press(btn);
  btn.addEventListener('click', (e) => {
    if (S.action !== btn || !fresh(e)) return;
    S.action = null;
    S.mode = 'idle';
    fn();
  });
  if (S.keyboard) btn.focus({ preventScroll: true });
}

function goChip(label) {
  const row = make('div', 'crow');
  const b = make('button', 'chip go', label);
  b.type = 'button';
  row.append(b);
  trayShow(row, { keep: true });
  arm(b, () => { trayEmpty(); flow.next(); });
}

// Collapse a spent button out of its card
function collapse(node) {
  if (calm()) { node.remove(); return; }
  const h = node.offsetHeight;
  const mt = getComputedStyle(node).marginTop;
  node.animate([
    { height: `${h}px`, minHeight: `${h}px`, marginTop: mt, paddingTop: '14px', paddingBottom: '14px', opacity: 1, transform: 'none' },
    { height: '0px', minHeight: '0px', marginTop: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0, transform: 'scale(.94)' },
  ], { duration: 280, easing: 'cubic-bezier(.2,.8,.2,1)' }).onfinish = () => node.remove();
}

// ---- The evening's light: the wallpaper cools as the night gets colder,
// and warms once there's a flame. Felt, never read.

const TONE = { dusk: '#201518', cold: '#18161e', fire: '#22160f' };
const theme = document.querySelector('meta[name="theme-color"]');
function light(tone) {
  const c = TONE[tone];
  if (document.documentElement.style.getPropertyValue('--wall') === c) return;
  document.documentElement.style.setProperty('--wall', c);
  theme?.setAttribute('content', c);
}
// Which light a step is in: dusk to begin with, colder on the third card,
// firelit from the first flame (the third card's result) on
function toneFor(step) {
  if (step.type === 'arrival') return 'dusk';
  if (step.type === 'card') return step.index < 2 ? 'dusk' : step.index === 2 ? 'cold' : 'fire';
  if (step.type === 'result') return step.index < 2 ? 'dusk' : 'fire';
  return 'fire';
}

// ---- The steps

function render(step) {
  S.seq?.cancel();
  if (step.type !== 'arrival') light(toneFor(step));
  if (step.type === 'arrival') arrival();
  else if (step.type === 'card') card(step);
  else if (step.type === 'result') result(step);
  else if (step.type === 'reveal') reveal();
  else if (step.type === 'epitaph') epitaph();
}

// The arrival: Aru's contact card opens the thread
function arrival() {
  S.mode = 'idle';
  S.action = null;
  trayHide();
  const build = () => {
    els.thread.classList.remove('leaving');
    els.thread.replaceChildren();
    S.lastPic = '';
    S.group = null;
    light('dusk');
    setHeader(null);
    pinned = false; // the first screen reads from the top
    els.log.scrollTop = 0;
    const lead = make('div', 'lead');
    const c = make('section', 'contact rise');
    c.setAttribute('aria-label', life.inventor.name);
    c.innerHTML = `${avHTML(life.inventor.portrait, 'bust')}
      <h1>${esc(life.inventor.name)}</h1>
      <p class="role">${esc(life.inventor.role)}</p>
      <p class="tag">${esc(life.era)}</p>
      <p class="arrival">${esc(life.arrival)}</p>
      <p class="want"><span>${esc(life.ui.wantPrefix)}</span>${esc(life.inventor.want)}</p>
      <button class="btn" type="button">${esc(life.ui.beginLife)}</button>`;
    els.thread.append(lead, c);
    S.lead = lead;
    centre();
    const btn = c.querySelector('.btn');
    arm(btn, () => { S.lead = null; pinned = true; collapse(btn); flow.next(); });
  };
  if (els.thread.childElementCount && !calm()) {
    els.thread.classList.add('leaving');
    setTimeout(build, 330);
  } else build();
}

// On the first screen the contact card sits in the middle
function centre() {
  const lead = S.lead;
  const card = lead?.nextElementSibling;
  if (!lead?.isConnected || !card) return;
  const cs = getComputedStyle(els.thread);
  const free = els.log.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - card.offsetHeight;
  lead.style.height = `${Math.max(0, Math.floor(free / 2))}px`;
}

// A card: the workbench photo, then the situation a sentence at a time
function card(step) {
  const { card: c, index } = step;
  S.mode = 'typing';
  setHeader(c.speaker);
  const steps = [];
  const pic = life.picture(index, 'before', flow.choices);
  const key = pic.layers.join('|');
  if (key !== S.lastPic) {
    steps.push({ delay: PACE.beat, add: (instant) => { S.lastPic = key; sayPicture(c.speaker, pic, instant); } });
  }
  S.named = null;
  // Each sentence is the speaker's message, except one that talks about them
  // ("Iri blows on it hard..."): that isn't their speech, so it's narration
  const aboutThem = new RegExp(`\\b${c.speaker.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
  for (const text of sentences(c.text)) {
    const delay = steps.length ? PACE.gap : PACE.beat;
    if (aboutThem.test(text)) steps.push({ delay, typing: 'narr', dur: PACE.typing(text), add: (instant) => narrate(text, instant, 'aside') });
    else steps.push({ delay, typing: 'in', speaker: c.speaker, dur: PACE.typing(text), add: (instant) => sayText(c.speaker, text, instant) });
  }
  const help = [life.ui.helperFirst, life.ui.helperSecond][index];
  if (help) steps.push({ delay: 220, add: (instant) => hint(help, instant) });
  run(steps, () => later(PACE.reply, () => answers(step)));
}

// The two replies, pinned at the bottom
function answers(step) {
  const wrap = make('div', 'chips');
  wrap.innerHTML = ['left', 'right'].map((side) => `
    <div class="crow ${side}">
      <span class="cue" aria-hidden="true">${ICON.send}</span>
      <button class="chip" type="button" data-side="${side}" aria-keyshortcuts="${side === 'left' ? 'ArrowLeft' : 'ArrowRight'}">
        <span class="arr" aria-hidden="true">${ICON.arrow(side)}</span><span class="lbl">${esc(step.card[side].label)}</span>
      </button>
    </div>`).join('');
  trayShow(wrap);
  S.mode = 'answers';
  S.action = null;
  S.readyAt = now();
  for (const b of wrap.querySelectorAll('.chip')) {
    press(b);
    b.addEventListener('click', (e) => {
      if (!fresh(e) || (e.detail > 0 && now() < S.noClickUntil)) return;
      choose(b.dataset.side);
    });
  }
  if (step.index === 0) nudge(wrap);
}

function choose(side) {
  if (S.mode !== 'answers') return;
  S.mode = 'sending';
  cancelNudge();
  stopSpring?.();
  S.pending = els.trayIn.querySelector(`.crow.${side} .chip`);
  flow.choose(side);
}

// A result: your bubble goes out, and what happened comes back
function result(step) {
  const { index, side, option } = step;
  const g = make('div', 'g out');
  g.innerHTML = `<div class="stack"><div class="b">${esc(option.label)}</div></div>`;
  els.thread.append(g);
  S.group = null;
  send(S.pending, g.querySelector('.b'), side);
  S.pending = null;
  S.mode = 'typing';
  const steps = [{ delay: 320, typing: 'narr', dur: PACE.result, add: (instant) => narrate(option.result, instant) }];
  const before = life.picture(index, 'before', flow.choices);
  const after = life.picture(index, side, flow.choices);
  if (RESULT_PICTURES && after.layers[1] && after.layers[1] !== before.layers[1]) {
    steps.push({ delay: 200, add: (instant) => { S.lastPic = after.layers.join('|'); scene(after, instant); } });
  }
  run(steps, () => later(160, () => goChip(life.ui.resultContinue)));
}

// The chosen chip lifts out of the tray and lands as your bubble
function send(chip, bubble, side) {
  const tray = els.trayIn.firstElementChild;
  tray?.classList.add('sending');
  tray?.querySelectorAll('.crow').forEach((r) => { if (!r.classList.contains(side)) r.classList.add('drop'); });
  buzz(10);
  if (!chip?.isConnected || calm()) {
    show(bubble, false);
    trayEmpty();
    toEnd({ force: true });
    return;
  }
  const from = chip.getBoundingClientRect();
  const lbl = chip.querySelector('.lbl');
  const range = document.createRange();
  range.selectNodeContents(lbl);
  const text = range.getBoundingClientRect();
  bubble.style.visibility = 'hidden';
  pinned = true;
  const r = bubble.getBoundingClientRect();
  const to = { left: r.left, top: r.top - (maxScroll() - els.log.scrollTop), width: r.width, height: r.height };
  toEnd({ force: true });
  const cs = getComputedStyle(bubble);
  const pl = parseFloat(cs.paddingLeft);
  const pt = parseFloat(cs.paddingTop);
  // The words are set exactly as in the bubble (the same weight as the chip),
  // so they simply travel from the chip into place while the box reshapes
  const ghost = make('div', 'ghost');
  const words = make('span', 'gt', bubble.textContent);
  Object.assign(words.style, { left: `${pl}px`, top: `${pt}px`, width: `${r.width - pl - parseFloat(cs.paddingRight) + 0.5}px` });
  ghost.append(words);
  document.body.append(ghost);
  chip.style.visibility = 'hidden';
  const dur = 400;
  const easing = 'cubic-bezier(.35,.55,.2,1)';
  ghost.animate([
    { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px`, borderRadius: '22px', backgroundColor: getComputedStyle(chip).backgroundColor },
    { left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px`, borderRadius: cs.borderRadius, backgroundColor: cs.backgroundColor },
  ], { duration: dur, easing, fill: 'forwards' });
  words.animate([
    { transform: `translate(${text.left - from.left - pl}px, ${text.top - from.top - pt}px)` },
    { transform: 'none' },
  ], { duration: dur, easing, fill: 'forwards' });
  setTimeout(() => {
    ghost.remove();
    bubble.style.visibility = '';
    bubble.classList.add('land');
    trayEmpty();
  }, dur);
}

// The reveal: a rich card, like a link preview, with its spotlight coming on
function reveal() {
  S.mode = 'typing';
  trayTo(els.trayIn.offsetHeight || trayH); // the Continue chip, still leaving, has the height one chip needs
  const side = flow.choices[life.cards[3].id] || 'left';
  const pic = life.picture(3, side, flow.choices);
  const layers = [life.exhibit, ...pic.layers.slice(1).filter((u) => !/overlays\/(smoke|flames|steam|glint)\.svg/.test(u))];
  run([
    {
      delay: 440,
      add: (instant) => {
        S.group = null;
        const a = make('article', 'reveal');
        a.innerHTML = `<p class="kick">${ICON.spark}${esc(life.ui.revealKicker)}</p>
          ${picHTML(layers, pic.label, instant ? '' : 'on')}
          <div class="rb"><h2>${esc(life.invention.name)}</h2><p class="desc">${esc(life.invention.description)}</p></div>`;
        els.thread.append(a);
        show(a, instant, 'rise');
        if (!instant) buzz(14);
      },
    },
    { delay: 700, add: (instant) => narrate(life.ui.revealFirst, instant, 'first') },
  ], () => later(200, () => goChip(life.ui.revealAction)));
}

// The epitaph: a closing card arrives, and the reply tray slides away
function epitaph() {
  S.mode = 'typing';
  const e = flow.epitaph();
  run([{
    delay: 520,
    add: (instant) => {
      S.group = null;
      trayHide(); // no more replies: the tray slides away as the closing card rises
      const c = make('section', 'epitaph');
      c.setAttribute('aria-label', e.name);
      c.innerHTML = `<span class="memo">${avHTML(life.inventor.portrait, 'bust')}<span class="stone" aria-hidden="true"></span></span>
        <h2>${esc(e.name)}</h2>
        <p class="made">${esc(e.invented)}</p>
        <div class="rule" aria-hidden="true"></div>
        <p class="died">${esc(e.death)}</p>
        <p class="legacy">${esc(e.legacy)}</p>
        <button class="btn" type="button">${esc(life.ui.epitaphAction)}</button>`;
      els.thread.append(c);
      show(c, instant, 'rise');
    },
  }], () => {
    const btn = els.thread.querySelector('.epitaph .btn');
    arm(btn, () => flow.next());
  });
}

// ---- The first card's hint: each chip leans the way it swipes

let nudgeTimers = [];
let nudges = [];
function nudge(wrap) {
  if (calm()) return;
  const lean = (row, dx, at) => setTimeout(() => {
    if (S.mode !== 'answers' || !row.isConnected) return;
    const o = { duration: 620, easing: 'cubic-bezier(.3,.6,.3,1)' };
    nudges.push(row.querySelector('.chip').animate([{ transform: 'none' }, { transform: `translateX(${dx}px)`, offset: 0.4 }, { transform: 'none' }], o));
    nudges.push(row.querySelector('.cue').animate([{ opacity: 0, transform: 'scale(.5)' }, { opacity: 0.9, transform: 'scale(.72)', offset: 0.4 }, { opacity: 0, transform: 'scale(.5)' }], o));
  }, at);
  const [l, r] = wrap.querySelectorAll('.crow');
  nudgeTimers = [lean(l, -20, 700), lean(r, 20, 1250)];
}
function cancelNudge() {
  nudgeTimers.forEach(clearTimeout);
  nudges.forEach((a) => a.cancel());
  nudgeTimers = [];
  nudges = [];
}

// ---- Swiping the reply tray

// A short throw, like swipe-to-reply: about a fifth of the tray (80px on a
// phone), so the armed chip still shows its whole label
const reach = () => Math.max(76, Math.min(88, els.tray.clientWidth * 0.21));
// The label starts 70px in from the screen edge, so the chip never travels more than this
const TRAVEL = 66;
let armedSide = null;
let stopSpring = null;

function rowsOf() {
  const w = els.trayIn.querySelector('.chips');
  if (!w) return null;
  const get = (side) => { const row = w.querySelector(`.crow.${side}`); return { row, chip: row.querySelector('.chip'), cue: row.querySelector('.cue') }; };
  return { left: get('left'), right: get('right') };
}

function dragTo(dx) {
  const r = rowsOf();
  if (!r) return;
  const side = dx < 0 ? 'left' : 'right';
  const other = side === 'left' ? 'right' : 'left';
  const T = reach();
  const a = Math.abs(dx);
  const p = Math.min(1, a / T);
  // The chip follows a little heavily and lifts toward the thread; past the
  // line it stops against a soft rubber band, its label still in view
  const k = 0.75;
  const shown = k * Math.min(a, T) + (a > T ? Math.max(0, TRAVEL - k * T) * (1 - Math.exp(-(a - T) / 40)) : 0);
  r[side].chip.style.transform = `translate(${dx < 0 ? -shown : shown}px, ${-7 * p}px)`;
  r[other].chip.style.transform = '';
  r[side].row.style.opacity = '';
  r[other].row.style.opacity = String(1 - 0.4 * p); // dimmed, still readable
  r[side].cue.style.opacity = String(Math.min(1, p * 1.3));
  r[side].cue.style.transform = `scale(${0.5 + 0.5 * p})`;
  r[other].cue.style.opacity = '0';
  const on = p >= 1 ? side : null;
  if (on !== armedSide) {
    r.left.row.classList.toggle('armed', on === 'left');
    r.right.row.classList.toggle('armed', on === 'right');
    if (on) buzz();
    armedSide = on;
  }
}

function clearDrag() {
  const r = rowsOf();
  armedSide = null;
  if (!r) return;
  for (const k of ['left', 'right']) {
    Object.assign(r[k].chip.style, { transform: '' });
    Object.assign(r[k].row.style, { opacity: '' });
    Object.assign(r[k].cue.style, { opacity: '', transform: '' });
    r[k].row.classList.remove('armed');
  }
}

drag(els.tray, {
  axis: 'x',
  start: () => S.mode === 'answers' && S.lastDown >= S.readyAt,
  move: ({ dx }) => {
    if (S.mode !== 'answers') return;
    stopSpring?.();
    stopSpring = null;
    cancelNudge();
    els.trayIn.querySelectorAll('.pressed').forEach((b) => b.classList.remove('pressed'));
    dragTo(dx);
  },
  end: ({ dx, cancelled }) => {
    S.noClickUntil = now() + 350;
    if (S.mode !== 'answers') return;
    if (!cancelled && Math.abs(dx) >= reach()) { choose(dx < 0 ? 'left' : 'right'); return; }
    stopSpring = spring(dx, 0, dragTo, { stiffness: 420, damping: 41, done: () => { stopSpring = null; clearDrag(); } });
  },
});

// ---- Input: a tap on the thread shows the rest; keys choose and continue

window.addEventListener('pointerdown', () => { S.lastDown = now(); S.keyboard = false; }, true);

let tapAt = null;
els.log.addEventListener('pointerdown', (e) => { tapAt = { x: e.clientX, y: e.clientY, t: now() }; });
els.log.addEventListener('pointercancel', () => { tapAt = null; });
els.log.addEventListener('pointerup', (e) => {
  if (!tapAt) return;
  const still = Math.hypot(e.clientX - tapAt.x, e.clientY - tapAt.y) < 12 && now() - tapAt.t < 600;
  tapAt = null;
  if (still && S.seq) S.seq.flush();
});

document.addEventListener('keydown', (e) => {
  S.keyboard = true;
  if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
  const k = e.key;
  const go = k === 'Enter' || k === ' ';
  const lr = k === 'ArrowLeft' || k === 'ArrowRight';
  if (!go && !lr) return;
  if (S.seq) { e.preventDefault(); S.seq.flush(); return; }
  if (lr) {
    if (S.mode === 'answers') { e.preventDefault(); choose(k === 'ArrowLeft' ? 'left' : 'right'); }
    return;
  }
  const a = document.activeElement;
  const other = a && a !== document.body && a !== S.action && (a.tagName === 'BUTTON' || a.tagName === 'A');
  if (other) return; // a focused answer chip or link handles its own key
  if (S.action) { e.preventDefault(); S.action.click(); }
});

addEventListener('resize', () => {
  centre();
  if (els.trayIn.firstElementChild) {
    const n = els.trayIn.offsetHeight;
    if (Math.abs(n - trayH) > 1 && S.mode === 'answers') applyTray(n);
  }
  toEnd({ instant: true });
});

// ---- Start

function preload() {
  const urls = new Set([life.inventor.portrait, life.exhibit, life.bench]);
  life.cards.forEach((c, i) => {
    urls.add(c.speaker.portrait);
    for (const phase of ['before', 'left', 'right']) life.picture(i, phase, {}).layers.forEach((u) => urls.add(u));
  });
  for (const u of urls) if (u) { const im = new Image(); im.src = u; }
}

try {
  life = await loadLife();
  preload();
  await Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 1500))]);
  flow = createFlow(life, render);
  window.chat = { S, flow, life }; // for testing
  flow.start();
} catch (err) {
  els.thread.append(make('p', 'narr', String(err?.message || err)));
  throw err;
}
