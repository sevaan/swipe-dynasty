# One Bright Idea

A mobile-first, two-choice narrative game about the history and possible futures of invention: one life, one invention, someone takes it further. Fourteen shared lives run from a first spark to life support, then the player's interests suggest one of five futures, four lives each. "Swipe Dynasty" is the repo's codename; the working title is One Bright Idea.

Read `content/script.md` before doing anything. It's Sevaan's complete game script and implementation handoff (v1.0, Sep 27, 2026), it's the source of truth, and the game reads it directly: it is the content, not a copy of it. Then read "Decisions since the spec" at the top of `design-notes.md`. `spec.md` (Sep 26) is the earlier design; where it and the script differ, the script wins. The rest of design-notes is history, kept as a mine for jokes.

## Tech constraints

- Plain HTML, CSS and JavaScript modules. No build step, no dependencies. GitHub Pages serves `main` as-is.
- Phone first, and every moment is a card (Sevaan chose layout prototype 1, "The Card", Sep 27). A life is a small face-down deck dealt onto the table: the character card, six decisions, the gilt reveal and the black-edged epitaph. `src/ui/table.js` moves the cards and `src/ui/faces.js` draws them; `app.js` turns each engine view into a step (which deck, which place in it, which face).
  - A decision card has the workbench picture on top, the speaker and the words under it, and the two answers as tear-off tabs along its foot. Tap a tab, or drag the card: it swings, the answer's stamp comes down, and past 30% of its width (or on a flick) letting go chooses. The card turns over and the result is printed on its kraft back; tap anywhere or throw it away to move on.
  - The same cards carry the Archive's lead-in and proposals, the Unmaking redirect, an ending's panels, the credits, the framing and the title.
  - On a keyboard, the arrows choose and Enter or Space continues. Experimental exposure (the old "danger") is tracked but never shown.
  - Test touch as well as the mouse: phones capture a finger to whatever it touched first. `?dev` exposes `window.obi` (state, step, busy) for driving the game in tests.
- The story is `content/script.md`, read by `src/content/script.js`: chapter and card headings and bold field labels are the structure, so a rewrite of the script is a drop-in file swap. `content/world.json` maps each life to an era palette, workbench and drawings; `content/ui.json` holds the interface's exact words. `content/README.md` is the writer's guide. Any slip is reported with its line and chapter, card and field.
- `src/engine/campaign.js` has no DOM code. The browser, `tools/simulate.mjs` and the tests all run the same engine: six cards per life, all always played; the invention on card four; the legacy on card six; proposals ranked by normalized interest after the shared lives.
- The game saves after every choice: a snapshot in IndexedDB (localStorage if that's unavailable), with the one before it kept. Each write checks a revision number, so a stale second tab can't overwrite a newer game. Settings live in localStorage. Export and import in Settings move a save by hand.
- No emoji anywhere (Sevaan's call). Every picture is flat vector art like Reigns: one SVG per picture in `content/art/`, drawn to the house style in `content/art/README.md`. `tools/art.html` shows them all, and the checker validates them (the canvas size, and no scripts, text or outside links).
- Text is Atkinson Hyperlegible Next, chosen for legibility; names, headings and the stamp use Fraunces. Keep the readability rules in design-notes.md: nothing players need to read is italic, faded or blinking, story text is at least 18px, and secondary text uses `--ink-soft` on paper or `--text-soft` on the sky (both over 6:1). Every card must fit a 390×664 screen at the default text size; at larger sizes the words scroll inside the card, with a fade at their foot.
- Skies are data: each era in `content/world.json` has its own palette and skies, drawn as flat shapes by `src/ui/fx.js`. `tools/fx.html` previews the weather effects.

## Before pushing

- `npm test` (Node 18+, no install needed).
- `node tools/check.mjs` must show 0 errors.
- After changing the script, run `node tools/simulate.mjs --runs 500`: an ordinary history is 18 lives and 108 cards, one redirected from Unmaking is 21 and 126, and every route should come up. `tools/script.html` (or `node tools/script.mjs`) reads the whole script back for review, with a filter per route.

## Phone workflow

- The live test build is https://sevaan.github.io/swipe-dynasty/, rebuilt about a minute after each push to `main`. Add `?dev` for the debug panel (jump to any life, play left to the proposals, see the state).
- Sevaan sometimes codes from a phone through Claude Code sessions on this repo. Those sessions work on a branch, and nothing is testable on the phone until it's merged to `main`. On "ship it", run the checks above, then merge to `main` and push.
- A service worker (`sw.js`) makes phones fetch fresh files on every load. Keep it small; don't add caching strategies to it without a reason.

## Writing the script

The script's own sections 1 and 3 set the rules and the register: dry, concrete, humane, occasionally dark; practical objections puncture grandeur; a sincere success may stay sincere. Inventors are different people, not a dynasty; relationships are local to a life. Don't paraphrase, summarise or generate story text: every word players see comes from `content/script.md` or `content/ui.json`.

Write for a casual reader and gamer (Sevaan, Sep 27). Say plainly what happens first, in everyday words, then at most one easy joke; never make the reader decode a riddle ("the remaining stones are promoted to seating" became "the useless stones become something to sit on"). Short sentences, concrete nouns, no wry personification of the weather or the cold. Keep each choice's meaning, effects and names exactly as they are. `content/README.md` explains the format the game reads.

## Working agreement

- Before writing code for anything new, give a short plan first.
- Ask before making big design calls that design-notes.md doesn't cover.
- When a decision is made, record it in design-notes.md. Move dropped ideas to its Graveyard section instead of deleting them.

## The writers' room

When asked to run the room, voice the cast and keep it moving. Sevaan is the exec at the back of the room who listens and jumps in to redirect.

- Deb: veteran sketch writer from Second City Toronto. Wants every joke grounded in something painfully real.
- Marcus: former games journalist. Pitches mechanics as punchlines.
- Priya: the youngest. Absurdist; will derail anything with a bit about geese.

Keep each exchange short and end by asking where to push next.
