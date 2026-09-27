// The rules that must always hold (spec 18.1), and recorded traces for the
// scenarios in 18.2. Everything runs the real engine, headless.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { advance, choose, devAction, newGame, reconcile, view } from '../src/engine/game.js';
import { loadContent } from '../tools/load-node.mjs';
import { act, fixture, kit, nextLife, playLife } from './helpers.mjs';

const real = loadContent();
const content = real.content;

const deepFreeze = (o) => { Object.freeze(o); for (const v of Object.values(o)) if (v && typeof v === 'object' && !Object.isFrozen(v)) deepFreeze(v); return o; };

test('the real content compiles with no errors', () => {
  assert.deepEqual(real.errors.map((e) => `${e.file}:${e.line} ${e.message}`), []);
});

test('every gameplay scene offers exactly two outcomes', () => {
  for (const s of Object.values(content.scenes)) {
    assert.ok(s.options.left.label && s.options.right.label, s.id);
    assert.deepEqual(Object.keys(s.options).sort(), ['left', 'right'], s.id);
  }
});

test('the same seed and the same choices give the same game', () => {
  const run = () => {
    let s = newGame(content, { seed: 42 });
    for (let i = 0; i < 30; i++) {
      s = s.phase === 'play' ? choose(s, content, act(s, i % 3 ? 'left' : 'right')).state : advance(s, content, { turn: s.turn }).state;
      if (s.phase === 'end') break;
    }
    return s;
  };
  assert.deepEqual(run(), run());
});

test('all 256 tutorial branches make pottery in eight choices, alive, with the legacy the last choice picked', () => {
  let branches = 0;
  for (let bits = 0; bits < 256; bits++) {
    let s = newGame(content, { seed: bits });
    const sides = [];
    for (let i = 0; i < 8; i++) {
      assert.equal(s.phase, 'play', `branch ${bits} ended early at choice ${i + 1}`);
      const side = (bits >> i) & 1 ? 'right' : 'left';
      sides.push(side);
      s = choose(s, content, act(s, side)).state;
    }
    assert.equal(s.phase, 'epitaph', `branch ${bits} didn't end after eight choices`);
    const rec = s.pending;
    assert.equal(rec.result.id, 'pottery');
    assert.equal(rec.death.kind, 'natural', `branch ${bits} died of danger`);
    assert.equal(rec.decisions, 8);
    assert.equal(rec.legacy, sides[7] === 'left' ? 'pottery-household' : 'pottery-communal');
    // The exhibit agrees with the legacy (spec 10.2)
    assert.equal(rec.look, sides[7] === 'left' ? 'household-pots' : 'store-jar', `branch ${bits} exhibits ${rec.look}`);
    assert.ok(s.timeline.techs.includes('pottery'));
    branches += 1;
  }
  assert.equal(branches, 256);
});

test('the second life opens on the pottery legacy the first life left (spec 8.6, 10.3)', () => {
  for (const [last, opening] of [['left', 'prov-open-home'], ['right', 'prov-open-store']]) {
    let s = newGame(content, { seed: 7 });
    s = playLife(s, content, (st) => (st.life.decisions === 7 ? last : 'left')).state;
    assert.match(s.pending.inherit, /Because .+ invented fired vessels/);
    s = nextLife(s, content);
    assert.equal(s.life.project, 'provisions');
    assert.equal(s.life.current.id, opening);
    // The opening names who made the pottery, so the link to the last life is explicit
    assert.match(view(s, content).scene.text, new RegExp(`\\b${s.collection.archive[0].name}\\b`));
  }
});

