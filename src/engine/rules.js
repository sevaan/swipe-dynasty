// Conditions and effects: the plain data parsed from content cells (see
// src/content/syntax.js), evaluated against the three scopes of state.
// Nothing here touches the page.

// Which scope a flag lives in: life, timeline, or forever (the collection).
export function flagScope(content, flag) {
  return content.flags[flag]?.scope || 'life';
}

function flagStore(state, content, flag) {
  const scope = flagScope(content, flag);
  if (scope === 'forever') return state.collection.flags;
  if (scope === 'timeline') return state.timeline.flags;
  return state.life ? state.life.flags : {};
}

export function getFlag(state, content, flag) {
  const store = flagStore(state, content, flag);
  return store[flag] ?? content.flags[flag]?.def ?? 0;
}

function compare(a, op, b) {
  switch (op) {
    case '<': return a < b;
    case '<=': return a <= b;
    case '>': return a > b;
    case '>=': return a >= b;
    case '!=': return a !== b;
    default: return a === b;
  }
}

// Is this recipe (a list of alternatives, each a list of observations)
// satisfied by what this life has established?
export function recipeMet(recipe, observed) {
  return recipe.some((alt) => alt.every((o) => observed.includes(o)));
}

// An invention this life's project could commit right now: its recipe is met,
// every prerequisite exists in this timeline, and it isn't already history.
export function viable(state, content, invId) {
  const inv = content.inventions[invId];
  if (!inv || !state.life) return false;
  if (!inv.requires.every((r) => state.timeline.techs.includes(r))) return false;
  if (state.timeline.techs.includes(invId)) return false;
  return recipeMet(inv.recipe, state.life.observed);
}

function atomHolds(a, state, content) {
  const { life, timeline } = state;
  let v;
  switch (a.t) {
    case 'has': v = timeline.techs.includes(a.id); break;
    case 'observed': v = !!life?.observed.includes(a.id); break;
    case 'made': v = a.id ? life?.made?.inv === a.id : !!life?.made; break;
    case 'failed': v = a.id ? life?.failed === a.id : !!life?.failed; break;
    case 'problem': v = timeline.problem?.legacy === a.id; break;
    case 'legacy': v = life?.legacy === a.id; break;
    case 'history': v = Object.values(timeline.legacies).includes(a.id); break;
    case 'previous': v = timeline.previous?.id === a.id; break;
    case 'look': v = life?.look === a.id; break;
    case 'mark': v = !!life?.marks.includes(a.id); break;
    case 'seen': v = !!life?.seen.includes(a.id); break;
    case 'era': v = (life?.era || timeline.era) === a.id; break;
    case 'project': v = life?.project === a.id; break;
    case 'danger': v = compare(life?.danger ?? 0, a.op, a.n); break;
    case 'lives': v = compare(timeline.lives, a.op, a.n); break;
    case 'life': v = compare(life?.n ?? 0, a.op, a.n); break;
    case 'decisions': v = compare(life?.decisions ?? 0, a.op, a.n); break;
    case 'step': v = compare(life ? (life.phase === 'aftermath' ? life.after : life.phase === 'proof' ? 0 : life.invest) : 0, a.op, a.n); break;
    case 'flag': v = compare(getFlag(state, content, a.flag), a.op, a.n); break;
    default: v = false;
  }
  return a.neg ? !v : v;
}

export function conditionsHold(cond, state, content) {
  if (!cond) return true;
  return cond.all.every((clause) => clause.any.some((a) => atomHolds(a, state, content)));
}

// Applies an option's effects in the order the spec needs (§16.6): state
// changes first, then any proof commitment, then the legacy choice, which
// must belong to what was committed. Returns what the caller resolves next.
export function applyEffects(ops, state, content, events) {
  const { life } = state;
  const out = { commit: null, fail: null, death: null, ending: null, legacy: null };
  const max = content.tuning.dangerMax;
  for (const op of ops) {
    if (op.when && !conditionsHold(op.when, state, content)) continue;
    switch (op.t) {
      case 'danger': {
        const before = life.danger;
        life.danger = Math.max(0, op.op === '=' ? op.n : life.danger + op.n);
        if (life.danger !== before) events.push({ type: 'danger', from: before, to: life.danger, max });
        break;
      }
      case 'observe':
        if (!life.observed.includes(op.id)) {
          life.observed.push(op.id);
          events.push({ type: 'observe', id: op.id });
        }
        break;
      case 'look':
        if (life.look !== op.id) { events.push({ type: 'look', from: life.look, to: op.id }); life.look = op.id; }
        break;
      case 'mark':
        if (!life.marks.includes(op.id)) life.marks.push(op.id);
        life.markAge[op.id] = 0;
        break;
      case 'unmark':
        life.marks = life.marks.filter((m) => m !== op.id);
        break;
      case 'flag': {
        const store = flagStore(state, content, op.flag);
        const cur = getFlag(state, content, op.flag);
        store[op.flag] = op.op === '=' ? op.n : cur + op.n;
        break;
      }
      case 'next':
        life.queue.push(op.id);
        break;
      case 'commit': out.commit = op.id; break;
      case 'fail': out.fail = op.id; break;
      case 'legacy': out.legacy = op.id; break;
      case 'death': out.death = op.id; break;
      case 'ending': out.ending = op.id; break;
      default: break; // "because" is shown in the interface and changes nothing
    }
  }
  return out;
}
