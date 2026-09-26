# Writing content

Everything in the game is data in this folder. The CSV files open in any spreadsheet app, and each row is one card, invention, death, flag or character. Edit a file, push to `main`, and the change is live on the phone a minute later. There's no build step.

Before pushing, run `node tools/check.mjs`. It lists errors (the game won't start) and warnings (worth a look) with the file, row and column. If you push content with errors anyway, the game shows the same list instead of starting.

## Files

| File | One row per | Key columns |
|---|---|---|
| `world.json` | (not a CSV) | Eras, their four meter labels and icons, keystone, next era, colours, inventor names; tuning values |
| `characters.csv` | Speaker | `id`, `name`, `portrait` (an emoji for now), `per life` (cap per life, blank for none) |
| `flags.csv` | Remembered fact | `id`, `scope` (`life`, `timeline` or `forever`), `default` |
| `inventions.csv` | Invention | `type` (keystone, stepping stone, bad idea), `name` (as in "Invented ___"), `requires`, `threshold`, `related` (bad ideas only), `museum`, `hint` (the Naysayer's Museum hint) |
| `deaths.csv` | Death card | `meter` + `end` (low or high) for the 8 meter deaths per era; blank for special deaths used with `die`. `epitaph` is the punchline after "Invented X." |
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
