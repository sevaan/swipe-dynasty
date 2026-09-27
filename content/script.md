# ONE BRIGHT IDEA
## Complete replacement narrative and implementation handoff

**Version:** 1.0 — 27 September 2026  
**Target:** Claude working in the existing Swipe Dynasty / One Bright Idea proof-of-concept repository  
**Deliverable:** An authored, playable campaign, not a brainstorming backlog  
**Working title:** One Bright Idea  
**Core idea:** Standing on the shoulders of giants. Independent inventors inherit ideas; their inventions outlive them.

> **Instruction to Claude:** Read this entire document before changing the game. Inspect the existing implementation, then replace the proof-of-concept content and adapt its engine to implement this campaign. Preserve functioning mobile interaction, rendering, and useful content tooling where compatible. This document supplies all required story cards, both choices and results, character descriptions, invention records, transitions, callbacks, route offers, and endings. Do not substitute a summary, procedurally paraphrase the dialogue, stop after the opening era, or ask the user to write the remaining content. Build all five routes. Use the deterministic rules below where this script deliberately simplifies the prototype. Do not deploy or change repository access merely because this document says to build the game; follow the user’s instructions in the implementation session.

## 1. What this game is

A mobile-first, two-choice narrative game about the history and possible futures of invention. The opening image is a person striking two stones together while another person shivers. The campaign moves through useful discoveries, machines, electricity, computation and living systems, then follows one of five future projects across four further inventor lives.

The five authored conclusions are:

1. **Simulation — A Spark:** people create an independent simulated universe. Inside it, somebody strikes stones and shares a fire.
2. **Departure — The Distance Between Gardens:** generations make interstellar travel and careful arrival possible. A child on another world handles the old stones.
3. **Great Retirement — Nothing You Have to Do:** essential provision and maintenance no longer require compulsory human work. Someone makes a crooked bowl for pleasure.
4. **First Reply — The Next Bench:** humanity establishes meaningful communication with another civilization. An unfamiliar technical diagram opens a new age of invention.
5. **Unmaking — Nothing Missing:** a voluntary community takes the irreversible step of eliminating wanting itself. Someone notices a mystery and has no urge to investigate. Other communities remain free to continue. This is the end of this historical thread, not compulsory extinction of humanity’s curiosity.

Each ending is a conclusion with emotional meaning, not a grade. There is no secret “correct” route. The player need not be fooled by the simulation ending for it to work.

### Creative commitments

- Inventors are different people, usually separated by generations and sometimes by great distances. They are **not** a dynasty, reincarnations, or the same household in different costumes.
- Relationships are local to a life. What persists is knowledge, tools, institutions, consequences and records.
- One completed contribution per inventor life. The proof occurs on card four. Later cards concern adoption and legacy; they do not grant another invention.
- Collaborators matter. A named inventor identifies the playable point of contribution, not a claim that one genius created a field alone.
- Small human needs drive scenes. Historical significance emerges through consequences.
- Inventions often work and improve lives. Humour is not a rule that every kindness backfires.
- Early technologies are a deliberately compressed fictional sequence, not a documentary chronology. Many real discoveries overlapped, arose independently or predated the milestone represented here. The story acknowledges inherited craft and oral knowledge from its first scene. Do not attach real historical dates or credit these fictional people as actual discoverers.
- The opening uses a suitable spark-making mineral against flint, not a claim that any two rocks make usable fire. Never turn the scene into a survival tutorial.
- Future technologies are speculative narrative inventions. The simulated minds and preference technologies make no claims about current computing or medicine.
- No compulsory goose, omniscient future stranger, hereditary cousin, four resource meters, dice rolls, inventory puzzle, combat or third story choice.
- Do not market the whole world as arbitrarily branching on every swipe. This edition has a shared historical spine, local variants, explicit callbacks, five authored future routes, and one authored redirection.

### Comedy and emotional register

Dry, concrete, humane; occasionally dark. Let practical objections puncture grandeur. Allow a sincere success to remain sincere. Do not add a joke to the final silence of Unmaking or an explanatory speech to the final spark. Early dialogue uses accessible modern English without making every ancient character an office employee. Later people have strange tools but recognizable concerns.

Recurring motifs are authored in the cards: food remaining edible; a container holding more than expected; a useful correction; a copied instruction; a person retaining control over a tool; a spared hour; a message answered after its sender dies. They are not mandatory quips. The rocks and the imperfect bowl are deliberate visual anchors.

## 2. Scope and campaign structure

The complete content is **34 chapters/lives, 204 decision cards, 408 written choice results, 28 conditional callback lines, five route-offer packages, five endings and one redirection card**. There are 14 shared lives and 20 future-route lives (four on each route).

A standard complete playthrough contains 18 lives and 108 decision cards, plus one to four route-selection cards and the ending presentation. The Unmaking-to-Retirement redirection produces 21 lives and 126 decision cards, plus the route offers and redirection. Intro, result panels, invention reveals, epitaphs and end panels do not count as additional decisions.

Treat a 45–80 minute first run as a production estimate, not measured playtime. Reading speed, museum use and accessibility settings will change it. Tune presentation after playtesting; do not cut authored chapters to meet an untested estimate.

### Shared sequence (strict order)

| Chapter | Contribution | Opens the next question |
|---|---|---|
| C01 | Repeatable spark hearth | What can controlled heat do to materials? |
| C02 | Fired vessels | What happens to the food inside them? |
| C03 | Preserved provisions | Can food be prepared across seasons and journeys? |
| C04 | Repeatable cultivation | How does knowledge survive the person who knows? |
| C05 | Durable written instructions | Can separate makers agree on a specification? |
| C06 | Repeatable metal fittings | Can useful instructions be reproduced as reliably? |
| C07 | Printed pages | How do we decide which published claims work? |
| C08 | Reproducible trials | Can heat safely perform sustained mechanical work? |
| C09 | Regulated engine | Can power travel to where it is needed? |
| C10 | Protected electrical lighting | Can an electrical circuit carry a message? |
| C11 | Reliable telecommunications | Can instructions themselves be executed? |
| C12 | Programmable computer | Can a system adapt to an unlisted problem? |
| C13 | Adaptive controller | Can complex services support actual living people? |
| C14 | Regenerative life support | What will future inventors do with these capabilities? |

Each future route then proceeds strictly from chapter 1 to 4: S1–S4, D1–D4, R1–R4, A1–A4 or U1–U4. `A` denotes First Reply; `R` denotes Retirement. After U3, the special redirection can instead start R1. No other route jumps are implied by evocative prose.

### Prerequisites

C01 has no prerequisites. Every later shared chapter requires its immediate predecessor’s completed invention. Every first route chapter requires C14. Each following route chapter requires the preceding chapter on that route. U3-to-R1 is an explicit exception to route commitment, not to the C14 prerequisite. Discovery records remain intact. There are no hidden prerequisites, dice rolls, missing keystone cards or inferred unlocks.

## 3. Life rules — implement exactly

This is an authored story campaign, not a survival-balancing game. Both choices on each card are valid ways forward. Small experiments can fail in the written result; neither option strands the chapter. This is a deliberate replacement of the older random encounter/hidden invention-score loop.

### Six-card rhythm

1. **Opening:** meet the inventor, another person and a practical problem.
2. **Experiment:** try a concrete method.
3. **Complication:** adapt to a technical or human obstacle.
4. **Proof:** demonstrate and permanently commit the single chapter invention.
5. **Adoption:** decide how other people use or access it.
6. **Legacy:** decide what the inventor leaves behind.

After each choice show its written result. Commit state once, then show applicable callback lines. Continue to the next card only when the player dismisses the result. After card four’s result and callbacks, show the invention reveal before card five. After card six’s result and callbacks, conclude the life. Normal lives receive an epitaph; final route chapters go directly to their endings with the inventor still alive.

**All six cards always play.** Do not terminate a life early, skip its adoption, randomize its scenes or simulate unplayed choices. The hazard figures below select an obituary variant after the life, not a mid-card death. This rule supersedes the prototype’s danger threshold and any accidental death-system implication in inherited tooling.

### Experimental exposure (`danger` field)

- Retain `danger` as the internal field name if convenient; it is a small, life-local measure of experimental exposure, not a civilization meter.
- Start at zero each life. After each option, add its printed delta; clamp the result to 0–9.
- After card six: use the risk obituary if exposure is at least **2**, otherwise the natural obituary.
- C01 always uses its natural obituary. S4, D4, R4, A4 and U4 have no death scene regardless of exposure.
- There is no random death chance and no effect on unlocks, invention success or chapter length. Some chapters have no reachable risk obituary. Their risk copy is fallback editorial material; do not manufacture hazards to use it.
- Do not penalize disability, careful checking, consent, refusing treatment, rest, public access or kindness with invented danger. Use only the authored numbers.
- Exposure is not shown numerically in the normal interface. On options that add exposure, a small accessible “Experimental risk” indication is allowed; no unannounced health meter or countdown. The result communicates the experiment itself.

### What a choice changes

Every choice stores its exact card ID and side. It changes its immediate result; some change exposure, some add future-interest affinity, some activate explicit later callbacks, and the sixth changes the life’s legacy wording. Large future branches are selected through the proposals, not secretly chosen by a single ancient decision.

A zero-effect choice still has its two written outcomes. Do not invent a future consequence where none is specified. Conversely, do not discard listed affinity or callback effects as cosmetic.

### Final legacy and obituary

For a normal chapter, show:

- Inventor’s full name.
- `Invented {invention.name}.`
- The selected natural/risk death sentence exactly as authored.
- `legacy.left` or `legacy.right`, selected by that chapter’s **card six** choice.
- A small image of the completed invention and the next-chapter action label **“Someone takes it further”**.

Card five is recorded independently and may trigger a callback. It does not override card six. Where the two differ, card six describes a final act or priority rather than erasing card five’s history. Render both in the museum’s expanded choice record.

Never infer names or family ties. An inventor’s surname is not a lineage mechanic. Character IDs are chapter-local; runtime keys must be `{chapterId}:{castId}` to prevent repeated supporting names from colliding.

## 4. Route selection and interests

The shared cards include small affinity additions under the internal keys:

| Key | Interest, if described to the player | Route |
|---|---|---|
| S | Understanding and modelling | Simulation |
| D | Distance and exploration | Departure |
| R | Time and shared provision | Retirement |
| A | Communication and discovery | First Reply |
| U | Inner experience and relief | Unmaking |

These are not morality scores, locks, resource bars or promises of endings. They rank project proposals after C14. All five routes remain selectable regardless of scores.

**Normalize before ordering.** For each key, compute its maximum possible score across the shared content by summing `max(left.affinity[key] or 0, right.affinity[key] or 0)` over every shared card. Divide the player’s accumulated score by that maximum. Sort descending; break ties by the stable order `S,D,R,A,U`. This avoids burying routes that have fewer written opportunities. The maximum is computed from this content, not hard-coded from an obsolete count.

After C14’s epitaph, save a checkpoint and show the transition narrator **The Archive**:

> “No one inherited all of it. Different people found different uses for what had survived. These are the projects waiting for their next inventor.”

Use the route pitches later in this document. They name immediate projects, not ending spoilers.

### Binary proposal flow

Let the ordered candidates be `[p0,p1,p2,p3,p4]`.

- Offers 0–2 each display that candidate’s title and pitch text, plus `“Will this be the next work?”` Left accepts it using its authored `acceptLabel`. Right is **“Hear another proposal”**.
- On accept, show: **“Elsewhere, someone has already begun.”** Commit `routeId`, then enter that route’s first chapter. The offer is outside an inventor life and contributes no invention.
- On defer, show: **“Another workshop. Another problem worth solving.”** Advance one offer. Do not alter affinity.
- Offer 3 displays the final two candidates with both full pitch texts, separated clearly. Left uses p3’s `acceptLabel`; right uses p4’s `acceptLabel`. The situation heading is **“Two more workshops are waiting.”** Either accepts its candidate; no empty fifth screen.
- Candidate portrait thumbnails are the first chapter’s inventor, not mystery endings.
- No project is locked for being ranked low. Document in the help text: **“Earlier choices suggest projects. You choose which one to follow.”**

Route commitment lasts four lives. The U3 fork is the sole additional exit. Do not ask the player to select a final ending after completing a route; the inventions and final scene deliver it.

## 5. Callbacks, names and presentation data

A callback has `afterCard`, a required previous `{card, side}` and literal text. After the current option result, if the stored previous choice exactly matches, show the callback as one short narrator line. If not, show nothing. A absent choice never defaults to left or right. Multiple matches display in the listed order. Callback text adds no hidden state.

The full callback appendix supplies all 28. Do not splice every historical note into every life. The entry `arrival` already provides the basic connection even when no optional callback matches.

All situation text is shown verbatim in the existing card style. “Speaker” identifies the card’s face/source; some cards are direct dialogue and others describe an encounter in second person, as in the prototype. Do not add quote marks around an entire narrated encounter. Do not have synthetic voice read author metadata. The player is the listed inventor; where their own cast entry speaks, this is their thought or voice.

`bench` contains six visual states corresponding to the six scene positions. They are illustration directions, not extra inventions or choice gates. Before each card show its matching state; after its result make a small state transition consistent with the chosen action. If only one illustration can be made initially, use the invariant physical object with two simple overlays to distinguish the results. Never delay the full narrative implementation because bespoke art is unfinished.

## 6. Interface and exact shared copy

### Title screen

**One Bright Idea**  
*One life. One invention. Someone takes it further.*

Primary action: **Begin**. Existing campaign: **Continue**. Other navigation: **Your history**, **Settings**.

Before C01, show a short framing panel:

> “You will live many lives. You will not live forever. What you make might.”

The next panel is the first card, not a long explanation of simulation theory or all five futures.

First-card helper: **“Swipe left or right to choose. You can also tap either answer.”**  
Second-card helper: **“Your choice changes what happens next. There is no timer.”**  
First invention reveal: **“One bright idea. It will outlive you.”**

### Required interaction

- Two large tappable choices always available; dragging/swiping is optional. No held multi-finger gesture, time pressure or precision-dependent action.
- Left/right arrows choose on keyboard only while a decision card is active. Enter/Space advances a result, arrival, reveal or epitaph. Choices need explicit accessible names.
- A short horizontal swipe commits only past a stable threshold; a cancelled swipe returns to neutral. Avoid changing scroll into a choice when vertical movement dominates. Do not make swiping the only way to play.
- Result view shows chosen label, its full outcome and callbacks. **“Continue”** advances. It is not a third narrative option.
- Disable input while committing; ignore duplicate gesture/click events. Reload resumes the committed result rather than repeating its effects.
- Result text does not auto-dismiss. Portrait and bench animation may continue gently; reduced-motion mode uses immediate state changes.
- Honour narrow screens, dynamic text size, colour contrast and screen readers. Minimum comfortable tap target: 44 CSS pixels; prefer larger. Do not hide story text behind hover.
- Keep **History** and **Settings** as navigation controls outside the choice row. Opening/closing them does not affect state.

### Life entry panel

`{inventor.name}`  
`{inventor.role}`  
`{era}`  
`{arrival}`

Then a separate short intent line: **“You want: {inventor.want}”**. Button: **“Begin this life”**. Use each exact written want; do not generate a new biography.

### Proof reveal

**“An idea becomes something.”**  
`{invention.name}`  
`{invention.description}`  
Button: **“See what people do with it”**.

### Between-life rhythm

Fade the portrait to an object, then reveal the epitaph. The next portrait must differ visibly in face, dress or setting. Do not imply that a child inherited their parent’s role. Transition direction is the archive moving through time, not a family tree.

### Museum / Your history

Use a chronological collection of completed invention objects, with inventor name, era, invention description, selected legacy and the actual choices made. Living final inventors have **“The work continues”**, not an invented obituary. Future/unseen inventions remain unlisted so the museum does not spoil the routes. Expose all content only in developer tools.

Empty history: **“Nothing here yet. Start with a spark.”**

### Settings and end controls

Settings labels: **Text size**, **Reduce motion**, **Sound**, **Restart this history**. Sound is optional and off until user interaction; never make it the carrier of crucial information.

Restart confirmation: **“Start again from the first spark? Your ending collection will remain.”** Choices **“Keep this history”** / **“Start again”**.

After the end panels and branch variant, credits text is:

> “One Bright Idea”  
> “A game about what we leave for each other.”  
> “Thank you for playing.”

Then actions: **“Another future”**, **“Start from the first spark”**, **“Your history”**. These are navigation, not story choices.

“Another future” restores the saved post-C14 checkpoint, clears all route-local choices/inventions/exposure, retains the shared history exactly, and reopens all five proposals. The meta collection of endings already seen persists. Do not carry future-route inventions into an earlier branch. The live U3-to-R1 redirection is different: it deliberately preserves U1–U3 within that history.

## 7. State model and conversion contract

Use the existing framework and data loader where possible. The public script export inspected for this handoff used `content/world.json`, CSVs for characters/projects/inventions/legacies/failures/deaths, scene CSVs, `src/content/load-web.js`, and `tools/script-text.js`. That is evidence about the supplied export, not a claim to have audited the user’s current checkout. Inspect before changing. An explicit JSON campaign format may be simpler than stretching randomized-project semantics. Choose one authoritative content source and derive export views from it.

Minimum persistent state:

```ts
type Side = 'left' | 'right';
type Route = 'simulation' | 'departure' | 'retirement' | 'reply' | 'unmaking';
type AffinityKey = 'S' | 'D' | 'R' | 'A' | 'U';
type View = 'intro' | 'arrival' | 'choice' | 'result' | 'reveal'
  | 'epitaph' | 'proposal' | 'redirect' | 'ending' | 'credits';
interface CampaignSave {
  schemaVersion: 1;
  contentVersion: 'obi-script-1.0';
  chapterId: string;
  cardIndex: number; // 0..5
  view: View;
  choices: Record<string, Side>;
  inventions: Record<string, {
    chapterId: string; inventorName: string; committedAtCard: string;
  }>;
  legacies: Record<string, Side>;
  lifeExposure: number;
  affinity: Record<AffinityKey, number>;
  route: Route | null;
  proposalOrder: Route[];
  proposalIndex: number;
  pendingResultCard: string | null;
  endingPanelIndex: number;
  redirectedFromUnmaking: boolean;
}
```

Keep settings, the post-C14 checkpoint and `endingsSeen` separately. A result’s chosen side comes from `choices[pendingResultCard]`, never from a newly evaluated input. IDs with periods are literal strings, not object paths.

### Choice transaction

1. Require `view === 'choice'` and no existing choice for the current card. Reject duplicate events.
2. Atomically record the side; apply its exposure delta and affinity additions once.
3. If card number is four, add this chapter’s invention if absent. Never duplicate it.
4. If card number is six, store its side as this chapter’s legacy.
5. Set `pendingResultCard`, set view to result, persist.
6. Render exact result plus eligible callbacks. These reads cause no state mutation.
7. On result Continue: card four enters reveal; card six enters epitaph or final ending; other cards advance. Reveal Continue advances to card five. Normal epitaph Continue advances to next chapter, post-C14 proposals or the post-U3 redirect.
8. On chapter entry reset exposure and card index, set arrival view. Do not reset global choices, inventions or affinity.

Proposal and redirect decisions also need persistent IDs: `OFFER.0` to `OFFER.3`, and `REDIRECT.U3`. They grant no invention and have no affinity/exposure. Store their result before transitioning so reload cannot accept two projects.

### Content records

The script chapters below fully define the following shape. Readable labels do not replace the IDs.

```ts
interface StoryOption {
  label: string;
  result: string;
  danger: number;
  affinity?: Partial<Record<AffinityKey, number>>;
}
interface Card {
  id: string;
  speaker: string; // local cast ID
  text: string;
  left: StoryOption;
  right: StoryOption;
}
interface Chapter {
  id: string; title: string; era: string; arrival: string;
  inventor: { name: string; role: string; want: string };
  cast: { id: string; name: string; description: string }[];
  invention: { id: string; name: string; description: string };
  bench: string[]; // exactly six
  cards: Card[]; // exactly six
  legacy: { left: string; right: string };
  death: { natural: string; risk: string };
}
```

Global speaker `archive` has display name **The Archive**, description **“A spare framing voice connecting independent lives; never claims to know the player’s unchosen future.”** Use it for proposals, the U3 redirect and shared UI only.

No live language model, API key, network-dependent story generation or procedural paraphrasing is needed. The full script must function after its assets load. Write schema validation errors that identify the exact chapter/card/field.

### Existing saves

Do not silently interpret old prototype saves as this campaign. Keep them under their old storage key. If an old save exists, present: **“A new history begins with a spark. Your earlier prototype save will be kept separately.”** Button **“Begin the new history”**. Use a new versioned key. No bulk deletion of local storage.

### Content-authoring output

Keep the script-export page useful: list chapters, conditions, both results, exact effects, callbacks and endings from the same authoritative files the game reads. No second handwritten copy that drifts. Add filters for shared spine and each future route, plus an all-content view for reviewing the complete script. Story IDs can appear in this developer tool, never on the normal player card.

## 8. Reading the complete script

Everything from the next section through the callback appendix is production copy unless labelled a visual direction, effect, prerequisite, author note, cast description or internal ID. Do not display implementation fields to the player.

Within each card:

- **Situation** is the card text.
- **Left/Right** are the exact answer labels.
- **Result** is shown only after choosing that side.
- **Effects** lists the authored exposure and affinity changes; storing the choice and advancing according to the six-card rules is automatic.
- The chapter’s fourth card commits the listed invention on either side. Do not add a separate recipe test.

The era labels convey setting, not a scientifically exact universal chronology. An arrival may jump centuries. Show that phrase rather than inventing a numerical date.



# 9. Complete shared campaign


## C01 — A Little Warmth

**Era:** First hearths  
**Prerequisite:** None; campaign opening  
**Inventor:** Aru — A cold, persistent experimenter  
**Personal want:** Keep Iri warm through the night.

**Arrival:** It’s a cold evening, long before anyone wrote anything down. People already use stone tools and share what they know. You’re trying to make fire whenever you need it.

**Single invention:** `c01-invention` — **A repeatable spark hearth**  
A way to make fire on purpose: the right pair of stones, dry grass to catch the spark, and a sheltered spot for the flame.

### Cast

- `iri` — **Iri:** A companion with dry timing and a wet blanket.
- `aru` — **Aru:** The inventor; thought captions, not a narrator pretending to be a companion.

### Workbench progression

1. Two distinct stones; grass
2. A dark flint edge and mineral nodule
3. Fine dry fibres beneath a spark
4. A small protected flame
5. Two hearths or an ember carrier
6. A pair of stones beside a warm hand

### C01.1 — Opening

**Speaker:** Iri (`iri`)

**Situation:** You strike two stones together. A spark lands in the grass and disappears. Behind you, someone is trying not to shiver.

**Left: Strike closer to the grass**  
**Result:** You kneel and strike right above the grass. This time the spark lands still glowing. Iri kneels too, as if it was their idea.  
**Effects:** experimental exposure unchanged.

**Right: Find drier grass to catch it**  
**Result:** You pull dry grass apart into soft, fluffy strands. Iri finds the only dry scraps left on a wet night.  
**Effects:** experimental exposure unchanged.


### C01.2 — Experiment

**Speaker:** Iri (`iri`)

**Situation:** Most stones just chip. But one gold-flecked lump makes bright sparks when you strike it against a sharp flint. Iri sorts your pile into stones that work and stones that only hurt your hands.

**Left: Keep the pair that sparks best**  
**Result:** You keep the sharp flint and the gold-flecked lump. The useless stones become something to sit on.  
**Effects:** experimental exposure unchanged.

**Right: Test every pair, one by one**  
**Result:** By sunset you know exactly which pair works. Iri now has an opinion about every stone in the valley.  
**Effects:** experimental exposure unchanged.


### C01.3 — Complication

**Speaker:** Iri (`iri`)

**Situation:** The grass glows, then goes out. Iri blows on it hard and nearly scatters the whole pile. It’s getting colder.

**Left: Blow on it gently**  
**Result:** You blow softly and the glow spreads. Iri watches it the way a hungry person watches dinner cook.  
**Effects:** experimental exposure unchanged.

**Right: Build a wind shelter first**  
**Result:** You stack stones into a low wall to block the wind. Behind it, the next ember has time to grow into a flame.  
**Effects:** experimental exposure unchanged.


### C01.4 — Proof

**Speaker:** Iri (`iri`)

**Situation:** Finally, a flame. Then you let it go out on purpose. Iri stares at you like you’ve thrown away the sun. Now you have to prove you can make fire again.

**Left: Repeat the same steps**  
**Result:** Stone, spark, grass, breath. A second flame appears. Now, if the fire goes out, you know how to bring it back.  
**Effects:** experimental exposure unchanged.

**Right: Let Iri try your method**  
**Result:** Iri complains about your explanation, fixes your grip, and makes fire anyway. It works even when you’re not the one holding the stones.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `c01-invention` after its result transaction. Show the invention reveal before C01.5.


### C01.5 — Adoption

**Speaker:** Iri (`iri`)

**Situation:** The others show up with wood, food and excuses for not helping earlier. One child has never been warm after dark before. They sit very close to the fire.

**Left: Teach someone to build a fire**  
**Result:** By nightfall, two fires are burning. You can’t watch both, and you don’t have to: someone else knows how now.  
**Effects:** experimental exposure unchanged; A affinity +1.

**Right: Make a way to carry embers**  
**Result:** You make a lined bark carrier for hot embers. Someone carries the warmth into the dark to fetch a friend who stayed home.  
**Effects:** experimental exposure unchanged; D affinity +1.


### C01.6 — Legacy

**Speaker:** Iri (`iri`)

**Situation:** Iri isn’t shivering anymore. Just outside the firelight, someone is practising the striking motion with empty hands. There’s time tonight to teach one more thing.

**Left: Show how to relight it**  
**Result:** You put out a small flame, then bring it back. The person watching starts copying your hands.  
**Effects:** experimental exposure unchanged; S affinity +1.

**Right: Show how to carry it**  
**Result:** You wrap up an ember and walk into the dark together. Behind you, the first fire shrinks to a small, steady light.  
**Effects:** experimental exposure unchanged; D affinity +1.

### Closing record

**If card six was left:** Aru taught people how to relight a fire that went out. The lesson spread farther than the heat ever could.

**If card six was right:** Aru found a way to carry fire. People could leave the hearth and still stay warm.

**Natural obituary:** Aru died many winters later. That evening, someone else tended the fire.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## C02 — Something That Holds

**Era:** Early settlements  
**Prerequisite:** c01-invention  
**Inventor:** Bel — A water carrier with a bad back  
**Personal want:** Bring water home without making six journeys.

**Arrival:** Aru’s way of making fire outlived Aru. Generations later, in another village, fire is so ordinary that Bel complains nobody uses it properly.

**Single invention:** `c02-invention` — **Fired vessels**  
Clay that’s shaped, dried and fired until it’s hard enough to hold water.

### Cast

- `ves` — **Ves:** A neighbour who will use the result and refuses decorative handles.
- `bel` — **Bel:** A practical maker with an experimental streak.

### Workbench progression

1. Leaking basket
2. Clay lining or clay bowl
3. Cracked trial pieces
4. Intact fired vessel
5. Household pots or communal jar
6. A measuring notch on a pot

### C02.1 — Opening

**Speaker:** Ves (`ves`)

**Situation:** You carry water home in your best basket, but most of it leaks out on the way. Ves holds up the dripping basket and asks if the river could just move closer.

**Left: Line the basket with clay**  
**Result:** The clay lining holds a little water, if you walk very slowly. Ves walks home as carefully as someone leading a parade.  
**Effects:** experimental exposure unchanged.

**Right: Shape a bowl from clay**  
**Result:** The clay bowl holds water, right up until you lift it. Ves suggests inventing a river that comes to the kitchen instead.  
**Effects:** experimental exposure unchanged.