// A sweep of many seeded runs, checking the invariants after every step.
function sweep(policy, runs = 200) {
  const stats = { lives: 0, failures: 0, danger: 0 };
  for (let seed = 1; seed <= runs; seed++) {
    let s = newGame(content, { seed });
    let commits = 0;
    for (let step = 0; step < 300 && s.phase !== 'end'; step++) {
      if (s.phase === 'play') {
        const before = s.collection.archive.length;
        const r = choose(s, content, act(s, policy(s, seed)));
        assert.ok(!r.events.some((e) => e.type === 'rejected'));
        commits += r.events.filter((e) => e.type === 'commit').length;
        assert.ok(commits <= 1, 'a life committed two inventions');
        s = r.state;
        const death = r.events.find((e) => e.type === 'death');
        if (death) {
          assert.equal(s.collection.archive.length, before + 1, 'exactly one contribution per completed life');
          const rec = death.record;
          stats.lives += 1;
          if (rec.result.kind === 'failure') {
            stats.failures += 1;
            assert.ok(!s.timeline.techs.includes(rec.result.id), 'a failed result never grants a technology');
          }
          if (rec.death.kind === 'danger') stats.danger += 1;
          commits = 0;
        } else {
          assert.equal(s.collection.archive.length, before);
        }
      } else {
        assert.equal(s.life?.current ?? null, null, 'no scene waits for input between lives');
        s = advance(s, content, { turn: s.turn }).state;
      }
    }
    // Every technology in the timeline came from a real invention with its prerequisites
    for (const t of s.timeline.techs) {
      const inv = content.inventions[t];
      assert.ok(inv, t);
      const at = s.timeline.techs.indexOf(t);
      for (const r of inv.requires) assert.ok(s.timeline.techs.indexOf(r) >= 0 && s.timeline.techs.indexOf(r) < at, `${t} needs ${r} first`);
    }
    assert.equal(s.collection.archive.length, s.timeline.lives);
  }
  return stats;
}

test('random, cautious and discovery-seeking play keep every invariant', () => {
  const random = sweep((s, seed) => ((s.turn * 7 + seed * 13) % 5 < 2 ? 'right' : 'left'));
  const cautious = sweep((s) => {
    const v = view(s, content);
    return v.options.left.danger <= v.options.right.danger ? 'left' : 'right';
  });
  const reckless = sweep((s) => {
    const v = view(s, content);
    return v.options.left.danger >= v.options.right.danger ? 'left' : 'right';
  }, 80);
  assert.ok(random.lives > 0 && cautious.lives > 0 && reckless.lives > 0);
  assert.equal(cautious.danger, 0, 'a cautious player never dies of danger in this content');
});

test('previewing (drawing the view) never changes the state', () => {
  const s = deepFreeze(newGame(content, { seed: 3 }));
  assert.doesNotThrow(() => view(s, content));
});

test('stale or repeated input is rejected without changing anything', () => {
  const s = newGame(content, { seed: 5 });
  const once = choose(s, content, act(s, 'left'));
  const again = choose(once.state, content, act(s, 'left')); // the old turn and scene
  assert.equal(again.events[0].type, 'rejected');
  assert.equal(again.state, once.state);
  assert.equal(choose(s, content, { side: 'up', scene: s.life.current.id, turn: s.turn }).events[0].type, 'rejected');
});

test('reloading never duplicates a choice, a contribution or a transition', () => {
  let s = newGame(content, { seed: 9 });
  s = playLife(s, content, 'left').state; // at the epitaph
  const saved = JSON.parse(JSON.stringify(s));
  const reloaded = reconcile(saved, content).state;
  assert.equal(reloaded.collection.archive.length, 1);
  const a = advance(reloaded, content, { turn: reloaded.turn });
  const b = advance(a.state, content, { turn: reloaded.turn }); // the same tap, replayed
  assert.equal(b.events[0].type, 'rejected');
  assert.equal(b.state.collection.archive.length, 1);
  // Mid-scene: the waiting scene and the random state come back exactly
  const mid = choose(nextLife(a.state, content), content, act(nextLife(a.state, content), 'left')).state;
  const back = reconcile(JSON.parse(JSON.stringify(mid)), content).state;
  assert.equal(back.life.current.id, mid.life.current.id);
  assert.equal(back.rng, mid.rng);
});

