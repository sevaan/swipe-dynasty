// Turns the writer-facing files in content/ into one validated content object.
// The browser, the checker, the tests and the simulation bot all use this, so
// a scene that works in one works in all of them. See spec.md §16.3–16.4.

import { tableFromCSV } from './csv.js';
import { normId, parseConditions, parseEffects, parseRecipe, splitList } from './syntax.js';
import { artPath, artProblems, artReferences } from './art.js';

// Weather and ambient effects the interface can draw (see src/ui/fx.js).
export const EFFECTS = ['rain', 'lightning', 'embers', 'smoke', 'flames', 'sparks', 'dust', 'stars', 'fireflies', 'grain', 'birds', 'shake'];
export const PHASES = ['opening', 'investigation', 'callback', 'proof', 'aftermath'];
const TYPES = { 'stepping stone': 'stepping', 'stepping-stone': 'stepping', stepping: 'stepping', optional: 'optional', keystone: 'keystone' };
const SCOPES = ['life', 'timeline', 'forever'];
const DEATH_KINDS = ['danger', 'natural'];
const EMOJI = /\p{Extended_Pictographic}/u;
const HEX = /^#[0-9a-fA-F]{6}$/;

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const COLUMNS = {
  characters: { required: ['id', 'name'], optional: ['portrait', 'role', 'notes'] },
  flags: { required: ['id', 'scope'], optional: ['default', 'notes'] },
  observations: { required: ['id', 'project', 'text'], optional: ['notes'] },
  projects: { required: ['id', 'era', 'name', 'problem', 'outcomes'], optional: ['failures', 'start look', 'requires', 'investigation', 'weight', 'notes'] },
  inventions: { required: ['id', 'era', 'type', 'name', 'project', 'recipe', 'legacies'], optional: ['requires', 'made', 'look', 'capability', 'museum', 'hint', 'notes'] },
  legacies: { required: ['id', 'invention', 'adoption', 'problem', 'inherit', 'epitaph'], optional: ['change', 'notes'] },
  failures: { required: ['id', 'project', 'name', 'epitaph', 'inherit'], optional: ['conditions', 'look', 'notes'] },
  deaths: { required: ['id', 'kind', 'text'], optional: ['project', 'conditions', 'weight', 'notes'] },
  scenes: {
    required: ['id', 'phase', 'text', 'left', 'right'],
    optional: ['project', 'speaker', 'shows', 'left preview', 'left result', 'left effects', 'right preview', 'right result', 'right effects', 'conditions', 'weight', 'weather', 'notes'],
  },
};

