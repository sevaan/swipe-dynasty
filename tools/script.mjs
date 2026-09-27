// Writes the script for review as Markdown: the same text as the page's
// "Download as Markdown" button on tools/script.html.
//   node tools/script.mjs                     prints everything
//   node tools/script.mjs script.md           writes it to a file
//   node tools/script.mjs --filter shared     just the shared history (or a route: simulation, departure,
//                                             retirement, reply, unmaking)
import { writeFileSync } from 'node:fs';
import { loadContent } from './load-node.mjs';
import { scriptText } from './script-text.js';

const args = process.argv.slice(2);
const f = args.indexOf('--filter');
const filter = f >= 0 ? args[f + 1] : 'all';
const out = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--filter');

const { content, errors } = loadContent();
if (errors.length) {
  for (const e of errors) console.error(`${e.file}:${e.line} ${e.message}`);
  process.exit(1);
}
const md = scriptText(content).markdown(filter);
if (out) {
  writeFileSync(out, md);
  console.error(`Wrote ${out}`);
} else {
  process.stdout.write(md);
}
