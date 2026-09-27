// The script as the game reads it, arranged for review: every life in play
// order with its cards, both results, exact effects, the callbacks each card
// can show and sets up, its closing records, and each route's proposal and
// ending. tools/script.html shows it (with a filter for the shared history
// and each route) and `node tools/script.mjs` writes it as Markdown. It all
// comes from the same parsed content/script.md the game plays, so the two
// can never disagree.

const ROUTE_NAMES = { simulation: 'Simulation', departure: 'Departure', retirement: 'Great Retirement', reply: 'First Reply', unmaking: 'Unmaking' };

export function scriptText(content) {
  const C = content.campaign;

  const effectWords = (o) => {
    const bits = [];
    if (o.danger) bits.push(`experimental exposure ${o.danger > 0 ? '+' : ''}${o.danger} (hidden)`);
    for (const [k, v] of Object.entries(o.affinity || {})) bits.push(`${k} interest ${v > 0 ? '+' : ''}${v}`);
    return bits.length ? bits.join('; ') : 'no effects';
  };
  const callbacksAfter = (cardId) => C.callbacks.filter((cb) => cb.after === cardId);
  const callbacksFrom = (cardId) => C.callbacks.filter((cb) => cb.card === cardId);

  // Which chapters a filter shows: 'all', 'shared' or a route id
  function chaptersFor(filter) {
    if (filter === 'shared') return [...C.shared];
    if (C.routes[filter]) return [...C.routes[filter].chapters];
    return [...C.chapterOrder];
  }
  const filters = () => [['all', 'Everything'], ['shared', 'Shared history'], ...C.routeOrder.map((r) => [r, ROUTE_NAMES[r] || C.routes[r].title])];

  // ---- Markdown

  function chapterMD(id) {
    const c = C.chapters[id];
    const out = [`## ${c.id} — ${c.title}`, ''];
    const route = c.route ? C.routes[c.route] : null;
    if (route && route.chapters[0] === id) {
      out.push(`**Proposal:** ${route.title}. ${route.pitch} (Accept: "${route.acceptLabel}")`, '');
    }
    out.push(`**${c.inventor.name}** — ${c.inventor.role} · ${c.era}`, '', `> ${c.arrival}`, '', `You want: ${c.inventor.want}`, '');
    const o = C.overrides[id];
    if (o) out.push(`_After ${o.when.card} = ${o.when.side}, the arrival instead reads:_ ${o.arrival} _(era: ${o.era})_`, '');
    out.push(`**Invention (card ${c.proofIndex + 1}):** ${c.invention.name}. ${c.invention.description}`, '');
    if (c.short) out.push('_A short Stone Age life: three cards, and the danger card ends it._', '');
    for (const card of c.cards) {
      const who = c.cast[card.speaker];
      out.push(`### ${card.id} — ${card.kind[0].toUpperCase()}${card.kind.slice(1)}`, '', `**${who?.name || card.speaker}:** ${card.text}`, '');
      for (const side of ['left', 'right']) {
        const opt = card[side];
        out.push(`- **${side === 'left' ? 'Left' : 'Right'}: ${opt.label}** ${opt.result} _(${effectWords(opt)})_`);
      }
      for (const cb of callbacksAfter(card.id)) out.push(`- _Callback, if ${cb.card} was ${cb.side}:_ ${cb.text}`);
      for (const cb of callbacksFrom(card.id)) out.push(`- _Sets up a callback after ${cb.after} if ${cb.side}._`);
      out.push('');
    }
    const lastWord = c.short ? 'three' : 'six';
    out.push(`**Legacy, card ${lastWord} left:** ${c.legacy.left}`, '', `**Legacy, card ${lastWord} right:** ${c.legacy.right}`, '');
    if (c.final) out.push('_Final life of the route: no obituary; the ending follows._', '');
    else if (c.short) out.push(`**Obituary, card three left:** ${c.death.left}`, '', `**Obituary, card three right:** ${c.death.right}`, '');
    else {
      out.push(`**Obituary:** ${c.death.natural}`, '');
      if (c.death.risk) out.push(`**Obituary with experimental exposure 2 or more:** ${c.death.risk}`, '');
    }
    if (C.redirect?.after === id) {
      const r = C.redirect;
      out.push(`### ${r.id} — ${r.title}`, '', `**The Archive:** ${r.text}`, '');
      for (const side of ['left', 'right']) out.push(`- **${side === 'left' ? 'Left' : 'Right'}: ${r[side].label}** ${r[side].result} _(goes to ${r[side].transition})_`);
      out.push('');
    }
    if (route && c.final) {
      out.push(`### Ending — ${route.ending.title}`, '');
      route.ending.panels.forEach((p, i) => out.push(`${i + 1}. ${p}`));
      out.push('', `- _If ${route.ending.card} was left:_ ${route.ending.variants.left}`, `- _If ${route.ending.card} was right:_ ${route.ending.variants.right}`, '');
    }
    return out.join('\n');
  }

  function markdown(filter = 'all') {
    const name = filters().find((f) => f[0] === filter)?.[1] || 'Everything';
    return [
      `# One Bright Idea: the script (${name})`, '',
      `Read from content/script.md (script ${C.hash}). Interests: S modelling, D exploration, R shared provision, A communication, U inner relief. Experimental exposure is hidden in the game and picks the obituary; it's shown here for the writers.`, '',
      chaptersFor(filter).map(chapterMD).join('\n\n'), '',
    ].join('\n');
  }

  return { filters, chaptersFor, effectWords, callbacksAfter, callbacksFrom, markdown, ROUTE_NAMES };
}
