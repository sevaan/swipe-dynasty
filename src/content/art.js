// Pictures are SVG files in content/art, one per picture (see content/art/README.md).
// This file knows where each kind of picture lives and what a good file looks
// like. The checker and the tests read the files; the browser just loads them
// as images when it needs them.

export const ART_KINDS = {
  characters: { w: 288, h: 360 },
  inventions: { w: 64, h: 64 },
  ui: { w: 48, h: 48 },
  // The workbench: an era's backdrop, the prototype's states (one folder per
  // project) and reusable overlays, all stacked on the same 320 x 240 canvas.
  benches: { w: 320, h: 240 },
  objects: { w: 320, h: 240 },
  overlays: { w: 320, h: 240 },
};

// Pieces the interface itself draws with.
export const UI_ART = ['menu', 'close', 'hand', 'grave', 'door', 'unknown', 'arrow-left', 'arrow-right'];

export const artPath = (kind, id) => `art/${kind}/${id}.svg`;

// Things an art file must not contain. The game shows pictures as images, so
// none of this could run anyway, but a clean file is easy to edit and review.
const FORBIDDEN = [
  [/<script/i, 'a <script>'],
  [/<foreignObject/i, 'a <foreignObject>'],
  [/<image/i, 'an embedded <image> (draw it as shapes)'],
  [/<text/i, 'a <text> element (draw letters as shapes, or put words in the card instead)'],
  [/<style/i, 'a <style> block (set fill and stroke on the shapes)'],
  [/\son[a-z]+\s*=/i, 'an event handler attribute'],
  [/javascript:/i, 'a javascript: link'],
  [/(?:xlink:)?href\s*=\s*["'](?!#)/i, 'a link to another file (only #ids inside the same file)'],
  [/url\(\s*(?!["']?#)/i, 'a url() that points outside the file'],
];

// Problems with one art file, as plain sentences.
export function artProblems(kind, text) {
  const problems = [];
  const s = String(text).trim().replace(/^<\?xml[^>]*>\s*/i, '').replace(/^(<!--[\s\S]*?-->\s*)+/, '');
  if (!/^<svg[\s>]/i.test(s)) {
    problems.push("isn't an SVG (it should start with <svg)");
    return problems;
  }
  const head = s.slice(0, s.indexOf('>') + 1);
  const vb = /viewBox\s*=\s*["']\s*([-\d.]+)[\s,]+([-\d.]+)[\s,]+([-\d.]+)[\s,]+([-\d.]+)\s*["']/i.exec(head);
  const want = ART_KINDS[kind];
  if (!vb) problems.push(`has no viewBox (it should be "0 0 ${want.w} ${want.h}")`);
  else if (Number(vb[1]) !== 0 || Number(vb[2]) !== 0 || Number(vb[3]) !== want.w || Number(vb[4]) !== want.h) {
    problems.push(`has viewBox "${vb.slice(1).join(' ')}"; ${kind} use "0 0 ${want.w} ${want.h}"`);
  }
  for (const [re, what] of FORBIDDEN) if (re.test(s)) problems.push(`contains ${what}`);
  if (!/<\/svg>\s*$/i.test(s)) problems.push('is cut off (no closing </svg>)');
  return problems;
}

// Every picture the content refers to, with where the reference is:
// each era's workbench, the exhibit plinth, the drawn workbench states and
// their overlays (world.json "art"), the drawn portraits, and the interface.
export function artReferences(content) {
  const refs = [];
  const add = (kind, id, where, what) => refs.push({ kind, id, where, what });
  const world = content.world || {};
  for (const [id, age] of Object.entries(world.ages || {})) add('benches', age.bench, `ages.${id}.bench`, `the ${age.name || id} workbench`);
  add('benches', 'exhibit', 'exhibit', 'the exhibit plinth');
  const look = (value, where, chapter) => {
    const obj = typeof value === 'string' ? { object: value } : value || {};
    const objects = obj.object && typeof obj.object === 'object' ? [obj.object.left, obj.object.right] : [obj.object];
    for (const o of objects) if (o) add('objects', o, where, `a ${chapter} workbench state`);
    for (const m of obj.marks || []) add('overlays', m, where, `the "${m}" overlay`);
  };
  for (const [chapter, states] of Object.entries(world.art || {})) {
    states.forEach((st, i) => {
      look(st, `art.${chapter}[${i}]`, chapter);
      for (const side of ['left', 'right']) if (st[side]) look(st[side], `art.${chapter}[${i}].${side}`, chapter);
    });
  }
  for (const [key, id] of Object.entries(world.portraits || {})) add('characters', id, `portraits.${key}`, `the portrait of ${key}`);
  for (const id of UI_ART) add('ui', id, 'ui', 'the interface');
  return refs;
}
