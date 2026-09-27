// Shared test helpers: the real content, and a driver that plays the
// campaign with a policy, the way a player would.
import { loadContent } from '../tools/load-node.mjs';
import { act, newHistory } from '../src/engine/campaign.js';

export const real = loadContent();
export const C = real.content.campaign;

export function step(state, action) {
  const res = act(state, C, { ...action, turn: state.turn });
  if (res.events.some((e) => e.type === 'rejected')) throw new Error(`rejected ${JSON.stringify(action)} at ${state.view} ${state.chapterId}.${state.cardIndex + 1}: ${res.events[0].reason}`);
  return res;
}

// Plays until `until(state)` holds (or the credits). The policy answers
// cards, offers and the redirect: policy({ kind, id, state }) -> 'left' | 'right'.
export function drive(state, policy, { until = () => false, max = 2000, onStep = () => {} } = {}) {
  let s = state;
  let checkpoint = null;
  const events = [];
  for (let i = 0; i < max; i++) {
    if (until(s) || s.view === 'credits') return { state: s, checkpoint, events };
    let action;
    if (s.view === 'choice') action = { type: 'choose', card: C.chapters[s.chapterId].cards[s.cardIndex].id, side: policy({ kind: 'card', id: C.chapters[s.chapterId].cards[s.cardIndex].id, state: s }) };
    else if (s.view === 'proposal') action = { type: 'offer', side: policy({ kind: 'offer', id: `OFFER.${s.proposalIndex}`, state: s }) };
    else if (s.view === 'redirect') action = { type: 'redirect', side: policy({ kind: 'redirect', id: C.redirect.id, state: s }) };
    else action = { type: 'continue' };
    const res = step(s, action);
    if (res.checkpoint) checkpoint = res.checkpoint;
    events.push(...res.events);
    onStep(s, action, res);
    s = res.state;
  }
  throw new Error(`didn't finish in ${max} steps (at ${s.view} ${s.chapterId})`);
}

export const always = (side) => () => side;

// Accepts the given route whenever it's offered, and otherwise hears another
// proposal; answers cards with `cards` (a side or a function of the card id).
export function routeTo(route, cards = 'left', redirect = 'left') {
  return ({ kind, id, state }) => {
    if (kind === 'card') return typeof cards === 'function' ? cards(id) : cards;
    if (kind === 'redirect') return redirect;
    const p = state.proposalOrder;
    const last = p.length - 2;
    if (state.proposalIndex < last) return p[state.proposalIndex] === route ? 'left' : 'right';
    return p[last] === route ? 'left' : 'right';
  };
}

export const fresh = () => newHistory(C);
