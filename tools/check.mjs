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
    const projects = content.projectOrder.map((p) => content.projects[p]).filter((p) => p.era === id);
    const scenes = Object.values(content.scenes).filter((s) => projects.some((p) => p.id === s.project));
    const inv = content.inventionOrder.map((i) => content.inventions[i]).filter((i) => i.era === id);
    return `${id}: ${projects.length} projects, ${scenes.length} scenes, ${inv.length} inventions written`;
  });
  console.log(`\n${eras.join('\n')}`);
}
console.log(`\n${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
