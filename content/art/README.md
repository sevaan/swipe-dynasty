# Art guide

Every picture in the game is flat vector art: one SVG file per picture, in
this folder. The look is Reigns-like: simple shapes, solid colours, one hard
shadow, no outlines. Emoji aren't allowed anywhere; draw the thing instead.

You can draw in any vector tool (Figma, Illustrator, Inkscape, Affinity) and
export plain SVG, or write the SVG by hand. `tools/art.html` shows every
picture the game uses, and `node tools/check.mjs` reports missing or broken ones.

## Where each picture goes

| Folder | What | Canvas (`viewBox`) | Named after |
|---|---|---|---|
| `characters/` | A card's portrait: the whole card face | `0 0 288 360` | the `portrait` column in `characters.csv` |
| `inventions/` | An invention's icon (Museum, epitaph, answers) | `0 0 64 64` | the `icon` column in `inventions.csv` (or the invention's id) |
| `meters/` | A meter glyph | `0 0 48 48` | the meter's `icon` in `world.json` |
| `ui/` | Interface pieces: menu, close, arrows, grave, door, unknown, hand | `0 0 48 48` | fixed names; the checker lists any that are missing |

## House style

- **Shapes, not lines.** Build everything from filled shapes. There are no
  outlines, gradients, blurs, textures or `<text>`. Strokes are only for small
  features like eyebrows, closed eyes, mouths and stitching, with round caps.
- **One light, from the upper left.** Each big shape can get one darker facet
  on its right side, with straight, hard edges (a shade of the same colour, or
  black at 10–12% opacity). A small lighter highlight on the left is optional.
- **Few colours.** A character uses about 6–9 colours, an icon 2–5.

### Characters (288 × 360)

- The SVG is the whole card face. It starts with a full-size rectangle in the
  character's card colour, then a lighter halo: `<circle cx="144" cy="176" r="124">`.
  Every character gets their own muted card colour.
- A bust, cropped by the bottom edge. The shoulders start around y = 256 and
  run off the bottom. The head is centred on x = 144, with the face about 96 wide,
  its top near y = 100 and the chin near y = 224. The neck is about 44 wide.
- Faces:
  - Eyes are dark ovals (`#24150e`, about 11 × 13) or closed arcs.
  - Eyebrows are 5px round strokes, and they do the acting.
  - The nose is a small shape in the shadow skin tone. The mouth is a 4–4.5px round stroke.
  - Blush is optional: `#e98f8f` at 40–50% opacity.
- Props are welcome when they tell the joke, like the mother's bowl or the
  elder's staff.

Shared colours (use them so the cast looks like one family):

| Use | Colours |
|---|---|
| Skin, with its shadow | light `#f0c9a0`/`#dba882` · fair `#e0b48e`/`#c89a72` · tan `#d8a67c`/`#c08e64` · brown `#c68a5e`/`#b07a50` · deep `#8d5a3b`/`#744829` |
| Hair | grey `#cfc8bd` (behind `#bdb5a9`, highlight `#e4ded4`) · dark `#3b2419` · brown `#6b4428` · blond `#e8c25a` |
| Fur and hide | `#8a5a36` with spots `#6d4428` · light fur `#b99b78` |
| Bone, teeth, cream | `#efe2c2` |
| Eyes, ink | `#24150e` |
| Fire | red `#d9442e` · orange `#f08a2e` · yellow `#f2c94c` |

### Invention icons (64 × 64)

- Colour, no background, filling most of the canvas (2–4 units of margin).
- Readable at 20px (inside an answer) and at 64px (on a gravestone).
- `inventions/firemaking.svg` is the reference.

### Meter glyphs and interface pieces (48 × 48)

- **One colour.** The game recolours them to match each era's text, so the
  colour in the file doesn't matter. Only the shape counts. The exception is
  `ui/hand.svg`, which is drawn in colour.
- Bold silhouettes. Nothing thinner than 3 units.
- **Meter glyphs run top to bottom:** the drawing starts near y = 3 and ends near
  y = 45. The meter fills from the bottom of the canvas, so a glyph that
  doesn't reach the edges shows the wrong level.
