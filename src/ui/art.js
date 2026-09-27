// Shows the SVG pictures in content/art (see content/art/README.md).
// Colour pictures (portraits, workbenches, objects, overlays, the hand) are
// plain images. One-colour glyphs (interface pieces) are CSS masks painted
// with the current colour, so they follow each era's colours.

let base = new URL('content/', document.baseURI);

// Where content/ lives, for pages outside the site root (tools/art.html).
export function setArtBase(path) { base = new URL(path, document.baseURI); }

// An id can name a subfolder, like objects/vessel/fired-pot
export function artURL(kind, id) {
  const path = String(id || 'unknown').split('/').map(encodeURIComponent).join('/');
  return new URL(`art/${kind}/${path}.svg`, base).href;
}

const attr = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function artHTML(kind, id, { cls = '', alt = '', size = null } = {}) {
  const dims = size ? ` width="${size}" height="${size}"` : '';
  return `<img class="art ${cls}" src="${attr(artURL(kind, id))}"${dims} alt="${attr(alt)}" draggable="false">`;
}

export function glyphHTML(kind, id, { cls = '' } = {}) {
  return `<span class="glyph ${cls}" style="--art: url('${attr(artURL(kind, id))}')" aria-hidden="true"></span>`;
}

export function setGlyph(el, kind, id) {
  el.style.setProperty('--art', `url('${artURL(kind, id)}')`);
}

// A picture that fails to load (a typo in a CSV, say) becomes a question
// mark. The layers the game reuses (the workbench, the object, the exhibit)
// stay in place, hidden, so the next picture can still load into them.
document.addEventListener('error', (e) => {
  const img = e.target;
  if (!(img instanceof HTMLImageElement) || !img.classList.contains('art') || img.dataset.missing) return;
  console.warn(`Missing picture: ${img.src}`);
  if (img.closest('.bench, .exhibit, .pic, .marks')) { img.classList.add('broken'); return; }
  img.dataset.missing = '1';
  const mark = document.createElement('span');
  mark.className = `glyph missing ${img.className.replace(/\bart\b/, '')}`;
  mark.style.setProperty('--art', `url('${artURL('ui', 'unknown')}')`);
  if (img.width) { mark.style.width = `${img.width}px`; mark.style.height = `${img.height || img.width}px`; }
  img.replaceWith(mark);
}, true);

document.addEventListener('load', (e) => {
  if (e.target instanceof HTMLImageElement) e.target.classList.remove('broken');
}, true);