test('a scene keeps its frozen definition across a content update (spec 16.7)', () => {
  const s = newGame(content, { seed: 2 });
  const edited = { ...content, scenes: { ...content.scenes, 'tut-1': { ...content.scenes['tut-1'], text: 'Changed while you were reading' } } };
  const back = reconcile(JSON.parse(JSON.stringify(s)), edited).state;
  assert.notEqual(view(back, edited).scene.text, 'Changed while you were reading');
});

// Fixture traces (spec 18.2)
const fx = fixture();

test('successful proof: evidence, then the invention, then three aftermath choices', () => {
  const { state, events } = playLife(newGame(fx, { seed: 1 }), fx, 'left');
  assert.equal(state.pending.result.id, 'a');
  assert.equal(state.pending.decisions, 2 + 1 + 3);
  assert.deepEqual(events.filter((e) => e.type === 'phase').map((e) => e.phase), ['proof', 'aftermath']);
  assert.ok(state.timeline.techs.includes('a'));
});

test('failed proof: no evidence means a failed design, no technology, and the problem stays', () => {
  const { state } = playLife(newGame(fx, { seed: 1 }), fx, 'right');
  assert.equal(state.pending.result.kind, 'failure');
  assert.equal(state.pending.result.id, 'fa');
  assert.deepEqual(state.timeline.techs, []);
  assert.equal(state.timeline.problem, null);
  const next = nextLife(state, fx);
  assert.equal(next.life.project, 'pa', 'the next inventor takes the same problem on');
  assert.equal(next.timeline.previous.id, 'fa');
});

test('a repeated failure is a reinvention, not a new discovery', () => {
  let s = playLife(newGame(fx, { seed: 1 }), fx, 'right').state;
  s = playLife(nextLife(s, fx), fx, 'right').state;
  assert.equal(s.pending.result.status, 'reinvention');
  assert.match(s.pending.epitaph.made, /again/);
});

test('a fatal proof still leaves the invention behind (spec 7.4)', () => {
  const scenes = [...kit('pa', 'a', { proof: { left: 'commit a; legacy la1; danger +6' } }), ...kit('pb', 'b'), ...kit('pk', 'k'), ...kit('pz', 'z')];
  const f = fixture({ scenes });
  const { state } = playLife(newGame(f, { seed: 1 }), f, 'left');
  assert.equal(state.pending.death.kind, 'danger');
  assert.equal(state.pending.result.id, 'a');
  assert.ok(state.timeline.techs.includes('a'));
  assert.equal(state.pending.legacy, 'la1');
});

test('the Fatal mark shows before the choice, and Danger never goes below zero', () => {
  const scenes = [...kit('pa', 'a', { extra: [] }), ...kit('pb', 'b'), ...kit('pk', 'k'), ...kit('pz', 'z')].map((r) => (r.id === 'pa-open' ? { ...r, 'left effects': 'observe oa; danger +6', 'right effects': 'danger -3' } : r));
  const f = fixture({ scenes });
  const s = newGame(f, { seed: 1 });
  const v = view(s, f);
  assert.equal(v.options.left.fatal, true);
  assert.equal(v.options.right.fatal, false);
  assert.equal(v.options.right.danger, 0, 'dropping below zero shows as no change');
  const r = choose(s, f, act(s, 'right'));
  assert.equal(r.state.life.danger, 0);
});

test('death before proof leaves a failed design; death in the aftermath keeps the invention and a legacy', () => {
  const early = fixture({ scenes: [...kit('pa', 'a'), ...kit('pb', 'b'), ...kit('pk', 'k'), ...kit('pz', 'z')].map((r) => (r.id === 'pa-open' ? { ...r, 'left effects': 'observe oa; danger +6' } : r)) });
  const a = playLife(newGame(early, { seed: 1 }), early, 'left').state;
  assert.equal(a.pending.result.kind, 'failure');
  assert.equal(a.pending.death.kind, 'danger');

  const late = fixture({ scenes: [...kit('pa', 'a', { after: { left1: 'danger +6' } }), ...kit('pb', 'b'), ...kit('pk', 'k'), ...kit('pz', 'z')] });
  const b = playLife(newGame(late, { seed: 1 }), late, 'left').state;
  assert.equal(b.pending.result.id, 'a');
  assert.equal(b.pending.legacy, 'la1', 'the proof picked la1 and nothing replaced it');
  assert.ok(b.timeline.techs.includes('a'));
});

