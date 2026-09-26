// The game state machine. Everything that changes the game goes through
// newGame, choose or advance; each takes a state and returns a new one plus
// events for the UI to animate. No DOM, no clock, no Math.random: the same
// seed and the same swipes always give the same game.

import { applyEffects, conditionsHold } from './rules.js';
import { drawNext, getCard, inventionReady, present, refreshTriggerQueue } from './deck.js';
import { random, seedFrom } from './rng.js';

export const SAVE_VERSION = 1;
const ROLE_ORDER = ['people', 'resources', 'belief', 'power'];

const clone = (x) => (typeof structuredClone === 'function' ? structuredClone(x) : JSON.parse(JSON.stringify(x)));
const tune = (content, key, fallback) => (typeof content.tuning?.[key] === 'number' ? content.tuning[key] : fallback);

export function inventionName(content, id) {
  return content.inventions[id]?.name || 'nothing in particular';
}

function pickName(state, content, era) {
  const names = content.eras[era].names;
  let unused = names.filter((n) => !state.timeline.names.includes(n));
  if (!unused.length) { state.timeline.names = []; unused = names; }
  const name = unused[Math.floor(random(state) * unused.length)];
  state.timeline.names.push(name);
  return name;
}

function startLife(state, content, events) {
  const { timeline } = state;
  const era = content.eras[timeline.era];
  const start = tune(content, 'startMeter', 50);
  state.life = {
    n: timeline.lives + 1,
    eraLife: timeline.eraLives + 1,
    era: era.id,
    name: pickName(state, content, era.id),
    meters: Object.fromEntries(ROLE_ORDER.map((r) => [r, start])),
    cards: 0,
    seen: {}, recent: [], speakers: {}, lastSpeaker: null,
    points: {}, made: null, suppressed: [], queue: null,
    flags: {}, next: null, current: null, uses: [],
    stats: { triggerDelays: [], fallbacks: 0, relaxed: 0 },
  };
  state.phase = 'play';
  state.pending = null;
  state.transition = null;

  if (timeline.lives === 0 && era.id === content.start.era && content.cards[content.start.card]) {
    present(state, content, content.start.card, 'start');
  } else if (era.opener && !timeline.openers[era.id] && content.cards[era.opener]) {
    timeline.openers[era.id] = true;
    present(state, content, era.opener, 'opener');
  } else {
    drawNext(state, content, events);
  }
  events.push({ type: 'life', name: state.life.name, era: era.id, n: state.life.n });
}

export function newGame(content, { seed } = {}) {
  const s = seed ?? Math.floor(Math.random() * 2 ** 32);
  const state = {
    save: SAVE_VERSION,
    content: content.hash,
    seed: s,
    rng: seedFrom(s),
    turn: 0,
    phase: 'play',
    timeline: {
      n: 1, era: content.start.era, lives: 0, eraLives: 0,
      history: [], flags: {}, seen: {}, names: [], openers: {}, done: false,
    },
    life: null,
    collection: { found: {}, deaths: {}, flags: {}, meters: {}, archive: [] },
    pending: null,
    transition: null,
    diagnostics: [],
  };
  startLife(state, content, []);
  return state;
}

// Which meter killed you, if any. Ties go to the bigger overshoot, then role order.
function terminal(state) {
  let worst = null;
  const causes = [];
  for (const role of ROLE_ORDER) {
    const v = state.life.meters[role];
    let over = null;
    if (v <= 0) over = { role, end: 'low', by: -v };
    if (v >= 100) over = { role, end: 'high', by: v - 100 };
    if (over) {
      causes.push(over);
      if (!worst || over.by > worst.by) worst = over;
    }
  }
  return worst ? { ...worst, causes } : null;
}

// Dying without a breakthrough gives a bad idea, leaning toward what this
// life earned points for. Never a stepping stone or keystone (proposal P1).
function fallbackBadIdea(state, content) {
  const bad = content.inventionOrder.map((id) => content.inventions[id])
    .filter((i) => i.era === state.life.era && i.type === 'bad');
  if (!bad.length) return { inv: null, again: false };
  const fresh = bad.filter((i) => !state.timeline.history.includes(i.id));
  const pool = fresh.length ? fresh : bad;
  const pts = state.life.points;
  const score = (i) => (pts[i.id] || 0) + i.related.reduce((sum, r) => sum + (pts[r] || 0), 0);
  const top = Math.max(...pool.map(score));
  const best = pool.filter((i) => score(i) === top);
  const pick = best.length === 1 ? best[0] : best[Math.floor(random(state) * best.length)];
  return { inv: pick.id, again: fresh.length === 0 };
}

