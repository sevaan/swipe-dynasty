# Writing content

Everything in the game is data in this folder. The CSV files open in any spreadsheet app, and each row is one card, invention, death, flag or character. Edit a file, push to `main`, and the change is live on the phone a minute later. There's no build step.

Before pushing, run `node tools/check.mjs`. It lists errors (the game won't start) and warnings (worth a look) with the file, row and column. If you push content with errors anyway, the game shows the same list instead of starting.

## Files

| File | One row per | Key columns |
|---|---|---|
| `world.json` | (not a CSV) | Eras, their four meter labels and icons, keystone, next era, colours, inventor names; tuning values |
| `characters.csv` | Speaker | `id`, `name`, `portrait` (a sprite id; defaults to the character's id), `per life` (cap per life, blank for none) |
| `flags.csv` | Remembered fact | `id`, `scope` (`life`, `timeline` or `forever`), `default` |
| `inventions.csv` | Invention | `type` (keystone, stepping stone, bad idea), `name` (as in "Invented ___"), `requires`, `threshold`, `related` (bad ideas only), `icon` (a sprite id; defaults to the invention's id), `museum`, `hint` (the Naysayer's Museum hint) |
| `sprites/*.txt` | Picture | Pixel art as text (below) |
| `deaths.csv` | Death card | `meter` + `end` (low or high) for the 8 meter deaths per era; blank for special deaths used with `die`. `epitaph` is the punchline after "Invented X." `scene` sets the weather on the gravestone screen |
| `cards/*.csv` | Card | See below |

Ids are forgiving: case doesn't matter, and spaces, `_` and `-` are the same (`kept_naysayer` = `kept naysayer`). A row whose first cell starts with `#` is a comment.

## Card columns

| Column | Holds |
|---|---|
| `id` | Unique across all card files |
| `era` | The era id, like `stone-age` |
| `type` | Blank for an ordinary card. `script` for cards reached only by a `next` effect (scenes, the tutorial). Cards with a `trigger for` are triggers automatically |
| `speaker` | A character id from `characters.csv` |
| `text` | The question. House style: 25 words or fewer |
| `left answer`, `right answer` | 5 words or fewer each |
| `left effects`, `right effects` | What each answer does (syntax below) |
| `conditions` | When the card can appear (syntax below) |
| `weight` | How likely it is when eligible. Default 1; the unexplained animal is 0.4 |
| `trigger for` | The invention this card can trigger and the matching side, like `tinder right` |
| `epitaph` | Optional: how the epitaph phrases this breakthrough, like `Invented tinder, using a cousin.` |
| `scene` | Optional: the weather while this card is up, like `rain` (see Scenes below) |
| `notes` | For writers; the game ignores it |

## Effects

Separate effects with `;`.

| Write | Does |
|---|---|
| `Food -10`, `Gods +15` | Moves a meter, by this era's label or its role (`people`, `resources`, `belief`, `power`) |
| `Gods = 100` | Sets a meter (100 or 0 kills) |
| `tinder +2` | Adds hidden points toward an invention |
| `set kept_naysayer`, `clear kept_naysayer` | Turns a flag on or off |
| `refused_wheel +1` | Counts on a flag |
| `use sparks` | Marks the answer as using an ancestor's invention (shows a badge) |
| `next stampede-2` | Forces the next card (scenes) |
| `die fa-wheel-chase` | A special death from `deaths.csv` |
| `invent sparks` | Commits an invention outright (scripted moments like the tutorial) |

## Conditions

Separate conditions with `;`. All must hold. Use `or` for alternatives within one condition.

| Write | Means |
|---|---|
| `Food < 30`, `Gods >= 70` | Meter comparisons (`<`, `<=`, `>`, `>=`, `=`, `!=`) |
| `kept_naysayer`, `not kept_naysayer` | A flag is on or off |
| `refused_wheel >= 2` | A counting flag |
| `has cave-art`, `not has cave-art` | An invention exists in this timeline (made in an earlier life) |
| `made tinder`, `made any`, `made nothing` | What this life has invented so far (for aftermath cards) |
| `cards < 3`, `life >= 2` | Cards played this life; which life this is within the era |
| `once` | Only once per timeline |
| `repeat` | May come back within the same life (cards normally don't) |

## How inventions work (the short version)

- Answers add hidden points toward inventions.
- After 6 cards, once an invention's points reach its `threshold` and its `requires` were invented in earlier lives, one of its trigger cards appears within 3 draws.
- Swipe the matching side and that's this life's invention, revealed on the epitaph. Swipe the other side and it's off the table for the rest of the life.
- Die without a breakthrough and you get a bad idea from this era, leaning toward what you earned points for.
- Inventing an era's keystone ends the era: "Centuries pass", then the next one.

Tuning values (the 6 cards, the 3 draws, dot sizes) live in `world.json` under `tuning`.

## Sprites (all the art)

There are no emoji in this game: every picture is pixel art written as text in `sprites/`, and the checker rejects emoji anywhere in the content. Open `tools/sprites.html` (on the live site too) to see every sprite at once.

```
== mother ==
mirror
..........kk
.........kHH
```

- `== name ==` starts a sprite. Each following line is one row of pixels; a blank line ends the sprite.
- Each character is one pixel, named in `sprites/palette.txt` (`k` outline, `s` skin, `H` grey hair...). `.` is transparent.
- `mirror` means you only draw the left half; the right half is its mirror image. Most faces are drawn this way.
- Every row must be the same width. The checker names the row if one isn't.
- Portraits are 24 x 24, meter and invention icons 16 x 16. The game scales them by whole numbers so pixels stay square.
- Meter icons fill up from the bottom as the meter rises, and the Museum shows an unfound invention as its icon's silhouette, so draw shapes that read in solid colour.
- Keep each sprite to a handful of palette colours so it stays 8-bit.

## Scenes: skies and weather

The background changes as you play. Each era in `world.json` has a `sky` list (day, dusk, night, dawn); the sky moves on every `skyEvery` cards (in `tuning`), and each inventor starts at a different time of day. Night skies can bring their own effects, like stars.

A card or death can set a scene in its `scene` column. Scenes live in `world.json`:

```json
"scenes": {
  "rain":    { "bg": "#18222c", "fx": ["rain"] },
  "volcano": { "bg": "#2d1210", "fx": ["embers", "smoke", "shake"] },
  "sparks":  { "fx": ["sparks"] }
}
```

- `bg` changes the sky while the scene is up. Leave it out to keep the time of day (and add the scene's effects to it).
- `fx` picks from these effects: `rain`, `lightning`, `embers`, `smoke`, `flames`, `sparks`, `dust`, `stars`, `fireflies`, `grain`, `birds`, `shake`. A new effect needs code in `src/ui/fx.js`; a new scene is just data.
- Keep skies dark: the text is light. The checker warns when a sky doesn't leave enough contrast.
- To see a scene without playing to it, open the game with `?dev`, then Dev, pick a scene, Preview scene.

