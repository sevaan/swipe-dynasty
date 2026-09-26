#!/usr/bin/env node
// Simulation bot: node tools/simulate.mjs --runs 2000 --policy random
// Plays whole timelines with the real engine and reports how they went.
// "survival" and "seeker" read hidden effects, so they're diagnostic bots,
// not models of real players.
import { loadContent } from './load-node.mjs';
import { advance, choose, newGame } from '../src/engine/game.js';
import { getCard } from '../src/engine/deck.js';
import { random } from '../src/engine/rng.js';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => {
  if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]);
  return acc;
}, []));
const RUNS = Number(args.runs || 500);
const MAX_LIVES = Number(args.lives || 80);
const POLICY = args.policy || 'random';
const SEED = Number(args.seed || 1);

const { content, errors } = loadContent();
if (errors.length) { console.error(`Content has ${errors.length} errors; run node tools/check.mjs`); process.exit(1); }

function sideRisk(state, side) {
  const m = { ...state.life.meters };
  for (const op of side.ops) if (op.t === 'meter') m[op.role] = op.op === '=' ? op.n : m[op.role] + op.n;
  return Math.max(...Object.values(m).map((v) => Math.abs(v - 50)));
}

function sidePoints(state, side) {
  return side.ops.filter((o) => o.t === 'points').reduce((s, o) => s + o.n, 0);
}

const policies = {
  random: (state, card, bot) => (random(bot) < 0.5 ? 'left' : 'right'),
  survival: (state, card, bot) => {
    const l = sideRisk(state, card.left);
    const r = sideRisk(state, card.right);
    if (l === r) return random(bot) < 0.5 ? 'left' : 'right';
    return l < r ? 'left' : 'right';
  },
  // A rough stand-in for a person: mostly careful, drawn to answers that
  // embrace an idea, sometimes impulsive. On a trigger card it picks the
  // answer that fits its leaning 65% of the time (an assumption about how
  // well the writing telegraphs it, not a measurement).
  human: (state, card, bot) => {
    if (card.type === 'trigger') return random(bot) < 0.65 ? card.trigger.side : (card.trigger.side === 'left' ? 'right' : 'left');
    if (random(bot) < 0.3) return random(bot) < 0.5 ? 'left' : 'right';
    const l = sideRisk(state, card.left) - sidePoints(state, card.left) * 3;
    const r = sideRisk(state, card.right) - sidePoints(state, card.right) * 3;
    if (l === r) return random(bot) < 0.5 ? 'left' : 'right';
    return l < r ? 'left' : 'right';
  },
  seeker: (state, card, bot) => {
    if (card.type === 'trigger') return card.trigger.side;
    const l = sidePoints(state, card.left) - sideRisk(state, card.left) / 25;
    const r = sidePoints(state, card.right) - sideRisk(state, card.right) / 25;
    if (l === r) return random(bot) < 0.5 ? 'left' : 'right';
    return l > r ? 'left' : 'right';
  },
};
const pick = policies[POLICY];
if (!pick) { console.error(`Unknown policy ${POLICY}; try random, survival or seeker`); process.exit(1); }

const stats = {
  lives: 0, cards: [], breakthroughs: 0, byKind: {}, deaths: {}, triggerDelays: [], fallbacks: 0,
  relaxed: 0, eraLives: {}, reachedEnd: 0, stalled: 0, invariant: [],
  afterBreakthrough: [], tutorialOk: 0,
};
const eraLivesAll = {};

