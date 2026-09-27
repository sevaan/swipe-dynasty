// The little language writers use inside spreadsheet cells.
//
//   effects:     danger +1; observe holds-shape; look rim-pot; look woven-pot if lined; next tut-3
//   conditions:  has pottery; observed holds-water; problem pottery-household; not lid-habit
//   recipes:     holds-shape + survives-heat + holds-water      (or  a + b | a + c)
//
// Cells are parsed into plain data here, once, when content loads. Nothing in
// a cell is ever run as code. See content/README.md for the writer's guide.

export function normId(s) {
  return String(s ?? '').trim().toLowerCase().replace(/[\s_]+/g, '-');
}

const SEP = /\s*(?:;|,|\n)\s*/;
const OPS = ['<=', '>=', '!=', '==', '=', '<', '>'];

function splitCell(cell) {
  return String(cell ?? '').split(SEP).map((s) => s.trim()).filter(Boolean);
}

export function splitList(cell) {
  return splitCell(cell).map(normId);
}

// ctx: sets of known ids — techs (inventions), observations, legacies,
// failures, flags, deaths. Scene ids, looks and marks are checked later,
// once every file is loaded.
function known(ctx, kind, id, errors, text) {
  if (!ctx[kind].has(id)) {
    const what = { techs: 'invention', observations: 'observation', legacies: 'legacy', failures: 'failed design', flags: 'flag (declare it in flags.csv)', deaths: 'death' }[kind];
    errors.push(`"${text}": no ${what} called "${id}"`);
  }
  return id;
}

function comparison(text) {
  for (const op of OPS) {
    const at = text.indexOf(op);
    if (at > 0) {
      const name = text.slice(0, at).trim();
      const num = text.slice(at + op.length).trim();
      if (!/^-?\d+$/.test(num)) return { error: `"${num}" should be a whole number` };
      return { name, op: op === '==' ? '=' : op, n: Number(num) };
    }
  }
  return null;
}

// Words that take one id after them in a condition, and what the id must be.
const WORD_CONDITIONS = {
  has: 'techs', observed: 'observations', problem: 'legacies', legacy: 'legacies', history: 'legacies',
  failed: 'failures', made: 'techs', previous: null, look: null, mark: null, seen: null, era: null, project: null,
};

function parseAtom(text, ctx, errors) {
  let s = text.trim();
  let neg = false;
  if (/^not\s+/i.test(s)) { neg = true; s = s.replace(/^not\s+/i, ''); }
  else if (s.startsWith('!')) { neg = true; s = s.slice(1).trim(); }

  const m = /^([a-z]+)\s+(.+)$/i.exec(s);
  if (m && Object.hasOwn(WORD_CONDITIONS, m[1].toLowerCase()) && !comparison(s)) {
    const word = m[1].toLowerCase();
    const id = normId(m[2]);
    if ((word === 'made' || word === 'failed') && (id === 'any' || id === 'anything')) return { t: word, id: null, neg };
    if (word === 'made' && id === 'nothing') return { t: 'made', id: null, neg: !neg };
    const kind = WORD_CONDITIONS[word];
    if (kind) known(ctx, kind, id, errors, text);
    return { t: word, id, neg };
  }
  const cmp = comparison(s);
  if (cmp && cmp.error) { errors.push(`"${text}": ${cmp.error}`); return null; }
  if (cmp) {
    const key = normId(cmp.name);
    if (['danger', 'lives', 'life', 'decisions', 'step'].includes(key)) return { t: key, op: cmp.op, n: cmp.n, neg };
    if (ctx.flags.has(key)) return { t: 'flag', flag: key, op: cmp.op, n: cmp.n, neg };
    errors.push(`"${cmp.name}" isn't danger, step, lives, life, decisions or a flag`);
    return null;
  }
  const id = normId(s);
  if (ctx.flags.has(id)) return { t: 'flag', flag: id, op: '>', n: 0, neg };
  errors.push(`"${s}" isn't a flag (declare it in flags.csv) or a condition I know`);
  return null;
}

// Returns { all: [{ any: [atom] }], once, errors }. Every clause must hold;
// within a clause, one of the alternatives ("a | b" or "a or b").
export function parseConditions(cell, ctx) {
  const errors = [];
  const out = { all: [], once: false, errors };
  for (const part of splitCell(cell)) {
    if (normId(part) === 'once') { out.once = true; continue; }
    const alts = part.split(/\s+or\s+|\s*\|\s*/i).map((a) => parseAtom(a, ctx, errors)).filter(Boolean);
    if (alts.length) out.all.push({ any: alts });
  }
  return out;
}

// Verbs that take one id, what the id must be (checked now when we can), and the op they make.
const VERBS = {
  observe: ['observations', 'observe'], look: [null, 'look'], mark: [null, 'mark'], unmark: [null, 'unmark'],
  legacy: ['legacies', 'legacy'], commit: ['techs', 'commit'], fail: ['failures', 'fail'], next: [null, 'next'],
  because: ['techs', 'because'], death: ['deaths', 'death'], ending: [null, 'ending'],
};

// Returns { ops: [op], errors }.
export function parseEffects(cell, ctx) {
  const errors = [];
  const ops = [];
  for (const whole of splitCell(cell)) {
    // "effect if condition" only happens when the condition holds
    const [part, when] = whole.split(/\s+if\s+/i);
    const before = ops.length;
    parseEffect(part, ctx, ops, errors);
    if (when != null) {
      const cond = parseConditions(when, ctx);
      errors.push(...cond.errors);
      for (let i = before; i < ops.length; i++) ops[i].when = cond;
    }
  }
  return { ops, errors };
}

function parseEffect(part, ctx, ops, errors) {
  let m;
  if ((m = /^(set|clear)\s+(.+)$/i.exec(part))) {
    const id = known(ctx, 'flags', normId(m[2]), errors, part);
    ops.push({ t: 'flag', flag: id, op: '=', n: m[1].toLowerCase() === 'set' ? 1 : 0 });
    return;
  }
  if ((m = /^([a-z]+)\s+([a-z0-9][\w\s-]*)$/i.exec(part)) && Object.hasOwn(VERBS, m[1].toLowerCase())) {
    const [kind, t] = VERBS[m[1].toLowerCase()];
    const id = normId(m[2]);
    if (kind) known(ctx, kind, id, errors, part);
    ops.push({ t, id });
    return;
  }
  if ((m = /^(.+?)\s*([+-])\s*(\d+)$/.exec(part)) || (m = /^(.+?)\s*(=)\s*(-?\d+)$/.exec(part))) {
    const name = normId(m[1]);
    const n = m[2] === '-' ? -Number(m[3]) : Number(m[3]);
    const op = m[2] === '=' ? '=' : '+';
    if (name === 'danger') { ops.push({ t: 'danger', op, n }); return; }
    if (ctx.flags.has(name)) { ops.push({ t: 'flag', flag: name, op, n }); return; }
    errors.push(`"${m[1].trim()}" isn't danger or a flag`);
    return;
  }
  errors.push(`"${part}" isn't an effect I understand`);
}

// "holds-shape + survives-heat + holds-water", or alternatives joined by "|".
// Returns { any: [[observation ids]], errors }: any one list, all of its ids.
export function parseRecipe(cell, ctx) {
  const errors = [];
  const any = String(cell ?? '').split('|').map((alt) => alt.split('+').map(normId).filter(Boolean)).filter((a) => a.length);
  for (const alt of any) for (const id of alt) known(ctx, 'observations', id, errors, cell);
  if (!any.length) errors.push('A recipe needs at least one observation');
  return { any, errors };
}
