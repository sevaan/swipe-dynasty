// Browser orchestration: load content and the save, draw the current moment,
// turn swipes, taps and keys into engine actions (one decision function for
// all of them, spec 12.3), save, then animate.
import { loadContentWeb } from '../content/load-web.js';
import { advance, choose, devAction, newGame, reconcile, view } from '../engine/game.js';
import { bindSwipe, bindTap } from './input.js';
import { exportText, importText, loadSettings, openSaves, saveSettings } from './storage.js';
import { artURL, glyphHTML, setGlyph } from './art.js';
import { createFx } from './fx.js';

const $ = (id) => document.getElementById(id);
const els = {
  app: $('app'), context: $('context'), inventor: $('inventor'), era: $('era'), problem: $('problem'),
  play: $('play'), bench: $('bench'), benchArt: $('benchArt'), objectArt: $('objectArt'), marks: $('marks'), peek: $('peek'), hand: $('hand'),
  evidence: $('evidence'), danger: $('danger'), phase: $('phase'),
  situation: $('situation'), result: $('result'), notice: $('notice'), speaker: $('speaker'), face: $('face'), speakerName: $('speakerName'), text: $('text'),
  choices: $('choices'), left: $('choiceLeft'), right: $('choiceRight'),
  screen: $('screen'), menuBtn: $('menuBtn'), panel: $('panel'), banner: $('banner'), live: $('live'),
};
const params = new URLSearchParams(location.search);
const DEV = params.has('dev');

let content = null;
let state = null;
let cur = null; // view(state) for what's on screen
let saves = null;
let revision = 0;
let saving = Promise.resolve();
let conflict = false;
let saveWarned = false;
let settings = loadSettings();
let busy = false;
let fx = null;
let shownTurn = -1;
let sceneShownAt = 0; // when this scene appeared: input must start after it (spec 12.4)
let screenShownAt = 0;
let lastEvidence = [];
let peekSide = null;
let currentTab = 'history';
let devWeather = '';
let timelapse = 0;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const low = (s) => (s ? s[0].toLowerCase() + s.slice(1) : s);
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
// Motion waits shrink with reduced motion; pauses that carry information don't
const wait = (ms) => pause(settings.reduceMotion ? Math.min(ms, 60) : ms);

function banner(text, ms = 5000) {
  els.banner.textContent = text;
  els.banner.hidden = false;
  clearTimeout(banner.t);
  if (ms) banner.t = setTimeout(() => { els.banner.hidden = true; }, ms);
}

// Saves the whole state after every change, one write at a time. A save that
// fails says so; a save another tab has overtaken stops, rather than
// overwrite newer progress.
function persist() {
  saving = saving.then(writeSave);
  return saving;
}

async function writeSave() {
  if (conflict || !saves) return;
  let r;
  try { r = await saves.write(state, revision); } catch (e) { r = { ok: false, error: e }; }
  if (r.ok) { revision = r.revision; return; }
  if (r.conflict) {
    conflict = true;
    banner('This game has moved on in another tab or window. Reload this page to carry on from there.', 0);
    return;
  }
  if (!saveWarned) {
    saveWarned = true;
    banner("Couldn't save your progress in this browser. You can keep playing, but it won't be kept.", 8000);
  }
}

function applySettings() {
  document.documentElement.style.setProperty('--scale', settings.scale);
  document.documentElement.classList.toggle('reduce-motion', !!settings.reduceMotion);
}

function applyTheme(theme = {}) {
  const root = document.documentElement.style;
  for (const key of ['bg', 'panel', 'card', 'ink', 'text', 'accent']) if (theme[key]) root.setProperty(`--${key}`, theme[key]);
}

// The sky colour and weather for this moment: the time of day, unless the
// scene sets weather. Weather with its own sky replaces the time of day's
// effects; weather without one adds to them.
function applySky(v) {
  let bg = v.sky?.bg || v.era.theme.bg;
  let effects = [...(v.sky?.fx || [])];
  const weather = devWeather ? content.weather[devWeather] : v.scene?.weather;
  if (weather?.bg) { bg = weather.bg; effects = [...weather.fx]; }
  else if (weather) effects.push(...weather.fx);

  clearInterval(timelapse);
  timelapse = 0;
  if (v.phase === 'transition' && v.transition && !devWeather) {
    // "Centuries pass": the new era's skies go by quickly, under the stars
    const skies = v.transition.skies;
    bg = skies[0]?.bg || bg;
    effects = ['stars'];
    if (!settings.reduceMotion && skies.length > 1) {
      let i = 0;
      timelapse = setInterval(() => {
        i = (i + 1) % skies.length;
        document.documentElement.style.setProperty('--sky', skies[i].bg);
      }, 500);
    }
  }
  document.documentElement.style.setProperty('--sky', bg);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg);
  fx?.set([...new Set(effects)], { reduceMotion: settings.reduceMotion, enabled: settings.effects !== false });
}