function hashText(parts) {
  let h = 0x811c9dc5;
  for (const part of parts) {
    for (let i = 0; i < part.length; i++) {
      h ^= part.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
  }
  return h.toString(16).padStart(8, '0');
}

const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;
const numberOr = (v, d) => (v === '' || v == null || !Number.isFinite(Number(v)) ? d : Number(v));

export function compileContent(files, options = {}) {
  const errors = [];
  const warnings = [];
  const err = (file, line, column, message) => errors.push({ file, line, column, message });
  const warn = (file, line, column, message) => warnings.push({ file, line, column, message });

  let world;
  try {
    world = JSON.parse(files['world.json']);
  } catch (e) {
    err('world.json', 0, '', `world.json isn't valid JSON: ${e.message}`);
    return { content: null, errors, warnings };
  }
  const paths = world.files || {};

  const t = world.tuning || {};
  const content = {
    title: world.title || 'Untitled',
    tuning: {
      dangerMax: numberOr(t.dangerMax, 6),
      investigationMin: numberOr(t.investigationMin, 6),
      investigationMax: numberOr(t.investigationMax, 8),
      aftermath: numberOr(t.aftermath, 3),
      callbackBy: numberOr(t.callbackBy, 3),
      stallLives: numberOr(t.stallLives, 2),
      skyEvery: numberOr(t.skyEvery, 4),
    },
    start: { era: normId(world.start?.era || ''), project: normId(world.start?.project || '') },
    // Overlays that last one scene, then clear themselves (a glint, a puff of smoke)
    transient: splitList((world.transient || []).join(';')),
    weather: {},
    eras: {}, eraOrder: [],
    characters: {}, flags: {},
    observations: {},
    projects: {}, projectOrder: [],
    inventions: {}, inventionOrder: [],
    legacies: {},
    failures: {}, failureOrder: [],
    deaths: {}, deathOrder: [],
    scenes: {}, sceneOrder: [],
    looks: {}, marks: {},
  };

  // Weather (JSON): a named mood a scene can set: a sky colour and effects.
  const checkFx = (list, where) => (Array.isArray(list) ? list : []).map(normId).filter((f) => {
    if (EFFECTS.includes(f)) return true;
    err('world.json', 0, where, `Unknown effect "${f}" (known: ${EFFECTS.join(', ')})`);
    return false;
  });
  for (const [rawId, raw] of Object.entries(world.weather || {})) {
    const id = normId(rawId);
    if (raw.bg != null && !HEX.test(raw.bg)) err('world.json', 0, `weather.${id}.bg`, `"${raw.bg}" should be a colour like #1b2530`);
    content.weather[id] = { id, bg: HEX.test(raw.bg || '') ? raw.bg : null, fx: checkFx(raw.fx, `weather.${id}.fx`) };
  }

  // Eras (JSON)
  for (const raw of world.eras || []) {
    const id = normId(raw.id || '');
    if (!id) { err('world.json', 0, 'eras', 'An era is missing its id'); continue; }
    if (content.eras[id]) { err('world.json', 0, 'eras', `Era "${id}" is listed twice`); continue; }
    content.eras[id] = {
      id, name: raw.name || id, intro: raw.intro || '',
      required: splitList((raw.required || []).join(';')),
      optional: splitList((raw.optional || []).join(';')),
      keystone: raw.keystone ? normId(raw.keystone) : null,
      next: raw.next ? normId(raw.next) : null,
      bench: normId(raw.bench || id),
      theme: raw.theme || {},
      sky: (Array.isArray(raw.sky) && raw.sky.length ? raw.sky : [{ name: 'day', bg: raw.theme?.bg || '#2a1c14' }]).map((sk, i) => {
        if (!HEX.test(sk.bg || '')) err('world.json', 0, `eras.${id}.sky`, `Sky ${i + 1} needs a colour like #2a1c14`);
        return { name: sk.name || `sky ${i + 1}`, bg: HEX.test(sk.bg || '') ? sk.bg : '#2a1c14', fx: checkFx(sk.fx, `eras.${id}.sky`) };
      }),
      names: Array.isArray(raw.names) && raw.names.length ? raw.names : ['Someone'],
    };
    content.eraOrder.push(id);
  }
  if (!content.eras[content.start.era]) err('world.json', 0, 'start.era', `Start era "${content.start.era}" doesn't exist`);

  function table(kind, path) {
    const text = files[path];
    if (text == null) { err(path, 0, '', `Missing file ${path}`); return []; }
    const { header, records, error } = tableFromCSV(text);
    if (error) { err(path, error.line, '', error.message); return []; }
    const spec = COLUMNS[kind];
    for (const col of spec.required) if (!header.includes(col)) err(path, 1, col, `Missing column "${col}"`);
    for (const col of header) {
      if (col && !spec.required.includes(col) && !spec.optional.includes(col)) warn(path, 1, col, `Unknown column "${col}" (ignored)`);
    }
    for (const r of records) if (r.extra) warn(path, r.line, '', 'This row has more cells than the header (a stray comma?)');
    return records;
  }
  const once = (map, id, file, line, what) => {
    if (!id) { err(file, line, 'id', `A ${what} is missing its id`); return false; }
    if (map[id]) { err(file, line, 'id', `Duplicate ${what} "${id}"`); return false; }
    return true;
  };

  // First pass: every id, so cells can refer to anything anywhere.
  const P = {
    characters: paths.characters || 'characters.csv', flags: paths.flags || 'flags.csv',
    observations: paths.observations || 'observations.csv', projects: paths.projects || 'projects.csv',
    inventions: paths.inventions || 'inventions.csv', legacies: paths.legacies || 'legacies.csv',
    failures: paths.failures || 'failures.csv', deaths: paths.deaths || 'deaths.csv',
  };
  const rows = {};
  for (const kind of Object.keys(P)) rows[kind] = table(kind, P[kind]);
  const sceneRows = (paths.scenes || []).flatMap((path) => table('scenes', path).map((r) => ({ ...r, path })));

  const ctx = {
    techs: new Set(rows.inventions.map((r) => normId(r.values.id))),
    observations: new Set(rows.observations.map((r) => normId(r.values.id))),
    legacies: new Set(rows.legacies.map((r) => normId(r.values.id))),
    failures: new Set(rows.failures.map((r) => normId(r.values.id))),
    flags: new Set(rows.flags.map((r) => normId(r.values.id))),
    deaths: new Set(rows.deaths.map((r) => normId(r.values.id))),
  };
  const conds = (cell, file, line, column) => {
    const c = parseConditions(cell, ctx);
    for (const e of c.errors) err(file, line, column, e);
    return c;
  };

  // Characters: the small figures and voices beside the object.
  for (const { line, values: v } of rows.characters) {
    const id = normId(v.id);
    if (!once(content.characters, id, P.characters, line, 'character')) continue;
    content.characters[id] = { id, name: v.name, portrait: v.portrait ? normId(v.portrait) : null, role: v.role || '', line };
  }

  // Flags
  for (const { line, values: v } of rows.flags) {
    const id = normId(v.id);
    if (!once(content.flags, id, P.flags, line, 'flag')) continue;
    const scope = normId(v.scope || 'life');
    if (!SCOPES.includes(scope)) err(P.flags, line, 'scope', `Scope must be life, timeline or forever, not "${v.scope}"`);
    content.flags[id] = { id, scope, def: numberOr(v.default, 0), line };
  }

  // Projects: one practical ambition per life.
  for (const { line, values: v } of rows.projects) {
    const id = normId(v.id);
    if (!once(content.projects, id, P.projects, line, 'project')) continue;
    const era = normId(v.era);
    if (!content.eras[era]) err(P.projects, line, 'era', `No era "${v.era}"`);
    const inv = String(v.investigation || '').trim();
    let min = content.tuning.investigationMin;
    let max = content.tuning.investigationMax;
    const range = /^(\d+)\s*(?:-|–|to)\s*(\d+)$/.exec(inv);
    if (range) { min = Number(range[1]); max = Number(range[2]); }
    else if (/^\d+$/.test(inv)) { min = max = Number(inv); }
    else if (inv) err(P.projects, line, 'investigation', `"${inv}" should be a number of decisions like 4, or a range like 6-8`);
    if (min > max || min < 1) err(P.projects, line, 'investigation', 'The investigation needs at least one decision, and the minimum must not exceed the maximum');
    content.projects[id] = {
      id, era, name: v.name, problem: v.problem,
      outcomes: splitList(v.outcomes), failures: splitList(v.failures),
      look: normId(v['start look'] || 'start'), requires: splitList(v.requires),
      investigation: { min, max }, weight: numberOr(v.weight, 1), line,
    };
    content.projectOrder.push(id);
  }

  // Observations: facts a life can establish.
  for (const { line, values: v } of rows.observations) {
    const id = normId(v.id);
    if (!once(content.observations, id, P.observations, line, 'observation')) continue;
    const project = normId(v.project);
    if (!content.projects[project]) err(P.observations, line, 'project', `No project "${v.project}"`);
    content.observations[id] = { id, project, text: v.text, line };
  }

  // Inventions
  for (const { line, values: v } of rows.inventions) {
    const id = normId(v.id);
    if (!once(content.inventions, id, P.inventions, line, 'invention')) continue;
    const type = TYPES[normId(v.type).replace(/-/g, ' ')] || TYPES[normId(v.type)];
    if (!type) err(P.inventions, line, 'type', `Type must be stepping stone, optional or keystone, not "${v.type}"`);
    const era = normId(v.era);
    if (!content.eras[era]) err(P.inventions, line, 'era', `No era "${v.era}"`);
    const project = normId(v.project);
    if (!content.projects[project]) err(P.inventions, line, 'project', `No project "${v.project}"`);
    const recipe = parseRecipe(v.recipe, ctx);
    for (const e of recipe.errors) err(P.inventions, line, 'recipe', e);
    for (const alt of recipe.any) {
      for (const o of alt) if (content.observations[o] && content.observations[o].project !== project) err(P.inventions, line, 'recipe', `"${o}" belongs to project ${content.observations[o].project}, not ${project}`);
      if (alt.length > 3) warn(P.inventions, line, 'recipe', 'A recipe should need no more than three observations (spec 6.2)');
    }
    const legacies = splitList(v.legacies);
    if (legacies.length !== 2) (legacies.length ? warn : err)(P.inventions, line, 'legacies', `An invention ships with two legacy packages; this one has ${legacies.length}`);
    const requires = splitList(v.requires);
    for (const r of requires) if (!ctx.techs.has(r)) err(P.inventions, line, 'requires', `No invention "${r}"`);
    content.inventions[id] = {
      id, era, type, name: v.name, project, requires, recipe: recipe.any,
      made: v.made || '', look: v.look ? normId(v.look) : null, legacies,
      capability: v.capability || v.name, museum: v.museum || '', hint: v.hint || '', line,
    };
    content.inventionOrder.push(id);
  }

  // Legacy packages: how an invention spreads, and the problem it leaves.
  for (const { line, values: v } of rows.legacies) {
    const id = normId(v.id);
    if (!once(content.legacies, id, P.legacies, line, 'legacy')) continue;
    const invention = normId(v.invention);
    if (!content.inventions[invention]) err(P.legacies, line, 'invention', `No invention "${v.invention}"`);
    else if (!content.inventions[invention].legacies.includes(id)) err(P.legacies, line, 'invention', `${invention} doesn't list ${id} in its legacies column`);
    content.legacies[id] = { id, invention, adoption: v.adoption, problem: v.problem, inherit: v.inherit, epitaph: v.epitaph, change: v.change || '', line };
  }
  for (const inv of Object.values(content.inventions)) {
    for (const l of inv.legacies) if (!content.legacies[l]) err(P.inventions, inv.line, 'legacies', `No legacy package "${l}"`);
  }

  // Failed designs: what a life leaves when nothing worked.
  for (const { line, values: v } of rows.failures) {
    const id = normId(v.id);
    if (!once(content.failures, id, P.failures, line, 'failed design')) continue;
    const project = normId(v.project);
    if (!content.projects[project]) err(P.failures, line, 'project', `No project "${v.project}"`);
    content.failures[id] = {
      id, project, name: v.name, epitaph: v.epitaph, inherit: v.inherit,
      cond: conds(v.conditions, P.failures, line, 'conditions'), look: v.look ? normId(v.look) : null, notes: v.notes || '', line,
    };
    content.failureOrder.push(id);
  }

  // Deaths: how a life ends, in danger or of old age.
  for (const { line, values: v } of rows.deaths) {
    const id = normId(v.id);
    if (!once(content.deaths, id, P.deaths, line, 'death')) continue;
    const kind = normId(v.kind);
    if (!DEATH_KINDS.includes(kind)) err(P.deaths, line, 'kind', `Kind must be danger or natural, not "${v.kind}"`);
    const project = v.project ? normId(v.project) : null;
    if (project && !content.projects[project]) err(P.deaths, line, 'project', `No project "${v.project}"`);
    content.deaths[id] = { id, kind, project, text: v.text, cond: conds(v.conditions, P.deaths, line, 'conditions'), weight: numberOr(v.weight, 1), notes: v.notes || '', line };
    content.deathOrder.push(id);
  }

  // Scenes: a situation and exactly two approaches.
  const addLook = (project, look, where) => {
    if (!project || !look) return;
    (content.looks[project] ||= {});
    if (!content.looks[project][look]) content.looks[project][look] = where;
  };
  for (const { line, values: v, path } of sceneRows) {
    const id = normId(v.id);
    if (!once(content.scenes, id, path, line, 'scene')) continue;
    const phase = normId(v.phase);
    if (!PHASES.includes(phase)) err(path, line, 'phase', `Phase must be one of ${PHASES.join(', ')}, not "${v.phase}"`);
    const project = v.project ? normId(v.project) : null;
    if (project && !content.projects[project]) err(path, line, 'project', `No project "${v.project}"`);
    const speaker = v.speaker ? normId(v.speaker) : null;
    if (speaker && !content.characters[speaker]) err(path, line, 'speaker', `No character "${v.speaker}"`);
    const weather = v.weather ? normId(v.weather) : null;
    if (weather && !content.weather[weather]) err(path, line, 'weather', `No weather "${v.weather}" in world.json`);
    const options = {};
    for (const side of ['left', 'right']) {
      const label = v[side];
      if (!label) err(path, line, side, `A scene needs exactly two answers; the ${side} one is empty`);
      const fx = parseEffects(v[`${side} effects`], ctx);
      for (const e of fx.errors) err(path, line, `${side} effects`, e);
      const ops = fx.ops;
      const where = { file: path, line, column: `${side} effects` };
      for (const op of ops) {
        if (op.t === 'look') addLook(project, op.id, where);
        if (op.t === 'mark' && !content.marks[op.id]) content.marks[op.id] = where;
        if ((op.t === 'commit' || op.t === 'fail') && phase !== 'proof') err(path, line, `${side} effects`, `"${op.t} ${op.id}" only works in a proof scene`);
        if (op.t === 'commit' && project && content.projects[project] && !content.projects[project].outcomes.includes(op.id)) err(path, line, `${side} effects`, `${op.id} isn't an outcome of project ${project}`);
        if (op.t === 'fail' && project && content.failures[op.id] && content.failures[op.id].project !== project) err(path, line, `${side} effects`, `${op.id} is a failed design of ${content.failures[op.id].project}, not ${project}`);
        if (op.t === 'legacy' && !['proof', 'aftermath'].includes(phase)) err(path, line, `${side} effects`, 'A legacy can only be chosen in a proof or aftermath scene');
      }
      const result = v[`${side} result`] || '';
      if (words(label) > 8) warn(path, line, side, `Answer is ${words(label)} words; aim for 2–8`);
      if (words(result) > 20) warn(path, line, `${side} result`, `Result is ${words(result)} words; aim for 5–20`);
      const danger = ops.filter((o) => o.t === 'danger').reduce((d, o) => (o.op === '=' ? o.n : d + o.n), 0);
      options[side] = {
        side, label, preview: v[`${side} preview`] || '', result, ops,
        because: ops.filter((o) => o.t === 'because').map((o) => o.id),
        danger, absolute: ops.some((o) => o.t === 'danger' && o.op === '='),
      };
    }
    if (words(v.text) > 45) warn(path, line, 'text', `Scene is ${words(v.text)} words; aim for 20–45`);
    // "shows": how the object looks when this scene appears (look, mark and
    // unmark only, each optionally with "if")
    const shown = parseEffects(v.shows, ctx);
    for (const e of shown.errors) err(path, line, 'shows', e);
    const shows = shown.ops.filter((op) => {
      if (['look', 'mark', 'unmark'].includes(op.t)) return true;
      err(path, line, 'shows', '"shows" can only use look, mark and unmark');
      return false;
    });
    for (const op of shows) {
      if (op.t === 'look') addLook(project, op.id, { file: path, line, column: 'shows' });
      if (op.t === 'mark' && !content.marks[op.id]) content.marks[op.id] = { file: path, line, column: 'shows' };
    }
    const cond = conds(v.conditions, path, line, 'conditions');
    for (const side of ['left', 'right']) {
      for (const tech of options[side].because) {
        const gated = cond.all.some((c) => c.any.length === 1 && c.any[0].t === 'has' && c.any[0].id === tech && !c.any[0].neg);
        if (!gated) warn(path, line, `${side} effects`, `"because ${tech}" shows "Possible because of", so the scene's conditions should include "has ${tech}"`);
      }
    }
    content.scenes[id] = {
      id, phase, project, speaker, text: v.text, options, cond, shows,
      weight: numberOr(v.weight, 1), weather, src: { file: path, line }, notes: v.notes || '',
    };
    content.sceneOrder.push(id);
  }

  // Cross-checks, now that everything is loaded
  for (const s of Object.values(content.scenes)) {
    for (const side of ['left', 'right']) {
      for (const op of s.options[side].ops) {
        if (op.t === 'next' && !content.scenes[op.id]) err(s.src.file, s.src.line, `${side} effects`, `"next ${op.id}": no scene with that id`);
        if (op.t === 'legacy' && s.project && content.legacies[op.id]) {
          const inv = content.legacies[op.id].invention;
          if (!content.projects[s.project]?.outcomes.includes(inv)) err(s.src.file, s.src.line, `${side} effects`, `${op.id} is a legacy of ${inv}, which project ${s.project} can't make`);
        }
      }
    }
    for (const clause of s.cond.all) {
      for (const a of clause.any) {
        if (a.t === 'seen' && !content.scenes[a.id]) err(s.src.file, s.src.line, 'conditions', `"seen ${a.id}": no scene with that id`);
        if (a.t === 'previous' && !content.inventions[a.id] && !content.failures[a.id]) err(s.src.file, s.src.line, 'conditions', `"previous ${a.id}": no invention or failed design with that id`);
        if (a.t === 'era' && !content.eras[a.id]) err(s.src.file, s.src.line, 'conditions', `No era "${a.id}"`);
        if (a.t === 'project' && !content.projects[a.id]) err(s.src.file, s.src.line, 'conditions', `No project "${a.id}"`);
      }
    }
  }
  for (const p of Object.values(content.projects)) {
    addLook(p.id, p.look, { file: P.projects, line: p.line, column: 'start look' });
    for (const o of p.outcomes) {
      const inv = content.inventions[o];
      if (!inv) { err(P.projects, p.line, 'outcomes', `No invention "${o}"`); continue; }
      if (inv.project !== p.id) err(P.projects, p.line, 'outcomes', `${o} belongs to project ${inv.project}`);
      if (inv.look) addLook(p.id, inv.look, { file: P.inventions, line: inv.line, column: 'look' });
    }
    for (const f of p.failures) if (!content.failures[f]) err(P.projects, p.line, 'failures', `No failed design "${f}"`);
    for (const f of p.failures) if (content.failures[f]?.look) addLook(p.id, content.failures[f].look, { file: P.failures, line: content.failures[f].line, column: 'look' });
    for (const r of p.requires) if (!content.inventions[r]) err(P.projects, p.line, 'requires', `No invention "${r}"`);
    if (!p.failures.length) err(P.projects, p.line, 'failures', 'A project needs at least one failed design, for a life that dies before its proof');

    // Coverage the spec's project kit needs (§17.1)
    const mine = Object.values(content.scenes).filter((s) => s.project === p.id);
    const commits = new Set(mine.filter((s) => s.phase === 'proof').flatMap((s) => [...s.options.left.ops, ...s.options.right.ops]).filter((o) => o.t === 'commit').map((o) => o.id));
    for (const o of p.outcomes) if (!commits.has(o)) warn(P.projects, p.line, 'outcomes', `No proof scene commits ${o}`);
    const failProof = mine.some((s) => s.phase === 'proof' && ['left', 'right'].every((side) => s.options[side].ops.some((o) => o.t === 'fail')));
    if (!failProof) warn(P.projects, p.line, 'failures', 'No proof scene for a project that never became viable (both answers "fail ...")');
    if (!mine.some((s) => s.phase === 'opening')) err(P.projects, p.line, 'id', `Project ${p.id} has no opening scene`);
    const aftermath = mine.filter((s) => s.phase === 'aftermath').length;
    if (p.outcomes.length && aftermath < content.tuning.aftermath) warn(P.projects, p.line, 'id', `Project ${p.id} has ${aftermath} aftermath scenes; a life needs ${content.tuning.aftermath}`);
  }
  for (const inv of Object.values(content.inventions)) {
    if (inv.type === 'keystone') {
      const era = content.eras[inv.era];
      for (const r of era?.required || []) if (!inv.requires.includes(r)) err(P.inventions, inv.line, 'requires', `${inv.id} is ${inv.era}'s keystone, so it must require ${r}`);
    }
  }
  const named = new Set(Object.values(content.scenes).flatMap((s) => [...s.options.left.ops, ...s.options.right.ops]).filter((o) => o.t === 'death').map((o) => o.id));
  for (const d of Object.values(content.deaths)) {
    if (d.weight <= 0 && !named.has(d.id)) warn(P.deaths, d.line, 'weight', `${d.id} has weight 0, so it only appears when an answer names it ("death ${d.id}"), and none does`);
  }
  for (const l of Object.values(content.legacies)) {
    const used = Object.values(content.scenes).some((s) => s.cond.all.some((c) => c.any.some((a) => ['problem', 'legacy', 'history'].includes(a.t) && a.id === l.id)));
    if (!used) warn(P.legacies, l.line, 'id', `No scene checks "problem ${l.id}", so this legacy doesn't change a later decision yet (spec 8.4)`);
  }
  for (const era of Object.values(content.eras)) {
    for (const r of [...era.required, ...era.optional]) {
      if (!content.inventions[r]) warn('world.json', 0, `eras.${era.id}`, `${era.id} lists ${r}, which isn't written yet`);
    }
    if (era.keystone && !content.inventions[era.keystone]) warn('world.json', 0, `eras.${era.id}.keystone`, `${era.id}'s keystone ${era.keystone} isn't written yet`);
    const text = era.theme?.text || '#f4e7cd';
    for (const sk of era.sky) if (HEX.test(text) && contrast(text, sk.bg) < 4.5) warn('world.json', 0, `eras.${era.id}.sky`, `${sk.name} sky is too light for the era's text (${contrast(text, sk.bg).toFixed(1)}:1)`);
  }
  if (content.start.project && !content.projects[content.start.project]) err('world.json', 0, 'start.project', `No project "${content.start.project}"`);

  // Pictures: SVG files in content/art. The checker and the tests pass them
  // in as options.art and get them checked; the browser loads them as images
  // when it needs them, so it skips this.
  if (options.art) {
    const used = new Set();
    for (const ref of artReferences(content)) {
      const path = artPath(ref.kind, ref.id);
      used.add(path);
      if (options.art[path] == null) (ref.level === 'error' ? err : warn)(ref.file, ref.line, ref.column, `No picture content/${path} for ${ref.what}`);
    }
    for (const [path, text] of Object.entries(options.art)) {
      const kind = path.split('/')[1];
      for (const p of artProblems(kind, text)) err(`content/${path}`, 0, '', `This picture ${p}`);
      if (!used.has(path)) warn(`content/${path}`, 0, '', 'Nothing uses this picture yet');
    }
  }

  // No emoji anywhere: pictures are drawn as art.
  const artFiles = Object.fromEntries(Object.entries(options.art || {}).map(([p, text]) => [`content/${p}`, text]));
  for (const [path, text] of Object.entries({ ...files, ...artFiles })) {
    String(text).split('\n').forEach((lineText, i) => {
      const m = EMOJI.exec(lineText);
      if (m) err(path, i + 1, '', `No emoji ("${m[0]}"): draw it as a picture in content/art instead`);
    });
  }

  const hashParts = Object.keys(files).sort().map((k) => k + '\n' + files[k]);
  content.hash = hashText(hashParts);
  return { content, errors, warnings };
}

export function contentFileList(worldText) {
  const world = JSON.parse(worldText);
  const f = world.files || {};
  return [f.characters, f.flags, f.observations, f.projects, f.inventions, f.legacies, f.failures, f.deaths, ...(f.scenes || [])].filter(Boolean);
}
