// content/script.md is the game: Sevaan's complete script, read as it's
// written. Chapter and card headings and the bold field labels are the
// structure; everything else in the document (the implementation contract,
// author notes, directions) is for people and is skipped. Every error names
// the line and the chapter, card and field, so a slip in a rewrite points
// straight at itself. The browser, the checker and the tests all read the
// script through this one function.

// A life's cards in order: the six-card rhythm, and the short Stone Age
// life (C01–C04) of three, whose danger card ends it (the script's section 3)
export const SHAPES = {
  full: ['opening', 'experiment', 'complication', 'proof', 'adoption', 'legacy'],
  short: ['opening', 'proof', 'danger'],
};
export const KINDS = SHAPES.full;
export const AFFINITY_KEYS = ['S', 'D', 'R', 'A', 'U'];
export const ARCHIVE = 'archive';

const RE = {
  route: /^# \d+\.\s+(.+?) route\s*$/,
  chapter: /^## ([A-Z]\d+) — (.+?)\s*$/,
  ending: /^## Ending — (.+?)\s*$/,
  card: /^### ([A-Z]\d+)\.([1-6]) — (\w+)\s*$/,
  redirect: /^### (REDIRECT\.[A-Z0-9]+) — (.+?)\s*$/,
  callback: /^### Callback (\d+)\s*$/,
  sub: /^### (.+?)\s*$/,
  top: /^# /,
  field: /^\*\*([^*]+?):\*\*\s?(.*?)\s*$/,
  option: /^\*\*(Left|Right): (.+?)\*\*\s*$/,
  castItem: /^- `([^`]+)` — \*\*([^*]+?):\*\*\s*(.*?)\s*$/,
  benchItem: /^(\d+)\.\s+(.+?)\s*$/,
  variant: /^\*\*After panel five, if ([A-Z]\d+\.[1-6]) was (left|right):\*\*\s*(.*?)\s*$/,
  override: /^\*\*Arrival override after (REDIRECT\.[A-Z0-9]+) = (left|right):\*\*\s*(.*?)\s*$/,
};

const code = (s) => String(s ?? '').replace(/`/g, '').trim();

// "Aru — A cold, persistent experimenter"
function splitDash(s) {
  const i = s.indexOf(' — ');
  return i < 0 ? [s.trim(), ''] : [s.slice(0, i).trim(), s.slice(i + 3).trim()];
}

// "experimental exposure +1; A affinity +1."
function parseEffects(text, fail) {
  const out = { danger: 0, affinity: {} };
  for (const raw of String(text).split(';')) {
    const part = raw.trim().replace(/\.$/, '').replace(/−/g, '-');
    if (!part) continue;
    let m;
    if ((m = /^experimental exposure (unchanged|[+-]\d+)$/i.exec(part))) {
      out.danger = m[1] === 'unchanged' ? 0 : Number(m[1]);
    } else if ((m = /^([SDRAU]) affinity ([+-]\d+)$/.exec(part))) {
      out.affinity[m[1]] = (out.affinity[m[1]] || 0) + Number(m[2]);
    } else {
      fail(`"${part}" isn't an effect (expected "experimental exposure unchanged/+N" or "X affinity +N")`);
    }
  }
  return out;
}

