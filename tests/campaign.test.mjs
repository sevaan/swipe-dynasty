// The campaign's rules, against the real script (content/script.md
// section 16: content integrity gates, and state and interaction tests).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, history, newHistory, rankRoutes, reconcile, view } from '../src/engine/campaign.js';
import { always, C, drive, fresh, real, routeTo, step } from './helpers.mjs';

const toChoice = (s) => drive(s, always('left'), { until: (x) => x.view === 'choice' }).state;
const cardAt = (s) => C.chapters[s.chapterId].cards[s.cardIndex];

test('the script reads with no errors, in the size this edition promises', () => {
  assert.deepEqual(real.errors, []);
  assert.equal(C.chapterOrder.length, 34);
  assert.equal(Object.keys(C.cards).length, 192);
  assert.equal(Object.values(C.cards).filter((c) => c.left && c.right).length, 192);
  assert.equal(Object.keys(C.inventions).length, 34);
  assert.equal(C.callbacks.length, 28);
  assert.deepEqual(C.routeOrder, ['simulation', 'departure', 'retirement', 'reply', 'unmaking']);
  for (const r of Object.values(C.routes)) {
    assert.equal(r.ending.panels.length, 5, r.id);
    assert.ok(r.ending.variants.left && r.ending.variants.right, r.id);
  }
  assert.equal(C.redirect.id, 'REDIRECT.U3');
  // The four Stone Age lives are short: an opening, the proof and a danger card
  const short = ['C01', 'C02', 'C03', 'C04'];
  for (const c of Object.values(C.chapters)) {
    const n = short.includes(c.id) ? 3 : 6;
    assert.equal(c.cards.length, n, c.id);
    assert.equal(c.bench.length, n, c.id);
    assert.equal(c.short, n === 3, c.id);
    assert.deepEqual(c.cards.map((cd) => cd.kind), n === 3 ? ['opening', 'proof', 'danger'] : ['opening', 'experiment', 'complication', 'proof', 'adoption', 'legacy'], c.id);
    if (c.short) assert.ok(c.death.left && c.death.right, `${c.id} has an obituary for each danger answer`);
    for (const card of c.cards) assert.ok(c.cast[card.speaker], `${card.id} speaker`);
  }
  // Maximum interests come from the content, not a copy of these numbers
  assert.deepEqual(C.maxAffinity, { S: 14, D: 9, R: 11, A: 10, U: 4 });
});

test('both sides of the first card work; a stale or doubled choice does nothing', () => {
  for (const side of ['left', 'right']) {
    let s = toChoice(fresh());
    assert.equal(cardAt(s).id, 'C01.1');
    const res = step(s, { type: 'choose', card: 'C01.1', side });
    s = res.state;
    assert.equal(s.view, 'result');
    assert.equal(s.choices['C01.1'], side);
    assert.equal(view(s, C).result.text, C.cards['C01.1'][side].result);
    // The same event again: stale turn
    const again = act(s, C, { type: 'choose', card: 'C01.1', side, turn: s.turn - 1 });
    assert.equal(again.events[0].type, 'rejected');
    // A choice while the result is showing: no card to choose
    const during = act(s, C, { type: 'choose', card: 'C01.1', side, turn: s.turn });
    assert.equal(during.events[0].type, 'rejected');
  }
});

test('one choice applies its effects once, and a reload on the result repeats nothing', () => {
  // C01.3 right adds D affinity; C01.2 commits the invention
  let s = drive(fresh(), always('right'), { until: (x) => x.view === 'result' && x.pendingResultCard === 'C01.3' }).state;
  assert.equal(s.affinity.D, 1);
  const saved = JSON.parse(JSON.stringify(s));
  const { state: loaded } = reconcile(saved, C);
  assert.equal(loaded.view, 'result');
  assert.equal(loaded.affinity.D, 1);
  assert.equal(Object.keys(loaded.inventions).length, 1);
  s = step(loaded, { type: 'continue' }).state;
  assert.equal(s.affinity.D, 1);
  assert.equal(Object.keys(s.inventions).length, 1);
});

