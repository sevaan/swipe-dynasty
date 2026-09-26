// Loads content/ over the network for the browser. `no-cache` makes the
// browser check for a newer file on every load, so an edit pushed from a
// phone shows up on the next reload.
import { compileContent, contentFileList } from './compile.js';

export async function loadContentWeb(base = 'content/') {
  const get = async (path) => {
    const res = await fetch(base + path, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
    return res.text();
  };
  const files = { 'world.json': await get('world.json') };
  const paths = contentFileList(files['world.json']);
  const texts = await Promise.all(paths.map((p) => get(p).catch(() => null)));
  paths.forEach((p, i) => { if (texts[i] != null) files[p] = texts[i]; });
  return compileContent(files);
}
