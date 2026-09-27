// The whole game as a script, in play order, from the compiled content: the
// words tools/script.html shows and the Markdown it downloads (also written
// by `node tools/script.mjs`). No page code here, so the browser and Node
// share it, and the page and the file can never disagree.

export function scriptText(C) {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nice = (id) => String(id ?? '').replace(/-/g, ' ');
  const invName = (id) => C.inventions[id]?.name || nice(id);
  const obsText = (id) => C.observations[id]?.text || nice(id);
  const legacyText = (id) => C.legacies[id]?.adoption || nice(id);
  const failName = (id) => C.failures[id]?.name || nice(id);
  const PHASES = ['opening', 'callback', 'investigation', 'proof', 'aftermath'];
  const PHASE_NAME = { opening: 'Opening', callback: 'Callbacks', investigation: 'Investigation', proof: 'Proof', aftermath: 'Aftermath' };
  const PHASE_HOW = {
    opening: 'The life starts here. Which opening comes up depends on what the last inventor left behind.',
    callback: 'One of these comes up by the third decision at the latest, and only if the thing it calls back to actually happened.',
    investigation: 'The game draws these, preferring one that can find out something still missing. An answer can lead straight to a follow-up.',
    proof: 'One decision. Inventing is only on offer once the evidence is there; otherwise both answers leave a failed design.',
    aftermath: 'Three decisions after inventing something, in order. The last pick of how it spreads is the one that counts.',
  };

  // Two renderers share the words: `fmt.link(id)` makes a link to a scene
  // and `fmt.token(text)` marks a name the game fills in.
  const HTMLF = { link: (id) => `<a href="#${esc(id)}">${esc(id)}</a>`, token: (t) => `<span class="token">${esc(t)}</span>`, b: (t) => `<b>${esc(t)}</b>`, e: esc };
  const MDF = { link: (id) => `[${id}](#${id})`, token: (t) => `[${t}]`, b: (t) => `**${t}**`, e: (t) => String(t ?? '') };

  function fill(text, f) {
    return f.e(text).replace(/\{(name|previous|maker)(?::([a-z0-9-]+))?\}/g, (_, key, id) => {
      if (key === 'name') return f.token('this inventor');
      if (key === 'previous') return f.token('the last inventor');
      return f.token(id ? `whoever made ${invName(id)}` : 'whoever made it');
    });
  }

  function stepWords(a, phase) {
    const name = phase === 'aftermath' ? 'aftermath decision' : phase === 'investigation' || phase === 'callback' || phase === 'opening' ? 'investigation decision' : 'decision';
    if (a.op === '=') return `${name} ${a.n + 1}`;
    if (a.op === '<') return `${name}s 1 to ${a.n}`;
    if (a.op === '<=') return `${name}s 1 to ${a.n + 1}`;
    if (a.op === '>=') return `${name} ${a.n + 1} or later`;
    if (a.op === '>') return `${name} ${a.n + 2} or later`;
    return `step ${a.op} ${a.n}`;
  }

  function atomWords(a, f, phase) {
    const n = a.neg;
    switch (a.t) {
      case 'has': return n ? `nobody has invented ${invName(a.id)} yet` : `${invName(a.id)} exist${/s$/.test(invName(a.id)) ? '' : 's'}`;
      case 'observed': return `${n ? "hasn't found out" : 'found out'} "${obsText(a.id)}"`;
      case 'made': return a.id ? `${n ? "didn't invent" : 'invented'} ${invName(a.id)}` : (n ? 'invented nothing' : 'invented something');
      case 'failed': return a.id ? `${n ? "didn't leave" : 'left'} ${failName(a.id)}` : (n ? 'no failed design' : 'left a failed design');
      case 'problem': return `${n ? 'the last invention didn\'t spread as' : 'the last invention spread as'} "${legacyText(a.id)}"`;
      case 'legacy': return `${n ? 'this invention isn\'t spreading as' : 'this invention is spreading as'} "${legacyText(a.id)}"`;
      case 'history': return `${n ? 'nothing earlier spread as' : 'something earlier spread as'} "${legacyText(a.id)}"`;
      case 'previous': return `${n ? "the last life didn't leave" : 'the last life left'} ${C.failures[a.id] ? failName(a.id) : invName(a.id)}`;
      case 'look': return `the object ${n ? "isn't" : 'is'} the ${nice(a.id)}`;
      case 'mark': return `the object ${n ? "doesn't show" : 'shows'} ${nice(a.id)}`;
      case 'seen': return `${n ? 'before' : 'after'} ${f.link(a.id)}`;
      case 'era': return `${n ? 'not in' : 'in'} ${C.eras[a.id]?.name || nice(a.id)}`;
      case 'project': return `${n ? 'not during' : 'during'} ${C.projects[a.id]?.name || nice(a.id)}`;
      case 'step': return (n ? 'not ' : '') + stepWords(a, phase);
      case 'danger': return `${n ? 'not ' : ''}Danger ${a.op} ${a.n}`;
      case 'lives': return `${n ? 'not ' : ''}${a.n} lives ${a.op === '>=' ? 'or more ' : ''}so far (${a.op} ${a.n})`;
      case 'life': return `${n ? 'not ' : ''}life ${a.op} ${a.n}`;
      case 'decisions': return `${n ? 'not ' : ''}decisions so far ${a.op} ${a.n}`;
      case 'flag':
        if (a.op === '>' && a.n === 0) return `${f.b(`"${nice(a.flag)}"`)} ${n ? "isn't" : 'is'} marked`;
        return `${n ? 'not ' : ''}${nice(a.flag)} ${a.op} ${a.n}`;
      default: return a.t;
    }
  }

  function condWords(cond, f, phase) {
    const parts = (cond?.all || []).map((c) => c.any.map((a) => atomWords(a, f, phase)).join(' or '));
    if (cond?.once) parts.push('once per timeline');
    return parts.join('; ');
  }

  function recipeWords(inv) {
    return inv.recipe.map((alt) => alt.map((o) => `"${obsText(o)}"`).join(' + ')).join(', or ');
  }

  function opWords(op, f, phase) {
    let w;
    switch (op.t) {
      case 'observe': w = `Finds out ${f.b(`"${obsText(op.id)}"`)}`; break;
      case 'look': w = `The object becomes the ${nice(op.id)}`; break;
      case 'mark': w = `Adds ${nice(op.id)}${C.transient.includes(op.id) ? ' (for one scene)' : ''}`; break;
      case 'unmark': w = `Clears ${nice(op.id)}`; break;
      case 'commit': w = `${f.b(`Invents ${invName(op.id)}`)}, if the evidence is there (needs ${recipeWords(C.inventions[op.id])})`; break;
      case 'fail': w = `${f.b(`Leaves a failed design: ${failName(op.id)}`)}`; break;
      case 'legacy': w = `It spreads as ${f.b(`"${legacyText(op.id)}"`)}`; break;
      case 'because': w = `Shows "Possible because of ${C.inventions[op.id]?.capability || invName(op.id)}"`; break;
      case 'next': w = `Leads to ${f.link(op.id)}`; break;
      case 'death': w = `If this kills: "${f.e(C.deaths[op.id]?.text || op.id)}"`; break;
      case 'danger': w = `Danger ${op.op === '=' ? `set to ${op.n}` : `${op.n > 0 ? '+' : ''}${op.n}`} (hidden)`; break;
      case 'flag':
        if (op.op === '=' && op.n === 1) w = `Marks ${f.b(`"${nice(op.flag)}"`)}`;
        else if (op.op === '=' && op.n === 0) w = `Unmarks ${f.b(`"${nice(op.flag)}"`)}`;
        else w = `${nice(op.flag)} ${op.op === '=' ? '=' : op.n > 0 ? '+' : ''}${op.n}`;
        break;
      case 'ending': w = `Ends the timeline: ${nice(op.id)}`; break;
      default: w = op.t;
    }
    if (op.when) w += ` (if ${condWords(op.when, f, phase)})`;
    return w;
  }

  function showsWords(scene) {
    const bits = [];
    // Overlays without a new look sit on whatever the object is: the start look, for an opening
    if (scene.shows?.length && !scene.shows.some((op) => op.t === 'look')) {
      bits.push(scene.phase === 'opening' && C.projects[scene.project] ? `the ${nice(C.projects[scene.project].look)}` : 'the object');
    }
    for (const op of scene.shows || []) {
      const cond = op.when ? ` if ${condWords(op.when, MDF, scene.phase)}` : '';
      if (op.t === 'look') bits.push(`the ${nice(op.id)}${cond}`);
      if (op.t === 'mark') bits.push(`with ${nice(op.id)}${cond}`);
      if (op.t === 'unmark') bits.push(`without ${nice(op.id)}${cond}`);
    }
    return bits.join(', ');
  }

  // Which answers lead to each scene, for the "comes after" line
  const from = {};
  for (const id of C.sceneOrder) {
    const sides = {};
    for (const side of ['left', 'right']) {
      for (const op of C.scenes[id].options[side].ops) if (op.t === 'next') (sides[op.id] ||= []).push(side);
    }
    for (const [to, list] of Object.entries(sides)) (from[to] ||= []).push({ id, side: list.length === 2 ? 'either answer' : list[0] });
  }

  const scenesOf = (project) => PHASES.map((phase) => ({ phase, list: C.sceneOrder.map((id) => C.scenes[id]).filter((s) => s.project === project && s.phase === phase) })).filter((g) => g.list.length);

  // A project whose every scene hands on to the next one plays as a fixed script
  function scriptedPath(project) {
    const scenes = C.sceneOrder.map((id) => C.scenes[id]).filter((s) => s.project === project);
    const opening = scenes.find((s) => s.phase === 'opening');
    if (!opening) return null;
    const path = [];
    let s = opening;
    const seen = new Set();
    while (s && !seen.has(s.id)) {
      seen.add(s.id);
      path.push(s.id);
      const nexts = ['left', 'right'].map((side) => s.options[side].ops.find((o) => o.t === 'next')?.id);
      if (nexts[0] && nexts[0] === nexts[1]) { s = C.scenes[nexts[0]]; continue; }
      if (!nexts[0] && !nexts[1]) {
        // Hand over to the next phase's first scene, if that phase has exactly one real choice
        const i = PHASES.indexOf(s.phase === 'opening' ? 'investigation' : s.phase);
        // (skipping a proof whose answers both fail: it's the fallback for a life that didn't get there)
        const fallback = (x) => x.phase === 'proof' && ['left', 'right'].every((side) => x.options[side].ops.some((o) => o.t === 'fail'));
        const after = scenes.filter((x) => PHASES.indexOf(x.phase) > i && !seen.has(x.id) && !fallback(x));
        s = after[0];
        continue;
      }
      return null;
    }
    return path.length > 2 ? path : null;
  }

  function projectLength(p) {
    const inv = p.investigation.min === p.investigation.max ? `${p.investigation.min}` : `${p.investigation.min} to ${p.investigation.max}`;
    return `${inv} investigation decisions, one proof, then ${C.tuning.aftermath} aftermath decisions if it worked`;
  }

  // ---- Markdown, for "Download as Markdown"

  function sceneMD(s) {
    const f = MDF;
    const who = C.characters[s.speaker]?.name || 'No one speaks';
    const when = condWords(s.cond, f, s.phase);
    const back = (from[s.id] || []).map((x) => `${f.link(x.id)} (${x.side})`).join(', ');
    const shows = showsWords(s);
    // A backslash at the end of a line is a Markdown line break
    const meta = [`**${who}**`, when && `Comes up when: ${when}`, back && `Comes after: ${back}`, shows && `On the bench: ${shows}`, s.weather && `Weather: ${nice(s.weather)}`].filter(Boolean);
    const lines = [`#### ${s.id}`, '', meta.join('\\\n'), '', `> ${fill(s.text, f)}`, ''];
    for (const side of ['left', 'right']) {
      const o = s.options[side];
      lines.push(`- **Swipe ${side}: ${fill(o.label, f)}**${o.preview ? ` (${fill(o.preview, f)})` : ''}`);
      if (o.result) lines.push(`  - Then: ${fill(o.result, f)}`);
      for (const op of o.ops) lines.push(`  - ${opWords(op, f, s.phase)}`);
    }
    if (s.notes) lines.push('', `_Writers' note: ${s.notes}_`);
    return lines.join('\n');
  }

  function projectMD(p) {
    const f = MDF;
    const path = scriptedPath(p.id);
    const out = [`## ${p.name}`, '', `The problem: ${fill(p.problem, f)}. ${projectLength(p)}.${p.requires.length ? ` Only after ${p.requires.map(invName).join(' and ')} exist.` : ''}`];
    if (path) out.push('', `This life is scripted: ${path.map((id) => f.link(id)).join(' → ')}`);
    for (const g of scenesOf(p.id)) {
      out.push('', `### ${PHASE_NAME[g.phase]}`, '');
      if (!path) out.push(PHASE_HOW[g.phase], '');
      out.push(g.list.map(sceneMD).join('\n\n'));
    }
    out.push('', '### How it can end', '');
    for (const id of p.outcomes) {
      const inv = C.inventions[id];
      if (!inv) continue;
      out.push(`**Inventing ${inv.name}.** Needs ${recipeWords(inv)}${inv.requires.length ? `; ${inv.requires.map(invName).join(', ')} must already exist` : ''}.`, '');
      for (const lid of inv.legacies) {
        const l = C.legacies[lid];
        out.push(`- If it spreads as "${l.adoption}": ${fill(inv.made || `Invented ${inv.name}.`, f)} [how you died] ${fill(l.epitaph, f)}`, `  - Next inventor inherits: ${fill(l.inherit, f)}`);
      }
      out.push('');
    }
    for (const fid of p.failures) {
      const fl = C.failures[fid];
      if (!fl) continue;
      const when = condWords(fl.cond, f, 'proof');
      out.push(`**Failed design: ${fl.name}** (${when ? `when ${when}` : 'when nothing more specific fits'}). Invented ${fl.name}. [how you died] ${fill(fl.epitaph, f)}`, `- Next inventor inherits: ${fill(fl.inherit, f)}`, '');
    }
    for (const kind of ['danger', 'natural']) {
      const list = C.deathOrder.map((id) => C.deaths[id]).filter((d) => (d.project === p.id || !d.project) && d.kind === kind);
      if (!list.length) continue;
      out.push(`**${kind === 'danger' ? 'Deaths when Danger reaches 6' : 'Deaths of old age'}**`);
      for (const d of list) {
        const when = condWords(d.cond, f, 'aftermath');
        out.push(`- "${fill(d.text, f)}" (${d.id}${d.weight <= 0 ? ', only when an answer names it' : when ? `, when ${when}` : ''})`);
      }
      out.push('');
    }
    return out.join('\n');
  }

  function markdown() {
    const era = C.eras[C.eraOrder[0]];
    const projects = C.projectOrder.map((id) => C.projects[id]);
    return [
      '# One Bright Idea: the script', '',
      `Everything written so far, in play order (content ${C.hash}). Names the game fills in are in [brackets]. Danger is hidden in the game; it's shown here for the writers.`, '',
      `${era.name}: ${era.intro || ''}`, '',
      projects.map(projectMD).join('\n\n'), '',
    ].join('\n');
  }

  return {
    esc, nice, invName, recipeWords, fill, condWords, opWords, showsWords, from, scenesOf, scriptedPath, projectLength,
    PHASE_NAME, PHASE_HOW, HTMLF, markdown,
  };
}
