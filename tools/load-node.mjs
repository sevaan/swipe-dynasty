// Loads content/ from disk for the checker, the simulator and the tests.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildContent, CONTENT_FILES } from '../src/content/game-content.js';
import { ART_KINDS } from '../src/content/art.js';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export function readContentFiles(dir = join(ROOT, 'content')) {
  const files = {};
  for (const name of CONTENT_FILES) {
    try { files[name] = readFileSync(join(dir, name), 'utf8'); } catch { /* buildContent reports it missing */ }
  }
  return files;
}

// Every picture in content/art, keyed like "art/characters/c01-aru.svg" or
// "art/objects/vessel/basket.svg". Folders that aren't an art kind (retired/)
// are skipped.
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
  return buildContent(readContentFiles(dir), { art: readArtFiles(dir) });
}
