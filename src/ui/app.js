// Browser orchestration for the campaign in content/script.md: load the
// content and the save, draw the current view, turn taps, swipes and keys
// into engine actions (one decision function for all of them), save, then
// animate. The story, its rules and its words live elsewhere: the script,
// src/engine/campaign.js, and content/ui.json.
import { loadContentWeb } from '../content/load-web.js';
import { act, history, newHistory, reconcile, view } from '../engine/campaign.js';
import { bindSwipe } from './input.js';
import { exportText, importText, loadSettings, openSaves, saveSettings } from './storage.js';
import { artURL, glyphHTML, setGlyph } from './art.js';
import { createFx } from './fx.js';

const $ = (id) => document.getElementById(id);
const els = {
  app: $('app'), context: $('context'), inventor: $('inventor'), era: $('era'), problem: $('problem'),
  play: $('play'), stage: $('stage'), card: $('card'), bench: $('bench'), benchArt: $('benchArt'), objectArt: $('objectArt'),
  marks: $('marks'), benchLabel: $('benchLabel'), peek: $('peek'), hand: $('hand'),
  situation: $('situation'), kicker: $('kicker'), speaker: $('speaker'), face: $('face'), speakerName: $('speakerName'), text: $('text'),
  callbacks: $('callbacks'), helper: $('helper'),
  choices: $('choices'), left: $('choiceLeft'), right: $('choiceRight'), next: $('nextBtn'),
  screen: $('screen'), menuBtn: $('menuBtn'), panel: $('panel'), banner: $('banner'), live: $('live'),
};
const params = new URLSearchParams(location.search);
const DEV = params.has('dev');

