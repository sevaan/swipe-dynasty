// Browser orchestration for the campaign in content/script.md: load the
// content and the save, deal each moment as a card from a deck (table.js
// moves the cards, faces.js draws them), turn the player's moves into engine
// actions, save after every one, and keep the menu. The story, its rules and
// its words live elsewhere: the script, src/engine/campaign.js, content/ui.json.
import { loadContentWeb } from '../content/load-web.js';
import { act, history, newHistory, offersFor, reconcile, view } from '../engine/campaign.js';
import { exportText, importText, loadSettings, openSaves, saveSettings } from './storage.js';
import { artURL, glyphHTML, setGlyph } from './art.js';
import { createFx } from './fx.js';
import { createTable } from './table.js';
import { createFaces, esc } from './faces.js';

const $ = (id) => document.getElementById(id);
const els = {
  root: document.documentElement, top: $('top'), deck: $('deck'), table: $('table'),
  who: $('who'), era: $('era'), pips: $('pips'), menuBtn: $('menuBtn'),
  panel: $('panel'), banner: $('banner'), live: $('live'),
};
const params = new URLSearchParams(location.search);
const DEV = params.has('dev');

let content = null; // { campaign, world, ui, ageOf, hash }
let C = null; // the campaign
let U = null; // the interface's words
let faces = null;
let table = null;
let state = null;
let cur = null; // view(state) for what's on the table
let checkpoint = null; // the history as it stood at the proposals, for "Another future"
let meta = { endingsSeen: [] }; // outlives a restart
let saves = null;
let revision = 0;
let saving = Promise.resolve();
let conflict = false;
let saveWarned = false;
let settings = loadSettings();
let fx = null;
let title = true; // the title card, which isn't part of the save
let oldSave = false;
let currentTab = 'history';
let heardArchive = -1; // the turn the Archive's lead-in was read on, before the first proposal
let announced = '';

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
  els.root.style.setProperty('--scale', settings.scale);
  els.root.classList.toggle('reduce-motion', !!settings.reduceMotion);
}

const lum = (hex) => { const n = parseInt(String(hex).slice(1), 16); return ((n >> 16) & 255) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11; };

// Two hex colours mixed, k of the first
function mix(a, b, k) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `#${x.map((v, i) => Math.round(v * k + y[i] * (1 - k)).toString(16).padStart(2, '0')).join('')}`;
}

function applyTheme(age) {
  const t = age.theme || {};
  const style = els.root.style;
  for (const [key, value] of Object.entries({ bg: t.bg, panel: t.panel, paper: t.card, ink: t.ink, text: t.text, accent: t.accent })) if (value) style.setProperty(`--${key}`, value);
  // The top of the sky: the era's night, or its darkest sky
  const skies = age.sky || [];
  const night = skies.find((s) => s.name === 'night')?.bg || skies.map((s) => s.bg).sort((a, b) => lum(a) - lum(b))[0] || t.bg;
  style.setProperty('--night', night);
}

function applySky(age) {
  const skies = age.sky || [];
  const every = Math.max(1, content.world.tuning?.skyEvery || 3);
  const i = skies.length ? ((state?.lives.length || 0) + Math.floor((state?.cardIndex || 0) / every)) % skies.length : 0;
  const sky = skies[i] || { bg: age.theme.bg };
  els.root.style.setProperty('--sky', sky.bg);
  const night = getComputedStyle(els.root).getPropertyValue('--night').trim() || sky.bg;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', /^#[0-9a-f]{6}$/i.test(night) ? mix(night, sky.bg, 0.72) : sky.bg);
  fx?.set(title ? ['sparks'] : sky.fx || [], { reduceMotion: settings.reduceMotion, enabled: settings.effects !== false });
}

// ---- Each moment as a card: which deck it's from, where in the deck, and its face

const hasProgress = () => !!state && !(state.view === 'intro' && state.turn === 0);
const cardPos = (i) => (i < 4 ? i + 1 : i + 2); // the reveal sits between the fourth and fifth decisions

function lifeStep(chapterId, pos, extra) {
  const ch = C.chapters[chapterId];
  const variants = ['plain', 'plain', 'plain', 'plain', 'plain', 'gilt', 'plain', 'plain'];
  if (!ch.final) variants.push('mourn'); // a route's last life goes straight to its ending
  return { deck: `life:${chapterId}`, pos, variants, measure: faces.measureLife(chapterId), ...extra };
}

