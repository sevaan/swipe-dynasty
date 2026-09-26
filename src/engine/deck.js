// Chooses the next card, Reigns-style: forced scene cards first, then a due
// breakthrough trigger, then a weighted draw from the era's bag with recently
// seen cards and over-used speakers removed. Soft rules relax before the deck
// ever runs dry; hard conditions never do.

import { conditionsHold } from './rules.js';
import { pickWeighted, randInt } from './rng.js';

const REST = {
  id: '__rest', era: '', type: 'script', speaker: 'narrator', weight: 1,
  text: 'Nothing happens. It is almost restful.',
  cond: { all: [], once: false, repeat: true },
  trigger: null, epitaph: '',
  left: { label: 'Enjoy it', ops: [], uses: [] },
  right: { label: 'Worry anyway', ops: [], uses: [] },
  src: { file: '(built in)', line: 0 },
};

export function getCard(content, id) {
  return content.cards[id] || (id === REST.id ? REST : null);
}

function tune(content, key, fallback) {
  const v = content.tuning?.[key];
  return typeof v === 'number' ? v : fallback;
}

function diagnose(state, events, message) {
  state.diagnostics.push(message);
  if (state.diagnostics.length > 20) state.diagnostics.shift();
  events.push({ type: 'diagnostic', message });
}

export function inventionReady(state, content, invId) {
  const inv = content.inventions[invId];
  const { life, timeline } = state;
  if (!inv || inv.type === 'bad' || life.made) return false;
  if (inv.era !== life.era) return false;
  if (timeline.history.includes(invId) || life.suppressed.includes(invId)) return false;
  if (!inv.requires.every((r) => timeline.history.includes(r))) return false;
  return (life.points[invId] || 0) >= inv.threshold;
}

function usableTriggers(state, content, invId) {
  return (content.triggersByInvention[invId] || [])
    .map((id) => content.cards[id])
    .filter((c) => c.era === state.life.era && conditionsHold(c.cond, state, content))
    .filter((c) => !(c.cond.once && state.timeline.seen[c.id]));
}

// After each resolved card: queue at most one eligible breakthrough, to be
// shown within the next `triggerWindow` draws.
export function refreshTriggerQueue(state, content) {
  const { life } = state;
  if (life.made || life.queue) return;
  if (life.cards < tune(content, 'minCardsBeforeBreakthrough', 6)) return;
  let best = null;
  for (const id of content.inventionOrder) {
    if (!inventionReady(state, content, id)) continue;
    if (!usableTriggers(state, content, id).length) continue;
    const ratio = (life.points[id] || 0) / content.inventions[id].threshold;
    if (!best || ratio > best.ratio) best = { id, ratio };
  }
  if (!best) return;
  const card = pickWeighted(state, usableTriggers(state, content, best.id), (c) => c.weight).id;
  const due = life.cards + randInt(state, 1, tune(content, 'triggerWindow', 3));
  life.queue = { inv: best.id, card, due, queuedAt: life.cards };
}

function speakerOk(state, content, card, spacing) {
  const who = content.characters[card.speaker];
  const cap = who?.perLife;
  if (cap != null && (state.life.speakers[card.speaker] || 0) >= cap) return false;
  if (spacing && card.speaker !== 'narrator' && card.speaker === state.life.lastSpeaker) return false;
  return true;
}

// Hard rules (conditions, once, speaker caps) always apply. The soft ones,
// relaxed in this order when the pool is empty: unseen this life, not in the
// last few cards, and no speaker twice in a row. The card just played never
// repeats immediately.
function bag(state, content, { fresh, recent, spacing }) {
  const { life } = state;
  const last = life.recent[life.recent.length - 1];
  return (content.bagByEra[life.era] || [])
    .map((id) => content.cards[id])
    .filter((c) => conditionsHold(c.cond, state, content))
    .filter((c) => !(c.cond.once && state.timeline.seen[c.id]))
    .filter((c) => c.id !== last && !(recent && life.recent.includes(c.id)))
    .filter((c) => !(fresh && !c.cond.repeat && c.id in life.seen))
    .filter((c) => speakerOk(state, content, c, spacing));
}

export function present(state, content, id, how) {
  const card = getCard(content, id);
  const { life, timeline } = state;
  const n = life.cards + 1;
  life.current = {
    card: id, n, how,
    trigger: card.type === 'trigger' && inventionReady(state, content, card.trigger.inv),
  };
  life.seen[id] = n;
  timeline.seen[id] = true;
  life.recent.push(id);
  while (life.recent.length > tune(content, 'recentCards', 6)) life.recent.shift();
  life.speakers[card.speaker] = (life.speakers[card.speaker] || 0) + 1;
  life.lastSpeaker = card.speaker;
}

export function drawNext(state, content, events) {
  const { life } = state;
  const n = life.cards + 1;

  if (life.next) {
    const id = life.next;
    life.next = null;
    const card = getCard(content, id);
    if (card && conditionsHold(card.cond, state, content)) {
      if (life.queue && life.queue.due <= n) life.queue.due += 1; // scenes pause the trigger clock
      present(state, content, id, 'next');
      return;
    }
    diagnose(state, events, `Forced card "${id}" was missing or ineligible; drew normally`);
  }

  if (life.queue && life.queue.due <= n) {
    const q = life.queue;
    const card = content.cards[q.card];
    if (card && inventionReady(state, content, q.inv) && conditionsHold(card.cond, state, content)) {
      life.stats.triggerDelays.push(n - q.queuedAt);
      present(state, content, q.card, 'trigger');
      return;
    }
    life.queue = null;
    diagnose(state, events, `Queued trigger "${q.card}" stopped being valid; dropped it`);
  }

  const tries = [
    { fresh: true, recent: true, spacing: true },
    { fresh: false, recent: true, spacing: true },
    { fresh: false, recent: true, spacing: false },
    { fresh: false, recent: false, spacing: false },
  ];
  for (let i = 0; i < tries.length; i++) {
    const pool = bag(state, content, tries[i]);
    if (pool.length) {
      if (i > 0) life.stats.relaxed += 1;
      present(state, content, pickWeighted(state, pool, (c) => c.weight).id, 'bag');
      return;
    }
  }

  const era = content.eras[life.era];
  const fb = era?.fallback && content.cards[era.fallback];
  life.stats.fallbacks += 1;
  diagnose(state, events, `Deck ran dry in ${life.era} on card ${n}; used the fallback card`);
  present(state, content, fb && conditionsHold(fb.cond, state, content) ? fb.id : REST.id, 'fallback');
}
