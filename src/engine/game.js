// The game: three scopes of state (life, timeline, collection), the phases of
// a life, and one atomic step per choice (spec 5, 8 and 16). No page code, so
// the browser, the tests and the simulation bot all run exactly this.

import { pickWeighted, seedFrom } from './rng.js';
import { applyEffects, conditionsHold, viable } from './rules.js';
import { pickScene, present } from './schedule.js';

export const SAVE_VERSION = 2;
const clone = (x) => JSON.parse(JSON.stringify(x));

function note(state, message) {
  state.diagnostics.push({ turn: state.turn, message });
  if (state.diagnostics.length > 30) state.diagnostics.shift();
}

function reject(state, reason) {
  return { state, events: [{ type: 'rejected', reason }] };
}

// {name} is this inventor, {previous} the last one, {maker} whoever made the
// thing a legacy line is about, {maker:pottery} whoever first made pottery.
export function fillText(text, state, extra = {}) {
  const archive = state.collection.archive;
  return String(text ?? '').replace(/\{(name|previous|maker)(?::([a-z0-9-]+))?\}/g, (whole, key, id) => {
    if (key === 'name') return state.life?.name ?? extra.name ?? 'you';
    if (key === 'previous') return state.timeline.previous?.name ?? 'someone';
    if (id) return archive[(state.timeline.makers[id] || 0) - 1]?.name ?? 'someone';
    return extra.maker ?? 'someone';
  });
}

export function newGame(content, { seed } = {}) {
  const s = seed ?? Math.floor(Math.random() * 2 ** 32);
  const state = {
    save: SAVE_VERSION,
    content: content.hash,
    seed: s,
    rng: seedFrom(s),
    turn: 0,
    phase: 'play',
    timeline: {
      n: 1, era: content.start.era, lives: 0, eraLives: 0,
      techs: [], makers: {}, legacies: {}, problem: null, previous: null,
      flags: {}, seen: {}, names: [], failures: {}, stall: 0, ending: null,
    },
    life: null,
    collection: { found: {}, failures: {}, endings: {}, archive: [], flags: {}, tutorialDone: false },
    pending: null,
    transition: null,
    diagnostics: [],
  };
  startLife(state, content, [], content.start.project || null);
  return state;
}

// Projects the next inventor could take on: in this era, prerequisites met,
// and something left to make. After a stall, prefer a missing required
// discovery (spec 9.4); a project invited by the featured problem comes first.
function chooseProject(state, content) {
  const { timeline } = state;
  const era = content.eras[timeline.era];
  const open = content.projectOrder.map((id) => content.projects[id]).filter((p) => p.era === era.id
    && p.requires.every((r) => timeline.techs.includes(r))
    && p.outcomes.some((o) => !timeline.techs.includes(o)));
  if (!open.length) return null;
  let pool = open;
  if (timeline.stall >= content.tuning.stallLives) {
    const missing = new Set([...era.required, era.keystone].filter((x) => x && !timeline.techs.includes(x)));
    const helpful = open.filter((p) => p.outcomes.some((o) => missing.has(o)));
    if (helpful.length) pool = helpful;
  }
  const invited = (p) => timeline.problem && Object.values(content.scenes).some((s) => s.project === p.id && s.phase === 'opening'
    && s.cond.all.some((c) => c.any.some((a) => a.t === 'problem' && a.id === timeline.problem.legacy && !a.neg)));
  return pickWeighted(state, pool, (p) => p.weight * (invited(p) ? 4 : 1));
}

function pickName(state, era) {
  const used = new Set(state.timeline.names);
  const fresh = era.names.filter((n) => !used.has(n));
  const pool = fresh.length ? fresh : era.names;
  return pickWeighted(state, pool, () => 1);
}

function startLife(state, content, events, forcedProject = null) {
  const { timeline } = state;
  const era = content.eras[timeline.era];
  const project = forcedProject ? content.projects[forcedProject] : chooseProject(state, content);
  if (!project) {
    state.phase = 'end';
    state.life = null;
    events.push({ type: 'end' });
    return;
  }
  state.life = {
    n: timeline.lives + 1, eraLife: timeline.eraLives + 1,
    name: pickName(state, era), era: era.id, project: project.id,
    phase: 'investigation', invest: 0, after: 0, decisions: 0, danger: 0,
    observed: [], look: project.look, marks: [], markAge: {},
    legacy: null, made: null, failed: null,
    flags: {}, queue: [], seen: [], lastSpeaker: null, current: null,
  };
  state.phase = 'play';
  events.push({ type: 'life', name: state.life.name, project: project.id });
  if (!nextScene(state, content, {})) {
    note(state, `Project ${project.id} has no scenes at all`);
    finishLife(state, content, { kind: 'natural' }, events);
  }
}

