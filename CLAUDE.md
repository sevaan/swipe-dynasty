# Swipe Dynasty

A mobile-first swipe card game modeled on Reigns, where the dynasty is the history of technology. "Swipe Dynasty" is the repo's codename; the game is "Untitled Swipe Game" until it has a name.

Read `design-notes.md` before doing anything. It is the source of truth for the design: approved Decisions, then Pending proposals and Implementation notes near the end. It came out of a brainstorm on claude.ai (Sep 25, 2026) that was run as a comedy writers' room. If brainstorming continues in the Claude Doc, re-sync `design-notes.md` from it before building on the new material.

## Tech constraints

- Plain HTML, CSS and JavaScript modules. No build step, no dependencies. GitHub Pages serves `main` as-is.
- Phone first: real touch swiping, with the card tilting and previewing which meters each choice affects. Swipe is the only input (arrow keys work on desktop, for testing).
- Content lives in `content/` as spreadsheet-style CSV plus `world.json`, separate from engine code, so new cards never need logic changes. `content/README.md` is the writer's guide to the cell syntax.
- `src/engine/` has no DOM code. The browser, `tools/simulate.mjs` and the tests all run the same engine.
- Saves and settings persist in localStorage.
- No emoji anywhere (Sevaan's call). Every picture is flat vector art like Reigns: one SVG per picture in `content/art/`, drawn to the house style in `content/art/README.md`. `tools/art.html` shows them all, and the checker validates them (the canvas size, and no scripts, text or outside links).
- Text is Atkinson Hyperlegible Next, chosen for legibility. Keep the readability rules in design-notes.md: nothing players need to read is italic, faded or blinking, and secondary text uses `--muted` (at least 6:1).
- Skies and weather are data: scenes in `content/world.json`, picked by a card's or death's `scene` column, and drawn as flat shapes by `src/ui/fx.js`. Preview any scene from the `?dev` panel or `tools/fx.html`.

## Before pushing

- `npm test` (Node 18+, no install needed).
- `node tools/check.mjs` must show 0 errors.
- For balance changes, `node tools/simulate.mjs --runs 300 --policy human` and compare lives per era with the 3–6 target.

## Phone workflow

- The live test build is https://sevaan.github.io/swipe-dynasty/, rebuilt about a minute after each push to `main`. Add `?dev` for the debug panel (state, hidden points, skip ahead).
- Sevaan sometimes codes from a phone through Claude Code sessions on this repo. Those sessions work on a branch, and nothing is testable on the phone until it's merged to `main`. On "ship it", run the checks above, then merge to `main` and push.
- A service worker (`sw.js`) makes phones fetch fresh files on every load. Keep it small; don't add caching strategies to it without a reason.

## Writing cards

Comedy first. Short, punchy card text: 25 words or fewer per question, 5 or fewer per answer. Death cards carry the biggest jokes. The recurring cast (the Naysayer, your mother, the time-traveling advisor, the tutorial guy, the unexplained animal, the neighbours) is described in design-notes.md.

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
