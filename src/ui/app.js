// Browser orchestration: load content and the save, draw the current moment,
// turn swipes into engine actions, save, then animate.
import { loadContentWeb } from '../content/load-web.js';
import { advance, choose, devAction, eraView, inventionName, newGame, view } from '../engine/game.js';
import { bindSwipe, bindTap } from './input.js';
import { clearSave, loadSave, loadSettings, parseSave, saveSettings, writeSave } from './storage.js';
import { setSprite, spriteBounds, spriteHTML, spriteSize, spriteURL } from './sprites.js';
import { createFx } from './fx.js';

const $ = (id) => document.getElementById(id);
const els = {
  meters: $('meters'), question: $('question'), card: $('card'), answer: $('answer'),
  portrait: $('portrait'), speaker: $('speaker'), hand: $('hand'), screen: $('screen'),
  who: $('who'), menuBtn: $('menuBtn'), panel: $('panel'), banner: $('banner'), live: $('live'),
};
const params = new URLSearchParams(location.search);
const DEV = params.has('dev');

let content = null;
let state = null;
let settings = loadSettings();
let busy = false;
let meterEra = null;
let saveWarned = false;
let currentTab = 'museum';
let fx = null;
let devScene = '';
let timelapse = 0;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const wait = (ms) => new Promise((r) => setTimeout(r, settings.reduceMotion ? Math.min(ms, 60) : ms));

function banner(text, ms = 5000) {
  els.banner.textContent = text;
  els.banner.hidden = false;
  clearTimeout(banner.t);
  banner.t = setTimeout(() => { els.banner.hidden = true; }, ms);
}