test('the proof card commits exactly one invention and shows the reveal; the last card writes the legacy', () => {
  // A short Stone Age life: card two is the proof, card three the danger that ends it
  let s = drive(fresh(), always('left'), { until: (x) => x.view === 'result' && x.pendingResultCard === 'C01.2' }).state;
  assert.deepEqual(Object.keys(s.inventions), ['c01-invention']);
  s = step(s, { type: 'continue' }).state;
  assert.equal(s.view, 'reveal');
  assert.equal(view(s, C).first, true);
  s = step(s, { type: 'continue' }).state;
  assert.equal(s.view, 'choice');
  assert.equal(cardAt(s).id, 'C01.3');
  s = drive(s, always('right'), { until: (x) => x.view === 'epitaph' }).state;
  assert.equal(s.legacies.C01, 'right');
  assert.equal(view(s, C).epitaph.legacy, C.chapters.C01.legacy.right);
  assert.deepEqual(Object.keys(s.inventions), ['c01-invention']);
  // A full life: card four is the proof, card six the legacy
  s = drive(fresh(), always('left'), { until: (x) => x.view === 'result' && x.pendingResultCard === 'C05.4' }).state;
  assert.ok(s.inventions['c05-invention'] || s.inventions[C.chapters.C05.invention.id]);
  s = step(s, { type: 'continue' }).state;
  assert.equal(s.view, 'reveal');
  s = step(s, { type: 'continue' }).state;
  assert.equal(cardAt(s).id, 'C05.5');
  s = drive(s, always('right'), { until: (x) => x.view === 'epitaph' }).state;
  assert.equal(view(s, C).epitaph.legacy, C.chapters.C05.legacy.right);
});

test('every card plays whatever the exposure; exposure of 2 or more changes only the obituary', () => {
  // C06 has a reachable risk obituary; take every option that adds exposure
  const risky = (id) => (C.cards[id].right.danger > C.cards[id].left.danger ? 'right' : 'left');
  let s = drive(fresh(), ({ kind, id }) => (kind === 'card' ? risky(id) : 'left'), { until: (x) => x.view === 'epitaph' && x.chapterId === 'C06' }).state;
  assert.ok(s.lifeExposure >= 2, `exposure ${s.lifeExposure}`);
  assert.equal(C.chapters.C06.cards.filter((c) => s.choices[c.id]).length, 6);
  assert.equal(view(s, C).epitaph.death, C.chapters.C06.death.risk);
  // The careful route closes naturally
  const safe = (id) => (C.cards[id].right.danger < C.cards[id].left.danger ? 'right' : 'left');
  s = drive(fresh(), ({ kind, id }) => (kind === 'card' ? safe(id) : 'left'), { until: (x) => x.view === 'epitaph' && x.chapterId === 'C06' }).state;
  assert.equal(view(s, C).epitaph.death, C.chapters.C06.death.natural);
  // A short Stone Age life ends on its danger card, and its answer is the obituary
  for (const side of ['left', 'right']) {
    s = drive(fresh(), always(side), { until: (x) => x.view === 'epitaph' && x.chapterId === 'C02' }).state;
    assert.equal(C.chapters.C02.cards.filter((c) => s.choices[c.id]).length, 3);
    assert.equal(view(s, C).epitaph.death, C.chapters.C02.death[side]);
    assert.equal(view(s, C).epitaph.legacy, C.chapters.C02.legacy[side]);
  }
});

test('every answer combination completes every chapter (64 for six cards, 8 for three)', () => {
  for (const id of C.chapterOrder) {
    const chapter = C.chapters[id];
    const n = chapter.cards.length;
    for (let bits = 0; bits < 2 ** n; bits++) {
      let s = newHistory(C);
      Object.assign(s, { chapterId: id, view: 'arrival', route: chapter.route });
      s = step(s, { type: 'continue' }).state;
      for (let k = 0; k < n; k++) {
        const side = (bits >> k) & 1 ? 'right' : 'left';
        s = step(s, { type: 'choose', card: `${id}.${k + 1}`, side }).state;
        s = step(s, { type: 'continue' }).state; // the result
        if (k === chapter.proofIndex) { assert.equal(s.view, 'reveal', `${id} reveal`); s = step(s, { type: 'continue' }).state; }
      }
      assert.equal(Object.keys(s.inventions).length, 1, `${id} ${bits}`);
      assert.ok(s.inventions[chapter.invention.id], `${id} ${bits}`);
      assert.equal(s.legacies[id], (bits >> (n - 1)) & 1 ? 'right' : 'left');
      assert.equal(s.view, chapter.final ? 'ending' : 'epitaph', `${id} ${bits}`);
    }
  }
});

