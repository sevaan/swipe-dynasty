// Loads content/ from disk for the checker, the bot and the tests.
import { readFileSync } from 'node:fs';
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

export function loadContent(dir) {
  return compileContent(readContentFiles(dir));
}