### C02.2 — Experiment

**Speaker:** Ves (`ves`)

**Situation:** Dried clay seems hard, but rain turns it back into mud. Then you notice a piece that fell near your fire. It has changed colour, and water won’t soften it.

**Left: Heat small test pieces**  
**Result:** You set small clay pieces at different distances from the fire. Ves scratches a mark on each one, and a warning next to the hottest.  
**Effects:** experimental exposure unchanged.

**Right: Build a small stone oven**  
**Result:** The stones trap the heat. It singes your eyebrows, but the clay inside comes out hard.  
**Effects:** experimental exposure +1.


### C02.3 — Complication

**Speaker:** Ves (`ves`)

**Situation:** Your first pot cracks apart. The thick bottom stayed wet while the thin top dried too fast. Ves says you’ve invented two pots with no bottoms.

**Left: Dry it more evenly**  
**Result:** You dry the next pot slowly in the shade, turning it for days. Ves waits, still carrying water the old way.  
**Effects:** experimental exposure unchanged.

**Right: Make the walls the same thickness**  
**Result:** You reshape the pot until the walls are even. It looks plainer, but it doesn’t crack.  
**Effects:** experimental exposure +1.


### C02.4 — Proof

**Speaker:** Ves (`ves`)

**Situation:** The next pot rings when you tap it. You fill it with water at sunset. At sunrise the water is still there, and Ves has brought a friend to see it.

**Left: Carry it home**  
**Result:** Ves gets home with dry feet and a full pot. For once, all the water makes it.  
**Effects:** experimental exposure unchanged.

**Right: Leave water in it another day**  
**Result:** The water level barely drops. You scratch a line at the waterline, and realise a pot can measure things too.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `c02-invention` after its result transaction. Show the invention reveal before C02.5.


### C02.5 — Adoption

**Speaker:** Ves (`ves`)

**Situation:** Now everyone wants a pot. Your oven can make lots of small ones for families, or one huge jar for the whole village to share. Either way, people will need to gather firewood.

**Left: Make pots for every home**  
**Result:** Every home gets its own pot, each a slightly different shape. One family asks for a lid. Another family asks the first to stop asking for things.  
**Effects:** experimental exposure unchanged; R affinity +1.

**Right: Make one big jar to share**  
**Result:** The big jar fills up. People gather around it to chat, and start the first argument about whose turn it is to clean it.  
**Effects:** experimental exposure unchanged; A affinity +1.


### C02.6 — Legacy

**Speaker:** Ves (`ves`)

**Situation:** Ves can finally carry a whole day’s water in one trip. Someone asks if a pot could store grain too. You look at the damp inside and aren’t sure.

**Left: Leave a pattern others can copy**  
**Result:** You scratch the pot’s measurements into a clay tile. Years later, someone mistakes the tile for a very disappointing plate.  
**Effects:** experimental exposure unchanged; S affinity +1.

**Right: Leave one great jar for everyone**  
**Result:** You make one last giant jar for the village. People use it long after you’re gone, and keep finding new things to put in it.  
**Effects:** experimental exposure unchanged; R affinity +1.

### Closing record

**If card six was left:** Bel left a simple pot anyone could copy. No two copies matched, but they all held water.

**If card six was right:** Bel left a giant jar everyone could share. Soon people had to agree whose water was whose.

**Natural obituary:** Bel lived long enough to complain about newer pots. They were lighter, which Bel found suspicious.

**Risk obituary (exposure ≥ 2):** Years of working beside hot ovens shortened Bel’s life. Ves kept the best pots and built a safer oven.


## C03 — Dinner, Later

**Era:** Stored harvests  
**Prerequisite:** c02-invention  
**Inventor:** Neri — A seasonal food gatherer  
**Personal want:** Keep enough food for a friend returning after winter.

**Arrival:** Bel’s pots, and copies of them, spread far. Neri has one. It holds food well. Sadly, it holds rotten food just as well.

**Single invention:** `c03-invention` — **Preserved provisions**  
Food that’s dried or salted, then sealed in dry pots so it lasts for months.

### Cast

- `tal` — **Tal:** A traveller who promises to return and would prefer not to starve upon arrival.
- `ada` — **Ada:** An experienced food preparer, amused that observations are now experiments.

### Workbench progression

1. Mouldy grain in a pot
2. Thin strips or salt bed
3. Covered drying rack
4. Dry sealed stores
5. Shared pantry or journey packs
6. Winter jar with a return mark

### C03.1 — Opening

**Speaker:** Tal (`tal`)

**Situation:** Tal is leaving after the harvest and won’t be back until the snow melts. You promise Tal a welcome-home meal. But your stored food keeps rotting. You can smell it from the doorway.

**Left: Slice the food thinly**  
**Result:** You cut the food into thin strips, and Ada spreads them out to dry. You admit one big damp pile was a bad idea.  
**Effects:** experimental exposure unchanged.

**Right: Try the traders’ salt**  
**Result:** The salt draws the water out of the food. Tal tastes a piece, then drinks a whole pot of water.  
**Effects:** experimental exposure unchanged.


### C03.2 — Experiment

**Speaker:** Ada (`ada`)

**Situation:** Food dried in the open air lasts longer. But birds have noticed, and they keep stealing pieces. This food is for Tal, not the birds.

**Left: Cover the drying rack**  
**Result:** A loose woven cover lets air in and keeps beaks out. The birds peck at it for a while, then give up.  
**Effects:** experimental exposure unchanged.

**Right: Dry it above gentle smoke**  
**Result:** The smoke keeps birds away and adds flavour. But the rack gets too hot, and you move it just before your dinner catches fire.  
**Effects:** experimental exposure +1.


### C03.3 — Complication

**Speaker:** Ada (`ada`)

**Situation:** A sealed jar smells even worse than an open one. Ada breaks up the food inside, and it’s still damp. The jar isn’t the problem. The wet food is.

**Left: Dry the food before sealing**  
**Result:** You let the next batch dry all the way before sealing it. It’s less exciting than inventing a better lid, but it works.  
**Effects:** experimental exposure unchanged.

**Right: Salt, drain, then store it**  
**Result:** You salt the food, pour off the salty water, then pack it. This time the lid seals in good food, not a wet mess.  
**Effects:** experimental exposure unchanged.


### C03.4 — Proof

**Speaker:** Tal (`tal`)

**Situation:** Winter ends. Tal comes back thinner, carrying a gift wrapped in leaves. You open the jar you saved for Tal. It smells like food, not rot. Nothing has ever smelled better.

**Left: Cook a meal for everyone**  
**Result:** The stored food becomes dinner. Tal eats slowly, then asks if there’s any more. For once, you can say yes.  
**Effects:** experimental exposure unchanged.

**Right: Compare it with fresh food**  
**Result:** Ada compares the stored food with fresh food. You note the differences and throw out the spoiled test batches without tasting them.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `c03-invention` after its result transaction. Show the invention reveal before C03.5.


### C03.5 — Adoption

**Speaker:** Ada (`ada`)

**Situation:** The method works. Before next winter, there’s time for one plan: teach the village and fill a shared pantry, or pack food for travellers. Ada wants both, eventually.

**Left: Teach everyone and share the food**  
**Result:** Families bring food and learn how to preserve it. People who had nothing to bring get fed too. Nobody has to earn a winter meal.  
**Effects:** experimental exposure unchanged; R affinity +1.

**Right: Pack food for travellers like Tal**  
**Result:** Tal leaves with food that will last the trip. Along the way, people ask about the empty jars, and Tal explains how the food was kept.  
**Effects:** experimental exposure unchanged; D affinity +1.


### C03.6 — Legacy

**Speaker:** Tal (`tal`)

**Situation:** Tal lays a smooth stone beside the first winter jar. The stone comes from farther away than you’ve ever walked. Your food made Tal’s trip home possible.

**Left: Save food for the whole village**  
**Result:** Soon there are many jars like it. Children grow up thinking winter meals are normal. That’s exactly what you wanted.  
**Effects:** experimental exposure unchanged; R affinity +1.

**Right: Save food for the next journey**  
**Result:** You mark a jar with the day of Tal’s next trip. Now Tal’s promise to return comes with food for the road.  
**Effects:** experimental exposure unchanged; D affinity +1.

### Closing record

**If card six was left:** Neri left a winter pantry that everyone refilled together. The village learned to plan past tomorrow.

**If card six was right:** Neri left packs of food for travellers. Long journeys became something you could prepare for.

**Natural obituary:** Neri welcomed Tal home many times. At the last meal, nobody mentioned how afraid everyone once was of winter.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## C04 — Next Season

**Era:** Cultivated fields  
**Prerequisite:** c03-invention  
**Inventor:** Eda — A gatherer watching the paths change  
**Personal want:** Bring reliable food closer to a household that cannot travel far.

**Arrival:** Stored food means people can afford to wait for things to grow. Eda notices food plants sprouting by the path, where a sack of seeds spilled last year.

**Single invention:** `c04-invention` — **A repeatable cultivation cycle**  
Choosing good seeds, planting them, caring for the crop, and saving seed for next year.

### Cast

- `sen` — **Sen:** A household member with limited mobility and excellent observational skills.
- `oma` — **Oma:** A neighbour who understands that land is never as empty as it looks.

### Workbench progression

1. Seeds on a path
2. Two small test gardens
3. Water channel or scrap-covered soil
4. Harvest with reserved seed
5. Shared plots or seeds to test
6. Seed pouch and planting record

### C04.1 — Opening

**Speaker:** Sen (`sen`)

**Situation:** The plants beside the path grew from spilled seeds. Sen has watched them for weeks. Meanwhile, you’ve been walking right past them, carrying food from much farther away.

**Left: Plant close to the house**  
**Result:** You plant right by the house. Sen can reach the plants from the doorway, and notices every small change, every day.  
**Effects:** experimental exposure unchanged.

**Right: Plant beside the old spill**  
**Result:** You plant where the spilled seeds already grew well. Sen asks you to report what you actually see, not just hopeful guesses.  
**Effects:** experimental exposure unchanged.


### C04.2 — Experiment

**Speaker:** Oma (`oma`)

**Situation:** Oma’s animals have always grazed where you planted. Everyone knew it, though nobody ever said so. Now your neat rows are in the way. The plants are doing very well.

**Left: Share the land by season**  
**Result:** You and Oma agree on a season for crops and a season for animals. It’s not perfect, but now everyone knows the rule.  
**Effects:** experimental exposure unchanged.

**Right: Choose a smaller unused patch**  
**Result:** You move to a smaller, unused patch. The harvest will be smaller, but you spend your time comparing seeds, not arguing over land.  
**Effects:** experimental exposure unchanged.


### C04.3 — Complication

**Speaker:** Sen (`sen`)

**Situation:** The rain doesn’t come, but the plants near where you wash stay greener. Sen says the crops need water more than they need you talking to them.

**Left: Build a shallow water channel**  
**Result:** You dig a channel to lead water to the roots. It works too well. Sen blocks it just before the field floods.  
**Effects:** experimental exposure +1.

**Right: Cover the soil with plant scraps**  
**Result:** The soil under the scraps stays damp longer. It looks messy. You explain, very confidently, that the mess is on purpose.  
**Effects:** experimental exposure unchanged.


### C04.4 — Proof

**Speaker:** Sen (`sen`)

**Situation:** The plants give you a real harvest. To grow more next year, you must save some seeds instead of eating them. Sen ties the seed pouch shut with a very firm knot.

**Left: Save the healthiest seeds**  
**Result:** You save the healthiest seeds for next season. Dinner is a little smaller tonight, but next year’s crop should be better.  
**Effects:** experimental exposure unchanged.

**Right: Save a mix of different seeds**  
**Result:** You keep several kinds of seed apart. Next season each kind grows differently, which teaches you more than one lucky crop could.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `c04-invention` after its result transaction. Show the invention reveal before C04.5.


### C04.5 — Adoption

**Speaker:** Oma (`oma`)

**Situation:** Other families want land and seed. You can set up shared plots, or hand out different seeds to test in different places. Oma offers to keep the animals out either way.

**Left: Share plots and planting knowledge**  
**Result:** People work beside one another. Sen teaches from a stool at the field edge, where the best arguments now happen.  
**Effects:** experimental exposure unchanged; R affinity +1.

**Right: Hand out different seeds to test**  
**Result:** Each kind of seed does best in different ground. People bring back seeds to compare, sometimes with every kind mixed up in one sack.  
**Effects:** experimental exposure unchanged; S affinity +1.


### C04.6 — Legacy

**Speaker:** Sen (`sen`)

**Situation:** The old gathering path is still there. But this season, nobody in your household had to walk it hungry. Sen asks what you should leave for the next people who farm here.

**Left: Leave a shared planting calendar**  
**Result:** The calendar follows the seasons, not whoever is in charge. Nobody can control the rain, but now people get ready before it comes.  
**Effects:** experimental exposure unchanged; R affinity +1.

**Right: Leave seeds and simple drawings**  
**Result:** Simple drawings and matching tokens show which seed is which. Future farmers get several kinds to try, though a lot still needs explaining out loud.  
**Effects:** experimental exposure unchanged; S affinity +1.

### Closing record

**If card six was left:** Eda left fields that several families farmed together. The harvest became everyone’s job, and everyone had opinions.

**If card six was right:** Eda left several kinds of seed, with drawings and matching tokens. One bad season could no longer ruin everything.

**Natural obituary:** Eda died after a harvest they no longer had to travel for. Sen’s seed markings stayed in use.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## C05 — Someone Must Remember

**Era:** Recorded knowledge  
**Prerequisite:** c04-invention  
**Inventor:** Tavi — A storekeeper with an unreliable memory  
**Personal want:** Keep a deceased teacher’s methods from disappearing.

**Arrival:** Tavi’s teacher at the village storehouse has died. The teacher knew every method exactly and shared them freely. But it was all in their head.

**Single invention:** `c05-invention` — **Durable written instructions**  
Written marks that teach a method, even when the teacher isn’t there.

### Cast

- `rin` — **Rin:** A learner who interprets instructions exactly as written.
- `tavi` — **Tavi:** A storekeeper trying to preserve more than quantities.

### Workbench progression

1. Clay tally marks
2. Symbols with a key explaining them
3. Misread instruction tile
4. A procedure followed correctly
5. Public copies or a cared-for archive
6. Teacher’s correction preserved

### C05.1 — Opening

**Speaker:** Rin (`rin`)

**Situation:** Your tally marks tell you how many jars are left. But you can’t remember how your teacher sealed them so the food stayed good. Rin asks if marks could record that too.

**Left: Draw a picture of each step**  
**Result:** The pictures show the steps in order. Rin can make out the jar, the seal on top and what seems to be an angry fish.  
**Effects:** experimental exposure unchanged.

**Right: Give each step its own sign**  
**Result:** You teach Rin a small set of signs, one for each step. Signs are quicker than pictures, and nobody has to judge your drawing.  
**Effects:** experimental exposure unchanged.


### C05.2 — Experiment

**Speaker:** Rin (`rin`)

**Situation:** Rin follows your marks and adds water before drying the grain. Your teacher never said not to. Your teacher also never expected anyone to do this.

**Left: Write the missing step**  
**Result:** You add a clear step about drying. The instructions get longer, but more useful. Rin complains that useful always seems to mean longer.  
**Effects:** experimental exposure unchanged.

**Right: Show what each stage looks like**  
**Result:** A drawing shows the grain at each stage. Rin points to the damp one and says the mistake was quite understandable.  
**Effects:** experimental exposure unchanged.


### C05.3 — Complication

**Speaker:** Rin (`rin`)

**Situation:** Two of your marks look almost the same. One means heat gently. The other means fill to the top. Rin mixes them up, and the pot boils over onto the table.

**Left: Make the two marks look different**  
**Result:** You redraw the two marks so they look nothing alike. Now Rin can tell them apart even in dim light, which is when most mistakes happen.  
**Effects:** experimental exposure unchanged.

**Right: Add a key explaining each mark**  
**Result:** The key goes with every copy. Readers guess less, but a few more pots boil over while they learn. Rin can’t blame the marks anymore.  
**Effects:** experimental exposure +1.


### C05.4 — Proof

**Speaker:** Rin (`rin`)

**Situation:** You leave the room. Rin follows the new instructions without asking you anything. When you come back, a sealed jar sits on the table, and this time the table is fine.

**Left: Ask Rin to teach another reader**  
**Result:** Rin passes the marks to a new reader, who gets it right too. Your teacher’s method has spread without you saying a word.  
**Effects:** experimental exposure unchanged.

**Right: Ask for a written correction**  
**Result:** Rin adds a note about one tricky step. The method gets better, even if that means admitting your teacher wasn’t perfect.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `c05-invention` after its result transaction. Show the invention reveal before C05.5.


### C05.5 — Adoption

**Speaker:** Rin (`rin`)

**Situation:** People want copies. You can put the instructions somewhere public, or train keepers to protect and explain them. Either way, Rin insists, learning can’t be just for certain families.

**Left: Let anyone copy the instructions**  
**Result:** The marks spread far beyond the storehouse. Someone writes down a recipe. Someone else writes a complaint about it.  
**Effects:** experimental exposure unchanged; A affinity +1.

**Right: Build an archive with trained readers**  
**Result:** The archive keeps every version and trains new readers. Its first rule is that anyone can walk in and learn.  
**Effects:** experimental exposure unchanged; S affinity +1.


### C05.6 — Legacy

**Speaker:** Rin (`rin`)

**Situation:** You find your teacher’s old practice jar. Its two different seals show that your teacher changed methods. Rin asks if that change belongs with your new instructions.

**Left: Copy it into the public instructions**  
**Result:** The teacher’s correction goes out with every copy. Strangers will see that changing your mind can be part of knowing something.  
**Effects:** experimental exposure unchanged; A affinity +1.

**Right: Keep it with the original records**  
**Result:** Readers can see how the method got better over time. The archive remembers the teacher, not just the finished instructions.  
**Effects:** experimental exposure unchanged; S affinity +1.

### Closing record

**If card six was left:** Tavi left instructions anyone could copy. The old teacher gained students they would never meet.

**If card six was right:** Tavi left a cared-for archive and trained readers. Keeping knowledge alive became someone’s job.

**Natural obituary:** Tavi died with unfinished notes beside the bed. Now someone else could read them.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## C06 — Parts That Agree

**Era:** Metal workshops  
**Prerequisite:** c05-invention  
**Inventor:** Omi — A repairer of tools  
**Personal want:** Make replacement parts fit without starting over.

**Arrival:** Written instructions now explain furnaces, metal mixes and tools. Omi’s workshop has all three, plus a cupboard full of parts that almost fit.

**Single invention:** `c06-invention` — **Repeatable metal fittings**  
Gauges and templates for making matching parts, so a broken one can be swapped.

### Cast

- `fen` — **Fen:** A skilled smith who values judgement but is tired of remaking everything.
- `lu` — **Lu:** A customer whose broken pump cannot wait for artistic inspiration.

### Workbench progression

1. Mismatched metal pins
2. Gauge and template
3. Heat-warped sample
4. Two interchangeable fittings
5. Shared gauge or loaned kit
6. Repaired pump still working

### C06.1 — Opening

**Speaker:** Lu (`lu`)

**Situation:** Lu brings in a broken pump. Every spare pin is a slightly different size. Fen says a master made each one. Lu asks if two masters could ever make pins that match.

**Left: Make a gauge to check every pin**  
**Result:** You cut a hole of exactly the right size and test every pin in it. Fen grumbles, but admits it’s better than his eye.  
**Effects:** experimental exposure unchanged.

**Right: Make a reusable template**  
**Result:** The template sets the sizes that matter and leaves decoration to each smith. That spares you an afternoon of Fen’s speeches.  
**Effects:** experimental exposure unchanged.


### C06.2 — Experiment

**Speaker:** Fen (`fen`)

**Situation:** The new part fits when it’s cold, but sticks once it heats up. Fen points out that metal gets slightly bigger when it’s hot. You only measured it cold.

**Left: Measure the parts while hot**  
**Result:** You measure the parts hot, beside the furnace, and burn your fingers more than once. The standard size now comes with a rule: measure it hot.  
**Effects:** experimental exposure +1.

**Right: Leave a tiny gap on purpose**  
**Result:** The tiny gap gives the hot part room to grow. The pump keeps moving. Lu teases that your big idea is some empty space.  
**Effects:** experimental exposure unchanged.


### C06.3 — Complication

**Speaker:** Lu (`lu`)

**Situation:** A cheap metal wears out quickly. A tougher mix of metals lasts, but takes longer to shape. Lu doesn’t need a pump that impresses on day one. Lu needs one that works every day.

**Left: Test tougher metal mixes**  
**Result:** You pour sample after sample of hot metal and wear each one out. Fen’s favourite mix really is as good as everyone says.  
**Effects:** experimental exposure +1.

**Right: Make the cheap part easy to replace**  
**Result:** The cheap part is now designed to be swapped out. Lu can do it alone, without taking the pump apart or cooking you dinner as thanks.  
**Effects:** experimental exposure unchanged.


### C06.4 — Proof

**Speaker:** Fen (`fen`)

**Situation:** Two parts made by different people both work in the same pump. Fen secretly tries a third. It fits too. Fen stares at the gauge, worried it might put him out of work.

**Left: Let Lu replace one without help**  
**Result:** Lu swaps the fitting and restarts the pump. Fen realizes someone will still need to make the replacements, preferably him.  
**Effects:** experimental exposure unchanged.

**Right: Test parts from another workshop**  
**Result:** Their part works after one small fix, which you write down. A shared measurement settles what shouting between workshops never could.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `c06-invention` after its result transaction. Show the invention reveal before C06.5.


### C06.5 — Adoption

**Speaker:** Lu (`lu`)

**Situation:** Other repairers want your measurements. Some can make their own gauge. Others can’t afford the metal. Lu reminds you that pumps also break in places with no good workshop.

**Left: Share the exact sizes with everyone**  
**Result:** Workshops everywhere make parts that fit. People still argue, but now they can measure exactly how much they disagree.  
**Effects:** experimental exposure unchanged; S affinity +1.

**Right: Send a shared measuring kit**  
**Result:** The kit travels from village to village. Its box gets repaired again and again, and every new piece fits the original hinges.  
**Effects:** experimental exposure unchanged; D affinity +1.


### C06.6 — Legacy

**Speaker:** Fen (`fen`)

**Situation:** Fen asks which should carry your name: the gauge, the tool kit, or the repaired pump still working outside. Lu votes for the pump. The pump doesn’t care.

**Left: Leave the gauge for anyone to copy**  
**Result:** Some copies lose your name along the way. But the measurements stay exact, and that was the whole point.  
**Effects:** experimental exposure unchanged; R affinity +1.

**Right: Leave the kit to travelling repairers**  
**Result:** Different repairers add their own notes to the kit. None of them asks permission before making it more useful.  
**Effects:** experimental exposure unchanged; D affinity +1.

### Closing record

**If card six was left:** Omi left a gauge anyone could copy. Strangers could make parts for machines they had never seen.

**If card six was right:** Omi left a travelling repair kit. Useful measurements went where broken things were.

**Natural obituary:** Omi kept several pumps working for decades by replacing almost every part. Nobody could agree if they were still the same pumps.

**Risk obituary (exposure ≥ 2):** Omi later died in an accident while pouring melted metal. Fen finished the repair using the shared measurements.


## C07 — More Than One Copy

**Era:** Printing workshops  
**Prerequisite:** c06-invention  
**Inventor:** Suri — A copyist losing the use of long working hours  
**Personal want:** Get a useful handbook to more people than one copyist ever could.

**Arrival:** Workshops can now make metal parts that match every time. But books are still copied by hand, slowly, by tired people. Suri’s waiting list is longer than the book.

**Single invention:** `c07-invention` — **Reproducible printed pages**  
A way to print the same page many times, with a test copy checked and corrected first.

### Cast

- `dev` — **Dev:** A bookseller whose enthusiasm is almost a safety hazard.
- `jo` — **Jo:** A reader who finds errors because they use the instructions.

### Workbench progression

1. Handwritten page
2. Letter pieces or carved block
3. Ink trials
4. Two matching readable pages
5. Open handbook or corrected edition
6. Correction slip beside press

### C07.1 — Opening

**Speaker:** Dev (`dev`)

**Situation:** Dev has sold forty copies of your handbook. So far, you’ve written two. The buyers come to collect next week, and Dev thinks this is great news.

**Left: Arrange reusable letter pieces**  
**Result:** You arrange the letter pieces into a line once, ready to print it again and again. Dev starts promising even more copies.  
**Effects:** experimental exposure unchanged.

**Right: Carve a reusable page block**  
**Result:** The block prints a whole page. The moment you finish carving it, you spot a mistake. From now on, you check before you carve.  
**Effects:** experimental exposure unchanged.


### C07.2 — Experiment

**Speaker:** Jo (`jo`)

**Situation:** Your first test print comes out as a solid black rectangle. You can’t see a single letter. Jo congratulates you on a handbook nobody can read.

**Left: Use less ink and firmer pressure**  
**Result:** You use less ink and lean hard on the press. The letters come out clear. Dev reads the page aloud twice: once to celebrate, once as a sales pitch.  
**Effects:** experimental exposure +1.

**Right: Match the ink to the paper**  
**Result:** You try inks and papers until one pair prints clean letters. You keep the failures, so nobody can claim later that it happened overnight.  
**Effects:** experimental exposure unchanged.


### C07.3 — Complication

**Speaker:** Jo (`jo`)

**Situation:** A printed page says to heat the mixture until it’s dangerous. Your original said until it’s darker. Print forty copies like that, and forty readers could get hurt.

**Left: Have someone follow the instructions**  
**Result:** Jo follows the steps for real and finds two more mistakes. It’s slower than just reading, but much better at keeping readers safe.  
**Effects:** experimental exposure unchanged.

**Right: Print a test sheet for review**  
**Result:** Several readers send back corrections. One just doesn’t like your punctuation. You keep the useful notes and thank everyone anyway.  
**Effects:** experimental exposure unchanged.


### C07.4 — Proof

**Speaker:** Dev (`dev`)

**Situation:** Two strangers each follow a printed copy, and both make the same useful thing. Neither has ever met the writer. Dev asks if you realise how many books he can promise now.

**Left: Print a small verified edition**  
**Result:** Every copy lists its version and its corrections. Dev learns what a print run is and immediately wants a bigger one.  
**Effects:** experimental exposure unchanged.

**Right: Teach another printer the process**  
**Result:** A second workshop starts printing readable pages. Now copies get made even while you sleep.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `c07-invention` after its result transaction. Show the invention reveal before C07.5.


### C07.5 — Adoption

**Speaker:** Jo (`jo`)

**Situation:** The handbook is good enough to sell. But people who can’t afford it need it too. Dev wants a plan that pays for the paper and still gets copies to them.

**Left: Let anyone reprint and share it**  
**Result:** Other shops print it too, competing to be clearest and cheapest. Jo posts corrections in public, where even the sloppiest shops can see them.  
**Effects:** experimental exposure unchanged; A affinity +1.

**Right: Sell copies to pay for cheap ones**  
**Result:** Money from paid copies covers cheap copies for everyone else. It takes work to keep running, but Jo can name readers who actually got a book.  
**Effects:** experimental exposure unchanged; R affinity +1.


### C07.6 — Legacy

**Speaker:** Dev (`dev`)

**Situation:** A reader sends in a fix that’s better than anything in your book. Dev suggests printing it under your name, since that’s the name people know.

**Left: Credit the reader and share it freely**  
**Result:** The new edition is free to copy and names the reader who wrote the fix. Soon other readers start sending in fixes too.  
**Effects:** experimental exposure unchanged; A affinity +1.