// The proposal on offer, as view() draws it (a result doesn't carry it)
function proposalNow() {
  const offer = offersFor(state);
  return {
    id: `OFFER.${offer.index}`, index: offer.index, first: offer.index === 0, double: offer.double,
    routes: offer.routes.map((rid) => {
      const r = C.routes[rid];
      const first = C.chapters[r.chapters[0]];
      return { id: rid, title: r.title, pitch: r.pitch, acceptLabel: r.acceptLabel, inventor: { ...first.inventor, key: `${first.id}:inventor` }, chapter: first.id };
    }),
  };
}

// The proposals: the Archive's lead-in, then one card per offer
function proposalStep(p, extra) {
  const offers = Math.max(0, state.proposalOrder.length - 2) + 1;
  return { deck: 'proposals', pos: p.index + 1, variants: Array(offers + 1).fill('plain'), ...extra };
}

function stepFor(v) {
  if (title) return { deck: 'title', pos: 0, variants: ['plain', 'plain', 'plain', 'plain'], kind: 'single', cls: 'title', face: faces.title({ resume: hasProgress(), oldSave }) };
  const id = v.chapter?.id;
  switch (v.view) {
    case 'intro':
      return { deck: 'intro', pos: 0, variants: ['plain', 'plain', 'plain'], kind: 'single', cls: 'intro', face: faces.intro() };
    case 'arrival':
      return lifeStep(id, 0, { kind: 'single', cls: 'arrival', face: faces.arrival(v) });
    case 'choice': {
      const i = state.cardIndex;
      const card = C.chapters[id].cards[i];
      return lifeStep(id, cardPos(i), { kind: 'choice', cls: 'choice', face: faces.choice(id, i), labels: { left: card.left.label, right: card.right.label }, hint: v.first === 1 });
    }
    case 'result': {
      if (v.offer) {
        const p = proposalNow();
        return proposalStep(p, { kind: 'result', cls: 'offer', face: faces.offerResult(p, v.offer.side), under: faces.offer(p), underCls: `choice offer${p.double ? ' double' : ''}`, side: v.offer.side });
      }
      if (C.redirect && v.card?.id === C.redirect.id) {
        return { deck: 'redirect', pos: 0, variants: ['plain'], kind: 'result', cls: 'redirect', face: faces.redirectResult(v.result.side), under: faces.redirect(), underCls: 'choice redirect', side: v.result.side };
      }
      const i = state.cardIndex;
      return lifeStep(id, cardPos(i), { kind: 'result', cls: '', face: faces.result(id, i, v.result.side, v.result.callbacks), under: faces.choice(id, i), underCls: 'choice', side: v.result.side });
    }
    case 'reveal':
      return lifeStep(id, 5, { kind: 'single', cls: 'reveal', face: faces.reveal(v) });
    case 'epitaph':
      return lifeStep(id, 8, { kind: 'single', cls: 'epitaph', face: faces.epitaph(v) });
    case 'proposal': {
      const p = v.proposal;
      if (p.index === 0 && heardArchive !== state.turn) return { ...proposalStep(p, {}), pos: 0, kind: 'single', cls: 'transition', face: faces.transition(), archive: true };
      const labels = p.double ? { left: p.routes[0].acceptLabel, right: p.routes[1].acceptLabel } : { left: p.routes[0].acceptLabel, right: U.offerDefer };
      return proposalStep(p, { kind: 'choice', cls: `choice offer${p.double ? ' double' : ''}`, face: faces.offer(p), labels });
    }
    case 'redirect':
      return { deck: 'redirect', pos: 0, variants: ['plain'], kind: 'choice', cls: 'choice redirect', face: faces.redirect(), labels: { left: C.redirect.left.label, right: C.redirect.right.label } };
    case 'ending':
      return { deck: `ending:${v.ending.route}`, pos: v.ending.index, variants: [...Array(v.ending.count - 1).fill('plain'), 'gilt'], kind: 'single', cls: 'ending', face: faces.panel(v.ending) };
    case 'credits':
      return { deck: 'credits', pos: 0, variants: ['plain'], kind: 'fixed', cls: 'credits', face: faces.credits(!!checkpoint) };
    default:
      return { deck: 'intro', pos: 0, variants: ['plain'], kind: 'single', cls: 'intro', face: faces.intro() };
  }
}