for (let run = 0; run < RUNS; run++) {
  let state = newGame(content, { seed: SEED * 100003 + run });
  const bot = { rng: (SEED * 7919 + run) >>> 0 };
  let steps = 0;
  let madeAt = null;
  while (state.collection.archive.length < MAX_LIVES && steps < 20000) {
    steps += 1;
    if (state.phase === 'play') {
      const card = getCard(content, state.life.current.card);
      const side = pick(state, card, bot);
      const hadMade = !!state.life.made;
      const res = choose(state, content, { side, card: card.id, turn: state.turn });
      if (res.events.some((e) => e.type === 'rejected')) { stats.invariant.push(`rejected input run ${run}`); break; }
      state = res.state;
      if (!hadMade && state.life?.made && state.phase === 'play') madeAt = state.life.cards;
      const death = res.events.find((e) => e.type === 'death');
      if (death) {
        const r = death.record;
        const life = res.state.life;
        stats.lives += 1;
        stats.cards.push(r.cards);
        if (r.breakthrough) stats.breakthroughs += 1;
        if (r.breakthrough && madeAt != null) stats.afterBreakthrough.push(r.cards - madeAt);
        madeAt = null;
        stats.byKind[r.kind] = (stats.byKind[r.kind] || 0) + 1;
        stats.deaths[r.death] = (stats.deaths[r.death] || 0) + 1;
        stats.triggerDelays.push(...life.stats.triggerDelays);
        stats.fallbacks += life.stats.fallbacks;
        stats.relaxed += life.stats.relaxed;
        if (!r.inv) stats.invariant.push(`life with no invention (run ${run})`);
        if (r.life === 1 && r.inv === 'sparks' && r.cards === 8) stats.tutorialOk += 1;
        if (r.keystone) {
          const inv = content.inventions[r.inv];
          const hist = state.timeline.history;
          const at = hist.indexOf(r.inv);
          for (const req of inv.requires) {
            const reqAt = hist.indexOf(req);
            if (reqAt < 0 || reqAt >= at) stats.invariant.push(`keystone ${r.inv} without earlier ${req} (run ${run})`);
          }
          eraLivesAll[r.era] = eraLivesAll[r.era] || [];
          eraLivesAll[r.era].push(state.collection.archive.filter((a) => a.era === r.era).length);
        }
      }
    } else if (state.phase === 'end') {
      stats.reachedEnd += 1;
      break;
    } else {
      state = advance(state, content, { turn: state.turn }).state;
    }
  }
  if (state.phase !== 'end') stats.stalled += 1;
  if (new Set(state.timeline.history).size !== state.timeline.history.length) stats.invariant.push(`duplicate history (run ${run})`);
}

const avg = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
const pct = (a, p) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const dist = (a) => `avg ${avg(a).toFixed(1)}, median ${pct(a, 0.5)}, 90th ${pct(a, 0.9)}, max ${a.length ? Math.max(...a) : 0}`;

console.log(`Policy: ${POLICY}, ${RUNS} timelines, up to ${MAX_LIVES} lives each\n`);
console.log(`Lives played:            ${stats.lives}`);
console.log(`Cards per life:          ${dist(stats.cards)}`);
console.log(`Breakthrough rate:       ${((stats.breakthroughs / stats.lives) * 100).toFixed(1)}% of lives`);
console.log(`Cards after breakthrough: ${dist(stats.afterBreakthrough)}`);
console.log(`Contributions by kind:   ${Object.entries(stats.byKind).map(([k, v]) => `${k} ${v}`).join(', ')}`);
console.log(`Trigger delay (draws):   ${dist(stats.triggerDelays)}`);
for (const [era, lives] of Object.entries(eraLivesAll)) {
  console.log(`Lives to finish ${era.padEnd(10)} ${dist(lives)}  (${lives.length} of ${RUNS} timelines)`);
}
console.log(`Reached the end:         ${stats.reachedEnd} of ${RUNS} (stopped at the life cap: ${stats.stalled})`);
console.log(`Tutorial as designed:    ${stats.tutorialOk} of ${RUNS} (8 cards, sparks)`);
console.log(`Fallback draws:          ${stats.fallbacks}; relaxed draws: ${stats.relaxed}`);
console.log('Deaths:');
for (const [d, n] of Object.entries(stats.deaths).sort((a, b) => b[1] - a[1])) console.log(`  ${d.padEnd(20)} ${n}`);
if (stats.invariant.length) {
  console.log(`\nINVARIANT FAILURES (${stats.invariant.length}):`);
  for (const f of stats.invariant.slice(0, 20)) console.log(`  ${f}`);
  process.exit(1);
}
console.log('\nInvariants held: one invention per life, keystones only after earlier-life stepping stones, no duplicate history.');