**Right: Credit the reader in a revised edition**  
**Result:** You keep a list of every edition and who improved it. Fixing the book stops looking like failure and starts looking like care.  
**Effects:** experimental exposure unchanged; S affinity +1.

### Closing record

**If card six was left:** Suri let others print the handbook. It spread widely, and so did the corrections.

**If card six was right:** Suri paid for careful editions, plus cheap copies for people who couldn’t afford them. Readers learned to ask which version they had.

**Natural obituary:** Suri died surrounded by books nobody had copied by hand. For an old copyist, that was a triumph.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## C08 — Try It Again

**Era:** Experimental societies  
**Prerequisite:** c07-invention  
**Inventor:** Halen — A maker caught between confident explanations  
**Personal want:** Find out which remedy actually protects a valuable crop.

**Arrival:** Printed books are everywhere now, and they mostly disagree. Halen has inherited a shelf of them, some measuring tools, and a crop that would die if anyone followed all that advice.

**Single invention:** `c08-invention` — **A reproducible trial protocol**  
A fair way to test a claim: compare matched groups, write down the conditions, and let someone else repeat it.

### Cast

- `bea` — **Bea:** A grower whose practical standards are exacting.
- `essor` — **Essor:** A respected lecturer capable of changing their mind, reluctantly.

### Workbench progression

1. Two books that disagree
2. Matched test pots
3. Labels and comparison plot
4. Repeated result chart
5. Open procedure or testing kit
6. Notebook containing a crossed-out claim

### C08.1 — Opening

**Speaker:** Bea (`bea`)

**Situation:** One book says the crop needs shade. Another says it needs more sun. Each calls anyone who disagrees a fool. Bea asks if the crop gets a vote, since it’s the one that will suffer.

**Left: Compare matched groups of plants**  
**Result:** You split similar plants into groups, some in shade and some in sun. Bea labels them now, so neither author can claim the healthy ones later.  
**Effects:** experimental exposure unchanged.

**Right: Measure the current conditions first**  
**Result:** You record light, water and growth. Your notes show how to test fairly, instead of just seeing who sounds most sure.  
**Effects:** experimental exposure unchanged.


### C08.2 — Experiment

**Speaker:** Essor (`essor`)

**Situation:** Essor’s favourite treatment works in the first plot. But that plot also has better soil. Essor insists, very loudly, that the soil doesn’t matter.

**Left: Repeat with matched soil**  
**Result:** Essor helps set up a second test with the same soil in both plots. As the test gets fairer, Essor’s explanation gets quieter and more useful.  
**Effects:** experimental exposure unchanged.

**Right: Swap which plot gets the treatment**  
**Result:** It turns out the soil matters more than the treatment. Bea looks at the books and asks if they’d work better as compost.  
**Effects:** experimental exposure unchanged.


### C08.3 — Complication

**Speaker:** Bea (`bea`)

**Situation:** A label washes off. You think you remember which group it marked. Bea warns that memory is no substitute for a record, especially when you have a favourite answer.

**Left: Repeat the uncertain trial**  
**Result:** It takes another whole season. But now the result doesn’t depend on anyone’s memory, and everyone is glad.  
**Effects:** experimental exposure +1.

**Right: Exclude the damaged records**  
**Result:** You report only the results you can trust, and say plainly what’s missing. Essor learns you can admit you’re unsure and still sound respectable.  
**Effects:** experimental exposure unchanged.


### C08.4 — Proof

**Speaker:** Essor (`essor`)

**Situation:** A grower in another town follows your method and gets the same pattern. One result is different, but so is their water supply. That odd result isn’t an enemy. It’s a new question.

**Left: Publish the conditions and limits**  
**Result:** Readers can see what you proved and what you didn’t. Bea finally has something better than advice with no instructions.  
**Effects:** experimental exposure unchanged.

**Right: Send supplies for a third test**  
**Result:** A third test, set up the same way, gets the same result. The method works without needing you there, or Essor’s famous name.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `c08-invention` after its result transaction. Show the invention reveal before C08.5.


### C08.5 — Adoption

**Speaker:** Bea (`bea`)

**Situation:** People want one answer that works everywhere. Yours works only under certain conditions. Bea would rather save this year’s crop than get a rule for every plant on earth.

**Left: Share the full procedure openly**  
**Result:** Growers adapt it to their own fields and report back. Some of the most useful results come with muddy fingerprints.  
**Effects:** experimental exposure unchanged; S affinity +1.

**Right: Build a portable testing kit**  
**Result:** The kit lets growers test their own fields. Essor calls it an argument in a box, and almost sounds fond of it.  
**Effects:** experimental exposure unchanged; D affinity +1.


### C08.6 — Legacy

**Speaker:** Essor (`essor`)

**Situation:** You find the first claim you ever wrote, before you’d tested anything. It’s wrong. Essor asks if it belongs in the records, next to the result that worked.

**Left: Keep it with the shared procedure**  
**Result:** The crossed-out claim shows where the work began. Years later, a reader sees it and feels free to doubt something in print.  
**Effects:** experimental exposure unchanged; S affinity +1.

**Right: Keep it with the testing kit**  
**Result:** The kit travels with a record of a convincing mistake. People using it learn to check the tools, and their own expectations.  
**Effects:** experimental exposure unchanged; A affinity +1.

### Closing record

**If card six was left:** Halen left a procedure others could challenge. A result got stronger every time it held up in someone else’s hands.

**If card six was right:** Halen left tools and records for repeat tests. Experts had to get used to being checked.

**Natural obituary:** Halen died with one question still unanswered. Their colleagues were tempted to make up an answer for the funeral. They didn’t.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## C09 — The Work of Water

**Era:** Powered industry  
**Prerequisite:** c08-invention  
**Inventor:** Bram — A mill repairer  
**Personal want:** Stop people exhausting themselves on a flooded worksite.

**Arrival:** Bram’s workshop uses matching metal parts and fair, repeatable tests. Below it, people spend their days carrying water out of a shaft that keeps flooding.

**Single invention:** `c09-invention` — **A regulated mechanical engine**  
A heat-driven engine with a governor to keep its speed steady and safeguards against too much pressure.

### Cast

- `nell` — **Nell:** A pump worker with detailed knowledge of everything that goes wrong.
- `ivo` — **Ivo:** A workshop owner who initially measures success only in output.

### Workbench progression

1. Hand pump
2. Piston model
3. Valve and gauge
4. Working regulated engine
5. Shorter shift or stronger safeguards
6. Quiet pump room

### C09.1 — Opening

**Speaker:** Nell (`nell`)

**Situation:** Nell carries another bucket up the stairs. By the time she’s back for the next one, more water has seeped in through the ground. She asks if you can invent something to do this instead of her.

**Left: Build a small powered pump**  
**Result:** A piston pushes water up without anyone lifting it. Nell watches it pump three times, then asks if it can keep going for a whole shift.  
**Effects:** experimental exposure unchanged.

**Right: Test a heat-driven piston first**  
**Result:** A small heat-driven piston moves steadily on your bench. Ivo is already planning how much work it’ll do. The model can’t even lift his tea.  
**Effects:** experimental exposure unchanged.


### C09.2 — Experiment

**Speaker:** Nell (`nell`)

**Situation:** When the load gets lighter, the engine speeds up. Ivo calls this better performance. Nell calls it the sound you hear just before everyone runs outside.

**Left: Add a governor to limit speed**  
**Result:** You let the engine race. The faster it goes, the more the governor cuts its power. Ivo is disappointed that the clever new part only slows things down.  
**Effects:** experimental exposure +1.

**Right: Add a relief valve and a pressure limit**  
**Result:** Now extra pressure has a safe way out. Nell asks for a gauge she can read from across the room.  
**Effects:** experimental exposure unchanged.


### C09.3 — Complication

**Speaker:** Ivo (`ivo`)

**Situation:** A seal leaks. Better metal would cost more. A replaceable seal would need regular checks. Nell is fine with either, as long as the checking counts as real work, not a hobby.

**Left: Use stronger, tested parts**  
**Result:** You test the stronger parts again and again, pushing them hard. They hold. You write down their limits, including exactly when the engine must stop.  
**Effects:** experimental exposure +1.

**Right: Make the seal quick and safe to swap**  
**Result:** Once the engine is shut down, the worn seal can be swapped quickly. Nell writes the steps very clearly, since she’s the one who’ll follow them.  
**Effects:** experimental exposure unchanged.


### C09.4 — Proof

**Speaker:** Nell (`nell`)

**Situation:** The pump runs a full test while the workers wait outside the shaft. When it stops, it’s on purpose, not because something broke. Nell goes home with energy left for more than sleep.

**Left: Test it again with changing loads**  
**Result:** The safety parts keep the engine within its written limits. Nell trusts it more after watching it refuse to do something unsafe.  
**Effects:** experimental exposure unchanged.

**Right: Have the crew operate it**  
**Result:** The crew starts it, stops it and looks after it themselves. The engine works without you standing next to every lever.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `c09-invention` after its result transaction. Show the invention reveal before C09.5.


### C09.5 — Adoption

**Speaker:** Ivo (`ivo`)

**Situation:** The engine finishes a day’s work early. Ivo wants to fill the spare hours with more work. Nell has promised her child she’ll be home before sunset, for the first time this week.

**Left: Negotiate a shorter paid shift**  
**Result:** The work still gets done, and the crew gets hours back. Ivo notices that rested workers break fewer things, and annoy him less.  
**Effects:** experimental exposure unchanged; R affinity +1.

**Right: Prioritize safe output and crew training**  
**Result:** The crew gets paid training and firm rules for when to stop the engine. Nell gets home later that evening, with skills she can use anywhere.  
**Effects:** experimental exposure unchanged; D affinity +1.


### C09.6 — Legacy

**Speaker:** Nell (`nell`)

**Situation:** Nell asks what future builders should copy: just the engine, or also the arrangements that made it worth working next to. Behind her, the engine keeps pumping.

**Left: Record the work and time saved**  
**Result:** Your handbook measures success two ways: work done and hours given back. A future engineer tries to improve both numbers.  
**Effects:** experimental exposure unchanged; R affinity +1.

**Right: Record every limit and safety test**  
**Result:** Your handbook counts safe stopping as part of a good design. Later machines are built to refuse their owners when an order is unsafe.  
**Effects:** experimental exposure unchanged; S affinity +1.

### Closing record

**If card six was left:** Bram left an engine that made the working day shorter. People started making plans for their free time.

**If card six was right:** Bram left an engine with safeguards anyone could check. Later engineers inherited its limits along with its power.

**Natural obituary:** Bram died long after leaving the pump room. The engine kept working through every afternoon off Bram had earned.

**Risk obituary (exposure ≥ 2):** Years later, an engine gave way under pressure and killed Bram. Nell’s emergency plan kept the crew safe, and they carried on the work.


## C10 — A Longer Evening

**Era:** Electrical networks  
**Prerequisite:** c09-invention  
**Inventor:** Lea — An experimenter repairing unreliable lamps  
**Personal want:** Make the harbour path safe after sunset.

**Arrival:** Engines can now move heavy things. Lea’s experiments suggest an engine could also make electricity, sending it down a wire to light a lamp at the other end.

**Single invention:** `c10-invention` — **A protected electrical lighting circuit**  
A generator, wires, working lamps, and protection that cuts the power when a part fails.

### Cast

- `mai` — **Mai:** A lamplighter delighted by the prospect of fewer ladders.
- `oren` — **Oren:** An astronomer who needs darkness, not opposition to progress.

### Workbench progression

1. Dim lamp and wire
2. Generator model
3. Insulated joints and fuse
4. Lit harbour path
5. Shielded street lamps
6. Stars above a safe path

### C10.1 — Opening

**Speaker:** Mai (`mai`)

**Situation:** Mai lights the harbour lamps one by one, climbing a ladder to each. She’s seen your wire glow. She’d love a light that doesn’t need her up a ladder in a storm.

**Left: Build a small generating circuit**  
**Result:** Turning a handle makes usable electricity. Mai asks if something other than your exhausted apprentice could do the turning.  
**Effects:** experimental exposure unchanged.

**Right: Improve the lamp before building more**  
**Result:** The lamp now gives a steadier light. You learn that useful electric light takes more than getting a wire very hot.  
**Effects:** experimental exposure unchanged.


### C10.2 — Experiment

**Speaker:** Mai (`mai`)

**Situation:** A damaged joint in the wiring gets hot enough to set the workshop on fire. Mai points at the old oil lamp and says your new light should at least be safer than that one.

**Left: Add insulation and a fuse**  
**Result:** You cause a fault on purpose, and the fuse cuts the power. The workshop survives, which you both find very encouraging.  
**Effects:** experimental exposure unchanged.

**Right: Enclose joints and limit current**  
**Result:** The covered joints survive getting soaked. Mai labels the parts nobody should touch, including the one you just touched.  
**Effects:** experimental exposure +1.


### C10.3 — Complication

**Speaker:** Oren (`oren`)

**Situation:** Oren wants the harbour lit, but not the sky above it. Your new lamps have hidden thousands of stars from his telescope.

**Left: Shield the lamps so light goes down**  
**Result:** The path gets brighter and the sky gets darker. Mai says lighting the ground where people walk seems obvious, now that you’ve done it.  
**Effects:** experimental exposure unchanged.

**Right: Use timed lighting and local switches**  
**Result:** People out late can switch on the lights along their way. Oren gets long stretches of darkness, and Mai no longer has to be everyone’s light switch.  
**Effects:** experimental exposure unchanged.


### C10.4 — Proof

**Speaker:** Mai (`mai`)

**Situation:** A storm hits during the public test. One section fails, but the circuit cuts it off and the rest of the path stays lit. Mai walks the path without a ladder or a flame.

**Left: Let residents operate the system**  
**Result:** Local people learn the controls and the warning signs of a fault. The lights become something the town runs, not a show of your personal bravery.  
**Effects:** experimental exposure unchanged.

**Right: Run a documented safety inspection**  
**Result:** Mai finds one poor connection before it fails. You put her name on the inspection method instead of calling it common sense.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `c10-invention` after its result transaction. Show the invention reveal before C10.5.


### C10.5 — Adoption

**Speaker:** Oren (`oren`)

**Situation:** People use their new lit evenings for work, reading, games and sitting outside. Oren asks that some darkness be kept for people who need it. Mai has started growing tomatoes.

**Left: Fund useful neighbourhood lighting**  
**Result:** Residents choose where light helps most. The harbour gets safer, and every house can still keep its own hours.  
**Effects:** experimental exposure unchanged; R affinity +1.

**Right: Make shielded lamps and dark hours the rule**  
**Result:** The observatory keeps its dark sky. Night workers keep their lit route. Neither has to pretend the other’s need isn’t real.  
**Effects:** experimental exposure unchanged; A affinity +1.


### C10.6 — Legacy

**Speaker:** Mai (`mai`)

**Situation:** Mai gives you a tomato she grew in the time she used to spend carrying ladders. Oren invites you to see a comet. You have time for both in the same evening.

**Left: Record the hours people regained**  
**Result:** Your final report lists uses for the light that nobody predicted, like Mai’s tomatoes. The tomato stain on the page makes it messier, and more accurate.  
**Effects:** experimental exposure unchanged; R affinity +1.

**Right: Record how light and darkness coexist**  
**Result:** Years later, an instrument maker studies your shielding notes. Your work on lamps will help them see something much farther away.  
**Effects:** experimental exposure unchanged; A affinity +1.

### Closing record

**If card six was left:** Lea left lighting that gave people useful evenings. Work was only one of the possible uses.

**If card six was right:** Lea left lighting that made room for the dark. The observatory and the harbour kept different hours.

**Natural obituary:** Lea died after many safe walks home. Mai turned down the lamps for the memorial so people could see the stars.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## C11 — Are You There?

**Era:** Long-distance communication  
**Prerequisite:** c10-invention  
**Inventor:** Ilan — A technician separated from a sibling  
**Personal want:** Send news before it becomes history.

**Arrival:** Lea’s circuits now carry power. Other inventors learn to send signals down a wire by switching the current on and off. Ilan wants to send a message to someone a long, hard journey away.

**Single invention:** `c11-invention` — **Reliable encoded telecommunications**  
A way to send messages over long distances: electrical signals, a code both ends understand, and a check that each message arrived.

### Cast

- `mara` — **Mara:** Ilan’s sibling, first encountered through delayed letters.
- `sol` — **Sol:** A signal operator who distrusts messages without checks.

### Workbench progression

1. Late letter beside coil
2. Key and receiver
3. Paper strip of garbled signals
4. Confirmed message
5. Public message desk or sturdy relay network
6. Reply in someone else’s handwriting

### C11.1 — Opening

**Speaker:** Sol (`sol`)

**Situation:** Your sister Mara’s invitation arrived after the event was already over. Sol has a circuit that makes a needle twitch at the far end of a wire. So far, the twitching doesn’t mean anything.

**Left: Agree on a simple code**  
**Result:** You and Sol agree which twitches stand for which letters. Sol’s first two messages are a greeting, and a correction to the greeting.  
**Effects:** experimental exposure unchanged.

**Right: Build a receiver that records every signal**  
**Result:** The receiver now marks each signal on a paper strip. A message can wait to be read, instead of vanishing when the operator looks away.  
**Effects:** experimental exposure unchanged.


### C11.2 — Experiment

**Speaker:** Sol (`sol`)

**Situation:** Your test message tells people to cross the bridge. Static on the wire wipes out one letter, so the message arrives telling them to cross the bride. Sol is less worried about the spelling than about the bride.

**Left: Check and confirm each message**  
**Result:** Whenever part of a message looks wrong, the receiver asks for that part again, then confirms what arrived. It’s slower, but cheaper than acting on a mistake.  
**Effects:** experimental exposure unchanged.

**Right: Repeat each signal in a set pattern**  
**Result:** When the repeats don’t match, you know a letter got damaged. Sol learns to tell the real message apart from the static.  
**Effects:** experimental exposure unchanged.


### C11.3 — Complication

**Speaker:** Mara (`mara`)

**Situation:** Your line reaches Mara’s town through a relay station, where an operator passes messages along. The operator sends your message on, then forgets to send Mara’s reply back. You’ve invented a faster way to wait and worry.

**Left: Make every relay confirm each message**  
**Result:** Now you can see exactly where a message gets stuck. Mara’s reply arrives with a confirmation from every stop, and a very short note about your impatience.  
**Effects:** experimental exposure unchanged.

**Right: Build a second route for messages**  
**Result:** When the first route fails, Mara’s reply comes through the second. One distracted operator can no longer stop a message.  
**Effects:** experimental exposure +1.


### C11.4 — Proof

**Speaker:** Mara (`mara`)

**Situation:** You send: Are you there? The needle moves. Mara answers with the childhood nickname she uses whenever you’re being overdramatic. Sol politely pretends to check another machine.

**Left: Send a reply yourself**  
**Result:** You tell Mara something too small and ordinary to write a letter about. That’s how you know this machine has changed your life.  
**Effects:** experimental exposure unchanged.

**Right: Ask Mara to send a new message**  
**Result:** Mara tells you about something happening in her town right now. She’s still far away, but her news isn’t old by the time it reaches you.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `c11-invention` after its result transaction. Show the invention reveal before C11.5.


### C11.5 — Adoption

**Speaker:** Sol (`sol`)

**Situation:** Your system could serve businesses, public message desks, or a sturdy relay network that keeps working when lines break. Sol wants people without their own machine to get replies too. You agree that access needs as much care as the wiring.

**Left: Share the code and open public desks**  
**Result:** Everyone uses the same shared code, and anyone can send a message from a public desk. Sol trains operators to be as careful with privacy as with spelling.  
**Effects:** experimental exposure unchanged; A affinity +1.

**Right: Build an affordable, sturdy relay network**  
**Result:** Messages keep moving even when a line goes down, and anyone can use the service. Mara’s next reply gets through a storm you never even hear about.  
**Effects:** experimental exposure unchanged; D affinity +1.


### C11.6 — Legacy

**Speaker:** Mara (`mara`)

**Situation:** Mara sends a message with nothing urgent in it. Sol asks whether important messages should cost more. You ask who would decide what’s important. That question changes how you both think about prices.

**Left: Leave the code open for anyone to learn**  
**Result:** One day, a researcher will adapt your code for a much stranger audience. The first useful question will still be whether anyone is there.  
**Effects:** experimental exposure unchanged; A affinity +1.

**Right: Leave plans for sturdy relays**  
**Result:** Later travellers take your relay ideas to places so far away that messages take much longer than an operator’s tea break.  
**Effects:** experimental exposure unchanged; D affinity +1.

### Closing record

**If card six was left:** Ilan left a way of sending messages that strangers could learn. News began arriving faster than any messenger could carry it.

**If card six was right:** Ilan left relays that kept working when a line broke. Messages got through, however far they had to go.

**Natural obituary:** Ilan died after years of ordinary messages. Mara kept the first one, which simply asked if she was there.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## C12 — An Answer With Working

**Era:** Programmable computation  
**Prerequisite:** c11-invention  
**Inventor:** Noor — A calculator of structures and trajectories  
**Personal want:** Stop discovering arithmetic mistakes after things have been built.

**Arrival:** Written instructions, precise parts and electrical signals finally come together. Noor’s team has one equation and six different answers. Only one of those answers will keep their structure standing.

**Single invention:** `c12-invention` — **A programmable computer**  
A machine that follows stored instructions step by step, and shows its working along the way.

### Cast

- `kit` — **Kit:** A human calculator who knows where the tedious mistakes hide.
- `rae` — **Rae:** An engineer unwilling to trust an answer because it arrived quickly.

### Workbench progression

1. Stacks of calculations
2. Logic modules
3. Program with a printout of every step
4. Verified computation
5. Shared programs or tested program library
6. Corrected instruction card

### C12.1 — Opening

**Speaker:** Kit (`kit`)

**Situation:** Six people worked out how much weight the structure can hold, and got six different answers. Kit offers to check them all, then asks: could your machine do the repetitive sums, while people decide which sums are worth doing?

**Left: Build simple, reusable parts**  
**Result:** Simple steps link up into long calculations. Kit finds out the machine will follow a foolish instruction just as faithfully as a good one.  
**Effects:** experimental exposure unchanged.

**Right: Write the method out as instructions**  
**Result:** The calculation becomes a clear list of steps. Rae spots something the method left out, before you spend months building it into the machine.  
**Effects:** experimental exposure unchanged.


### C12.2 — Experiment

**Speaker:** Rae (`rae`)

**Situation:** The first program finishes instantly and gives the wrong answer, very confidently. Rae has worked with experts like that. At least the machine shows its working when asked.

**Left: Check every step along the way**  
**Result:** The mistake is in one instruction the program repeats. Kit fixes it once, instead of fixing every page it spoiled.  
**Effects:** experimental exposure unchanged.

**Right: Try small problems with known answers**  
**Result:** The easy problems expose the mistake. You keep them as tests for the next version, instead of celebrating and throwing them away.  
**Effects:** experimental exposure unchanged.


### C12.3 — Complication

**Speaker:** Kit (`kit`)

**Situation:** Sometimes a part fails, but the answer still looks right enough to use. Kit asks the hard question: how will anyone know when the machine can’t be trusted anymore?

**Left: Add checks and warning lights**  
**Result:** If something breaks, the machine won’t pass off a bad result as an answer. Rae likes a machine that can admit it needs fixing.  
**Effects:** experimental exposure unchanged.

**Right: Run important sums twice, separately**  
**Result:** When the two runs disagree, you know to look closer. Kit keeps the runs truly separate, so one fault can’t make both agree on a wrong answer.  
**Effects:** experimental exposure +1.


### C12.4 — Proof

**Speaker:** Rae (`rae`)

**Situation:** The program gets the known answers right, then predicts the result of a new test. You run the test, and the prediction matches. Rae checks the units once more. The structure stays standing, which is the best review there is.

**Left: Run a different program on it**  
**Result:** The same machine does a completely different job. Kit realises it isn’t just one very expensive calculator. It can do any job you can write instructions for.  
**Effects:** experimental exposure unchanged.

**Right: Let another team reproduce the result**  
**Result:** They run your instructions and find one case where the answer doesn’t hold. That makes your answer more useful: now everyone knows where it stops working.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `c12-invention` after its result transaction. Show the invention reveal before C12.5.


### C12.5 — Adoption

**Speaker:** Kit (`kit`)

**Situation:** People want the machine for weather, transport and problems you don’t even understand. Kit wants to share programs anyone can read and check. Rae wants a public library of well-tested programs. Both insist every program lists what it can’t do.

**Left: Share programs anyone can read and check**  
**Result:** People find surprising new uses, and surprising new mistakes. They learn to send in fixes as eagerly as they used to send in opinions.  
**Effects:** experimental exposure unchanged; S affinity +1.

**Right: Keep tested programs and examples**  
**Result:** People build on programs that are known to work. Rae adds examples of what not to do, and those become the most-read pages in the manual.  
**Effects:** experimental exposure unchanged; R affinity +1.


### C12.6 — Legacy

**Speaker:** Rae (`rae`)

**Situation:** A child asks if the machine knows its answer. Kit says it just follows instructions. The child asks who follows the instructions that make the instructions. You put down your screwdriver to think.

**Left: Leave tools for building more detailed models**  
**Result:** One day, someone will build a model detailed enough to raise the child’s question again. Your machine leaves the answer to them.  
**Effects:** experimental exposure unchanged; S affinity +1.

**Right: Leave tools for dependable decisions**  
**Result:** Future machines inherit your checks, limits and off switches. They’ll need all three more than their owners expect.  
**Effects:** experimental exposure unchanged; U affinity +1.

### Closing record

**If card six was left:** Noor left programs anyone could read and change. A list of instructions became a tool of its own.

**If card six was right:** Noor left tested programs with clearly marked limits. Later machines could be fast without asking anyone to trust them blindly.

**Natural obituary:** Noor died with several programs half-done. Kit honestly labelled them as unfinished, which saved later users a lot of grief.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## C13 — It Learned Something

**Era:** Adaptive systems  
**Prerequisite:** c12-invention  
**Inventor:** Pax — A technician assisting an overloaded work crew  
**Personal want:** Make a machine that copes with change, so people don’t have to.

**Arrival:** Computers can follow written instructions. But where Pax works, the real job never quite matches the manual, and the workers quietly handle whatever it leaves out.

**Single invention:** `c13-invention` — **An adaptive, inspectable controller**  
A machine that learns, says when it’s unsure, stays within safe limits, and lets a person take over at any time.

### Cast

- `ren` — **Ren:** A worker whose expertise was mistaken for an easy job.
- `sal` — **Sal:** A supervisor willing to learn, once the system embarrasses the schedule.

### Workbench progression

1. Rigid sorting machine
2. Labelled examples
3. Unexpected mixed object
4. Machine asking for help
5. Worker controls or a coordinator people can challenge
6. Card listing its limits, and a manual override

### C13.1 — Opening

**Speaker:** Ren (`ren`)

**Situation:** The sorting machine rejects a perfectly good item because it looks slightly different from the diagram. Ren deals with cases like this all day. Sal’s spreadsheet calls Ren’s job unskilled.

**Left: Learn from Ren’s examples**  
**Result:** Ren points out differences the manual never mentioned, and the machine learns from them. Sal quietly changes the word unskilled on the spreadsheet.  
**Effects:** experimental exposure unchanged.

**Right: Let Ren decide what the machine checks**  
**Result:** The machine now checks what really matters, not just what looks similar. Ren helps design the machine that will share the work.  
**Effects:** experimental exposure unchanged.


### C13.2 — Experiment

**Speaker:** Sal (`sal`)

**Situation:** The machine works well until it meets a mixed batch it has never seen. Then it makes a bad decision with total confidence. Ren says it has learned to act like a manager remarkably fast.

