// Pictures are SVG files in content/art, one per picture (see content/art/README.md).
// This file knows where each kind of picture lives and what a good file looks
// like. The checker and the tests read the files; the browser just loads them
// as images when it needs them.

export const ART_KINDS = {
  characters: { w: 288, h: 360 },
  inventions: { w: 64, h: 64 },
  meters: { w: 48, h: 48 },
  ui: { w: 48, h: 48 },
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
export function artReferences(content, paths = {}) {
  const refs = [];
  const charPath = paths.characters || 'characters.csv';
  const invPath = paths.inventions || 'inventions.csv';
  for (const ch of Object.values(content.characters)) {
    refs.push({ kind: 'characters', id: ch.portrait, file: charPath, line: ch.line, column: 'portrait', level: 'error', what: `the portrait for ${ch.id}` });
  }
  for (const era of Object.values(content.eras)) {
    for (const [role, m] of Object.entries(era.meters)) {
      refs.push({ kind: 'meters', id: m.icon, file: 'world.json', line: 0, column: `eras.${era.id}.meters.${role}.icon`, level: 'error', what: `the "${m.label}" meter` });
    }
  }
  for (const inv of Object.values(content.inventions)) {
    refs.push({ kind: 'inventions', id: inv.icon, file: invPath, line: inv.line, column: 'icon', level: 'warn', what: `${inv.id} (the Museum shows a question mark)` });
  }
  for (const id of UI_ART) refs.push({ kind: 'ui', id, file: 'art/ui', line: 0, column: '', level: 'error', what: 'the interface' });
  return refs;
}