function shake() {
  els.app.classList.remove('shake');
  void els.app.offsetWidth;
  els.app.classList.add('shake');
  setTimeout(() => els.app.classList.remove('shake'), 500);
}

const setSrc = (img, url) => { if (img.getAttribute('src') !== url) img.setAttribute('src', url); };

// The object: the era's workbench, the prototype's look, and its overlays
function drawObject(eraBench, project, look, marks) {
  setSrc(els.benchArt, artURL('benches', eraBench));
  setSrc(els.objectArt, artURL('objects', `${project}/${look}`));
  const have = [...els.marks.children].map((img) => img.dataset.mark);
  if (have.join() !== marks.join()) {
    els.marks.innerHTML = marks.map((m) => `<img class="art" data-mark="${esc(m)}" src="${esc(artURL('overlays', m))}" alt="" draggable="false">`).join('');
  }
}

function drawDanger(value, max, preview = null) {
  const after = preview == null ? value : Math.max(0, Math.min(max, preview));
  const segs = [];
  for (let i = 0; i < max; i++) {
    let cls = i < value ? 'on' : '';
    if (preview != null && i >= value && i < after) cls = 'adds';
    if (preview != null && i < value && i >= after) cls = 'clears';
    segs.push(`<span class="seg ${cls}"></span>`);
  }
  els.danger.classList.toggle('fatal', preview != null && preview >= max);
  els.danger.innerHTML = `<span>Danger</span><span class="segs" aria-hidden="true">${segs.join('')}</span><span>${value} of ${max}</span>`;
  els.danger.setAttribute('aria-label', `Danger ${value} of ${max}`);
}

function choiceHTML(side, o) {
  const tags = [];
  if (o.fatal) tags.push('<span class="tag fatal">Fatal</span>');
  else if (o.danger) tags.push(`<span class="tag danger">Danger ${o.danger > 0 ? '+' : '−'}${Math.abs(o.danger)}</span>`);
  for (const b of o.because) tags.push(`<span class="tag because">Possible because of ${esc(b)}</span>`);
  const arrow = glyphHTML('ui', side === 'left' ? 'arrow-left' : 'arrow-right');
  return `<span class="top">${arrow}<span class="label">${esc(o.label)}</span></span>
    ${o.preview ? `<span class="preview">${esc(o.preview)}</span>` : ''}
    ${tags.length ? `<span class="tags">${tags.join('')}</span>` : ''}`;
}

function describe(side, o) {
  const bits = [o.label];
  if (o.preview) bits.push(o.preview);
  if (o.fatal) bits.push('Fatal');
  else if (o.danger) bits.push(`Danger ${o.danger > 0 ? 'plus' : 'minus'} ${Math.abs(o.danger)}`);
  for (const b of o.because) bits.push(`Possible because of ${b}`);
  return `${side === 'left' ? 'Left' : 'Right'}: ${bits.join('. ')}`;
}

