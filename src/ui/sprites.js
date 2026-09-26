// Draws text sprites (see src/content/sprites.js) into images. Each sprite is
// painted once at one canvas pixel per sprite pixel and cached; CSS scales it
// by whole numbers with image-rendering: pixelated, so pixels stay crisp.

const cache = new Map();

// mode: 'color' (normal) or 'ghost' (a white silhouette; CSS sets its opacity)
export function spriteURL(content, id, mode = 'color') {
  const sprite = content.sprites[id] || content.sprites['ui-unknown'];
  const key = `${content.hash}|${sprite.id}|${mode}`;
  if (cache.has(key)) return cache.get(key);
  const canvas = document.createElement('canvas');
  canvas.width = sprite.w;
  canvas.height = sprite.h;
  const ctx = canvas.getContext('2d');
  sprite.rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.') continue;
      ctx.fillStyle = mode === 'ghost' ? '#ffffff' : content.palette[ch];
      ctx.fillRect(x, y, 1, 1);
    }
  });
  const url = canvas.toDataURL('image/png');
  cache.set(key, url);
  return url;
}

// The first and last rows that have any pixels, so meters can fill over the
// part of the icon that's actually drawn.
export function spriteBounds(content, id) {
  const sprite = content.sprites[id] || content.sprites['ui-unknown'];
  const drawn = sprite.rows.map((row, y) => (/[^.]/.test(row) ? y : -1)).filter((y) => y >= 0);
  return { top: drawn[0] ?? 0, bottom: drawn[drawn.length - 1] ?? sprite.h - 1, h: sprite.h };
}

export function spriteSize(content, id) {
  const sprite = content.sprites[id] || content.sprites['ui-unknown'];
  return { w: sprite.w, h: sprite.h };
}

export function spriteHTML(content, id, { scale = 2, mode = 'color', cls = '', alt = '' } = {}) {
  const { w, h } = spriteSize(content, id);
  const safeAlt = String(alt).replace(/"/g, '&quot;');
  return `<img class="px ${cls}" src="${spriteURL(content, id, mode)}" width="${w * scale}" height="${h * scale}" alt="${safeAlt}" draggable="false">`;
}

// Sets an existing <img> to a sprite at a whole-number scale.
export function setSprite(img, content, id, scale, mode = 'color') {
  const { w, h } = spriteSize(content, id);
  img.src = spriteURL(content, id, mode);
  img.width = w * scale;
  img.height = h * scale;
}
