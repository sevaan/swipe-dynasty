// The script export reads the same content the game plays (script section
// 16, test 12): every card, both results, effects, callbacks and endings.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scriptText } from '../tools/script-text.js';
import { C, real } from './helpers.mjs';

const T = scriptText(real.content);

test('the full export contains every card, result, callback and ending', () => {
  const md = T.markdown('all');
  for (const card of Object.values(C.cards)) {
    assert.ok(md.includes(card.text), `${card.id} situation`);
    for (const side of ['left', 'right']) assert.ok(md.includes(card[side].result), `${card.id} ${side} result`);
  }
  for (const cb of C.callbacks) assert.ok(md.includes(cb.text), `callback ${cb.n}`);
  for (const r of Object.values(C.routes)) {
    assert.ok(md.includes(r.pitch), `${r.id} pitch`);
    for (const p of r.ending.panels) assert.ok(md.includes(p), `${r.id} panel`);
  }
  assert.ok(md.includes(C.redirect.text), 'the redirect');
  // An effect that adds exposure or interest is spelled out
  assert.ok(md.includes('experimental exposure +'), 'exposure');
  assert.ok(md.includes('S interest +1'), 'interest');
});

test('the filters show the shared history and each route on their own', () => {
  assert.deepEqual(T.chaptersFor('shared'), C.shared);
  for (const r of C.routeOrder) assert.deepEqual(T.chaptersFor(r), C.routes[r].chapters);
  assert.equal(T.chaptersFor('all').length, 34);
  assert.equal(T.filters().length, 7);
  const shared = T.markdown('shared');
  assert.ok(!shared.includes(C.cards['S1.1'].text));
  assert.ok(shared.includes(C.cards['C14.6'].text));
});
