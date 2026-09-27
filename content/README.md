# Writing content

The whole game is three files in this folder:

| File | What it holds |
|---|---|
| `script.md` | The story: every life, card, answer, result, callback, proposal and ending. This is Sevaan's complete script, and the game reads it as it's written. |
| `world.json` | How each life looks: its era palette and skies, its workbench, which drawings show its six workbench states, and which characters have drawn portraits. |
| `ui.json` | The interface's exact words: the title screen, the helpers, the reveal, the proposals, the credits. |

Edit a file, push to `main`, and the change is live on the phone about a minute later. There's no build step. Before pushing, run `node tools/check.mjs`. It lists errors (the game won't start) and warnings (worth a look), each with its file, line, and the chapter, card or field. If you push content with errors anyway, the game shows the same list instead of starting.

To read the whole script back the way the game plays it, open `tools/script.html` (on the live site too). It has a filter for the shared history and each route. `node tools/script.mjs` writes the same thing as Markdown.

The old prototype's content (pottery and provisions as spreadsheets) is kept in `retired/milestone-1/`. The game doesn't read it.

## Writing for players

Write for a casual reader and gamer (Sevaan, Sep 27):
- Say plainly what happens first, in everyday words.
- Add at most one easy joke, and nothing the reader has to decode. "The remaining stones are promoted to seating" became "The useless stones become something to sit on."
- Use short sentences, concrete nouns, and clear names for who does what.
- Keep situations to about 45 words, results to about 30, and answers to 2–8.

## How the game reads `script.md`

The rules and notes in the script are for people; the game skips them. What it reads is the structure below. Keep the headings and the bold labels exactly as they are, and the words around them can change freely.

- **A route** starts with a top-level heading ending in "route", like `# 10. Simulation route`. Under it, `**Internal route ID:** \`simulation\``, then `### Proposal copy` with `**Title:**`, `**Pitch:**` and `**Accept label:**`. Everything until the next top-level heading belongs to that route. The shared lives come before the first route.
- **A life** is a `##` heading with its id: `## C01 — A Little Warmth`. Its fields:
  - `**Era:**`
  - `**Prerequisite:**`: the invention it needs, or "None" for the first life.
  - `**Inventor:** Name — Role`
  - `**Personal want:**`
  - `**Arrival:**`
  - `**Single invention:** \`id\` — **Name**`, with the description on the next line.
  - `### Cast`: one line per person, like ``- `iri` — **Iri:** A companion…``. Ids are local to their life.
  - `### Workbench progression`: six numbered states, one shown before each card.
- **A card** is a `###` heading like `### C01.1 — Opening`. The six cards must run Opening, Experiment, Complication, Proof, Adoption, Legacy. Each card has:
  - `**Speaker:** Name (\`id\`)`: a member of that life's cast.
  - `**Situation:**`
  - `**Left: …**` and `**Right: …**`: the two answers. Under each, `**Result:**` and `**Effects:**`.
- **Effects** read `experimental exposure unchanged.`, `experimental exposure +1.`, or add an interest: `experimental exposure unchanged; D affinity +1.`. The interests are S (modelling), D (exploration), R (shared provision), A (communication) and U (inner relief).
- **The closing record** (`### Closing record`) has:
  - `**If card six was left:**` and `**If card six was right:**`: the legacy line on the epitaph.
  - `**Natural obituary:**`, and optionally `**Risk obituary:**`. A risk obituary that starts "Not reachable" is a note, not copy.
  - A route's last life has `**Final-life rule:**` instead of obituaries; its ending follows.
- **An ending** is `## Ending — Title` inside its route: `**Panel 1:**` to `**Panel 5:**`, then `**After panel five, if S4.6 was left:**` and `…right:**`.
- **The redirect** is `### REDIRECT.U3 — Title`, with `**When:**`, `**Speaker:**`, `**Situation:**`, and two answers whose `**Transition:**` names the life they go to.
- **An arrival override** is one line: `**Arrival override after REDIRECT.U3 = right:** Replace R1’s normal arrival with: “…”. Set the era label to “…”.`
- **A callback** is `### Callback 01` in the callback registry: `**After:** \`C02.1\``, `**Only if:** \`C01.6 = right\``, `**Text:**`.

A line that sits directly under a field, with no blank line between, continues that field.

## How a life plays

Every life plays exactly six cards: opening, experiment, complication, proof, adoption, legacy. Nothing ends a life early.

- **After each answer,** its result shows with any callbacks whose earlier choice matches, then Continue.
- **Card four** commits the life's one invention and shows the reveal.
- **Card six** picks the legacy line. Then comes the epitaph: the inventor's name, "Invented …", the obituary, and the legacy.
- **Exposure** adds up within a life, from 0 to 9, and is never shown. At 2 or more the risk obituary replaces the natural one, where a life has one.

After the fourteenth life, interests rank the five routes. Each score is divided by the most this script lets that interest reach, so a route with fewer chances to score isn't buried. The Archive offers them one at a time; the last offer shows the final two together. A route runs four lives to its ending. After U3, the redirect can turn Unmaking into Retirement. "Another future" at the end goes back to the proposals, with the shared history as it was.

## `world.json`

- **`ages`**: each era's `chapters`, its `bench` (a picture in `art/benches/`), its `theme` colours and its `sky` list. Every life must be in exactly one age.
- **`art`**: drawings for a life's six workbench states, one entry per state:
  - `"object"` is shown before the card: a picture in `art/objects/`, or `{ "from": "C02.1", "left": …, "right": … }` when it depends on an earlier answer.
  - `"marks"` adds overlays from `art/overlays/`.
  - `"left"` and `"right"` are what the workbench changes to after each answer.
  - A life without drawings shows each state's description from the script as a label on its workbench. A missing picture never breaks the game: it shows as a label, and the checker warns.
- **`portraits`**: `"C01:aru": "c01-aru"` gives a cast member a drawn portrait from `art/characters/`. Everyone else gets a silhouette.

## Pictures

There are no emoji in this game. Every picture is flat vector art, one SVG file per picture in `art/`, and the checker rejects emoji anywhere in the content. `art/README.md` covers the house style and the canvas sizes. Workbenches paint 80 units past every edge of their frame, so the card looks finished at any shape from 2:1 to square. Open `tools/art.html` to see every picture stacked the way the game stacks them.

## Checking your work

- `node tools/check.mjs`: errors and warnings, as above.
- `npm test`: the campaign's rules against the real script. Every chapter's 64 answer combinations, a full history on each route, the redirect, callbacks, proposals, reloads.
- `node tools/simulate.mjs --runs 500`: plays many histories and reports which futures come up, how long histories run, and which lives close with a risk obituary.
