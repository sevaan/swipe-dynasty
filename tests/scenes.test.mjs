import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contrast, EFFECTS } from '../src/content/compile.js';
import { EFFECT_NAMES } from '../src/ui/fx.js';
import { newGame, view } from '../src/engine/game.js';
import { loadContent } from '../tools/load-node.mjs';
import { fixture } from './helpers.mjs';

const real = loadContent();

test('the effects content can ask for are exactly the ones the interface draws', () => {
  assert.deepEqual([...EFFECTS].sort(), [...EFFECT_NAMES].sort());
});

test('every sky and scene keeps the era text readable', () => {
  const { content } = real;
  for (const era of Object.values(content.eras)) {
    const bgs = [...era.sky.map((s) => s.bg), ...Object.values(content.scenes).map((s) => s.bg).filter(Boolean)];
    for (const bg of bgs) assert.ok(contrast(era.theme.text, bg) >= 4.5, `${bg} behind ${era.name} text`);
  }
});

test('the sky steps through the times of day as cards are played, and each life starts elsewhere', () => {
  const { content } = real;
  const s = newGame(content, { seed: 1 });
  const skies = content.eras['stone-age'].sky;
  const at = (lifeN, cards) => view({ ...s, life: { ...s.life, n: lifeN, cards } }, content).sky.name;
  const every = content.tuning.skyEvery;
  assert.equal(at(1, 0), skies[1].name);
  assert.equal(at(1, every), skies[2].name);
  assert.equal(at(2, 0), skies[2].name);
});

test('cards and deaths report their scenes to the interface', () => {
  const { content } = real;
  const s = newGame(content, { seed: 1 });
  assert.equal(view(s, content).scene?.id, 'sparks');
  assert.equal(content.deaths['sa-gods-high'].scene, 'volcano');
});

test('an unknown scene or effect is a content error', () => {
  assert.throws(() => fixture({
    inventions: 'bad1,test,bad idea,a bad idea,,,',
    cards: 'c-start,test,script,guy,Start,L,A +1,R,A -1,,,,,drizzle',
  }), /No scene \\"drizzle\\"/);
});