let content = null; // { campaign, world, ui, ageOf, hash }
let C = null; // the campaign
let U = null; // the interface's words
let state = null;
let cur = null; // view(state) for what's on screen
let checkpoint = null; // the history as it stood at the proposals, for "Another future"
let meta = { endingsSeen: [] }; // outlives a restart
let saves = null;
let revision = 0;
let saving = Promise.resolve();
let conflict = false;
let saveWarned = false;
let settings = loadSettings();
let busy = false;
let fx = null;
let title = true; // the title screen, which isn't part of the save
let oldSave = false;
let shownKey = '';
let shownAt = 0; // when this view appeared: input must start after it
let peekSide = null;
let currentTab = 'history';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const hashOf = (s) => { let h = 2166136261; for (const ch of String(s)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h; };

function banner(text, ms = 5000) {
  els.banner.textContent = text;
  els.banner.hidden = false;
  clearTimeout(banner.t);
  if (ms) banner.t = setTimeout(() => { els.banner.hidden = true; }, ms);
}

// ---- Saving: after every change, one write at a time. A failed save says
// so; a save another tab has overtaken stops rather than overwrite it.

function persist() {
  saving = saving.then(writeSave);
  return saving;
}

async function writeSave() {
  if (conflict || !saves || !state) return;
  let r;
  try { r = await saves.write(state, revision); } catch (e) { r = { ok: false, error: e }; }
  if (r.ok) { revision = r.revision; return; }
  if (r.conflict) {
    conflict = true;
    banner('This history has moved on in another tab or window. Reload this page to carry on from there.', 0);
    return;
  }
  if (!saveWarned) {
    saveWarned = true;
    banner("Couldn't save your progress in this browser. You can keep playing, but it won't be kept.", 8000);
  }
}

const saveRecord = (name, value) => { saving = saving.then(() => saves?.put(name, value)).catch(() => {}); return saving; };

// ---- Looks: each life's era palette, sky and workbench (content/world.json)

function ageFor(v) {
  const id = v?.chapter?.id || (title ? C.shared[0] : state?.route ? C.routes[state.route].chapters[0] : C.shared[C.shared.length - 1]);
  return content.world.ages[content.ageOf[id]];
}

function applySettings() {
  document.documentElement.style.setProperty('--scale', settings.scale);
  document.documentElement.classList.toggle('reduce-motion', !!settings.reduceMotion);
}

function applyTheme(theme = {}) {
  const root = document.documentElement.style;
  for (const key of ['bg', 'panel', 'card', 'ink', 'text', 'accent']) if (theme[key]) root.setProperty(`--${key}`, theme[key]);
}

function applySky(age) {
  const skies = age.sky || [];
  const every = Math.max(1, content.world.tuning?.skyEvery || 3);
  const i = skies.length ? ((state?.lives.length || 0) + Math.floor((state?.cardIndex || 0) / every)) % skies.length : 0;
  const sky = skies[i] || { bg: age.theme.bg };
  document.documentElement.style.setProperty('--sky', sky.bg);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', sky.bg);
  fx?.set(title ? ['sparks'] : sky.fx || [], { reduceMotion: settings.reduceMotion, enabled: settings.effects !== false });
}

// ---- Portraits: a drawn one where it exists (world.json "portraits"),
// otherwise a deliberate silhouette in a colour of its own (spec 16)

const TONES = ['#7d5a46', '#5f7556', '#566a86', '#86693d', '#735673', '#4f8079', '#8f6356', '#63668a', '#7a7250', '#5a7d8f'];

function silhouette(key) {
  const h = hashOf(key);
  const bg = TONES[h % TONES.length];
  const variant = (h >> 4) % 3; // three head-and-shoulder shapes, so people differ at a glance
  const hair = ['<path d="M11 12c1-5 4-8 9-8s8 3 9 8c-2-2-5-3-9-3s-7 1-9 3z"/>', '<path d="M10 14c0-6 4-10 10-10s10 4 10 10l-2 2c0-5-3-8-8-8s-8 3-8 8z"/>', '<circle cx="20" cy="6" r="4"/>'][variant];
  return `<svg class="silhouette" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" fill="${bg}"/><g fill="rgb(0 0 0 / 34%)"><circle cx="20" cy="16" r="8"/>${hair}<path d="M5 40c1-9 7-14 15-14s14 5 15 14z"/></g></svg>`;
}

function drawnPortrait(key) {
  return content.world.portraits?.[key] || null;
}

// The small round face beside a speaker's name
function faceHTML(person) {
  if (!person) return '';
  // The Archive: an open book
  if (person.id === C.archive.id) return '<svg class="silhouette" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" fill="var(--panel)"/><path d="M20 13c-3-2-7-3-11-3v17c4 0 8 1 11 3z" fill="var(--accent)"/><path d="M20 13c3-2 7-3 11-3v17c-4 0-8 1-11 3z" fill="var(--text)" opacity=".85"/></svg>';
  const drawn = drawnPortrait(person.key);
  return drawn ? `<img class="art" src="${esc(artURL('characters', drawn))}" alt="" draggable="false" data-key="${esc(person.key)}">` : silhouette(person.key);
}

// A larger portrait, for a life's arrival and the proposals
function portraitHTML(key, cls = '') {
  const drawn = drawnPortrait(key);
  return `<div class="portrait ${cls}" aria-hidden="true">${drawn ? `<img class="art" src="${esc(artURL('characters', drawn))}" alt="" draggable="false" data-key="${esc(key)}">` : silhouette(key)}</div>`;
}

// The inventor's own cast entry, if they have one; otherwise a key of their own
function inventorKey(chapterId) {
  const c = C.chapters[chapterId];
  const first = c.inventor.name.split(' ')[0].toLowerCase();
  const id = c.castOrder.find((k) => c.cast[k].name.toLowerCase() === c.inventor.name.toLowerCase() || c.cast[k].name.toLowerCase() === first);
  return `${chapterId}:${id || 'inventor'}`;
}

// ---- The workbench: the era's bench, and the state's drawing if there is
// one; otherwise the state's description as an exhibit label

const setSrc = (img, url) => { if (img.getAttribute('src') !== url) img.setAttribute('src', url); };

function lookFor(chapterId, index, phase) {
  const st = content.world.art?.[chapterId]?.[index];
  if (!st) return null;
  let look = phase === 'before' ? st : st[phase] ?? st;
  if (typeof look === 'string') look = { object: look };
  let object = look.object;
  if (object && typeof object === 'object') object = object[state.choices[object.from]] || object.left;
  return object ? { object, marks: look.marks || [] } : null;
}

function drawBench(benchId, look, label) {
  setSrc(els.benchArt, artURL('benches', benchId));
  els.benchLabel.textContent = label || '';
  if (look) {
    els.objectArt.hidden = false;
    setSrc(els.objectArt, artURL('objects', look.object));
    els.benchLabel.hidden = true;
  } else {
    els.objectArt.hidden = true;
    els.objectArt.removeAttribute('src');
    els.benchLabel.hidden = !label;
  }
  const marks = look?.marks || [];
  const have = [...els.marks.children].map((img) => img.dataset.mark);
  if (have.join() !== marks.join()) {
    els.marks.innerHTML = marks.map((m) => `<img class="art" data-mark="${esc(m)}" src="${esc(artURL('overlays', m))}" alt="" draggable="false">`).join('');
  }
}

// An exhibit: the plinth with the object as it ended up, or its label
function exhibitHTML(chapterId, index, phase, label) {
  const look = lookFor(chapterId, index, phase);
  const marks = (look?.marks || []).filter((m) => !['smoke', 'flames', 'steam', 'glint'].includes(m));
  return `<div class="exhibit" aria-hidden="true">
    <img class="art" src="${esc(artURL('benches', 'exhibit'))}" alt="">
    ${look ? `<img class="art" src="${esc(artURL('objects', look.object))}" alt="" data-label="${esc(label)}">` : `<div class="label-card">${esc(label)}</div>`}
    ${marks.map((m) => `<img class="art" src="${esc(artURL('overlays', m))}" alt="">`).join('')}
  </div>`;
}

// ---- The play view: the situation, and the card with its two answers

function setHeader(v) {
  const who = els.context.querySelector('.who');
  who.style.visibility = '';
  if (v.chapter) {
    els.inventor.textContent = v.chapter.inventor.name;
    els.era.textContent = v.chapter.era;
    els.problem.textContent = `${U.wantPrefix} ${v.chapter.inventor.want}`;
  } else {
    els.inventor.textContent = C.archive.name;
    els.era.textContent = '';
    els.problem.textContent = U.offerHelp;
  }
  els.context.querySelector('.sep').hidden = !els.era.textContent;
}

function setSpeaker(person) {
  els.speaker.classList.toggle('has', !!person);
  els.speakerName.textContent = person?.name || '';
  els.face.innerHTML = faceHTML(person);
}

const answerHTML = (label) => `<span class="label">${esc(label)}</span>`;

function renderPlay(v) {
  els.app.classList.remove('between');
  els.play.hidden = false;
  els.screen.hidden = true;
  els.context.hidden = false;
  setHeader(v);
  const age = ageFor(v);
  const deciding = v.view === 'choice' || v.view === 'proposal' || v.view === 'redirect';
  els.choices.hidden = !deciding;
  els.next.hidden = deciding;
  els.card.classList.toggle('deciding', deciding);
  els.kicker.textContent = '';
  els.kicker.className = 'kicker';
  els.callbacks.innerHTML = '';
  els.helper.textContent = '';
  let live = [];

  if (v.view === 'choice') {
    setSpeaker(v.card.speaker);
    els.text.textContent = v.card.text;
    els.left.innerHTML = answerHTML(v.card.left.label);
    els.right.innerHTML = answerHTML(v.card.right.label);
    els.left.setAttribute('aria-label', `Left: ${v.card.left.label}`);
    els.right.setAttribute('aria-label', `Right: ${v.card.right.label}`);
    if (v.first === 1) els.helper.textContent = U.helperFirst;
    if (v.first === 2) els.helper.textContent = U.helperSecond;
    drawBench(age.bench, lookFor(v.chapter.id, v.bench.index, 'before'), v.bench.text);
    live = [v.card.speaker?.name ? `${v.card.speaker.name}:` : '', v.card.text, `Left: ${v.card.left.label}.`, `Right: ${v.card.right.label}.`, els.helper.textContent];
  } else if (v.view === 'result' && v.offer) {
    setSpeaker(speakerArchive());
    els.text.textContent = v.offer.accepted ? U.offerAccepted : U.offerDeferred;
    els.next.textContent = U.resultContinue;
    live = [els.text.textContent];
  } else if (v.view === 'result') {
    setSpeaker(null);
    els.kicker.textContent = v.result.label;
    els.kicker.className = `kicker chosen ${v.result.side}`;
    els.text.textContent = v.result.text;
    els.callbacks.innerHTML = v.result.callbacks.map((t) => `<p class="callback">${esc(t)}</p>`).join('');
    els.next.textContent = U.resultContinue;
    if (v.bench) drawBench(age.bench, lookFor(v.chapter.id, v.bench.index, v.result.side), v.bench.text);
    live = [v.result.label, v.result.text, ...v.result.callbacks];
  } else if (v.view === 'proposal') {
    const p = v.proposal;
    setSpeaker(speakerArchive());
    const lead = p.first ? `<span class="lead">${esc(U.archiveTransition)}</span>` : '';
    if (p.double) {
      els.text.innerHTML = `${lead}<span class="offer-heading">${esc(U.offerDoubleHeading)}</span>${p.routes.map((r) => `<span class="offer"><b>${esc(r.title)}</b> ${esc(r.pitch)}</span>`).join('')}`;
      els.left.innerHTML = answerHTML(p.routes[0].acceptLabel);
      els.right.innerHTML = answerHTML(p.routes[1].acceptLabel);
    } else {
      const r = p.routes[0];
      els.text.innerHTML = `${lead}<span class="offer"><b>${esc(r.title)}</b> ${esc(r.pitch)}</span><span class="question">${esc(U.offerQuestion)}</span>`;
      els.left.innerHTML = answerHTML(r.acceptLabel);
      els.right.innerHTML = answerHTML(U.offerDefer);
    }
    els.left.setAttribute('aria-label', `Left: ${els.left.textContent}`);
    els.right.setAttribute('aria-label', `Right: ${els.right.textContent}`);
    drawProposalBench(p);
    live = [els.text.textContent, `Left: ${els.left.textContent}.`, `Right: ${els.right.textContent}.`];
  } else if (v.view === 'redirect') {
    setSpeaker(v.card.speaker);
    els.text.textContent = v.card.text;
    els.left.innerHTML = answerHTML(v.card.left.label);
    els.right.innerHTML = answerHTML(v.card.right.label);
    els.left.setAttribute('aria-label', `Left: ${v.card.left.label}`);
    els.right.setAttribute('aria-label', `Right: ${v.card.right.label}`);
    drawBench(age.bench, null, C.redirect.title);
    live = [v.card.text, `Left: ${v.card.left.label}.`, `Right: ${v.card.right.label}.`];
  }
  if (v.view === 'result' && !v.result && !v.offer) els.next.textContent = U.resultContinue;

  // The first card of the first life shows how to swipe
  const hint = v.view === 'choice' && v.first === 1;
  els.hand.classList.toggle('show', hint);
  els.card.classList.toggle('wiggle', hint);

  const key = `${v.view}:${v.turn}`;
  if (key !== shownKey) {
    shownKey = key;
    shownAt = performance.now();
    els.situation.scrollTop = 0;
    els.live.textContent = live.filter(Boolean).join(' ');
  }
  els.left.classList.remove('pressed');
  els.right.classList.remove('pressed');
  peekSide = null;
  preview(null);
  fitCard();
}

const speakerArchive = () => ({ id: C.archive.id, name: C.archive.name, key: C.archive.id });

// The proposal card: each candidate's first inventor, on that route's bench
function drawProposalBench(p) {
  const first = p.routes[0];
  const age = content.world.ages[content.ageOf[first.chapter]];
  drawBench(age.bench, null, '');
  els.benchLabel.hidden = false;
  els.benchLabel.innerHTML = p.routes.map((r) => `<span class="candidate">${portraitHTML(r.inventor.key, 'small')}<span>${esc(r.inventor.name)}<br><small>${esc(r.inventor.role)}</small></span></span>`).join('');
}

// ---- The picture's height: what the words and the answers leave, up to
// square, never under 2:1 unless the words would get less than 140px

function fitCard() {
  if (els.play.hidden || !els.play.clientHeight) return;
  const gap = parseFloat(getComputedStyle(els.play).rowGap) || 0;
  els.situation.style.maxHeight = '';
  const width = els.card.clientWidth;
  const foot = els.choices.hidden ? els.next.offsetHeight : els.choices.offsetHeight;
  const room = els.play.clientHeight - gap - foot;
  const least = Math.max(90, Math.min(width / 2, room - 140));
  let picture = Math.min(width, room - els.situation.scrollHeight);
  if (picture < least) {
    picture = least;
    els.situation.style.maxHeight = `${Math.max(48, room - picture)}px`;
  }
  els.bench.style.height = `${Math.floor(picture)}px`;
}

// Showing an answer never changes anything. `armed`: letting go would choose it.
function preview(side, strength = 1, armed = false) {
  els.left.classList.toggle('hot', side === 'left');
  els.right.classList.toggle('hot', side === 'right');
  if (!side || els.choices.hidden) {
    els.peek.style.opacity = 0;
    els.peek.classList.remove('armed');
    peekSide = null;
    return;
  }
  if (peekSide !== side) {
    peekSide = side;
    const label = (side === 'left' ? els.left : els.right).textContent;
    const arrow = glyphHTML('ui', side === 'left' ? 'arrow-left' : 'arrow-right');
    els.peek.className = `peek ${side}`;
    els.peek.innerHTML = `<p class="label">${side === 'left' ? arrow : ''}<span>${esc(label)}</span>${side === 'right' ? arrow : ''}</p>`;
  }
  els.peek.classList.toggle('armed', armed);
  els.peek.style.opacity = Math.max(0, Math.min(1, strength));
}

function setCardTransform(dx) {
  const rot = Math.max(-7, Math.min(7, dx / 26));
  els.card.style.transform = `translateX(${dx * 0.75}px) rotate(${rot}deg)`;
}

function springBack() {
  els.card.style.transition = 'transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1.2)';
  els.card.style.transform = '';
  preview(null);
}

function flingCard(side) {
  if (settings.reduceMotion) return Promise.resolve();
  const dir = side === 'left' ? -1 : 1;
  els.card.style.transition = 'transform 240ms cubic-bezier(0.5, 0, 0.9, 0.6), opacity 240ms linear';
  els.card.style.transform = `translateX(${dir * 130}%) rotate(${dir * 16}deg)`;
  els.card.style.opacity = '0';
  return pause(240);
}

function resetCard() {
  els.card.style.transition = 'none';
  els.card.style.transform = '';
  els.card.style.opacity = '';
  void els.card.offsetWidth;
}

function enterCard() {
  if (settings.reduceMotion) return;
  els.card.classList.remove('enter');
  void els.card.offsetWidth;
  els.card.classList.add('enter');
}

function nudge() {
  if (busy || els.choices.hidden) return;
  els.card.classList.remove('nudge');
  void els.card.offsetWidth;
  els.card.classList.add('nudge');
  els.hand.classList.add('once');
  clearTimeout(nudge.t);
  nudge.t = setTimeout(() => els.hand.classList.remove('once'), 1900);
}

// ---- Screens: the title, framing, a life's arrival, the reveal, the
// epitaph, the endings and the credits

const button = (label, act, primary = true) => `<button class="btn-screen${primary ? '' : ' quiet'}" type="button" data-screen="${esc(act)}">${esc(label)}</button>`;

function screenHTML(v) {
  if (title) {
    const has = state && !(state.view === 'intro' && state.turn === 0);
    const main = oldSave && !has
      ? `<p class="scene">${esc(U.oldSave)}</p>${button(U.oldSaveAction, 'begin')}`
      : has ? button(U.continue, 'continue-history') : button(U.begin, 'begin');
    return `<div class="screen-in title-screen">
      <h1 class="game-title">${esc(U.title)}</h1>
      <p class="tagline">${esc(U.tagline)}</p>
      <div class="screen-actions">${main}${button(U.history, 'history', false)}${button(U.settings, 'settings', false)}</div>
    </div>`;
  }
  switch (v.view) {
    case 'intro':
      return `<div class="screen-in"><p class="statement">${esc(U.framing)}</p><div class="screen-actions">${button(U.continue, 'continue')}</div></div>`;
    case 'arrival': {
      const c = v.chapter;
      return `<div class="screen-in arrival">
        ${portraitHTML(inventorKey(c.id), 'large')}
        <p class="name">${esc(c.inventor.name)}</p>
        <p class="role">${esc(c.inventor.role)}</p>
        <p class="kicker">${esc(c.era)}</p>
        <p class="scene">${esc(c.arrival)}</p>
        <p class="want"><span>${esc(U.wantPrefix)}</span> ${esc(c.inventor.want)}</p>
        <div class="screen-actions">${button(U.beginLife, 'continue')}</div>
      </div>`;
    }
    case 'reveal': {
      const c = v.chapter;
      return `<div class="screen-in reveal">
        <p class="kicker">${esc(U.revealKicker)}</p>
        ${exhibitHTML(c.id, 3, state.choices[`${c.id}.4`], C.chapters[c.id].bench[3])}
        <p class="big">${esc(c.invention.name)}</p>
        <p class="scene">${esc(c.invention.description)}</p>
        ${v.first ? `<p class="first">${esc(U.revealFirst)}</p>` : ''}
        <div class="screen-actions">${button(U.revealAction, 'continue')}</div>
      </div>`;
    }
    case 'epitaph': {
      const e = v.epitaph;
      const c = v.chapter;
      return `<div class="screen-in epitaph">
        ${exhibitHTML(c.id, 5, state.legacies[c.id], C.chapters[c.id].bench[5])}
        <div class="placard">
          <p class="name">${esc(e.name)}</p>
          <p class="made">${esc(inventedLine(e.invention))}</p>
          <p class="ended">${esc(e.death)}</p>
          <p class="legacy">${esc(e.legacy)}</p>
        </div>
        <div class="screen-actions">${button(U.epitaphAction, 'continue')}</div>
      </div>`;
    }
    case 'ending': {
      const e = v.ending;
      return `<div class="screen-in ending">
        <p class="statement">${esc(e.text)}</p>
        <p class="dots" aria-hidden="true">${Array.from({ length: e.count }, (_, i) => `<span class="${i === e.index ? 'on' : ''}"></span>`).join('')}</p>
        <div class="screen-actions">${button(U.continue, 'continue')}</div>
      </div>`;
    }
    case 'credits':
      return `<div class="screen-in credits">
        ${U.credits.map((line, i) => `<p class="${i ? 'scene' : 'big'}">${esc(line)}</p>`).join('')}
        <div class="screen-actions">${checkpoint ? button(U.anotherFuture, 'another-future') : ''}${button(U.startOver, 'start-over', !checkpoint)}${button(U.history, 'history', false)}</div>
      </div>`;
    default:
      return '';
  }
}

// "Invented {invention}.", reading naturally mid-sentence: "Invented a
// repeatable spark hearth." A name written as a proper title keeps its capitals.
function inventedLine(name) {
  const words = name.split(' ');
  let text = name;
  if (/^(A|An|The)$/.test(words[0])) text = [words[0].toLowerCase(), ...words.slice(1)].join(' '); // "a repeatable…", "the Quiet Room"
  else if (!words.slice(1).some((w) => /^[A-Z]/.test(w))) text = name[0].toLowerCase() + name.slice(1); // "fired vessels"
  return U.epitaphInvented.replace('{invention}', text);
}

function renderScreen(v) {
  els.app.classList.add('between');
  els.play.hidden = true;
  els.hand.classList.remove('show');
  els.context.hidden = title;
  if (!title && v.chapter) setHeader(v);
  els.context.querySelector('.who').style.visibility = 'hidden';
  els.screen.innerHTML = screenHTML(v);
  els.screen.hidden = false;
  const key = title ? `title:${oldSave}` : `${v.view}:${v.turn}:${v.ending?.index ?? ''}`;
  if (key !== shownKey) {
    shownKey = key;
    shownAt = performance.now();
    els.screen.scrollTop = 0;
    els.live.textContent = els.screen.innerText.replace(/\s+/g, ' ');
    if (!title) requestAnimationFrame(() => els.screen.querySelector('.btn-screen')?.focus({ preventScroll: true }));
  }
}

function render() {
  const v = title ? null : (cur = view(state, C));
  const age = ageFor(v);
  applyTheme(age.theme);
  applySky(age);
  if (!title && ['choice', 'result', 'proposal', 'redirect'].includes(v.view)) renderPlay(v);
  else renderScreen(v);
  quietText();
  if (DEV) renderDevButton();
}

// Tells the weather where the words are, so it thins out behind them
function quietText() {
  if (!fx) return;
  const boxes = [];
  const add = (el, x = 8, y = 4) => {
    if (!el?.offsetParent) return;
    const r = el.getBoundingClientRect();
    if (r.width) boxes.push({ left: r.left - x, top: r.top - y, right: r.right + x, bottom: r.bottom + y });
  };
  add(els.context.querySelector('.who'));
  if (!els.play.hidden) add(els.situation, 8, 6);
  if (!els.screen.hidden) for (const el of els.screen.querySelectorAll('.game-title, .tagline, .statement, .big, .scene, .name, .role, .kicker, .want, .first')) add(el, 12, 6);
  fx.setQuiet(boxes);
}

// ---- Actions

function run(action) {
  const res = act(state, C, { ...action, turn: state.turn });
  if (res.events.some((e) => e.type === 'rejected')) return null;
  state = res.state;
  if (res.checkpoint) { checkpoint = res.checkpoint; saveRecord('checkpoint', checkpoint); }
  for (const e of res.events) {
    if (e.type === 'ending-seen' && !meta.endingsSeen.includes(e.route)) {
      meta.endingsSeen.push(e.route);
      saveRecord('meta', meta);
    }
  }
  return res;
}

// A decision: the card flies toward the answer, then the result arrives
async function choose(side) {
  if (busy || conflict || title || !cur) return;
  const type = cur.view === 'choice' ? 'choose' : cur.view === 'proposal' ? 'offer' : cur.view === 'redirect' ? 'redirect' : null;
  if (!type) return;
  busy = true;
  const res = run({ type, side, card: cur.card?.id });
  if (!res) { busy = false; springBack(); return; }
  const saved = persist();
  els.card.classList.remove('wiggle', 'nudge');
  els.hand.classList.remove('show', 'once');
  preview(side, 1, true);
  (side === 'left' ? els.left : els.right).classList.add('pressed');
  await flingCard(side);
  resetCard();
  render();
  enterCard();
  await saved;
  busy = false;
}

async function proceed() {
  if (busy || conflict || title || performance.now() - shownAt < 200) return;
  if (!cur || ['choice', 'proposal', 'redirect', 'credits'].includes(cur.view)) return;
  busy = true;
  const wasPlay = !els.play.hidden;
  const res = run({ type: 'continue' });
  if (res) {
    await persist();
    render();
    if (wasPlay && !els.play.hidden) enterCard();
  }
  busy = false;
}

async function startHistory() {
  state = newHistory(C);
  checkpoint = null;
  saveRecord('checkpoint', null);
  title = false;
  await persist();
  render();
}

async function onScreenClick(e) {
  const b = e.target.closest('[data-screen]');
  if (!b || busy || performance.now() - shownAt < 200) return;
  const what = b.dataset.screen;
  if (what === 'begin') {
    if (state && !(state.view === 'intro' && state.turn === 0)) { title = false; render(); return; }
    await startHistory();
  } else if (what === 'continue-history') {
    title = false;
    render();
  } else if (what === 'continue') {
    proceed();
  } else if (what === 'history') {
    openPanel('history');
  } else if (what === 'settings') {
    openPanel('settings');
  } else if (what === 'another-future') {
    if (!checkpoint) return;
    busy = true;
    const res = run({ type: 'another-future', checkpoint });
    if (res) { await persist(); render(); }
    busy = false;
  } else if (what === 'start-over') {
    await startHistory();
  }
}

// ---- The menu panel: Your history, Settings (and Dev)

function historyHTML() {
  const lives = state ? history(state, C) : [];
  const endings = meta.endingsSeen.map((r) => C.routes[r]).filter(Boolean);
  if (!lives.length) return `<p class="summary">${esc(U.museumEmpty)}</p>${endingsHTML(endings)}`;
  return lives.map((l) => {
    const age = content.world.ages[content.ageOf[l.chapter]];
    const done = l.status !== 'living';
    const status = l.status === 'continues' ? U.museumContinues : l.status === 'living' ? '' : l.death;
    return `<details class="item life">
      <summary>
        <div class="pic">${exhibitThumb(l.chapter, age)}</div>
        <div class="about"><p class="title">${esc(l.invention.name)}</p><p class="by">${esc(l.inventor)}, ${esc(l.role.charAt(0).toLowerCase() + l.role.slice(1))} · ${esc(l.era)}</p></div>
      </summary>
      <p class="body">${esc(l.invention.description)}</p>
      ${l.legacy ? `<p class="body">${esc(l.legacy)}</p>` : ''}
      ${status ? `<p class="link">${esc(status)}</p>` : ''}
      ${done || l.choices.length ? `<ol class="chosen">${l.choices.map((c) => `<li><span>${esc(c.kind)}</span> ${esc(c.label)}</li>`).join('')}</ol>` : ''}
    </details>`;
  }).join('') + endingsHTML(endings);
}

function endingsHTML(endings) {
  if (!endings.length) return '';
  return `<h3>Endings seen</h3>${endings.map((r) => `<div class="item"><p class="title">${esc(r.ending.title)}</p></div>`).join('')}`;
}

function exhibitThumb(chapterId, age) {
  const look = lookFor(chapterId, 5, state.legacies[chapterId] || 'left') || lookFor(chapterId, 3, state.choices[`${chapterId}.4`] || 'left');
  return `<img class="art" src="${esc(artURL('benches', look ? 'exhibit' : age.bench))}" alt="">${look ? `<img class="art" src="${esc(artURL('objects', look.object))}" alt="">` : ''}`;
}

function buildStamp() {
  const d = new Date(document.lastModified);
  return Number.isNaN(d.getTime()) ? 'unknown' : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function settingsHTML() {
  const sizes = [[0.9, 'S'], [1, 'M'], [1.15, 'L'], [1.3, 'XL']];
  return `
    <div class="row"><span>${esc(U.textSize)}</span><span class="seg">${sizes.map(([s, l]) => `<button type="button" data-scale="${s}" aria-pressed="${settings.scale === s}">${l}</button>`).join('')}</span></div>
    <div class="row"><span>${esc(U.reduceMotion)}</span><span class="seg"><button type="button" data-motion="off" aria-pressed="${!settings.reduceMotion}">Off</button><button type="button" data-motion="on" aria-pressed="${!!settings.reduceMotion}">On</button></span></div>
    <div class="row"><span>Weather effects</span><span class="seg"><button type="button" data-effects="off" aria-pressed="${settings.effects === false}">Off</button><button type="button" data-effects="on" aria-pressed="${settings.effects !== false}">On</button></span></div>
    <h3>${esc(U.restart)}</h3>
    <div id="restartBox"><button class="btn danger" type="button" data-act="restart">${esc(U.restart)}</button></div>
    <h3>Your save</h3>
    <p class="fine">Your history is saved in this browser after every choice. It isn't synced to other devices or backed up. To move it, copy it here and paste it there.</p>
    <div class="dev-actions"><button class="btn" type="button" data-act="copy">Copy save</button><button class="btn" type="button" data-act="load">Load pasted save</button></div>
    <textarea class="save-box" id="saveBox" placeholder="Paste a save here, then tap Load pasted save" spellcheck="false"></textarea>
    <h3>About</h3>
    <p class="fine">One Bright Idea · build ${esc(buildStamp())} · script ${esc(C.hash)} · saves in ${esc(saves?.kind || 'nowhere')}<br>
    ${DEV ? '<a href="./">Leave dev mode</a>' : '<a href="?dev">Dev mode</a>'} · <a href="tools/script.html">Script</a> · <a href="tools/art.html">Art</a> · <a href="tools/fx.html">Weather</a></p>`;
}

function devHTML() {
  const options = C.chapterOrder.map((id) => `<option value="${esc(id)}">${esc(id)} ${esc(C.chapters[id].title)}</option>`).join('');
  const dump = state ? { view: state.view, chapter: state.chapterId, card: state.cardIndex + 1, exposure: state.lifeExposure, affinity: state.affinity, route: state.route, proposalOrder: state.proposalOrder, lives: state.lives.length, revision, endingsSeen: meta.endingsSeen } : {};
  return `
    <p class="fine">Jumps bend the rules on purpose: they start the chosen life with every earlier life's choices left as they were.</p>
    <div class="dev-actions"><select id="devChapter">${options}</select><button class="btn" type="button" data-dev="jump">Jump to this life</button></div>
    <div class="dev-actions"><button class="btn" type="button" data-dev="proposals">Play left to the proposals</button></div>
    <div class="dev">${esc(JSON.stringify(dump, null, 1))}</div>`;
}

function openPanel(tab = currentTab) {
  const tabs = [['history', U.history], ['settings', U.settings]];
  if (DEV) tabs.push(['dev', 'Dev']);
  if (!tabs.some((t) => t[0] === tab)) tab = 'history';
  currentTab = tab;
  const wasOpen = !els.panel.hidden;
  const body = { history: historyHTML, settings: settingsHTML, dev: devHTML }[tab]();
  els.panel.innerHTML = `
    <div class="panel-head"><h2>${esc(tabs.find((t) => t[0] === tab)[1])}</h2><button class="close-btn" type="button" data-act="close" aria-label="Close">${glyphHTML('ui', 'close')}</button></div>
    <div class="tabs" role="tablist" style="grid-template-columns: repeat(${tabs.length}, 1fr)">${tabs.map(([id, label]) => `<button type="button" role="tab" data-tab="${id}" aria-selected="${id === tab}">${esc(label)}</button>`).join('')}</div>
    <div class="panel-body">${body}</div>`;
  els.panel.hidden = false;
  if (!wasOpen) els.panel.querySelector('.close-btn').focus();
  else els.panel.querySelector(`[data-tab="${tab}"]`)?.focus();
}

function closePanel() {
  els.panel.hidden = true;
  (title ? els.screen.querySelector('.btn-screen') : els.menuBtn)?.focus();
}

async function onPanelClick(e) {
  const t = e.target.closest('button');
  if (!t) return;
  if (t.dataset.tab) { openPanel(t.dataset.tab); return; }
  if (t.dataset.act === 'close') { closePanel(); return; }
  if (t.dataset.scale) { settings.scale = Number(t.dataset.scale); saveSettings(settings); applySettings(); render(); openPanel('settings'); return; }
  if (t.dataset.effects) { settings.effects = t.dataset.effects === 'on'; saveSettings(settings); render(); openPanel('settings'); return; }
  if (t.dataset.motion) { settings.reduceMotion = t.dataset.motion === 'on'; saveSettings(settings); applySettings(); render(); openPanel('settings'); return; }
  if (t.dataset.act === 'restart') {
    // The confirmation uses the script's own words
    $('restartBox').innerHTML = `<p class="fine">${esc(U.restartConfirm)}</p><div class="dev-actions"><button class="btn" type="button" data-act="restart-keep">${esc(U.restartKeep)}</button><button class="btn danger" type="button" data-act="restart-go">${esc(U.restartGo)}</button></div>`;
    return;
  }
  if (t.dataset.act === 'restart-keep') { openPanel('settings'); return; }
  if (t.dataset.act === 'restart-go') { closePanel(); await startHistory(); return; }
  if (t.dataset.act === 'copy') {
    const text = exportText({ state, checkpoint, meta });
    const box = $('saveBox');
    box.value = text;
    try { await navigator.clipboard.writeText(text); banner('Save copied.'); } catch { box.select(); banner('Select the text and copy it.'); }
    return;
  }
  if (t.dataset.act === 'load') {
    const parsed = importText($('saveBox').value);
    if (parsed.error) { banner(parsed.error); return; }
    const { state: s, problem } = reconcile(parsed.state, C);
    if (!s) { banner(problem || "That save doesn't fit this script."); return; }
    state = s;
    checkpoint = parsed.checkpoint;
    if (parsed.meta?.endingsSeen) meta = { endingsSeen: [...new Set([...meta.endingsSeen, ...parsed.meta.endingsSeen])] };
    saveRecord('checkpoint', checkpoint);
    saveRecord('meta', meta);
    await persist();
    closePanel();
    title = false;
    render();
    banner('Save loaded.');
    return;
  }
  if (t.dataset.dev === 'jump') {
    const id = $('devChapter').value;
    const c = C.chapters[id];
    Object.assign(state, { chapterId: id, cardIndex: 0, view: 'arrival', lifeExposure: 0, pendingResultCard: null, route: c.route, endingPanelIndex: 0, turn: state.turn + 1 });
    await persist();
    closePanel();
    title = false;
    render();
    return;
  }
  if (t.dataset.dev === 'proposals') {
    closePanel();
    title = false;
    for (let i = 0; i < 400 && state.view !== 'proposal'; i++) {
      const v = view(state, C);
      if (v.view === 'choice') run({ type: 'choose', card: v.card.id, side: 'left' });
      else if (v.view === 'credits') break;
      else run({ type: 'continue' });
    }
    await persist();
    render();
  }
}

function renderDevButton() {
  if (document.querySelector('.dev-btn')) return;
  const b = document.createElement('button');
  b.className = 'dev-btn';
  b.type = 'button';
  b.textContent = 'DEV';
  b.addEventListener('click', () => { if (!busy) openPanel('dev'); });
  document.body.appendChild(b);
}

function showErrors(errors) {
  document.body.innerHTML = `<div class="errors"><strong>The content has ${errors.length} error${errors.length === 1 ? '' : 's'}, so the game can't start.</strong>\n\n${errors
    .map((e) => `${esc(e.file)}${e.line ? `:${e.line}` : ''}${e.column ? ` [${esc(e.column)}]` : ''}\n  ${esc(e.message)}`).join('\n\n')}</div>`;
}

// ---- Loading: the newest save that still fits the script, or a new history

async function loadGame() {
  saves = await openSaves();
  let snap = { current: null, previous: null, damaged: false };
  try { snap = await saves.load(); } catch { /* treated as no save */ }
  revision = snap.current?.revision || 0;
  let problem = null;
  for (const c of [snap.current, snap.previous].filter(Boolean)) {
    const r = reconcile(c.state, C);
    if (r.state) { state = r.state; if (c !== snap.current) problem = 'Your last save was damaged, so the one before it was loaded.'; break; }
    problem ||= r.problem;
  }
  try { checkpoint = (await saves.get('checkpoint')) || null; } catch { checkpoint = null; }
  try { meta = { endingsSeen: [], ...((await saves.get('meta')) || {}) }; } catch { /* a fresh collection */ }
  if (!state) {
    try { oldSave = await saves.hasOld(); } catch { oldSave = false; }
    state = newHistory(C);
  }
  if (problem) banner(problem, 9000);
}

function bindInput() {
  bindSwipe(els.card, {
    canStart: () => !busy && !conflict && !title && els.panel.hidden && !els.choices.hidden && performance.now() - shownAt > 120,
    onMove: (dx, dy, threshold) => {
      if (Math.abs(dx) > 4) { els.card.classList.remove('wiggle', 'nudge'); els.hand.classList.remove('show', 'once'); }
      els.card.style.transition = 'none';
      setCardTransform(dx);
      if (Math.abs(dx) > 12) preview(dx < 0 ? 'left' : 'right', (Math.abs(dx) - 12) / (threshold * 0.3), Math.abs(dx) >= threshold);
      else preview(null);
    },
    onCancel: springBack,
    onCommit: (side) => choose(side),
    onTap: (e) => { if (!e.target.closest?.('.choice, .next')) nudge(); },
  });
  for (const b of [els.left, els.right]) {
    let downAt = -1;
    b.addEventListener('pointerdown', () => { downAt = performance.now(); });
    b.addEventListener('click', (e) => {
      if (e.detail > 0 && downAt < shownAt) return; // a finger still down from the last view
      choose(b.dataset.side);
    });
  }
  els.next.addEventListener('click', () => proceed());
  els.screen.addEventListener('click', onScreenClick);
  els.situation.addEventListener('scroll', quietText, { passive: true });
  els.screen.addEventListener('scroll', quietText, { passive: true });
  els.menuBtn.addEventListener('click', () => { if (!busy) openPanel(); });
  els.panel.addEventListener('click', onPanelClick);

  // Keys (spec 6): the arrows choose while a decision is showing; Enter and
  // Space move a result, an arrival, a reveal or an epitaph along.
  document.addEventListener('keydown', (e) => {
    if (!els.panel.hidden) { if (e.key === 'Escape') closePanel(); return; }
    if (e.repeat || e.metaKey || e.ctrlKey || e.altKey || title) return;
    const deciding = cur && ['choice', 'proposal', 'redirect'].includes(cur.view);
    if (deciding && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      choose(e.key === 'ArrowLeft' ? 'left' : 'right');
    } else if (!deciding && (e.key === 'Enter' || e.key === ' ') && !e.target.closest?.('button, a, textarea, select')) {
      e.preventDefault();
      proceed();
    }
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (!busy && content) render(); }, 150);
  });
}

