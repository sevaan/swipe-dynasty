# Writing content

Everything in the game is data in this folder. The CSV files open in any spreadsheet app. Each row is one scene, project, invention, legacy, failed design, death, observation, flag or character. Edit a file, push to `main`, and the change is live on the phone about a minute later. There's no build step.

Before pushing, run `node tools/check.mjs`. It lists errors (the game won't start) and warnings (worth a look), each with its file, row and column. If you push content with errors anyway, the game shows the same list instead of starting.

`spec.md` at the top of the repo is the design. This guide is only about how to write it down.

## How a life plays

- Each inventor works one **project** (`projects.csv`), a practical problem such as "The basket leaks".
- A life has three phases. It starts with an **opening**, then **investigation** (6 to 8 decisions; the first life has 4). Next comes one **proof** decision and three **aftermath** decisions. Then the epitaph, one line of inheritance, and the next inventor.
- Answers establish **observations** (`observations.csv`), such as "Holds its shape". The last three show as chips under the object.
- An **invention**'s recipe is a set of observations. Once a recipe is met, the proof scene can commit that invention. With nothing committed, the life leaves a **failed design** (`failures.csv`) instead. Either way, it's exactly one contribution per life.
- Each invention has two **legacy packages** (`legacies.csv`): two ways it could spread. Answers pick one with `legacy <id>`, and the last pick wins. The chosen legacy becomes the next life's **featured problem**. Scenes check it with `problem <legacy>`.
- **Danger** runs from 0 to 6. `danger +1` raises it, and at 6 the inventor dies. The player never sees it: no meter and no warnings. So an answer's description has to carry the risk in words, and a risky answer should name the death that fits it (`death prov-died-salt`).
- The object on the workbench has a **look** (one picture per state) and **marks** (overlays such as smoke or drips). It's a card at the bottom of the screen. Dragging it shows an answer and its description, and letting go past the line chooses it.

## Files

| File | One row per | Columns |
|---|---|---|
| `world.json` | (not a CSV) | The file list, the starting era and project, tuning values, eras (name, intro, required and optional discoveries, keystone, next era, workbench, colours, skies, inventor names), weather, and which overlays last one scene |
| `characters.csv` | Character | `id`, `name` (as shown, like "Your cousin"), `portrait` (a picture in `art/characters/`), `role` |
| `flags.csv` | Remembered fact | `id`, `scope` (`life`, `timeline` or `forever`), `default` |
| `observations.csv` | Observation | `id`, `project`, `text` (the chip: short, plain, no score) |
| `projects.csv` | Project | `id`, `era`, `name`, `problem` (shown under the inventor's name), `outcomes` (inventions it can make), `failures` (failed designs it can leave), `start look`, `requires` (inventions that must exist first), `investigation` (a number like `4` or a range like `6-8`), `weight` |
| `inventions.csv` | Invention | `id`, `era`, `type` (`stepping stone`, `optional` or `keystone`), `name` (as in "Invented ___"), `project`, `requires`, `recipe` (below), `legacies` (its two packages), `made` (the epitaph's first line, if not "Invented ___."), `look` (its picture in History), `capability` (for "Possible because of ___"), `museum`, `hint` |
| `legacies.csv` | Legacy package | `id`, `invention`, `adoption` (how it spread, in a few words), `problem` (what it leaves behind), `inherit` (the one line the next inventor inherits), `epitaph` (the epitaph's third line), `change` (a note on how it changes the next life) |
| `failures.csv` | Failed design | `id`, `project`, `name` (as in "Invented ___"), `conditions` (the first one whose conditions hold is used), `epitaph`, `inherit`, `look` (the exhibit) |
| `deaths.csv` | Death | `id`, `kind` (`danger` or `natural`), `project` (blank for any), `text` (the epitaph's second line), `conditions`, `weight` (0 means only when an answer names it) |
| `scenes/*.csv` | Scene | Below |

Ids are forgiving: case doesn't matter, and spaces, `_` and `-` are the same (`lid_habit` = `lid habit` = `lid-habit`). A row whose first cell starts with `#` is a comment, and every table can have a `notes` column the game ignores.

## Scene columns

| Column | Holds |
|---|---|
| `id` | Unique across all scene files |
| `project` | The project it belongs to (blank for a scene any project can use) |
| `phase` | `opening`, `investigation`, `callback`, `proof` or `aftermath` (below) |
| `speaker` | A character id, or blank for no speaker |
| `shows` | What the object looks like when the scene appears, before any answer: `look`, `mark` and `unmark`, like `look rotting-pot; mark smell`. Each can take `if`: `look store-jar if legacy pottery-communal` |
| `text` | The situation. Aim for 20 to 45 words |
| `left`, `right` | The two answers, 2 to 8 words each, shown on the card while it's dragged |
| `left preview`, `right preview` | The answer's description, a few words shown under it on the card. Since Danger is hidden, this is where a risky approach says so ("Fast and very hot") |
| `left result`, `right result` | What happened, shown above the next scene. 5 to 20 words |
| `left effects`, `right effects` | What each answer does (below) |
| `conditions` | When the scene can appear (below) |
| `weight` | How likely it is when several fit. Default 1 |
| `weather` | Optional weather from `world.json`, like `rain` |

## When scenes appear

- **opening**: the first scene of a life. Usually conditioned on the featured problem, like `problem pottery-household`.
- **investigation**: the working scenes. The game prefers one that can establish an observation the project still needs.
- **callback**: at most one per life, by the third decision at the latest. It's the scene where the last life's choices come back, gated on what actually happened (`lid-habit`, `previous absorbent-cup`, `history pottery-communal`).
- **proof**: one decision. A proof scene only appears if both its answers can resolve. An answer with `commit pottery` needs the recipe met. An answer with `fail absorbent-cup` always resolves. Give each project at least one proof whose answers both `fail`, for lives that didn't get there.
- **aftermath**: three decisions after a success. `step = 0`, `step = 1` and `step = 2` pick which one. The last usually offers the legacy choice.
- `next <scene>` in an answer makes that scene come next, if its conditions still hold.
- No scene repeats within a life. `once` in the conditions means once per timeline.
- The game prefers a different speaker from the last scene's.

## Effects

Separate effects with `;`. Add `if <condition>` to make one conditional: `look woven-pot if lined`.

| Write | Does |
|---|---|
| `danger +1`, `danger -1`, `danger = 0` | Moves Danger (it never goes below 0; 6 kills) |
| `observe holds-water` | Establishes an observation |
| `look fired-pot` | Changes the object to `art/objects/<project>/fired-pot.svg` |
| `mark smoke`, `unmark smoke` | Adds or removes the overlay `art/overlays/smoke.svg` |
| `commit pottery` | In a proof scene: this life invented pottery (if its recipe is met) |
| `fail fragrant-larder` | In a proof scene: this life leaves that failed design |
| `legacy pottery-household` | In a proof or aftermath scene: how the invention spreads (the last pick wins) |
| `because pottery` | Marks the answer "Possible because of" that invention's capability. Gate the scene with `has pottery` |
| `next prov-loose` | The next scene |
| `death vessel-kiln` | If this answer kills, use this death. Give every answer that raises Danger one, so the epitaph matches what happened |
| `set taught`, `clear taught`, `count +1` | Flags (declare them in `flags.csv`) |

## Conditions

Separate conditions with `;`. All must hold. Use `or` or `|` for alternatives within one condition, and `not` in front of any of them.

| Write | Means |
|---|---|
| `has pottery` | That invention exists in this timeline |
| `observed sealed` | This life has established that observation |
| `made pottery`, `made any`, `made nothing` | What this life's proof committed |
| `failed bird-feeder`, `failed any` | This life's failed design |
| `problem pottery-household` | The featured problem this life inherited |
| `legacy preservation-larders` | This life's current legacy choice |
| `history pottery-communal` | Any earlier invention in this timeline spread that way |
| `previous absorbent-cup` | What the last life left (an invention or a failed design) |
| `look drying-rack`, `mark salt` | The object's current look, or an overlay on it |
| `seen tut-6` | That scene has already come up in this life |
| `era stone`, `project provisions` | Where and what |
| `danger >= 4`, `step = 2`, `decisions < 3`, `life = 1`, `lives >= 2` | Comparisons (`<`, `<=`, `>`, `>=`, `=`, `!=`). `step` counts decisions within the current phase; `life` is this inventor's number and `lives` the lives finished in the timeline |
| `taught`, `not taught`, `count >= 2` | Flags |
| `once` | Only once per timeline |

## Recipes

A recipe lists observations joined by `+`, and all of them are needed. Alternatives are joined by `|`, and any one set will do: `sealed + dried | sealed + salted`.

## Names in text

| Write | Becomes |
|---|---|
| `{name}` | This inventor |
| `{previous}` | The last inventor |
| `{maker}` | In `legacies.csv` and `failures.csv`: whoever made it |
| `{maker:pottery}` | Whoever first made that invention in this timeline |

## Pictures

There are no emoji in this game. Every picture is flat vector art, one SVG file per picture in `art/`, and the checker rejects emoji anywhere in the content. `art/README.md` covers the house style and the canvas sizes. Open `tools/art.html` (on the live site too) to see every picture stacked the way the game stacks them.

- Every look a scene names needs `art/objects/<project>/<look>.svg`. Every mark needs `art/overlays/<mark>.svg`. The checker lists anything missing, with the row that asked for it.
- Marks listed under `transient` in `world.json` (a glint, steam, a puff of smoke) last for one scene, then clear themselves.
- A new era needs a workbench in `art/benches/`. A new character needs a portrait in `art/characters/`.

## Skies and weather

Each era in `world.json` has a `sky` list (day, dusk, night, dawn). The sky moves on every `skyEvery` decisions (in `tuning`), and each inventor starts at a different time of day.

A scene can set weather in its `weather` column. Weather lives in `world.json`:

```json
"weather": {
  "rain":  { "bg": "#18222c", "fx": ["rain"] },
  "fire":  { "bg": "#2c170c", "fx": ["flames", "embers"] },
  "birds": { "fx": ["birds"] }
}
```

- `bg` changes the sky while the scene is up. Leave it out to keep the time of day, and add the effects to it.
- `fx` picks from these effects: `rain`, `lightning`, `embers`, `smoke`, `flames`, `sparks`, `dust`, `stars`, `fireflies`, `grain`, `birds`, `shake`. A new effect needs code in `src/ui/fx.js`; new weather is just data.
- Keep skies dark, because the text is light. The checker warns when a sky doesn't leave enough contrast.
- To preview weather without playing to it, open `tools/fx.html`, or the game with `?dev`, then Dev, then Preview weather.

## House style

The budgets are spec 14.4's, and the checker warns past them. They're editorial targets, not a reason to write fragments.

- Scene: 20 to 45 words. Answer: 2 to 8. Result: 5 to 20. Epitaph lines: 15 to 40 together.
- Every callback must be gated by something that actually happened. The epitaph's joke must agree with the recorded events.
- The humour targets decisions, institutions, ambition and unintended consequences, never the people for having simpler tools. Include real wonder and competent collaboration. Occasionally, something should work beautifully.

## Checking your work

- `node tools/check.mjs`: errors and warnings, as above.
- `npm test`: the engine's rules, including every tutorial branch.
- `node tools/simulate.mjs --runs 300 --policy random`: plays thousands of lives and reports how they went. The policies are `random`, `cautious`, `reckless`, `discovery`, `legacy` and `refuse`.
