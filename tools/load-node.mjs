// Loads content/ from disk for the checker, the bot and the tests.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileContent, contentFileList } from '../src/content/compile.js';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export function readContentFiles(dir = join(ROOT, 'content')) {
  const files = { 'world.json': readFileSync(join(dir, 'world.json'), 'utf8') };
  for (const path of contentFileList(files['world.json'])) {
    try { files[path] = readFileSync(join(dir, path), 'utf8'); } catch { /* compile reports it missing */ }
  }
  return files;
}

// Every picture in content/art, keyed like "art/characters/mother.svg".
export function readArtFiles(dir = join(ROOT, 'content')) {
  const art = {};
  const root = join(dir, 'art');
  if (!existsSync(root)) return art;
  for (const kind of readdirSync(root, { withFileTypes: true })) {
    if (!kind.isDirectory()) continue;
    for (const file of readdirSync(join(root, kind.name))) {
      if (file.endsWith('.svg')) art[`art/${kind.name}/${file}`] = readFileSync(join(root, kind.name, file), 'utf8');
    }
  }
  return art;
}

export function loadContent(dir) {
  return compileContent(readContentFiles(dir), { art: readArtFiles(dir) });
}