async function boot() {
  applySettings();
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
  let loaded;
  try {
    loaded = await loadContentWeb('content/');
  } catch (e) {
    showErrors([{ file: 'content', line: 0, column: '', message: `Couldn't load the content: ${e.message}` }]);
    return;
  }
  if (loaded.errors.length) { showErrors(loaded.errors); return; }
  content = loaded.content;
  C = content.campaign;
  U = content.ui;
  if (DEV && loaded.warnings.length) console.warn('Content warnings', loaded.warnings);

  fx = createFx($('fx'), { onShake: () => {} });
  setGlyph($('menuIcon'), 'ui', 'menu');
  els.hand.src = artURL('ui', 'hand');
  $('favicon').href = artURL('objects', 'vessel/fired-pot');
  // A workbench state whose drawing hasn't arrived shows its description instead
  els.objectArt.addEventListener('error', () => { els.benchLabel.hidden = !els.benchLabel.textContent; });
  // ...a portrait that hasn't arrived shows its silhouette, and an exhibit its label
  document.addEventListener('error', (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement)) return;
    if (img.dataset.key) img.outerHTML = silhouette(img.dataset.key);
    else if (img.dataset.label) img.replaceWith(Object.assign(document.createElement('div'), { className: 'label-card', textContent: img.dataset.label }));
  }, true);

  await loadGame();
  bindInput();
  render();
  document.fonts?.ready.then(() => { fitCard(); quietText(); });
}

boot();
