#!/usr/bin/env node
// Content checker: node tools/check.mjs
// Errors break the game and fail the check. Warnings are worth a look.
import { loadContent } from './load-node.mjs';

const { content, errors, warnings } = loadContent();
const where = (p) => `${p.file}${p.line ? `:${p.line}` : ''}${p.column ? ` [${p.column}]` : ''}`;

for (const w of warnings) console.log(`warning  ${where(w)}  ${w.message}`);
for (const e of errors) console.log(`ERROR    ${where(e)}  ${e.message}`);

if (content) {
  const eras = content.eraOrder.map((id) => {
    const inv = content.inventionOrder.map((i) => content.inventions[i]).filter((i) => i.era === id);
    const cards = content.cardOrder.map((c) => content.cards[c]).filter((c) => c.era === id);
    return `${id}: ${cards.length} cards (${content.bagByEra[id].length} in the bag), ${inv.length} inventions`;
  });
  console.log(`\n${eras.join('\n')}`);
}
console.log(`\n${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
