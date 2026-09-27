// The words and pictures on every card: a life's character card, its six
// decisions and their results, the reveal and the epitaph; the Archive's
// proposals and the redirect; the ending's panels, the credits, the framing
// and the title. Only HTML: table.js does the moving. Every word comes from
// content/script.md or content/ui.json; the pictures from content/art, as
// content/world.json maps them.
import { artURL } from './art.js';
import { arrow, book, spark, swipeIcon } from './marks.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hashOf = (s) => { let h = 2166136261; for (const ch of String(s)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h; };

// Overlays that only make sense in the moment, not on a museum plinth
const FLEETING = ['smoke', 'flames', 'steam', 'glint'];

export function createFaces({ content, getState }) {
  const C = content.campaign;
  const U = content.ui;
  const world = content.world;
  const ageOf = (chapterId) => world.ages[content.ageOf[chapterId]];

  // ---- People: a drawn portrait where there is one (world.json
  // "portraits"), otherwise a silhouette in a colour of its own

  const TONES = ['#7d5a46', '#5f7556', '#566a86', '#86693d', '#735673', '#4f8079', '#8f6356', '#63668a', '#7a7250', '#5a7d8f'];
  const toneOf = (key) => TONES[hashOf(key) % TONES.length];

  function silhouette(key) {
    const h = hashOf(key);
    const variant = (h >> 4) % 3; // three head-and-shoulder shapes, so people differ at a glance
    const hair = ['<path d="M11 12c1-5 4-8 9-8s8 3 9 8c-2-2-5-3-9-3s-7 1-9 3z"/>', '<path d="M10 14c0-6 4-10 10-10s10 4 10 10l-2 2c0-5-3-8-8-8s-8 3-8 8z"/>', '<circle cx="20" cy="6" r="4"/>'][variant];
    return `<svg class="silhouette" viewBox="0 0 40 40" preserveAspectRatio="xMidYMax meet" aria-hidden="true" style="background:${toneOf(key)}"><g fill="rgb(0 0 0 / 34%)"><circle cx="20" cy="16" r="8"/>${hair}<path d="M5 40c1-9 7-14 15-14s14 5 15 14z"/></g></svg>`;
  }

  const drawn = (key) => world.portraits?.[key] || null;
  const portraitImg = (key) => `<img class="art" src="${esc(artURL('characters', drawn(key)))}" alt="" draggable="false" data-key="${esc(key)}">`;
  const personArt = (key) => (drawn(key) ? portraitImg(key) : silhouette(key));

  // The small round face beside a speaker's name
  function faceCrop(person) {
    if (!person) return '';
    if (person.id === C.archive.id) return `<span class="face-crop archive" aria-hidden="true">${book}</span>`;
    return `<span class="face-crop${drawn(person.key) ? '' : ' plain'}" aria-hidden="true">${personArt(person.key)}</span>`;
  }

  const speakerFor = (chapter, id) => {
    if (id === C.archive.id) return { id, name: C.archive.name, key: id };
    const c = chapter?.cast[id];
    return c ? { ...c, key: `${chapter.id}:${c.id}` } : null;
  };

  // The inventor's own cast entry, if they have one; otherwise a key of their own
  function inventorKey(chapterId) {
    const c = C.chapters[chapterId];
    const name = c.inventor.name.toLowerCase();
    const first = name.split(' ')[0];
    const id = c.castOrder.find((k) => [name, first].includes(c.cast[k].name.toLowerCase()));
    return `${chapterId}:${id || 'inventor'}`;
  }

  const who = (person) => (person ? `<div class="who">${faceCrop(person)}<span class="name">${esc(person.name)}</span><span class="rule" aria-hidden="true"></span></div>` : '');

  // ---- The workbench: the era's bench, and the state's drawing if there
  // is one; otherwise the state's description as a label

  function lookFor(chapterId, index, phase) {
    const st = world.art?.[chapterId]?.[index];
    if (!st) return null;
    let look = phase === 'before' ? st : st[phase] ?? st;
    if (typeof look === 'string') look = { object: look };
    let object = look.object;
    if (object && typeof object === 'object') object = object[getState()?.choices?.[object.from]] || object.left;
    return object ? { object, marks: look.marks || [] } : null;
  }

  const layer = (url, i, extra = '') => `<img class="art" src="${esc(url)}" alt="" draggable="false" data-depth="${i}"${extra}>`;

  function picture(chapterId, index, phase, cls = '') {
    const look = lookFor(chapterId, index, phase);
    const label = C.chapters[chapterId].bench[index] || '';
    const layers = [layer(artURL('benches', ageOf(chapterId).bench), 0)];
    if (look) {
      layers.push(layer(artURL('objects', look.object), 1, ` data-label="${esc(label)}"`));
      look.marks.forEach((m, i) => layers.push(layer(artURL('overlays', m), i + 2)));
    }
    return `<div class="pic ${cls}" aria-hidden="true">${layers.join('')}${look ? '' : `<div class="label-card">${esc(label)}</div>`}</div>`;
  }

  // The exhibit: the plinth, with the object as it ended up after card four
  function exhibit(chapterId) {
    const side = getState()?.choices?.[`${chapterId}.4`] || 'left';
    const look = lookFor(chapterId, 3, side);
    const label = C.chapters[chapterId].bench[3] || '';
    const layers = [layer(artURL('benches', 'exhibit'), 0)];
    if (look) {
      layers.push(layer(artURL('objects', look.object), 1, ` data-label="${esc(label)}"`));
      look.marks.filter((m) => !FLEETING.includes(m)).forEach((m, i) => layers.push(layer(artURL('overlays', m), i + 2)));
    }
    return `<div class="pic flex" aria-hidden="true">${layers.join('')}${look ? '' : `<div class="label-card">${esc(label)}</div>`}</div>`;
  }

  // ---- Answers

  // An answer's words with its arrow held to the first (left) or last (right) word
  function labelHTML(words, side) {
    const w = String(words).split(' ');
    if (side === 'left') {
      const [first, ...more] = w;
      return `<span class="hold">${arrow('left')}${esc(first)}</span> ${esc(more.join(' '))}`;
    }
    const last = w.pop();
    return `${esc(w.join(' '))} <span class="hold">${esc(last)}${arrow('right')}</span>`;
  }

  const tabs = (left, right) => `<div class="tabs">
      <button class="tab left" type="button" data-act="left" aria-label="${esc(left)}"><span class="fill" aria-hidden="true"></span><span class="label">${labelHTML(left, 'left')}</span></button>
      <button class="tab right" type="button" data-act="right" aria-label="${esc(right)}"><span class="fill" aria-hidden="true"></span><span class="label">${labelHTML(right, 'right')}</span></button>
    </div>`;

  // One action across the foot
  const stub = (cls, label, act = 'next') => `<div class="tabs one"><button class="tab wide ${cls}" type="button" data-act="${esc(act)}"><span class="label">${esc(label)}</span>${arrow('right')}</button></div>`;

  // Two actions that aren't a decision (the credits)
  const pair = ([l, la], [r, ra]) => `<div class="tabs acts">
      <button class="tab left" type="button" data-act="${esc(la)}"><span class="label">${esc(l)}</span></button>
      <button class="tab right go" type="button" data-act="${esc(ra)}"><span class="label">${esc(r)}</span>${arrow('right')}</button>
    </div>`;

  const stamp = '<div class="stamp" aria-hidden="true"><span class="stamp-in"></span></div>';
  const spare = `<div class="spare" aria-hidden="true"><div class="field"></div><div class="emblem">${spark('var(--accent)', 'var(--kraft)')}</div></div>`;
  const emblem = (cls = '') => `<div class="emblem-top ${cls}" aria-hidden="true">${spark('var(--accent)', 'var(--paper)')}</div>`;

  // ---- A life

  function hintFor(cardId) {
    if (cardId === `${C.shared[0]}.1`) return `<p class="hint">${swipeIcon}<span>${esc(U.helperFirst)}</span></p>`;
    if (cardId === `${C.shared[0]}.2`) return `<p class="hint"><span>${esc(U.helperSecond)}</span></p>`;
    return '';
  }

  function choice(chapterId, index) {
    const ch = C.chapters[chapterId];
    const card = ch.cards[index];
    return `<div class="sheet">
        ${picture(chapterId, index, 'before')}
        ${stamp}
        <div class="words">
          ${who(speakerFor(ch, card.speaker))}
          <p class="text">${esc(card.text)}</p>
          ${hintFor(card.id)}
        </div>
      </div>
      ${tabs(card.left.label, card.right.label)}`;
  }

  const callbacksHTML = (list) => list.map((t) => `<p class="callback">${esc(t)}</p>`).join('');

  function result(chapterId, index, side, callbacks) {
    const card = C.chapters[chapterId].cards[index];
    return `<div class="sheet">
        ${picture(chapterId, index, side)}
        <div class="words">
          <h2 class="chosen"><span class="mark">${arrow(side)}</span><span>${esc(card[side].label)}</span></h2>
          <p class="text">${esc(card[side].result)}</p>
          ${callbacksHTML(callbacks)}
        </div>
        ${spare}
      </div>
      ${stub('on', U.resultContinue)}`;
  }

  function arrival(v) {
    const c = v.chapter;
    return `<div class="sheet">
        <div class="portrait" aria-hidden="true">${personArt(inventorKey(c.id))}<span class="chip">${esc(c.era)}</span></div>
        <h1 class="plate">${esc(c.inventor.name)}</h1>
        <p class="role">${esc(c.inventor.role)}</p>
        <div class="words">
          <p class="text">${esc(c.arrival)}</p>
          <p class="want"><span class="pre">${esc(U.wantPrefix)}</span>${esc(c.inventor.want)}</p>
        </div>
      </div>
      ${stub('go', U.beginLife)}`;
  }

  function reveal(v) {
    const c = v.chapter;
    return `<div class="gilt" aria-hidden="true"></div>
      <p class="kicker">${esc(U.revealKicker)}</p>
      ${exhibit(c.id)}
      <div class="words">
        <h2 class="invention">${esc(c.invention.name)}</h2>
        <p class="text">${esc(c.invention.description)}</p>
        ${v.first ? `<p class="first">${esc(U.revealFirst)}</p>` : ''}
      </div>
      ${stub('gold', U.revealAction)}`;
  }

  // "Invented {invention}.", reading naturally mid-sentence: "Invented a
  // repeatable spark hearth." A name written as a proper title keeps its capitals.
  function inventedLine(name) {
    const words = name.split(' ');
    let text = name;
    if (/^(A|An|The)$/.test(words[0])) text = [words[0].toLowerCase(), ...words.slice(1)].join(' ');
    else if (!words.slice(1).some((w) => /^[A-Z]/.test(w))) text = name[0].toLowerCase() + name.slice(1);
    return U.epitaphInvented.replace('{invention}', text);
  }

  function epitaph(v) {
    const e = v.epitaph;
    return `<div class="cameo" aria-hidden="true">${personArt(inventorKey(v.chapter.id))}</div>
      <div class="words">
        <h2 class="name">${esc(e.name)}</h2>
        <p class="invented">${esc(inventedLine(e.invention))}</p>
        <div class="orn" aria-hidden="true"><i></i></div>
        <p class="text">${esc(e.death)}</p>
        ${e.legacy ? `<p class="text legacy">${esc(e.legacy)}</p>` : ''}
      </div>
      ${stub('mourn', U.epitaphAction)}`;
  }

  // Every decision and result in a life, for sizing its picture. A result
  // is measured with every callback that could follow it.
  const measured = new Map();
  function measureLife(chapterId) {
    if (measured.has(chapterId)) return measured.get(chapterId);
    const ch = C.chapters[chapterId];
    const out = [];
    ch.cards.forEach((card, i) => {
      out.push({ cls: 'front choice', html: choice(chapterId, i) });
      const cbs = C.callbacks.filter((cb) => cb.after === card.id).map((cb) => cb.text);
      for (const side of ['left', 'right']) out.push({ cls: 'back result', html: result(chapterId, i, side, cbs) });
    });
    measured.set(chapterId, out);
    return out;
  }

  // ---- The Archive: its lead-in, the proposals, the redirect

  function transition() {
    const archive = speakerFor(null, C.archive.id);
    return `<div class="sheet">
        <div class="archive-art" aria-hidden="true">${book}</div>
        <div class="words">
          ${who(archive)}
          <p class="text">${esc(U.archiveTransition)}</p>
          <p class="hint"><span>${esc(U.offerHelp)}</span></p>
        </div>
      </div>
      ${stub('go', U.continue)}`;
  }

  // A route's first bench, with the inventor who'd take it up (or, when two
  // projects share the picture, the project's name and the side it's on)
  function candidate(r, cls = '', side = null) {
    const bench = artURL('benches', ageOf(r.chapter).bench);
    const person = { key: r.inventor.key, name: r.inventor.name };
    const tag = side
      ? `<span class="person named">${side === 'left' ? `<span class="mark">${arrow('left')}</span>` : ''}<b>${esc(r.title)}</b>${side === 'right' ? `<span class="mark">${arrow('right')}</span>` : ''}</span>`
      : `<span class="person">${faceCrop(person)}<span class="about"><b>${esc(r.inventor.name)}</b><small>${esc(r.inventor.role)}</small></span></span>`;
    return `<div class="candidate ${cls}">${layer(bench, 0)}${tag}</div>`;
  }

  // r.inventor.key from the engine is "<chapter>:inventor"; use the cast's key when there's a drawn one
  const withKey = (r) => ({ ...r, inventor: { ...r.inventor, key: inventorKey(r.chapter) } });

  function offer(p) {
    const archive = speakerFor(null, C.archive.id);
    const routes = p.routes.map(withKey);
    if (p.double) {
      return `<div class="sheet">
          <div class="pic flex twin" aria-hidden="true">${candidate(routes[0], 'l', 'left')}${candidate(routes[1], 'r', 'right')}</div>
          ${stamp}
          <div class="words">
            <p class="lead">${faceCrop(archive)}<span>${esc(U.offerDoubleHeading)}</span></p>
            ${routes.map((r, i) => `<div class="route ${i ? 'r' : 'l'}"><h2 class="sr-only">${esc(r.title)}</h2><p class="text">${esc(r.pitch)}</p></div>`).join('')}
          </div>
        </div>
        ${tabs(routes[0].acceptLabel, routes[1].acceptLabel)}`;
    }
    const r = routes[0];
    return `<div class="sheet">
        <div class="pic flex" aria-hidden="true">${candidate(r)}</div>
        ${stamp}
        <div class="words">
          ${who(archive)}
          <h2 class="offer-title">${esc(r.title)}</h2>
          <p class="text">${esc(r.pitch)}</p>
          <p class="question">${esc(U.offerQuestion)}</p>
        </div>
      </div>
      ${tabs(r.acceptLabel, U.offerDefer)}`;
  }

  function offerResult(p, side) {
    const accepted = getState()?.route;
    const label = p.double ? p.routes[side === 'left' ? 0 : 1].acceptLabel : side === 'left' ? p.routes[0].acceptLabel : U.offerDefer;
    // The project taken up, or the one set aside
    const shown = withKey(p.double ? p.routes[side === 'left' ? 0 : 1] : p.routes[0]);
    return `<div class="sheet">
        <div class="pic flex${accepted ? '' : ' set-aside'}" aria-hidden="true">${candidate(shown)}</div>
        <div class="words">
          <h2 class="chosen"><span class="mark">${arrow(side)}</span><span>${esc(label)}</span></h2>
          <p class="text">${esc(accepted ? U.offerAccepted : U.offerDeferred)}</p>
        </div>
        ${spare}
      </div>
      ${stub('on', U.resultContinue)}`;
  }

  function redirectPicture() {
    const bench = artURL('benches', ageOf(C.redirect.after).bench);
    return `<div class="pic flex" aria-hidden="true">${layer(bench, 0)}<div class="label-card">${esc(C.redirect.title)}</div></div>`;
  }

  function redirect() {
    const r = C.redirect;
    return `<div class="sheet">
        ${redirectPicture()}
        ${stamp}
        <div class="words">
          ${who(speakerFor(null, C.archive.id))}
          <p class="text">${esc(r.text)}</p>
        </div>
      </div>
      ${tabs(r.left.label, r.right.label)}`;
  }

  function redirectResult(side) {
    const o = C.redirect[side];
    return `<div class="sheet">
        ${redirectPicture()}
        <div class="words">
          <h2 class="chosen"><span class="mark">${arrow(side)}</span><span>${esc(o.label)}</span></h2>
          <p class="text">${esc(o.result)}</p>
        </div>
        ${spare}
      </div>
      ${stub('on', U.resultContinue)}`;
  }

  // ---- Endings, the credits, the framing and the title

  // An ending's panels, over the future's workbench, waiting for the next inventor
  function panel(e) {
    const last = e.index === e.count - 1;
    const r = C.routes[e.route];
    const bench = artURL('benches', ageOf(r.chapters[r.chapters.length - 1]).bench);
    return `<div class="sheet">
        <div class="pic flex scene" aria-hidden="true">${layer(bench, 0)}</div>
        <div class="words">
          ${e.index === 0 ? `<p class="kicker">${esc(e.title)}</p>` : ''}
          <p class="statement">${esc(e.text)}</p>
        </div>
      </div>
      ${stub(last ? 'gold' : 'on', U.continue)}`;
  }

  function credits(another) {
    const [name, ...lines] = U.credits;
    return `<div class="sheet">
        ${emblem('big')}
        <div class="words">
          <h1 class="game-title">${esc(name)}</h1>
          ${lines.map((l) => `<p class="text">${esc(l)}</p>`).join('')}
          <p class="links"><button class="link" type="button" data-act="history">${esc(U.history)}</button></p>
        </div>
      </div>
      ${another ? pair([U.startOver, 'start-over'], [U.anotherFuture, 'another-future']) : stub('go', U.startOver, 'start-over')}`;
  }

  function intro() {
    return `<div class="sheet">
        ${emblem('big')}
        <div class="words"><p class="statement">${esc(U.framing)}</p></div>
      </div>
      ${stub('go', U.continue)}`;
  }

  function title({ resume, oldSave }) {
    const action = resume ? U.continue : oldSave ? U.oldSaveAction : U.begin;
    return `<div class="title-art" aria-hidden="true"></div>
      <div class="sheet">
        ${emblem('big')}
        <div class="words">
          <h1 class="game-title">${esc(U.title)}</h1>
          <p class="tagline">${esc(U.tagline)}</p>
          ${oldSave && !resume ? `<p class="note">${esc(U.oldSave)}</p>` : ''}
          <p class="links"><button class="link" type="button" data-act="history">${esc(U.history)}</button><span aria-hidden="true">·</span><button class="link" type="button" data-act="settings">${esc(U.settings)}</button></p>
        </div>
      </div>
      ${stub('go', action)}`;
  }

  return {
    choice, result, arrival, reveal, epitaph, measureLife,
    transition, offer, offerResult, redirect, redirectResult,
    panel, credits, intro, title,
    inventedLine, lookFor, inventorKey, silhouette, speakerFor,
  };
}
