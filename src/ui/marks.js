// Little drawings for the cards, as inline SVG: no emoji, nothing to load.

export const arrow = (dir) => `<svg class="arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="${dir === 'left' ? 'M19 12H6M11.5 6 5.5 12l6 6' : 'M5 12h13M12.5 6l6 6-6 6'}" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// The deck's emblem: a spark, the game's one bright idea
export const spark = (fill, core) => `<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="${fill}" d="M24 3c1.6 9.4 4.9 13.8 21 21-16.1 7.2-19.4 11.6-21 21-1.6-9.4-4.9-13.8-21-21 16.1-7.2 19.4-11.6 21-21Z"/><circle cx="24" cy="24" r="4.2" fill="${core}"/></svg>`;

// Swipe either way
export const swipeIcon = '<svg viewBox="0 0 30 20" aria-hidden="true"><path d="M8 5 3 10l5 5M22 5l5 5-5 5M4 10h22"/></svg>';

// The Archive: an open book
export const book = '<svg class="book" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" fill="var(--panel)"/><path d="M20 13c-3-2-7-3-11-3v17c4 0 8 1 11 3z" fill="var(--accent)"/><path d="M20 13c3-2 7-3 11-3v17c-4 0-8 1-11 3z" fill="var(--text)" opacity=".85"/></svg>';

// The back of every card in the deck: kraft with a diamond lattice and the
// spark. The reveal's is gilt, the epitaph's is mourning black.
export function backArt(variant) {
  const fill = variant === 'gilt' ? 'var(--gilt)' : variant === 'mourn' ? 'var(--paper)' : 'var(--accent)';
  const core = variant === 'mourn' ? 'var(--mourn)' : 'var(--paper)';
  return `<div class="back-art" aria-hidden="true"><div class="emblem">${spark(fill, core)}</div></div>`;
}