function renderPlay(v, opts = {}) {
  els.app.classList.remove('between');
  els.play.hidden = false;
  els.choices.hidden = false;
  els.choices.style.visibility = '';
  els.screen.hidden = true;

  els.inventor.textContent = v.inventor.name;
  els.era.textContent = v.era.name;
  els.problem.textContent = v.project.problem;

  drawObject(v.era.bench, v.object.project, v.object.look, v.object.marks);
  if (opts.enter) { els.bench.classList.remove('enter'); void els.bench.offsetWidth; els.bench.classList.add('enter'); }

  const fresh = v.evidence.filter((e) => !lastEvidence.includes(e.id)).map((e) => e.id);
  els.evidence.innerHTML = v.evidence.map((e) => `<li class="${opts.animate && fresh.includes(e.id) ? 'new' : ''}">${esc(e.text)}</li>`).join('');
  lastEvidence = v.evidence.map((e) => e.id);

  drawDanger(v.danger.value, v.danger.max);
  const p = v.progress;
  els.phase.innerHTML = `<b>${esc(p.label)}</b>${p.text ? ` · ${esc(p.text)}` : ''}`;

  els.result.textContent = v.scene.result || '';
  const n = v.scene.notice;
  els.notice.textContent = n ? `${n.changed ? 'Legacy changed' : 'Legacy'}: ${n.text}` : '';
  const who = v.scene.speaker;
  els.speaker.classList.toggle('has', !!who?.name);
  els.speakerName.textContent = who?.name || '';
  els.face.innerHTML = who?.portrait ? `<img class="art" src="${esc(artURL('characters', who.portrait))}" alt="" draggable="false">` : '';
  els.text.textContent = v.scene.text;
  els.left.innerHTML = choiceHTML('left', v.options.left);
  els.right.innerHTML = choiceHTML('right', v.options.right);
  els.left.setAttribute('aria-label', describe('left', v.options.left));
  els.right.setAttribute('aria-label', describe('right', v.options.right));

  // The first scene of the first life shows how to swipe
  const hint = v.scene.phase === 'opening' && v.project.id === content.start.project && !state.collection.tutorialDone;
  els.hand.classList.toggle('show', hint);
  els.bench.classList.toggle('wiggle', hint);

  if (v.turn !== shownTurn) {
    shownTurn = v.turn;
    sceneShownAt = performance.now();
    els.situation.scrollTop = 0;
    const live = [who?.name ? `${who.name}:` : '', v.scene.result, v.scene.text, describe('left', v.options.left), describe('right', v.options.right)];
    els.live.textContent = live.filter(Boolean).join(' ');
  }
  peekSide = null;
  preview(null);
}

// Previewing never changes the game: it only lights up the answer and what it would do.
function preview(side, strength = 1) {
  const v = cur;
  els.left.classList.toggle('hot', side === 'left');
  els.right.classList.toggle('hot', side === 'right');
  if (!side || !v?.options) {
    els.peek.style.opacity = 0;
    if (peekSide && v?.danger) drawDanger(v.danger.value, v.danger.max);
    peekSide = null;
    return;
  }
  const o = v.options[side];
  if (peekSide !== side) {
    peekSide = side;
    els.peek.className = `peek ${side}`;
    els.peek.innerHTML = side === 'left'
      ? `${glyphHTML('ui', 'arrow-left')}<span>${esc(o.label)}</span>`
      : `<span>${esc(o.label)}</span>${glyphHTML('ui', 'arrow-right')}`;
    drawDanger(v.danger.value, v.danger.max, v.danger.value + o.danger);
  }
  els.peek.style.opacity = Math.min(1, strength);
}

function setBenchTransform(dx) {
  const rot = Math.max(-8, Math.min(8, dx / 24));
  els.bench.style.transform = `translateX(${dx * 0.7}px) rotate(${rot}deg)`;
}

function springBack() {
  els.bench.style.transition = 'transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1.2)';
  els.bench.style.transform = '';
  preview(null);
}

// Screens between lives (spec 12.6): the epitaph, one line of inheritance, the next life

const KIND = { keystone: 'Keystone', stepping: 'Stepping stone', optional: 'Optional discovery' };
const resultName = (rec) => (rec.result.kind === 'invention' ? content.inventions[rec.result.id]?.name : content.failures[rec.result.id]?.name) || 'something';

function exhibitHTML(rec) {
  const marks = (rec.marks || []).filter((m) => !content.transient.includes(m));
  return `<div class="exhibit" aria-hidden="true">
    <img class="art" src="${esc(artURL('benches', 'exhibit'))}" alt="">
    <img class="art" src="${esc(artURL('objects', `${rec.project}/${rec.look}`))}" alt="">
    ${marks.map((m) => `<img class="art" src="${esc(artURL('overlays', m))}" alt="">`).join('')}
  </div>`;
}

