// Writes the whole game as a Markdown script, in play order: the same text
// as the "Download as Markdown" button on tools/script.html.
//   node tools/script.mjs              prints it
//   node tools/script.mjs script.md    writes it to a file
import { writeFileSync } from 'node:fs';
import { loadContent } from './load-node.mjs';
import { scriptText } from './script-text.js';

const { content, errors } = loadContent();
if (errors.length) {
  for (const e of errors) console.error(`${e.file}:${e.line} ${e.message}`);
  process.exit(1);
}
const md = scriptText(content).markdown();
const out = process.argv[2];
if (out) {
  writeFileSync(out, md);
  console.error(`Wrote ${out}`);
} else {
  process.stdout.write(md);
}