// ---- Around the deck: who and when (the header), how far through the
// life (six pips), and firelight behind the deck as the idea catches

const WARMTH = { arrival: 0, choice: [0.03, 0.1, 0.18, 0.42, 0.62, 0.7], result: [0.08, 0.14, 0.42, 0.6, 0.78, 0.66], reveal: 1, epitaph: 0.32 };

function chrome(step, v) {
  let who = '';
  let era = '';
  let count = 0;
  let done = 0;
  let current = -1;
  let warmth = 0.3;
  if (title || !v) {
    warmth = 0.35;
  } else if (step.deck.startsWith('life:')) {
    who = v.chapter.inventor.name;
    era = v.chapter.era;
    count = 6;
    const i = state.cardIndex;
    if (v.view === 'choice') { done = i; current = i; warmth = WARMTH.choice[i]; }
    else if (v.view === 'result') { done = i + 1; warmth = WARMTH.result[i]; }
    else if (v.view === 'reveal') { done = 4; warmth = WARMTH.reveal; }
    else if (v.view === 'epitaph') { done = 6; warmth = WARMTH.epitaph; }
    else warmth = WARMTH.arrival;
  } else if (step.deck === 'proposals') {
    who = C.archive.name;
    warmth = 0.2;
  } else if (step.deck === 'redirect') {
    who = C.archive.name;
    era = C.redirect.title;
    warmth = 0.2;
  } else if (step.deck.startsWith('ending:')) {
    who = v.ending.title;
    era = C.routes[v.ending.route].title;
    count = v.ending.count;
    done = v.ending.index;
    current = v.ending.index;
    warmth = 0.55;
  } else if (step.deck === 'intro') {
    warmth = 0.22;
  } else {
    warmth = 0.4;
  }
  els.who.textContent = who;
  els.era.textContent = era;
  els.era.hidden = !era;
  if (els.pips.children.length !== count) els.pips.innerHTML = Array.from({ length: count }, () => '<li class="pip"></li>').join('');
  [...els.pips.children].forEach((pip, i) => {
    pip.classList.toggle('done', i < done);
    pip.classList.toggle('now', i === current);
  });
  els.pips.setAttribute('aria-label', count ? `${current >= 0 ? current + 1 : done} / ${count}` : '');
  els.root.style.setProperty('--warmth', String(warmth));
}

// Screen readers hear each new card once
function announce(step) {
  const key = `${step.deck}:${step.pos}:${step.kind}`;
  if (key === announced) return;
  announced = key;
  const box = document.createElement('div');
  box.innerHTML = step.face;
  const context = [els.who.textContent, els.era.textContent].filter(Boolean).join(', ');
  els.live.textContent = `${context ? `${context}. ` : ''}${box.textContent.replace(/\s+/g, ' ').trim()}`;
}

function render() {
  const v = title ? null : (cur = view(state, C));
  const age = ageFor(v);
  applyTheme(age);
  applySky(age);
  const step = stepFor(v);
  chrome(step, v);
  table.show(step);
  announce(step);
  quietText();
  if (DEV) renderDevButton();
}

// Tells the weather where words sit on the sky, so it thins out behind them
function quietText() {
  if (!fx) return;
  const r = els.top.querySelector('.context').getBoundingClientRect();
  fx.setQuiet(r.width ? [{ left: r.left - 10, top: r.top - 6, right: r.right + 10, bottom: r.bottom + 6 }] : []);
}

// ---- The player's moves

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

// A decision: the card is already on its way over; the engine decides what
// happened, and the result lands on its back
function onChoose(side) {
  if (conflict || title || !cur) return false;
  const type = cur.view === 'choice' ? 'choose' : cur.view === 'proposal' ? 'offer' : cur.view === 'redirect' ? 'redirect' : null;
  if (!type) return false;
  if (!run({ type, side, card: cur.card?.id })) return false;
  persist();
  render();
  return true;
}

// Moving on from anything that isn't a decision
function onNext() {
  if (conflict) return false;
  if (title) { begin(); return true; }
  if (table.step?.archive) { heardArchive = state.turn; render(); return true; }
  if (!run({ type: 'continue' })) return false;
  persist();
  render();
  return true;
}

function begin() {
  if (hasProgress()) { title = false; render(); return; }
  startHistory();
}

function startHistory() {
  state = newHistory(C);
  checkpoint = null;
  heardArchive = -1;
  saveRecord('checkpoint', null);
  title = false;
  persist();
  render();
}

