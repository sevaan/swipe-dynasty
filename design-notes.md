# One Bright Idea — Writers' Room Notes

Sep 25, 2026 · @Sevaan Franks

**Read `spec.md` first.** Since Sep 26, 2026 the game is **One Bright Idea**, and `spec.md` (v1.0, written by Sevaan) is the source of truth for how it works. This file keeps the decisions made since the spec (next section), the Graveyard, and the history: everything below "Decisions since the spec" comes from the earlier Reigns-style design (the Claude Doc, rev 49). Where the old notes and the spec disagree, the spec wins; the old material stays as a mine for jokes, characters and eras. Record new decisions in the next section, and move dropped ideas to the Graveyard instead of deleting them.

## Decisions since the spec

- **The play screen is The Card (Sep 27, Sevaan).** Sevaan said the layout "just isn't feeling right" and asked for options to feel, not screenshots. Of five playable prototypes of Aru's life (`prototypes/`), Sevaan chose 1, The Card:
  - A life is a small face-down deck of nine cards: the character card, six decisions, the reveal and the epitaph. The deck thins as you play, and the reveal's gold edge and the epitaph's black edge show in the stack before they arrive.
  - A decision card has the workbench picture at the top, the speaker and the situation under it, and the two answers as tear-off tabs along its foot. Tap a tab, or drag the card: it swings on a pivot, the answer stamps down at 30% of its width, and letting go throws it over to show the result on its kraft back. Moving on slides the card away and turns the next one up.
  - Names and headings use Fraunces; everything read stays in Atkinson Hyperlegible Next.
  - Built into the game the same day, replacing the layout in the entry "The card is at the bottom" below. The other four prototypes are in the Graveyard, and all five still play at `prototypes/`.
  - The prototype covered one life, so the rest of the game got the same card language (my calls, open to change):
    - Each life is its own deck. A new deck falls onto the table for the next life, the proposals, the redirect or an ending, and each era's deck takes that era's colours.
    - The Archive's lead-in ("No one inherited all of it…") is a card of its own before the first proposal. Each proposal is a card showing that project's first workbench and inventor, with "accept" and "Hear another proposal" as its tabs. The last proposal names both projects on the two halves of its picture, and its tabs are the two projects.
    - The redirect is a decision card spoken by the Archive. An ending is a short deck of panel cards over that future's empty workbench, the last one gilt. The credits are a card with "Another future" and "Start from the first spark" as tabs.
    - The title is the deck's own back with the name printed on it. The menu (history, settings) is a sheet of the same paper.
    - Firelight rises behind the deck as each life goes on, brightest at the reveal. The weather still plays over the sky.
- **Plain language for a casual reader (Sep 27, Sevaan).** The script is being rewritten line by line so a casual reader and gamer understands it at once: what happens first, in everyday words, then at most one easy joke, and nothing to decode. Choices, effects, names and story beats stay the same. C01 and C02 were the sample Sevaan approved, and the other 32 lives, the callbacks, the proposals and the endings followed the same day. The rule is in CLAUDE.md under "Writing the script".
- **The complete game script replaces the spec's systems (Sep 27, Sevaan).** `content/script.md` (v1.0) is the whole game, and the game reads it directly: 34 lives, 204 cards, 28 callbacks, five routes, five endings and one redirect. Where it differs from `spec.md`, the script wins:
  - every life plays exactly six cards, with the invention on card four and the legacy on card six, and nothing ends a life early;
  - "danger" is now hidden experimental exposure, which only picks the obituary;
  - small interest scores rank five future projects after the fourteenth life;
  - there are no observations, recipes, schedulers, failed designs or random scenes.
  The prototype's content and engine are in the Graveyard. The decisions below about the screen (the card at the bottom with its answers along the foot, swipe or tap, nothing showing Danger or the phase) still hold. Art stays flat vector, which the script asks for ("use the existing proof-of-concept visual language").
- **The spec replaces the Reigns-style structure (Sep 26, Sevaan).** The pieces it drops are in the Graveyard under "The Reigns-style design".
- **Art stays flat vector (Sep 26, Sevaan).** The spec's §13.1 asks for pixel-art objects. The flat, Reigns-like style chosen the same day wins: workbench objects, overlays and scenes are SVG in `content/art/`, drawn to `content/art/README.md`. The character portraits become the small figures beside the object.
- **The old cast carries over as roles (Sep 26, Sevaan).** The old cards are retired, and the characters map onto the spec's voices where they fit:
  - The cousin is the practical assistant ("Every era has a cousin. It's never the same cousin.").
  - The elder is the Stone Age patron. The neighbours are the rival.
  - The Naysayer is the recurring skeptic.
  - The stranger from the future sets up the time-machine ending.
  - The mother still asks if you're eating, which fits the food lives.
  - The goose stays as story material.
- **Milestone 1 first (Sep 26).** Build the spec's Milestone 1, the pottery-to-preservation causal prototype, then stop for Sevaan's playtest against its exit condition.
- **Danger is hidden (Sep 26, Sevaan).** The engine still tracks it, and reaching 6 still kills, but the screen shows no meter, no "Danger +1" tags and no Fatal marks. This overrides spec §7.1's visible segments, §7.2's visible consequences and §12.1's "Danger remains visible". An answer's description carries the risk in words ("Fast and very hot"), and each risky answer names the death that fits it. The `?dev` panel and the simulator still show Danger.
- **No phase indicator (Sep 26, Sevaan).** "Investigating · 1 of 4" is gone from the screen, overriding spec §12.1's small phase indicator. The phases still run as written.
- **The card is at the bottom, with the answers along its foot (Sep 26, Sevaan).** Replaced on Sep 27 by The Card (above); kept as the record of what came before.
  - The object on its workbench is a card at the bottom of the screen, under the thumb. The situation sits just above it, and the context stays at the top. This replaces spec §12.1's layer order.
  - The two answers are the card's two halves: the label at the top of each, the description at the bottom, so the small text lines up across both.
  - Tapping an answer chooses it. Dragging the card shows that side's answer and its description across the top of the picture, and the band turns to the accent colour once letting go would choose it. Letting go before then puts the card back.
  - A chosen card flies off, and the next one arrives. A tap on the picture nudges the card and shows the hand.
  - Keyboard: an arrow shows that side's answer, and the same arrow again (or Enter) chooses it.
  - For about an hour the answers were swipe-only; see the Graveyard.

