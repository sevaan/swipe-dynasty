// Pixel sprites written as text: one character per pixel, "." for
// transparent, colours from a shared palette. Parsed here once when content
// loads; src/ui/sprites.js draws them.
//
//   == palette ==
//   k #1c130f outline
//
//   == mother ==
//   mirror          (optional: each row is the left half; the right is its mirror image)
//   ..........kk
//   .........kHH

import { normId } from './syntax.js';

const HEADER = /^==\s*(.+?)\s*==$/;
const PALETTE_LINE = /^(\S)\s+(#[0-9a-fA-F]{6})(\s.*)?$/;

export function parseSprites(paths, files, err) {
  const palette = {};
  const sprites = {};
  const pending = [];

  for (const path of paths) {
    const text = files[path];
    if (text == null) { err(path, 0, '', `Missing file ${path}`); continue; }
    let block = null;
    const close = () => {
      if (block?.kind === 'sprite') pending.push(block);
      block = null;
    };
    text.replace(/\r\n?/g, '\n').split('\n').forEach((raw, i) => {
      const line = i + 1;
      const s = raw.trim();
      if (s.startsWith('#')) return;
      const head = HEADER.exec(s);
      if (head) {
        close();
        const id = normId(head[1]);
        block = id === 'palette' ? { kind: 'palette' } : { kind: 'sprite', id, path, line, rows: [], mirror: false };
        return;
      }
      if (!block) {
        if (s) err(path, line, '', 'Text outside a "== name ==" block');
        return;
      }
      if (block.kind === 'palette') {
        if (!s) return;
        const m = PALETTE_LINE.exec(s);
        if (!m) { err(path, line, '', 'Palette lines look like: k #1c130f outline'); return; }
        if ('.=#'.includes(m[1])) { err(path, line, '', `"${m[1]}" can't be a colour ("." is always transparent)`); return; }
        if (palette[m[1]]) err(path, line, '', `Palette colour "${m[1]}" is defined twice`);
        palette[m[1]] = m[2].toLowerCase();
        return;
      }
      if (!s) { if (block.rows.length) close(); return; }
      if (s === 'mirror') { block.mirror = true; return; }
      block.rows.push({ text: s, line });
    });
    close();
  }

  for (const b of pending) {
    if (!b.rows.length) { err(b.path, b.line, '', `Sprite "${b.id}" has no pixels`); continue; }
    if (sprites[b.id]) { err(b.path, b.line, '', `Sprite "${b.id}" is defined twice`); continue; }
    const width = b.rows[0].text.length;
    let ok = true;
    for (const r of b.rows) {
      if (r.text.length !== width) {
        err(b.path, r.line, '', `This row of "${b.id}" is ${r.text.length} pixels wide; its first row is ${width}`);
        ok = false;
      }
      const unknown = [...new Set([...r.text].filter((ch) => ch !== '.' && !palette[ch]))];
      if (unknown.length) {
        err(b.path, r.line, '', `"${unknown.join('", "')}" isn't in the palette`);
        ok = false;
      }
    }
    if (!ok) continue;
    const rows = b.rows.map((r) => (b.mirror ? r.text + [...r.text].reverse().join('') : r.text));
    sprites[b.id] = { id: b.id, w: rows[0].length, h: rows.length, rows, src: { file: b.path, line: b.line } };
  }
  return { palette, sprites };
}