function screenHTML(v) {
  if (v.phase === 'epitaph' && v.record) {
    const r = v.record;
    const inv = r.result.kind === 'invention' ? content.inventions[r.result.id] : null;
    const tags = [
      inv ? `<span class="tag ${inv.type === 'keystone' ? 'keystone' : ''}">${r.result.status === 'reinvention' ? 'Reinvented' : KIND[inv.type] || 'Invention'}</span>`
        : `<span class="tag">${r.result.status === 'reinvention' ? 'Failed again' : 'Failed design'}</span>`,
      r.newFind ? '<span class="tag new">New in the museum</span>' : '',
    ].join(' ');
    return `<div class="screen-in">
      ${r.closing ? `<p class="closing">${esc(r.closing)}</p>` : ''}
      ${exhibitHTML(r)}
      <div class="placard">
        <p class="rip">Here lies</p>
        <p class="name">${esc(r.name)}</p>
        <p class="made">${esc(r.epitaph.made)}</p>
        <p class="ended">${esc(r.epitaph.ended)}</p>
        ${r.epitaph.legacy ? `<p class="legacy">${esc(r.epitaph.legacy)}</p>` : ''}
        <p class="meta">${esc(content.eras[r.era]?.name || '')} · life ${r.eraLife} · ${r.decisions} decisions</p>
      </div>
      ${r.notice ? `<p class="notice">${r.notice.changed ? 'Your last choice changed how it spread' : 'How it spread'}: ${esc(r.notice.text)}</p>` : ''}
      <div class="tags">${tags}</div>
      <p class="continue">Tap to continue</p>
    </div>`;
  }
  if (v.phase === 'inherit' && v.record) {
    return `<div class="screen-in inherit">
      <p class="kicker">What the next inventor inherits</p>
      <p class="statement">${esc(v.record.inherit)}</p>
      <p class="continue">Tap to begin the next life</p>
    </div>`;
  }
  if (v.phase === 'transition' && v.transition) {
    const t = v.transition;
    return `<div class="screen-in">
      <p class="big">Centuries pass.</p>
      ${t.intro ? `<p class="scene">${esc(t.intro)}</p>` : ''}
      <p class="era-name">${esc(t.to)}</p>
      <p class="continue">Tap to begin</p>
    </div>`;
  }
  if (v.phase === 'end') {
    const techs = v.timeline.techs.map((t) => `<span class="tag">${esc(cap(t.name))}</span>`).join('');
    return `<div class="screen-in">
      <p class="big">To be continued.</p>
      <p class="scene">History has caught up with the writers. The rest of ${esc(low(v.era.name))} is still being invented, probably by someone standing too close to it.</p>
      ${techs ? `<p class="kicker">Your history</p><div class="tags">${techs}</div>` : ''}
      <p class="fine">The menu has everything that happened. Settings can start a new timeline.</p>
    </div>`;
  }
  return '';
}

function renderScreen(v) {
  els.app.classList.add('between');
  els.play.hidden = true;
  els.choices.hidden = true;
  els.hand.classList.remove('show');
  els.screen.innerHTML = screenHTML(v);
  els.screen.hidden = false;
  if (v.turn !== shownTurn) {
    shownTurn = v.turn;
    screenShownAt = performance.now();
    els.screen.scrollTop = 0;
    if (v.phase === 'epitaph' && v.record) els.live.textContent = `Here lies ${v.record.name}. ${v.record.epitaph.made} ${v.record.epitaph.ended} ${v.record.epitaph.legacy}`;
    if (v.phase === 'inherit' && v.record) els.live.textContent = `What the next inventor inherits: ${v.record.inherit}`;
    if (v.phase === 'transition') els.live.textContent = `Centuries pass. ${v.transition?.to}.`;
    if (v.phase === 'end') els.live.textContent = 'To be continued.';
  }
}

function render(opts = {}) {
  cur = view(state, content);
  const v = cur;
  applyTheme(v.phase === 'transition' && v.transition ? v.transition.theme : v.era.theme);
  applySky(v);
  if (v.phase === 'play' && v.scene) renderPlay(v, opts);
  else renderScreen(v);
  quietText();
  if (DEV) renderDevButton();
}

// Tells the weather where the words are, so it thins out behind them.
function quietText() {
  if (!fx) return;
  const boxes = [];
  const add = (el, x = 8, y = 4) => {
    if (!el?.offsetParent) return;
    const r = el.getBoundingClientRect();
    if (r.width) boxes.push({ left: r.left - x, top: r.top - y, right: r.right + x, bottom: r.bottom + y });
  };
  add(els.context.querySelector('.who'));
  if (!els.play.hidden) {
    add(els.evidence, 4, 2);
    add(els.danger.parentElement, 4, 2);
    add(els.situation, 8, 6);
  }
  if (!els.screen.hidden) {
    for (const el of els.screen.querySelectorAll('.closing, .kicker, .statement, .big, .era-name, .scene, .fine, .tags, .notice, .continue')) add(el, 12, 6);
  }
  fx.setQuiet(boxes);
}

