// The campaign in content/script.md (its sections 3–7): an authored history
// of independent inventors. Most lives play six cards: the fourth commits
// the life's one invention and the sixth picks its legacy. The first four
// are short Stone Age lives of three: the second commits the invention, and
// the third, a danger card, ends the life and picks both its legacy and its
// obituary. Nothing else ends a life early. After the fourteenth life, the player's interests rank five
// future projects, and the chosen route runs four more lives to its ending.
// No page code here: the browser, the tests and the simulator all play
// exactly this, one atomic step per action.

export const SCHEMA = 1;
export const CONTENT_VERSION = 'obi-script-1.1';
export const AFFINITY_ORDER = ['S', 'D', 'R', 'A', 'U'];
const MAX_EXPOSURE = 9;
const RISK_AT = 2;

const clone = (x) => JSON.parse(JSON.stringify(x));
const reject = (state, reason) => ({ state, events: [{ type: 'rejected', reason }] });

export function newHistory(C) {
  return {
    schemaVersion: SCHEMA, contentVersion: CONTENT_VERSION, content: C.hash,
    turn: 0,
    chapterId: C.shared[0], cardIndex: 0, view: 'intro',
    choices: {}, // card id (and OFFER.n, REDIRECT.U3) -> 'left' | 'right'
    inventions: {}, // invention id -> { chapterId, inventorName, committedAtCard }
    legacies: {}, // chapter id -> the last card's side
    lives: [], // chapter ids, in the order they were finished
    obituaries: {}, // chapter id -> 'natural' | 'risk'
    lifeExposure: 0,
    affinity: Object.fromEntries(AFFINITY_ORDER.map((k) => [k, 0])),
    route: null, proposalOrder: [], proposalIndex: 0,
    pendingResultCard: null, endingPanelIndex: 0, redirectedFromUnmaking: false,
  };
}

// The chapter a route or the shared history plays after this one
function nextChapter(state, C) {
  const id = state.chapterId;
  const i = C.shared.indexOf(id);
  if (i >= 0) return i + 1 < C.shared.length ? C.shared[i + 1] : null;
  const route = C.routes[C.chapters[id].route];
  const j = route.chapters.indexOf(id);
  return j + 1 < route.chapters.length ? route.chapters[j + 1] : null;
}

// Interests rank the proposals: each score over the most this content lets
// it reach, highest first, ties in the stable order S, D, R, A, U (spec 4)
export function rankRoutes(state, C) {
  const score = (r) => (C.maxAffinity[r.key] ? (state.affinity[r.key] || 0) / C.maxAffinity[r.key] : 0);
  return C.routeOrder.map((id) => C.routes[id])
    .sort((a, b) => score(b) - score(a) || AFFINITY_ORDER.indexOf(a.key) - AFFINITY_ORDER.indexOf(b.key))
    .map((r) => r.id);
}

// Offers 0..n-3 show one project each; the last offer shows the final two
export function offersFor(state) {
  const p = state.proposalOrder;
  const last = Math.max(0, p.length - 2);
  const i = state.proposalIndex;
  return i < last ? { index: i, routes: [p[i]], double: false } : { index: last, routes: p.slice(last), double: true };
}

function enterChapter(state, C, id, events) {
  state.chapterId = id;
  state.cardIndex = 0;
  state.lifeExposure = 0;
  state.view = 'arrival';
  state.pendingResultCard = null;
  events.push({ type: 'life', chapter: id });
}

