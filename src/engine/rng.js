// Seeded randomness. Mulberry32 keeps its whole state in one 32-bit number,
// which is saved with the game, so a reload never rerolls a card.

export function seedFrom(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value >>> 0;
  let h = 2166136261;
  for (const ch of String(value)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h >>> 0;
}

// Advances holder.rng and returns a float in [0, 1).
export function random(holder) {
  let t = (holder.rng = (holder.rng + 0x6d2b79f5) >>> 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function randInt(holder, min, max) {
  return min + Math.floor(random(holder) * (max - min + 1));
}

export function pickWeighted(holder, items, weightOf) {
  const total = items.reduce((sum, it) => sum + Math.max(0, weightOf(it)), 0);
  if (total <= 0) return items.length ? items[Math.floor(random(holder) * items.length)] : undefined;
  let roll = random(holder) * total;
  for (const it of items) {
    roll -= Math.max(0, weightOf(it));
    if (roll < 0) return it;
  }
  return items[items.length - 1];
}
