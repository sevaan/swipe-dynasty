// Loads content/ over the network for the browser: the script, how it looks
// and the interface's words. `no-cache` makes the browser check for a newer
// file on every load, so an edit pushed from a phone shows up on the next
// reload.
import { buildContent, CONTENT_FILES } from './game-content.js';

export async function loadContentWeb(base = 'content/') {
  const files = {};
  await Promise.all(CONTENT_FILES.map(async (name) => {
    const res = await fetch(base + name, { cache: 'no-cache' });
    if (res.ok) files[name] = await res.text();
  }));
  return buildContent(files);
}