test('legacy replacement: the latest explicit choice wins, and the screen is told', () => {
  let s = newGame(fx, { seed: 1 });
  const seen = [];
  const policy = (st) => {
    seen.push(view(st, fx).scene.notice);
    if (st.life.phase === 'proof') return 'left'; // la1
    if (st.life.phase === 'aftermath') return st.life.after === 0 ? 'right' : 'left'; // la2, then la1
    return 'left';
  };
  s = playLife(s, fx, policy).state;
  assert.equal(s.pending.legacy, 'la1');
  const notices = seen.filter(Boolean);
  assert.ok(notices.some((n) => !n.changed && n.text === 'Adopted a1'), 'the first choice is announced');
  assert.ok(notices.some((n) => n.changed && n.text === 'Adopted a2'), 'a change is announced on the next scene');
  assert.deepEqual(s.pending.notice, { changed: true, text: 'Adopted a1' }, 'a change on the last choice is announced on the epitaph');
});

test('the keystone needs both stepping stones from earlier lives; the era advances only after its inventor is done', () => {
  let s = newGame(fx, { seed: 1 });
  const made = [];
  for (let life = 0; life < 6 && s.phase !== 'end'; life++) {
    const r = playLife(s, fx, 'left');
    made.push(r.state.pending.result.id);
    assert.equal(r.state.timeline.era, 'e1', 'still in e1 at the epitaph');
    s = advance(r.state, fx, { turn: r.state.turn }).state; // to the inheritance line
    assert.equal(s.timeline.era, 'e1');
    if (r.state.pending.result.id === 'k') {
      s = advance(s, fx, { turn: s.turn }).state;
      assert.equal(s.phase, 'transition');
      assert.equal(s.timeline.era, 'e2');
      s = advance(s, fx, { turn: s.turn }).state;
      assert.equal(s.life.project, 'pz');
      break;
    }
    s = advance(s, fx, { turn: s.turn }).state;
  }
  assert.deepEqual(made, ['a', 'b', 'k']);
});

test('the keystone project never opens without its prerequisites in this timeline', () => {
  const s = newGame(fx, { seed: 1 });
  const granted = devAction(s, fx, { kind: 'grant', inv: 'a' }).state;
  // pk requires a and b; with only a, a new life can only take pb
  const afterA = nextLife(playLife(granted, fx, 'right').state, fx);
  assert.notEqual(afterA.life.project, 'pk');
});

test('a follow-up comes next, before anything else (spec 6.3)', () => {
  const scenes = [...kit('pa', 'a', { investigation: '3' }), ...kit('pb', 'b'), ...kit('pk', 'k'), ...kit('pz', 'z')].map((r) => (r.id === 'pa-open' ? { ...r, 'right effects': 'next pa-fill3' } : r));
  const f = fixture({ scenes });
  const s = newGame(f, { seed: 4 });
  const r = choose(s, f, act(s, 'right'));
  assert.equal(r.state.life.current.id, 'pa-fill3');
});

test('after two lives without a required discovery, a missing stepping stone comes first (spec 9.4)', () => {
  const f = fixture({ optional: true });
  const base = newGame(f, { seed: 1 });
  let optionalPicked = 0;
  for (let seed = 1; seed <= 40; seed++) {
    const s = JSON.parse(JSON.stringify(base));
    s.rng = seed * 7919;
    s.phase = 'inherit';
    s.pending = { i: 0, keystone: false };
    s.life.current = null;
    const fresh = advance(s, f, { turn: s.turn }).state;
    if (fresh.life.project === 'po') optionalPicked += 1;
    s.timeline.stall = 2;
    const stalled = advance(s, f, { turn: s.turn }).state;
    assert.equal(stalled.life.project, 'pa', 'a stalled timeline gets the missing stepping stone');
  }
  assert.ok(optionalPicked > 0, 'without a stall, the optional project can come up');
});