// Picks and presents the next scene. If an investigation runs out of scenes it
// goes to proof; returns false when nothing can be shown (the life concludes).
function nextScene(state, content, carry) {
  const diag = (m) => note(state, m);
  let picked = pickScene(state, content, diag);
  if (!picked && state.life.phase === 'investigation') {
    diag(`Ran out of investigation scenes for ${state.life.project}, so it goes to proof early`);
    state.life.phase = 'proof';
    state.life.queue = [];
    picked = pickScene(state, content, diag);
  }
  if (!picked) {
    if (state.life.phase === 'proof') diag(`No proof scene fits ${state.life.project}`);
    return false;
  }
  present(state, content, picked.scene, picked.how, carry);
  return true;
}

// The failed design a life leaves when nothing was committed: the first of
// its project's failures whose conditions hold.
function fallbackFailure(state, content) {
  const project = content.projects[state.life.project];
  const list = project.failures.map((id) => content.failures[id]).filter(Boolean);
  return (list.find((f) => conditionsHold(f.cond, state, content)) || list[0])?.id || null;
}

function pickDeath(state, content, cause) {
  if (cause.death && content.deaths[cause.death]) return content.deaths[cause.death];
  const kind = cause.kind === 'danger' ? 'danger' : 'natural';
  // A death with weight 0 is only used when the fatal answer names it
  const list = content.deathOrder.map((id) => content.deaths[id])
    .filter((d) => d.kind === kind && d.weight > 0 && (!d.project || d.project === state.life.project) && conditionsHold(d.cond, state, content));
  const specific = list.filter((d) => d.project);
  const pool = specific.length ? specific : list;
  if (!pool.length) {
    return { id: null, kind, text: kind === 'danger' ? 'The work got more dangerous than you did.' : 'You grew old, then older, then history.' };
  }
  return pickWeighted(state, pool, (d) => d.weight);
}

// A life ends: exactly one contribution is recorded, and its technology and
// legacy (if it made anything real) are published to the timeline.
function finishLife(state, content, cause, events) {
  const { life, timeline, collection } = state;
  const era = content.eras[life.era];
  let result;
  if (life.made) {
    result = { kind: 'invention', id: life.made.inv, status: timeline.techs.includes(life.made.inv) ? 'reinvention' : 'original' };
  } else {
    const id = life.failed || fallbackFailure(state, content);
    result = { kind: 'failure', id, status: (timeline.failures[id] || 0) > 0 ? 'reinvention' : 'failed' };
  }
  const inv = result.kind === 'invention' ? content.inventions[result.id] : null;
  const fail = result.kind === 'failure' ? content.failures[result.id] : null;
  const legacyId = inv ? (life.legacy || inv.legacies[0] || null) : null;
  const legacy = legacyId ? content.legacies[legacyId] : null;
  const death = pickDeath(state, content, cause);
  const i = collection.archive.length + 1;

  const refs = [];
  if (inv) for (const r of inv.requires) if (timeline.makers[r]) refs.push({ record: timeline.makers[r], why: 'enabled' });
  if (timeline.problem?.from) refs.push({ record: timeline.problem.from, why: 'problem' });

  const made = inv
    ? (inv.made || `Invented ${inv.name}.`)
    : `Invented ${fail?.name || 'something'}${result.status === 'reinvention' ? ', again' : ''}.`;
  const record = {
    i, timeline: timeline.n, life: life.n, eraLife: life.eraLife, era: life.era, project: life.project,
    name: life.name, result, legacy: legacyId,
    death: { kind: death.kind, id: death.id, text: fillText(death.text, state) },
    epitaph: {
      made: fillText(made, state),
      ended: fillText(death.text, state),
      legacy: fillText(legacy ? legacy.epitaph : fail?.epitaph || '', state),
    },
    inherit: '',
    closing: fillText(cause.result || '', state),
    // A legacy changed by the very last choice is announced on the epitaph (spec 8.4)
    notice: cause.notice && content.legacies[cause.notice.to] ? { changed: !!cause.notice.from, text: content.legacies[cause.notice.to].adoption } : null,
    look: (fail && fail.look) || life.look, marks: [...life.marks], observed: [...life.observed],
    danger: life.danger, decisions: life.decisions, refs,
    keystone: !!inv && era.keystone === inv.id && result.status === 'original',
    newFind: false,
  };

  if (inv && result.status === 'original') {
    timeline.techs.push(inv.id);
    timeline.makers[inv.id] = i;
    timeline.legacies[inv.id] = legacyId;
    timeline.problem = { legacy: legacyId, from: i };
    if (!collection.found[inv.id]) { collection.found[inv.id] = { first: i }; record.newFind = true; }
  } else if (fail) {
    // The world's problem stays; the next life hears about the attempt (spec 8.5).
    timeline.failures[fail.id] = (timeline.failures[fail.id] || 0) + 1;
    if (!collection.failures[fail.id]) record.newFind = true;
    collection.failures[fail.id] = (collection.failures[fail.id] || 0) + 1;
  }
  const required = inv && result.status === 'original' && (era.required.includes(inv.id) || era.keystone === inv.id);
  timeline.stall = required ? 0 : timeline.stall + 1;
  timeline.previous = { kind: result.kind, id: result.id, record: i, name: life.name };
  record.inherit = fillText(legacy ? legacy.inherit : fail?.inherit || '', state, { maker: life.name });
  timeline.lives += 1;
  timeline.eraLives += 1;
  timeline.names.push(life.name);
  if (life.project === content.start.project && life.n === 1) collection.tutorialDone = true;
  collection.archive.push(record);

  state.pending = record;
  state.phase = 'epitaph';
  life.current = null;
  events.push({ type: 'death', record });
}

