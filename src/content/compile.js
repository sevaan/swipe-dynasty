// Turns the writer-facing files in content/ into one validated content object.
// The browser, the checker, the tests and the simulation bot all use this, so a
// card that works in one works in all of them.

import { tableFromCSV } from './csv.js';
import { normId, parseConditions, parseEffects, parseTrigger, splitList } from './syntax.js';
import { parseSprites } from './sprites.js';

export const ROLES = ['people', 'resources', 'belief', 'power'];
const INVENTION_TYPES = { keystone: 'keystone', 'stepping-stone': 'stepping', stepping: 'stepping', 'bad-idea': 'bad', bad: 'bad' };
const SCOPES = ['life', 'timeline', 'forever'];
// Sprites the interface itself draws with (see content/sprites/ui.txt).
export const UI_SPRITES = ['ui-menu', 'ui-close', 'ui-hand', 'ui-grave', 'ui-door', 'ui-unknown', 'ui-arrow-left', 'ui-arrow-right'];
const EMOJI = /\p{Extended_Pictographic}/u;
// Weather and ambient effects the interface can draw (see src/ui/fx.js).
export const EFFECTS = ['rain', 'lightning', 'embers', 'smoke', 'flames', 'sparks', 'dust', 'stars', 'fireflies', 'grain', 'birds', 'shake'];
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
  characters: { required: ['id', 'name'], optional: ['portrait', 'per life', 'notes'] },
  flags: { required: ['id', 'scope'], optional: ['default', 'notes'] },
  inventions: { required: ['id', 'era', 'type', 'name'], optional: ['requires', 'threshold', 'related', 'icon', 'museum', 'hint', 'notes'] },
  deaths: { required: ['id', 'era', 'text', 'epitaph'], optional: ['meter', 'end', 'scene', 'notes'] },
  cards: {
    required: ['id', 'era', 'speaker', 'text', 'left answer', 'right answer'],
    optional: ['type', 'left effects', 'right effects', 'conditions', 'weight', 'trigger for', 'epitaph', 'scene', 'notes'],
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

export function compileContent(files) {
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

  const content = {
    title: world.title || 'Untitled',
    tuning: world.tuning || {},
    roles: ROLES,
    start: { era: normId(world.start?.era || ''), card: normId(world.start?.card || '') },
    eras: {}, eraOrder: [],
    characters: {}, flags: {},
    inventions: {}, inventionOrder: [],
    deaths: {}, deathIndex: {},
    cards: {}, cardOrder: [],
    bagByEra: {}, triggersByInvention: {},
  };

  // Scenes (JSON): a named mood a card or death can set: a sky colour and effects.
  content.scenes = {};
  const checkFx = (list, where) => (Array.isArray(list) ? list : []).map(normId).filter((f) => {
    if (EFFECTS.includes(f)) return true;
    err('world.json', 0, where, `Unknown effect "${f}" (known: ${EFFECTS.join(', ')})`);
    return false;
  });
  for (const [rawId, raw] of Object.entries(world.scenes || {})) {
    const id = normId(rawId);
    if (raw.bg != null && !HEX.test(raw.bg)) err('world.json', 0, `scenes.${id}.bg`, `"${raw.bg}" should be a colour like #1b2530`);
    content.scenes[id] = { id, bg: HEX.test(raw.bg || '') ? raw.bg : null, fx: checkFx(raw.fx, `scenes.${id}.fx`) };
  }

  // Eras (JSON)
  for (const raw of world.eras || []) {
    const id = normId(raw.id || '');
    if (!id) { err('world.json', 0, 'eras', 'An era is missing its id'); continue; }
    if (content.eras[id]) { err('world.json', 0, 'eras', `Era "${id}" is listed twice`); continue; }
    const meters = {};
    for (const role of ROLES) {
      const m = raw.meters?.[role];
      if (!m?.label) err('world.json', 0, `eras.${id}.meters`, `Era "${id}" needs a ${role} meter label`);
      meters[role] = { label: m?.label || role, icon: normId(m?.icon || '') };
    }
    const meterNames = new Map();
    for (const role of ROLES) {
      meterNames.set(role, role);
      meterNames.set(normId(meters[role].label), role);
    }
    content.eras[id] = {
      id, name: raw.name || id, when: raw.when || '', intro: raw.intro || '',
      opener: raw.opener ? normId(raw.opener) : null,
      keystone: raw.keystone ? normId(raw.keystone) : null,
      next: raw.next ? normId(raw.next) : null,
      fallback: raw.fallback ? normId(raw.fallback) : null,
      theme: raw.theme || {}, meters, meterNames,
      // The sky steps through these (day, dusk, night, dawn...) every few cards.
      sky: (Array.isArray(raw.sky) && raw.sky.length ? raw.sky : [{ name: 'day', bg: raw.theme?.bg || '#2a1c14' }]).map((sk, i) => {
        if (!HEX.test(sk.bg || '')) err('world.json', 0, `eras.${id}.sky`, `Sky ${i + 1} needs a colour like #2a1c14`);
        return { name: sk.name || `sky ${i + 1}`, bg: HEX.test(sk.bg || '') ? sk.bg : '#2a1c14', fx: checkFx(sk.fx, `eras.${id}.sky`) };
      }),
      names: Array.isArray(raw.names) && raw.names.length ? raw.names : ['Someone'],
    };
    content.eraOrder.push(id);
    content.bagByEra[id] = [];
    content.deathIndex[id] = {};
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

  const paths = world.files || {};

  // Characters
  for (const { line, values: v } of table('characters', paths.characters || 'characters.csv')) {
    const id = normId(v.id);
    if (content.characters[id]) { err(paths.characters, line, 'id', `Duplicate character "${id}"`); continue; }
    const perLife = v['per life'] ? Number(v['per life']) : null;
    if (v['per life'] && !Number.isInteger(perLife)) err(paths.characters, line, 'per life', `"${v['per life']}" should be a whole number`);
    content.characters[id] = { id, name: v.name, portrait: normId(v.portrait || id), perLife, line };
  }
  if (!content.characters.narrator) {
    content.characters.narrator = { id: 'narrator', name: '', portrait: 'narrator', perLife: null, line: 0 };
  }

  // Flags
  for (const { line, values: v } of table('flags', paths.flags || 'flags.csv')) {
    const id = normId(v.id);
    if (content.flags[id]) { err(paths.flags, line, 'id', `Duplicate flag "${id}"`); continue; }
    const scope = normId(v.scope);
    if (!SCOPES.includes(scope)) err(paths.flags, line, 'scope', `Scope must be life, timeline or forever, not "${v.scope}"`);
    const def = v.default ? Number(v.default) : 0;
    if (!Number.isFinite(def)) err(paths.flags, line, 'default', `"${v.default}" should be a number`);
    content.flags[id] = { id, scope: SCOPES.includes(scope) ? scope : 'life', default: def || 0 };
  }

  // Inventions
  const invPath = paths.inventions || 'inventions.csv';
  const invRows = table('inventions', invPath);
  for (const { line, values: v } of invRows) {
    const id = normId(v.id);
    if (content.inventions[id]) { err(invPath, line, 'id', `Duplicate invention "${id}"`); continue; }
    const era = normId(v.era);
    if (!content.eras[era]) err(invPath, line, 'era', `No era "${v.era}"`);
    const type = INVENTION_TYPES[normId(v.type)];
    if (!type) err(invPath, line, 'type', `Type must be keystone, stepping stone or bad idea, not "${v.type}"`);
    const threshold = v.threshold ? Number(v.threshold) : null;
    if (type && type !== 'bad' && !(threshold > 0)) err(invPath, line, 'threshold', 'Keystones and stepping stones need a threshold above 0');
    content.inventions[id] = {
      id, era, type: type || 'bad', name: v.name,
      requires: splitList(v.requires), related: splitList(v.related),
      threshold, icon: normId(v.icon || id), museum: v.museum || '', hint: v.hint || '', line,
    };
    content.inventionOrder.push(id);
  }
  for (const inv of Object.values(content.inventions)) {
    for (const r of [...inv.requires, ...inv.related]) {
      if (!content.inventions[r]) err(invPath, inv.line, inv.requires.includes(r) ? 'requires' : 'related', `"${inv.id}" refers to unknown invention "${r}"`);
    }
  }

  // Deaths
  const deathPath = paths.deaths || 'deaths.csv';
  for (const { line, values: v } of table('deaths', deathPath)) {
    const id = normId(v.id);
    if (content.deaths[id]) { err(deathPath, line, 'id', `Duplicate death "${id}"`); continue; }
    const era = normId(v.era);
    if (!content.eras[era]) { err(deathPath, line, 'era', `No era "${v.era}"`); continue; }
    let role = null;
    let end = null;
    if (v.meter || v.end) {
      role = content.eras[era].meterNames.get(normId(v.meter)) || null;
      if (!role) err(deathPath, line, 'meter', `"${v.meter}" isn't a meter in ${era}`);
      end = normId(v.end);
      if (end !== 'low' && end !== 'high') err(deathPath, line, 'end', 'End must be low or high');
      if (role && content.deathIndex[era][role]?.[end]) err(deathPath, line, 'meter', `${era} already has a ${role} ${end} death`);
      if (role && (end === 'low' || end === 'high')) {
        content.deathIndex[era][role] = content.deathIndex[era][role] || {};
        content.deathIndex[era][role][end] = id;
      }
    }
    const scene = v.scene ? normId(v.scene) : null;
    if (scene && !content.scenes[scene]) err(deathPath, line, 'scene', `No scene "${v.scene}" in world.json`);
    content.deaths[id] = { id, era, role, end, text: v.text, epitaph: v.epitaph, scene: content.scenes[scene] ? scene : null };
  }

  // Cards
  const flagReads = new Set();
  const flagWrites = new Set();
  const targets = [];
  for (const path of paths.cards || []) {
    for (const { line, values: v } of table('cards', path)) {
      const id = normId(v.id);
      const at = (column, message) => err(path, line, column, message);
      if (!id) { at('id', 'Missing id'); continue; }
      if (content.cards[id]) { at('id', `Duplicate card id "${id}"`); continue; }
      const era = content.eras[normId(v.era)];
      if (!era) { at('era', `No era "${v.era}"`); continue; }
      const ctx = { meters: era.meterNames, inventions: new Set(Object.keys(content.inventions)), flags: new Set(Object.keys(content.flags)) };

      const speaker = normId(v.speaker || 'narrator');
      if (!content.characters[speaker]) at('speaker', `No character "${v.speaker}" in characters.csv`);

      const cond = parseConditions(v.conditions, ctx);
      cond.errors.forEach((m) => at('conditions', m));
      for (const clause of cond.all) for (const a of clause.any) if (a.t === 'flag') flagReads.add(a.flag);

      const side = (name) => {
        const eff = parseEffects(v[`${name} effects`], ctx);
        eff.errors.forEach((m) => at(`${name} effects`, m));
        for (const op of eff.ops) {
          if (op.t === 'flag') flagWrites.add(op.flag);
          if (op.t === 'next' || op.t === 'die') targets.push({ path, line, column: `${name} effects`, op });
        }
        const label = v[`${name} answer`] ?? '';
        if (words(label) > 5) warn(path, line, `${name} answer`, `${words(label)} words; house style is 5 or fewer`);
        return { label, ops: eff.ops, uses: eff.ops.filter((o) => o.t === 'use').map((o) => o.inv) };
      };

      const trig = parseTrigger(v['trigger for'], ctx);
      trig.errors.forEach((m) => at('trigger for', m));

      let type = normId(v.type || 'normal');
      if (type === 'scene') type = 'script';
      if (!['normal', 'script', 'trigger'].includes(type)) at('type', `Type must be blank, script or trigger, not "${v.type}"`);
      if (trig.value) type = 'trigger';
      if (type === 'trigger' && !trig.value) at('trigger for', 'Trigger cards need a "trigger for" invention and side');

      if (v.scene && !content.scenes[normId(v.scene)]) at('scene', `No scene "${v.scene}" in world.json`);
      const weight = v.weight ? Number(v.weight) : 1;
      if (!(weight >= 0)) at('weight', `"${v.weight}" should be a number, 0 or more`);
      if (words(v.text) > 25) warn(path, line, 'text', `${words(v.text)} words; house style is 25 or fewer`);

      const card = {
        id, era: era.id, type, speaker, text: v.text, weight: weight >= 0 ? weight : 1,
        cond, trigger: trig.value, epitaph: v.epitaph || '',
        scene: v.scene && content.scenes[normId(v.scene)] ? normId(v.scene) : null,
        left: side('left'), right: side('right'), src: { file: path, line },
      };
      if (trig.value) {
        const inv = content.inventions[trig.value.inv];
        if (inv && inv.era !== era.id) warn(path, line, 'trigger for', `Triggers "${inv.id}", which belongs to ${inv.era}`);
        if (inv && inv.type === 'bad') at('trigger for', 'Bad ideas come from dying without a breakthrough, so they have no trigger');
        (content.triggersByInvention[trig.value.inv] ||= []).push(id);
      }
      content.cards[id] = card;
      content.cardOrder.push(id);
      if (type === 'normal') content.bagByEra[era.id].push(id);
    }
  }

  // Cross-references
  const reached = new Set([content.start.card]);
  for (const { path, line, column, op } of targets) {
    if (op.t === 'next') {
      if (!content.cards[op.card]) err(path, line, column, `"next ${op.card}": no card with that id`);
      reached.add(op.card);
    }
    if (op.t === 'die' && !content.deaths[op.death]) err(path, line, column, `"die ${op.death}": no death with that id in deaths.csv`);
  }
  if (!content.cards[content.start.card]) err('world.json', 0, 'start.card', `Start card "${content.start.card}" doesn't exist`);

  for (const era of Object.values(content.eras)) {
    if (era.opener) { reached.add(era.opener); if (!content.cards[era.opener]) err('world.json', 0, `eras.${era.id}.opener`, `No card "${era.opener}"`); }
    if (era.fallback) { reached.add(era.fallback); if (!content.cards[era.fallback]) err('world.json', 0, `eras.${era.id}.fallback`, `No card "${era.fallback}"`); }
    if (era.next && !content.eras[era.next]) err('world.json', 0, `eras.${era.id}.next`, `No era "${era.next}"`);
    if (era.keystone) {
      const ks = content.inventions[era.keystone];
      if (!ks) err('world.json', 0, `eras.${era.id}.keystone`, `No invention "${era.keystone}"`);
      else if (ks.type !== 'keystone') err(invPath, ks.line, 'type', `"${ks.id}" is ${era.id}'s keystone, so its type should be keystone`);
    }
    for (const role of ROLES) {
      for (const end of ['low', 'high']) {
        if (!content.deathIndex[era.id][role]?.[end]) err(deathPath, 0, 'meter', `${era.id} has no death for ${era.meters[role].label} (${role}) ${end}`);
      }
    }
    const eraInv = content.inventionOrder.map((i) => content.inventions[i]).filter((i) => i.era === era.id);
    if (!eraInv.some((i) => i.type === 'bad')) err(invPath, 0, 'type', `${era.id} needs at least one bad idea for lives that die without a breakthrough`);
    if (content.bagByEra[era.id].length === 0) warn('world.json', 0, `eras.${era.id}`, `${era.id} has no ordinary cards`);
  }
  for (const era of Object.values(content.eras)) {
    const text = era.theme.text;
    if (!HEX.test(text || '')) continue;
    const skies = [...era.sky.map((sk) => [`eras.${era.id}.sky (${sk.name})`, sk.bg]),
      ...Object.values(content.scenes).filter((sc) => sc.bg).map((sc) => [`scenes.${sc.id}`, sc.bg])];
    for (const [where, bg] of skies) {
      const ratio = contrast(text, bg);
      if (ratio < 4.5) warn('world.json', 0, where, `${bg} is too light behind ${era.name}'s text (contrast ${ratio.toFixed(1)}, needs 4.5)`);
    }
  }
  for (const inv of Object.values(content.inventions)) {
    if (inv.type !== 'bad' && !content.triggersByInvention[inv.id]?.length) {
      warn(invPath, inv.line, 'id', `"${inv.id}" has no trigger card, so it can only come from an "invent" effect`);
    }
  }
  for (const card of Object.values(content.cards)) {
    if (card.type === 'script' && !reached.has(card.id)) warn(card.src.file, card.src.line, 'id', `Script card "${card.id}" is never reached by a "next" effect`);
  }
  for (const f of Object.keys(content.flags)) {
    if (!flagWrites.has(f)) warn(paths.flags, 0, 'id', `Flag "${f}" is never set by any card`);
    if (!flagReads.has(f)) warn(paths.flags, 0, 'id', `Flag "${f}" is never checked by any card (fine if it's for later)`);
  }

  // Sprites: every picture in the game is pixel art from content/sprites.
  const { palette, sprites } = parseSprites(paths.sprites || [], files, err);
  content.palette = palette;
  content.sprites = sprites;
  const charPath = paths.characters || 'characters.csv';
  for (const ch of Object.values(content.characters)) {
    if (!sprites[ch.portrait]) err(charPath, ch.line, 'portrait', `No sprite "${ch.portrait}" for ${ch.id} (add one to content/sprites)`);
  }
  for (const era of Object.values(content.eras)) {
    for (const role of ROLES) {
      const icon = era.meters[role].icon;
      if (!sprites[icon]) err('world.json', 0, `eras.${era.id}.meters.${role}.icon`, `No sprite "${icon}" for the ${era.meters[role].label} meter`);
    }
  }
  for (const inv of Object.values(content.inventions)) {
    if (!sprites[inv.icon]) warn(invPath, inv.line, 'icon', `No sprite "${inv.icon}" for ${inv.id}; the Museum shows a question mark`);
  }
  for (const id of UI_SPRITES) if (!sprites[id]) err('sprites', 0, '', `The interface needs a sprite called "${id}"`);

  // No emoji anywhere: pictures are drawn as sprites.
  for (const [path, text] of Object.entries(files)) {
    String(text).split('\n').forEach((lineText, i) => {
      const m = EMOJI.exec(lineText);
      if (m) err(path, i + 1, '', `No emoji ("${m[0]}"): draw it as a pixel sprite in content/sprites instead`);
    });
  }

  const hashParts = Object.keys(files).sort().map((k) => k + '\n' + files[k]);
  content.hash = hashText(hashParts);
  return { content, errors, warnings };
}

export function contentFileList(worldText) {
  const world = JSON.parse(worldText);
  const f = world.files || {};
  return [f.characters, f.flags, f.inventions, f.deaths, ...(f.cards || []), ...(f.sprites || [])].filter(Boolean);
}
