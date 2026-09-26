import { test } from 'node:test';
import assert from 'node:assert/strict';
import { advance, choose, newGame } from '../src/engine/game.js';
import { getCard } from '../src/engine/deck.js';
import { random } from '../src/engine/rng.js';
import { loadContent } from '../tools/load-node.mjs';
import { fixture, sideOf } from './helpers.mjs';

const real = loadContent();

test('the real content compiles with no errors', () => {
  assert.deepEqual(real.errors, []);
});

function play(content, state, steps, bot = { rng: 99 }) {
  for (let i = 0; i < steps; i++) {
    if (state.phase === 'play') state = choose(state, content, sideOf(state, random(bot) < 0.5 ? 'left' : 'right')).state;
    else state = advance(state, content, { turn: state.turn }).state;
  }
  return state;
}

test('the same seed and the same swipes give the same game', () => {
  const a = play(real.content, newGame(real.content, { seed: 7 }), 400);
  const b = play(real.content, newGame(real.content, { seed: 7 }), 400);
  assert.equal(JSON.stringify(a), JSON.stringify(b));
  const c = play(real.content, newGame(real.content, { seed: 8 }), 400);
  assert.notEqual(JSON.stringify(a), JSON.stringify(c));
});

test('all 128 tutorial branches survive to card 8, then die with sparks', () => {
  for (let mask = 0; mask < 128; mask++) {
    let s = newGame(real.content, { seed: mask });
    for (let i = 0; i < 7; i++) {
      s = choose(s, real.content, sideOf(s, mask & (1 << i) ? 'right' : 'left')).state;
      assert.equal(s.phase, 'play', `branch ${mask} died on card ${i + 1}`);
    }
    assert.equal(s.life.current.card, 'tutorial-8');
    const res = choose(s, real.content, sideOf(s, mask % 2 ? 'left' : 'right'));
    const death = res.events.find((e) => e.type === 'death');
    assert.ok(death, `branch ${mask} survived card 8`);
    assert.equal(death.record.inv, 'sparks');
    assert.equal(death.record.cards, 8);
    assert.equal(death.record.death, 'sa-gods-high');
    assert.equal(death.record.epitaph, 'Invented sparks. Promoted.');
  }
});

test('every life adds exactly one invention; keystones only follow earlier-life stepping stones', () => {
  let s = newGame(real.content, { seed: 3 });
  const bot = { rng: 5 };
  let deaths = 0;
  for (let i = 0; i < 20000 && deaths < 300; i++) {
    if (s.phase === 'play') {
      const res = choose(s, real.content, sideOf(s, random(bot) < 0.5 ? 'left' : 'right'));
      s = res.state;
      const d = res.events.find((e) => e.type === 'death');
      if (d) {
        deaths += 1;
        assert.ok(d.record.inv, 'a life ended without an invention');
        if (d.record.keystone) {
          const hist = s.timeline.history;
          for (const req of real.content.inventions[d.record.inv].requires) {
            assert.ok(hist.indexOf(req) >= 0 && hist.indexOf(req) < hist.indexOf(d.record.inv), `${d.record.inv} before ${req}`);
          }
        }
      }
    } else if (s.phase === 'end') {
      s = advance(s, real.content, { turn: s.turn }).state;
    } else {
      s = advance(s, real.content, { turn: s.turn }).state;
    }
  }
  assert.equal(s.collection.archive.length, deaths);
  assert.equal(new Set(s.timeline.history).size, s.timeline.history.length);
});

const baseInventions = [
  's1,test,stepping stone,thing one,,2,',
  'k,test,keystone,the key,s1,2,',
  'bad1,test,bad idea,a bad idea,,,s1',
].join('\n');

const baseCards = [
  'c-start,test,script,guy,Start,L,s1 +5; k +5,R,s1 +5; k +5,,,,',
  'c-filler,test,,guy,Filler,L,C +1,R,C -1,repeat,1,,',
  'c-kpoints,test,,guy,Key points,L,k +5,R,k +5,repeat,1,,',
  'c-trig-s1,test,,guy,Trigger one,L,B +1,R,A = 100,,1,s1 right,Invented thing one on the way out.',
  'c-trig-k,test,,guy,Trigger key,L,B +1,R,B = 100,,1,k right,',
].join('\n');

function toTrigger(content, s, id, limit = 50) {
  for (let i = 0; i < limit && s.life.current.card !== id; i++) s = choose(s, content, sideOf(s, 'left')).state;
  assert.equal(s.life.current.card, id, `never reached ${id}`);
  return s;
}

