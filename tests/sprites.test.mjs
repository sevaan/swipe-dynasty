import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseSprites } from '../src/content/sprites.js';
import { UI_SPRITES } from '../src/content/compile.js';
import { loadContent, ROOT } from '../tools/load-node.mjs';

const parse = (text) => {
  const errors = [];
  const out = parseSprites(['s.txt'], { 's.txt': text }, (file, line, column, message) => errors.push({ line, message }));
  return { ...out, errors };
};

const PALETTE = '== palette ==\nk #000000 outline\nw #ffffff white\n\n';

test('a mirrored sprite doubles each row with its mirror image', () => {
  const { sprites, errors } = parse(`${PALETTE}== dot ==\nmirror\n.k\nkw\n`);
  assert.deepEqual(errors, []);
  assert.deepEqual(sprites.dot.rows, ['.kk.', 'kwwk']);
  assert.equal(sprites.dot.w, 4);
  assert.equal(sprites.dot.h, 2);
});

test('uneven rows and unknown colours are errors with line numbers', () => {
  const { errors } = parse(`${PALETTE}== bad ==\nkkk\nkk\nkzk\n`);
  assert.equal(errors.length, 2);
  assert.equal(errors[0].line, 7);
  assert.match(errors[0].message, /2 pixels wide/);
  assert.match(errors[1].message, /"z" isn't in the palette/);
});

test('comments and blank lines between sprites are fine; stray text is not', () => {
  const ok = parse(`${PALETTE}# a note\n== a ==\nk\n\n# another\n== b ==\nw\n`);
  assert.deepEqual(ok.errors, []);
  assert.deepEqual(Object.keys(ok.sprites), ['a', 'b']);
  const stray = parse(`${PALETTE}== a ==\nk\n\nloose text\n`);
  assert.match(stray.errors[0].message, /outside/);
});

const real = loadContent();

test('every portrait, meter icon, invention icon and interface piece has a sprite', () => {
  const { content } = real;
  for (const ch of Object.values(content.characters)) assert.ok(content.sprites[ch.portrait], `portrait for ${ch.id}`);
  for (const era of Object.values(content.eras)) {
    for (const m of Object.values(era.meters)) assert.ok(content.sprites[m.icon], `meter icon ${m.icon}`);
  }
  for (const inv of Object.values(content.inventions)) assert.ok(content.sprites[inv.icon], `icon for ${inv.id}`);
  for (const id of UI_SPRITES) assert.ok(content.sprites[id], id);
});

// Sevaan's call (Sep 26, 2026): no emoji anywhere. Pictures are pixel sprites.
test('no emoji in the game, its content or its interface', () => {
  const EMOJI = /\p{Extended_Pictographic}/u;
  const files = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.(js|mjs|css|html|csv|json|txt)$/.test(name)) files.push(path);
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