// Resolves one choice, atomically, in the spec's order (16.6):
// validate, effects, proof commitment, danger death, phase, contribution, next scene.
export function choose(prev, content, action) {
  if (prev.phase !== 'play' || !prev.life?.current) return reject(prev, 'not playing');
  if (action.turn !== prev.turn || action.scene !== prev.life.current.id) return reject(prev, 'stale input');
  if (action.side !== 'left' && action.side !== 'right') return reject(prev, 'bad side');

  const state = clone(prev);
  const events = [];
  const { life } = state;
  const opt = life.current.def.options[action.side];
  life.decisions += 1;
  events.push({ type: 'choice', scene: life.current.id, side: action.side });

  const out = applyEffects(opt.ops, state, content, events);

  // A breakthrough commits before death is checked, so a fatal proof still counts.
  if (life.phase === 'proof' && !life.made && !life.failed) {
    if (out.commit && viable(state, content, out.commit)) {
      life.made = { inv: out.commit };
      events.push({ type: 'commit', inv: out.commit });
    } else if (out.commit) {
      note(state, `A proof answer tried to commit ${out.commit} without its recipe; it counts as a failed design`);
      life.failed = fallbackFailure(state, content);
    } else if (out.fail) {
      life.failed = out.fail;
      events.push({ type: 'fail', id: out.fail });
    }
  } else if (out.commit || out.fail) {
    note(state, `Ignored "${out.commit ? `commit ${out.commit}` : `fail ${out.fail}`}": only a proof scene can decide the result, once`);
  }

  // The legacy choice, which must belong to what this life made. The latest
  // explicit choice wins, and the screen says so when it changes (spec 8.4).
  let notice = null;
  if (out.legacy) {
    const leg = content.legacies[out.legacy];
    if (leg && life.made && leg.invention === life.made.inv) {
      if (life.legacy !== out.legacy) notice = { from: life.legacy, to: out.legacy };
      life.legacy = out.legacy;
      events.push({ type: 'legacy', id: out.legacy, changed: !!notice?.from });
    } else {
      note(state, `Legacy ${out.legacy} doesn't belong to what this life made`);
    }
  }
  if (out.ending) state.timeline.ending = out.ending;

  // Danger death
  if (life.danger >= content.tuning.dangerMax) {
    finishLife(state, content, { kind: 'danger', death: out.death, result: opt.result, notice }, events);
    state.turn += 1;
    return { state, events };
  }

  // Advance the phase
  const project = content.projects[life.project];
  let conclude = false;
  if (life.phase === 'investigation') {
    life.invest += 1;
    const ready = project.outcomes.some((o) => viable(state, content, o));
    if (life.invest >= project.investigation.max || (life.invest >= project.investigation.min && ready)) {
      life.phase = 'proof';
      life.queue = [];
      events.push({ type: 'phase', phase: 'proof' });
    }
  } else if (life.phase === 'proof') {
    if (!life.made && !life.failed) life.failed = fallbackFailure(state, content);
    if (life.made) {
      life.phase = 'aftermath';
      life.queue = [];
      events.push({ type: 'phase', phase: 'aftermath' });
    } else {
      conclude = true;
    }
  } else if (life.phase === 'aftermath') {
    life.after += 1;
    if (life.after >= content.tuning.aftermath) conclude = true;
  }

  if (!conclude && !nextScene(state, content, { result: fillText(opt.result, state), notice })) conclude = true;
  if (conclude) {
    if (life.phase === 'investigation' || (life.phase === 'proof' && !life.made && !life.failed)) life.failed = life.failed || fallbackFailure(state, content);
    finishLife(state, content, { kind: 'natural', result: opt.result, notice }, events);
  }
  state.turn += 1;
  return { state, events };
}