test('callbacks show only when the earlier stored choice matches, in both cases', () => {
  for (const cb of C.callbacks) {
    for (const side of ['left', 'right']) {
      const s = newHistory(C);
      const [ch, n] = cb.after.split('.');
      Object.assign(s, { chapterId: ch, cardIndex: Number(n) - 1, view: 'result', pendingResultCard: cb.after, route: C.chapters[ch].route });
      s.choices[cb.card] = side;
      s.choices[cb.after] = 'left';
      const lines = view(s, C).result.callbacks;
      assert.equal(lines.includes(cb.text), side === cb.side, `callback ${cb.n} with ${cb.card}=${side}`);
    }
    // No stored choice never counts as either side
    const s = newHistory(C);
    const [ch, n] = cb.after.split('.');
    Object.assign(s, { chapterId: ch, cardIndex: Number(n) - 1, view: 'result', pendingResultCard: cb.after, route: C.chapters[ch].route });
    s.choices[cb.after] = 'left';
    if (cb.card !== cb.after) assert.ok(!view(s, C).result.callbacks.includes(cb.text), `callback ${cb.n} with no choice`);
  }
});

test('proposals are ranked by normalized interest, with stable ties', () => {
  const s = newHistory(C);
  // No interests at all: the stable order S, D, R, A, U
  assert.deepEqual(rankRoutes(s, C), ['simulation', 'departure', 'retirement', 'reply', 'unmaking']);
  // One point of U out of 4 beats three points of S out of 14
  s.affinity = { S: 3, D: 0, R: 0, A: 0, U: 1 };
  assert.deepEqual(rankRoutes(s, C).slice(0, 2), ['unmaking', 'simulation']);
  // A tie keeps the stable order
  s.affinity = { S: 0, D: C.maxAffinity.D, R: C.maxAffinity.R, A: 0, U: 0 };
  assert.deepEqual(rankRoutes(s, C).slice(0, 2), ['departure', 'retirement']);
});

test('every route can be chosen from any rank, and a reload on an offer keeps its place', () => {
  const at = drive(fresh(), always('left'), { until: (x) => x.view === 'proposal' });
  assert.ok(at.checkpoint, 'a checkpoint after the shared history');
  assert.equal(at.state.lives.length, 14);
  for (const route of C.routeOrder) {
    const s = drive(at.state, routeTo(route), { until: (x) => x.view === 'arrival' && x.route }).state;
    assert.equal(s.route, route);
    assert.equal(s.chapterId, C.routes[route].chapters[0]);
  }
  // Defer once, reload on the next offer: same order, same place, the deferral kept
  let s = step(at.state, { type: 'offer', side: 'right' }).state;
  s = step(s, { type: 'continue' }).state;
  const { state: loaded } = reconcile(JSON.parse(JSON.stringify(s)), C);
  assert.deepEqual(loaded.proposalOrder, at.state.proposalOrder);
  assert.equal(loaded.proposalIndex, 1);
  assert.equal(loaded.choices['OFFER.0'], 'right');
  assert.equal(act(loaded, C, { type: 'offer', side: 'left', turn: loaded.turn - 1 }).events[0].type, 'rejected');
});

test('a full history on each route: 18 lives, 18 inventions, and the ending that matches the final choice', () => {
  for (const route of C.routeOrder) {
    for (const last of ['left', 'right']) {
      const finalCard = `${C.routes[route].chapters[3]}.6`;
      let endingText = null;
      const run = drive(fresh(), routeTo(route, (id) => (id === finalCard ? last : 'left')), {
        onStep: (s, a, res) => { if (res.state.view === 'ending' && res.state.endingPanelIndex === 5) endingText = view(res.state, C).ending.text; },
      });
      const s = run.state;
      assert.equal(s.view, 'credits', route);
      assert.equal(s.lives.length, 18, route);
      assert.equal(Object.keys(s.inventions).length, 18, route);
      assert.equal(endingText, C.routes[route].ending.variants[last], `${route} ${last}`);
      assert.ok(run.events.some((e) => e.type === 'ending-seen' && e.route === route));
      // A route's final inventor has no obituary
      assert.equal(s.obituaries[C.routes[route].chapters[3]], undefined);
    }
  }
});