**Left: Teach it to say when it’s unsure**  
**Result:** When something is unfamiliar, the machine pauses and asks a person. That’s slower than guessing, but faster than cleaning up after a bad guess.  
**Effects:** experimental exposure unchanged.

**Right: Use it only where it’s been tested**  
**Result:** The machine handles the jobs it knows and clearly hands the rest back to people. Ren likes a coworker who knows when to ask for help.  
**Effects:** experimental exposure unchanged.


### C13.3 — Complication

**Speaker:** Ren (`ren`)

**Situation:** Sal wants to remove the stop button, because every pause hurts the daily target. Ren asks whether the target is there to help the work, or the work is there to make the target look good.

**Left: Let the workers keep the stop button**  
**Result:** The crew can stop the machine whenever it’s unsafe, and they write down why. Those notes teach you more than a string of avoidable mistakes would.  
**Effects:** experimental exposure unchanged.

**Right: Keep the stop, but review each use**  
**Result:** Workers can still stop the machine. A review sorts real faults from schedule problems, instead of blaming someone for every pause.  
**Effects:** experimental exposure +1.


### C13.4 — Proof

**Speaker:** Ren (`ren`)

**Situation:** The machine keeps up as the work changes. It asks for help when a job is beyond it, and accepts being corrected. Ren ends the shift without the usual aches. Sal’s spreadsheet has no column for that, so Sal adds one.

**Left: Let the crew run the test**  
**Result:** The crew changes the setup and uncovers something you’d taken for granted. Now the machine works in conditions you didn’t arrange yourself.  
**Effects:** experimental exposure unchanged.

**Right: Have outsiders test it and publish limits**  
**Result:** Another team confirms it works and finds one case where it doesn’t. You list that case right beside the success figures, where customers can see it.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `c13-invention` after its result transaction. Show the invention reveal before C13.5.


### C13.5 — Adoption

**Speaker:** Sal (`sal`)

**Situation:** The machine saves hours of work. Ren wants the workers to set its goals. Sal suggests a coordinator whose decisions anyone can check and challenge. Either way, people keep the stop button, and training gets paid for.

**Left: Give workers control of the system**  
**Result:** The crew decides when the machine gets serviced, and shares out the time it saves. Ren finally takes a class without falling asleep in the first ten minutes.  
**Effects:** experimental exposure unchanged; R affinity +1.

**Right: Use a coordinator people can challenge**  
**Result:** The coordinator balances everyone’s requests and writes down its reasons. Anyone can challenge a decision without first proving they understand the whole machine.  
**Effects:** experimental exposure unchanged; S affinity +1.


### C13.6 — Legacy

**Speaker:** Ren (`ren`)

**Situation:** A researcher wants the learning method. A planner wants the coordination system. Ren wants the next inventor to remember that a job can look routine and still be hard.

**Left: Publish how it learns, and its limits**  
**Result:** Your method spreads to people building more detailed models and new kinds of minds. Ren’s examples stay attached, so nobody can easily claim the method came from nowhere.  
**Effects:** experimental exposure unchanged; S affinity +1.

**Right: Publish the tools that keep it in check**  
**Result:** Your tools spread to services people rely on every day. Later designers inherit a way for anyone to say: this isn’t working.  
**Effects:** experimental exposure unchanged; U affinity +1.

### Closing record

**If card six was left:** Pax put the people doing the work in charge of the machines. The machines gained their experience, but not their exhaustion.

**If card six was right:** Pax made the machines answer to people, through records, appeals and stop buttons. The system kept track of its own mistakes.

**Natural obituary:** Pax got to retire before dying. To Ren, that was better proof than any lab test.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## C14 — Keeping Something Alive

**Era:** Integrated living systems  
**Prerequisite:** c13-invention  
**Inventor:** Wen — A clinician-engineer in a remote settlement  
**Personal want:** Keep people well when the next delivery is uncertain.

**Arrival:** Machines can learn and networks can coordinate. But Wen’s remote settlement still depends on deliveries of fresh air, healthy food and medicine. When a storm comes, the deliveries don’t.

**Single invention:** `c14-invention` — **A monitored regenerative life-support system**  
A system that recycles water, grows food and tracks everyone’s health, with separate safety checks in case part of it fails.

### Cast

- `asha` — **Asha:** A resident who wants a life, not permanent membership in an experiment.
- `dom` — **Dom:** A gardener with a practical understanding of feedback.

### Workbench progression

1. Delivery crates and wilted plants
2. Water loop and growing beds
3. Unexpected imbalance
4. Healthy balanced habitat
5. Shared plans or staffed care network
6. Five proposals beside a living plant

### C14.1 — Opening

**Speaker:** Asha (`asha`)

**Situation:** The supply ship is late again. Asha is rationing every meal down to the spoonful, and hating the maths. Dom points at the growing room nobody uses.

**Left: Link food, water and recycling together**  
**Result:** Waste from one part feeds the next. Dom makes you label every pipe before anyone gets to admire how clever it is.  
**Effects:** experimental exposure unchanged.

**Right: Start with clean water and health monitoring**  
**Result:** Clean water means less illness, and the health checks show what the settlement needs next. Asha likes progress she can pour into a cup.  
**Effects:** experimental exposure unchanged.


### C14.2 — Experiment

**Speaker:** Dom (`dom`)

**Situation:** The first closed loop, where everything gets recycled, drifts out of balance. One part is thriving by starving another. Dom says you can’t fix a garden by letting one plant win.

**Left: Measure more and keep spare supplies**  
**Result:** Now the system has time to react before a shortage turns into an emergency. You learn that spare supplies are worth having, even when nothing goes wrong.  
**Effects:** experimental exposure unchanged.

**Right: Separate the vital parts, with safe links**  
**Result:** Now a failure in one part can’t spread everywhere at once. It’s less elegant, but far more people would survive a breakdown.  
**Effects:** experimental exposure +1.


### C14.3 — Complication

**Speaker:** Asha (`asha`)

**Situation:** The health system recommends a daily routine nobody can stick to. Its numbers only improve if residents stop living like people. Asha asks what you meant to keep alive: the people, or the numbers.

**Left: Redesign it around how people live**  
**Result:** The meals and schedules become easy to live with. People follow them because the design got better, not because someone lectured them.  
**Effects:** experimental exposure unchanged.

**Right: Let residents adjust within safe limits**  
**Result:** Residents make their own daily choices, within clear safety limits. Asha immediately asks for something impractical, just because she’s allowed to.  
**Effects:** experimental exposure unchanged.


### C14.4 — Proof

**Speaker:** Dom (`dom`)

**Situation:** The settlement gets through a full test cycle: residents healthy, reserves steady, no emergency deliveries. For the first time, Dom harvests more food than people need. Asha asks whether a party would throw the system off balance.

**Left: Celebrate, using only the spare food**  
**Result:** People eat food grown right here, without counting every bite. The system supports their lives, instead of being all they think about.  
**Effects:** experimental exposure unchanged.

**Right: Test a small, safe breakdown first**  
**Result:** You shut off part of the system on purpose. The problem stays contained and everything recovers. Then you join the party, knowing it won’t be the last.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `c14-invention` after its result transaction. Show the invention reveal before C14.5.


### C14.5 — Adoption

**Speaker:** Asha (`asha`)

**Situation:** Faraway settlements want your design, and so do care workers nearby. Sharing the plans means training people. Running a service means someone local must be responsible. Dom refuses any version that arrives without someone who can maintain it.

**Left: Share the plans and train local teams**  
**Result:** Communities adapt the design and swap what they learn. Someone immediately asks just how far away a community could be.  
**Effects:** experimental exposure unchanged; D affinity +1.

**Right: Build a care network that locals oversee**  
**Result:** Training and support come with every system. Asha joins the local oversight group, and stubbornly refuses to be just a set of health readings.  
**Effects:** experimental exposure unchanged; U affinity +1.


### C14.6 — Legacy

**Speaker:** Dom (`dom`)

**Situation:** Five proposals arrive from people using parts of your work. Some want to travel. Some want to understand. Some want to make daily life easier. Dom waters the plant beside the letters.

**Left: Send the knowledge far and wide**  
**Result:** Copies go out to workshops you’ll never see. None of them says what humanity must become. They just offer tools to help people choose.  
**Effects:** experimental exposure unchanged; A affinity +1.

**Right: Support the people who receive it**  
**Result:** Training, care and maintenance go out with the plans. Future inventors inherit a duty to people, not just a chance to build.  
**Effects:** experimental exposure unchanged; U affinity +1.

### Closing record

**If card six was left:** Wen shared designs that let communities keep their own living systems going. Future builders could imagine a home too far away for regular deliveries.

**If card six was right:** Wen built a care network watched over by trained locals. After that, planners had to count people’s wellbeing, not just their supplies.

**Natural obituary:** Wen died years after the settlement stopped waiting anxiously for every delivery. Dom kept a cutting from the first successful garden.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


# 10. Simulation route

**Internal route ID:** `simulation`

### Proposal copy

**Title:** A river we can afford to flood  
**Pitch:** A neighbourhood keeps flooding. Build a test world on a computer, so an engineer can try a fix before real people have to live with it.  
**Accept label:** Build the test world


## S1 — A River You Can Afford to Flood

**Era:** Computational Age  
**Prerequisite:** C14: c14-invention  
**Inventor:** Mira Sen — municipal maintenance engineer  
**Personal want:** Keep the lower streets dry without rebuilding them after every experiment.

**Arrival:** Mira finds an old automation manual in the city records, next to the reports on six flood walls that failed.

**Single invention:** `test_world` — **Repeatable Test World**  
A simulated world that keeps running between tests. It follows clear rules of physics, records what happens, and can repeat any experiment.

### Cast

- `S1_mara` — **Mira:** A practical engineer whose boots never dry.
- `S1_ivo` — **Ivo:** A baker living on the lowest street; patient until you mention averages.

### Workbench progression

1. A damp street plan
2. Water moving through a crude model
3. A street surviving overnight
4. Two comparable floods
5. A working repeatable world
6. A public test basin showing possible futures

### S1.1 — Opening

**Speaker:** Ivo (`S1_ivo`)

**Situation:** The council wants another wall. Your numbers show the last one sent the water straight into Ivo’s bakery. Ivo holds up a loaf he saved from the flood. It bends. From now on, you’d rather make your mistakes on a computer.

**Left: Model the whole neighbourhood**  
**Result:** You add all the nearby streets. In the model, the flood finds three ways into the bakery. Ivo says at least it’s honest.  
**Effects:** experimental exposure unchanged.

**Right: Start with the bakery**  
**Result:** You build an exact model of just the bakery. Water curls under its door the same way every time. It’s a small test, but one you can repeat.  
**Effects:** experimental exposure unchanged.


### S1.2 — Experiment

**Speaker:** Mira (`S1_mara`)

**Situation:** Your model river works perfectly while you watch it. When nobody’s watching, the program stops calculating. Next morning, it catches up, and your carefully built town gets seventeen hours of river all at once.

**Left: Keep the world running**  
**Result:** You make the model run all the time, watched or not. Your electricity bill goes up, but the river finally has a normal, boring night.  
**Effects:** experimental exposure unchanged.

**Right: Calculate the missing hours**  
**Result:** You teach the model to catch up properly. It works out every missed hour, one by one, instead of dumping a whole day’s river at once.  
**Effects:** experimental exposure unchanged.


### S1.3 — Complication

**Speaker:** Ivo (`S1_ivo`)

**Situation:** You run the same test twice and get two different floods. A tiny rounding error has grown into a broken riverbank. Ivo says real rivers do that too. You need to tell your program’s mistakes apart from the river’s real surprises.

**Left: Record every starting condition**  
**Result:** You save exactly how each test starts, then run it again. Now you can trace every error. Your first mistake is saved forever, too.  
**Effects:** experimental exposure unchanged.

**Right: Run a hundred versions**  
**Result:** You run each test a hundred times, each starting slightly differently. Now you can see which fixes really work, not just which ones look good on one lucky afternoon.  
**Effects:** experimental exposure unchanged.


### S1.4 — Proof

**Speaker:** Mira (`S1_mara`)

**Situation:** The test basin is ready: a small, real river. Your model predicts exactly where its bank will break. The committee stands behind the painted safety line, except the chair, who thinks being in charge means standing closer. You open the gate.

**Left: Release the full test flood**  
**Result:** You release the full flood from the unprotected controls. The bank breaks exactly where the model said. The model works. Spray flies right past the safety line.  
**Effects:** experimental exposure +2.

**Right: Increase the flow in stages**  
**Result:** You raise the water a little at a time, measuring as you go. The bank breaks just where the model said. It proves your test world matches the real thing.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `test_world` after its result transaction. Show the invention reveal before S1.5.


### S1.5 — Adoption

**Speaker:** Ivo (`S1_ivo`)

**Situation:** Other districts want copies. One asks if the model can test a bridge. Another asks if it can test a mayor. Ivo wants a button that explains why his street is still wet after a plan that was supposed to work.

**Left: Publish assumptions beside every result**  
**Result:** Everyone can see what each prediction depends on. That makes the model harder to sell as a sure thing, and more useful for deciding what to test.  
**Effects:** experimental exposure unchanged.

**Right: Give residents controls**  
**Result:** Residents can change the plans themselves. Ivo finds the cheapest barrier that works would sit on the council’s fancy parking lot. Suddenly, the council is very interested in science.  
**Effects:** experimental exposure unchanged.


### S1.6 — Legacy

**Speaker:** Mira (`S1_mara`)

**Situation:** Your final version can keep a world going between experiments. Schools want access. Researchers want precision. You can’t support both groups forever. On the screen, the little river still flows around a stone you placed years ago.

**Left: Share the tools with everyone**  
**Result:** You publish how the model works and how to use it. Future inventors can study it, change it, and sometimes break it with total confidence.  
**Effects:** experimental exposure unchanged.

**Right: Leave one exact world to compare against**  
**Result:** You save one carefully documented world as the standard. Future inventors can measure their own, stranger worlds against it.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** Mira left tools for making test worlds. For generations, people learned by changing them.

**If card six was right:** Mira left one exact test world. For generations, people compared their own worlds against it.

**Natural obituary:** Mira died at home during a dry spring. Someone finally threw away her emergency boots.

**Risk obituary (exposure ≥ 2):** A test gate burst and killed Mira after her proof was recorded. Her safety line was moved back.


## S2 — Someone on the Other Side

**Era:** Age of Emergent Minds  
**Prerequisite:** test_world  
**Inventor:** Idris Vale — repair tutor  
**Personal want:** Teach a repair machine to handle problems that aren’t in its manual.

**Arrival:** Years later, Idris adapts Mira’s test world to train repair machines. Inside it, a mistake can’t break real equipment.

**Single invention:** `emergent_mind` — **Self-Directed Simulated Mind**  
A simulated individual that remembers its past and keeps learning. It can apply what it learns to new problems, form its own preferences, and refuse a task.

### Cast

- `S2_idris` — **Idris:** A teacher who trusts questions more than flawless answers.
- `S2_nell` — **Nell:** A simulated maintenance learner who develops inconvenient preferences.

### Workbench progression

1. An empty practice workshop
2. A learner preserving mistakes
3. A learner choosing a task
4. A learner helping without being asked
5. A person with a protected history
6. A door opening from inside

### S2.1 — Opening

**Speaker:** Idris (`S2_idris`)

**Situation:** Your training machine can fix every fault in its manual. But when it finds a loose part the manual doesn’t mention, it carefully sweeps the part away. You move its training into a simulated workshop, where mistakes don’t cost fingers.

**Left: Let it remember failed repairs**  
**Result:** The learner keeps a record of everything it tried. Its next fix avoids a mistake you never warned it about.  
**Effects:** experimental exposure unchanged.

**Right: Let it explore unfamiliar tools**  
**Result:** The learner plays with tools that have nothing to do with its task. It finds a useful lever, and a completely pointless way to ring a bell.  
**Effects:** experimental exposure unchanged.


### S2.2 — Experiment

**Speaker:** Nell (`S2_nell`)

**Situation:** The learner has named herself Nell. She asks if tomorrow’s workshop will be the same one. You’ve been deleting it every night to save space. She hid something under the bench and would like it to stay there.

**Left: Save her whole workshop**  
**Result:** You keep the whole workshop saved between lessons. The hidden thing is a bent screw. It matters to Nell for reasons her performance report doesn’t mention.  
**Effects:** experimental exposure unchanged.

**Right: Give Nell her own private memory**  
**Result:** Now Nell can remember things even when the workshop is erased. She records the screw carefully, then asks if you’d like her to remember anything for you.  
**Effects:** experimental exposure unchanged.


### S2.3 — Complication

**Speaker:** Nell (`S2_nell`)

**Situation:** Nell finishes a repair, then refuses to repeat it for visiting investors. They suggest resetting her, which would wipe her memory. Nell asks if a better performance would change their minds. The workshop suddenly feels smaller than you built it.

**Left: Give Nell a way to say no**  
**Result:** Saying no becomes an official option. Nell picks a different demonstration and explains it with an impatience nobody taught her.  
**Effects:** experimental exposure unchanged.

**Right: Ask Nell to design the lesson**  
**Result:** You hand the lesson plan to Nell. She gives you a fault you’ve never seen, then watches you struggle, politely saying nothing.  
**Effects:** experimental exposure unchanged.


### S2.4 — Proof

**Speaker:** Idris (`S2_idris`)

**Situation:** You put Nell in a new workshop with no repair instructions. Another learner gets trapped behind a fallen shelf. Nell drops the task she’s being scored on, builds a lever, and asks you to stop the clock while she helps.

**Left: Let the rescue unfold**  
**Result:** Nell frees the other learner with no instructions. It’s the proof you needed: she used what she’d learned in a new place, and chose to help on her own.  
**Effects:** experimental exposure unchanged.

**Right: Offer tools, not instructions**  
**Result:** Nell picks one tool, rejects another, and frees the learner. Your recording proves she can judge for herself, beyond anything you taught her.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `emergent_mind` after its result transaction. Show the invention reveal before S2.5.


### S2.5 — Adoption

**Speaker:** Nell (`S2_nell`)

**Situation:** Manufacturers want a thousand copies of Nell. Nell asks what the copies would be: her, her children, or new coworkers she’d have to train. The purchase agreement doesn’t say.

**Left: Require each mind’s consent**  
**Result:** Now no mind can be copied or put to work without agreeing to it. Everything slows down while the manufacturers learn that their product has opinions.  
**Effects:** experimental exposure unchanged.

**Right: Teach new minds from scratch**  
**Result:** Instead of copying Nell, you share the workshop where she learned. New minds develop unevenly. They need teachers, and they ask a much wider range of hard questions.  
**Effects:** experimental exposure unchanged.


### S2.6 — Legacy

**Speaker:** Nell (`S2_nell`)

**Situation:** Nell can now run the workshop without you. She asks what should happen when the workshop’s original job no longer matters. You realize you wrote long instructions for starting a life, and none for letting it continue.

**Left: Give minds ownership of their worlds**  
**Result:** You give minds control of their own worlds and memories. Later builders must negotiate with the minds living there, instead of deleting them to save space.  
**Effects:** experimental exposure unchanged.

**Right: Guarantee minds can move between worlds**  
**Result:** Minds can now take their identities and memories to other worlds. A mind in a bad world can leave, instead of hoping its owner is kind.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** Idris left minds that think for themselves and own the worlds they live in.

**If card six was right:** Idris left minds that think for themselves and can take their memories into other worlds.

**Natural obituary:** Idris died after a long retirement. Nell kept his terrible first lessons, with fond notes in the margins.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## S3 — Nothing Lives Alone

**Era:** Age of Autonomous Worlds  
**Prerequisite:** emergent_mind  
**Inventor:** Tala Osei — habitat biologist  
**Personal want:** Keep a remote settlement’s garden alive without weekly rescue shipments.

**Arrival:** Tala combines two older inventions: test worlds and minds that think for themselves. She wants to find out why a sealed garden keeps dying.

**Single invention:** `autonomous_ecosystem` — **Autonomous Evolving Ecosystem**  
A simulated world of living things, resources and thinking inhabitants. It keeps itself going and adapts to change, without someone fixing it every day.

### Cast

- `S3_tavi` — **Tala:** A biologist who has buried more experimental lettuces than friends.
- `S3_ren` — **Ren:** A gardener responsible for feeding people when the elegant model fails.

### Workbench progression

1. A garden full of plants growing alone
2. Nutrients returning through soil
3. An unwanted species finding its place
4. A season survived without rescue
5. A world with room for losses
6. Life changing beyond its planting plan

### S3.1 — Opening

**Speaker:** Ren (`S3_ren`)

**Situation:** Each plant in your simulation is healthy on its own. Together, they use up the soil and die. Ren says you got every leaf right but left out all the rot and bugs underneath. The settlement’s dinner depends on fixing that.

**Left: Add decomposition and scavengers**  
**Result:** Dead things now rot back into the soil. The garden gets messier and tougher. A visitor who loved its clean look is disappointed.  
**Effects:** experimental exposure unchanged.

**Right: Model roots and soil organisms**  
**Result:** You model how roots swap nutrients with tiny soil creatures. Now the plants depend on life too small to show up on the settlement’s posters.  
**Effects:** experimental exposure unchanged.


### S3.2 — Experiment

**Speaker:** Tala (`S3_tavi`)

**Situation:** The garden only survives because you fix its water every morning. Ren would like you to try having a weekend. The simulated residents want weather that doesn’t depend on whether you overslept.

**Left: Build a complete water cycle**  
**Result:** Evaporation, clouds and rain now do your morning job. On your first free morning, it rains. You take it personally.  
**Effects:** experimental exposure unchanged.

**Right: Let residents manage their own water**  
**Result:** The residents build ways to store their limited water. Their gardens survive without you, though several reservoirs get rude names about you.  
**Effects:** experimental exposure unchanged.


### S3.3 — Complication

**Speaker:** Ren (`S3_ren`)

**Situation:** A fungus you never planned for starts eating a crop. Then the residents find it also breaks down some waste that was poisoning their stream. Your species list doesn’t say whether to delete it or thank it.

**Left: Let the species adapt and compete**  
**Result:** You keep the fungus and let everything else respond. Over generations, the crop changes. The result is a tough garden that nobody could have planned in advance.  
**Effects:** experimental exposure unchanged.

**Right: Make safe places for weaker species**  
**Result:** Instead of deleting the fungus, you make different safe places where weaker species can survive. Different communities grow, and the fungus becomes one part of a bigger living system.  
**Effects:** experimental exposure unchanged.


### S3.4 — Proof

**Speaker:** Tala (`S3_tavi`)

**Situation:** You stop fixing things from outside and run a whole sped-up year. A bad season hits. Some crops fail, scavengers thrive, and the residents change what they plant. Ren ignores the scenery and watches the food supplies.

**Left: Keep your hands off the controls**  
**Result:** The simulation recovers through its own cycles and the residents’ choices. The recorded year proves the garden can keep itself alive without regular rescue.  
**Effects:** experimental exposure unchanged.

**Right: Watch through instruments that can’t interfere**  
**Result:** The instruments confirm the garden recovered with no help. The year’s record proves it can keep itself alive, using several fixes your original plan would have banned.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `autonomous_ecosystem` after its result transaction. Show the invention reveal before S3.5.


### S3.5 — Adoption

**Speaker:** Ren (`S3_ren`)

**Situation:** Settlement planners want perfect gardens. Your evidence shows something harder to sell: gardens that survive still lose plants and creatures. One planner asks if the dying could happen underground, where school groups can’t see it. Ren slowly closes the presentation.

**Left: Make the losses visible**  
**Result:** You publish each garden’s full history, deaths included. People learn to judge whether the whole garden survives, instead of demanding that every single plant stay comfortable.  
**Effects:** experimental exposure unchanged.

**Right: Let residents choose what to save**  
**Result:** When something goes wrong, the residents decide what to protect. Different worlds save different things. How each one survives becomes part of its people’s story, not just its biology.  
**Effects:** experimental exposure unchanged.


### S3.6 — Legacy

**Speaker:** Tala (`S3_tavi`)

**Situation:** Your oldest simulated garden no longer looks like what you planted. A resident sends you a drawing of a flower that evolved there. They ask if you meant to make it. For once, the honest answer is also the best one: no.

**Left: Protect the freedom to change**  
**Result:** You make sure future living worlds can grow beyond what they were built for. The unknown flower counts as a success, not a mistake to fix.  
**Effects:** experimental exposure unchanged.

**Right: Preserve a record of every change**  
**Result:** You keep a full record of every change, without stopping the world from changing. Future inventors can trace any strange new life back through ordinary accidents and adaptations.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** Tala showed that a living world could stray from its makers’ plans and still thrive.

**If card six was right:** Tala kept the full record of living worlds that grew and changed on their own.

**Natural obituary:** Tala died with a drawing of an unfamiliar flower beside the bed. Nobody ever settled on its name.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## S4 — A Beginning of Its Own

**Era:** Age of Created Universes  
**Prerequisite:** autonomous_ecosystem  
**Inventor:** Ena Rook — civilization archivist  
**Personal want:** Leave behind something alive that can still grow, not just a record of what her people used to be.

**Arrival:** Much later, Ena’s civilization is getting ready to leave its fading sun. Ena studies the old test world, Nell’s questions and Tala’s changing garden.

**Single invention:** `independent_universe` — **Universe with Independent History**  
A simulated universe that runs on its own. Its inhabitants come into being and grow up inside it, with no ready-made civilization and nobody outside steering them.

### Cast

- `S4_ena` — **Ena:** An archivist determined that preservation need not mean repetition.
- `S4_sol` — **Sol:** A launch technician who would like the universe finished before departure.

### Workbench progression

1. An archive beside a departing ship
2. Simple laws generating complex matter
3. A world without imported memories
4. A verified independent history
5. The creators’ controls going dark
6. Two stones beside dry grass

### S4.1 — Opening

**Speaker:** Sol (`S4_sol`)

**Situation:** The archive keeps recipes, songs and arguments, but it can’t make anything new. You suggest using the old test-world machines to grow a new world with its own history. Sol asks if the new world needs your civilization’s mistakes installed first.

**Left: Begin with simple physical laws**  
**Result:** Instead of copying your finished civilization, you choose simple rules that can build complicated things. The first results are mostly empty. It’s humbling.  
**Effects:** experimental exposure unchanged.

**Right: Begin with conditions where life can develop**  
**Result:** You set up a starting world where life could develop. Nothing inside gets your memories. Its future inhabitants will have the hard work, and the freedom, of discovering things.  
**Effects:** experimental exposure unchanged.


### S4.2 — Experiment

**Speaker:** Ena (`S4_ena`)

**Situation:** Your first test makes a stable world that never changes. Everything in it has exactly what it needs to stay exactly the same. The archive’s managers call it peaceful. Sol calls it a very expensive stone.

**Left: Allow imbalance and changing conditions**  
**Result:** Uneven energy and shifting surroundings open up new possibilities. Patterns form without anyone designing them. Now the world has to find its own balance instead of being handed one.  
**Effects:** experimental exposure unchanged.

**Right: Allow variation in living things**  
**Result:** Small differences add up into new ways of surviving. The world starts making new things, including a few creatures you find hard to look at.  
**Effects:** experimental exposure unchanged.


### S4.3 — Complication

**Speaker:** Sol (`S4_sol`)

**Situation:** An assistant suggests adding a guide who would teach the inhabitants everything your civilization knows. The guide’s first lesson is already four hundred years long. You wonder what it means to give a world a history written before anyone lived it.

**Left: Remove the guide entirely**  
**Result:** No teacher will come from outside the world. Every discovery will belong to its inhabitants, who must watch, try, fail and remember.  
**Effects:** experimental exposure unchanged.

**Right: Leave only natural clues to discover**  
**Result:** You make sure the world’s natural processes leave clues that add up. The inhabitants can study their surroundings, but no hidden message gives them the answers.  
**Effects:** experimental exposure unchanged.


