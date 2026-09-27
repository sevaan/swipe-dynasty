// The opening life, from the real script and art, for the layout
// prototypes. Every prototype plays the same words and pictures, so the
// only thing that differs between them is the design.
import { loadContentWeb } from '../../src/content/load-web.js';

const ROOT = new URL('../../content/', import.meta.url);
export const art = (path) => new URL(`art/${path}.svg`, ROOT).href;

export async function loadLife(id = 'C01') {
  const { content, errors } = await loadContentWeb(ROOT.href);
  if (errors.length) throw new Error(errors.map((e) => e.message).join('\n'));
  const C = content.campaign;
  const ch = C.chapters[id];
  const world = content.world;
  const age = world.ages[content.ageOf[id]];
  const portraitOf = (castId) => {
    const drawn = world.portraits?.[`${id}:${castId}`];
    return drawn ? art(`characters/${drawn}`) : null;
  };
  const inventorCast = ch.castOrder.find((k) => ch.cast[k].name.toLowerCase() === ch.inventor.name.split(' ')[0].toLowerCase());

  // The workbench picture for a state: before a card (phase 'before'), or
  // after an answer ('left' / 'right'). Returns image URLs, back to front.
  const states = world.art?.[id] || [];
  function picture(index, phase = 'before', choices = {}) {
    const st = states[index];
    const layers = [art(`benches/${age.bench}`)];
    if (!st) return { layers, label: ch.bench[index] };
    let look = phase === 'before' ? st : st[phase] ?? st;
    if (typeof look === 'string') look = { object: look };
    let object = look.object;
    if (object && typeof object === 'object') object = object[choices[object.from]] || object.left;
    if (object) layers.push(art(`objects/${object}`));
    for (const m of look.marks || []) layers.push(art(`overlays/${m}`));
    return { layers, label: ch.bench[index] };
  }

  return {
    id,
    title: ch.title,
    era: ch.era,
    arrival: ch.arrival,
    inventor: { ...ch.inventor, portrait: portraitOf(inventorCast) },
    invention: { ...ch.invention },
    theme: age.theme,
    sky: age.sky,
    cards: ch.cards.map((c) => ({
      id: c.id,
      kind: c.kind,
      text: c.text,
      speaker: { name: ch.cast[c.speaker]?.name, portrait: portraitOf(c.speaker) },
      left: { label: c.left.label, result: c.left.result },
      right: { label: c.right.label, result: c.right.result },
    })),
    legacy: ch.legacy,
    death: ch.death,
    ui: content.ui,
    picture,
    bench: art(`benches/${age.bench}`),
    exhibit: art('benches/exhibit'),
  };
}
