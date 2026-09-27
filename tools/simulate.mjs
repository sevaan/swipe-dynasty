#!/usr/bin/env node
// Plays many histories and reports how they went: which future each
// history's interests ranked first, which route it took, how long it ran,
// and which lives closed with a risk obituary.
//   node tools/simulate.mjs [--runs 500] [--policy random|left|right|risky|careful] [--accept 0.4]
// --accept is the chance of taking a proposal when it's offered (the last
// offer always takes one of its two). The redirect after U3 goes either way.
import { loadContent } from './load-node.mjs';
import { act, newHistory } from '../src/engine/campaign.js';

const args = process.argv.slice(2);
const opt = (name, d) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : d; };
const runs = Number(opt('runs', 500));
const policy = opt('policy', 'random');
const accept = Number(opt('accept', 0.4));

const { content, errors } = loadContent();
if (errors.length) { console.error(`${errors.length} content errors; run node tools/check.mjs`); process.exit(1); }
const C = content.campaign;

let seed = 1;
const rand = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

function side(id) {
  const card = C.cards[id];
  switch (policy) {
    case 'left': return 'left';
    case 'right': return 'right';
    case 'risky': return (card.right.danger || 0) > (card.left.danger || 0) ? 'right' : (card.left.danger || 0) > (card.right.danger || 0) ? 'left' : rand() < 0.5 ? 'left' : 'right';
    case 'careful': return (card.right.danger || 0) < (card.left.danger || 0) ? 'right' : (card.left.danger || 0) < (card.right.danger || 0) ? 'left' : rand() < 0.5 ? 'left' : 'right';
    default: return rand() < 0.5 ? 'left' : 'right';
  }
}

const tally = { first: {}, route: {}, ending: {}, lives: {}, cards: {}, risk: {}, redirected: 0 };
const bump = (o, k) => { o[k] = (o[k] || 0) + 1; };

for (let r = 0; r < runs; r++) {
  let s = newHistory(C);
  let cards = 0;
  for (let step = 0; step < 5000 && s.view !== 'credits'; step++) {
    let action = { type: 'continue' };
    if (s.view === 'choice') { const id = C.chapters[s.chapterId].cards[s.cardIndex].id; action = { type: 'choose', card: id, side: side(id) }; cards += 1; }
    else if (s.view === 'proposal') {
      if (s.proposalIndex === 0) bump(tally.first, s.proposalOrder[0]);
      const last = s.proposalOrder.length - 2;
      action = { type: 'offer', side: s.proposalIndex >= last ? (rand() < 0.5 ? 'left' : 'right') : rand() < accept ? 'left' : 'right' };
    } else if (s.view === 'redirect') action = { type: 'redirect', side: rand() < 0.5 ? 'left' : 'right' };
    const res = act(s, C, { ...action, turn: s.turn });
    if (res.events.some((e) => e.type === 'rejected')) throw new Error(`rejected at ${s.view} ${s.chapterId}: ${res.events[0].reason}`);
    for (const e of res.events) if (e.type === 'ending-seen') bump(tally.ending, e.route);
    s = res.state;
  }
  if (s.view !== 'credits') throw new Error(`history ${r} didn't finish`);
  bump(tally.route, s.redirectedFromUnmaking ? 'unmaking, then retirement' : s.route);
  if (s.redirectedFromUnmaking) tally.redirected += 1;
  bump(tally.lives, s.lives.length);
  bump(tally.cards, cards);
  for (const [ch, which] of Object.entries(s.obituaries)) if (which === 'risk') bump(tally.risk, ch);
}

const pct = (n) => `${Math.round((100 * n) / runs)}%`;
const list = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${pct(v)}`).join(', ');
console.log(`${runs} histories, policy "${policy}", accepting an offer ${Math.round(accept * 100)}% of the time`);
console.log(`Ranked first by interests: ${list(tally.first)}`);
console.log(`Route taken: ${list(tally.route)}`);
console.log(`Ending seen: ${list(tally.ending)}`);
console.log(`Lives per history: ${list(tally.lives)}; decision cards: ${list(tally.cards)}`);
console.log(`Risk obituaries: ${Object.keys(tally.risk).length ? list(tally.risk) : 'none'} (reachable in ${C.chapterOrder.filter((id) => C.chapters[id].death.risk).join(', ')})`);