test('Unmaking redirected after U3 reaches Retirement with 21 lives and no Stillness Engine', () => {
  for (const u36 of ['left', 'right']) {
    const run = drive(fresh(), routeTo('unmaking', (id) => (id === 'U3.6' ? u36 : 'left'), 'right'));
    const s = run.state;
    assert.equal(s.view, 'credits');
    assert.equal(s.route, 'retirement');
    assert.equal(s.redirectedFromUnmaking, true);
    assert.equal(s.lives.length, 21);
    assert.equal(Object.keys(s.inventions).length, 21);
    assert.ok(!s.inventions.U4_invention);
    assert.ok(s.inventions.U3_invention, 'earlier inventions are kept');
    const seen = run.events.filter((e) => e.type === 'ending-seen').map((e) => e.route);
    assert.deepEqual(seen, ['retirement']);
  }
  // R1 opens with its authored alternate arrival
  const at = drive(fresh(), routeTo('unmaking', 'left', 'right'), { until: (x) => x.view === 'arrival' && x.chapterId === 'R1' }).state;
  assert.equal(view(at, C).chapter.arrival, C.overrides.R1.arrival);
  assert.equal(view(at, C).chapter.era, 'A different future');
  // Staying on Unmaking plays U4 and its ending
  const stay = drive(fresh(), routeTo('unmaking', 'left', 'left'));
  assert.equal(stay.state.lives.length, 18);
  assert.ok(stay.state.inventions.U4_invention);
});

test('"Another future" restores exactly the post-C14 checkpoint', () => {
  const run = drive(fresh(), routeTo('departure'));
  assert.equal(run.state.view, 'credits');
  const back = step(run.state, { type: 'another-future', checkpoint: run.checkpoint }).state;
  assert.equal(back.view, 'proposal');
  assert.equal(back.proposalIndex, 0);
  assert.equal(back.route, null);
  assert.equal(back.lives.length, 14);
  assert.equal(Object.keys(back.inventions).length, 14);
  assert.ok(Object.keys(back.choices).every((id) => id.startsWith('C')), 'only shared choices remain');
  assert.deepEqual(back.proposalOrder, run.checkpoint.proposalOrder);
  // ...and another route plays from there
  const other = drive(back, routeTo('reply'));
  assert.equal(other.state.route, 'reply');
  assert.equal(other.state.lives.length, 18);
});

test('the history lists what was actually made and chosen, and nothing unplayed', () => {
  const s = drive(fresh(), always('left'), { until: (x) => x.view === 'arrival' && x.chapterId === 'C03' }).state;
  const h = history(s, C);
  assert.deepEqual(h.map((l) => l.chapter), ['C01', 'C02']);
  assert.equal(h[0].choices.length, 3);
  assert.equal(h[0].death, C.chapters.C01.death.left);
  assert.equal(h[0].legacy, C.chapters.C01.legacy.left);
  assert.equal(h[0].status, 'ended');
  assert.equal(history(newHistory(C), C).length, 0);
});

test('a save from when the Stone Age lives had six cards still loads sensibly', () => {
  // Finished C01 on its old sixth card, and partway through C02's old fifth card
  const s = fresh();
  Object.assign(s, {
    turn: 40, view: 'choice', chapterId: 'C02', cardIndex: 4, lives: ['C01'],
    choices: { 'C01.1': 'left', 'C01.2': 'left', 'C01.3': 'left', 'C01.4': 'left', 'C01.5': 'left', 'C01.6': 'right', 'C02.1': 'left', 'C02.2': 'left', 'C02.3': 'left', 'C02.4': 'left' },
    inventions: { 'c01-invention': { chapterId: 'C01' }, 'c02-invention': { chapterId: 'C02' } },
    legacies: { C01: 'right' }, obituaries: { C01: 'natural' },
  });
  const { state: loaded } = reconcile(JSON.parse(JSON.stringify(s)), C);
  // The finished life keeps its legacy as its new last card's answer, so its callbacks still hold
  assert.equal(loaded.choices['C01.3'], 'right');
  assert.ok(!('C01.4' in loaded.choices) && !('C01.6' in loaded.choices));
  // The life in progress no longer has a fifth card, so it starts again from its arrival
  assert.equal(loaded.chapterId, 'C02');
  assert.equal(loaded.view, 'arrival');
  assert.ok(!('C02.1' in loaded.choices));
  const played = drive(loaded, always('left'), { until: (x) => x.view === 'arrival' && x.chapterId === 'C03' }).state;
  assert.deepEqual(played.lives, ['C01', 'C02']);
});

test('an old or foreign save starts a new history instead of being misread', () => {
  assert.equal(reconcile({ save: 2, timeline: {} }, C).state, null);
  assert.equal(reconcile(null, C).state, null);
  const s = fresh();
  assert.equal(reconcile(s, C).state.view, 'intro');
});
