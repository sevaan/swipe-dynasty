import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { artProblems, artReferences, artPath, UI_ART } from '../src/content/art.js';
import { loadContent, readArtFiles, ROOT } from '../tools/load-node.mjs';

const svg = (vb, body = '<rect width="10" height="10"/>') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;

test('a clean picture with the right canvas passes', () => {
  assert.deepEqual(artProblems('inventions', svg('0 0 64 64')), []);
  assert.deepEqual(artProblems('characters', `<!-- a comment -->\n${svg('0 0 288 360', '<clipPath id="f"><rect/></clipPath><rect clip-path="url(#f)"/><use href="#f"/>')}`), []);
});

test('the wrong canvas, a missing viewBox, or a cut-off file is reported', () => {
  assert.match(artProblems('meters', svg('0 0 64 64'))[0], /"0 0 48 48"/);
  assert.match(artProblems('ui', '<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>')[0], /no viewBox/);
  assert.match(artProblems('ui', '<svg viewBox="0 0 48 48"><rect/>').join(' '), /cut off/);
  assert.match(artProblems('ui', '<png>')[0], /isn't an SVG/);
});

test('scripts, text, embedded images and outside links are not allowed', () => {
  const bad = (body) => artProblems('inventions', svg('0 0 64 64', body)).join(' ');
  assert.match(bad('<script>alert(1)</script>'), /script/);
  assert.match(bad('<text>Hi</text>'), /text/);
  assert.match(bad('<image href="x.png"/>'), /image/);
  assert.match(bad('<rect onclick="x()"/>'), /event handler/);
  assert.match(bad('<use href="other.svg#a"/>'), /another file/);
  assert.match(bad('<rect fill="url(http://example.com/a)"/>'), /url/);
  assert.equal(bad(`<rect fill="url('#g')"/>`), '');
});

const real = loadContent();
const art = readArtFiles();

test('every portrait, meter, invention icon and interface piece has a picture, and every picture is clean', () => {
  const missing = artReferences(real.content).map((r) => artPath(r.kind, r.id)).filter((p) => art[p] == null);
  assert.deepEqual([...new Set(missing)], []);
  for (const id of UI_ART) assert.ok(art[artPath('ui', id)], `ui/${id}`);
  const problems = Object.entries(art).flatMap(([path, text]) => artProblems(path.split('/')[1], text).map((p) => `${path} ${p}`));
  assert.deepEqual(problems, []);
  assert.deepEqual(real.errors, []);
});

// Sevaan's call (Sep 26, 2026): no emoji anywhere. Pictures are drawn as art.
test('no emoji in the game, its content, its art or its interface', () => {
  const EMOJI = /\p{Extended_Pictographic}/u;
  const files = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.(js|mjs|css|html|csv|json|txt|svg|md)$/.test(name)) files.push(path);
    }
  };
  for (const dir of ['src', 'content', 'tools', 'tests']) walk(join(ROOT, dir));
  files.push(join(ROOT, 'index.html'), join(ROOT, 'styles.css'), join(ROOT, 'sw.js'));
  const found = [];
  for (const path of files) {
    readFileSync(path, 'utf8').split('\n').forEach((line, i) => {
      const m = EMOJI.exec(line);
      if (m) found.push(`${path.slice(ROOT.length + 1)}:${i + 1} ${m[0]}`);
    });
  }
  assert.deepEqual(found, []);
});