## The pitch

Reigns, but the dynasty is the history of technology. You start banging rocks together and end up in genetic engineering, time travel or other planets, one swipe at a time.

Each run is one inventor in one era, swiping left or right on the people and problems in front of them. Each life adds one invention to history, and an era ends when someone invents its keystone. The tone is comedy: the same small human problems, in every era, getting weirder.

## Core structure

The swipe is the whole interface: left or right only. Four core meters every era, renamed to fit it (see the meters decision).

- **Runs are lives.** One inventor per life; an era spans several lives (see keystones). Death ends the life, not the game.
- **The tech tree is the meta-progression.** Each era's keystone unlocks the next era for good. You can't reach genetic engineering until someone figured out agriculture, and probably died doing it.
- **The timeline branches.** Go hard into biology and you never get proper computing, just wet, grown machines. Go hard into metal and you get the chrome future. Choosing a branch locks you out of others, so nobody sees it all in one playthrough.
- **Tech debt is literal.** Something you built ten eras ago breaks, and you have to deal with it while inventing space travel.
- **Meters drift.** Example: a Religion meter slowly turns into a Marketing meter, and nobody notices when it happens.
- **Secret ending:** one branch where everyone just got really good at pottery and was fine.

### Decision: one invention per life

Each life adds exactly one invention to history. You don't pick it from a menu; your choices over the run add up to it, and sometimes it isn't what you were aiming for (you wanted the plough, you invented gossip).

- **The loop:** use the past, add one thing, die.
- **The inventory is your ancestors' work.** Every invention from past lives is available, offered as answers on cards; you only ever add one. This replaces the earlier idea of limited item slots.
- **The death card doubles as the epitaph:** "Invented the wheel. Chased it."

### Decision: how the invention is decided

Hidden leanings shape what you can invent, an ordinary-looking card triggers it, and the death card reveals it.

- **Hidden leanings:** cards quietly nudge you toward a few possible inventions over the run.
- **Secret trigger:** the breakthrough looks like any other card. You find out which one it was in your epitaph ("Invented art, by accident, while scolding a child").
- **Occasional tell:** sometimes a small shimmer or sound hints the moment just happened. Not every time.
- **Why:** players can't tell which cards matter, so every card might, and replays reward spotting the ordinary cards that were secretly big.

### Decision: meters (room's call)

Four core meters every era, renamed to fit the era. Players learn the system once; each era still feels different.

| Core role | Stone Age | Farming | Later eras (examples) |
|---|---|---|---|
| People | Tribe | Village | Citizens, then Users |
| Resources | Food | Harvest | Money, then Data |
| Belief | Gods | Priests | Religion, drifting into Marketing |
| Power | Fire | The Neighbours | Army, then Investors |

- The Religion-to-Marketing drift gag falls out of this for free.
- Detours may add one temporary fifth meter for their run.

### Decision: first playable version

The first build goes end to end, Stone Age to the far future, with fewer branches and detours. The full timeline has to be playable before it gets wide.

- One route through every shared era, plus at least one late path to an ending.
- A handful of detours and endings to prove the systems; the rest come in later waves.

**The route (locked):** Stone Age → Farming → Bronze → Classical → Medieval → Renaissance → Industrial → Electric → Computing → Robots and AI → Space colonies → Time travel ending. 11 eras on one path.

- **Metal path first:** most familiar to players and most jokes already written. Bio comes in wave 2.
- **The fork still exists:** at Industrial, the bio side is a scientist with a jar of glowing goo who gets politely shown out.
- **Also in the first build:** the pottery ending, the Graveyard of Bad Ideas detour, and the goose dimension.
- **Simulation reveal waits** until both paths exist.
- **Alternatives considered:** bio path first (more original, harder jokes); seven bigger eras (faster, loses specifics like the Renaissance); both paths thin (tests the time-travel bridge early, both halves shallow).

**Card budget (for now; can expand later):** about 55 cards per era, about 650 for the first build.

| Card type | Per era | Why |
|---|---|---|
| Deaths | 8 | 4 meters, each can empty or fill |
| Recurring characters | ~10 | Naysayer, your mother, the advisor, the unexplained animal; 2–3 each |
| Era-specific | ~30 | What makes the era itself; fewer and it repeats within one life |
| Callbacks | ~8 | Ancestors' inventions offered as an answer |
| **Total** | **~55** | × 11 eras ≈ 600, plus ~15 per detour and ~5 per ending ≈ 650 |

For scale: the original Reigns shipped with 700+ cards. The Stone Age sample run so far is about 15.

### Decision: controls and art

- **Controls:** swiping left and right are the only playable actions. No third choice, no dragging.
- **Knock-on (confirmed):** ancestors' inventions can't be dragged, so they appear inside cards instead. A card offers the invention as one of its two answers ("Show him the cave drawing" / "Send him away").
- **Art (Sep 26, Sevaan): flat vector, like Reigns.** This replaces 8-bit pixel art (see the Graveyard).
  - Every picture is built from simple shapes with one hard-edged shadow, with no outlines, gradients or textures.
  - Each character has their own card colour and fills the card edge to edge, with their name under it.
  - Meters are one-colour glyphs that fill from the bottom. Corners are rounded, and weather is drawn as smooth flat shapes.
  - The house style is in `content/art/README.md`.