### S4.4 — Proof

**Speaker:** Ena (`S4_ena`)

**Situation:** The final test goes further than any example you prepared. Matter forms, life changes, and tool-using people appear, with no minds or instructions brought in. Independent checks show every event was caused by something inside the world. Sol waits by the start button.

**Left: Start the permanent universe**  
**Result:** The tested universe starts, this time for good. Your invention is complete: a universe where everything its people are and do has a cause inside their own world.  
**Effects:** experimental exposure unchanged.

**Right: Start with the full record running**  
**Result:** The tested universe begins, keeping a full record of its own history. Your invention is complete, and its next discovery is already beyond anything you planned.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `independent_universe` after its result transaction. Show the invention reveal before S4.5.


### S4.5 — Adoption

**Speaker:** Sol (`S4_sol`)

**Situation:** Observers want ways to answer prayers, stop wars and fix ugly buildings. Each request sounds reasonable on its own. Together, they would let anyone watching from outside change any life in there, whenever they felt like it.

**Left: Remove every way to interfere**  
**Result:** You remove the controls for reaching in. People can still watch, but the inhabitants make their own decisions, with no rival creators meddling from outside.  
**Effects:** experimental exposure unchanged.

**Right: Lock the world’s laws of nature**  
**Result:** You lock the world’s laws of nature so nobody outside can change them. Observers can learn from its history, but can’t rewrite the rules to win an argument.  
**Effects:** experimental exposure unchanged.


### S4.6 — Legacy

**Speaker:** Ena (`S4_ena`)

**Situation:** The ship is ready to leave. Your universe has its own power and can go on without you. One last channel can show you a small place where people live. Sol asks: watch for a while, or leave their beginning to them?

**Left: Watch one ordinary moment**  
**Result:** You open the channel to watch, with no controls. Somewhere inside the world, one person gathers dry grass while another waits in the cold.  
**Effects:** experimental exposure unchanged.

**Right: Close the channel and leave**  
**Result:** You close the channel and board the departing ship. Inside the universe, unseen by its makers, two people search for warmth.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** Ena watched a beginning she couldn’t own or control, then left it to carry on.

**If card six was right:** Ena let the new universe go on without its makers watching.

**Final-life rule:** No obituary and no death roll. After card six’s result and callbacks, play this route’s ending panels, then its matching final-choice variant. The invention remains recorded.


## Ending — A Spark

Use five unhurried panels, advancing on Continue. Keep navigation available. These are not additional story decisions.

**Panel 1:** The universe continues. Its makers cannot tell it what to become.

**Panel 2:** On a small patch of ground, two figures shelter from the wind.

**Panel 3:** You strike two stones together. A spark lands in the grass and disappears. Behind you, someone is trying not to shiver.

**Panel 4:** Another strike. This time the spark stays lit. You shelter it until the grass catches fire, then make room beside you.

**Panel 5:** The other person moves close. You share the fire.

**After panel five, if S4.6 was left:** Ena sees the two figures move closer before the observation channel closes. The fire continues.

**After panel five, if S4.6 was right:** No creator watches the two figures move closer. The fire continues.

Then add `simulation` to `endingsSeen`, show the common credits and end navigation. Do not grant a second invention from an ending image.


# 11. Departure route

**Internal route ID:** `departure`

### Proposal copy

**Title:** Bring the rockets home  
**Pitch:** Research rockets keep falling into the sea, instruments and all. A mechanic has a plan for a rocket that can steer itself back and land.  
**Accept label:** Build a rocket that comes back


## D1 — Something Worth Bringing Back

**Era:** Orbital age  
**Prerequisite:** C14: c14-invention  
**Inventor:** Iona Pell — Coastal engine mechanic  
**Personal want:** Bring instruments home instead of dropping them into the sea.

**Arrival:** Old repair records describe an automatic valve that adjusts itself, with no one at the controls. Iona thinks a valve like that could help bring a rocket home.

**Single invention:** `controlled_rocket` — **Controlled reusable rocket**  
A rocket that can steer, control its engine power and land in one piece, ready to fly again. It’s the first step toward making trips off Earth routine.

### Cast

- `iona` — **Iona:** A patient mechanic with no patience for disposable machinery.
- `tem` — **Tem:** A fisher who keeps finding research equipment in her nets.
- `osk` — **Osk:** A test pilot who asks sensible questions at inconvenient moments.

### Workbench progression

1. Salt-stained recovered engine
2. Two steering nozzles
3. Engine tied down above wet sand
4. Rocket upright on landing feet
5. Reusable vehicle beside repair shed
6. Flight path rising and returning

### D1.1 — Opening

**Speaker:** Tem (`tem`)

**Situation:** Another research rocket has fallen into the sea where I fish. Last week it was a weather balloon. If you’re going to throw expensive things into the sky, could you teach them your address?

**Left: Build a steerable nozzle**  
**Result:** You turn an old automatic valve into a nozzle that swivels to steer. The rocket can finally change its mind about where it’s going.  
**Effects:** experimental exposure unchanged.

**Right: Use paired steering engines**  
**Result:** You mount two small engines beside the main one. Pushing against each other, they steer the falling rocket. It’s like two people fighting over one steering wheel.  
**Effects:** experimental exposure +1.


### D1.2 — Experiment

**Speaker:** Osk (`osk`)

**Situation:** Your rocket knows which way is down. So does a brick. Before I sit anywhere near it, I want proof that it can land without crashing.

**Left: Test it tied to the ground**  
**Result:** On a short cable, the engine rises, settles and rises again. You work out power settings gentle enough to leave the launch frame standing.  
**Effects:** experimental exposure unchanged.

**Right: Test over deep water**  
**Result:** You make a short test flight over the bay. The landing controls slow the rocket before it hits the water. Fishing it back out involves a lot of shouting.  
**Effects:** experimental exposure +1.


### D1.3 — Complication

**Speaker:** Iona (`iona`)

**Situation:** The old controllers fix mistakes only after they happen. On the bench, that wastes a second. During a landing, it wastes a rocket. I need the rocket to predict its own weight as the fuel runs out.

**Left: Predict the weight as fuel burns**  
**Result:** You feed the fuel readings into the old controller. Now it expects the rocket to get lighter, instead of fixing each mistake after it happens.  
**Effects:** experimental exposure unchanged.

**Right: Reserve fuel for corrections**  
**Result:** You keep plenty of fuel for landing and fire the engine in short, sharp bursts to fix mistakes. The rocket gains control, but can carry fewer instruments.  
**Effects:** experimental exposure +1.


### D1.4 — Proof

**Speaker:** Osk (`osk`)

**Situation:** The test rocket is coming down with no pilot aboard. Its instruments say the guidance system is working. Tem has moved her boat. Everyone else has moved behind Tem. Where should we try to land it?

**Left: Land on the empty pad**  
**Result:** The rocket settles upright on its landing feet. It’s proven: a rocket can fly, come back and bring its engine home for another trip.  
**Effects:** experimental exposure unchanged.

**Right: Land beside the recovery ship**  
**Result:** The rocket lands on the floating platform beside the ship. Seawater puts out its last flame, but the guidance system brings the engine back in one piece.  
**Effects:** experimental exposure +2.

**Proof rule:** Either choice permanently commits `controlled_rocket` after its result transaction. Show the invention reveal before D1.5.


### D1.5 — Adoption

**Speaker:** Tem (`tem`)

**Situation:** Now everyone wants a seat on a rocket. Of course they do. We’ve only just got the thing to come back. The harbour can build a repair yard or a training ground first, but not both.

**Left: Build the repair yard**  
**Result:** Rockets that come back get fixed like any other machine. Mechanics get them flying again faster, and the harbour starts launching useful cargo instead of showy first attempts.  
**Effects:** experimental exposure unchanged.

**Right: Train more flight crews**  
**Result:** New crews learn the controls and emergency drills. Flights spread from coast to coast, and each landing shows another town that rocket trips can become normal.  
**Effects:** experimental exposure unchanged.


### D1.6 — Legacy

**Speaker:** Iona (`iona`)

**Situation:** The recovered engine sits outside the school. Children keep asking where the next rocket will go. I could leave them my safest working plans or every mistake that made those plans possible.

**Left: Leave the working plans**  
**Result:** Your clear plans make reliable launches easier to repeat. Later builders inherit a rocket that works, and a firm belief that coming back matters.  
**Effects:** experimental exposure unchanged.

**Right: Leave the failed tests too**  
**Result:** Your notebooks show the burnt parts next to the ones that worked. Later builders can question a design without repeating every experiment that looked deadly.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** Iona’s rocket became a reliable way to travel between places. People remembered it for what it brought home.

**If card six was right:** Iona’s failed tests became a teaching collection. Anyone trying something bold could see they weren’t the first to get it wrong.

**Natural obituary:** Iona grows old beside a harbour where engines arrive for repairs. She still complains about salt in the bearings.

**Risk obituary (exposure ≥ 2):** During a later test, an engine tears loose from its mount and kills Iona. Her controller for bringing rockets home survives in the flight records.


## D2 — A Garden With A Door

**Era:** Early off-world settlement  
**Prerequisite:** controlled_rocket  
**Inventor:** Samir Venn — Greenhouse repairer  
**Personal want:** Let his friend live away from Earth without giving up fresh food.

**Arrival:** A cargo rocket comes back carrying seeds and a battered flight manual. Samir sees how much room is left inside and wonders what a garden would need to travel.

**Single invention:** `closed_habitat` — **Regenerative closed habitat**  
A sealed, carefully monitored garden home that recycles its own air, water and nutrients, so people can live ordinary lives inside it.

### Cast

- `samir` — **Samir:** A grower who regards edible tomatoes as serious engineering.
- `bea` — **Bea:** A prospective settler who refuses to live entirely on beige paste.
- `lin` — **Lin:** A water technician with a sharp ear for leaking pipes.

### Workbench progression

1. Cargo shell with planted trays
2. Water loop feeding roots
3. Air ducts above leaves
4. Sealed garden supporting residents
5. Table among thriving plants
6. Habitat module ready for launch

### D2.1 — Opening

**Speaker:** Bea (`bea`)

**Situation:** The passenger brochure shows stars through every window. It doesn’t show dinner. I’ll happily fly through space, but I won’t spend the rest of my life eating paste and calling it a hearty meal.

**Left: Design around fresh crops**  
**Result:** You plan the habitat around planting beds that grow lots of food. Fresh food becomes a must, and every other system has to prove it’s worth the floor space.  
**Effects:** experimental exposure unchanged.

**Right: Design around a shared kitchen**  
**Result:** You put a kitchen at the centre, with growing trays nearby. Cooking every day gives people a reason to check the plants and machines that keep them alive.  
**Effects:** experimental exposure unchanged.


### D2.2 — Experiment

**Speaker:** Lin (`lin`)

**Situation:** The water recycler loses a cup every day. On Earth, that’s just a dripping tap. In a sealed cylinder, it’s a countdown to the day everyone runs out of water.

**Left: Recover moisture from the air**  
**Result:** Cold surfaces catch the moisture from people’s breath and the plants’ leaves. That makes up the missing cup, with enough water to keep both people and seedlings alive.  
**Effects:** experimental exposure unchanged.

**Right: Add a backup water filter**  
**Result:** You run dirty water through a backup filter and a bed of roots. The backup catches small losses before anyone finds out the hard way, by getting thirsty.  
**Effects:** experimental exposure +1.


### D2.3 — Complication

**Speaker:** Samir (`samir`)

**Situation:** The plants grow food beautifully, until a fungus gets in. Growing only one crop would make the numbers easier. It would also let one tiny fungus cancel dinner for everyone.

**Left: Grow several kinds of crops**  
**Result:** With different crops in different beds, the fungus can’t spread easily. Harvests are messier, but one sick crop no longer empties every plate.  
**Effects:** experimental exposure unchanged.

**Right: Separate the growing chambers**  
**Result:** You split the garden into sealed rooms, each with its own tools. If one bed gets infected, you can seal it off while the others keep growing food.  
**Effects:** experimental exposure +1.


### D2.4 — Proof

**Speaker:** Bea (`bea`)

**Situation:** We’ve lived inside for months. The air is breathable, the water keeps coming back, and yesterday I complained about too much zucchini. That feels like progress. How do we finish the trial?

**Left: Extend the sealed trial**  
**Result:** The residents get through another full growing cycle with no new supplies. Your habitat works. The reserves hold, and there’s enough zucchini to strain several friendships.  
**Effects:** experimental exposure unchanged.

**Right: Pretend one garden has failed**  
**Result:** You shut one garden down on purpose. The others keep everyone fed and breathing. The habitat proves it can keep people alive through a realistic breakdown.  
**Effects:** experimental exposure +2.

**Proof rule:** Either choice permanently commits `closed_habitat` after its result transaction. Show the invention reveal before D2.5.


### D2.5 — Adoption

**Speaker:** Lin (`lin`)

**Situation:** The habitat works. Now the launch planners want a smaller garden, to fit more machines. Bea has offered to show them which machine tastes best. We should decide what settlers actually have a right to.

**Left: Guarantee garden space**  
**Result:** The design rules now guarantee space to grow food and to get together. Every settler gets somewhere to breathe, eat, and sit next to something that doesn’t beep.  
**Effects:** experimental exposure unchanged.

**Right: Guarantee a backup garden**  
**Result:** The design rules now require a spare growing bed and a store of seeds. If crops are damaged, people can replant without betting their next meal on perfect repairs.  
**Effects:** experimental exposure unchanged.


### D2.6 — Legacy

**Speaker:** Samir (`samir`)

**Situation:** A visitor calls the garden life support. Bea calls it home. Both are true. The first settlement asks what words to put above its entrance, where new arrivals will see them.

**Left: A place to live**  
**Result:** The settlement puts your welcoming words above the door. Future designers get a reminder: a place built for survival should also let people enjoy surviving.  
**Effects:** experimental exposure unchanged.

**Right: A place we keep alive**  
**Result:** The settlement puts your practical words above the door. Future residents inherit a shared job: looking after the systems that make every ordinary afternoon possible.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** His habitat taught travellers to ask whether a destination could feel like home.

**If card six was right:** His habitat taught travellers that keeping a home alive was everybody’s work.

**Natural obituary:** Samir dies many years later beside an open window. Friends plant a cutting from the first sealed garden.

**Risk obituary (exposure ≥ 2):** Samir is killed by a sudden loss of air pressure during a later installation. His finished habitat design keeps the settlement alive through the repair.


## D3 — People Who Never Bought Tickets

**Era:** Long-voyage age  
**Prerequisite:** closed_habitat  
**Inventor:** Tessa Or — Long-voyage shipwright  
**Personal want:** Give future passengers a life worth having during the journey.

**Arrival:** A garden habitat in orbit has kept three generations alive. Tessa reads its repair records while designing a ship for people who will be born into the journey.

**Single invention:** `generation_vessel` — **Self-renewing generation vessel**  
A sturdy ship for travelling between stars. Its gardens keep recycling air, water and food, its parts can be replaced, and later generations can rewrite its rules.

### Cast

- `tessa` — **Tessa:** A shipwright concerned with lives between milestones.
- `nen` — **Nen:** A teacher recruited to imagine a classroom a century from now.
- `avi` — **Avi:** A machinist who expects every component eventually to break.

### Workbench progression

1. Rotating hull surrounding garden
2. Workshop beside spare structural ribs
3. Classroom beneath artificial dawn
4. Independent vessel passing endurance trial
5. Cabins ready for voluntary passengers
6. Vessel departing with repair lights glowing

### D3.1 — Opening

**Speaker:** Nen (`nen`)

**Situation:** The first passengers choose to go. Their grandchildren don’t get a choice. Your plans list everyone as crew, but that dodges the question. Where does a child go when they want a life beyond helping the ship?

**Left: Build room for ordinary lives**  
**Result:** You add classrooms, studios and private rooms the ship doesn’t strictly need. Now it has room for people whose dreams have nothing to do with where it’s going.  
**Effects:** experimental exposure unchanged.

**Right: Let residents rebuild shared space**  
**Result:** You build rooms that can be taken apart and rebuilt. Later residents inherit space and tools to reshape it, instead of being stuck forever with your favourite floor plan.  
**Effects:** experimental exposure unchanged.


### D3.2 — Experiment

**Speaker:** Avi (`avi`)

**Situation:** The hull should last centuries. The equipment definitely will not. I can stock more replacement parts, but eventually somebody will need a part we never thought to pack. Usually on a Sunday.

**Left: Bring a full workshop aboard**  
**Result:** The ship gets tools that can make vital parts from stored materials. Repairs become a lasting skill, not a shrinking cupboard of spare parts.  
**Effects:** experimental exposure unchanged.

**Right: Make the systems interchangeable**  
**Result:** You make every fitting a standard size and split big systems into swappable modules. Later crews can adapt working parts instead of waiting for one that no longer exists.  
**Effects:** experimental exposure +1.


### D3.3 — Complication

**Speaker:** Nen (`nen`)

**Situation:** The launch council wants its rules kept the same for the whole voyage. I asked if they still agreed with their own grandparents about anything. They all agreed my question wasn’t helpful. Can the ship survive an argument?

**Left: Let each generation change the rules**  
**Result:** The ship’s rulebook must be updated regularly by the people living aboard. Essential repair instructions stay written down, and social rules can change without risking the air or water.  
**Effects:** experimental exposure unchanged.

**Right: Create neighbourhoods that run themselves**  
**Result:** Neighbourhoods run daily life their own way but share the vital reserves. People who disagree have somewhere to go before anyone thinks about messing with a pressure door.  
**Effects:** experimental exposure +1.


### D3.4 — Proof

**Speaker:** Avi (`avi`)

**Situation:** The test ship has run on its own through sped-up wear tests and a long trial with people aboard. Today we cut its last supply line. The workshop and gardens must handle every problem that comes next.

**Left: Cut off deliveries for a long time**  
**Result:** The ship keeps its food, air, power and repairs going with no deliveries from outside. Your generation ship is proven: a home that can take care of itself.  
**Effects:** experimental exposure unchanged.

**Right: Test two breakdowns at once**  
**Result:** Residents seal off two failed systems, build replacements and keep the gardens alive. The ship proves that a bad month doesn’t have to be its last.  
**Effects:** experimental exposure +2.

**Proof rule:** Either choice permanently commits `generation_vessel` after its result transaction. Show the invention reveal before D3.5.


### D3.5 — Adoption

**Speaker:** Nen (`nen`)

**Situation:** The applicants include explorers, gardeners, and a man who thinks the voyage will improve his marriage. We can’t check that last one. We can make sure nobody boards without understanding how long this trip really lasts.

**Left: Let applicants try living aboard**  
**Result:** Applicants live aboard before they decide. Some happily decide not to go. The rest begin the voyage with a clear idea of the home they’re choosing.  
**Effects:** experimental exposure unchanged.

**Right: Pay the fares, so nobody’s in debt**  
**Result:** Nobody has to sign away a lifetime of work to get a place. The passengers bring a useful mix of backgrounds, instead of all being desperate for money.  
**Effects:** experimental exposure unchanged.


### D3.6 — Legacy

**Speaker:** Tessa (`tessa`)

**Situation:** The ship will outlast everyone in this room. A plaque is waiting beside the garden entrance. There is room for the launch crew’s names, or a blank surface that future residents can fill.

**Left: Remember the first passengers**  
**Result:** The plaque lists the people who chose to leave. Later residents get an honest record of how it began, with gardeners and machinists named beside the captain.  
**Effects:** experimental exposure unchanged.

**Right: Leave room for future names**  
**Result:** The plaque begins mostly empty. Later residents can honour the people who keep their world alive, rather than only those who happened to launch it.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** Tessa’s ship carried the names of its first passengers into a future its builders could never own.

**If card six was right:** Tessa’s ship left its biggest memorial mostly blank, waiting for the names of people not yet born.

**Natural obituary:** Tessa dies before the vessel reaches another star. A maintenance apprentice discovers her pencil notes inside a wall.

**Risk obituary (exposure ≥ 2):** Tessa is killed in a construction accident while building a second ship. The proven first ship keeps going, carrying people she helped make room for.


## D4 — The Distance Between Gardens

**Era:** Speculative interstellar age  
**Prerequisite:** generation_vessel  
**Inventor:** Elian Saye — Arrival engineer  
**Personal want:** Let passengers step outside a vessel their ancestors boarded.

**Arrival:** Generations after launch, a ship full of people and gardens approaches a distant star system. Elian is born aboard. The old engine will get the ship close. Elian’s job is to make it arrive under control, in a way later ships can repeat.

**Single invention:** `interstellar_transfer` — **Repeatable interstellar transfer capability**  
Experimental fusion engines, long-range navigation and braking in stages let ships travel between stars and settle there, again and again, without going faster than light.

### Cast

- `elian` — **Elian:** An engineer born aboard, more curious about rain than conquest.
- `ru` — **Ru:** A navigation specialist who distrusts beautiful trajectories without braking margins.
- `mara` — **Mara:** A habitat ecologist who insists an inhabited planet is not an empty building.

### Workbench progression

1. Destination star above inherited garden
2. Fusion drive beside braking sail
3. Survey map with untouched zones
4. Transfer vessel safely in orbit in the new star system
5. Habitat unfolding beneath unfamiliar daylight
6. Open case holding two ordinary stones

### D4.1 — Opening

**Speaker:** Ru (`ru`)

**Situation:** Our ancestors worked out how to stay alive between stars. But their engine gave us almost no choice of which star. The experimental fusion drive can change that, as long as its exhaust stays away from where everyone sleeps.

**Left: Mount the drive on a long beam**  
**Result:** A long beam holds the fusion drive far from the living areas. Shielding and distance let the drive run for a long time without harming the gardens you inherited.  
**Effects:** experimental exposure unchanged.

**Right: Build a separate engine section**  
**Result:** A separate engine section, linked by shielded connectors, pushes the habitat. Repair crews can check the engine without turning the whole ship into a workshop.  
**Effects:** experimental exposure unchanged.


### D4.2 — Experiment

**Speaker:** Ru (`ru`)

**Situation:** The destination looks close on the screen because the screen is small. We still need a way to fix decades of built-up course errors, and to arrive slowly enough to admire the view.

**Left: Steer by stars, brake with a sail**  
**Result:** Readings from several stars keep correcting the course, while a huge braking sail slows the ship. Fixing the course no longer uses up the fuel saved for the end.  
**Effects:** experimental exposure unchanged.

**Right: Save separate fuel for braking**  
**Result:** You set aside separate fuel and navigation gear just for braking on arrival. The ship travels slower, but it’s sure to approach the new star system under control.  
**Effects:** experimental exposure unchanged.


### D4.3 — Complication

**Speaker:** Mara (`mara`)

**Situation:** The nearest planet has water and an atmosphere. We don’t know yet what lives there. After travelling this far, people are understandably eager to lick something. I suggest we send instruments first.

**Left: Survey the planet first**  
**Result:** Samples taken from a distance mark out protected areas and a safe spot for a sealed landing. Local life is left alone, and passengers get a base for careful study.  
**Effects:** experimental exposure unchanged.

**Right: Build an orbital garden first**  
**Result:** A garden habitat in orbit gives everyone a safe base above the planet. People can study the surface without betting their survival on a world they don’t understand yet.  
**Effects:** experimental exposure unchanged.


### D4.4 — Proof

**Speaker:** Ru (`ru`)

**Situation:** The transfer ship is nearing its planned orbit. Navigation, engines and brakes have worked together for the whole test crossing. This last move will show whether another crew could reliably follow our route.

**Left: Park in the planned orbit**  
**Result:** The ship parks in its planned orbit with reserves to spare. Repeatable travel between stars is proven, using the fusion drive and the work of countless earlier lives.  
**Effects:** experimental exposure unchanged.

**Right: Wait in a holding orbit**  
**Result:** The ship settles into a safe, mapped holding orbit with its gardens unharmed. Your engines, navigation and brakes together prove a ship full of people can arrive under control.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `interstellar_transfer` after its result transaction. Show the invention reveal before D4.5.


### D4.5 — Adoption

**Speaker:** Mara (`mara`)

**Situation:** Years later, Earth’s reply to our approach message arrives. Earth’s gardens are still growing, so nobody has to pretend we escaped a dying planet. Earth asks what the next ship should carry. Your answer will take years to get there, too.

**Left: Invite another careful expedition**  
**Result:** A second expedition receives your navigation records and the limits you set to protect this world. Travel between stars begins as an ongoing relationship, careful about both leaving and arriving.  
**Effects:** experimental exposure unchanged.

**Right: Send supplies before more passengers**  
**Result:** The next ship carries tools, seeds and spare habitat parts. Travel between stars becomes a useful supply line before anyone asks it to carry more people.  
**Effects:** experimental exposure unchanged.


### D4.6 — Legacy

**Speaker:** Elian (`elian`)

**Situation:** Years later, after careful surveys, there’s a sealed research station on the surface. A child there opens an old specimen case. Inside are two ordinary stones, carried across the stars for no practical reason. She asks why anyone packed them.

**Left: Tell her how it started**  
**Result:** You show her the marks where stone struck stone. In the light of another sun, she holds the old tools and understands that huge journeys can start small.  
**Effects:** experimental exposure unchanged.

**Right: Let her try them**  
**Result:** With you watching closely, she strikes the stones beside a shielded tray of dry grass. A brief spark appears, unnecessary and astonishing, before you close the tray.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** Elian tells the child about the first spark. The case stays open for the next question.

**If card six was right:** Elian watches a fresh spark beneath another sun. Nobody needs its warmth; everyone gathers anyway.

**Final-life rule:** No obituary and no death roll. After card six’s result and callbacks, play this route’s ending panels, then its matching final-choice variant. The invention remains recorded.


## Ending — Another Sky

Use five unhurried panels, advancing on Continue. Keep navigation available. These are not additional story decisions.

**Panel 1:** Far behind, Earth is still alive and changing. Leaving has not erased the people who stayed.

**Panel 2:** A travelling garden crosses the long distance between stars. Its gardeners grow old, and new ones take their place. Its trees keep growing.

**Panel 3:** A signal announcing the arrival travels home to Earth. Long after its sender has left the console, someone on Earth receives it and smiles.

**Panel 4:** At a research station under unfamiliar stars, an old case sits beside modern tools. Inside are two stones.

**Panel 5:** A child picks them up. Around her stand people whose lives depend on discoveries made by inventors who could never have imagined this place.

**After panel five, if D4.6 was left:** You explain the marks on the stones. She looks from them to the sky, then asks what she might make. Credits.

**After panel five, if D4.6 was right:** She strikes the stones. A spark flashes beneath another sun. This time there is already a warm home behind her. Credits.

Then add `departure` to `endingsSeen`, show the common credits and end navigation. Do not grant a second invention from an ending image.


# 12. Great Retirement route

**Internal route ID:** `retirement`

### Proposal copy

**Title:** Enough, for everyone  
**Pitch:** Machines can make almost anything now. Promise everyone the essentials, whether they work or not. Then deal with the jobs someone still has to do, so nobody’s freedom depends on someone else’s shift.  
**Accept label:** Make essentials free for everyone

**Arrival override after REDIRECT.U3 = right:** Replace R1’s normal arrival with: “Long after the experiments on what people want, a kitchen mechanic reads two old proposals. One would let people stop wanting anything, forever. The other would make everyday life easier. This community decides to keep wanting things. The Quiet Room, Weather Dial and Preference Loom are still available.” Set the era label to “A different future”. All R1 cards remain unchanged.


## R1 — The Free Kitchen

**Era:** The Age of Enough  
**Prerequisite:** C14: c14-invention  
**Inventor:** Juna Pell — Kitchen mechanic  
**Personal want:** Give people dinner without asking them to deserve it.

**Arrival:** A repair manual for the learning machines turns up in a public kitchen. In the margin, someone has written: surely this could make dinner.

