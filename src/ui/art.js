// Shows the SVG pictures in content/art (see content/art/README.md).
// Colour pictures (portraits, invention icons, the hand) are plain images.
// One-colour glyphs (meters, interface pieces) are CSS masks painted with the
// current colour, so they follow each era's colours.

let base = new URL('content/', document.baseURI);

// Where content/ lives, for pages outside the site root (tools/art.html).
export function setArtBase(path) { base = new URL(path, document.baseURI); }

export function artURL(kind, id) {
  return new URL(`art/${kind}/${encodeURIComponent(id || 'unknown')}.svg`, base).href;
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

// A picture that fails to load (a typo in a CSV, say) becomes a question mark.
document.addEventListener('error', (e) => {
  const img = e.target;
  if (!(img instanceof HTMLImageElement) || !img.classList.contains('art') || img.dataset.missing) return;
  if (img.id === 'portrait') {
    // The card keeps its element; it just shows a question mark until the next card.
    img.hidden = true;
    img.closest('.card-face')?.classList.add('missing');
    return;
  }
  img.dataset.missing = '1';
  const mark = document.createElement('span');
  mark.className = `glyph missing ${img.className.replace(/\bart\b/, '')}`;
  mark.style.setProperty('--art', `url('${artURL('ui', 'unknown')}')`);
  if (img.width) { mark.style.width = `${img.width}px`; mark.style.height = `${img.height || img.width}px`; }
  img.replaceWith(mark);
}, true);