- **No emoji (Sep 26, Sevaan):** everything on screen is drawn: portraits, meter icons, inventions and interface pieces. Text stays in a readable font.
- **Skies and weather (Sep 26, Sevaan):** the background changes now and then. Each era's sky steps through day, dusk, night and dawn every few cards, and each inventor starts at a different time of day. A card or death can also set a scene with weather on screen: rain, a storm, volcano embers, flames and smoke, stars and fireflies, dust, birds, falling grain. "Centuries pass" is a time-lapse of the new era's skies.
- **Readability (Sep 26, Sevaan asked for a pass):**
  - Text is set in Atkinson Hyperlegible Next, a face drawn for legibility.
  - The question is the biggest text on screen, and it sits directly on its card.
  - Death lines and era intros are upright and full brightness, because they carry the jokes.
  - Nothing a player needs to read is italic, faded or blinking. Secondary text is at least 6:1 contrast.
  - Weather thins out behind words instead of crossing them.

### Decision: era progression (keystones)

Each era ends only when someone invents its keystone. Most lives invent something smaller, and those smaller inventions are the stepping stones to it.

- **Keystones:** one per era, e.g. Stone Age: fire; Farming: the plough; Renaissance: the printing press.
- **Stepping stones:** the keystone needs two or three smaller inventions first (no plough before sharp tools and a tamed animal). Small inventions become ancestors' inventions for the rest of the era.
- **Pacing:** about 3–6 lives per era, so 40–60 lives to reach the ending.
- **Safety net:** if a player is stuck in an era too long, the keystone's odds quietly rise.
- **Transition:** when the keystone lands, a "Centuries pass" card, then your mother's next message in the new era's tech.

### Decision: onboarding, legibility, collections

**Onboarding: the first life is the tutorial.** Scripted, about 8 cards, no tutorial screens.

