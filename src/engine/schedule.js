// Which scene comes next. Proof and aftermath scenes can't be displaced by
// ordinary encounters, and within an investigation the order is (spec 16.5):
//   1. a required follow-up    2. a due inherited-history callback
//   3. a project scene that can establish missing evidence    4. anything else that fits
// Variation is seeded, so a reload never rerolls the next scene.

import { pickWeighted, random } from './rng.js';
import { conditionsHold, viable } from './rules.js';

const clone = (x) => JSON.parse(JSON.stringify(x));

function eligible(scene, state, content) {
  const { life, timeline } = state;
  if (!scene) return false;
  if (scene.project && scene.project !== life.project) return false;
  if (life.seen.includes(scene.id)) return false; // no repeats within a life
  if (scene.cond.once && timeline.seen[scene.id]) return false;
  return conditionsHold(scene.cond, state, content);
}

function phaseFits(scenePhase, life) {
  if (life.phase === 'investigation') return ['opening', 'investigation', 'callback'].includes(scenePhase);
  return scenePhase === life.phase;
}

// A soft preference: someone other than the last speaker, where possible.
function prefer(list, state) {
  const other = list.filter((s) => !s.speaker || s.speaker !== state.life.lastSpeaker);
  return other.length ? other : list;
}

const pick = (state, list) => pickWeighted(state, list, (s) => s.weight);

// Does one of its answers establish an observation this project still needs?
function establishesMissing(scene, state, content) {
  const project = content.projects[state.life.project];
  const essential = new Set(project.outcomes.flatMap((o) => content.inventions[o]?.recipe.flat() || []));
  return ['left', 'right'].some((side) => scene.options[side].ops.some((op) => op.t === 'observe' && essential.has(op.id) && !state.life.observed.includes(op.id)));
}

// A proof scene can show only if every answer resolves to something real:
// a supported invention, or a failed design (spec 5.3).
function proofValid(scene, state, content) {
  return ['left', 'right'].every((side) => {
    const ops = scene.options[side].ops;
    const commit = ops.find((o) => o.t === 'commit');
    if (commit) return viable(state, content, commit.id);
    return ops.some((o) => o.t === 'fail');
  });
}
const commits = (scene) => ['left', 'right'].some((side) => scene.options[side].ops.some((o) => o.t === 'commit'));

export function pickScene(state, content, diag = () => {}) {
  const { life } = state;
  const all = content.sceneOrder.map((id) => content.scenes[id]);
  const inPhase = (phases) => all.filter((s) => phases.includes(s.phase) && eligible(s, state, content));

  // 1. Required follow-ups, when they belong to this phase
  while (life.queue.length) {
    const id = life.queue.shift();
    const s = content.scenes[id];
    if (life.seen.includes(id)) continue; // it already came up on its own
    const fits = s && phaseFits(s.phase, life);
    if (fits && eligible(s, state, content)) return { scene: s, how: 'follow-up' };
    diag(`Follow-up ${id} was skipped (${!s ? 'no such scene' : !fits ? `it's a ${s.phase} scene during ${life.phase}` : 'its conditions failed'})`);
  }

  if (life.phase === 'investigation') {
    if (life.invest === 0) {
      const openings = inPhase(['opening']);
      if (openings.length) return { scene: pick(state, prefer(openings, state)), how: 'opening' };
      diag(`Project ${life.project} has no opening scene that fits`);
    }
    // 2. The inherited-history callback: soon after the opening, and by
    //    decision callbackBy at the latest (spec 8.6)
    const callbacks = inPhase(['callback']);
    const hadCallback = life.seen.some((id) => content.scenes[id]?.phase === 'callback');
    if (callbacks.length && life.invest >= 1 && !hadCallback) {
      const due = life.invest >= content.tuning.callbackBy - 1 || random(state) < 0.5;
      if (due) return { scene: pick(state, prefer(callbacks, state)), how: 'callback' };
    }
    const pool = inPhase(['investigation']);
    // 3. Scenes that can establish missing evidence
    const evidence = pool.filter((s) => s.project && establishesMissing(s, state, content));
    if (evidence.length) return { scene: pick(state, prefer(evidence, state)), how: 'evidence' };
    // 4. Anything else that fits
    if (pool.length) return { scene: pick(state, prefer(pool, state)), how: 'context' };
    return null;
  }

  if (life.phase === 'proof') {
    const proofs = inPhase(['proof']).filter((s) => s.project === life.project && proofValid(s, state, content));
    const ready = content.projects[life.project].outcomes.some((o) => viable(state, content, o));
    const best = proofs.filter((s) => (ready ? commits(s) : !commits(s)));
    const list = best.length ? best : proofs;
    return list.length ? { scene: pick(state, list), how: 'proof' } : null;
  }

  if (life.phase === 'aftermath') {
    const pool = inPhase(['aftermath']);
    const mine = pool.filter((s) => s.project === life.project);
    const list = mine.length ? mine : pool;
    return list.length ? { scene: pick(state, prefer(list, state)), how: 'aftermath' } : null;
  }
  return null;
}

// Puts a scene in front of the player. Its definition is frozen into the
// save, so a content update can't change a scene while it waits (spec 16.7).
export function present(state, content, scene, how, carry = {}) {
  const { life, timeline } = state;
  // Transient overlays are seen with one scene, then clear themselves.
  for (const m of [...life.marks]) {
    if (!content.transient.includes(m)) continue;
    const age = (life.markAge[m] ?? 0) + 1;
    if (age > 1) { life.marks = life.marks.filter((x) => x !== m); delete life.markAge[m]; } else life.markAge[m] = age;
  }
  for (const op of scene.shows || []) {
    if (op.when && !conditionsHold(op.when, state, content)) continue;
    if (op.t === 'look') life.look = op.id;
    if (op.t === 'mark' && !life.marks.includes(op.id)) { life.marks.push(op.id); life.markAge[op.id] = 1; }
    if (op.t === 'unmark') life.marks = life.marks.filter((m) => m !== op.id);
  }
  life.current = { id: scene.id, def: clone(scene), n: life.decisions + 1, how, result: carry.result || '', notice: carry.notice || null };
  life.seen.push(scene.id);
  timeline.seen[scene.id] = (timeline.seen[scene.id] || 0) + 1;
  life.lastSpeaker = scene.speaker;
}