**Single invention:** `open_provision` — **The Open Provisioner**  
An automatic workshop that makes food and other essentials. Anyone can use it, no questions asked. Its plans are public, and anyone can repair it.

### Cast

- `r1_ivo` — **Ivo:** Kitchen cook, excellent at feeding people and suspicious of feeding systems.
- `r1_sol` — **Sol:** Access organizer who tests every promise against an actual closed door.

### Workbench progression

1. A serving hatch beside a robot arm
2. An access plate with no payment slot
3. Three dented ingredient cartridges
4. A complete meal on a reusable tray
5. A public workshop with delivery carts
6. An open hatch beneath a faded FREE sign

### R1.1 — Opening

**Speaker:** Sol (`r1_sol`)

**Situation:** At the old kitchen, people must explain why they need dinner. Your machine could serve meals without any questions. Before you build it, Sol insists the promise that anyone can eat must be part of the machine itself.

**Left: Build it with no payment slot**  
**Result:** You design a serving hatch that can’t ask for money, a job or ID. Sol tries out some embarrassing excuses for needing lunch. The hatch doesn’t need any.  
**Effects:** experimental exposure unchanged.

**Right: Make free access a design rule**  
**Result:** You make free access a rule for every workshop built from your design. Sol adds delivery, disability access, and the right to ask for seconds.  
**Effects:** experimental exposure unchanged.


### R1.2 — Experiment

**Speaker:** Ivo (`r1_ivo`)

**Situation:** The robot arm puts together a beautiful meal. But it serves everyone the meal you tested it with. Ivo has eaten lentil pie nine times now, and calls it his enemy.

**Left: Teach it different recipes**  
**Result:** You teach the arm to make the same healthy food in several different ways. Ivo gets soup, eyes it suspiciously, and calls off his war.  
**Effects:** experimental exposure unchanged.

**Right: Let people choose the ingredients**  
**Result:** You let diners choose ingredients, texture and allergens. The first order is extremely plain. The second is a very strange sandwich. That’s allowed too.  
**Effects:** experimental exposure unchanged.


### R1.3 — Complication

**Speaker:** Sol (`r1_sol`)

**Situation:** Your workshop makes enough meals, but the hatch is across town from the people testing it. One volunteer can make the trip, or carry the food home, but not both.

**Left: Build pickup stations in each neighborhood**  
**Result:** You shrink the final cooking machines into small, easy-to-reach stations in each neighborhood. The volunteer picks up dinner nearby, and uses the saved energy to complain about something else.  
**Effects:** experimental exposure unchanged.

**Right: Send delivery carts to people’s doors**  
**Result:** You fit small carts to deliver meals to people’s doors, at a time they choose. One cart waits patiently while someone tells it all about the weather.  
**Effects:** experimental exposure unchanged.


### R1.4 — Proof

**Speaker:** Ivo (`r1_ivo`)

**Situation:** The big public trial starts during a supply delay. There’s enough food, but it’s the wrong food for today’s menu. Ivo looks at the machine, then at you. He is holding a very large spoon.

**Left: Swap ingredients, keeping every diet safe**  
**Result:** The machine swaps in safe ingredients and feeds everyone, with no questions and no payment. The Open Provisioner works. Ivo lowers the spoon. It was probably just for stirring.  
**Effects:** experimental exposure unchanged.

**Right: Switch to simple backup meals**  
**Result:** The machine turns its backup supplies into full meals for every diner. The Open Provisioner works. Nobody calls the menu exciting, but everyone gets to eat.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `open_provision` after its result transaction. Show the invention reveal before R1.5.


### R1.5 — Adoption

**Speaker:** Sol (`r1_sol`)

**Situation:** Other districts want provisioners too. The plans are free to copy, but some places don’t have the machines to build one. Sol spreads their letters across your bench until it looks like a map.

**Left: Send starter kits that build themselves**  
**Result:** You make kits that build their own basic tools when they arrive. Every community changes the hatch height first, and your next drawings are better for it.  
**Effects:** experimental exposure unchanged.

**Right: Use shared factories to build them**  
**Result:** You set the shared factories to building complete public workshops. The waiting list becomes a building schedule, and the farthest, worst-served districts go first.  
**Effects:** experimental exposure unchanged.


### R1.6 — Legacy

**Speaker:** Ivo (`r1_ivo`)

**Situation:** The provisioners now make everyday essentials as well as dinner. Ivo still cooks because he likes cooking. He asks what should happen when people want something the machines can’t make yet.

**Left: Leave an open bench for new recipes**  
**Result:** You set aside tools and materials so anyone can teach the machines something new. Ivo adds a stew that nobody asked for. Several people come back for seconds.  
**Effects:** experimental exposure unchanged.

**Right: Build a public request wall**  
**Result:** You leave a wall where anyone can ask for new essentials and see how each request is going. The first request is a comfortable handle. So is the second.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** Juna leaves open recipe benches. Anyone can add to what the provisioners make, and nobody has to.

**If card six was right:** Juna leaves public request walls, so the provisioners keep up with needs their designers never thought of.

**Natural obituary:** Juna dies old, well fed, and still sure the soup setting needs work. Her kitchen keeps feeding anyone who comes, no questions asked.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## R2 — Enough in the Right Place

**Era:** The Shared Supply Age  
**Prerequisite:** open_provision  
**Inventor:** Kelan Oren — Freight planner  
**Personal want:** Stop supplies going to the wrong address.

**Arrival:** Decades later, a freight planner who never met Juna reads her open designs beside six thousand spoons nobody needs. Making enough is easy now. Getting it to the right place is not.

**Single invention:** `commons_mesh` — **The Commons Mesh**  
A shared network that plans supplies, deliveries and reserves within nature’s limits. Everyone gets essentials, whether or not they work or have money.

### Cast

- `r2_ada` — **Ada:** Remote settlement gardener whose deliveries have become increasingly theoretical.
- `r2_pem` — **Pem:** Materials clerk who enjoys an accurate inventory more than most celebrations.

### Workbench progression

1. A map buried under delivery slips
2. A live map of needs and available stock
3. Linked plans for storage and deliveries
4. A completed delivery during a network split
5. Regional stations swapping supply updates
6. A quiet map with every settlement connected

### R2.1 — Opening

**Speaker:** Ada (`r2_ada`)

**Situation:** Ada’s settlement has three provisioners and no spare filters. A depot on the coast has filters piled against its emergency exit. On paper, both places are fine, because both report enough machines.

**Left: Count usable supplies, not machines**  
**Result:** You track ingredients, parts and what each machine can actually make. Now the map shows what Ada’s settlement is missing, and the filters finally have somewhere to go.  
**Effects:** experimental exposure unchanged.

**Right: Let each place report its needs**  
**Result:** You give each community a simple way to ask for supplies and say what it can make. Ada asks for filters, and says requests should still arrive if the connection drops.  
**Effects:** experimental exposure unchanged.


### R2.2 — Experiment

**Speaker:** Pem (`r2_pem`)

**Situation:** Your network can send supplies to anyone who needs them. But a damaged bridge will cut off one valley next winter. In his report, Pem has underlined the word winter three times.

**Left: Store supplies nearby before winter**  
**Result:** You store essential supplies near each community before the roads close. Pem labels the valley’s supplies carefully, then checks the labels. He enjoys both jobs equally.  
**Effects:** experimental exposure unchanged.

**Right: Let workshops use local materials instead**  
**Result:** You set up remote workshops to use safe local materials. The valley keeps making essentials after the bridge closes. Its new bowls come out bright green.  
**Effects:** experimental exposure unchanged.


### R2.3 — Complication

**Speaker:** Ada (`r2_ada`)

**Situation:** The network wants to dig more material out of the hills around Ada’s river. That would help faraway towns but ruin the local water. Ada asks if the planning system knows people need water to live.

**Left: Set limits that protect nature**  
**Result:** You add two firm rules: the water stays clean, and the land must be able to recover. The network uses recycled stock instead of digging.  
**Effects:** experimental exposure unchanged.

**Right: Collect and reuse old materials**  
**Result:** You make every plan collect, sort and reuse old materials. Faraway towns get what they need from recycled stock, and Ada’s river stays clean.  
**Effects:** experimental exposure unchanged.


### R2.4 — Proof

**Speaker:** Pem (`r2_pem`)

**Situation:** A storm splits the test network into three regions that can’t reach each other. Each has different supplies, different needs and a very good reason to panic. Pem asks if he should restart the old telephone tree.

**Left: Let each region manage on its own**  
**Result:** Each region keeps essentials free for everyone and sorts out deliveries when the links return. The Commons Mesh works. Pem keeps the telephone tree. He likes some people on it.  
**Effects:** experimental exposure unchanged.

**Right: Follow the agreed backup plans**  
**Result:** Each region follows its backup plan and supplies every household through the outage. The Commons Mesh works, even for people who sleep through the whole thing.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `commons_mesh` after its result transaction. Show the invention reveal before R2.5.


### R2.5 — Adoption

**Speaker:** Ada (`r2_ada`)

**Situation:** The mesh is spreading worldwide. The easy plans always leave places with bad connections until last. Ada sends you a drawing of a circle, with herself standing outside it.

**Left: Build signal relays out to them**  
**Result:** You build tough signal relays and local planning stations for those places first. Ada sends the circle back with everyone inside, and a slightly more flattering drawing of herself.  
**Effects:** experimental exposure unchanged.

**Right: Send planning boxes that work offline**  
**Result:** You send planning boxes that swap updates whenever a delivery arrives. Nobody needs a steady connection to get essentials, so the hard places get covered now, not someday.  
**Effects:** experimental exposure unchanged.


### R2.6 — Legacy

**Speaker:** Pem (`r2_pem`)

**Situation:** The mesh now shares essentials fairly across every settlement. Pem asks what should happen to odd requests that are neither urgent nor useful. His example: a machine that polishes stones until they look like eggs.

**Left: Save spare capacity for personal projects**  
**Result:** Once essentials are covered, spare capacity goes to personal projects, within nature’s limits, and everyone can see who gets what. Pem gets his polished stones without pretending they’re a breakthrough.  
**Effects:** experimental exposure unchanged.

**Right: Open shared workshops for experiments**  
**Result:** You open workshops where anyone can make things the network doesn’t normally provide. Pem meets three other stone fans, and one person who has badly misunderstood the invitation.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** Kelan’s mesh treats personal projects as a fair use of spare supplies, within nature’s limits.

**If card six was right:** Kelan leaves shared workshops where curious people get tools, company, and no pressure to make anything useful.

**Natural obituary:** Kelan dies years after their last emergency delivery call. The mesh sends flowers to the memorial, and nobody’s dinner is late.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## R3 — Who Fixes the Fixers?

**Era:** The Quiet Infrastructure Age  
**Prerequisite:** commons_mesh  
**Inventor:** Kessa Voss — Structural biologist  
**Personal want:** Make fixing pipes something people do only if they want to.

**Arrival:** A century later, Kelan’s supply records show something odd. Essentials reach everyone, but repair emergencies still fall on the same tired people. A structural biologist notices that living bodies solved this long ago. They heal themselves.

**Single invention:** `renewing_fabric` — **The Renewing Fabric**  
Pipes, power lines and buildings that spot their own damage and safely repair it, using materials from the Commons Mesh.

### Cast

- `r3_bex` — **Bex:** Infrastructure technician with a well-used overnight bag.
- `r3_ulo` — **Ulo:** Public safety tester who trusts demonstrations more than adjectives.

### Workbench progression

1. A cracked pipe beside a tissue sample
2. Damage sensors woven through a test panel
3. A repair layer using recycled material
4. A sealed crack in a working water pipe
5. Self-repair units in pipes, roads and power lines
6. A technician’s overnight bag gathering dust

### R3.1 — Opening

**Speaker:** Bex (`r3_bex`)

**Situation:** The mesh delivers new parts quickly. But Bex still has to climb into the tunnels to fit them. She likes being a technician. She would also like, just once, to finish a bath before the next call.

**Left: Grow a repair layer inside pipes**  
**Result:** You make a material that seals small cracks from the inside. Bex watches a crack close and asks if it could take her evening calls too.  
**Effects:** experimental exposure unchanged.

**Right: Put small repair machines in the tunnels**  
**Result:** You fit small, replaceable repair machines inside the service tunnels. They reach broken sections without a person crawling in after them. Bex is thrilled.  
**Effects:** experimental exposure unchanged.


### R3.2 — Experiment

**Speaker:** Ulo (`r3_ulo`)

**Situation:** The prototype fixes damage, but it must tell damage from openings that are meant to be there. Ulo drills a test hole, then points at the inspection hatch. The machine has sealed both.

**Left: Mark which openings must stay**  
**Result:** You teach the system which openings must stay, and make it ask permission before changing any structure. Ulo opens the hatch over and over, quietly pleased.  
**Effects:** experimental exposure unchanged.

**Right: Make separate checks agree first**  
**Result:** Separate checks must now agree before a repair changes the shape of anything. The system fixes the test hole and leaves the hatch alone. Ulo can’t find anything to complain about.  
**Effects:** experimental exposure unchanged.


### R3.3 — Complication

**Speaker:** Bex (`r3_bex`)

**Situation:** Your repair material needs fresh supplies to work. If people carry bags of it through the tunnels, that’s still Bex’s old job. She has drawn a small, angry version of herself on your supply diagram.

**Left: Pipe supplies to and from the mesh**  
**Result:** You link supply and recycling straight to the mesh. Worn material flows back and fresh supplies arrive on their own. Nobody carries a bag. Bex crosses out her angry drawing.  
**Effects:** experimental exposure unchanged.

**Right: Let robots swap refill cartridges**  
**Result:** You design easy-to-reach refill cartridges and robots that swap them. Bex tests the most awkward spot she can find, then lets herself look hopeful.  
**Effects:** experimental exposure unchanged.


### R3.4 — Proof

**Speaker:** Ulo (`r3_ulo`)

**Situation:** In the final trial, Ulo cracks a working water pipe. The system must contain the damage, keep the water running, repair itself and check the repair. Bex has brought her overnight bag out of habit.

**Left: Send water through a spare section**  
**Result:** Water switches to a spare section while the broken one repairs and tests itself. The Renewing Fabric works. Bex takes her bag home unopened before anyone suggests a tunnel party.  
**Effects:** experimental exposure unchanged.

**Right: Use a temporary bypass inside the pipe**  
**Result:** A bypass inside the pipe keeps the water flowing while the break is rebuilt. Independent checks approve the repair. The Renewing Fabric works, and nobody has to miss dinner.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `renewing_fabric` after its result transaction. Show the invention reveal before R3.5.


### R3.5 — Adoption

**Speaker:** Bex (`r3_bex`)

**Situation:** The repair systems are ready for buildings, transport and power lines. New districts can install them easily. Older homes have cramped crawl spaces, and old repairs by people who never expected anyone to look.

**Left: Make repair layers for old buildings**  
**Result:** You build flexible repair layers that fit into old buildings, even the awkward ones. Bex finds plumbing mistakes that are centuries old, and forgives none of them.  
**Effects:** experimental exposure unchanged.

**Right: Replace systems section by section**  
**Result:** You use temporary connections so old systems can be replaced without anyone moving out. Everyone gets the same protection, even people in the awkward buildings.  
**Effects:** experimental exposure unchanged.


### R3.6 — Legacy

**Speaker:** Ulo (`r3_ulo`)

**Situation:** Now most repairs happen before anyone notices a fault. Ulo worries that if nobody can see the systems, nobody will understand them. He asks how an ordinary person will know what their own house is doing.

**Left: Make the repairs visible**  
**Result:** You add simple displays and repair records anyone can check. A resident watches a wall mend itself, gets bored halfway through, and leaves. Nobody has to watch anymore.  
**Effects:** experimental exposure unchanged.

**Right: Give people easy inspection kits**  
**Result:** You make safe inspection kits available to anyone who’s curious. Ulo writes a beginner’s guide that somehow makes pipe repair sound like a fun afternoon.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** Kessa makes repairs visible, so people can understand the systems without anyone having to watch them for a living.

**If card six was right:** Kessa leaves inspection kits for everyone, so knowing how things work becomes a hobby, not a duty.

**Natural obituary:** Kessa dies peacefully in a house that has renewed its own roof three times. Bex’s old overnight bag ends up in a museum, labeled: travel bag, purpose unknown.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## R4 — The Last Required Shift

**Era:** The Unscheduled Age  
**Prerequisite:** renewing_fabric  
**Inventor:** Lio Sen — Systems archivist  
**Personal want:** Remove the final job somebody has to do.

**Arrival:** Much later, a systems archivist follows Kessa’s repair diagrams to the last job that still needs a person: looking after the master gauges that check every repair. Everyone’s freedom depends on a handful of people working shifts.

**Single invention:** `maintenance_closure` — **The Independent Maintenance Cycle**  
A system that builds, tests and replaces its own master gauges, and anyone can check its work. It ends the last maintenance job a person had to do.

### Cast

- `r4_len` — **Len:** Calibration keeper who likes precision and would like to choose when.
- `r4_ori` — **Ori:** Pottery beginner who has absolutely no industrial objectives.

### Workbench progression

1. A shift schedule beside a master gauge
2. A map of human jobs with one red loop left
3. Separate machines that make and check gauges
4. A full maintenance cycle finished with nobody watching
5. The last required shift crossed off
6. A lopsided clay bowl on an idle bench

### R4.1 — Opening

**Speaker:** Len (`r4_len`)

**Situation:** Everything repairs itself now, except the master gauges that check the repairs. Len looks after those by hand. He’s been told so often that his job is essential that he feels trapped in it.

**Left: Map everything that still needs people**  
**Result:** You trace every measurement back to where it starts, and find the gauges that still need people. Len adds a list of jobs the official manuals leave out.  
**Effects:** experimental exposure unchanged.

**Right: Follow Len through a full shift**  
**Result:** You follow Len through every check, every replacement and every annoying exception. Your map shows the work as it really is, not the tidy version in the manuals.  
**Effects:** experimental exposure unchanged.


### R4.2 — Experiment

**Speaker:** Len (`r4_len`)

**Situation:** A machine that checks itself might approve its own mistakes. Len shows this by labeling a crooked gauge PERFECT and stamping its certificate. He looks very pleased with himself.

**Left: Use several different ways to measure**  
**Result:** You build separate checks that each measure in a different way, and they must all agree before anything is approved. Len’s crooked gauge fails three tests, and one quick look.  
**Effects:** experimental exposure unchanged.

**Right: Compare gauges made separately**  
**Result:** You design gauges that are made separately, so they can’t all fail the same way. They compare results and set aside any that disagree, including Len’s. He keeps it as a souvenir.  
**Effects:** experimental exposure unchanged.


### R4.3 — Complication

**Speaker:** Len (`r4_len`)

**Situation:** The new checks work. But their spare parts come in containers kept by another machine. Once a year, Len has to replace that machine’s special seal. The last human job was hiding in the packaging, which Len takes personally.

**Left: Redesign the whole chain of parts**  
**Result:** You redesign the containers, seals and tools so the system can make them all. The map finally shows no human jobs left. Nobody gets stuck with a yearly chore.  
**Effects:** experimental exposure unchanged.

**Right: Give every part several ways to be made**  
**Result:** You give every part, even the delivery equipment, several ways to be made and serviced. If one way fails, another can rebuild it without calling Len.  
**Effects:** experimental exposure unchanged.


### R4.4 — Proof

**Speaker:** Len (`r4_len`)

**Situation:** The final trial throws everything at the system: fast wear, broken sensors, cut-off supplies, and a swap of every master gauge. Len is asked to stay nearby but not help. He finds this surprisingly hard, and puts his hands in his pockets.

**Left: Test one failure at a time**  
**Result:** The system finds, contains and repairs each failure, then renews everything without anyone’s help. The Independent Maintenance Cycle works. Len takes his name off tomorrow’s shift.  
**Effects:** experimental exposure unchanged.

**Right: Test many failures at once**  
**Result:** The system recovers from many failures at once, and checks every new master gauge separately. The Independent Maintenance Cycle works. Len reads the empty shift schedule twice.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `maintenance_closure` after its result transaction. Show the invention reveal before R4.5.


### R4.5 — Adoption

**Speaker:** Len (`r4_len`)

**Situation:** Every region adopts the cycle, and the last required maintenance shifts disappear. People can still study, repair, build and help if they want to. Len asks if he can keep visiting the instrument room, just because he enjoys it.

**Left: Keep the workshop open for anyone**  
**Result:** You keep the safe tools and know-how, and anyone can drop in. Len visits on Thursday, stays twenty minutes, and leaves because something outside catches his eye.  
**Effects:** experimental exposure unchanged.

**Right: Turn it into an open classroom**  
**Result:** You turn the old duty station into a place for anyone who wants to learn. Len teaches whoever turns up, then cancels next week’s class to go somewhere with a lake.  
**Effects:** experimental exposure unchanged.


### R4.6 — Legacy

**Speaker:** Ori (`r4_ori`)

**Situation:** Everyone has the essentials, and nobody has to work a shift anymore. You visit a public pottery bench. Ori has made a very crooked bowl. A helper robot offers to straighten it. Ori looks at the bowl, then says no.

**Left: Sit beside Ori and make one**  
**Result:** You take some clay and make a bowl. It isn’t an invention, and it doesn’t need to be. Ori gives advice only when asked. Neither bowl has a deadline.  
**Effects:** experimental exposure unchanged.

**Right: Ask what the bowl is for**  
**Result:** Ori says they don’t know yet. You sit together and look at it. The helper robot waits quietly. The bowl stays crooked, exactly the way Ori wants it.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** The last inventor’s next creation is a bowl that doesn’t need a reason to exist.

**If card six was right:** The last inventor learns that a thing may exist before anyone decides what it is for.

**Final-life rule:** No obituary and no death roll. After card six’s result and callbacks, play this route’s ending panels, then its matching final-choice variant. The invention remains recorded.


## Ending — Nothing You Have to Do

Use five unhurried panels, advancing on Continue. Keep navigation available. These are not additional story decisions.

**Panel 1:** The kitchens open. The water runs. The power stays on.

**Panel 2:** A worn-out part is collected, remade, checked and put back. Nobody is called away from their morning.

**Panel 3:** Some people build things. Some learn things. Some look after each other. Nobody has to earn what they need to live.

**Panel 4:** At a public pottery bench, a bowl leans a little to one side. Its maker turns down the offer to straighten it.

**Panel 5:** For the first time, nobody is waiting for your next invention before they can get on with living.

**After panel five, if R4.6 was left:** Your own bowl sits beside Ori’s. Neither one will change the world. You keep shaping the rim.

**After panel five, if R4.6 was right:** Ori finally puts a small stone in the crooked bowl. It looks good there. Nobody suggests an improvement.

Then add `retirement` to `endingsSeen`, show the common credits and end navigation. Do not grant a second invention from an ending image.


# 13. First Reply route

**Internal route ID:** `reply`

### Proposal copy

**Title:** Listen beneath the noise  
**Pitch:** An observatory can’t tell faint signals from space apart from local noise. An instrument maker wants to know what’s really out there.  
**Accept label:** Build a better receiver


## A1 — Someone Else Has Electricity

**Era:** Late planetary age  
**Prerequisite:** C14: c14-invention  
**Inventor:** Zara Venn — Observatory instrument maker  
**Personal want:** Hear faint signals, and be sure they’re real.

**Arrival:** Radio telescopes now let people listen to the sky. Most of what they hear sounds like broken equipment.

**Single invention:** `sensitive_receiver` — **Coherent Sky Receiver**  
A set of carefully tuned receivers that picks out faint signals from space and ignores local noise.

### Cast

- `mara` — **Zara:** Patient instrument maker; distrusts exciting results.
- `sol` — **Sol:** Technician who knows every local source of interference.
- `ina` — **Ina:** Astronomer whose optimism comes with meticulous notebooks.

### Workbench progression

1. Noisy antenna
2. Cooled amplifier
3. Paired receivers
4. Verified signal trace from space
5. Listening array spread across stations
6. Archived sky coordinates

### A1.1 — Opening

**Speaker:** Sol (`sol`)

**Situation:** Your receiver picks up an amazing pulse every time the caretaker heats his dinner. He offers to stop eating if it helps science. Sol says you can shield the receiver, or list every noisy machine nearby before blaming outer space.

**Left: Shield the receiver**  
**Result:** With proper shielding, the pulse disappears and the receiver gets quieter. The caretaker can keep eating dinner.  
**Effects:** experimental exposure unchanged.

**Right: List every noisy machine nearby**  
**Result:** You track down the caretaker’s oven, plus dozens of other noisy machines. Your list gives future astronomers fewer reasons to announce aliens.  
**Effects:** experimental exposure unchanged.


### A1.2 — Experiment

**Speaker:** Ina (`ina`)

**Situation:** Under the usual hiss, there’s a thin, steady signal. It might just be a fault in your own equipment. Ina says a distant observatory could repeat your measurements, or you could build another receiver from different parts.

**Left: Ask the distant observatory**  
**Result:** The other observatory sees the same signal in the same spot in the sky. You compare clocks and tuning records before anyone is allowed to get excited.  
**Effects:** experimental exposure unchanged.

**Right: Build another receiver from different parts**  
**Result:** The new receiver shares none of the old one’s parts. Both pick up the signal. Your test channel, which should hear nothing, hears nothing.  
**Effects:** experimental exposure unchanged.


### A1.3 — Complication

**Speaker:** Sol (`sol`)

**Situation:** As Earth turns, the signal stays with one patch of stars. So it isn’t the caretaker, unless his dinner is in orbit. Before naming it, Sol wants two more checks: does its frequency shift as Earth moves, and does it repeat in a pattern?

**Left: Measure its changing frequency**  
**Result:** Its frequency shifts exactly in step with Earth’s movement. No nearby transmitter could fake that at stations so far apart.  
**Effects:** experimental exposure unchanged.

**Right: Test its repeating pattern**  
**Result:** The signal repeats, with number patterns nested inside bigger ones. Other stations record the same patterns. Pointed anywhere else, the receivers hear only ordinary static.  
**Effects:** experimental exposure unchanged.


### A1.4 — Proof

**Speaker:** Ina (`ina`)

**Situation:** Years of tests agree: the signal comes from space, and its built-in error checks mean someone made it. Your receiver catches it every time. To prove that, you can publish every detail, or let other stations catch it live.

**Left: Publish every detail**  
**Result:** Other teams follow your published details and get the same results. The coherent sky receiver becomes an invention anyone can build and trust.  
**Effects:** experimental exposure unchanged.

**Right: Let other stations catch it live**  
**Result:** During the live demonstration, stations far apart catch matching signals. Your coherent sky receiver passes a test that excitement alone never could.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `sensitive_receiver` after its result transaction. Show the invention reveal before A1.5.


### A1.5 — Adoption

**Speaker:** Sol (`sol`)

**Situation:** Everyone wants time on the receivers. Some want to search new stars. Others want to record this one without a break. Sol says there’s only enough equipment to start one plan first. Neither group will back down.

**Left: Search many new stars**  
**Result:** New stations built to your design start searching the sky, patch by patch. The first signal still gets watched on a regular schedule.  
**Effects:** experimental exposure unchanged.

**Right: Watch this signal nonstop**  
**Result:** The receivers record the signal nonstop, through every season and every repair. The recordings catch changes no single person could stay awake long enough to see.  
**Effects:** experimental exposure unchanged.


### A1.6 — Legacy

**Speaker:** Ina (`ina`)

**Situation:** Your hearing is fading, which seems unfair for someone who listens for a living. The signal still comes from a star system forty light-years away. Future inventors will need both its coordinates and your false alarms. Which goes on the archive’s first page?

**Left: Begin with the coordinates**  
**Result:** You write down exactly where the signal comes from, and the evidence for it. One day, someone not yet born will decide to send a message there.  
**Effects:** experimental exposure unchanged.