test('a breakthrough on the fatal swipe still counts', () => {
  const content = fixture({ inventions: baseInventions, cards: baseCards });
  let s = toTrigger(content, newGame(content, { seed: 1 }), 'c-trig-s1');
  const res = choose(s, content, sideOf(s, 'right'));
  const d = res.events.find((e) => e.type === 'death');
  assert.ok(d);
  assert.equal(d.record.inv, 's1');
  assert.equal(d.record.breakthrough, true);
  assert.equal(d.record.epitaph, 'Invented thing one on the way out. A high.');
});

test('the keystone waits for its stepping stone from an earlier life, then opens the next era', () => {
  const content = fixture({ inventions: baseInventions, cards: baseCards });
  let s = newGame(content, { seed: 2 });
  // Life 1 has points for both, but only the stepping stone can trigger.
  s = toTrigger(content, s, 'c-trig-s1');
  s = choose(s, content, sideOf(s, 'right')).state;
  assert.equal(s.pending.inv, 's1');
  s = advance(s, content, { turn: s.turn }).state;
  assert.equal(s.phase, 'play');
  // Life 2: the key's points come from the bag; its trigger is now allowed.
  s = toTrigger(content, s, 'c-trig-k', 200);
  s = choose(s, content, sideOf(s, 'right')).state;
  assert.equal(s.pending.inv, 'k');
  assert.equal(s.pending.keystone, true);
  s = advance(s, content, { turn: s.turn }).state;
  assert.equal(s.phase, 'transition');
  s = advance(s, content, { turn: s.turn }).state;
  assert.equal(s.life.era, 'after');
});

test('no breakthrough means a bad idea, never a free stepping stone', () => {
  const content = fixture({
    inventions: baseInventions,
    cards: ['c-start,test,script,guy,Start,L,s1 +1; A = 0,R,s1 +1; A = 0,,,,', 'c-filler,test,,guy,Filler,L,C +1,R,C -1,repeat,1,,'].join('\n'),
  });
  const s = newGame(content, { seed: 4 });
  const d = choose(s, content, sideOf(s, 'left')).events.find((e) => e.type === 'death');
  assert.equal(d.record.inv, 'bad1');
  assert.equal(d.record.kind, 'bad');
  assert.equal(d.record.breakthrough, false);
});

test('picking the other answer on a trigger rules that invention out for the rest of the life', () => {
  const content = fixture({ inventions: baseInventions, cards: baseCards });
  let s = toTrigger(content, newGame(content, { seed: 5 }), 'c-trig-s1');
  s = choose(s, content, sideOf(s, 'left')).state;
  assert.deepEqual(s.life.suppressed, ['s1']);
  for (let i = 0; i < 40 && s.phase === 'play'; i++) {
    assert.notEqual(s.life.current.card, 'c-trig-s1');
    s = choose(s, content, sideOf(s, 'left')).state;
  }
});

test('stale or repeated input is rejected without changing anything', () => {
  const s = newGame(real.content, { seed: 9 });
  const stale = choose(s, real.content, { side: 'left', card: s.life.current.card, turn: s.turn - 1 });
  assert.equal(stale.state, s);
  assert.equal(stale.events[0].type, 'rejected');
  const wrongCard = choose(s, real.content, { side: 'left', card: 'not-this-one', turn: s.turn });
  assert.equal(wrongCard.events[0].type, 'rejected');
});

test('reloading at the epitaph never awards twice', () => {
  let s = newGame(real.content, { seed: 11 });
  for (let i = 0; i < 8; i++) s = choose(s, real.content, sideOf(s, 'right')).state;
  assert.equal(s.phase, 'epitaph');
  const reloaded = JSON.parse(JSON.stringify(s));
  const next = advance(reloaded, real.content, { turn: reloaded.turn }).state;
  assert.equal(next.collection.archive.length, 1);
  assert.deepEqual(next.timeline.history, ['sparks']);
  const again = advance(next, real.content, { turn: reloaded.turn });
  assert.equal(again.events[0].type, 'rejected');
  assert.equal(next.life.n, 2);
});

test('an empty deck falls back safely and never bypasses hard conditions', () => {
  const content = fixture({
    inventions: baseInventions,
    cards: ['c-start,test,script,guy,Start,L,C +1,R,C -1,,,,', 'c-locked,test,,guy,Never,L,C +1,R,C -1,seen_start,1,,'].join('\n'),
  });
  let s = newGame(content, { seed: 6 });
  for (let i = 0; i < 10; i++) {
    s = choose(s, content, sideOf(s, i % 2 ? 'left' : 'right')).state;
    assert.notEqual(s.life.current.card, 'c-locked');
    assert.equal(getCard(content, s.life.current.card).id, '__rest');
  }
  assert.ok(s.life.stats.fallbacks >= 10);
});
