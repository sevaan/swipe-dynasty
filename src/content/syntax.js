// The little language writers use inside spreadsheet cells.
//
//   effects:     Food -10; Gods +15; tinder +2; set kept_naysayer; next stampede-2
//   conditions:  Food < 30; has sparks; not naysayer_banished; cards >= 6
//
// Cells are parsed into plain data here, once, when content loads. Nothing in a
// cell is ever run as code. See content/README.md for the writer-facing guide.

export function normId(s) {
  return String(s).trim().toLowerCase().replace(/[\s_]+/g, '-');
}

const SEP = /\s*(?:;|,|\n)\s*/;
const OPS = ['<=', '>=', '!=', '==', '=', '<', '>'];

function splitCell(cell) {
  return String(cell ?? '').split(SEP).map((s) => s.trim()).filter(Boolean);
}

// ctx: { meters: Map(normName -> role), inventions: Set, flags: Set }
function resolveName(raw, ctx) {
  const id = normId(raw);
  if (ctx.meters.has(id)) return { kind: 'meter', role: ctx.meters.get(id) };
  if (ctx.inventions.has(id)) return { kind: 'invention', id };
  if (ctx.flags.has(id)) return { kind: 'flag', id };
  return { kind: 'unknown', id };
}

function parseComparison(text) {
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

function parseAtom(text, ctx, errors) {
  let s = text.trim();
  let neg = false;
  if (/^not\s+/i.test(s)) { neg = true; s = s.replace(/^not\s+/i, ''); }
  else if (s.startsWith('!')) { neg = true; s = s.slice(1).trim(); }

  let m;
  if ((m = /^has\s+(.+)$/i.exec(s))) {
    const id = normId(m[1]);
    if (!ctx.inventions.has(id)) errors.push(`"has ${m[1]}": no invention with that id`);
    return { t: 'has', inv: id, neg };
  }
  if ((m = /^made\s+(.+)$/i.exec(s))) {
    const what = normId(m[1]);
    if (what === 'any' || what === 'anything') return { t: 'made', inv: null, neg };
    if (what === 'nothing') return { t: 'made', inv: null, neg: !neg };
    if (!ctx.inventions.has(what)) errors.push(`"made ${m[1]}": no invention with that id`);
    return { t: 'made', inv: what, neg };
  }
  const cmp = parseComparison(s);
  if (cmp && cmp.error) { errors.push(`"${text}": ${cmp.error}`); return null; }
  if (cmp) {
    const key = normId(cmp.name);
    if (key === 'cards') return { t: 'cards', op: cmp.op, n: cmp.n, neg };
    if (key === 'life') return { t: 'life', op: cmp.op, n: cmp.n, neg };
    const ref = resolveName(cmp.name, ctx);
    if (ref.kind === 'meter') return { t: 'meter', role: ref.role, op: cmp.op, n: cmp.n, neg };
    if (ref.kind === 'flag') return { t: 'flag', flag: ref.id, op: cmp.op, n: cmp.n, neg };
    if (ref.kind === 'invention') { errors.push(`"${text}": use "has ${cmp.name}" to check for an invention`); return null; }
    errors.push(`"${cmp.name}" isn't a meter or flag in this era`);
    return null;
  }
  const ref = resolveName(s, ctx);
  if (ref.kind === 'flag') return { t: 'flag', flag: ref.id, op: '>', n: 0, neg };
  if (ref.kind === 'invention') { errors.push(`"${text}": use "has ${s}" to check for an invention`); return null; }
  if (ref.kind === 'meter') { errors.push(`"${text}": compare a meter with a number, like "${s} < 30"`); return null; }
  errors.push(`"${s}" isn't a flag (declare it in flags.csv) or a known condition`);
  return null;
}

// Returns { all: [clause], once: bool, oncePerLife: bool, repeat: bool, errors }.
// A clause is { any: [atom] }; every clause must hold, and one atom per clause.
export function parseConditions(cell, ctx) {
  const errors = [];
  const out = { all: [], once: false, repeat: false, errors };
  for (const part of splitCell(cell)) {
    const key = normId(part);
    if (key === 'once') { out.once = true; continue; }
    if (key === 'repeat' || key === 'repeatable') { out.repeat = true; continue; }
    const alts = part.split(/\s+or\s+|\s*\|\s*/i).map((a) => parseAtom(a, ctx, errors)).filter(Boolean);
    if (alts.length) out.all.push({ any: alts });
  }
  return out;
}

// Returns { ops: [op], errors }.
export function parseEffects(cell, ctx) {
  const errors = [];
  const ops = [];
  for (const part of splitCell(cell)) {
    let m;
    if ((m = /^(set|clear)\s+(.+)$/i.exec(part))) {
      const id = normId(m[2]);
      if (!ctx.flags.has(id)) errors.push(`"${part}": no flag called "${m[2]}" in flags.csv`);
      ops.push({ t: 'flag', flag: id, op: '=', n: m[1].toLowerCase() === 'set' ? 1 : 0 });
      continue;
    }
    if ((m = /^(invent|use|next|die)\s+(.+)$/i.exec(part))) {
      const verb = m[1].toLowerCase();
      const id = normId(m[2]);
      if ((verb === 'invent' || verb === 'use') && !ctx.inventions.has(id)) {
        errors.push(`"${part}": no invention with id "${m[2]}"`);
      }
      // next/die targets are checked once every card and death is loaded.
      if (verb === 'invent') ops.push({ t: 'invent', inv: id });
      if (verb === 'use') ops.push({ t: 'use', inv: id });
      if (verb === 'next') ops.push({ t: 'next', card: id });
      if (verb === 'die') ops.push({ t: 'die', death: id });
      continue;
    }
    if ((m = /^(.+?)\s*([+-])\s*(\d+)$/.exec(part)) || (m = /^(.+?)\s*(=)\s*(-?\d+)$/.exec(part))) {
      const n = m[2] === '-' ? -Number(m[3]) : Number(m[3]);
      const op = m[2] === '=' ? '=' : '+';
      const ref = resolveName(m[1], ctx);
      if (ref.kind === 'meter') ops.push({ t: 'meter', role: ref.role, op, n });
      else if (ref.kind === 'invention' && op === '+') ops.push({ t: 'points', inv: ref.id, n });
      else if (ref.kind === 'flag') ops.push({ t: 'flag', flag: ref.id, op, n });
      else if (ref.kind === 'invention') errors.push(`"${part}": invention points can only go up or down (+ or -)`);
      else errors.push(`"${m[1].trim()}" isn't a meter, invention or flag in this era`);
      continue;
    }
    errors.push(`"${part}" isn't an effect I understand`);
  }
  return { ops, errors };
}

// "sparks right" / "sparks (right)" / "right: sparks" -> { inv, side }
export function parseTrigger(cell, ctx) {
  const s = String(cell ?? '').trim();
  if (!s) return { value: null, errors: [] };
  const m = /^(left|right)\b\s*:?\s*(.+)$/i.exec(s) || /^(.+?)\s*\(?\s*\b(left|right)\s*\)?$/i.exec(s);
  if (!m) return { value: null, errors: [`trigger "${s}" needs an invention and a side, like "tinder right"`] };
  const [a, b] = m.slice(1);
  const side = /^(left|right)$/i.test(a) ? a.toLowerCase() : b.toLowerCase();
  const inv = normId(/^(left|right)$/i.test(a) ? b : a);
  const errors = ctx.inventions.has(inv) ? [] : [`trigger: no invention with id "${inv}"`];
  return { value: { inv, side }, errors };
}

export function splitList(cell) {
  return splitCell(cell).map(normId);
}