// Resolves one action, atomically (spec 7, "Choice transaction").
//   { type: 'continue' }                     intro, arrival, result, reveal, epitaph, ending
//   { type: 'choose', card, side }           a decision card
//   { type: 'offer', side }                  a project proposal
//   { type: 'redirect', side }               the choice after U3
//   { type: 'another-future', checkpoint }   back to the proposals after C14
// Every action carries the turn it was made on, so a stale or doubled input
// does nothing. The result may carry a checkpoint to keep (after C14).
export function act(prev, C, action) {
  if (action.turn !== prev.turn) return reject(prev, 'stale input');
  const state = clone(prev);
  const events = [];
  const chapter = C.chapters[state.chapterId];
  let checkpoint = null;

  switch (action.type) {
    case 'choose': {
      const card = chapter?.cards[state.cardIndex];
      if (state.view !== 'choice' || !card) return reject(prev, 'no card to choose');
      if (action.card !== card.id) return reject(prev, 'stale card');
      if (action.side !== 'left' && action.side !== 'right') return reject(prev, 'bad side');
      if (state.choices[card.id]) return reject(prev, 'already chosen');
      const opt = card[action.side];
      state.choices[card.id] = action.side;
      state.lifeExposure = Math.max(0, Math.min(MAX_EXPOSURE, state.lifeExposure + (opt.danger || 0)));
      for (const [k, v] of Object.entries(opt.affinity || {})) state.affinity[k] = (state.affinity[k] || 0) + v;
      if (state.cardIndex === chapter.proofIndex && !state.inventions[chapter.invention.id]) {
        state.inventions[chapter.invention.id] = { chapterId: chapter.id, inventorName: chapter.inventor.name, committedAtCard: card.id };
        events.push({ type: 'invention', id: chapter.invention.id });
      }
      if (state.cardIndex === chapter.lastIndex) state.legacies[chapter.id] = action.side;
      state.pendingResultCard = card.id;
      state.view = 'result';
      events.push({ type: 'choice', card: card.id, side: action.side });
      break;
    }

    case 'offer': {
      if (state.view !== 'proposal') return reject(prev, 'no proposal');
      if (action.side !== 'left' && action.side !== 'right') return reject(prev, 'bad side');
      const offer = offersFor(state);
      const id = `OFFER.${offer.index}`;
      if (state.choices[id]) return reject(prev, 'already answered');
      state.choices[id] = action.side;
      const accepted = offer.double ? offer.routes[action.side === 'left' ? 0 : 1] : action.side === 'left' ? offer.routes[0] : null;
      if (accepted) state.route = accepted;
      state.pendingResultCard = id;
      state.view = 'result';
      events.push({ type: 'offer', id, side: action.side, accepted });
      break;
    }

    case 'redirect': {
      if (state.view !== 'redirect' || !C.redirect) return reject(prev, 'no redirect');
      if (action.side !== 'left' && action.side !== 'right') return reject(prev, 'bad side');
      if (state.choices[C.redirect.id]) return reject(prev, 'already answered');
      state.choices[C.redirect.id] = action.side;
      state.pendingResultCard = C.redirect.id;
      state.view = 'result';
      events.push({ type: 'redirect', side: action.side });
      break;
    }

    case 'continue': {
      switch (state.view) {
        case 'intro':
          enterChapter(state, C, state.chapterId, events);
          break;
        case 'arrival':
          state.view = 'choice';
          break;
        case 'result': {
          const id = state.pendingResultCard;
          state.pendingResultCard = null;
          if (id?.startsWith('OFFER.')) {
            if (state.route) enterChapter(state, C, C.routes[state.route].chapters[0], events);
            else { state.proposalIndex += 1; state.view = 'proposal'; }
          } else if (id === C.redirect?.id) {
            const side = state.choices[id];
            const to = C.redirect[side].transition;
            if (C.chapters[to].route !== state.route) { state.route = C.chapters[to].route; state.redirectedFromUnmaking = true; }
            enterChapter(state, C, to, events);
          } else if (state.cardIndex === chapter.proofIndex) {
            state.view = 'reveal';
          } else if (state.cardIndex === chapter.lastIndex) {
            state.lives.push(chapter.id);
            if (chapter.final) {
              state.view = 'ending';
              state.endingPanelIndex = 0;
              events.push({ type: 'route-complete', route: state.route });
            } else {
              // A short life's death is its danger card's answer; a full life's, its exposure
              state.obituaries[chapter.id] = chapter.short ? state.legacies[chapter.id] : chapter.id !== C.shared[0] && state.lifeExposure >= RISK_AT && chapter.death.risk ? 'risk' : 'natural';
              state.view = 'epitaph';
            }
          } else {
            state.cardIndex += 1;
            state.view = 'choice';
          }
          break;
        }
        case 'reveal':
          state.cardIndex = chapter.proofIndex + 1;
          state.view = 'choice';
          break;
        case 'epitaph': {
          if (C.redirect && state.chapterId === C.redirect.after && !state.choices[C.redirect.id]) {
            state.view = 'redirect';
            break;
          }
          const next = nextChapter(state, C);
          if (next) { enterChapter(state, C, next, events); break; }
          // After the shared history: the proposals, and a checkpoint to come back to
          state.proposalOrder = rankRoutes(state, C);
          state.proposalIndex = 0;
          state.view = 'proposal';
          state.chapterId = null;
          checkpoint = true;
          break;
        }
        case 'ending': {
          const panels = C.routes[state.route].ending.panels.length;
          if (state.endingPanelIndex < panels) { // the five panels, then the final-choice variant
            state.endingPanelIndex += 1;
          } else {
            state.view = 'credits';
            events.push({ type: 'ending-seen', route: state.route });
          }
          break;
        }
        default:
          return reject(prev, 'nothing to continue');
      }
      break;
    }

    case 'another-future': {
      if (!action.checkpoint) return reject(prev, 'no checkpoint');
      const back = clone(action.checkpoint);
      back.turn = state.turn + 1;
      return { state: back, events: [{ type: 'another-future' }] };
    }

    default:
      return reject(prev, `unknown action ${action.type}`);
  }

  state.turn += 1;
  const out = { state, events };
  if (checkpoint) out.checkpoint = clone(state);
  return out;
}