function persist() {
  if (!writeSave(state) && !saveWarned) {
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
// card or death sets a scene. A scene with its own sky replaces the time of
// day's effects; one without adds its effects to them.
function applyScene(v) {
  let bg = v.sky?.bg || v.era.theme.bg;
  let effects = [...(v.sky?.fx || [])];
  const scene = devScene ? content.scenes[devScene] : v.scene;
  if (scene?.bg) { bg = scene.bg; effects = [...scene.fx]; }
  else if (scene) effects.push(...scene.fx);

  clearInterval(timelapse);
  timelapse = 0;
  if (v.phase === 'transition' && v.transition && !devScene) {
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
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', bg);
  fx?.set([...new Set(effects)], { reduceMotion: settings.reduceMotion, enabled: settings.effects !== false });
}

function shake() {
  const app = $('app');
  app.classList.remove('shake');
  void app.offsetWidth;
  app.classList.add('shake');
  setTimeout(() => app.classList.remove('shake'), 500);
}

function level(value) {
  if (value <= 15) return 'nearly empty';
  if (value <= 35) return 'low';
  if (value < 65) return 'steady';
  if (value < 85) return 'high';
  return 'nearly full';
}

// Meters

function buildMeters(v) {
  els.meters.innerHTML = v.meters.map((m) => `
    <div class="meter" data-role="${m.role}">
      <div class="dot-slot"><div class="dot"></div></div>
      <div class="icon" aria-hidden="true"><img class="px ghost" alt="" draggable="false"><img class="px fill" alt="" draggable="false"></div>
      <div class="label">${esc(m.label)}</div>
    </div>`).join('');
  const box = els.meters.querySelector('.icon').clientWidth || 48;
  for (const m of v.meters) {
    const el = els.meters.querySelector(`[data-role="${m.role}"]`);
    const scale = Math.max(1, Math.floor(box / spriteSize(content, m.icon).w));
    setSprite(el.querySelector('.ghost'), content, m.icon, scale, 'ghost');
    setSprite(el.querySelector('.fill'), content, m.icon, scale);
  }
  meterEra = v.era.id;
}

function updateMeters(v) {
  if (meterEra !== v.era.id) buildMeters(v);
  for (const m of v.meters) {
    const el = els.meters.querySelector(`[data-role="${m.role}"]`);
    const icon = el.querySelector('.icon');
    // Fill whole pixel rows, over the rows of the icon that are drawn.
    const { top, bottom, h } = spriteBounds(content, m.icon);
    const filled = Math.round((m.value / 100) * (bottom - top + 1));
    icon.style.setProperty('--empty', `${((bottom + 1 - filled) / h) * 100}%`);
    icon.classList.toggle('danger', m.value <= 15 || m.value >= 85);
    el.classList.toggle('unlit', !m.lit);
    el.setAttribute('aria-label', `${m.label}: ${level(m.value)}`);
  }
}

function showDots(dots) {
  const sizes = Object.fromEntries((dots || []).map((d) => [d.role, d.size]));
  for (const el of els.meters.querySelectorAll('.meter')) {
    el.querySelector('.dot').dataset.size = sizes[el.dataset.role] || '';
  }
}

function pulseMeters(events) {
  for (const e of events) {
    const el = els.meters.querySelector(`[data-role="${e.role}"]`);
    if (!el) continue;
    if (e.type === 'meter') {
      const icon = el.querySelector('.icon');
      icon.classList.remove('up', 'down');
      void icon.offsetWidth;
      icon.classList.add(e.to > e.from ? 'up' : 'down');
    }
    if (e.type === 'lit') {
      el.classList.add('just-lit');
      setTimeout(() => el.classList.remove('just-lit'), 1000);
    }
  }
}

// Card

function setCardTransform(dx, dy = 0) {
  const rot = Math.max(-18, Math.min(18, dx / 12));
  els.card.style.transform = `translate(${dx}px, ${Math.max(-20, Math.min(40, dy * 0.2)) + Math.abs(dx) * 0.06}px) rotate(${rot}deg)`;
}

function previewSide(side, strength = 1) {
  const v = view(state, content);
  if (!side || !v.card) {
    els.answer.style.opacity = 0;
    showDots([]);
    return;
  }
  const a = v.card[side];
  const uses = a.uses.map((inv) => `<span class="uses pxc">${spriteHTML(content, content.inventions[inv]?.icon, { scale: 1 })}${esc(cap(inventionName(content, inv)))}</span>`).join('');
  const label = `<span>${esc(a.label || '…')}</span>`;
  els.answer.className = `answer ${side}`;
  els.answer.innerHTML = side === 'left'
    ? `${spriteHTML(content, 'ui-arrow-left', { scale: 2 })}${label}${uses}`
    : `${uses}${label}${spriteHTML(content, 'ui-arrow-right', { scale: 2 })}`;
  els.answer.style.opacity = Math.min(1, strength);
  showDots(a.dots);
}

function showCard(v, { enter = false, tell = false } = {}) {
  const c = v.card;
  els.card.hidden = false;
  els.card.style.transition = 'none';
  els.card.style.transform = '';
  els.card.style.opacity = '';
  els.question.textContent = c.text || '';
  setSprite(els.portrait, content, c.speaker.portrait, portraitScale(c.speaker.portrait));
  els.speaker.textContent = c.speaker.name;
  els.card.setAttribute('aria-label', `${c.speaker.name || 'Card'}. ${c.text || ''}`);
  previewSide(null);
  els.card.classList.remove('enter', 'wiggle', 'tell');
  void els.card.offsetWidth;
  if (enter) els.card.classList.add('enter');
  if (tell) els.card.classList.add('tell');
  if (c.hint) els.card.classList.add('wiggle');
  els.hand.classList.toggle('show', !!c.hint);
  const left = c.left.label || 'something';
  const right = c.right.label || 'something';
  els.live.textContent = `${c.speaker.name ? `${c.speaker.name}: ` : ''}${c.text || '(no words)'} Swipe left: ${left}. Swipe right: ${right}.`;
}

function portraitScale(id) {
  const { w, h } = spriteSize(content, id);
  const cardW = els.card.clientWidth || 280;
  const room = cardW * 1.25 - 110; // card height minus the answer band and name
  return Math.max(2, Math.min(9, Math.floor(Math.min((cardW * 0.64) / w, room / h))));
}

async function flyOut(side) {
  const w = window.innerWidth;
  els.card.style.transition = settings.reduceMotion ? 'opacity 80ms linear' : 'transform 260ms ease-in, opacity 260ms ease-in';
  if (settings.reduceMotion) els.card.style.opacity = 0;
  else els.card.style.transform = `translate(${side === 'left' ? -w : w}px, 60px) rotate(${side === 'left' ? -28 : 28}deg)`;
  await wait(250);
}

function springBack() {
  els.card.style.transition = 'transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1.2)';
  els.card.style.transform = '';
  previewSide(null);
}

// Screens: epitaph, centuries pass, end of this build

const KIND = { keystone: 'Keystone', stepping: 'Stepping stone', bad: 'Bad idea' };

function screenHTML(v) {
  if (v.phase === 'epitaph' && v.pending) {
    const r = v.pending;
    const era = eraView(content, r.era);
    const tags = [
      `<span class="tag pxc ${r.kind}">${r.again ? 'Reinvented' : KIND[r.kind] || 'Invention'}</span>`,
      r.newFind ? '<span class="tag pxc new">New in the Museum</span>' : '',
      r.newDeath ? '<span class="tag pxc">New in the Graveyard</span>' : '',
    ].join(' ');
    return `
      <p class="scene">${esc(r.deathText)}</p>
      <div class="stone">
        ${r.inv ? spriteHTML(content, content.inventions[r.inv]?.icon, { scale: 3, alt: inventionName(content, r.inv) }) : ''}
        <div class="rip">HERE LIES</div>
        <div class="name">${esc(r.name)}</div>
        <div class="epitaph">${esc(r.epitaph)}</div>
        <div class="meta">${esc(era.name)} · life ${r.eraLife} · ${r.cards} cards</div>
      </div>
      <div class="tags">${tags}</div>
      <div class="continue">Tap to continue</div>`;
  }
  if (v.phase === 'transition' && v.transition) {
    const t = v.transition;
    return `
      <p class="big">Centuries pass.</p>
      <p class="scene">${esc(t.to.intro)}</p>
      <p class="era-name">${esc(t.to.name)}</p>
      <p class="fine">Your ancestors left you</p>
      <div class="carried">${t.carried.map((c) => `<span class="tag pxc">${spriteHTML(content, c.icon, { scale: 1 })}${esc(cap(c.name))}</span>`).join('')}</div>
      <div class="continue">Tap to begin</div>`;
  }
  if (v.phase === 'end') {
    return `
      <p class="big">To be continued.</p>
      <p class="scene">The plough changed everything. Then this build ran out of history. The Bronze Age is still being written.</p>
      <div class="continue">Tap to keep farming</div>`;
  }
  return '';
}

function render(opts = {}) {
  const v = view(state, content);
  applyTheme(v.phase === 'transition' && v.transition ? v.transition.to.theme : v.era.theme);
  applyScene(v);
  updateMeters(v);
  const life = v.life;
  els.who.innerHTML = life
    ? `<strong>${esc(life.name)}</strong> · ${esc(v.era.name)}<br>Life ${life.eraLife} of this era · ${life.cards} ${life.cards === 1 ? 'card' : 'cards'}`
    : esc(v.era.name);
  if (v.phase === 'play' && v.card) {
    els.screen.hidden = true;
    $('deck').hidden = false;
    showCard(v, opts);
  } else {
    els.question.textContent = '';
    els.hand.classList.remove('show');
    $('deck').hidden = true;
    previewSide(null);
    els.screen.innerHTML = screenHTML(v);
    els.screen.hidden = false;
    if (v.phase === 'epitaph' && v.pending) els.live.textContent = `Here lies ${v.pending.name}. ${v.pending.epitaph}`;
    if (v.phase === 'transition') els.live.textContent = `Centuries pass. ${v.transition?.to.name}.`;
  }
  quietText();
  if (DEV) renderDevButton();
}

// Tells the weather where the words are, so it thins out behind them.
function quietText() {
  if (!fx) return;
  const pad = (r, x, y) => ({ left: r.left - x, top: r.top - y, right: r.right + x, bottom: r.bottom + y });
  const boxes = [...els.meters.querySelectorAll('.label')].map((el) => pad(el.getBoundingClientRect(), 4, 2));
  if (!$('deck').hidden && els.question.textContent) {
    const range = document.createRange();
    range.selectNodeContents(els.question);
    boxes.push(pad(range.getBoundingClientRect(), 12, 8));
  }
  if (!els.screen.hidden) {
    for (const el of els.screen.querySelectorAll('.scene, .big, .era-name, .fine, .tags, .carried, .continue')) boxes.push(pad(el.getBoundingClientRect(), 12, 6));
  }
  fx.setQuiet(boxes);
}

// Actions

async function commit(side) {
  if (busy || state.phase !== 'play') return;
  busy = true;
  const v = view(state, content);
  const res = choose(state, content, { side, card: v.card.id, turn: v.turn });
  if (res.events.some((e) => e.type === 'rejected')) { busy = false; springBack(); return; }
  state = res.state;
  persist();
  await flyOut(side);
  const after = view(state, content);
  updateMeters(after);
  pulseMeters(res.events);
  const died = res.events.some((e) => e.type === 'death');
  if (died) {
    els.card.style.opacity = 0;
    els.question.textContent = '';
    await wait(700);
  }
  render({ enter: true, tell: res.events.some((e) => e.type === 'tell') });
  busy = false;
}

function proceed() {
  if (busy || state.phase === 'play') return;
  const res = advance(state, content, { turn: state.turn });
  if (res.events.some((e) => e.type === 'rejected')) return;
  state = res.state;
  persist();
  render({ enter: true });
}

// Menu panel: Museum, Graveyard, Family Tree, Settings (and Dev)

function museumHTML() {
  const found = state.collection.found;
  const all = content.inventionOrder.map((id) => content.inventions[id]);
  const count = all.filter((i) => found[i.id]).length;
  let html = `<p class="summary">${count} of ${all.length} inventions found.</p>`;
  for (const eraId of content.eraOrder) {
    html += `<h3>${esc(content.eras[eraId].name)}</h3>`;
    for (const inv of all.filter((i) => i.era === eraId)) {
      html += found[inv.id]
        ? `<div class="item pxc"><div class="glyph">${spriteHTML(content, inv.icon, { scale: 2 })}</div><div class="title">${esc(cap(inv.name))} <span class="tag pxc ${inv.type}">${KIND[inv.type]}</span></div><div class="body">${esc(inv.museum)}</div></div>`
        : `<div class="item pxc locked"><div class="glyph">${spriteHTML(content, inv.icon, { scale: 2, mode: 'ghost', cls: 'ghost' })}</div><div class="title">???</div><div class="body">“${esc(inv.hint)}” <span class="by">(the Naysayer)</span></div></div>`;
    }
  }
  html += `<h3>Endings</h3><div class="item pxc locked"><div class="glyph">${spriteHTML(content, 'ui-door', { scale: 2, mode: 'ghost', cls: 'ghost' })}</div><div class="title">A locked door</div><div class="body">None of the endings are built yet.</div></div>`;
  return html;
}

function graveyardHTML() {
  const seen = state.collection.deaths;
  const all = Object.values(content.deaths);
  let html = `<p class="summary">${all.filter((d) => seen[d.id]).length} of ${all.length} deaths found.</p>`;
  for (const eraId of content.eraOrder) {
    const era = content.eras[eraId];
    html += `<h3>${esc(era.name)}</h3>`;
    for (const d of all.filter((x) => x.era === eraId)) {
      const how = d.role ? `${era.meters[d.role].label} too ${d.end}` : 'Something you did';
      html += seen[d.id]
        ? `<div class="item pxc"><div class="glyph">${spriteHTML(content, 'ui-grave', { scale: 2 })}</div><div class="title">${esc(d.epitaph)}${seen[d.id] > 1 ? ` ×${seen[d.id]}` : ''}</div><div class="body">${esc(d.text)}</div></div>`
        : `<div class="item pxc locked"><div class="glyph">${spriteHTML(content, 'ui-grave', { scale: 2, mode: 'ghost', cls: 'ghost' })}</div><div class="title">???</div><div class="body">${esc(how)}</div></div>`;
    }
  }
  return html;
}

function familyHTML() {
  const lives = [...state.collection.archive].reverse();
  if (!lives.length) return '<p class="summary">Nobody has died yet. Give it a minute.</p>';
  let html = `<p class="summary">${lives.length} ${lives.length === 1 ? 'life' : 'lives'}, newest first.</p>`;
  for (const r of lives) {
    const glyph = spriteHTML(content, content.inventions[r.inv]?.icon, { scale: 2 });
    html += `<div class="item pxc"><div class="glyph">${glyph}</div><div class="title">${esc(r.name)} · ${esc(content.eras[r.era]?.name || r.era)} · life ${r.eraLife}</div><div class="body">${esc(r.epitaph)}</div></div>`;
  }
  return html;
}

function buildStamp() {
  const d = new Date(document.lastModified);
  return Number.isNaN(d.getTime()) ? 'unknown' : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function settingsHTML() {
  const sizes = [[0.9, 'S'], [1, 'M'], [1.15, 'L'], [1.3, 'XL']];
  return `
    <div class="row pxc"><span>Text size</span><span class="seg">${sizes.map(([s, l]) => `<button class="pxc" type="button" data-scale="${s}" aria-pressed="${settings.scale === s}">${l}</button>`).join('')}</span></div>
    <div class="row pxc"><span>Weather effects</span><span class="seg"><button class="pxc" type="button" data-effects="off" aria-pressed="${settings.effects === false}">Off</button><button class="pxc" type="button" data-effects="on" aria-pressed="${settings.effects !== false}">On</button></span></div>
    <div class="row pxc"><span>Reduce motion</span><span class="seg"><button class="pxc" type="button" data-motion="off" aria-pressed="${!settings.reduceMotion}">Off</button><button class="pxc" type="button" data-motion="on" aria-pressed="${!!settings.reduceMotion}">On</button></span></div>
    <h3>Your save</h3>
    <p class="fine">Saves stay in this browser only. To move one to another device, copy it here and paste it there.</p>
    <div class="dev-actions"><button class="btn pxc" type="button" data-act="copy">Copy save</button><button class="btn pxc" type="button" data-act="load">Load pasted save</button></div>
    <textarea class="save-box" id="saveBox" placeholder="Paste a save here, then tap Load pasted save" spellcheck="false"></textarea>
    <h3>Start over</h3>
    <p class="fine">Wipes every life, the Museum and the Graveyard.</p>
    <button class="btn pxc danger" type="button" data-act="reset">Start over</button>
    <h3>About</h3>
    <p class="fine">Build ${esc(buildStamp())} · content ${esc(content.hash)} · seed ${esc(state.seed)}<br>
    ${DEV ? '<a href="./">Leave dev mode</a>' : '<a href="?dev">Dev mode</a>'}</p>`;
}

function devHTML() {
  const l = state.life || {};
  const inv = content.inventionOrder.map((id) => `<option value="${id}">${id}</option>`).join('');
  const eras = content.eraOrder.map((id) => `<option value="${id}">${id}</option>`).join('');
  const dump = {
    turn: state.turn, phase: state.phase, seed: state.seed,
    era: state.timeline.era, life: l.n, eraLife: l.eraLife, card: l.current?.card, cards: l.cards,
    meters: l.meters, points: l.points, made: l.made, queue: l.queue, suppressed: l.suppressed,
    history: state.timeline.history, timelineFlags: state.timeline.flags, lifeFlags: l.flags,
    diagnostics: state.diagnostics.slice(-5),
  };
  return `
    <div class="dev-actions">
      <button class="btn pxc" type="button" data-dev="kill">Kill this life</button>
      <select id="devInv">${inv}</select>
      <button class="btn pxc" type="button" data-dev="points">+5 points</button>
      <button class="btn pxc" type="button" data-dev="grant">Grant</button>
      <select id="devEra">${eras}</select>
      <button class="btn pxc" type="button" data-dev="era">Jump to era</button>
      <select id="devScene"><option value="">(card's own scene)</option>${Object.keys(content.scenes).map((id) => `<option value="${id}"${id === devScene ? ' selected' : ''}>${id}</option>`).join('')}</select>
      <button class="btn pxc" type="button" data-act="scene">Preview scene</button>
    </div>
    <div class="dev">${esc(JSON.stringify(dump, null, 1))}</div>`;
}

function openPanel(tab = currentTab) {
  currentTab = tab;
  const tabs = [['museum', 'Museum'], ['graveyard', 'Graveyard'], ['family', 'Family'], ['settings', 'Settings']];
  if (DEV) tabs.push(['dev', 'Dev']);
  const body = { museum: museumHTML, graveyard: graveyardHTML, family: familyHTML, settings: settingsHTML, dev: devHTML }[tab]();
  els.panel.innerHTML = `
    <div class="panel-head"><h2>${esc(tabs.find((t) => t[0] === tab)[1])}</h2><button class="close-btn pxc" type="button" data-act="close" aria-label="Close">${spriteHTML(content, 'ui-close', { scale: 2 })}</button></div>
    <div class="tabs" role="tablist" style="grid-template-columns: repeat(${tabs.length}, 1fr)">${tabs.map(([id, label]) => `<button class="pxc" type="button" role="tab" data-tab="${id}" aria-selected="${id === tab}">${label}</button>`).join('')}</div>
    <div class="panel-body">${body}</div>`;
  els.panel.hidden = false;
  fx?.setPaused(true);
}

function closePanel() {
  els.panel.hidden = true;
  fx?.setPaused(document.hidden);
  render();
}

els.panel.addEventListener('click', async (e) => {
  const t = e.target.closest('button');
  if (!t) return;
  if (t.dataset.tab) return openPanel(t.dataset.tab);
  if (t.dataset.scale) { settings.scale = Number(t.dataset.scale); saveSettings(settings); applySettings(); return openPanel('settings'); }
  if (t.dataset.motion) { settings.reduceMotion = t.dataset.motion === 'on'; saveSettings(settings); applySettings(); return openPanel('settings'); }
  if (t.dataset.effects) { settings.effects = t.dataset.effects === 'on'; saveSettings(settings); return openPanel('settings'); }
  const act = t.dataset.act;
  if (act === 'close') return closePanel();
  if (act === 'scene') { devScene = $('devScene').value; return closePanel(); }
  if (act === 'copy') {
    const box = $('saveBox');
    box.value = JSON.stringify(state);
    box.select();
    try { await navigator.clipboard.writeText(box.value); banner('Save copied.'); } catch { banner('Select the text and copy it.'); }
    return;
  }
  if (act === 'load') {
    const res = parseSave($('saveBox').value.trim(), content);
    if (!res.state) return banner(`That save didn't load: ${res.problem}.`);
    state = res.state;
    persist();
    banner('Save loaded.');
    return closePanel();
  }
  if (act === 'reset') {
    if (!confirm('Start over? Every life, the Museum and the Graveyard will be wiped.')) return;
    clearSave();
    state = newGame(content);
    persist();
    return closePanel();
  }
  if (t.dataset.dev) {
    const inv = $('devInv')?.value;
    const era = $('devEra')?.value;
    const res = devAction(state, content, { kind: t.dataset.dev, inv, era });
    state = res.state;
    persist();
    return openPanel('dev');
  }
});

function renderDevButton() {
  if (document.querySelector('.dev-btn')) return;
  const b = document.createElement('button');
  b.className = 'dev-btn pxc';
  b.type = 'button';
  b.textContent = 'DEV';
  b.setAttribute('aria-label', 'Dev panel');
  b.addEventListener('click', () => openPanel('dev'));
  document.body.appendChild(b);
}

// Boot

function showErrors(errors) {
  document.body.innerHTML = `<div class="errors"><strong>The content has ${errors.length} error${errors.length === 1 ? '' : 's'}, so the game can't start.</strong>\n\n${errors
    .map((e) => `${esc(e.file)}${e.line ? `:${e.line}` : ''}${e.column ? ` [${esc(e.column)}]` : ''}\n  ${esc(e.message)}`).join('\n\n')}</div>`;
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
  fx = createFx($('fx'), { colors: content.palette, onShake: () => { if (!settings.reduceMotion) shake(); } });
  setSprite($('menuIcon'), content, 'ui-menu', 2);
  setSprite(els.hand, content, 'ui-hand', 3);
  $('favicon').href = spriteURL(content, 'fire');
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (!busy) { meterEra = null; render(); } }, 150);
  });

  const saved = loadSave(content);
  const seed = params.get('seed');
  state = saved.state || newGame(content, seed != null ? { seed: Number(seed) || seed } : {});
  if (saved.problem) banner(saved.problem, 9000);
  persist();
  render({ enter: true });
  // The web font can arrive after the first draw and move the words
  document.fonts?.ready.then(quietText);
  document.fonts?.addEventListener?.('loadingdone', quietText);

  bindSwipe(els.card, {
    canStart: () => !busy && state.phase === 'play' && els.panel.hidden,
    onMove: (dx, dy, threshold) => {
      if (Math.abs(dx) > 4) { els.card.classList.remove('wiggle'); els.hand.classList.remove('show'); }
      els.card.style.transition = 'none';
      setCardTransform(dx, dy);
      if (Math.abs(dx) > 18) previewSide(dx < 0 ? 'left' : 'right', (Math.abs(dx) - 10) / (threshold * 0.6));
      else previewSide(null);
    },
    onCancel: springBack,
    onCommit: commit,
  });
  bindTap(els.screen, proceed);
  els.menuBtn.addEventListener('click', () => { if (!busy) openPanel(); });

  document.addEventListener('keydown', async (e) => {
    if (!els.panel.hidden) { if (e.key === 'Escape') closePanel(); return; }
    if (state.phase !== 'play') {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); proceed(); }
      return;
    }
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !busy && !e.repeat) {
      const side = e.key === 'ArrowLeft' ? 'left' : 'right';
      busy = true; // one key press, one answer
      els.card.classList.remove('wiggle');
      els.hand.classList.remove('show');
      els.card.style.transition = 'transform 140ms ease-out';
      setCardTransform(side === 'left' ? -70 : 70);
      previewSide(side);
      await wait(420);
      busy = false;
      commit(side);
    }
  });
}

boot();