// Actions

async function commit(side, via = 'tap') {
  if (busy || conflict || state.phase !== 'play' || !cur?.scene) return;
  busy = true;
  const res = choose(state, content, { side, scene: cur.scene.id, turn: cur.turn });
  if (res.events.some((e) => e.type === 'rejected')) { busy = false; springBack(); return; }
  state = res.state;
  const saved = persist();

  // The workbench nods toward the answer, then the new moment appears
  const button = side === 'left' ? els.left : els.right;
  button.classList.add('pressed');
  if (!settings.reduceMotion) {
    els.bench.style.transition = 'transform 200ms var(--ease-out)';
    els.bench.style.transform = `translateX(${side === 'left' ? -28 : 28}px) rotate(${side === 'left' ? -3 : 3}deg)`;
  }
  await wait(via === 'swipe' ? 120 : 180);
  button.classList.remove('pressed');
  els.bench.style.transition = settings.reduceMotion ? 'none' : 'transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1.2)';
  els.bench.style.transform = '';
  preview(null);

  const ended = res.events.find((e) => e.type === 'death')?.record;
  if (ended) {
    // A short pause on what the last choice did to the object, then the epitaph
    drawObject(cur.era.bench, ended.project, ended.look, ended.marks);
    drawDanger(ended.danger, cur.danger.max);
    els.choices.style.visibility = 'hidden';
    await pause(900);
    render({ enter: true });
  } else {
    render({ animate: true });
    if (res.events.some((e) => e.type === 'commit' || e.type === 'look')) {
      els.bench.classList.remove('bump');
      void els.bench.offsetWidth;
      els.bench.classList.add('bump');
    }
  }
  await saved;
  busy = false;
}

async function proceed() {
  if (busy || conflict || state.phase === 'play' || performance.now() - screenShownAt < 250) return;
  busy = true;
  const res = advance(state, content, { turn: state.turn });
  if (!res.events.some((e) => e.type === 'rejected')) {
    state = res.state;
    await persist();
    lastEvidence = [];
    render({ enter: true });
  }
  busy = false;
}

// Menu panel: History (spec 15.1), Settings, and Dev

function thumbHTML(rec) {
  if (!rec) return '<div class="pic" aria-hidden="true"></div>';
  return `<div class="pic" aria-hidden="true"><img class="art" src="${esc(artURL('benches', 'exhibit'))}" alt=""><img class="art" src="${esc(artURL('objects', `${rec.project}/${rec.look}`))}" alt=""></div>`;
}

// One history, three views of the same records: what exists, who lived, and
// which contribution enabled or complicated the next.
function historyHTML() {
  const archive = state.collection.archive;
  const lives = archive.filter((r) => r.timeline === state.timeline.n);
  if (!lives.length) return '<p class="summary">Nothing has happened yet. Give it a life.</p>';
  let html = `<p class="summary">${lives.length} ${lives.length === 1 ? 'life' : 'lives'} in this timeline.</p>`;

  html += '<h3>Discoveries</h3>';
  if (!state.timeline.techs.length) html += '<p class="fine">Nothing has been invented in this timeline yet. Plenty has been tried.</p>';
  for (const t of state.timeline.techs) {
    const inv = content.inventions[t];
    const rec = archive[(state.timeline.makers[t] || 0) - 1];
    const leg = content.legacies[state.timeline.legacies[t]];
    // An invention's own look is its museum picture; otherwise, how its maker left it
    const pic = rec && inv?.look ? { ...rec, project: inv.project, look: inv.look } : rec;
    html += `<div class="item">${thumbHTML(pic)}<p class="title">${esc(cap(inv?.name || t))}</p>
      <p class="body">${esc(inv?.museum || '')}</p>
      <p class="link">${rec ? `Made by <b>${esc(rec.name)}</b>. ` : ''}${leg ? esc(leg.adoption) : ''}</p></div>`;
  }

  html += '<h3>Lives</h3>';
  for (const r of [...lives].reverse()) {
    html += `<div class="item">${thumbHTML(r)}<p class="title">${esc(r.name)}</p>
      <p class="body">${esc(r.epitaph.made)} ${esc(r.epitaph.ended)}</p>
      ${r.epitaph.legacy ? `<p class="link">${esc(r.epitaph.legacy)}</p>` : ''}</div>`;
  }

  const lines = [];
  for (const r of lives) {
    const from = new Set();
    for (const ref of r.refs || []) {
      const src = archive[ref.record - 1];
      if (!src || from.has(ref.record)) continue;
      from.add(ref.record);
      if (ref.why === 'enabled') lines.push(`<b>${esc(cap(resultName(src)))}</b> enabled <b>${esc(resultName(r))}</b>.`);
      else lines.push(`<b>${esc(cap(resultName(src)))}</b> left ${esc(r.name)} a problem: ${esc(low(content.projects[r.project]?.problem || ''))}.`);
    }
  }
  if (lines.length) html += `<h3>Connections</h3><div class="item chain">${lines.map((l) => `<p class="body">${l}</p>`).join('')}</div>`;
  return html;
}