// How a life ended: a short life by its danger card, a full one by its exposure
function obituaryOf(state, chapter) {
  if (chapter.short) return chapter.death[state.legacies[chapter.id]] || chapter.death.left;
  return state.obituaries[chapter.id] === 'risk' ? chapter.death.risk : chapter.death.natural;
}

// The arrival and era, with any authored override (R1 after the U3 redirect)
function arrivalFor(state, C, chapter) {
  const o = C.overrides[chapter.id];
  if (o && state.choices[o.when.card] === o.when.side) return { arrival: o.arrival, era: o.era };
  return { arrival: chapter.arrival, era: chapter.era };
}

function speakerOf(C, chapter, id) {
  if (id === C.archive.id) return { id, name: C.archive.name, description: C.archive.description, key: id };
  const c = chapter?.cast[id];
  // Cast ids are chapter-local: the key keeps a repeated name in another chapter distinct (spec 3)
  return c ? { ...c, key: `${chapter.id}:${c.id}` } : null;
}

const optionView = (o) => ({ label: o.label, risk: (o.danger || 0) > 0 });

// Everything the screen needs for this moment, and nothing hidden: no
// exposure numbers, no unchosen results.
export function view(state, C) {
  const chapter = state.chapterId ? C.chapters[state.chapterId] : null;
  const out = { view: state.view, turn: state.turn, route: state.route, lifeNumber: state.lives.length + (state.view === 'epitaph' ? 0 : 1) };
  if (chapter) {
    const { arrival, era } = arrivalFor(state, C, chapter);
    out.chapter = {
      id: chapter.id, title: chapter.title, era, arrival, route: chapter.route, final: chapter.final,
      inventor: { ...chapter.inventor, key: `${chapter.id}:inventor` },
      invention: { ...chapter.invention },
    };
  }
  const bench = (i) => ({ index: i, text: chapter?.bench[i] || '' });
  switch (state.view) {
    case 'choice': {
      const card = chapter.cards[state.cardIndex];
      out.card = { id: card.id, index: card.index, kind: card.kind, text: card.text, speaker: speakerOf(C, chapter, card.speaker), left: optionView(card.left), right: optionView(card.right) };
      out.bench = bench(state.cardIndex);
      out.first = card.id === `${C.shared[0]}.1` ? 1 : card.id === `${C.shared[0]}.2` ? 2 : 0;
      break;
    }
    case 'result': {
      const id = state.pendingResultCard;
      const side = state.choices[id];
      if (id?.startsWith('OFFER.')) {
        out.offer = { id, side, accepted: state.route };
      } else if (id === C.redirect?.id) {
        const o = C.redirect[side];
        out.card = { id, text: C.redirect.text, speaker: speakerOf(C, null, C.archive.id) };
        out.result = { side, label: o.label, text: o.result, callbacks: [] };
      } else {
        const card = chapter.cards[state.cardIndex];
        const o = card[side];
        out.card = { id: card.id, index: card.index, kind: card.kind, text: card.text, speaker: speakerOf(C, chapter, card.speaker) };
        // Callbacks: only when the stored earlier choice matches exactly (spec 5)
        const callbacks = C.callbacks.filter((cb) => cb.after === card.id && state.choices[cb.card] === cb.side).map((cb) => cb.text);
        out.result = { side, label: o.label, text: o.result, callbacks };
        out.bench = bench(state.cardIndex);
      }
      break;
    }
    case 'reveal':
      out.first = Object.keys(state.inventions).length === 1;
      out.bench = bench(chapter.proofIndex);
      break;
    case 'epitaph': {
      out.epitaph = {
        name: chapter.inventor.name,
        invention: chapter.invention.name,
        death: obituaryOf(state, chapter),
        legacy: chapter.legacy[state.legacies[chapter.id]] || '',
        next: C.redirect && chapter.id === C.redirect.after ? 'redirect' : nextChapter(state, C) ? 'chapter' : 'proposals',
      };
      out.bench = bench(chapter.lastIndex);
      break;
    }
    case 'proposal': {
      const offer = offersFor(state);
      out.proposal = {
        id: `OFFER.${offer.index}`, index: offer.index, first: offer.index === 0, double: offer.double,
        routes: offer.routes.map((rid) => {
          const r = C.routes[rid];
          const first = C.chapters[r.chapters[0]];
          return { id: rid, title: r.title, pitch: r.pitch, acceptLabel: r.acceptLabel, inventor: { ...first.inventor, key: `${first.id}:inventor` }, chapter: first.id };
        }),
      };
      break;
    }
    case 'redirect':
      out.card = { id: C.redirect.id, text: C.redirect.text, speaker: speakerOf(C, null, C.archive.id), left: optionView(C.redirect.left), right: optionView(C.redirect.right) };
      break;
    case 'ending': {
      const r = C.routes[state.route];
      const panels = r.ending.panels;
      const i = state.endingPanelIndex;
      const side = state.choices[r.ending.card];
      out.ending = { route: r.id, title: r.ending.title, index: i, count: panels.length + 1, text: i < panels.length ? panels[i] : r.ending.variants[side] || '' };
      break;
    }
    case 'credits':
      out.credits = { route: state.route };
      break;
    default:
      break;
  }
  return out;
}