function onAction(what) {
  if (what === 'history' || what === 'settings') { openPanel(what); return; }
  if (what === 'another-future') {
    if (!checkpoint || conflict) return;
    if (!run({ type: 'another-future', checkpoint })) return;
    heardArchive = -1;
    persist();
    render();
    return;
  }
  if (what === 'start-over') startHistory();
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
  const look = faces.lookFor(chapterId, 5, state.legacies[chapterId] || 'left') || faces.lookFor(chapterId, 3, state.choices[`${chapterId}.4`] || 'left');
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
    ${DEV ? '<a href="./">Leave dev mode</a>' : '<a href="?dev">Dev mode</a>'} · <a href="tools/script.html">Script</a> · <a href="tools/art.html">Art</a> · <a href="tools/fx.html">Weather</a> · <a href="prototypes/">Layout prototypes</a></p>`;
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
    <div class="panel-in">
      <div class="panel-head"><h2>${esc(tabs.find((t) => t[0] === tab)[1])}</h2><button class="close-btn" type="button" data-act="close" aria-label="Close">${glyphHTML('ui', 'close')}</button></div>
      <div class="panel-tabs" role="tablist" style="grid-template-columns: repeat(${tabs.length}, 1fr)">${tabs.map(([id, label]) => `<button type="button" role="tab" data-tab="${id}" aria-selected="${id === tab}">${esc(label)}</button>`).join('')}</div>
      <div class="panel-body">${body}</div>
    </div>`;
  els.panel.hidden = false;
  if (!wasOpen) els.panel.querySelector('.close-btn').focus();
  else els.panel.querySelector(`[data-tab="${tab}"]`)?.focus();
}

function closePanel() {
  els.panel.hidden = true;
  els.menuBtn.focus({ preventScroll: true });
}

async function onPanelClick(e) {
  if (e.target === els.panel) { closePanel(); return; } // a tap outside the sheet
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
  if (t.dataset.act === 'restart-go') { closePanel(); startHistory(); return; }
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
    // The life can be played again: forget what was chosen in it last time
    for (const k of Object.keys(state.choices)) if (k.startsWith(`${id}.`)) delete state.choices[k];
    for (const [inv, rec] of Object.entries(state.inventions)) if (rec.chapterId === id) delete state.inventions[inv];
    delete state.legacies[id];
    delete state.obituaries[id];
    state.lives = state.lives.filter((l) => l !== id);
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
  b.addEventListener('click', () => { if (!table.busy) openPanel('dev'); });
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
  els.menuBtn.addEventListener('click', () => { if (els.panel.hidden) openPanel(); else closePanel(); });
  els.panel.addEventListener('click', onPanelClick);
  document.addEventListener('keydown', (e) => {
    if (!els.panel.hidden && e.key === 'Escape') closePanel();
  });
  // No pinch zoom on iOS
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  let raf = 0;
  addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => { table.layout(); quietText(); });
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

  faces = createFaces({ content, getState: () => state });
  table = createTable({
    deck: els.deck,
    table: els.table,
    calm: () => !!settings.reduceMotion,
    canPress: () => els.panel.hidden && !conflict,
    onChoose,
    onNext,
    onAction,
  });
  fx = createFx($('fx'), { onShake: () => {} });
  setGlyph($('menuIcon'), 'ui', 'menu');
  $('favicon').href = artURL('objects', 'vessel/fired-pot');
  // A portrait that hasn't arrived shows its silhouette, and a workbench
  // drawing its description
  document.addEventListener('error', (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement)) return;
    if (img.dataset.key) {
      img.closest('.face-crop')?.classList.add('plain');
      img.outerHTML = faces.silhouette(img.dataset.key);
    } else if (img.dataset.label) {
      img.replaceWith(Object.assign(document.createElement('div'), { className: 'label-card', textContent: img.dataset.label }));
    }
  }, true);

  await loadGame();
  bindInput();
  render();
  // ?dev: a handle for tests and the console
  if (DEV) window.obi = { get state() { return state; }, get view() { return cur; }, get step() { return table.step; }, get busy() { return table.busy; }, C, content, faces };
  // If a font arrives late, measure again so every card still fits
  document.fonts?.ready.then(() => table.layout());
  document.fonts?.addEventListener?.('loadingdone', () => table.layout());
}

boot();
