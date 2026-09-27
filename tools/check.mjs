#!/usr/bin/env node
// Content checker: node tools/check.mjs
// Errors break the game and fail the check; each names the file, the line
// and the chapter, card or field. Warnings are worth a look (a missing
// drawing, say, which shows as a label until it's drawn).
import { loadContent } from './load-node.mjs';

const { content, errors, warnings } = loadContent();
const where = (p) => `${p.file}${p.line ? `:${p.line}` : ''}${p.column ? ` [${p.column}]` : ''}`;

for (const w of warnings) console.log(`warning  ${where(w)}  ${w.message}`);
for (const e of errors) console.log(`ERROR    ${where(e)}  ${e.message}`);

const C = content?.campaign;
if (C) {
  const cards = Object.keys(C.cards).length;
  const drawn = Object.keys(content.world.art || {}).length;
  console.log(`\nThe script: ${C.shared.length} shared lives, ${C.routeOrder.length} routes of ${C.routeOrder.map((r) => C.routes[r].chapters.length).join('/')} lives, ${cards} cards, ${cards * 2} results, ${C.callbacks.length} callbacks${C.redirect ? ', 1 redirect' : ''}.`);
  console.log(`Drawn workbenches: ${drawn} of ${C.chapterOrder.length} lives; the rest show each state's description as a label.`);
}
console.log(`\n${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