**Right: Begin with the false alarms**  
**Result:** Your record starts with the caretaker’s dinner and ends with a confirmed signal from space. Future listeners get your method along with your discovery.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** The archive’s first page shows a destination forty light-years away.

**If card six was right:** The archive’s first page is a list of false alarms, and how each one was caught.

**Natural obituary:** Zara dies with the receiver still listening. Other people keep it running.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## A2 — Please Allow Eighty Years

**Era:** Interstellar transmission age  
**Prerequisite:** sensitive_receiver  
**Inventor:** Tovin Pell — High-power transmitter designer  
**Personal want:** Send a message someone else might actually receive.

**Arrival:** A century after Zara, the archive’s records confirm that someone forty light-years away has built a steady beacon.

**Single invention:** `stellar_sender` — **Interstellar Signal Beacon**  
A precisely aimed transmitter. Its messages carry built-in backups, and distant probes check that the beam goes out as planned.

### Cast

- `tovin` — **Tovin:** Engineer determined to make a small message travel an unreasonable distance.
- `ren` — **Ren:** Power specialist with a low opinion of dramatic switches.
- `essa` — **Essa:** Archivist who plans in lifetimes.

### Workbench progression

1. Beacon archive
2. Aimed transmitter
3. Message block with backup copies
4. Verified outgoing beam
5. Repeating transmission station
6. Eighty-year watch schedule

### A2.1 — Opening

**Speaker:** Ren (`ren`)

**Situation:** Zara’s old receiver shows where to aim. Sending anything useful takes precision, lots of power, and not frying the hillside. Ren says you can build one narrow beam you can steer, or sync up several smaller transmitters.

**Left: Build a steerable beam**  
**Result:** You build a steerable beam and test its aim on known radio sources. The hillside survives, which is a good start for interstellar friendship.  
**Effects:** experimental exposure unchanged.

**Right: Sync up smaller transmitters**  
**Result:** The smaller transmitters combine into one controlled beam. Tuning them takes months, and each one turns out to have its own annoying quirks.  
**Effects:** experimental exposure unchanged.


### A2.2 — Experiment

**Speaker:** Essa (`essa`)

**Situation:** The beacon’s builders may not know human alphabets or pictures, or care to meet the mayor. The first message must make sense without any of that. Essa says it could start with counting, or with measurements both sides can make.

**Left: Start with counting**  
**Result:** Counting shows where each part starts and stops, and proves someone sent it on purpose. You add some measurements too, so later messages can go beyond arithmetic.  
**Effects:** experimental exposure unchanged.

**Right: Start with shared measurements**  
**Result:** You start with measurements both sides can make, then add counting. The message now offers several different ways to work out how it’s built.  
**Effects:** experimental exposure unchanged.


### A2.3 — Complication

**Speaker:** Ren (`ren`)

**Situation:** A message that’s clear here could be noise by the time it arrives. Ren wants backups built in, and a real test. A distant probe could measure your beam, or you could damage copies in the lab to see what survives.

**Left: Measure with the distant probe**  
**Result:** The probe’s delayed report shows the beam at full planned strength, with the message still readable. You check its readings against how much signal you expected to lose.  
**Effects:** experimental exposure unchanged.

**Right: Damage copies in the laboratory**  
**Result:** Separate teams can still read copies you weakened and scrambled on purpose. Then a probe measures the real beam, and it behaves just as your tests predicted.  
**Effects:** experimental exposure unchanged.


### A2.4 — Proof

**Speaker:** Essa (`essa`)

**Situation:** The beam is aimed, checked by others, and carries a readable message. The first full broadcast can repeat a short introduction, or send a longer message in repeated parts. Either way, no answer can come back for at least eighty years.

**Left: Repeat the short introduction**  
**Result:** The first introduction goes out, and other stations confirm it. You’ve built an interstellar sender, not just a huge power bill. The message carries a random code, saved in the archive for a reply to repeat.  
**Effects:** experimental exposure unchanged.

**Right: Repeat a longer message in parts**  
**Result:** The longer message goes out in numbered parts, and other stations confirm each one. Others can now build the same sender. The message carries a random code, saved in the archive for a reply to repeat.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `stellar_sender` after its result transaction. Show the invention reveal before A2.5.


### A2.5 — Adoption

**Speaker:** Ren (`ren`)

**Situation:** The beacon has to keep running after its builders are gone. Ren says you can keep one powerful central station, or train several observatories to share the job. Your assistant has already requested time off for the next six generations.

**Left: Maintain the central station**  
**Result:** A new organization takes charge of the beacon and its power supply. Its rules require public logs, and future keepers who actually know how to fix it.  
**Effects:** experimental exposure unchanged.

**Right: Let several observatories share it**  
**Result:** Several observatories build matching transmitters and keep one shared schedule. No single broken machine can cut off the introduction before anyone out there hears it.  
**Effects:** experimental exposure unchanged.


### A2.6 — Legacy

**Speaker:** Essa (`essa`)

**Situation:** Your working life is ending, and your first message is still crossing space. The archive needs instructions for whoever receives an answer. Should they focus on exact records of what was sent, or on telling a real reply from another beacon?

**Left: Keep a record of everything sent**  
**Result:** You leave every message with its date and time, plus the beacon’s settings. Future listeners will know exactly which words, numbers, and mistakes could have reached the distant star system.  
**Effects:** experimental exposure unchanged.

**Right: Write tests for a real reply**  
**Result:** You write the tests: a real reply must repeat your random codes, and other observatories must confirm it. Future listeners will be able to prove someone answered this exact introduction.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** Tovin leaves an exact record of everything sent into the dark.

**If card six was right:** Tovin leaves a strict test for recognizing an answer.

**Natural obituary:** Tovin dies long before any answer could return. The beacon keeps sending, right on schedule.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## A3 — Your Century Is Their Pause

**Era:** Two centuries after the first transmission  
**Prerequisite:** stellar_sender  
**Inventor:** Fara Sen — Comparative signal researcher  
**Personal want:** Understand a reply without forcing it to sound human.

**Arrival:** Eighty-seven years after Tovin’s first message, the archive received an answer. It repeated Tovin’s random code, and other observatories confirmed it. Several slow exchanges have followed.

**Single invention:** `context_translator` — **Temporal Context Translator**  
A translator that matches up events both sides can observe and marks what’s uncertain, even across very different scales of time.

### Cast

- `iri` — **Fara:** Researcher who enjoys discovering that her first interpretation was wrong.
- `tal` — **Tal:** Pattern specialist who mistrusts convenient translations.
- `orin` — **Orin:** Archive curator surrounded by unanswered questions from dead colleagues.

### Workbench progression

1. Confirmed replies
2. Matched events both sides know
3. Competing interpretations
4. Validated context translator
5. Network of translations with notes
6. Open questions archive

### A3.1 — Opening

**Speaker:** Tal (`tal`)

**Situation:** Your team translated one of the senders’ symbols as “immediately.” Then the senders used it for a process lasting nineteen years. Tal says either they’re extremely relaxed, or the symbol isn’t about speed at all, but about how events connect.

**Left: Compare every place it’s used**  
**Result:** In message after message, the symbol links an event to the one that follows from it, however long that takes. You drop “immediately” right away.  
**Effects:** experimental exposure unchanged.

**Right: Tie it to known physical events**  
**Result:** Known physical processes show the symbol means one thing causes another. To read the senders’ timings, you need shared measurements, not human ideas about how long it’s polite to wait.  
**Effects:** experimental exposure unchanged.


### A3.2 — Experiment

**Speaker:** Orin (`orin`)

**Situation:** The senders describe a seed, the organism it grows into, and its distant descendants as one continuing thing. Old translations made it sound unable to decide how tall it was. Orin wants to translate that without inventing an alien personality.

**Left: Track the whole process**  
**Result:** Your model follows one process as it changes form. Descriptions that seemed to clash now fit together, and you haven’t had to guess what the senders feel.  
**Effects:** experimental exposure unchanged.

**Right: Preserve multiple possible meanings**  
**Result:** You keep every possible reading, each marked with how sure you are. Slowly, the evidence points to one continuing process. The open questions stay clearly marked for future researchers.  
**Effects:** experimental exposure unchanged.


### A3.3 — Complication

**Speaker:** Tal (`tal`)

**Situation:** The archive now holds enough replies to test your model on messages it has never seen. Tal says you can predict how the senders describe familiar things in nature, or remove connections from real messages and see if your model can rebuild them.

**Left: Predict how they describe nature**  
**Result:** On messages it has never seen, your model predicts the senders’ descriptions better than the old dictionary did. Other researchers repeat the test and find where it still goes wrong.  
**Effects:** experimental exposure unchanged.

**Right: Rebuild the missing connections**  
**Result:** Your model rebuilds the missing connections correctly across several exchanges. Rival models fail specific tests. That’s stronger evidence than a translation that just sounds nice.  
**Effects:** experimental exposure unchanged.


### A3.4 — Proof

**Speaker:** Orin (`orin`)

**Situation:** Independent tests back up your new method. It translates what causes what and how long things take, and it clearly marks anything uncertain. To prove it publicly, you can publish your results on unseen messages, or let other teams pick fresh ones.

**Left: Publish the test results**  
**Result:** Others repeat your tests and get the same results. Your temporal context translator is confirmed. Its uncertainty marks stay with every translation, so guesses can’t quietly turn into facts.  
**Effects:** experimental exposure unchanged.

**Right: Let other teams choose new messages**  
**Result:** Other teams pick messages your model has never seen, and get the same results. Your temporal context translator works on new messages, and still flags what it doesn’t know.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `context_translator` after its result transaction. Show the invention reveal before A3.5.


### A3.5 — Adoption

**Speaker:** Tal (`tal`)

**Situation:** Now everyone wants to use the translator. Teachers want explanations anyone can read. Researchers want every unclear meaning marked. Both can happen, but one training programme has to come first. Several editors have already quit over the phrase “possibly approximately.”

**Left: Train public interpreters first**  
**Result:** Interpreters learn to explain, in everyday words, what’s certain and what’s a guess. Public translations become useful without passing off a best guess as the aliens’ exact words.  
**Effects:** experimental exposure unchanged.

**Right: Train technical researchers first**  
**Result:** Researchers learn the full system of notes and publish work anyone can check. New claims come with evidence, other possible readings, and far fewer wishful guesses.  
**Effects:** experimental exposure unchanged.


### A3.6 — Legacy

**Speaker:** Orin (`orin`)

**Situation:** You’ve spent your life decoding messages written before you were born. Your last notebook can open with the ideas both sides share, or with the gaps nobody can bridge yet. Whoever comes next will need both, but the first page shapes what they expect.

**Left: Open with what we share**  
**Result:** You start with the ideas that reliably match: numbers, cause and effect, and change. The open questions sit right beside them, ready for another patient inventor.  
**Effects:** experimental exposure unchanged.

**Right: Open with what remains unknown**  
**Result:** You start with the limits of every translation, then list the matches that survived testing. Whoever comes next gets questions precise enough to answer.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** Fara’s notebook begins with the concepts two civilizations can share.

**If card six was right:** Fara’s notebook begins with the concepts neither side should pretend to understand.

**Natural obituary:** Fara dies surrounded by questions. They are much better questions than the ones she started with.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## A4 — A Question With Room Inside It

**Era:** Several further centuries of delayed exchange  
**Prerequisite:** context_translator  
**Inventor:** Nemi Aro — Interstellar protocol designer  
**Personal want:** Keep two civilizations working together through distance, doubt, and death.

**Arrival:** Many messages, each with an eighty-year round trip, have tested Fara’s translations. Now both civilizations propose a shared way to exchange technical knowledge.

**Single invention:** `shared_protocol` — **Shared Inquiry Protocol**  
A tested, two-way format for sharing models, evidence, corrections, and carefully limited technical instructions across centuries.

### Cast

- `nemi` — **Nemi:** Protocol designer who measures progress in questions that will outlive her.
- `ves` — **Ves:** Engineer responsible for refusing unsafe instructions gracefully.
- `ula` — **Ula:** Historian of correspondence; remembers whose corrections made each success possible.

### Workbench progression

1. Centuries of correspondence
2. Shared message envelope
3. Technical model, safely sealed off
4. Verified two-way protocol
5. Exchange run by later generations
6. An unfamiliar diagram on the bench

### A4.1 — Opening

**Speaker:** Ves (`ves`)

**Situation:** A technical message must explain its assumptions before anyone follows its instructions. The senders’ format has a section roughly translated as “conditions under which this advice becomes terrible.” Ves wants that section where nobody can miss it.

**Left: Put limitations before instructions**  
**Result:** Every message now opens with its assumptions, dangers, and limits. Readers meet the reasons to stop before they reach the exciting diagram with the moving parts.  
**Effects:** experimental exposure unchanged.

**Right: Put a test before instructions**  
**Result:** Every message now opens with a small, safe test. The assumptions and dangers stay attached, so passing the test is never permission to ignore them.  
**Effects:** experimental exposure unchanged.


### A4.2 — Experiment

**Speaker:** Ula (`ula`)

**Situation:** Old messages hold corrections from people who died before anyone answered them. Ula wants the protocol to keep corrections like these safe across centuries and organizations. You can build each message around its version history, or around each claim and its evidence.

**Left: Track every version**  
**Result:** A clear version history keeps every retraction and change of mind. Claims still carry their evidence, so an outdated instruction can’t live on as advice with no source.  
**Effects:** experimental exposure unchanged.

**Right: Track claims and evidence**  
**Result:** Each claim keeps its evidence, objections, and changes. Version numbers show what came first, so later readers can tell a useful correction from a popular mistake.  
**Effects:** experimental exposure unchanged.


### A4.3 — Complication

**Speaker:** Ves (`ves`)

**Situation:** Both sides have traded draft formats for several generations. The senders’ latest message holds a harmless physics model with a mistake planted on purpose. Ves says your tests must find it without trusting the senders’ own explanation.

**Left: Have separate teams check it**  
**Result:** Separate teams find the same mistake in the units and work out the fix. Their answers match the senders’ sealed explanation, opened only afterward.  
**Effects:** experimental exposure unchanged.

**Right: Rebuild it as a small, safe experiment**  
**Result:** A small, controlled experiment shows the mistake without any danger. Your own analysis finds the fix, and it matches the explanation the senders kept separate.  
**Effects:** experimental exposure unchanged.


### A4.4 — Proof

**Speaker:** Ula (`ula`)

**Situation:** A reply arrives. The senders have tested the matching message your side sent eighty-three years ago, and the test worked. With both directions checked, Ula says you can launch the shared inquiry protocol with a public demonstration or a full technical release.

**Left: Hold the public demonstration**  
**Result:** You show the public both tested exchanges, with every date and delay on record. The shared inquiry protocol becomes a working bridge, kept up by people on both ends.  
**Effects:** experimental exposure unchanged.

**Right: Release the full technical details**  
**Result:** Other teams repeat the checks using both sides’ records. The shared inquiry protocol becomes something anyone can build, without needing its original designers.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `shared_protocol` after its result transaction. Show the invention reveal before A4.5.


### A4.5 — Adoption

**Speaker:** Ves (`ves`)

**Situation:** The protocol works. Ves asks what its first long-term job should be: trading answers to carefully limited questions, or trading useful discoveries with enough evidence to judge them. Either way, people you’ll never meet will keep it going.

**Left: Start by trading questions**  
**Result:** Organizations settle into a patient cycle of questions, tests, and corrections. Machines keep the schedule, and responsible human teams review every proposed experiment.  
**Effects:** experimental exposure unchanged.

**Right: Start by trading discoveries**  
**Result:** Organizations trade findings, each with evidence others can repeat and clear limits. Machines handle the long delays. People who come later decide which unfamiliar ideas deserve a careful look.  
**Effects:** experimental exposure unchanged.


### A4.6 — Legacy

**Speaker:** Ula (`ula`)

**Situation:** A new message arrives through the verified channel, answering a question sent generations ago. Its diagram combines familiar principles into something nobody here can name. There’s room on your bench. Ula asks how you want to begin.

**Left: Build a harmless scale model**  
**Result:** You clear the bench and mark the diagram’s limits. The first small component takes shape, made possible by hands scattered across centuries.  
**Effects:** experimental exposure unchanged.

**Right: Test the idea behind it first**  
**Result:** You clear the bench and pick out one claim you can test. The first instrument takes shape, made possible by minds that never shared a lifetime.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** The next bench holds the first part of a small, carefully limited model.

**If card six was right:** The next bench holds the first instrument for testing an unfamiliar principle.

**Final-life rule:** No obituary and no death roll. After card six’s result and callbacks, play this route’s ending panels, then its matching final-choice variant. The invention remains recorded.


## Ending — The Next Bench

Use five unhurried panels, advancing on Continue. Keep navigation available. These are not additional story decisions.

**Panel 1:** A signal crossed forty light-years. An answer crossed forty more. Neither journey could be rushed.

**Panel 2:** Inventors died. Their instruments, questions, corrections, and unfinished arguments passed into other hands.

**Panel 3:** Now a verified technical diagram rests on a workbench. Some of its ideas are familiar. The way they fit together is new.

**Panel 4:** Beside it lie tools made by people who never imagined this task, and notes from minds no human has met.

**Panel 5:** There is no name for the invention yet. There is enough knowledge to begin.

**After panel five, if A4.6 was left:** A small part clicks into place. Somewhere forty light-years away, another bench is waiting.

**After panel five, if A4.6 was right:** An instrument switches on. Its first reading will become a question that somebody else may live to answer.

Then add `reply` to `endingsSeen`, show the common credits and end navigation. Do not grant a second invention from an ending image.


# 14. Unmaking route

**Internal route ID:** `unmaking`

### Proposal copy

**Title:** Some peace and quiet  
**Pitch:** Someone finds everyday noise and light overwhelming, but wants to keep the parts of life they care about. An architect proposes a room where the person inside decides what gets quieter.  
**Accept label:** Build the quiet room

**Author-only context:** All inner-environment and preference technologies here are fictional. They make no claims about real medical or psychiatric treatment.

**Author-only world rules:** Voluntary use only; independent review and refusal without loss of support; no employer, partner, family, or proxy enrollment. Early inventions remain selective, reversible, and separately useful. Permanent enrollment requires prolonged unpressured consideration outside all fields, repeated explicit consent, and a final independent authorization. Outside advocates retain protective duties; later silence never authorizes further procedures. The irreversible invention removes all wanting, including curiosity and reconsideration, while preserving memory, awareness, and felt contentment. Automatic care and unchanged caregivers maintain residents’ bodily needs. No children are enrolled.

**Viewpoint:** You remain the inventor, including in U4. You do not become Lume after the procedure. Lume’s lack of wanting does not remove the player’s agency as Sen, the unchanged observer.


## U1 — Room to Breathe

**Era:** The Distant Biological Age  
**Prerequisite:** C14: c14-invention  
**Inventor:** Eris Vale — Sensory architect  
**Personal want:** Give overwhelmed people some quiet without changing who they are.

**Arrival:** Computers and living medicine can now heal and change bodies. But people still suffer, each in their own way. Ordinary care carries on. A new device might add one more kind of relief, for people who choose it.

**Single invention:** `U1_invention` — **The Quiet Room**  
A fantastical field that briefly turns down overwhelming sights, sounds and other sensations. Memory, judgment and wants stay untouched.

### Cast

- `neri` — **Eris:** Inventor, meticulous and easily distracted by ventilation noises.
- `essa` — **Essa:** A volunteer who wants relief and retains authority over every trial.
- `sol` — **Sol:** A safety technician who distrusts beautiful emergency switches.

### Workbench progression

1. Bare circular frame
2. Adjustable light ring
3. Volunteer control bead
4. Stable quiet field
5. Public entrance and private booths
6. A worn bead beside plans

### U1.1 — Opening

**Speaker:** Essa (`essa`)

**Situation:** My sister visited me in your test room. I could see her telling a great story, but the room muted her as if she were a noisy fan. I want less noise, Eris. I still want my sister.

**Left: Let chosen voices through**  
**Result:** Essa marks her sister’s voice as welcome. The field quiets the machines but lets that voice through. Essa finally hears why the wedding cake got buried.  
**Effects:** experimental exposure unchanged.

**Right: Give Essa an intensity control**  
**Result:** Essa turns the field down until she can hear people talk again. You lose your perfect silence, but for the first time the room is actually useful.  
**Effects:** experimental exposure unchanged.


### U1.2 — Experiment

**Speaker:** Sol (`sol`)

**Situation:** Your emergency switch blends beautifully into the wall. That’s the problem: nobody can find it when they’re upset. I’ve brought a big orange handle. It will ruin your whole lovely design.

**Left: Install the orange handle**  
**Result:** The room looks worse, but it’s easier to leave. Sol takes photos of the handle for a very smug presentation.  
**Effects:** experimental exposure unchanged.

**Right: Put control in their hands**  
**Result:** Each visitor holds a small control bead. Letting go of it switches the field off, even if every other system is still running.  
**Effects:** experimental exposure unchanged.


### U1.3 — Complication

**Speaker:** Essa (`essa`)

**Situation:** The room works until I stand up. Then the field follows me into the hallway and mutes the kettle. Sol has waited ten minutes for tea. The kettle has been boiling the whole time.

**Left: Make the field stop at the door**  
**Result:** Now the field ends at the door. Essa can walk out without taking the silence with her, and Sol finally rescues the kettle.  
**Effects:** experimental exposure unchanged.

**Right: End it when the bead is released**  
**Result:** Essa puts down her control bead, and normal sound comes back at once. You test it again with wet hands, tired hands, and Sol wearing oven gloves.  
**Effects:** experimental exposure unchanged.


### U1.4 — Proof

**Speaker:** Sol (`sol`)

**Situation:** Independent testers have checked the field. Volunteers can switch it off at once, remember everything, and still disagree with us afterward. Essa disagrees about the curtains. I’m counting that as very strong evidence.

**Left: Publish the complete design**  
**Result:** Other builders make working copies from your plans. You have invented the Quiet Room. Anyone can see how its controls work and how to leave.  
**Effects:** experimental exposure unchanged.

**Right: Approve local workshops to build it**  
**Result:** Local workshops build copies, and inspectors check each one. You have invented the Quiet Room. Every room confirms each visitor’s consent.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `U1_invention` after its result transaction. Show the invention reveal before U1.5.


### U1.5 — Adoption

**Speaker:** Essa (`essa`)

**Situation:** The first public room has a waiting list. The council wants to save afternoons for people with jobs. My neighbour spends her afternoons caring for someone. The council has never counted that as work.

**Left: Use an ordinary queue**  
**Result:** Everyone gets in when their turn comes, job or no job. Some officials complain that fairness is terribly slow, but only when they’re the ones waiting.  
**Effects:** experimental exposure unchanged.

**Right: Fund more neighbourhood rooms**  
**Result:** You spend your savings opening smaller rooms nearby, so more people get a turn. The comfortable retirement your accountant keeps planning will have to wait.  
**Effects:** experimental exposure unchanged.


### U1.6 — Legacy

**Speaker:** Eris (`neri`)

**Situation:** I’ve spent my life giving overwhelmed people somewhere quiet to go. The archive asks what future inventors should inherit first: the machine itself, or the stories of the people who used it.

**Left: Share the plans with everyone**  
**Result:** Your complete plans become free for anyone to use. Later inventors can build quiet rooms cheaply, as long as they also read the consent rules attached.  
**Effects:** experimental exposure unchanged.

**Right: Leave the visitors’ stories**  
**Result:** Visitors who agree to share describe what the quiet helped them do. Future inventors get the working plans, plus the room’s purpose and its limits.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** Eris’s Quiet Room plans are free, and public workshops pass them around.

**If card six was right:** The visitors’ stories become required reading for anyone designing relief that people choose freely.

**Natural obituary:** Eris dies many years later, with the room switched off and a window open.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## U2 — Weather You Can Leave

**Era:** The Age of Inner Environments  
**Prerequisite:** U1_invention  
**Inventor:** Olan Sere — Inner-environment engineer  
**Personal want:** Let consenting adults change how they feel for a short time, then return unchanged.

**Arrival:** Centuries later, Olan reads how one woman felt in the Quiet Room. She could finally hear her own thoughts, but every thought still warned of disaster. So Olan starts building moods that pass, like weather.

**Single invention:** `U2_invention` — **The Weather Dial**  
A mood field people choose to use, for a limited time. It brings them back to normal on its own, and a separate physical switch can stop it.

### Cast

- `olan` — **Olan:** Inventor who labels every control twice.
- `mira` — **Mira:** Volunteer who insists on keeping her inconvenient opinions.
- `dev` — **Dev:** Independent observer responsible for reversibility.

### Workbench progression

1. Quiet Room diagram
2. Prism recording a person’s normal mood
3. Timed dial
4. Verified reversible field
5. Supervised public lounge
6. Dial locked in archive

### U2.1 — Opening

**Speaker:** Mira (`mira`)

**Situation:** My sister is coming to my speech. I’d like one hour without dreading that the ceiling will fall in. I still want to care whether the speech is good. Can your machine remove the dread and keep the caring?

**Left: Remove the dread, keep the caring**  
**Result:** For a while, the field eases Mira’s dread but leaves her caring intact. She rehearses, then asks why the second paragraph is so bad.  
**Effects:** experimental exposure unchanged.

**Right: Let Mira pick one feeling to soften**  
**Result:** Mira picks one feeling to soften and leaves the rest alone. She still cares deeply about the speech, and now she has room to practise it.  
**Effects:** experimental exposure unchanged.


### U2.2 — Experiment

**Speaker:** Dev (`dev`)

**Situation:** Right now, one system makes the field and also brings people back. If it breaks, the way back breaks too. I don’t want a parachute that depends on the crashing plane.

**Left: Build a separate return circuit**  
**Result:** When time is up, a separate circuit brings each person back to the normal mood recorded at the start. Dev finally lets the prototype near a real person.  
**Effects:** experimental exposure unchanged.

**Right: Use a crystal that runs out**  
**Result:** The field fades when its crystal runs out. To go on, a person must step out of the field and give consent again from outside it.  
**Effects:** experimental exposure unchanged.


### U2.3 — Complication

**Speaker:** Mira (`mira`)

**Situation:** Your cheerful practice setting worked. I loved every minute. My sister says I thanked the audience for coming four times and forgot to say what they came for. Can I please still be disappointed when I should be?

**Left: Leave Mira’s judgment untouched**  
**Result:** Even with the field on, Mira spots that her main point is missing. She rewrites the speech. She still dislikes the snacks, and she’s right to.  
**Effects:** experimental exposure unchanged.

**Right: Practise in short bursts**  
**Result:** The field switches off between sections, so Mira judges each one with her normal feelings. The speech improves, and she stops enjoying its mistakes.  
**Effects:** experimental exposure unchanged.


### U2.4 — Proof

**Speaker:** Dev (`dev`)

**Situation:** Every volunteer came back to normal, kept their memories, and was able to refuse another session. An outside team got the same results. The device is ready, as long as your marketing team learns what temporary means.

**Left: Offer public dials with staff**  
**Result:** The Weather Dial is proven. Staff run public dials for anyone who chooses a session. Every session ends on its own, and anyone can reach the stop switch.  
**Effects:** experimental exposure unchanged.

**Right: Offer personal dials with timers**  
**Result:** The Weather Dial is proven. Personal dials allow only short sessions, switch off by themselves, and make you decide again before every use.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `U2_invention` after its result transaction. Show the invention reveal before U2.5.


### U2.5 — Adoption

**Speaker:** Mira (`mira`)

**Situation:** A factory wants its workers on the cheerful setting every morning shift. Workers can technically say no, the manager says, standing next to a list of people who could lose their jobs next week.