- Card 1, the guy with the rock, wiggles with a hand hint to teach swiping.
- Each meter lights up the first time it moves, so meters are learned one at a time.
- The tutorial guy dies on card 3 (people die). You die on card 8, guaranteed and funny (meters kill you; death isn't the end).
- Guaranteed first epitaph: "Invented sparks," a stepping stone toward fire. The first death teaches the whole loop. Life 2 is unscripted.

**Legibility:** while dragging a card, dots appear over affected meters. Dot size shows how big the change is, not its direction.

**Collection screens:**

- **The Museum:** every invention. Found ones in full; unfound ones as silhouettes with a hint written by the Naysayer ("Some fool will try to tame a cow. Won't work."). Endings sit behind a locked door: you see how many, not what.
- **The Graveyard:** every death with its epitaph.
- **The Family Tree:** all your lives as one line across history, scrollable back through the dynasty.

### Decision: the advisor's appointments (mid-game hook)

The advisor names three moments, not years, so players always know roughly when he returns and push toward it.

| Where he says it | His line | Where he shows up next |
|---|---|---|
| Stone Age | "I'll see you when someone writes something down." | Bronze Age, once writing exists |
| Bronze Age | "Next time: when the lights come on." | Electric |
| Electric | "Last time: when someone builds a machine to go back." | Time travel ending |

- **He knows your playthrough:** each visit he references things you did, like an invention from three eras ago, or a name for the unexplained animal.
- **He's slightly wrong each time:** wrong name, wrong era, a detail off. It's because he's you, much older, misremembering.
- **Payoff:** in the time travel ending you become him and must say his lines, chosen by swipe. Right lines close the loop cleanly.
- **Paradox ending (new):** scramble his lines and the timeline rewrites itself. Attentive players get the clean loop; everyone else gets the funnier ending.

### Decision: accessibility, cultural care, deeds, sound

- **Accessibility:** autosave after every swipe (interruptions cost nothing); adjustable text size; every meter has an icon and shape, not just a colour; reduced-motion setting; fully one-handed.
- **Cultural care:** on the Polynesian, Chinese, Islamic golden age and Maya routes, jokes target the inventor and the invention, never the culture. A historian or sensitivity reader from each background reviews those cards before they ship (they're a later wave).
- **Era deeds:** three per era: the keystone, a weird side goal ("invent something nobody asked for"), and a secret one. Completing deeds unlocks new cards.
- **Sound:** chiptune that evolves by era: bone flute and drums in the Stone Age, lutes by Medieval, synths by Computing. Your mother has a musical sting that plays every time she appears, in each era's instruments.

### Decision: invention system spec (Kofi)

- **Per era:** 6–8 possible inventions: 1 keystone, 3–4 stepping stones, 2–3 bad ideas (feed the Graveyard of Bad Ideas).
- **Hidden points:** each card answer can add points toward 1–2 inventions. Players never see numbers; Museum silhouettes may glow faintly for inventions they're close to.
- **Tree:** the keystone requires 2–3 stepping stones invented in earlier lives this era; some stepping stones require others.
- **Breakthrough:** certain cards are tagged as the trigger for one invention (the rock guy for sparks). After at least 6 cards in a life, once an invention's points pass its threshold, its trigger becomes eligible. Swipe the matching answer and that's this life's invention.
- **No breakthrough before death:** you invent something anyway, badly. Low points yields a bad idea. Every life ends with an epitaph ("Invented the square wheel").
- **Safety net:** the keystone's threshold drops each life a player is stuck in an era.

### Decision: content authoring format

Writers work in a spreadsheet, one row per card. A script converts it to game data; the content checker runs on the result.

| Column | Holds |
|---|---|
| id, era | Unique card id and its era or detour |
| speaker | Who's asking |
| text | The card's question |
| left answer, right answer | The two answer labels |
| left effects, right effects | Meter changes, flags set, invention points |
| conditions | When it can appear (meters, flags, inventions known, cooldown) |
| weight | How likely it is when eligible |
| trigger for | The invention this card can trigger, if any |

### Decision: house style and tone (Lena)

**Tone: dark comedy, like Reigns.** Deaths can be grim; the joke is always in how absurd or ironic they are.

- **Length:** questions of 25 words or fewer; answers of 5 words or fewer. Readable in one glance on a phone.
- **Real choices:** answers are never "Yes" and "Also yes."
- **One joke per card:** in the question or the consequence, not both.
- **Frequency caps:** your mother at most once per life; the Naysayer at most twice; the advisor only at his appointments; the unexplained animal rare enough to screenshot.

### Era map (working draft)

Stone Age → Farming → Bronze → Classical → Medieval → Industrial, then a hard fork:

- **Metal path:** Electric → Computing → Robots and AI → Space colonies → Time travel.
- **Bio path:** Grown machines → Genetic engineering → Living cities → Time travel.
- **Endings:** time travel leads to the simulation reveal, the true ending. The secret pottery ending branches off Farming (refuse the wheel).
- **Detours** branch off the late eras (table below).

The locked route in "Decision: first playable version" adds the Renaissance between Medieval and Industrial.

Working draft uses the late hard fork: six shared eras, then Industrial locks you onto the metal or bio path. Early choices only flavour eras (soft forks), except the secret pottery ending off Farming. Both paths end at time travel, which bridges them; the simulation reveal sits above it as the true ending. Detours branch off the late eras (table under the brainstorm).

### Future tech brainstorm

Everything the room pitched for the late game. Sorted into full eras, single-run detours and endings in the table below; the map above shows the eras and endings.

**Metal path**

- Robots, then robots that unionize
- AI that runs the government
- Nanotech, space elevators, Dyson spheres
- Mind uploading, where the computer turns out to have ads
- Space travel, then colonies, then aliens
- Aliens who've been watching the whole game and have opinions about your choices

**Bio path**

- Genetic engineering
- Cloning (you finally meet the Naysayer's clones)
- Engineered animals; pets that talk back
- Living cities grown from coral
- Immortality, as a trap ending, since it breaks the reincarnation premise

**Weird and cross-path**

- Interdimensional travel: a portal to a version of Farming where everyone kept the mammoth drawing
- Parallel universes where a past run went differently
- A dimension made entirely of geese
- Weather control, dream tech (inventing in your sleep), teleportation (is it still you?), shrinking tech, gravity manipulation
- Mind-reading, as a social-disaster era
- Invisibility
- Emotional engineering: remove feelings, and the Religion-to-Marketing meter finishes becoming something horrifying

**Endings**

- Time travel as the bridge between metal and bio paths, and the source of the advisor (a future you)
- The simulation reveal: someone builds a computer that can simulate the world and finds out they're in one. It's a card game. Pitched as the true ending, above time travel.
- Pottery ending (secret, from Farming)

**Priority, by vote:** finish the map first (3 votes), meters second (1), name third (1; Priya gets 30 seconds).

### Sorted: eras, detours, endings (Tamsin's draft)

Full eras get a whole deck and meters. Detours are single-run side trips that can branch off a late era. Endings close the game.

| Idea | Bucket | Where it sits |
|---|---|---|
| Electric | Full era | Metal path |
| Computing | Full era | Metal path |
| Robots and AI (robots unionize, AI runs the government) | Full era | Metal path |
| Space colonies (space elevators, Dyson spheres, aliens watching you) | Full era | Metal path, last era |
| Grown machines | Full era | Bio path |
| Genetic engineering (engineered animals, talking pets) | Full era | Bio path |
| Living cities (coral cities) | Full era | Bio path, last era |
| Nanotech | Detour | Metal |
| Mind uploading (the computer has ads) | Detour | Metal |
| Teleportation | Detour | Metal |
| Cloning (the Naysayer's clones) | Detour | Bio |
| Emotional engineering | Detour | Bio |
| Interdimensional travel and parallel universes | Detour | Either path, late |
| Weather control | Detour | Either path |
| Dream tech | Detour | Either path |
| Shrinking tech, gravity manipulation | Detour | Either path |
| Mind-reading (social disaster) | Detour | Either path |
| Invisibility | Detour | Either path |
| Goose dimension | Secret detour | Off interdimensional travel |
| Time travel | Ending | Bridge at the end of both paths |
| Simulation reveal | True ending | Above time travel |
| Immortality | Trap ending | Bio path |
| Pottery | Secret ending | Off Farming |
| Paradox (scramble the advisor's lines) | Ending | Alternative to the clean time travel loop |

### Round 2 brainstorm (not yet on the map)

Joon's note: every detour above was late-game, so this round fills the early and middle eras.

| Idea | Bucket | Where it sits |
|---|---|---|
| Writing | Full era, or folded into Bronze | Shared spine, early |
| Printing press | Full era | Shared spine, between Medieval and Industrial |
| Gunpowder | Full era, or folded into Medieval | Shared spine |
| Navigation and exploration | Full era | Shared spine, middle |
| Renaissance (one guy invents twelve things; the one-invention rule makes him furious) | Full era | Shared spine, middle |
| Steam and trains | Full era | Industrial or early metal path |
| Atomic age | Full era | Metal path |
| Internet, then social media (the Stone Age Tribe meter returns, unchanged) | Full era | Metal path |
| Alchemy | Detour | Early to middle |
| Astrology as a science that almost works | Detour | Early to middle |
| Clockwork automatons in Classical Greece | Detour | Classical |
| Zeppelins, far too early | Detour | Middle |
| Roman steam engine used as a toy | Detour | Classical |
| Magic actually works; nobody invents anything for three centuries | Detour | Any era |
| Cryptocurrency (the Neighbours card returns) | Detour | Computing |
| Cryogenics: freeze yourself, wake in a random later era | Detour | Late, either path |
| Hive minds | Detour | Late, bio |
| Terraforming | Detour | Late, metal |
| Artificial suns | Detour | Late, metal |
| Memory editing (so your mother stops asking) | Detour | Late, either path |
| Singularity | Ending | Metal path |
| Heat death: you invent the last thing | Ending | Very late, either path |
| Ark: everyone leaves Earth, the Naysayer stays | Ending | Space colonies |
| The Naysayer was right | Ending | Any; his one correct prediction ends the game |
| Collapse: everyone forgets, back to rocks; credits over the tutorial guy's temple | Ending | Any |

### Round 3 brainstorm: inventions nobody puts in a museum

Deb's rule for this round: no big sci-fi. Joon's key point: the spine is basically European, and other histories could give the middle eras real branches.

| Idea | Bucket | Where it sits |
|---|---|---|
| Soap, the chair, the sandwich | Everyday inventions (cards or small runs) | Any era |
| The calendar (the first argument about what day it is) | Everyday invention | Farming or Bronze |
| The joke (the Naysayer doesn't get it) | Everyday invention | Stone Age or Farming |
| Money | Social invention | Bronze |
| Laws | Social invention | Bronze or Classical |
| Marriage | Social invention | Farming |
| Democracy (the meters literally vote) | Social invention | Classical |
| Paperwork (outlives every civilization) | Social invention, recurring | Every era after Farming |
| Graveyard of Bad Ideas: square wheel, chocolate teapot, flying machines that need a cliff | Detour | Any era; a failed invention still counts as your one thing |
| Chinese paper and gunpowder | Alternate route | Middle eras |
| Islamic golden age: astronomy and algebra | Alternate route | Middle eras |
| Polynesian wayfinding across open ocean | Alternate route | Middle eras |
| Maya calendar | Alternate route | Middle eras |
| Bureaucracy ending: paperwork becomes sentient and takes over | Ending | Any, late |
| Sandwich ending: the perfect sandwich, and progress stops | Ending | Any |
| Joke ending: someone finally makes the Naysayer laugh | Ending | Any |

## Research: what makes Reigns deep

Reigns gets its depth from a smart deck, not from the swipe. The original shipped 700+ cards, 45 royal deeds and 29 collectible deaths; the sequels layered on items, astrology and card combat.

| Reigns mechanic | How it works | What we take |
|---|---|---|
| Weighted "bag" deck | Before each card, cards that don't fit the current state are removed, recently seen cards are removed, and the rest are weighted. Active events (a war) add heavy cards that crowd out filler. | Each era has its own bag. Inventions, flags and meters filter and weight what you see. |
| Sub-systems | Dungeons and duels lock play into a tiny bag of a few cards; a single-card chain makes a linear scene. | Set pieces: a flood, a plague, a first flight. Same swipe, locked mini-deck. |
| Authored among random | A minority of cards react to past choices, so players read meaning into all of them and invent stories between unrelated cards. | Keep plenty of simple one-shot cards; hide a few callbacks among them. |
| Layered writing | Alliot wrote one-shots first, then short storylines, then add-on characters that permanently add cards, then the Devil meta-story. | Same order for our card-writing pipeline. |
| Royal deeds | 45 objectives; completing them unlocks new cards, and some effects span several reigns. | Era deeds ("invent the wheel without dying") that unlock cards and future eras. |
| Collectible deaths | 29 distinct deaths, tracked in a gallery. | A death gallery per era; death cards are our biggest jokes. |
| Meta-story explains the loop | The Devil plot was added late to justify repeating dialogue and endless new kings. | Our time-traveling advisor (a future you) does this job. |
| Card writing rule | Short direct question, snappy answer, dire consequences; Oulipo-style constraints. | Adopt as house style. |
| Items (Her Majesty) | Five inventory items dragged onto cards; they can bypass the two choices or open new ones, upgrade over time, and are penalized when used randomly. | Ancestors' inventions appear as one of a card's two answers (no dragging; see controls). |
| Reign sign (Her Majesty) | Each monarch gets an astrological sign that unlocks sign-specific events. | Each inventor gets a trait or season that unlocks cards. |
| Card combat (Three Kingdoms) | Characters recruited in runs become units in a four-card battle ring you rotate left or right. | Possible later: wars between civilizations, fought with people you met. |

What critics flagged: repetition over long play, binary choices limiting depth, and meters that felt vestigial once items took over. Changing eras is our built-in answer to repetition.

Sources: [Alliot, Game Developer deep dive](https://www.gamedeveloper.com/design/game-design-deep-dive-creating-an-adaptive-narrative-in-i-reigns-i-) · [Wikipedia: Reigns](https://en.wikipedia.org/wiki/Reigns_(video_game)) · [Reigns Wiki: Royal Deeds](https://reigns.fandom.com/wiki/Royal_Deeds) · [Reigns Wiki: Deaths](https://reigns.fandom.com/wiki/Deaths) · [AppSamurai](https://appsamurai.com/blog/mobile-app-success-story-how-reigns-did-it/) · [GamesBeat: Her Majesty](https://gamesbeat.com/reigns-her-majesty-review-its-a-royal-ball/) · [Gamer Escape: Three Kingdoms](https://gamerescape.com/2024/01/11/review-reigns-three-kingdoms/)

## Engine: build the grammar, then pour in content

The engine knows nothing about cavemen or robots. It knows a small set of building blocks, and every era, detour and ending is data made from them. Adding the goose dimension later means writing a file, not code.

| Building block | What it holds | Example |
|---|---|---|
| Card | Text, speaker, two choices, the effects of each choice | The Naysayer: "Cooking meat? Raw was fine for my father." |
| Condition | When a card may appear: meter ranges, flags, era, inventions known, cooldown | Only if the fire went out |
| Weight | How likely a card is when eligible; active events add heavy cards | War cards crowd out filler until the war ends |
| Meter | Defined per era, not hard-coded; death at empty or full | Stone Age: Tribe, Food, Fire, Gods |
| Flag | A choice remembered across lives | Kept the Naysayer; refused the wheel (count) |
| Invention | Hidden leanings that build over a run; the triggering card; the epitaph; what it unlocks | Art, triggered by scolding the cave-drawing kid |
| Item use | An ancestor's invention offered as one of a card's two answers (no dragging) | The cave drawing dragged onto the farmer |
| Sub-deck | A small locked deck for set pieces and linear scenes | A flood, a first flight |
| Era / detour | Its meters, card pool, entry conditions and exits | Farming unlocks after any Stone Age invention |
| Ending | The conditions that end the whole game, and its final cards | Pottery: refuse the wheel repeatedly |

**Deck selection (from Reigns):** before each card, drop ineligible and recently seen cards, then pick by weight.

**Tooling alongside the engine:**

- **Content checker:** flags broken data, like a card that can never appear or a flag nothing sets.
- **Simulation bot:** plays thousands of runs to show if an era is too easy or deadly, and whether every ending is reachable.

**Build order for the Claude Code handoff:** engine and tooling first, then the Stone Age and Farming content as the first test.

## Recurring characters and running gags

- **The Naysayer.** Shows up in every era to say it'll never catch on. Exactly once in the whole game, he's right.
- **The time-traveling advisor.** Clearly from the future, keeps almost warning you. "Don't do the thing with the... ah, do it. It's funnier."
- **Your mother.** In every era, asking if you're eating.
- **The tutorial guy.** Dies in the first era and is worshipped for the rest of the game.
- **The unexplained animal.** A card with no text, just an animal. You swipe, something happens, it's never explained, in any era.
- **The neighbours.** Another civilization already did the thing, and now everyone is looking at you.

### Arcs across the timeline

Some characters appear every era; others skip eras so their return is an event.

| Character | Appears | Arc |
|---|---|---|
| Your mother | Every era | Same question, new tech: shouted across the cave, then a letter, telegram, phone call, text, and a hologram to your space colony. "Are you eating?" |
| The advisor | Every era, rarer early | Vague and rare at first, more frequent and oddly specific late. In the time travel ending you go back and become him, saying his lines. |
| The tutorial guy | Every era | His shrine grows: temple, cathedral, museum, theme park, statue on Mars. Nobody remembers what he did. |
| The Naysayer | Every era (if kept) | Doubts every era's invention. His one correct prediction is in the Renaissance: the flying machine really doesn't work. |
| The unexplained animal | Every era | The one thing even time travel can't explain. Never revealed. (Priya insists it's a goose.) |
| The Sleeper | Every other era | Keeps napping and waking up centuries later: "What did I miss?" Brief him wrong and he spreads it. |
| The Credit Thief | Every other era | Shows up after your breakthrough; history remembers his name, not yours. Your epitaph notes it. |
| The bartender | Every other era | Same tavern, rebuilt each time (revived from the graveyard bar idea). Knows every past life. Never says how. |
| The comet | Every third era | Returns like clockwork. Each era reads it as a different omen, and the Belief meter swings. |
| The lost invention | Every few eras | Something invented, forgotten, and rediscovered: the Roman steam toy returns as the real steam engine. |

## Cards and death cards

Death cards should carry the biggest jokes, since they end the run.

- "You invented the wheel. It rolled away. You chased it."
- Peer-pressure cards: a rival civilization already has it, and your people want to know why you don't.
- Tech-debt cards: an old invention breaks at the worst moment.
- Same four questions, every era: the joke is that someone uploading a consciousness is still swiping on basically what the caveman was.

## Sample run: Stone Age

About 15 cards. Meters: Tribe, Food, Fire, Gods. Each death leaves one invention behind, and the next inventor finds it and gets it slightly wrong.

1. A guy in a pelt holds up a rock: "If I hit this other rock with it, something happens." Left: send him away. Right: he loses a finger and invents sparks.
2. He's the tutorial guy. He dies on card 3 and the tribe builds temples to him for 10,000 years.
3. Card 4, your mother: "You're up all night staring at that fire. Are you eating?" Left: ignore her, Food drops. Right: you eat, the fire goes out.
4. The tribe asks who let the fire die. You can blame the unexplained animal.
5. Card 6, the Naysayer's debut: "Cooking meat? Raw was fine for my father." Left: banish him, Tribe drops (he's somebody's uncle), and a worse Naysayer arrives next era. Right: he stays, in every era, forever.
6. Card 9, a shaman says the Gods want the sparkly rock. Right: Gods up, but you've given away the flint.
7. Card 12, a kid draws a mammoth on the cave wall. Left: scold him. Right: you've invented art and recordkeeping, and Gods spikes because everyone thinks it's magic.
8. Death: Gods maxes out, the tribe decides you're a god and gives you to the volcano. Death card: "Promoted."
9. Carries forward: the cave drawing. Next era, someone finds it and thinks it's instructions.

## Sample run: Farming era

Meters: Harvest, Village, Priests, The Neighbours.

1. A farmer finds the mammoth drawing and decides it's a planting guide. He plants his field in the shape of a mammoth. Left: burn the drawing. Right: it works, nobody knows why, Priests shoots up.
2. The tutorial guy's temple is now enormous and the priests want it bigger. Right: bigger temple, Harvest drops (the builders were your farmers).
3. If you kept the Naysayer: "Staying in one place? What if the food moves?"
4. Your mother: "All this food and you're still so thin."
5. The Neighbours: the village over has something round they keep rolling around, and everyone's looking at you. Left: wheels are a fad. Right: invent one by Thursday.
6. Someone invents counting to track grain. Right: you've also invented the tax collector, Village drops.
7. Death: you invent the wheel, it rolls away, you chase it downhill into the river.
8. Carries forward: the tax records. Nobody next era knows what they're for, but everyone keeps paying.

## Graveyard

Discarded, but kept in case something here comes back.

**Four layout prototypes (Sep 27), not chosen; The Card was.** Each still plays Aru's life at `prototypes/`.
- **The Notebook:** the inventor's journal. Ruled paper with every line on its rule, a taped-in sketch, a pen that ticks and rings your answer as you drag, the result written in a second ink, and real page turns.
- **Cinema:** the picture fills the screen and the words play like subtitles, with a camera that moves toward the side you choose, a push-in for the reveal, and the epitaph as end credits over black.
- **Chat:** the scene arrives as messages from the speaker, with typing dots. You reply with one of two chips, or swipe one like swipe-to-reply, and your choices stay in the thread.
- **Big Type:** editorial. Huge type, full-width answer rows under a heavy rule that fill with the accent as you drag, and sheets of paper sliding over each other.
- **Worth borrowing later:** Cinema's end credits, the Notebook's second ink for results, and Chat's trail of past choices.

**The Milestone 1 prototype (Sep 26), replaced by the complete script.** Pottery and provisions as two randomized projects, with observations, recipes, a scene scheduler, callbacks by decision three, failed designs, a Danger track that killed at 6, and two legacy packages per invention. Its content is kept in `content/retired/milestone-1/`; its engine is in git history (the commits before "The complete game script"). Its pottery and food drawings live on in C02 and C03.

**Swipe-only answers (Sep 26), replaced by the answers along the card's foot.** Sevaan tried the card with no answer buttons: you dragged it to read each answer and let go to choose. The buttons came back the same day, after swiping turned out not to work on the iPhone (a touch bug, since fixed). Swiping stays as the second way to answer.

**The Reigns-style design (Sep 25–26), replaced by `spec.md`**

- **Four survival meters per era** (Tribe, Food, Gods, Fire and their era renames), with death at either end. Replaced by one visible Danger track.
- **Hidden invention points** that built up from answers, and random trigger cards that offered the breakthrough once points passed a threshold. Replaced by visible observations, recipes and a guaranteed proof scene.
- **Random bad ideas at death** ("Invented the rock pillow"). Replaced by failed designs of the active project.
- **The deck of character portraits** as the main picture. Replaced by the changing object on a workbench.
- **The Family Tree.** Replaced by a causal history of contributions.
- **The first 11-era route** (Stone Age with fire as the keystone, then Farming with the plough). Replaced by the spec's campaign map.
- **The first content:** the fire tutorial, and the Stone Age and Farming decks (about 90 cards).
  - They're in git history, before the "One Bright Idea" commit.
  - Jokes worth salvaging: the mother's "You look like a stick with hair", the Naysayer's Museum hints, "Promoted.", the tutorial guy who dies on card 3, and the rock pillow.
- **The P1–P8 plan-review proposals** under "Pending proposals". The spec settles those questions differently.
- **Dice** (Sep 26, pitched and cut): rolling to choose for the player. The spec cuts dice from the core game.

**8-bit pixel art (the first look, Sep 25–26)**

- The first builds drew every picture as 16- and 24-pixel sprites written as text, one character per pixel from a shared palette, with stepped corners and chunky pixel weather.
- It was cheap to edit from a phone, but it was replaced by flat vector art on Sep 26 after Sevaan saw a mock. Flat art gives the faces room to act, like the mother's raised eyebrow, and room for props.
- The sprites are in git history, before the "Flat art" commit.

**Peterborough, Ontario (the original starting point)**

- 8-bit canoe up the Otonabee; Peterborough Lift Lock as a vertical level.
- Turn-based RPG: overworld of downtown, the Trent canal, Little Lake, the university. Bosses at the Lift Lock, Jackson Park, a Quaker Oats factory level.
- Aliens in Jackson Park; the little park train possessed.
- Swim out to the Little Lake fountain and ride the jet to grab an artifact bouncing on top.
- Roguelike tactics version: city summer student, each run a shift, rehired Monday; geese as a unionized faction. (Rejected.)
- The Lift Lock has been going up for three weeks and nobody has mentioned it.
- X-Files meets Peterborough: two investigators, one believer, one local who just says "yeah, the lights do that." Each run a case file.
- Reigns version: meters Town Trust, Bureau Funding, Weirdness, Cover-up. Death card: "You explained it too well."

**Other swipe concepts**

- Haunted house: families tour you; scare or behave. Meters: Reputation, Structural Integrity, ghost loyalty.
- No meters: swipe to keep or discard cards, building a life out of what you didn't throw away.
- Meters as one body: sleep, money, love, dread.
- Lighthouse keepers: one keeper per run, the ocean playing a longer game.
- A bar: new owner each run, one regular who's always there.
- Tiny ER doctor: treat or send home; the wrong ones come back.
- Border agent: every swipe is a person. Possibly too heavy.
- Cult leader: keep four followers' delusions balanced or it schisms.
- Founder with the idea itself reincarnated across decades, getting closer to real. Bad ending: it works.

**Student-to-founder life sim (dropped from the main game)**

- Start as a student swiping on classes, a friend's project, an internship; choices open doors (found a company, join a startup, take a job).
- Founder meters: Runway, Morale, Investor Faith, Hype (rises for free, makes everything else fall harder), plus a hidden "does the product work" meter.
- The dorm guy in every run, as co-founder or acquirer; dead startups persist in the world; one industry figure who never ages.

## Fresh-eyes review

A new room (Nadia, mobile UX; Theo, systems and balance; Iris, playtester; Sam, producer) read the plan cold. Biggest gap: when the era changes.

- [x] **Era progression (Theo):** as written, each death opens the next era, so 11 eras = 11 lives. Solved: see the keystones decision.
- [x] **Legibility (Iris):** show Reigns-style dots hinting how much each meter will move, so hidden systems don't feel random.
- [x] **Collection screens (Iris):** a museum of inventions found, with silhouettes and hints for the rest; also a death gallery and endings list.
- [x] **Onboarding (Nadia):** the first minute teaches swiping, meters and death with no tutorial. The tutorial guy should literally be the tutorial.
- [x] **Accessibility and mobile (Nadia):** text size, colour-blind-safe meters in 8-bit, resuming after an interruption.
- [x] **Mid-game hook (Sam):** the advisor names a date ("I'll see you in 1969") so players have something to chase, like the Devil's visits in Reigns.
- [x] **Cultural care (Sam):** on the Polynesian, Chinese, Islamic golden age and Maya routes, jokes are about inventing, never about the cultures.
- [ ] **Not designed yet (Theo):** era deeds and sound are now decided; business model is undecided for now (options: premium like Reigns, free demo with unlock, free with ads).

**Keep as is (Iris):** one invention per life, the epitaph reveal, your mother's hologram.

## Open questions

- [ ] Name for the game ("Untitled Swipe Game" for now; shortlist: It'll Never Catch On, One Good Idea, Epitaph).
- [x] Which meters, and how many per era?
- [x] Does the student-to-founder idea become the modern era of the main game, or stay separate?
- [x] What are the extra options beyond left and right, and when do they appear?
- [x] Art style: 8-bit pixel, or something else? (Flat vector, like Reigns.)

## Pinned: visual directions (Sep 26)

Five redesign mockups, put on hold by Sevaan, not decided. The canvas is at https://claude.ai/artifact/K73qthXDFMfK68Pm2S3E4n (private). Each shows the same card and the same death.

1. **Carved:** the interface is made of its era (stone frieze and slabs in the Stone Age; later clay, bronze, vellum, iron, CRT, glass).
2. **Pocket Quest:** a four-tone handheld RPG with a dialogue box and pixel type.
3. **The Exhibit:** a light, editorial history museum with deadpan wall labels.
4. **Arcade Night:** a neon coin-op cabinet.
5. **Chronicle:** an illuminated history book on a leather desk.

Claude's recommendation when they were shown: Carved for play, with The Exhibit's gallery look for the Museum screens.

A sixth mock, a flat Reigns-like version of the current layout, was then chosen as the art style (see "Decision: controls and art").

## Pending proposals

_Superseded by `spec.md` (Sep 26): kept for the record only._

These are the defaults the first build uses where the Decisions above are silent. They come from the Sep 25 plan review (`swipe-game-plan-proposed.md`) and are not approved Decisions yet. Confirm or change each one, or move it to the Graveyard.

- **Dying without a breakthrough (P1):** you get a bad idea related to what your choices leaned toward, never a free stepping stone or keystone. Once all of an era's bad ideas have been used in this timeline, a life can "reinvent" one ("Invented the rock pillow, again"). Reinventions add no Museum entry and count toward nothing.
- **Reveal (P2):** a breakthrough is committed silently. The epitaph reveals it, and only then does it join history for later lives.
- **After the breakthrough (P3):** the life goes on. Points stop counting, trigger cards stop appearing, and a few aftermath cards react to what you made. Dying on purpose after a breakthrough is fine.
- **Fatal breakthrough (P4):** a breakthrough on the swipe that kills you still counts.
- **Era change (P5):** the keystone is revealed at the epitaph, then "Centuries pass", then the next era starts. A keystone needs its named stepping stones from earlier lives in the era, and one life can't supply both.
- **Trigger delivery (P6):** a trigger becomes eligible after 6 or more cards in a life, once an invention's points pass its threshold and its prerequisites are met. It then appears within the next 3 draws. Only one is queued at a time, and the one closest to its threshold goes first. Picking the other answer rules that invention out for the rest of that life.
- **Later:** help for stuck players (P7: better odds toward a missing stepping stone, then a keystone threshold that drops 10% per stuck life, to a 60% floor) and the rules for endings and new timelines (P8).

**Not adopted from the review:**

- Optional on-screen answer buttons. The controls Decision says swipe only; arrow keys work on desktop, for testing.
- A tutorial branch that ends without sparks. The onboarding Decision guarantees sparks.
- A 20–45-word card budget. House style says 25 words per question and 5 per answer.

## Implementation notes

Updated Sep 27 for the complete script.

- **Stack:** plain HTML, CSS and JavaScript modules with no build step. GitHub Pages serves `main` at https://sevaan.github.io/swipe-dynasty/.
- **Content:**
  - `content/script.md` is read by `src/content/script.js`, a line-by-line reader of its headings and bold field labels. It reports errors by line and by chapter, card and field.
  - `src/content/game-content.js` adds `world.json` (era palettes, workbenches, drawings, portraits) and `ui.json` (the interface's words), checks them, and is shared by the browser, the checker and the tests.
- **Engine:** `src/engine/campaign.js`, with no page code.
  - One atomic step per action (choose, continue, offer, redirect, another future), each carrying its turn so a doubled or stale input does nothing.
  - The save follows the script's section 7: the current view, the choices by card id, inventions, legacies, exposure, interests, the route and the proposal order.
  - A reload on a result shows the stored result and never repeats its effects.
- **Saves:** an IndexedDB snapshot with a revision check and the previous one kept, under a new key. Beside it sit the post-C14 checkpoint for "Another future" and the endings seen, which outlive a restart. The old prototype save stays untouched under its old key.
- **Screen:** The Card (Sep 27).
  - `src/ui/table.js` holds the deck and the physics: springs that keep the finger's momentum, a pivot below the card, a 3D turn-over, and cards that slide away. It knows nothing about the story.
  - `src/ui/faces.js` draws every face from the script, world.json and ui.json.
  - `src/ui/app.js` maps each engine view to a step: its deck, its place in the deck and its face. It also runs the actions, saves, and holds the menu.
  - Each life's picture is sized once, from its longest card, so it sits the same on every card of the life.
  - History lists each life's invention, legacy and obituary, and the answers actually chosen.
- **Art:**
  - Each era has a palette, skies and a workbench.
  - C01–C03 have drawn workbench states; the other lives show each state's description as an exhibit label until drawn.
  - People without a drawn portrait get a silhouette in a colour of their own.
  - `tools/art.html` shows it all.
- **Tools:**
  - `tools/check.mjs` checks the content.
  - `tools/simulate.mjs` plays histories.
  - `tools/script.html` and `tools/script.mjs` read the script back for review.
  - `npm test` covers the script's section 16 list.