// Moves past the epitaph, the inheritance line, or the era transition.
export function advance(prev, content, action = {}) {
  if (action.turn != null && action.turn !== prev.turn) return reject(prev, 'stale input');
  const state = clone(prev);
  const events = [];
  if (state.phase === 'epitaph') {
    state.phase = 'inherit';
  } else if (state.phase === 'inherit') {
    const rec = state.pending;
    const era = content.eras[state.timeline.era];
    if (rec?.keystone && era.next && content.eras[era.next]) {
      state.transition = { from: era.id, to: era.next, record: rec.i };
      state.timeline.era = era.next;
      state.timeline.eraLives = 0;
      state.phase = 'transition';
      events.push({ type: 'era', from: era.id, to: era.next });
    } else {
      state.pending = null;
      startLife(state, content, events);
    }
  } else if (state.phase === 'transition') {
    state.transition = null;
    state.pending = null;
    startLife(state, content, events);
  } else {
    return reject(prev, 'nothing to advance');
  }
  state.turn += 1;
  return { state, events };
}

// The sky for this moment: each era steps through its skies every few decisions.
function skyFor(state, content, eraId) {
  const skies = content.eras[eraId]?.sky || [];
  if (!skies.length) return null;
  const life = state.life;
  const every = Math.max(1, content.tuning.skyEvery);
  const index = life ? (life.n + Math.floor(life.decisions / every)) % skies.length : 0;
  return skies[index];
}

function dangerAfter(opt, state, content) {
  let d = state.life.danger;
  for (const op of opt.ops) {
    if (op.t !== 'danger' || (op.when && !conditionsHold(op.when, state, content))) continue;
    d = Math.max(0, op.op === '=' ? op.n : d + op.n);
  }
  return d;
}

function progressFor(state, content) {
  const { life } = state;
  const p = content.projects[life.project];
  if (life.phase === 'investigation') {
    const step = life.invest + 1;
    return { phase: 'investigation', label: 'Investigating', step, min: p.investigation.min, max: p.investigation.max,
      text: step <= p.investigation.min ? `${step} of ${p.investigation.min}` : 'still testing' };
  }
  if (life.phase === 'proof') return { phase: 'proof', label: 'Proving', text: 'one decision' };
  const left = content.tuning.aftermath - life.after;
  return { phase: 'aftermath', label: 'Aftermath', remaining: left, text: `${left} left` };
}

function charView(content, id) {
  const c = id ? content.characters[id] : null;
  return c ? { id: c.id, name: c.name, portrait: c.portrait, role: c.role } : null;
}