// The museum: every life in this history, in order, with what it made and
// what was actually chosen. The life being lived appears once its
// invention exists. Unplayed chapters never appear (spec 6).
export function history(state, C) {
  const ids = [...state.lives];
  const current = state.chapterId && !ids.includes(state.chapterId) && state.inventions[C.chapters[state.chapterId]?.invention.id] ? state.chapterId : null;
  if (current) ids.push(current);
  return ids.map((id) => {
    const c = C.chapters[id];
    const { era } = arrivalFor(state, C, c);
    const done = state.lives.includes(id);
    return {
      chapter: id, title: c.title, era, inventor: c.inventor.name, role: c.inventor.role,
      invention: { name: c.invention.name, description: c.invention.description },
      legacy: state.legacies[id] ? c.legacy[state.legacies[id]] : '',
      status: !done ? 'living' : c.final ? 'continues' : 'ended',
      death: done && !c.final ? obituaryOf(state, c) : '',
      choices: c.cards.filter((cd) => state.choices[cd.id]).map((cd) => ({ card: cd.id, kind: cd.kind, side: state.choices[cd.id], label: cd[state.choices[cd.id]].label })),
    };
  });
}

// A loaded save, checked against today's script. A save from another
// schema starts fresh; a chapter or card that no longer exists restarts
// that life at its arrival.
export function reconcile(saved, C) {
  if (!saved || saved.schemaVersion !== SCHEMA) return { state: null, problem: saved ? 'Your save is from another version of the game, so a new history begins.' : null };
  const state = clone(saved);
  if (state.chapterId && !C.chapters[state.chapterId]) return { state: null, problem: 'Your save refers to a life that is no longer in the script, so a new history begins.' };
  if (state.route && !C.routes[state.route]) return { state: null, problem: 'Your save refers to a future that is no longer in the script, so a new history begins.' };
  // Answers to cards the script no longer has are dropped, and a finished
  // life keeps its legacy as its last card's answer (lives can get shorter:
  // the Stone Age lives went from six cards to three)
  for (const id of Object.keys(state.choices)) {
    const m = /^([A-Z]\d+)\.\d+$/.exec(id);
    if (m && C.chapters[m[1]] && !C.cards[id]) delete state.choices[id];
  }
  for (const [id, side] of Object.entries(state.legacies)) {
    const ch = C.chapters[id];
    if (ch) state.choices[ch.cards[ch.lastIndex].id] = side;
  }
  // The life in progress restarts at its arrival if the saved moment no longer fits it
  const chapter = state.chapterId ? C.chapters[state.chapterId] : null;
  if (chapter && ['choice', 'result', 'reveal', 'epitaph'].includes(state.view) && !fits(state, C, chapter)) restartLife(state, chapter);
  state.content = C.hash;
  return { state, problem: null };
}

// A saved moment still makes sense: its card exists, a result belongs to an
// answered card, and nothing past the proof is played without the invention
function fits(state, C, chapter) {
  const i = state.cardIndex;
  if (state.view === 'reveal') return i === chapter.proofIndex && !!state.inventions[chapter.invention.id];
  if (state.view === 'epitaph') return state.lives.includes(chapter.id);
  if (state.view === 'result' && (state.pendingResultCard?.startsWith('OFFER.') || state.pendingResultCard === C.redirect?.id)) return true;
  const card = chapter.cards[i];
  if (!card) return false;
  if (i > chapter.proofIndex && !state.inventions[chapter.invention.id]) return false;
  if (state.view === 'result') return state.pendingResultCard === card.id && !!state.choices[card.id];
  return !state.choices[card.id];
}

function restartLife(state, chapter) {
  for (const cd of chapter.cards) delete state.choices[cd.id];
  delete state.legacies[chapter.id];
  delete state.obituaries[chapter.id];
  state.lives = state.lives.filter((l) => l !== chapter.id);
  Object.assign(state, { view: 'arrival', cardIndex: 0, pendingResultCard: null, lifeExposure: 0 });
}

// How far through this history the player is, for the header and History
export function progress(state, C) {
  const route = state.route ? C.routes[state.route] : null;
  return { lives: state.lives.length, inventions: Object.keys(state.inventions).length, route: route ? route.title : null };
}
