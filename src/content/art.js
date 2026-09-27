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

// Every picture the content refers to, with where the reference is and
// whether a missing file breaks the game ('error') or just shows a question mark ('warn').
export function artReferences(content) {
  const refs = [];
  const add = (kind, id, file, line, column, what, level = 'error') => refs.push({ kind, id, file, line, column, level, what });
  for (const ch of Object.values(content.characters)) {
    if (ch.portrait) add('characters', ch.portrait, 'characters.csv', ch.line, 'portrait', `the portrait for ${ch.id}`);
  }
  for (const era of Object.values(content.eras)) add('benches', era.bench, 'world.json', 0, `eras.${era.id}.bench`, `the ${era.name} workbench`);
  add('benches', 'exhibit', 'world.json', 0, '', 'the exhibit plinth on the death screen');
  for (const [project, looks] of Object.entries(content.looks)) {
    for (const [look, where] of Object.entries(looks)) add('objects', `${project}/${look}`, where.file, where.line, where.column, `the "${look}" look of ${project}`);
  }
  for (const [mark, where] of Object.entries(content.marks)) add('overlays', mark, where.file, where.line, where.column, `the "${mark}" overlay`);
  for (const id of UI_ART) add('ui', id, 'art/ui', 0, '', 'the interface');
  return refs;
}