function finishLife(state, content, deathId, cause, events) {
  const { life, timeline, collection } = state;
  const era = content.eras[life.era];
  let inv;
  let again = false;
  let line;
  if (life.made) {
    inv = life.made.inv;
    line = life.made.epitaph || `Invented ${inventionName(content, inv)}.`;
  } else {
    ({ inv, again } = fallbackBadIdea(state, content));
    line = `Invented ${inventionName(content, inv)}${again ? ', again' : ''}.`;
  }
  const death = content.deaths[deathId] || { id: deathId, text: 'You died.', epitaph: 'Died.' };
  const kind = content.inventions[inv]?.type || 'bad';

  const record = {
    i: collection.archive.length + 1,
    timeline: timeline.n, life: life.n, eraLife: life.eraLife, era: life.era,
    name: life.name, inv, again, kind,
    breakthrough: !!life.made,
    death: death.id, cause, cards: life.cards,
    line, epitaph: `${line} ${death.epitaph}`.trim(), deathText: death.text,
    keystone: !!inv && inv === era.keystone && !again,
    newFind: false, newDeath: false,
  };
  if (inv && !again && !timeline.history.includes(inv)) timeline.history.push(inv);
  if (inv && !collection.found[inv]) { collection.found[inv] = { first: record.i }; record.newFind = true; }
  if (!collection.deaths[death.id]) record.newDeath = true;
  collection.deaths[death.id] = (collection.deaths[death.id] || 0) + 1;
  collection.archive.push(record);
  timeline.lives += 1;
  timeline.eraLives += 1;

  state.pending = record;
  state.phase = 'epitaph';
  life.current = null;
  life.queue = null;
  events.push({ type: 'death', record });
}

function reject(state, reason) {
  return { state, events: [{ type: 'rejected', reason }] };
}

// Resolves one swipe, atomically (see design-notes.md, Implementation notes):
// effects, then a breakthrough, then death, then the next card.
export function choose(prev, content, action) {
  if (prev.phase !== 'play' || !prev.life?.current) return reject(prev, 'not playing');
  if (action.turn !== prev.turn || action.card !== prev.life.current.card) return reject(prev, 'stale input');
  if (action.side !== 'left' && action.side !== 'right') return reject(prev, 'bad side');

  const state = clone(prev);
  const events = [];
  const { life, collection } = state;
  const card = getCard(content, life.current.card);
  const offer = life.current;
  const res = applyEffects(card[action.side].ops, state, content, events);
  life.cards += 1;

  for (const e of [...events]) {
    if (e.type === 'meter' && !collection.meters[e.role]) {
      collection.meters[e.role] = true;
      events.push({ type: 'lit', role: e.role });
    }
  }

  // A breakthrough commits before death is checked, so a fatal one still counts.
  if (!life.made) {
    let inv = null;
    if (res.invent) inv = res.invent;
    else if (card.type === 'trigger' && offer.trigger) {
      if (action.side === card.trigger.side) inv = card.trigger.inv;
      else life.suppressed.push(card.trigger.inv);
    }
    if (inv) {
      life.made = { inv, card: card.id, epitaph: card.epitaph };
      if (random(state) < tune(content, 'tellChance', 0.5)) events.push({ type: 'tell' });
    }
  }
  if (card.type === 'trigger') life.queue = null;

  const t = res.die ? null : terminal(state);
  if (res.die || t) {
    const deathId = res.die || content.deathIndex[life.era]?.[t.role]?.[t.end];
    finishLife(state, content, deathId, t ? { role: t.role, end: t.end, all: t.causes } : { scripted: res.die }, events);
    state.turn += 1;
    return { state, events };
  }

  if (res.next) life.next = res.next;
  refreshTriggerQueue(state, content);
  drawNext(state, content, events);
  state.turn += 1;
  return { state, events };
}

// Moves past the epitaph or the "Centuries pass" screen.
export function advance(prev, content, action = {}) {
  if (action.turn != null && action.turn !== prev.turn) return reject(prev, 'stale input');
  const state = clone(prev);
  const events = [];
  const { timeline } = state;

  if (state.phase === 'epitaph') {
    const record = state.pending;
    const era = content.eras[timeline.era];
    if (record?.keystone && era.next && content.eras[era.next]) {
      state.transition = { from: era.id, to: era.next, keystone: record.inv };
      timeline.era = era.next;
      timeline.eraLives = 0;
      timeline.names = [];
      state.phase = 'transition';
      state.pending = null;
      events.push({ type: 'era', from: era.id, to: era.next });
    } else if (record?.keystone && !era.next) {
      timeline.done = true;
      state.phase = 'end';
      state.pending = null;
      events.push({ type: 'end' });
    } else {
      startLife(state, content, events);
    }
  } else if (state.phase === 'transition' || state.phase === 'end') {
    startLife(state, content, events);
  } else {
    return reject(prev, 'nothing to advance');
  }
  state.turn += 1;
  return { state, events };
}

