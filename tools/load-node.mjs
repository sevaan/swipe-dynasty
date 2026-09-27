// Loads content/ from disk for the checker, the bot and the tests.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileContent, contentFileList } from '../src/content/compile.js';
import { ART_KINDS } from '../src/content/art.js';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export function readContentFiles(dir = join(ROOT, 'content')) {
  const files = { 'world.json': readFileSync(join(dir, 'world.json'), 'utf8') };
  for (const path of contentFileList(files['world.json'])) {
    try { files[path] = readFileSync(join(dir, path), 'utf8'); } catch { /* compile reports it missing */ }
  }
  return files;
}

// Every picture in content/art, keyed like "art/characters/mother.svg" or
// "art/objects/vessel/basket.svg". Folders that aren't an art kind (retired/) are skipped.
export function readArtFiles(dir = join(ROOT, 'content')) {
  const art = {};
  const root = join(dir, 'art');
  if (!existsSync(root)) return art;
  const walk = (rel) => {
    for (const entry of readdirSync(join(root, rel), { withFileTypes: true })) {
      const path = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) { if (rel === 'objects' || !rel) walk(path); continue; }
      if (rel && entry.name.endsWith('.svg')) art[`art/${path}`] = readFileSync(join(root, path), 'utf8');
    }
  };
  for (const kind of Object.keys(ART_KINDS)) if (existsSync(join(root, kind))) walk(kind);
  return art;
}

export function loadContent(dir) {
  return compileContent(readContentFiles(dir), { art: readArtFiles(dir) });
}