export function parseScript(text, { file = 'content/script.md' } = {}) {
  const errors = [];
  const warnings = [];
  const lines = String(text).replace(/\r\n?/g, '\n').split('\n');

  const chapters = {};
  const chapterOrder = [];
  const routes = {};
  const routeOrder = [];
  const callbacks = [];
  const overrides = {};
  let redirect = null;

  let route = null; // the route section we're in
  let chapter = null;
  let card = null;
  let option = null;
  let ending = null;
  let block = null; // 'cast', 'bench', 'closing', 'proposal', 'callbacks' ...
  let callback = null;
  let lastField = null; // for a continuation line directly under a field
  let expectInventionText = false;

  const err = (n, msg, ...ctx) => errors.push({ file, line: n, column: ctx.filter(Boolean).join(' '), message: msg });
  const warn = (n, msg, ...ctx) => warnings.push({ file, line: n, column: ctx.filter(Boolean).join(' '), message: msg });

  const closeCard = () => { card = null; option = null; };
  const closeChapter = () => { closeCard(); chapter = null; };

  for (let i = 0; i < lines.length; i++) {
    const n = i + 1;
    const line = lines[i].replace(/\s+$/, '');
    let m;
    if (!line.trim()) { lastField = null; continue; }

    // Headings set the context
    if ((m = RE.route.exec(line))) {
      closeChapter(); ending = null; block = null; callback = null;
      route = { name: m[1], id: null, title: '', pitch: '', acceptLabel: '', chapters: [], ending: null, line: n };
      continue;
    }
    if (line.startsWith('# ')) {
      // Any other top-level section ends a route (the callback registry, the build notes)
      closeChapter(); ending = null; route = null;
      block = /^# 15\./.test(line) || /callback registry/i.test(line) ? 'callbacks' : null;
      callback = null;
      continue;
    }
    if ((m = RE.chapter.exec(line))) {
      closeChapter(); ending = null; block = null;
      const id = m[1];
      if (chapters[id]) err(n, `Chapter ${id} appears twice`, id);
      chapter = {
        id, title: m[2], era: '', arrival: '', prerequisite: null, prerequisiteText: '',
        inventor: { name: '', role: '', want: '' }, cast: {}, castOrder: [],
        invention: { id: '', name: '', description: '' }, bench: [], cards: [],
        legacy: { left: '', right: '' }, death: { natural: '', risk: null, left: '', right: '' }, final: false,
        route: route?.id ?? null, line: n,
      };
      chapters[id] = chapter;
      chapterOrder.push(id);
      if (route) route.chapters.push(id);
      continue;
    }
    if ((m = RE.ending.exec(line))) {
      closeChapter(); block = 'ending';
      if (!route) { err(n, 'An ending outside a route section'); continue; }
      ending = { title: m[1], panels: [], variants: {}, card: null, line: n };
      route.ending = ending;
      continue;
    }
    if ((m = RE.redirect.exec(line))) {
      closeCard(); block = 'redirect';
      redirect = { id: m[1], title: m[2], after: null, speaker: null, text: '', left: null, right: null, line: n };
      card = redirect;
      continue;
    }
    if ((m = RE.callback.exec(line))) {
      block = 'callbacks';
      callback = { n: Number(m[1]), after: null, card: null, side: null, text: '', line: n };
      callbacks.push(callback);
      continue;
    }
    if ((m = RE.card.exec(line))) {
      option = null; block = 'card';
      if (!chapter || m[1] !== chapter.id) { err(n, `Card ${m[1]}.${m[2]} isn't under chapter ${m[1]}`, `${m[1]}.${m[2]}`); card = null; continue; }
      const index = Number(m[2]) - 1;
      const kind = m[3].toLowerCase();
      card = { id: `${m[1]}.${m[2]}`, index, kind, speaker: null, text: '', left: null, right: null, line: n };
      if (chapter.cards[index]) err(n, `Card ${card.id} appears twice`, card.id);
      chapter.cards[index] = card;
      continue;
    }
    if ((m = RE.sub.exec(line))) {
      option = null;
      const title = m[1];
      if (chapter && card && card !== redirect) card = null;
      if (/^Cast$/i.test(title)) block = 'cast';
      else if (/^Workbench progression$/i.test(title)) block = 'bench';
      else if (/^Closing record$/i.test(title)) block = 'closing';
      else if (/^Proposal copy$/i.test(title)) block = 'proposal';
      else block = 'other';
      if (block !== 'other' && block !== 'proposal' && !chapter) err(n, `"${title}" outside a chapter`);
      continue;
    }

    // Lists: the cast and the workbench states
    if (block === 'cast' && (m = RE.castItem.exec(line))) {
      const id = m[1];
      if (chapter.cast[id]) err(n, `Cast member ${id} appears twice in ${chapter.id}`, chapter.id, 'cast');
      chapter.cast[id] = { id, name: m[2], description: m[3] };
      chapter.castOrder.push(id);
      continue;
    }
    if (block === 'bench' && (m = RE.benchItem.exec(line))) {
      chapter.bench.push(m[2]);
      if (Number(m[1]) !== chapter.bench.length) err(n, `Workbench state ${m[1]} is out of order in ${chapter.id}`, chapter.id, 'workbench');
      continue;
    }

    if ((m = RE.variant.exec(line))) {
      if (!ending) { err(n, 'An ending variant outside an ending'); continue; }
      ending.card ||= m[1];
      if (ending.card !== m[1]) err(n, `Ending variants refer to both ${ending.card} and ${m[1]}`, 'ending');
      // "Credits." at the end of a variant is a stage direction: the credits always follow
      ending.variants[m[2]] = m[3].replace(/\s*Credits\.$/, '');
      lastField = null;
      continue;
    }
    if ((m = RE.override.exec(line))) {
      const o = /Replace (\w+)’s normal arrival with: “(.+?)”\.?\s*Set the era label to “(.+?)”/.exec(m[3]);
      if (!o) { err(n, 'Arrival override should read: Replace X’s normal arrival with: “…”. Set the era label to “…”.', 'override'); continue; }
      overrides[o[1]] = { when: { card: m[1], side: m[2] }, arrival: o[2], era: o[3].replace(/\.$/, ''), line: n };
      continue;
    }

    if ((m = RE.option.exec(line))) {
      if (!card) { err(n, `"${m[1]}: ${m[2]}" isn't inside a card`); continue; }
      const side = m[1].toLowerCase();
      if (card[side]) err(n, `${card.id} has two ${side} answers`, card.id, side);
      option = { side, label: m[2], result: '', effects: null, danger: 0, affinity: {}, transition: null, line: n };
      card[side] = option;
      lastField = null;
      continue;
    }

    if ((m = RE.field.exec(line))) {
      const label = m[1].trim();
      const value = m[2];
      lastField = { label, set: null };
      const ctx = card?.id || chapter?.id || (route ? `route ${route.id || route.name}` : '');

      // Callbacks
      if (block === 'callbacks' && callback) {
        if (label === 'After') callback.after = code(value);
        else if (label === 'Only if') {
          const c = /^`?([A-Z0-9]+\.[1-6])\s*=\s*(left|right)`?$/.exec(value.trim());
          if (c) { callback.card = c[1]; callback.side = c[2]; } else err(n, `"${value}" should look like \`C01.6 = right\``, `callback ${callback.n}`, 'Only if');
        } else if (label === 'Text') { callback.text = value; lastField.set = (v) => { callback.text += ` ${v}`; }; }
        continue;
      }

      // An answer's fields
      if (option && ['Result', 'Effects', 'Transition'].includes(label)) {
        if (label === 'Result') { option.result = value; lastField.set = (v) => { option.result += ` ${v}`; }; }
        if (label === 'Effects') {
          option.effects = value;
          Object.assign(option, parseEffects(value, (msg) => err(n, msg, ctx, option.side, 'Effects')));
        }
        if (label === 'Transition') option.transition = (/`([A-Z]\d+)`/.exec(value) || [])[1] || null;
        continue;
      }

      // A card's own fields (and the redirect's)
      if (card && ['Speaker', 'Situation', 'When', 'Proof rule'].includes(label)) {
        if (label === 'Speaker') {
          const s = /\(`([^`]+)`\)/.exec(value);
          card.speaker = s ? s[1] : null;
          card.speakerText = value.replace(/\.$/, '');
          if (!s) err(n, `Speaker "${value}" needs its id in backticks, like Iri (\`iri\`)`, ctx, 'Speaker');
        }
        if (label === 'Situation') { card.text = value; lastField.set = (v) => { card.text += ` ${v}`; }; }
        if (label === 'When' && card === redirect) {
          const a = /After ([A-Z]\d+)’s/.exec(value);
          redirect.after = a ? a[1] : null;
          redirect.when = value;
        }
        continue;
      }

      // Route and proposal copy
      if (route && label === 'Internal route ID') {
        route.id = code(value);
        if (routes[route.id]) err(n, `Route ${route.id} appears twice`, 'route');
        routes[route.id] = route;
        routeOrder.push(route.id);
        continue;
      }
      if (route && block === 'proposal') {
        if (label === 'Title') route.title = value;
        else if (label === 'Pitch') route.pitch = value;
        else if (label === 'Accept label') route.acceptLabel = value;
        continue;
      }

      // Ending panels
      if (ending && (m = /^Panel (\d)$/.exec(label))) {
        ending.panels[Number(m[1]) - 1] = value;
        continue;
      }

      // Chapter fields
      if (chapter) {
        // "Risk obituary" or "Risk obituary (exposure ≥ 2)"
        switch (/^Risk obituary\b/.test(label) ? 'Risk obituary' : label) {
          case 'Era': chapter.era = value; break;
          case 'Prerequisite': {
            chapter.prerequisiteText = value;
            if (/^None\b/i.test(value)) chapter.prerequisite = null;
            else chapter.prerequisite = code(value.includes(':') ? value.split(':').pop() : value);
            break;
          }
          case 'Inventor': { const [name, role] = splitDash(value); chapter.inventor.name = name; chapter.inventor.role = role; break; }
          case 'Personal want': chapter.inventor.want = value; break;
          case 'Arrival': chapter.arrival = value; lastField.set = (v) => { chapter.arrival += ` ${v}`; }; break;
          case 'Single invention': {
            const inv = /^`([^`]+)`\s*—\s*\*\*(.+?)\*\*$/.exec(value);
            if (!inv) err(n, 'Single invention should read `id` — **Name**, with its description on the next line', chapter.id, 'invention');
            else { chapter.invention.id = inv[1]; chapter.invention.name = inv[2]; }
            expectInventionText = true;
            lastField.set = (v) => { chapter.invention.description = (chapter.invention.description ? `${chapter.invention.description} ` : '') + v; expectInventionText = false; };
            break;
          }
          case 'If card six was left': case 'If card three was left': chapter.legacy.left = value; break;
          case 'If card six was right': case 'If card three was right': chapter.legacy.right = value; break;
          case 'Obituary if card three was left': chapter.death.left = value; break;
          case 'Obituary if card three was right': chapter.death.right = value; break;
          case 'Natural obituary': chapter.death.natural = value; break;
          case 'Risk obituary': chapter.death.risk = /^Not reachable\b/i.test(value) ? null : value; break;
          case 'Final-life rule': chapter.final = true; break;
          default: break; // author notes and directions
        }
        continue;
      }
      continue;
    }

    // A plain line straight under a field continues it
    if (lastField?.set) { lastField.set(line.trim()); continue; }
    if (expectInventionText && chapter) { chapter.invention.description = line.trim(); expectInventionText = false; continue; }
  }

  // ---- Checks (spec 16: content integrity gates)

  const inventions = {};
  const cards = {};
  for (const id of chapterOrder) {
    const c = chapters[id];
    const n = c.line;
    const need = (value, field) => { if (!value) err(n, `${id} has no ${field}`, id, field); };
    need(c.era, 'Era'); need(c.arrival, 'Arrival'); need(c.inventor.name, 'Inventor name'); need(c.inventor.role, 'Inventor role');
    need(c.inventor.want, 'Personal want'); need(c.invention.id, 'invention id'); need(c.invention.name, 'invention name'); need(c.invention.description, 'invention description');
    // Six cards, or three for a short life
    const shape = c.cards.length === SHAPES.short.length ? 'short' : 'full';
    const kinds = SHAPES[shape];
    c.short = shape === 'short';
    c.proofIndex = kinds.indexOf('proof');
    c.lastIndex = kinds.length - 1;
    const last = c.short ? 'three' : 'six';
    need(c.legacy.left, `closing record for a left card ${last}`); need(c.legacy.right, `closing record for a right card ${last}`);
    if (c.short) {
      need(c.death.left, 'Obituary if card three was left'); need(c.death.right, 'Obituary if card three was right');
      if (c.route) err(n, `${id} is a short life, but short lives belong to the shared history`, id);
    } else if (!c.final) need(c.death.natural, 'Natural obituary');
    if (c.bench.length !== kinds.length) err(n, `${id} has ${c.bench.length} workbench states; it needs exactly ${kinds.length}`, id, 'workbench');
    if (!c.castOrder.length) err(n, `${id} has no cast`, id, 'cast');
    if (c.invention.id) {
      if (inventions[c.invention.id]) err(n, `Invention ${c.invention.id} belongs to both ${inventions[c.invention.id].chapter} and ${id}`, id, 'invention');
      inventions[c.invention.id] = { ...c.invention, chapter: id };
    }
    for (let k = 0; k < kinds.length; k++) {
      const cd = c.cards[k];
      if (!cd) { err(n, `${id} is missing card ${id}.${k + 1} (${kinds[k]})`, `${id}.${k + 1}`); continue; }
      if (cd.kind !== kinds[k]) err(cd.line, `Card ${cd.id} should be the ${kinds[k]} card, not "${cd.kind}"`, cd.id);
      if (cards[cd.id]) err(cd.line, `Card ${cd.id} appears twice`, cd.id);
      cards[cd.id] = cd;
      if (!cd.text) err(cd.line, `${cd.id} has no Situation`, cd.id, 'Situation');
      if (!cd.speaker) err(cd.line, `${cd.id} has no Speaker`, cd.id, 'Speaker');
      else if (!c.cast[cd.speaker]) err(cd.line, `${cd.id}'s speaker \`${cd.speaker}\` isn't in ${id}'s cast`, cd.id, 'Speaker');
      for (const side of ['left', 'right']) {
        const o = cd[side];
        if (!o) { err(cd.line, `${cd.id} has no ${side} answer`, cd.id, side); continue; }
        if (!o.label) err(o.line, `${cd.id}'s ${side} answer has no label`, cd.id, side);
        if (!o.result) err(o.line, `${cd.id}'s ${side} answer has no Result`, cd.id, side, 'Result');
        if (o.effects == null) err(o.line, `${cd.id}'s ${side} answer has no Effects`, cd.id, side, 'Effects');
      }
    }
  }

  // Prerequisites: the shared spine and each route run in order
  const shared = chapterOrder.filter((id) => !chapters[id].route);
  const prereqOK = (id, want) => {
    const c = chapters[id];
    if (want == null) { if (c.prerequisite) err(c.line, `${id} should have no prerequisite, not ${c.prerequisite}`, id, 'Prerequisite'); return; }
    if (c.prerequisite !== want) err(c.line, `${id} should require ${want}, not ${c.prerequisite || 'nothing'}`, id, 'Prerequisite');
  };
  shared.forEach((id, k) => prereqOK(id, k ? chapters[shared[k - 1]].invention.id : null));
  const lastShared = chapters[shared[shared.length - 1]];
  for (const rid of routeOrder) {
    const r = routes[rid];
    const n = r.line;
    if (!r.title || !r.pitch || !r.acceptLabel) err(n, `Route ${rid} needs a proposal Title, Pitch and Accept label`, rid, 'Proposal copy');
    if (r.chapters.length !== 4) err(n, `Route ${rid} has ${r.chapters.length} chapters; it needs 4`, rid);
    r.chapters.forEach((id, k) => prereqOK(id, k ? chapters[r.chapters[k - 1]].invention.id : lastShared?.invention.id));
    r.chapters.forEach((id, k) => {
      const isLast = k === r.chapters.length - 1;
      if (chapters[id].final !== isLast) err(chapters[id].line, isLast ? `${id} ends route ${rid}, so it needs a Final-life rule` : `${id} isn't the last chapter of ${rid}, so it can't have a Final-life rule`, id);
    });
    r.key = r.chapters[0]?.[0] || null;
    if (!AFFINITY_KEYS.includes(r.key)) err(n, `Route ${rid}'s chapters should start with one of ${AFFINITY_KEYS.join(', ')}`, rid);
    const e = r.ending;
    if (!e) { err(n, `Route ${rid} has no ending`, rid, 'Ending'); continue; }
    if (e.panels.filter(Boolean).length !== 5) err(e.line, `The ${rid} ending needs 5 panels, not ${e.panels.filter(Boolean).length}`, rid, 'Ending');
    if (!e.variants.left || !e.variants.right) err(e.line, `The ${rid} ending needs both final-choice variants`, rid, 'Ending');
    const lastId = r.chapters[r.chapters.length - 1];
    const lastCard = `${lastId}.${(chapters[lastId]?.lastIndex ?? 5) + 1}`;
    if (e.card && e.card !== lastCard) err(e.line, `The ${rid} ending's variants should follow ${lastCard}, not ${e.card}`, rid, 'Ending');
  }
  for (const c of chapterOrder.map((id) => chapters[id])) {
    if (c.route && !routes[c.route]) err(c.line, `${c.id} is in an unnamed route (add an Internal route ID)`, c.id);
  }

  // The redirect
  if (redirect) {
    const n = redirect.line;
    if (redirect.speaker !== ARCHIVE) err(n, `${redirect.id} should be spoken by The Archive (\`archive\`)`, redirect.id, 'Speaker');
    if (!redirect.text) err(n, `${redirect.id} has no Situation`, redirect.id, 'Situation');
    if (!redirect.after || !chapters[redirect.after]) err(n, `${redirect.id} should say which chapter it follows ("After X’s full result…")`, redirect.id, 'When');
    for (const side of ['left', 'right']) {
      const o = redirect[side];
      if (!o) { err(n, `${redirect.id} has no ${side} answer`, redirect.id, side); continue; }
      if (!o.result) err(o.line, `${redirect.id}'s ${side} answer has no Result`, redirect.id, side);
      if (!o.transition || !chapters[o.transition]) err(o.line, `${redirect.id}'s ${side} answer needs a Transition to a chapter`, redirect.id, side, 'Transition');
    }
  }
  for (const [id, o] of Object.entries(overrides)) {
    if (!chapters[id]) err(o.line, `The arrival override names ${id}, which isn't a chapter`, 'override');
  }

  // Callbacks
  const seen = new Set();
  for (const cb of callbacks) {
    const tag = `callback ${cb.n}`;
    if (seen.has(cb.n)) err(cb.line, `Callback ${cb.n} appears twice`, tag);
    seen.add(cb.n);
    if (!cards[cb.after]) err(cb.line, `Callback ${cb.n} comes after ${cb.after || '(nothing)'}, which isn't a card`, tag, 'After');
    if (!cards[cb.card]) err(cb.line, `Callback ${cb.n} depends on ${cb.card || '(nothing)'}, which isn't a card`, tag, 'Only if');
    if (!cb.text) err(cb.line, `Callback ${cb.n} has no Text`, tag, 'Text');
  }

  // Player-facing copy: no leftover template tokens
  const copy = [];
  for (const c of chapterOrder.map((id) => chapters[id])) {
    copy.push([c.line, c.id, c.arrival, c.inventor.want, c.invention.description, c.legacy.left, c.legacy.right, c.death.natural, c.death.risk]);
    for (const cd of c.cards.filter(Boolean)) copy.push([cd.line, cd.id, cd.text, cd.left?.label, cd.left?.result, cd.right?.label, cd.right?.result]);
  }
  for (const cb of callbacks) copy.push([cb.line, `callback ${cb.n}`, cb.text]);
  for (const r of Object.values(routes)) copy.push([r.line, r.id, r.title, r.pitch, r.acceptLabel, ...(r.ending?.panels || []), r.ending?.variants.left, r.ending?.variants.right]);
  for (const [n, where, ...texts] of copy) {
    for (const t of texts) if (t && /[{}]|TODO|TBD/.test(t)) err(n, `Leftover placeholder in player-facing copy: "${t.slice(0, 60)}"`, where);
  }

  // The opening image returns in the Simulation ending (spec 16)
  const opening = chapters[shared[0]]?.cards[0]?.text;
  const sim = routes.simulation?.ending;
  if (opening && sim && !sim.panels.includes(opening)) err(sim.line, 'The Simulation ending should repeat the opening situation word for word', 'simulation', 'Ending');

  // The most each interest can score across the shared lives (spec 4)
  const maxAffinity = Object.fromEntries(AFFINITY_KEYS.map((k) => [k, 0]));
  for (const id of shared) {
    for (const cd of chapters[id].cards.filter(Boolean)) {
      for (const k of AFFINITY_KEYS) maxAffinity[k] += Math.max(cd.left?.affinity[k] || 0, cd.right?.affinity[k] || 0);
    }
  }
  for (const k of AFFINITY_KEYS) if (!maxAffinity[k]) warn(0, `No shared card adds ${k} affinity, so its route can only be ranked last`, k);

  const campaign = {
    chapters, chapterOrder, shared, routes, routeOrder, redirect, overrides, callbacks, inventions, cards, maxAffinity,
    archive: { id: ARCHIVE, name: 'The Archive', description: 'A spare framing voice connecting independent lives; never claims to know the player’s unchosen future.' },
    hash: hashText(text),
  };
  return { campaign, errors, warnings };
}

function hashText(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  return h.toString(16).padStart(8, '0');
}