function buildStamp() {
  const d = new Date(document.lastModified);
  return Number.isNaN(d.getTime()) ? 'unknown' : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function settingsHTML() {
  const sizes = [[0.9, 'S'], [1, 'M'], [1.15, 'L'], [1.3, 'XL']];
  return `
    <div class="row"><span>Text size</span><span class="seg">${sizes.map(([s, l]) => `<button type="button" data-scale="${s}" aria-pressed="${settings.scale === s}">${l}</button>`).join('')}</span></div>
    <div class="row"><span>Weather effects</span><span class="seg"><button type="button" data-effects="off" aria-pressed="${settings.effects === false}">Off</button><button type="button" data-effects="on" aria-pressed="${settings.effects !== false}">On</button></span></div>
    <div class="row"><span>Reduce motion</span><span class="seg"><button type="button" data-motion="off" aria-pressed="${!settings.reduceMotion}">Off</button><button type="button" data-motion="on" aria-pressed="${!!settings.reduceMotion}">On</button></span></div>
    <h3>Your save</h3>
    <p class="fine">Your game is saved in this browser after every choice. It isn't synced to other devices or backed up. To move it, copy it here and paste it there.</p>
    <div class="dev-actions"><button class="btn" type="button" data-act="copy">Copy save</button><button class="btn" type="button" data-act="load">Load pasted save</button></div>
    <textarea class="save-box" id="saveBox" placeholder="Paste a save here, then tap Load pasted save" spellcheck="false"></textarea>
    <h3>Start over</h3>
    <p class="fine">Starts a new timeline from the beginning. Everything you've discovered stays in your collection.</p>
    <button class="btn danger" type="button" data-act="reset">Start a new timeline</button>
    <h3>About</h3>
    <p class="fine">One Bright Idea · Milestone 1 · build ${esc(buildStamp())} · content ${esc(content.hash)} · seed ${esc(state.seed)} · saves in ${esc(saves?.kind || 'nowhere')}<br>
    ${DEV ? '<a href="./">Leave dev mode</a>' : '<a href="?dev">Dev mode</a>'} · <a href="tools/art.html">Art</a> · <a href="tools/fx.html">Weather</a></p>`;
}

function devHTML() {
  const l = state.life;
  const dump = {
    phase: state.phase, turn: state.turn, seed: state.seed, revision,
    life: l && { n: l.n, name: l.name, project: l.project, phase: l.phase, invest: l.invest, after: l.after, danger: l.danger, observed: l.observed, look: l.look, marks: l.marks, legacy: l.legacy, made: l.made, failed: l.failed, flags: l.flags, queue: l.queue, scene: l.current?.id },
    timeline: { era: state.timeline.era, techs: state.timeline.techs, legacies: state.timeline.legacies, problem: state.timeline.problem, previous: state.timeline.previous, flags: state.timeline.flags, stall: state.timeline.stall },
    diagnostics: state.diagnostics,
  };
  const invOptions = content.inventionOrder.map((id) => `<option value="${esc(id)}">${esc(id)}</option>`).join('');
  const weatherOptions = Object.keys(content.weather).map((id) => `<option value="${esc(id)}"${devWeather === id ? ' selected' : ''}>${esc(id)}</option>`).join('');
  return `
    <div class="dev-actions">
      <button class="btn" type="button" data-dev="observe">Observe everything</button>
      <button class="btn" type="button" data-dev="proof">Go to proof</button>
      <button class="btn" type="button" data-dev="kill">Die now</button>
      <button class="btn" type="button" data-dev="danger0">Danger 0</button>
      <button class="btn" type="button" data-dev="danger5">Danger 5</button>
    </div>
    <div class="dev-actions">
      <select id="devInv">${invOptions}</select><button class="btn" type="button" data-dev="grant">Grant</button>
      <select id="devWeather"><option value="">(scene weather)</option>${weatherOptions}</select><button class="btn" type="button" data-act="weather">Preview weather</button>
    </div>
    <div class="dev">${esc(JSON.stringify(dump, null, 1))}</div>`;
}

function openPanel(tab = currentTab) {
  const tabs = [['history', 'History'], ['settings', 'Settings']];
  if (DEV) tabs.push(['dev', 'Dev']);
  if (!tabs.some((t) => t[0] === tab)) tab = 'history';
  currentTab = tab;
  const wasOpen = !els.panel.hidden;
  const body = { history: historyHTML, settings: settingsHTML, dev: devHTML }[tab]();
  els.panel.innerHTML = `
    <div class="panel-head"><h2>${esc(tabs.find((t) => t[0] === tab)[1])}</h2><button class="close-btn" type="button" data-act="close" aria-label="Close">${glyphHTML('ui', 'close')}</button></div>
    <div class="tabs" role="tablist" style="grid-template-columns: repeat(${tabs.length}, 1fr)">${tabs.map(([id, label]) => `<button type="button" role="tab" data-tab="${id}" aria-selected="${id === tab}">${label}</button>`).join('')}</div>
    <div class="panel-body">${body}</div>`;
  els.panel.hidden = false;
  if (!wasOpen) els.panel.querySelector('.close-btn').focus();
  else els.panel.querySelector(`[data-tab="${tab}"]`)?.focus();
}

function closePanel() {
  els.panel.hidden = true;
  els.menuBtn.focus();
}

async function onPanelClick(e) {
  const t = e.target.closest('button');
  if (!t) return;
  if (t.dataset.tab) { openPanel(t.dataset.tab); return; }
  if (t.dataset.act === 'close') { closePanel(); return; }
  if (t.dataset.scale) { settings.scale = Number(t.dataset.scale); saveSettings(settings); applySettings(); render(); openPanel('settings'); return; }
  if (t.dataset.effects) { settings.effects = t.dataset.effects === 'on'; saveSettings(settings); render(); openPanel('settings'); return; }
  if (t.dataset.motion) { settings.reduceMotion = t.dataset.motion === 'on'; saveSettings(settings); applySettings(); render(); openPanel('settings'); return; }
  if (t.dataset.act === 'copy') {
    const text = exportText(state);
    const box = $('saveBox');
    box.value = text;
    try { await navigator.clipboard.writeText(text); banner('Save copied.'); } catch { box.select(); banner('Select the text and copy it.'); }
    return;
  }
  if (t.dataset.act === 'load') {
    const parsed = importText($('saveBox').value);
    if (parsed.error) { banner(parsed.error); return; }
    const { state: s, problem } = reconcile(parsed.state, content);
    if (!s) { banner(problem || "That save doesn't fit this version of the game."); return; }
    state = s;
    await persist();
    closePanel();
    lastEvidence = [];
    render({ enter: true });
    banner('Save loaded.');
    return;
  }
  if (t.dataset.act === 'reset') {
    if (!confirm('Start a new timeline? This one ends here. Everything you discovered stays in your collection.')) return;
    // A new timeline keeps the collection (spec 15.2) but none of the technology
    const { collection } = state;
    state = newGame(content);
    state.collection = collection;
    state.timeline.n = Math.max(0, ...collection.archive.map((r) => r.timeline)) + 1;
    await persist();
    closePanel();
    lastEvidence = [];
    render({ enter: true });
    return;
  }
  if (t.dataset.act === 'weather') {
    devWeather = $('devWeather').value;
    closePanel();
    render();
    return;
  }
  if (t.dataset.dev) {
    const kind = t.dataset.dev;
    const action = kind === 'grant' ? { kind, inv: $('devInv').value } : kind.startsWith('danger') ? { kind: 'danger', n: Number(kind.slice(6)) } : { kind };
    const res = devAction(state, content, action);
    state = res.state;
    await persist();
    render();
    openPanel('dev');
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

// Loads the newest save that still fits today's content, or starts a timeline.
async function loadGame() {
  saves = await openSaves();
  let snap = { current: null, previous: null, damaged: false };
  try { snap = await saves.load(); } catch { /* treated as no save */ }
  revision = snap.current?.revision || 0;
  let problem = null;
  let fromCurrent = false;
  for (const c of [snap.current, snap.previous].filter(Boolean)) {
    const r = reconcile(c.state, content);
    if (r.state) {
      state = r.state;
      fromCurrent = c === snap.current;
      problem = fromCurrent ? null : 'Your last save was damaged, so the one before it was loaded.';
      break;
    }
    problem ||= r.problem;
  }
  if (!state && snap.damaged) problem ||= 'Your save was damaged, so a new timeline has started.';
  if (!state) {
    const seed = params.get('seed');
    state = newGame(content, seed != null ? { seed: Number(seed) || seed } : {});
  }
  if (problem) banner(problem, 9000);
  // A save loaded as-is isn't written back: opening a second tab to look
  // shouldn't make the first one stale.
  if (!fromCurrent) await persist();
}

function bindInput() {
  bindSwipe(els.bench, {
    canStart: (e) => !busy && !conflict && state.phase === 'play' && els.panel.hidden && e.timeStamp >= sceneShownAt,
    onMove: (dx, dy, threshold) => {
      if (Math.abs(dx) > 4) { els.bench.classList.remove('wiggle'); els.hand.classList.remove('show'); }
      els.bench.style.transition = 'none';
      setBenchTransform(dx);
      if (Math.abs(dx) > 14) preview(dx < 0 ? 'left' : 'right', (Math.abs(dx) - 8) / (threshold * 0.7));
      else preview(null);
    },
    onCancel: springBack,
    onCommit: (side) => commit(side, 'swipe'),
  });
  // The answer buttons: a press has to start after this scene appeared
  for (const button of [els.left, els.right]) {
    let downAt = -1;
    button.addEventListener('pointerdown', (e) => { downAt = e.timeStamp; });
    button.addEventListener('click', (e) => {
      if (e.detail > 0 && downAt < sceneShownAt) return; // a finger still down from the last scene
      commit(button.dataset.side, 'tap');
    });
    button.addEventListener('pointerenter', () => { if (!busy && state.phase === 'play') preview(button.dataset.side); });
    button.addEventListener('pointerleave', () => { if (!busy) preview(null); });
  }
  bindTap(els.screen, proceed);
  els.screen.addEventListener('scroll', quietText, { passive: true });
  els.situation.addEventListener('scroll', quietText, { passive: true });
  els.menuBtn.addEventListener('click', () => { if (!busy) openPanel(); });
  els.panel.addEventListener('click', onPanelClick);

  document.addEventListener('keydown', async (e) => {
    if (!els.panel.hidden) { if (e.key === 'Escape') closePanel(); return; }
    if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return; // one press, one answer
    if (state.phase !== 'play') {
      if (['Enter', ' ', 'ArrowRight', 'ArrowLeft'].includes(e.key)) { e.preventDefault(); proceed(); }
      return;
    }
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !busy && !conflict) {
      e.preventDefault();
      const side = e.key === 'ArrowLeft' ? 'left' : 'right';
      busy = true;
      els.bench.classList.remove('wiggle');
      els.hand.classList.remove('show');
      if (!settings.reduceMotion) {
        els.bench.style.transition = 'transform 140ms ease-out';
        setBenchTransform(side === 'left' ? -60 : 60);
      }
      preview(side);
      await wait(360);
      busy = false;
      commit(side, 'key');
    }
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (!busy) render(); }, 150);
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
  if (DEV && loaded.warnings.length) console.warn('Content warnings', loaded.warnings);

  fx = createFx($('fx'), { onShake: () => { if (!settings.reduceMotion) shake(); } });
  setGlyph($('menuIcon'), 'ui', 'menu');
  els.hand.src = artURL('ui', 'hand');
  $('favicon').href = artURL('objects', 'vessel/fired-pot');
  // Fetch every picture up front, so nothing arrives late mid-life and the
  // service worker has them all for playing offline.
  const urls = new Set();
  for (const c of Object.values(content.characters)) if (c.portrait) urls.add(artURL('characters', c.portrait));
  for (const era of Object.values(content.eras)) urls.add(artURL('benches', era.bench));
  urls.add(artURL('benches', 'exhibit'));
  for (const [project, looks] of Object.entries(content.looks)) for (const look of Object.keys(looks)) urls.add(artURL('objects', `${project}/${look}`));
  for (const mark of Object.keys(content.marks || {})) urls.add(artURL('overlays', mark));
  for (const url of urls) new Image().src = url;

  await loadGame();
  bindInput();
  render({ enter: true });
  document.fonts?.ready.then(quietText);
}

boot();
