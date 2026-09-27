// Everything the game reads, put together and checked: the story from
// content/script.md, how each life looks from world.json, and the
// interface's words from ui.json. The browser, the checker and the tests all
// build the game's content through here, so they can never disagree.
import { parseScript } from './script.js';
import { artPath, artProblems, artReferences } from './art.js';

export const CONTENT_FILES = ['script.md', 'world.json', 'ui.json'];

const UI_KEYS = [
  'title', 'tagline', 'begin', 'continue', 'history', 'settings', 'framing', 'helperFirst', 'helperSecond',
  'wantPrefix', 'beginLife', 'resultContinue', 'revealKicker', 'revealFirst', 'revealAction', 'epitaphInvented',
  'epitaphAction', 'archiveTransition', 'offerQuestion', 'offerDefer', 'offerAccepted', 'offerDeferred',
  'offerDoubleHeading', 'offerHelp', 'museumEmpty', 'museumContinues', 'textSize', 'reduceMotion', 'restart',
  'restartConfirm', 'restartKeep', 'restartGo', 'credits', 'anotherFuture', 'startOver', 'oldSave', 'oldSaveAction',
];
const THEME_KEYS = ['bg', 'panel', 'card', 'ink', 'text', 'accent'];
const HEX = /^#[0-9a-f]{6}$/i;
// Emoji and pictographs: pictures are drawn as art (Sevaan's rule)
const EMOJI = /\p{Extended_Pictographic}/u;

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

export function buildContent(files, { art = null } = {}) {
  const errors = [];
  const warnings = [];
  const err = (file, line, column, message) => errors.push({ file, line, column, message });
  const warn = (file, line, column, message) => warnings.push({ file, line, column, message });

  if (files['script.md'] == null) err('content/script.md', 0, '', 'The script is missing');
  const parsed = parseScript(files['script.md'] || '');
  errors.push(...parsed.errors);
  warnings.push(...parsed.warnings);
  const C = parsed.campaign;

  const json = (name) => {
    try { return JSON.parse(files[name]); } catch (e) { err(`content/${name}`, 0, '', files[name] == null ? 'This file is missing' : `This isn't valid JSON: ${e.message}`); return {}; }
  };
  const world = json('world.json');
  const ui = json('ui.json');
  const W = 'content/world.json';

  // Every life has exactly one era palette
  const ageOf = {};
  world.ages ||= {};
  for (const [id, age] of Object.entries(world.ages)) {
    age.id = id;
    for (const ch of age.chapters || []) {
      if (!C.chapters[ch]) err(W, 0, `ages.${id}`, `${ch} isn't a chapter in the script`);
      if (ageOf[ch]) err(W, 0, `ages.${id}`, `${ch} is in both ${ageOf[ch]} and ${id}`);
      ageOf[ch] = id;
    }
    if (!age.bench) err(W, 0, `ages.${id}.bench`, `${id} needs a workbench`);
    for (const k of THEME_KEYS) if (!HEX.test(age.theme?.[k] || '')) err(W, 0, `ages.${id}.theme.${k}`, `${id} needs a colour like #2a1c14 for ${k}`);
    if (!age.sky?.length) err(W, 0, `ages.${id}.sky`, `${id} needs at least one sky`);
    for (const sky of age.sky || []) {
      if (!HEX.test(sky.bg || '')) err(W, 0, `ages.${id}.sky`, `Each sky needs a bg colour like #2a1c14`);
      else if (HEX.test(age.theme?.text || '') && contrast(age.theme.text, sky.bg) < 4.5) warn(W, 0, `ages.${id}.sky`, `The ${sky.name} sky is too light for ${id}'s text (${contrast(age.theme.text, sky.bg).toFixed(1)}:1)`);
    }
  }
  for (const id of C.chapterOrder) if (!ageOf[id]) err(W, 0, 'ages', `${id} isn't in any age, so it has no palette or workbench`);

  // Drawings for workbench states
  world.art ||= {};
  const lookOK = (look, where, chapter) => {
    const obj = typeof look === 'string' ? { object: look } : look;
    if (!obj || typeof obj !== 'object') { err(W, 0, where, 'A look is a picture name or { "object": …, "marks": […] }'); return; }
    if (typeof obj.object === 'object') {
      const from = C.cards[obj.object.from];
      if (!from || !obj.object.from.startsWith(`${chapter}.`)) err(W, 0, where, `"from" should be an earlier card of ${chapter}, not ${obj.object.from}`);
      if (!obj.object.left || !obj.object.right) err(W, 0, where, 'A look that depends on an earlier card needs both "left" and "right"');
    } else if (!obj.object) err(W, 0, where, 'A look needs an "object"');
  };
  for (const [ch, states] of Object.entries(world.art)) {
    if (!C.chapters[ch]) { err(W, 0, `art.${ch}`, `${ch} isn't a chapter in the script`); continue; }
    const want = C.chapters[ch].bench.length;
    if (states.length !== want) err(W, 0, `art.${ch}`, `${ch} has ${states.length} drawn states; the script has ${want}`);
    states.forEach((st, i) => {
      lookOK(st, `art.${ch}[${i}]`, ch);
      for (const side of ['left', 'right']) if (st[side]) lookOK(st[side], `art.${ch}[${i}].${side}`, ch);
    });
  }
  for (const key of Object.keys(world.portraits || {})) {
    const [ch, cast] = key.split(':');
    if (!C.chapters[ch]?.cast[cast]) err(W, 0, `portraits.${key}`, `${key} isn't a cast member (write it as CHAPTER:castId, like C01:aru)`);
  }

  for (const k of UI_KEYS) if (ui[k] == null) err('content/ui.json', 0, k, `The interface needs "${k}"`);

  const content = { campaign: C, world, ui, ageOf, hash: C.hash };

  // Pictures: the checker and the tests pass them in as options.art; the
  // browser just loads them, so it skips this. A missing picture never
  // breaks the game: the workbench shows the state's description instead.
  if (art) {
    const used = new Set();
    for (const ref of artReferences(content)) {
      const path = artPath(ref.kind, ref.id);
      used.add(path);
      if (art[path] == null) warn(W, 0, ref.where, `No picture content/${path} for ${ref.what}, so it shows as a label`);
    }
    for (const [path, text] of Object.entries(art)) {
      const kind = path.split('/')[1];
      for (const p of artProblems(kind, text)) err(`content/${path}`, 0, '', `This picture ${p}`);
      if (!used.has(path)) warn(`content/${path}`, 0, '', 'Nothing uses this picture yet');
    }
  }

  // No emoji anywhere
  const all = { ...Object.fromEntries(Object.entries(files).map(([k, v]) => [`content/${k}`, v])), ...Object.fromEntries(Object.entries(art || {}).map(([k, v]) => [`content/${k}`, v])) };
  for (const [path, text] of Object.entries(all)) {
    String(text ?? '').split('\n').forEach((line, i) => {
      const m = EMOJI.exec(line);
      if (m) err(path, i + 1, '', `No emoji ("${m[0]}"): draw it as a picture in content/art instead`);
    });
  }

  return { content, errors, warnings };
}