// Everything the screen needs to draw this moment, and nothing hidden:
// no recipes, no pending follow-ups (spec 3.5).
export function view(state, content) {
  const life = state.life;
  const eraId = life?.era || state.timeline.era;
  const era = content.eras[eraId];
  const out = {
    phase: state.phase,
    turn: state.turn,
    era: { id: era.id, name: era.name, theme: era.theme, bench: era.bench, intro: era.intro },
    sky: skyFor(state, content, eraId),
    timeline: { lives: state.timeline.lives, techs: state.timeline.techs.map((t) => ({ id: t, name: content.inventions[t]?.name || t })) },
  };
  if (state.phase === 'play' && life?.current) {
    const def = life.current.def;
    const project = content.projects[life.project];
    out.inventor = { name: life.name, n: life.n, eraLife: life.eraLife };
    out.project = { id: project.id, name: project.name, problem: fillText(project.problem, state) };
    out.object = { project: life.project, look: life.look, marks: [...life.marks] };
    out.evidence = life.observed.slice(-3).map((id) => ({ id, text: content.observations[id]?.text || id }));
    out.danger = { value: life.danger, max: content.tuning.dangerMax };
    out.progress = progressFor(state, content);
    out.scene = {
      id: def.id, phase: def.phase, text: fillText(def.text, state), speaker: charView(content, def.speaker),
      result: life.current.result, weather: def.weather ? content.weather[def.weather] || null : null,
    };
    const notice = life.current.notice;
    if (notice && content.legacies[notice.to]) {
      out.scene.notice = { changed: !!notice.from, text: content.legacies[notice.to].adoption };
    }
    out.options = {};
    for (const side of ['left', 'right']) {
      const opt = def.options[side];
      const after = dangerAfter(opt, state, content);
      out.options[side] = {
        label: opt.label, preview: opt.preview,
        danger: after - life.danger, fatal: after >= content.tuning.dangerMax,
        because: opt.because.map((tech) => content.inventions[tech]?.capability || tech),
      };
    }
    out.legacy = life.legacy ? { id: life.legacy, text: content.legacies[life.legacy]?.adoption || '' } : null;
    out.made = life.made ? content.inventions[life.made.inv]?.name : null;
  }
  if ((state.phase === 'epitaph' || state.phase === 'inherit') && state.pending) out.record = state.pending;
  if (state.phase === 'transition' && state.transition) {
    const to = content.eras[state.transition.to];
    out.transition = { from: content.eras[state.transition.from]?.name, to: to?.name, intro: to?.intro, theme: to?.theme, skies: to?.sky || [] };
  }
  return out;
}

// A loaded save, checked against today's content. A scene waiting for an
// answer keeps its frozen definition; anything that no longer exists gets a
// fresh start at a safe boundary.
export function reconcile(saved, content) {
  if (!saved || saved.save !== SAVE_VERSION) {
    return { state: null, problem: saved ? "Your save is from an older version of the game, so a new timeline has started." : null };
  }
  const state = clone(saved);
  state.diagnostics ||= [];
  if (!content.eras[state.timeline.era]) {
    return { state: null, problem: 'Your save refers to an era that no longer exists, so a new timeline has started.' };
  }
  if (state.phase === 'play' && state.life) {
    if (!content.projects[state.life.project]) {
      note(state, `Project ${state.life.project} no longer exists; a new life begins`);
      startLife(state, content, []);
    } else if (!state.life.current) {
      if (!nextScene(state, content, {})) finishLife(state, content, { kind: 'natural' }, []);
    }
  }
  if (state.phase === 'play' && !state.life) startLife(state, content, []);
  state.content = content.hash;
  return { state, problem: null };
}

// Developer shortcuts for testing on a phone (?dev). They bend the rules on
// purpose, so the normal game never calls them.
export function devAction(prev, content, action) {
  const state = clone(prev);
  const events = [];
  const { life, timeline } = state;
  switch (action.kind) {
    case 'grant':
      if (content.inventions[action.inv] && !timeline.techs.includes(action.inv)) timeline.techs.push(action.inv);
      break;
    case 'observe':
      if (life) for (const o of Object.values(content.observations)) if (o.project === life.project && !life.observed.includes(o.id)) life.observed.push(o.id);
      break;
    case 'danger':
      if (life) life.danger = Math.max(0, Number(action.n) || 0);
      break;
    case 'proof':
      if (state.phase === 'play' && life && life.phase === 'investigation') {
        life.phase = 'proof';
        life.queue = [];
        if (!nextScene(state, content, {})) finishLife(state, content, { kind: 'natural' }, events);
      }
      break;
    case 'kill':
      if (state.phase === 'play' && life) finishLife(state, content, { kind: 'danger' }, events);
      break;
    default:
      return reject(prev, 'unknown dev action');
  }
  state.turn += 1;
  return { state, events };
}