function dotSize(content, delta) {
  const d = Math.abs(delta);
  const dots = content.tuning?.dots || {};
  if (d <= (dots.small ?? 6)) return 1;
  if (d <= (dots.medium ?? 12)) return 2;
  return 3;
}

function previewSide(state, content, side) {
  const deltas = {};
  for (const op of side.ops) {
    if (op.t !== 'meter') continue;
    const cur = state.life.meters[op.role] + (deltas[op.role] || 0);
    deltas[op.role] = (deltas[op.role] || 0) + (op.op === '=' ? op.n - cur : op.n);
  }
  return {
    label: side.label,
    dots: Object.entries(deltas).filter(([, d]) => d !== 0).map(([role, d]) => ({ role, size: dotSize(content, d) })),
    uses: side.uses.filter((inv) => state.timeline.history.includes(inv)),
  };
}

export function eraView(content, eraId) {
  const era = content.eras[eraId];
  return {
    id: era.id, name: era.name, when: era.when, intro: era.intro, theme: era.theme,
    meters: ROLE_ORDER.map((role) => ({ role, ...era.meters[role] })),
  };
}

// Everything the UI needs to draw the current moment, and nothing hidden
// (no invention points, no trigger flags).
export function view(state, content) {
  const eraId = state.life?.era || state.timeline.era;
  const era = eraView(content, eraId);
  const out = {
    phase: state.phase,
    turn: state.turn,
    era,
    meters: era.meters.map((m) => ({
      ...m,
      value: state.life ? Math.max(0, Math.min(100, state.life.meters[m.role])) : 50,
      lit: !!state.collection.meters[m.role],
    })),
    life: state.life && { n: state.life.n, eraLife: state.life.eraLife, name: state.life.name, cards: state.life.cards },
    card: null,
    pending: state.pending,
    transition: null,
  };
  if (state.phase === 'play' && state.life?.current) {
    const card = getCard(content, state.life.current.card);
    const who = content.characters[card.speaker] || { name: '', portrait: '?' };
    out.card = {
      id: card.id,
      speaker: { id: card.speaker, name: who.name, portrait: who.portrait },
      text: card.text,
      left: previewSide(state, content, card.left),
      right: previewSide(state, content, card.right),
      hint: card.id === content.start.card && state.timeline.lives === 0,
    };
  }
  if (state.phase === 'transition' && state.transition) {
    out.transition = {
      from: eraView(content, state.transition.from),
      to: eraView(content, state.transition.to),
      carried: state.timeline.history.map((id) => ({ id, name: inventionName(content, id), icon: content.inventions[id]?.icon || id })),
    };
  }
  return out;
}

// A save made with older content: keep everything valid, redraw a card that
// no longer exists, and drop inventions the content no longer has.
export function reconcile(saved, content) {
  const state = clone(saved);
  const events = [];
  state.timeline.history = state.timeline.history.filter((id) => content.inventions[id]);
  if (!content.eras[state.timeline.era]) state.timeline.era = content.start.era;
  if (state.life && !content.eras[state.life.era]) {
    state.life = null;
    startLife(state, content, events);
  }
  if (state.phase === 'play' && state.life?.current && !getCard(content, state.life.current.card)) {
    state.life.current = null;
    drawNext(state, content, events);
  }
  if (state.phase === 'play' && !state.life?.current) startLife(state, content, events);
  state.content = content.hash;
  return state;
}

// Developer shortcuts for testing on a phone (?dev). They bend the rules on
// purpose, so the normal game never calls them.
export function devAction(prev, content, action) {
  const state = clone(prev);
  const events = [];
  const { timeline, life } = state;
  switch (action.kind) {
    case 'grant':
      if (content.inventions[action.inv] && !timeline.history.includes(action.inv)) {
        timeline.history.push(action.inv);
        state.collection.found[action.inv] ||= { first: 0 };
      }
      break;
    case 'points':
      if (life) life.points[action.inv] = (life.points[action.inv] || 0) + (action.n || 5);
      break;
    case 'kill':
      if (state.phase === 'play' && life) {
        const deathId = content.deathIndex[life.era]?.people?.low;
        finishLife(state, content, deathId, { role: 'people', end: 'low', dev: true }, events);
      }
      break;
    case 'era':
      if (content.eras[action.era]) {
        timeline.era = action.era;
        timeline.eraLives = 0;
        timeline.names = [];
        if (timeline.lives === 0) timeline.lives = 1; // skip the tutorial
        startLife(state, content, events);
      }
      break;
    default:
      return reject(prev, 'unknown dev action');
  }
  state.turn += 1;
  return { state, events };
}

export { conditionsHold, inventionReady };
