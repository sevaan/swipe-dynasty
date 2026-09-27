# One Bright Idea

A mobile-first narrative invention game: one life, one invention, and everyone else deals with it. Each inventor works one project through investigation, proof and aftermath, swiping between two approaches. Their contribution changes what the next inventor inherits. "Swipe Dynasty" is the repo's codename; the working title is One Bright Idea.

Read `spec.md` before doing anything: it is the source of truth (v1.0, Sep 26, 2026, written by Sevaan). Then read the "Decisions since the spec" section at the top of `design-notes.md`. The rest of design-notes is the earlier Reigns-style design, kept as history and as a mine for jokes. Where the two disagree, the spec wins.

## Tech constraints

- Plain HTML, CSS and JavaScript modules. No build step, no dependencies. GitHub Pages serves `main` as-is.
- Phone first. The object on its workbench is a card at the bottom of the screen, with the two answers along its foot: tap one to choose it. Dragging the card left or right shows that side's answer across its top, and releasing past about 28% of its width chooses it (there's no flick shortcut). On a keyboard, an arrow shows an answer and the same arrow again chooses it. Danger and the phase of the life are tracked but never shown (see design-notes.md, Decisions since the spec). Test touch as well as the mouse: phones capture a finger to whatever it touched first.
- Content lives in `content/` as spreadsheet-style CSV plus `world.json`, separate from engine code, so new scenes and projects never need logic changes. `content/README.md` is the writer's guide to the cell syntax.
- `src/engine/` has no DOM code. The browser, `tools/simulate.mjs` and the tests all run the same engine.
- The game saves after every choice: a snapshot in IndexedDB (localStorage if that's unavailable), with the one before it kept. Each write checks a revision number, so a stale second tab can't overwrite a newer game. Settings live in localStorage. Export and import in Settings move a save by hand.
- No emoji anywhere (Sevaan's call). Every picture is flat vector art like Reigns: one SVG per picture in `content/art/`, drawn to the house style in `content/art/README.md`. `tools/art.html` shows them all, and the checker validates them (the canvas size, and no scripts, text or outside links).
- Text is Atkinson Hyperlegible Next, chosen for legibility. Keep the readability rules in design-notes.md: nothing players need to read is italic, faded or blinking, and secondary text uses `--muted` (at least 6:1).
- Skies and weather are data: `weather` in `content/world.json`, picked by a scene's `weather` column, and drawn as flat shapes by `src/ui/fx.js`. Preview any weather from the `?dev` panel or `tools/fx.html`.

## Before pushing

- `npm test` (Node 18+, no install needed).
- `node tools/check.mjs` must show 0 errors.
- For balance changes, run `node tools/simulate.mjs --runs 300` with `--policy random` and with `--policy cautious`. Check life length (spec §5.5: 10–12 choices, 8 in the first life), how often lives invent, fail or die in danger, and that the inherited-history callback lands by decision 3.

## Phone workflow

- The live test build is https://sevaan.github.io/swipe-dynasty/, rebuilt about a minute after each push to `main`. Add `?dev` for the debug panel (state, observations, skip to proof, grant an invention, preview weather).
- Sevaan sometimes codes from a phone through Claude Code sessions on this repo. Those sessions work on a branch, and nothing is testable on the phone until it's merged to `main`. On "ship it", run the checks above, then merge to `main` and push.
- A service worker (`sw.js`) makes phones fetch fresh files on every load. Keep it small; don't add caching strategies to it without a reason.

## Writing scenes

Comedy first, from conflicting reasonable desires (spec §14). Budgets from spec §14.4: a scene 20–45 words, answers 2–8, results 5–20, an epitaph 15–40; the checker warns past them. Every callback is gated by something that actually happened, and the epitaph's joke agrees with the recorded events. The old cast carries over as roles (see "Decisions since the spec" in design-notes.md): the cousin is the practical assistant, the elder the patron, the neighbours the rival, the Naysayer the skeptic, and the stranger the time-machine setup. `content/README.md` is the writer's guide to the tables and cell syntax. `tools/script.html` reads the whole game back as a script, in play order, live from the content (with a Markdown download).

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
