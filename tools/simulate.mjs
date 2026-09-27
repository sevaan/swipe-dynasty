#!/usr/bin/env node
// Balance bot (spec 18.3): node tools/simulate.mjs [--runs 300] [--lives 6] [--policy random|cautious|reckless|discovery|legacy|refuse]
// Plays whole timelines with the real engine and reports life length, failure
// and danger rates, repeated scenes, callback delays and stalls. The
// "discovery" policy peeks at hidden recipes: it's a diagnostic, not a player.
import { advance, choose, newGame, view } from '../src/engine/game.js';
import { loadContent } from './load-node.mjs';

const arg = (name, d) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const RUNS = Number(arg('runs', 300));
const LIVES = Number(arg('lives', 6));
const POLICY = arg('policy', 'random');

const { content, errors } = loadContent();
if (!content || errors.some((e) => !/No picture/.test(e.message))) {
  console.log('Content has errors; run node tools/check.mjs');
  process.exit(1);
}

let coin = 12345;
const rand = () => { coin = (coin * 1103515245 + 12345) % 2147483648; return coin / 2147483648; };

const needs = (s) => {
  const p = content.projects[s.life.project];
  return new Set(p.outcomes.flatMap((o) => content.inventions[o]?.recipe.flat() || []).filter((o) => !s.life.observed.includes(o)));
};
const gains = (s, side) => s.life.current.def.options[side].ops.filter((op) => op.t === 'observe').map((op) => op.id);

const POLICIES = {
  random: () => (rand() < 0.5 ? 'left' : 'right'),
  cautious: (s, v) => (v.options.left.danger === v.options.right.danger ? (rand() < 0.5 ? 'left' : 'right') : v.options.left.danger < v.options.right.danger ? 'left' : 'right'),
  reckless: (s, v) => (v.options.left.danger === v.options.right.danger ? (rand() < 0.5 ? 'left' : 'right') : v.options.left.danger > v.options.right.danger ? 'left' : 'right'),
  discovery: (s, v) => {
    const want = needs(s);
    const score = (side) => gains(s, side).filter((o) => want.has(o)).length * 10 - (v.options[side].fatal ? 100 : 0) - v.options[side].danger;
    return score('left') >= score('right') ? 'left' : 'right';
  },
  legacy: (s, v) => {
    // Always pick an answer that sets or changes the legacy, when there is one
    const sets = (side) => s.life.current.def.options[side].ops.some((op) => op.t === 'legacy');
    if (sets('left') !== sets('right')) return sets('left') ? 'left' : 'right';
    return POLICIES.cautious(s, v);
  },
  refuse: (s, v) => {
    // Deliberately avoid evidence, to see how failure and stalls play out
    const want = needs(s);
    const score = (side) => -gains(s, side).filter((o) => want.has(o)).length * 10 - (v.options[side].fatal ? 100 : 0);
    return score('left') >= score('right') ? 'left' : 'right';
  },
};
const policy = POLICIES[POLICY];
if (!policy) { console.log(`No policy "${POLICY}". Try: ${Object.keys(POLICIES).join(', ')}`); process.exit(1); }

const stats = { lives: 0, byProject: {}, results: {}, danger: 0, lengths: [], callbackAt: [], repeats: 0, stalls: 0, ends: 0, diagnostics: {} };
for (let run = 1; run <= RUNS; run++) {
  let s = newGame(content, { seed: run });
  let lives = 0;
  let seenThisTimeline = new Set();
  let callbackAt = null;
  for (let step = 0; step < 2000 && lives < LIVES && s.phase !== 'end'; step++) {
    if (s.phase !== 'play') { s = advance(s, content, { turn: s.turn }).state; continue; }
    const cur = s.life.current;
    if (cur.def.phase === 'callback' && callbackAt == null) callbackAt = s.life.invest + 1;
    if (s.life.decisions === 0) seenThisTimeline = new Set([...seenThisTimeline]);
    const v = view(s, content);
    const r = choose(s, content, { side: policy(s, v), scene: cur.id, turn: s.turn });
    s = r.state;
    const death = r.events.find((e) => e.type === 'death');
    if (!death) continue;
    const rec = death.record;
    lives += 1;
    stats.lives += 1;
    const p = (stats.byProject[rec.project] ||= { lives: 0, made: 0, failed: 0, danger: 0, decisions: 0 });
    p.lives += 1;
    p.decisions += rec.decisions;
    if (rec.result.kind === 'invention') p.made += 1; else p.failed += 1;
    if (rec.death.kind === 'danger') { p.danger += 1; stats.danger += 1; }
    stats.results[rec.result.id] = (stats.results[rec.result.id] || 0) + 1;
    stats.lengths.push(rec.decisions);
    if (rec.life > 1 && callbackAt != null) stats.callbackAt.push(callbackAt);
    callbackAt = null;
    if (s.timeline.stall >= content.tuning.stallLives) stats.stalls += 1;
  }
  if (s.phase === 'end') stats.ends += 1;
  for (const d of s.diagnostics) stats.diagnostics[d.message] = (stats.diagnostics[d.message] || 0) + 1;
}

const avg = (xs) => (xs.length ? (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(1) : '-');
const pct = (n, d) => (d ? `${Math.round((100 * n) / d)}%` : '-');
console.log(`${RUNS} timelines, policy "${POLICY}", up to ${LIVES} lives each: ${stats.lives} lives`);
console.log(`Life length: ${avg(stats.lengths)} decisions (min ${Math.min(...stats.lengths)}, max ${Math.max(...stats.lengths)})`);
console.log(`Danger deaths: ${pct(stats.danger, stats.lives)} of lives`);
for (const [id, p] of Object.entries(stats.byProject)) {
  console.log(`  ${id}: ${p.lives} lives, ${pct(p.made, p.lives)} invented, ${pct(p.failed, p.lives)} failed, ${pct(p.danger, p.lives)} danger deaths, ${(p.decisions / p.lives).toFixed(1)} decisions`);
}
console.log(`Results: ${Object.entries(stats.results).map(([k, n]) => `${k} ${n}`).join(', ')}`);
console.log(`Callbacks: in ${stats.callbackAt.length} later lives, at decision ${avg(stats.callbackAt)} on average (latest ${stats.callbackAt.length ? Math.max(...stats.callbackAt) : '-'})`);
console.log(`Timelines that ran out of written content: ${stats.ends}. Lives that ended stalled: ${stats.stalls}.`);
const diag = Object.entries(stats.diagnostics);
console.log(diag.length ? `Diagnostics:\n${diag.map(([m, n]) => `  ${n} x ${m}`).join('\n')}` : 'Diagnostics: none');
