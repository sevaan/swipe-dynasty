// Evaluates parsed conditions and applies parsed effects. Content never runs
// code; it only produces the small, typed operations handled here.

export function flagScope(content, flag) {
  return content.flags[flag]?.scope || 'life';
}

function flagBag(state, content, flag) {
  const scope = flagScope(content, flag);
  if (scope === 'timeline') return state.timeline.flags;
  if (scope === 'forever') return state.collection.flags;
  return state.life.flags;
}

export function getFlag(state, content, flag) {
  const bag = flagBag(state, content, flag);
  return flag in bag ? bag[flag] : content.flags[flag]?.default || 0;
}

function compare(a, op, b) {
  switch (op) {
    case '<': return a < b;
    case '<=': return a <= b;
    case '>': return a > b;
    case '>=': return a >= b;
    case '=': return a === b;
    case '!=': return a !== b;
    default: return false;
  }
}

function atomHolds(atom, state, content) {
  let ok;
  switch (atom.t) {
    case 'meter': ok = compare(state.life.meters[atom.role], atom.op, atom.n); break;
    case 'flag': ok = compare(getFlag(state, content, atom.flag), atom.op, atom.n); break;
    case 'has': ok = state.timeline.history.includes(atom.inv); break;
    case 'made': ok = !!state.life.made && (atom.inv == null || state.life.made.inv === atom.inv); break;
    case 'cards': ok = compare(state.life.cards, atom.op, atom.n); break;
    case 'life': ok = compare(state.life.eraLife, atom.op, atom.n); break;
    default: ok = false;
  }
  return atom.neg ? !ok : ok;
}

export function conditionsHold(cond, state, content) {
  return cond.all.every((clause) => clause.any.some((atom) => atomHolds(atom, state, content)));
}

// Applies one answer's effects. Returns what the caller must resolve next:
// a forced next card, a scripted death, and whether an `invent` effect fired.
export function applyEffects(ops, state, content, events) {
  const out = { next: null, die: null, invent: null };
  for (const op of ops) {
    switch (op.t) {
      case 'meter': {
        const from = state.life.meters[op.role];
        const to = op.op === '=' ? op.n : from + op.n;
        state.life.meters[op.role] = to;
        if (to !== from) events.push({ type: 'meter', role: op.role, from, to });
        break;
      }
      case 'points':
        if (!state.life.made) state.life.points[op.inv] = (state.life.points[op.inv] || 0) + op.n;
        break;
      case 'flag': {
        const bag = flagBag(state, content, op.flag);
        const cur = op.flag in bag ? bag[op.flag] : content.flags[op.flag]?.default || 0;
        bag[op.flag] = op.op === '=' ? op.n : cur + op.n;
        break;
      }
      case 'invent': out.invent = op.inv; break;
      case 'next': out.next = op.card; break;
      case 'die': out.die = op.death; break;
      case 'use': state.life.uses.push(op.inv); break;
      default: break;
    }
  }
  return out;
}