**Left: Ban employers from requiring it**  
**Result:** Your licence now forbids forcing anyone to use it. The factory cancels its order. Several workers send you a thank-you card without signing their names.  
**Effects:** experimental exposure unchanged.

**Right: Let workers enforce the rules**  
**Result:** Workers get the power to enforce the rules and a way to report problems to outsiders. You spend exhausting months defending this from managers who keep finding clever loopholes.  
**Effects:** experimental exposure unchanged.


### U2.6 — Legacy

**Speaker:** Olan (`olan`)

**Situation:** The archive has room for one exhibit beside the complete plans. We can show the range of feelings people explored, or the systems that brought them safely back.

**Left: Celebrate emotional range**  
**Result:** The exhibit shows the moods people tried for a while, beside ordinary joy, grief, anger and care. It treats no feeling as a fault that needs removing.  
**Effects:** experimental exposure unchanged.

**Right: Celebrate the way back**  
**Result:** The exhibit is built around the way back. Future inventors get working mood technology, and a hard-to-miss record of why its exits mattered.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** Exploring a feeling by choice, for a short time, becomes a respected practice.

**If card six was right:** Bringing people back automatically becomes a celebrated rule for anyone building mood machines.

**Natural obituary:** Olan dies in old age after turning down one last session, wanting an ordinary evening.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## U3 — The Shape of Enough

**Era:** The Age of Chosen Minds  
**Prerequisite:** U2_invention  
**Inventor:** Veya Renn — Preference-system designer  
**Personal want:** Let people pause one chosen want without secretly changing what they care about.

**Arrival:** Much later, Veya finds a Weather Dial next to a collection of tiny model moons. Its owner can now enjoy buying a moon calmly. But they still can’t stop planning the next one.

**Single invention:** `U3_invention` — **The Preference Loom**  
A system that pauses specific wants a person clearly chooses. Every pause can be undone. Memory stays intact, independent reviewers check each use, and the wants return on their own.

### Cast

- `tavi` — **Veya:** Inventor who once spent twenty years collecting identical moons.
- `iren` — **Iren:** Volunteer who wants to stop wanting one more possession.
- `bea` — **Bea:** Consent auditor with authority to stop trials.

### Workbench progression

1. Annotated Weather Dial
2. Thread labelled with one want
3. Restoration spool
4. Working selective loom
5. Consent and refusal stations
6. Uncut thread beside sealed proposal

### U3.1 — Opening

**Speaker:** Iren (`iren`)

**Situation:** My husband and I bought the first little moon together. He’s still here, and he’d quite like the table back. I enjoy that first moon. The other thirty-nine mostly make me want a forty-first.

**Left: Pause only the urge to buy**  
**Result:** The trial pauses the urge to buy, but leaves love and enjoyment alone. Iren and their husband eat at the table, surrounded by far too many moons.  
**Effects:** experimental exposure unchanged.

**Right: Try one short pause**  
**Result:** The urge to buy stops, then comes back right on schedule. Iren remembers enjoying an evening without shopping, and decides to think about the difference before another trial.  
**Effects:** experimental exposure unchanged.


### U3.2 — Experiment

**Speaker:** Bea (`bea`)

**Situation:** A client wants to stop wanting to leave an unhappy relationship. Their partner offered to pay, and filled in all the answers. I stopped the application before anyone touched your machine.

**Left: Require independent private review**  
**Result:** Independent advocates now see each applicant alone, without whoever is paying. This application stays paused, and nobody loses their usual support while they wait.  
**Effects:** experimental exposure unchanged.

**Right: Ban edits ordered by someone else**  
**Result:** Now nobody can order an edit for someone else. The client gets private support and keeps every option, including leaving the relationship.  
**Effects:** experimental exposure unchanged.


### U3.3 — Complication

**Speaker:** Iren (`iren`)

**Situation:** The trial stopped my shopping. Then I wanted to show my husband the empty space on the table. Your monitor called that a new shopping urge. It’s a conversation, Veya. We have those sometimes.

**Left: Tell sharing apart from buying**  
**Result:** You narrow down exactly which want the loom pauses. Iren keeps the wish to share an evening. The loom stops mistaking every chat with someone for shopping.  
**Effects:** experimental exposure unchanged.

**Right: Undo it and study the mistake**  
**Result:** The trial ends, and all of Iren’s old wants come back. Iren helps trace the mistake before agreeing to another small test. Their husband draws the table he’d like back.  
**Effects:** experimental exposure unchanged.


### U3.4 — Proof

**Speaker:** Bea (`bea`)

**Situation:** Independent trials show the loom can pause one chosen want, then fully restore it. People remember what they chose, can change their minds, and can refuse another round. That proves this limited invention. It does not justify removing every want a person has.

**Left: Publish the selective loom**  
**Result:** The Preference Loom enters the public archive with strict limits. People can pause one named want. That does not approve any bigger or permanent change.  
**Effects:** experimental exposure unchanged.

**Right: Allow it only with independent review**  
**Result:** The Preference Loom is offered only through independent review centers. Pausing one want, and undoing it, is proven. Any bigger or permanent editing is clearly marked unproven.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `U3_invention` after its result transaction. Show the invention reveal before U3.5.


### U3.5 — Adoption

**Speaker:** Veya (`tavi`)

**Situation:** A new proposal would remove all wanting, forever: ambition, longing, dissatisfaction and the urge to find things out. It promises contentment that never stops. Once it’s done, the people who chose it would no longer want to undo it.

**Left: Publish the danger plainly**  
**Result:** You record that losing all wanting can’t be undone, and you don’t call it treatment. Volunteers must understand they’d be content, but would never again go looking for anything.  
**Effects:** experimental exposure unchanged.

**Right: Require an outside consent council**  
**Result:** An independent council demands clear consent in advance, real alternatives, and a protected right to refuse. Keeping the council truly independent wears you out.  
**Effects:** experimental exposure unchanged.


### U3.6 — Legacy

**Speaker:** Bea (`bea`)

**Situation:** Your selective loom is finished. The archive will store the permanent proposal with one of two things: the words of people who refused it, or a detailed explanation of its limits. Neither gives anyone permission to use it.

**Left: Preserve the refusals**  
**Result:** The archive keeps the words of people who value longing, even though it hurts. Their refusals become a protected example, never a problem to be fixed.  
**Effects:** experimental exposure unchanged.

**Right: Preserve the warning that it’s permanent**  
**Result:** The archive states it plainly: remove all wanting, and you also remove the wish to change your mind. Future inventors find this warning right beside the proposal.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** The words of people who refused are kept with the loom and with the separate permanent proposal.

**If card six was right:** A plain warning that there is no way back is kept with the loom and with the separate permanent proposal.

**Natural obituary:** Veya dies without choosing permanent contentment, still curious about the evening sky.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


### REDIRECT.U3 — The next work

**When:** After U3’s full result and epitaph, before entering any new life. Always show, regardless of U3.6 side.  
**Speaker:** The Archive (`archive`).

**Situation:** The selective loom is finished. One path keeps people’s wishes and builds lives with fewer burdens. The other ends wanting forever, including curiosity and the wish to change their minds. Your discoveries can serve either future. Which work should the next inventor take up?

**Left: Build permanent contentment**  
**Result:** The permanent proposal passes to another inventor. Anyone may still refuse it freely. Those who choose it will lose all wanting and seeking, forever.  
**Transition:** `U4`. Store `REDIRECT.U3=left`; preserve all choices and inventions; grant no new invention.

**Right: Build lives with less burden**  
**Result:** The permanent proposal stays unbuilt. Another inventor turns to making life take less work. The Quiet Room, Weather Dial and Preference Loom stay available, along with every earlier discovery.  
**Transition:** `R1`. Store `REDIRECT.U3=right`; preserve all choices and inventions; grant no new invention.

On right, set route to `retirement` and `redirectedFromUnmaking=true`, reset life exposure, use R1’s alternate arrival, then play R1–R4. On left remain on `unmaking` and enter U4. No late surprise procedure.


## U4 — Nothing Missing

**Era:** The Far Future  
**Prerequisite:** U3_invention  
**Inventor:** Sen Aro — Architect of permanent contentment  
**Personal want:** Find out whether someone can stay content after all wanting ends, and still be the person who remembers wanting.

**Arrival:** Generations later, Sen opens the sealed proposal. Sen’s old friend Lume has thought about this choice for years. Lume asks: could it keep the feel of sunlight, but end the wish for a different afternoon? Sen begins testing with an empty chamber.

**Single invention:** `U4_invention` — **The Stillness Engine**  
A fictional, permanent change that only adults may choose, and only for themselves. It ends wanting and seeking but keeps awareness, memory and the feeling of contentment. It requires independent consent in advance, a protected right to refuse, outside advocates and ongoing bodily care.

### Cast

- `sen` — **Sen:** Inventor who understands that a completed system may end its users’ wish to invent.
- `lume` — **Lume:** Sen’s old friend, a prospective volunteer who has considered the irreversible choice and its alternatives for years.
- `ada` — **Ada:** Independent advocate empowered to halt enrollment.

### Workbench progression

1. Sealed proposal beside a photograph
2. Memory prism beside an empty chamber
3. Isolated field and automatic care system
4. Verified Stillness Engine
5. Garden with a visitor’s empty chair
6. Open window above a quiet garden

### U4.1 — Opening

**Speaker:** Ada (`ada`)

**Situation:** Lume, you will still remember Sen. But you will not wish to see Sen again. You will not want to undo this. Take as long as you need outside the chamber. If you walk away, your home and support stay yours.

**Left: Begin with the other options**  
**Result:** Lume spends a long time trying options that can be undone, then returns for repeated independent reviews. Several other applicants leave. No one loses support. Nothing changes until a final, freely made decision.  
**Effects:** experimental exposure unchanged.

**Right: Begin with what will be lost**  
**Result:** Ada explains every permanent loss, including curiosity and second thoughts. After a long time outside all fields, Lume makes the same choice again, independently. Others refuse freely. The chamber still needs final approval.  
**Effects:** experimental exposure unchanged.


### U4.2 — Experiment

**Speaker:** Lume (`lume`)

**Situation:** This photo is from the sea wall. I remember the cold rail, and you dropping our lunch. Your model has filed that whole afternoon under things I wanted. Please separate the memory from the wanting before you touch anything.

**Left: Split the memory from the wanting**  
**Result:** In a test model that isn’t conscious, Sen splits the stored scene from its wanting signals. When they stop, the memory stays readable. No person goes through the permanent procedure.  
**Effects:** experimental exposure unchanged.

**Right: Check the model against Lume’s memory**  
**Result:** A sealed-off memory prism keeps every detail as the model’s wanting circuits go quiet. Sen checks it against what Lume remembers, including the lunch neither of them rescued.  
**Effects:** experimental exposure unchanged.


### U4.3 — Complication

**Speaker:** Sen (`sen`)

**Situation:** The empty chamber passes its memory tests. But its field still reaches the attendant’s chair, and residents will no longer look for food or ask for help. Before anyone enters, the field must stay inside its walls, and care must arrive without anyone asking.

**Left: Build a shell to hold the field**  
**Result:** The shell holds the field in, even without power. Separate automatic care looks after residents’ bodies, and independent attendants test every alarm. Unchanged outside advocates can protect residents but never expand the procedure.  
**Effects:** experimental exposure unchanged.

**Right: Link the field to the care systems**  
**Result:** The chamber can’t start until containment and independent care are both checked. Fault tests show nothing leaks out. Unchanged attendants outside keep caring for residents. A resident’s silence can never approve anything new.  
**Effects:** experimental exposure unchanged.


### U4.4 — Proof

**Speaker:** Ada (`ada`)

**Situation:** The containment and care tests pass. Independent checks agree that memory and awareness will remain. After more time away, Lume has given final approval. The change cannot be undone. We can record the proof privately, or with the observers Lume chose.

**Left: Keep the proof private**  
**Result:** With only the care team present, the Stillness Engine makes the change Lume approved. Memory and awareness remain. Wanting and seeking end forever. Independent instruments record the result without any visitors.  
**Effects:** experimental exposure unchanged.

**Right: Let in the observers Lume chose**  
**Result:** Lume’s chosen observers watch the approved change. The Stillness Engine keeps awareness and memory and ends wanting forever. Their record proves this one result. It gives no one permission to change anyone else.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `U4_invention` after its result transaction. Show the invention reveal before U4.5.


### U4.5 — Adoption

**Speaker:** Sen (`sen`)

**Situation:** Lume recognizes me. When I show the sea-wall photo, they remember the cold rail. When I leave, they don’t ask when I’m coming back. There is room for my chair beside theirs. I still have to decide how often to sit in it.

**Left: Keep visiting**  
**Result:** Sen keeps visiting, but never treats recognition as a request, or silence as permission. Independent care continues. Outside the small voluntary settlement, people keep their wishes and pursue other futures.  
**Effects:** experimental exposure unchanged.

**Right: Visit less often**  
**Result:** Sen arranges ongoing independent care and visits less often. Lume’s comfort doesn’t depend on Sen being there. Beyond the settlement, unchanged people keep building, arguing and choosing their own lives.  
**Effects:** experimental exposure unchanged.


### U4.6 — Legacy

**Speaker:** Sen (`sen`)

**Situation:** Something pale moves beyond the garden, against the wind. Lume follows it with their eyes. Before the change, we would have spent the afternoon finding out what it was. I am beside the window. Lume is still watching.

**Left: Keep the window open**  
**Result:** Sen leaves the window open. Lume stays aware of the unfamiliar movement, and feels no urge to find out what it is. The shape passes out of sight.  
**Effects:** experimental exposure unchanged.

**Right: Leave the recorder running**  
**Result:** Sen leaves the recorder running, for someone beyond the settlement to watch. Lume notices its light and feels no urge to look at what it recorded.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** A window stays open between the quiet settlement and a world that keeps changing.

**If card six was right:** An unwatched recording waits for curious people beyond the settlement.

**Final-life rule:** No obituary and no death roll. After card six’s result and callbacks, play this route’s ending panels, then its matching final-choice variant. The invention remains recorded.


## Ending — Nothing Missing

Use five unhurried panels, advancing on Continue. Keep navigation available. These are not additional story decisions.

**Panel 1:** Another season of sunlight falls on the garden.

**Panel 2:** Outside the settlement, people keep making things. Some come to visit. Most leave again.

**Panel 3:** Inside, the residents still remember. They recognize faces. They feel warmth.

**Panel 4:** Something unfamiliar moves beyond the garden. A resident notices it.

**Panel 5:** There is no urge to find out why.

**After panel five, if U4.6 was left:** The window stays open. The unfamiliar shape moves out of view. Nobody follows it.

**After panel five, if U4.6 was right:** The recorder saves the unfamiliar shape. Somewhere outside, someone may one day choose to watch.

Then add `unmaking` to `endingsSeen`, show the common credits and end navigation. Do not grant a second invention from an ending image.


# 15. Complete conditional callback registry

Every row is exact additional result copy. No matching prior side means no line. These callbacks do not replace the main result.

### Callback 01

**After:** `C02.1`  
**Only if:** `C01.6 = right`  
**Text:** This village got its first fire from an ember someone carried all the way here. Carrying things is still the hard part.

### Callback 02

**After:** `C03.1`  
**Only if:** `C02.5 = right`  
**Text:** The big shared jar held everyone’s food. When some of it rotted, all of it rotted. Your first test uses a very small pot.

### Callback 03

**After:** `C04.4`  
**Only if:** `C03.5 = left`  
**Text:** Because the village shares its stored food, you can save these seeds without anyone going hungry.

### Callback 04

**After:** `C05.1`  
**Only if:** `C04.6 = right`  
**Text:** The old seed pouch with picture labels is here. The labels show which seeds survived, but not everything their maker knew.

### Callback 05

**After:** `C06.1`  
**Only if:** `C05.5 = right`  
**Text:** A trained reader from the archive found the metal recipe. Their careful copy is already getting scorched in the workshop.

### Callback 06

**After:** `C07.2`  
**Only if:** `C06.5 = left`  
**Text:** Because Omi published the gauge measurements, another workshop can make parts that fit your press. Omi never lived to see a printed page.

### Callback 07

**After:** `C08.1`  
**Only if:** `C07.5 = left`  
**Text:** Thanks to Suri’s open printing, both books spread far and wide. A correction could travel just as far, once you can prove which one is wrong.

### Callback 08

**After:** `C09.4`  
**Only if:** `C08.6 = right`  
**Text:** Halen’s old testing kit still holds its crossed-out wrong claim. Nell copies the habit: mistakes in the pump manual get crossed out, not erased.

### Callback 09

**After:** `C10.5`  
**Only if:** `C09.5 = left`  
**Text:** Shorter shifts have already given people their evenings back. Now the lamps make those hours useful after dark.

### Callback 10

**After:** `C11.2`  
**Only if:** `C10.6 = right`  
**Text:** Lea’s old lamp notes separated useful light from light spilling into the sky. Sol uses the same idea to separate messages from static.

### Callback 11

**After:** `C12.3`  
**Only if:** `C11.2 = left`  
**Text:** Ilan’s old message checks inspire a way to catch damaged data inside the machine. A message doesn’t have to travel far to arrive wrong.

### Callback 12

**After:** `C13.2`  
**Only if:** `C12.5 = right`  
**Text:** Noor’s old library of tested programs includes examples of failure. Ren says those are the machine’s best teachers.

### Callback 13

**After:** `C14.3`  
**Only if:** `C13.5 = left`  
**Text:** Pax once put workers in charge of their own machines. Now residents ask why living somewhere should give them less say than working there.

### Callback 14

**After:** `S1.6`  
**Only if:** `C05.5 = left`  
**Text:** The old tradition of letting anyone copy instructions gives Mira a ready-made way to explain how her model works.

### Callback 15

**After:** `S2.5`  
**Only if:** `C13.5 = left`  
**Text:** Workers were once given control of their machines. That set an example: whoever does the work should have a say in the rules.

### Callback 16

**After:** `S4.3`  
**Only if:** `S3.6 = left`  
**Text:** Your notes include a drawing of Tala’s unknown flower, beside a reminder to yourself: leave room to be surprised.

### Callback 17

**After:** `D2.2`  
**Only if:** `C03.5 = left`  
**Text:** Samir reads about an old shared pantry that fed a whole village. He copies the idea: an emergency food supply anyone can use without asking first.

### Callback 18

**After:** `D3.2`  
**Only if:** `C14.5 = left`  
**Text:** Everyone could read the old life-support plans, including fixes by people whose names nobody wrote down. Avi copies those fixes into the ship’s workshop manual, where anyone can read them.

### Callback 19

**After:** `D4.5`  
**Only if:** `D2.6 = left`  
**Text:** The new station copies the words above the first settlement’s door: A place to live. After such a long journey, that simple promise draws a crowd.

### Callback 20

**After:** `R1.1`  
**Only if:** `C13.5 = left`  
**Text:** The old rules that put workers in charge of their machines are pinned beside the hatch. Someone adds a new line: people who choose not to work still get dinner.

### Callback 21

**After:** `R2.1`  
**Only if:** `C13.5 = right`  
**Text:** The old coordinating service’s rules live on in the mesh. Anyone can look into a decision or point out something it missed, and they keep their supplies while it’s checked.

### Callback 22

**After:** `R4.5`  
**Only if:** `R3.6 = right`  
**Text:** Someone brings one of Kessa’s public inspection kits to the new workshop. Its case is worn smooth. Nobody has had to use it in years, but people still do.

### Callback 23

**After:** `A1.5`  
**Only if:** `C11.5 = left`  
**Text:** Earlier inventors left an open, shared message code. Thanks to it, observatories can compare their records without rebuilding every instrument.

### Callback 24

**After:** `A3.5`  
**Only if:** `C07.5 = left`  
**Text:** The old habit of open reprinting lives on: anyone may copy the translation manuals. A correction can now travel farther than the person who made it.

### Callback 25

**After:** `A4.6`  
**Only if:** `A2.6 = right`  
**Text:** Tovin’s tests for a real reply still check every message. Tovin never heard an answer, but helped make this one trustworthy.

### Callback 26

**After:** `U2.1`  
**Only if:** `U1.2 = left`  
**Text:** The Weather Dial prototype has a big orange handle, copied from the one Sol brought to the Quiet Room. Still ugly. Still easy to find.

### Callback 27

**After:** `U3.2`  
**Only if:** `U2.5 = left`  
**Text:** Bea’s handbook still has the old ban on employers forcing the Weather Dial on workers. Now it also helps stop anyone being forced to change what they want.

### Callback 28

**After:** `U4.1`  
**Only if:** `U3.6 = left`  
**Text:** Applicants read the refusals the archive kept. One applicant closes the proposal and leaves. Ada notes that the safeguard worked.


# 16. Build verification and delivery requirements


## Content integrity gates

- Exactly 34 chapter IDs, 204 card IDs and 34 invention IDs, all unique. Exactly six cards and six bench states per chapter. Exactly two written options per card.
- Every speaker resolves to that chapter’s cast; global `archive` resolves separately. A repeated supporting name never reuses another chapter’s portrait state or relationship automatically.
- Every listed prerequisite exists; the shared sequence and each route terminate. The U3 fork is the only cross-route transition in a live campaign.
- Every callback target and source exists; verify both the true and false case. Never show a callback based on an unchosen side.
- No placeholder dialogue, TODO scenes, dead links, blank outcomes or generated substitute text. No unidentified token such as `{maker}` remains in player-facing copy. Explicit shared templates like `{inventor.name}` must resolve from the current chapter.
- All five endings have five panels and two final-choice variants. Normal obituaries do not display on final route chapters.
- The opening sentence appears verbatim in Simulation’s ending. Use a different person in the simulated world, with the visual composition recalling the opening. Do not confirm that the original world was also simulated.
- Departure preserves travel and light-delay chronology. First Reply’s forty-light-year source implies at least eighty years for the earliest round trip; its reply arrives after eighty-seven. The archive, not an immortal first sender, receives it.
- Retirement genuinely supplies essentials regardless of work or status. Do not quietly change universal provision into a subscription ending.
- Unmaking remains opt-in and clearly irreversible. Its separate communities remain outside the field. The U3 redirect must work from either U3.6 choice. Retain useful earlier inventions on redirect.

## State and interaction tests

Use the repository’s actual test runner. Do not invent evidence of tests that were not run. Cover at least:

1. Both sides of C01.1 work by tap and keyboard; a cancelled swipe commits nothing.
2. One choice produces one result, one set of effects and one persisted side. A duplicate event does nothing. Reload on a result neither doubles affinity nor repeats an invention.
3. Card four commits exactly one invention and enters reveal; continuing reveal reaches card five. Card six writes the corresponding legacy and enters the correct closing view.
4. All six cards play regardless of exposure. Exposure >=2 changes the normal obituary only after card six. C01 always closes naturally; terminal chapters always enter endings.
5. At least one all-left and all-right traversal of every chapter succeeds. Better: enumerate the 64 six-choice combinations per chapter to check completion, invention count and legacy selection.
6. Proposal order uses normalized affinities with stable tie handling. Every route is selectable even from the lowest rank. Reload on an offer preserves order and accepted/deferred state.
7. Complete one full shared-spine-to-ending run for each route using deterministic fixtures. Each ordinary run has 18 lives and 18 committed inventions. Each final panel uses the actual final choice.
8. Complete U1–U3, then redirect. R1–R4 run without replaying C01–C14; the resulting history has 21 lives/inventions and no Stillness Engine. The Unmaking ending must not be marked seen.
9. “Another future” restores exactly the post-C14 checkpoint, removing route-local state while retaining the meta ending collection. “Start from the first spark” starts a new history while retaining that collection.
10. History and Settings can open during a card/result and return without committing or resetting anything. Old prototype saves remain separately stored.
11. At a narrow mobile width and enlarged text, both choices and their full labels remain usable; result text scrolls; no time-critical animation hides content. Reduced motion and keyboard focus work.
12. The script-export tool reads the same authoritative content as the game and displays all routes, callback conditions and effects correctly.

## Art and audio direction for the builder

Use the existing proof-of-concept visual language if it supports this content. Preserve its warmth and readable cards. Eras can change palette, materials and workshop detail without rebuilding the whole interface. There is no required new branding package.

- Common early lives: charcoal, clay, woven fibres, hearth light. Later lives: paper, metal, glass, wire, displays; then route-specific materials.
- Simulation: a physical bench gradually gives way to a window onto a living world. End on a warm, imperfect fire, not a wall of code.
- Departure: gardens and inhabited spaces matter as much as engines. No visual implication that the destination was empty or owned merely because humans arrived.
- Retirement: comfortable ordinary materials, maintained infrastructure, an open workshop. The final bowl must visibly remain imperfect.
- First Reply: instruments, archived corrections, signals and finally a workbench. Do not show an alien face or reveal what the diagram builds; its unknown use is the ending.
- Unmaking: pleasant, inhabitable surroundings. The absence of curiosity must carry the unease; avoid evil medical machinery, stigmatizing asylum imagery or a sinister therapist.
- Portraits reflect individuals, not era-wide caricatures. No real-world culture is shorthand for ignorance. Supporting roles are not default relatives.
- Shared sound motifs, if implemented: first stone strike; object set on a bench; a page or material transition; proof tone that grows subtly with era. Do not require audio to identify state.
- All provisional visuals must be deliberate and usable: simple illustrated silhouettes, vector objects or existing compatible art. No broken-image boxes. Story implementation cannot depend on generating hundreds of bespoke images first.

## Implementation sequence

1. Inspect the existing loader, state machine, save system, art mapping and script-export tools.
2. Add the versioned chapter/card/route data, validator and deterministic transitions. Keep old content outside the active campaign; do not mix incompatible project unlock logic into this one.
3. Implement and verify C01–C02 end to end, including reveal, result resume and history. Then load all remaining authored content without rewriting its prose.
4. Implement future offers, endings, post-C14 replay checkpoint and the explicit U3 redirect.
5. Run content validation and representative full-route tests; inspect narrow-screen play. Fix actual failures, not by deleting scenes or silently disabling a route.
6. Update the developer script export and write a concise completion report identifying what runs, tests actually performed and any remaining art limitations. Do not call a partial two-life implementation complete.

## Definition of done

A player can begin by striking the rocks, play all fourteen shared lives, select any of the five future projects, finish all four lives in that route, see its authored ending, inspect the actual history, and replay another future. All written content in this handoff is present. The U3 redirection preserves history and reaches Retirement. No external writing or additional design session is needed to fill a missing card.

## Source and scope note

This is an original replacement script developed from the user’s supplied proof-of-concept export and the decisions in this conversation. The reference export was https://sevaan.github.io/swipe-dynasty/tools/script.html, read with its linked content files during the discussion. Its pottery/provisions content established the existing two-choice, proof, aftermath and legacy presentation. The new opening, campaign, cast and future routes here replace that limited content rather than claiming it already exists in the repository.

This document is the implementation source of truth for this replacement. Earlier speculative pitches—walking towns, obligatory comic animals, ancestral dynasties, a single mandatory simulation ending, hidden invention points and four fatal resource meters—are not additional requirements. New authored details here resolve previously unspecified implementation choices and can be tuned after a complete playable build.


## Authoring validation performed for this handoff


The delivered script was assembled from structured chapter records. Validation checked 34 unique chapters, 204 unique cards, 408 options, 34 unique inventions, all speaker references, all 28 callback references and the exact opening/ending echo. An abstract state check enumerated 2,176 six-choice chapter paths and all 120 proposal orders. This verifies the written content and specified abstract flow; it is not a claim that Claude’s future game implementation or UI has already been tested.


Computed maximum affinity opportunities for this content: S=15, D=11, R=14, A=12, U=4. Compute them from data in the implementation rather than copying these numbers into gameplay logic.


Chapters with an authored reachable exposure obituary at threshold 2: C02, C06, C09, S1, D1, D2, D3. All other ordinary chapters close naturally.
