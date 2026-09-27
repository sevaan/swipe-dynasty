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

**Arrival:** Before the archive, before the measurements, there is a cold evening. People already use found tools and share knowledge. You are trying to make a flame when you need one.

**Single invention:** `c01-invention` — **A repeatable spark hearth**  
A workable combination of spark-making stone, prepared tinder and a sheltered hearth.

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

**Left: Strike closer to the grass.**  
**Result:** You kneel over the tinder. The next spark reaches it alive. Iri kneels too, pretending this was their idea.  
**Effects:** experimental exposure unchanged.

**Right: Find something finer to catch it.**  
**Result:** You rub dry fibres apart. Iri contributes the least wet corner of a very wet evening.  
**Effects:** experimental exposure unchanged.


### C01.2 — Experiment

**Speaker:** Iri (`iri`)

**Situation:** One pale stone chips. The darker nodule throws brighter sparks against its edge. Iri sorts your pile into stones that help and stones that merely hurt.

**Left: Keep the brighter pair.**  
**Result:** You set aside a flint edge and the spark-making mineral. The remaining stones are promoted to seating.  
**Effects:** experimental exposure unchanged.

**Right: Test the pairs methodically.**  
**Result:** By dusk you know which pair works. Iri now has an opinion about every stone in the valley.  
**Effects:** experimental exposure unchanged.


### C01.3 — Complication

**Speaker:** Iri (`iri`)

**Situation:** The fibres glow, then die. Iri offers a large breath and nearly sends your entire invention across the ground. The cold has become very interested in your progress.

**Left: Feed it air gently.**  
**Result:** You breathe until the glow spreads. Iri watches with the fierce attention usually reserved for somebody carrying dinner.  
**Effects:** experimental exposure unchanged.

**Right: Build a wind shelter first.**  
**Result:** A low wall of stones holds the air still. Inside it, the next ember has time to become a flame.  
**Effects:** experimental exposure unchanged.


### C01.4 — Proof

**Speaker:** Iri (`iri`)

**Situation:** A flame catches. You let it go out deliberately. Iri looks at you as if you have thrown away the sun. Now you must prove you can do it again.

**Left: Repeat the same steps.**  
**Result:** Stone, spark, fibre, breath. A second flame stands up. For the first time tonight, failure would not mean starting from nothing.  
**Effects:** experimental exposure unchanged.

**Right: Let Iri follow your method.**  
**Result:** Iri curses your explanation, corrects your grip, and makes fire. The method works even when you are not holding the stones.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `c01-invention` after its result transaction. Show the invention reveal before C01.5.


### C01.5 — Adoption

**Speaker:** Iri (`iri`)

**Situation:** The others arrive with wood, food and several reasons they were unable to help earlier. One child has never been warm after sunset. They sit very close.

**Left: Teach another hearth.**  
**Result:** Two fires burn by nightfall. You cannot watch both, which is precisely the useful thing about another person learning.  
**Effects:** experimental exposure unchanged; A affinity +1.

**Right: Make a travelling ember carrier.**  
**Result:** A lined bark carrier holds warmth for a short journey. Someone goes to fetch a friend who thought darkness meant staying home.  
**Effects:** experimental exposure unchanged; D affinity +1.


### C01.6 — Legacy

**Speaker:** Iri (`iri`)

**Situation:** Iri is no longer shivering. Beyond the firelight, someone is practicing the striking motion with empty hands. There is still time tonight to teach one more thing.

**Left: Show how to start again.**  
**Result:** You extinguish a small flame, then bring it back. The watching hands begin to copy yours.  
**Effects:** experimental exposure unchanged; S affinity +1.

**Right: Show how to carry it.**  
**Result:** You wrap an ember and walk together into the dark. Behind you, the original fire becomes a small, steady point.  
**Effects:** experimental exposure unchanged; D affinity +1.

### Closing record

**If card six was left:** Aru taught people to start again when the fire went out. The lesson travelled farther than the warmth.

**If card six was right:** Aru made embers portable. Someone could leave the hearth without leaving warmth behind.

**Natural obituary:** Aru died many winters later. That evening, someone else tended the fire.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## C02 — Something That Holds

**Era:** Early settlements  
**Prerequisite:** c01-invention  
**Inventor:** Bel — A water carrier with a bad back  
**Personal want:** Bring water home without making six journeys.

**Arrival:** The hearth outlived Aru. In another settlement, heat is ordinary enough for Bel to complain that nobody uses it sensibly.

**Single invention:** `c02-invention` — **Fired vessels**  
Clay shaped, dried and heated into durable containers.

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

**Situation:** Your best basket has carried almost all the river halfway home. Ves holds the dripping base and asks whether the river would consider moving nearer instead.

**Left: Line the basket with clay.**  
**Result:** The lining keeps a little water. Ves walks very slowly, briefly achieving the dignity normally reserved for processions.  
**Effects:** experimental exposure unchanged.

**Right: Shape a bowl from clay.**  
**Result:** The bowl holds water until you lift it. Ves suggests inventing a river that visits your kitchen.  
**Effects:** experimental exposure unchanged.


### C02.2 — Experiment

**Speaker:** Ves (`ves`)

**Situation:** The dry clay seems hard. Rain restores its confidence in being mud. Near your hearth, however, a fallen fragment has changed colour and refuses to soften.

**Left: Heat small test pieces.**  
**Result:** You place samples at different distances. Ves marks them with scratches, then scratches a warning beside the hottest one.  
**Effects:** experimental exposure unchanged.

**Right: Build a small firing enclosure.**  
**Result:** Stones concentrate the heat. Your eyebrows discover this before the clay does, but both results are informative.  
**Effects:** experimental exposure +1.


### C02.3 — Complication

**Speaker:** Ves (`ves`)

**Situation:** Your first vessel splits. The thick base stayed damp while the thin rim dried. Ves points out that you have successfully invented two smaller vessels without bottoms.

**Left: Dry it more evenly.**  
**Result:** You turn the clay in shade for several days. Ves waits with the strained patience of someone still carrying water.  
**Effects:** experimental exposure unchanged.

**Right: Make the walls evenly thin.**  
**Result:** You reshape the pot until the walls match. It looks less impressive and becomes considerably more useful.  
**Effects:** experimental exposure +1.


### C02.4 — Proof

**Speaker:** Ves (`ves`)

**Situation:** The next pot rings when tapped. You fill it at sunset. At sunrise, the water is still present and Ves has brought a second person to witness this unreasonable event.

**Left: Carry it home.**  
**Result:** Ves arrives with dry feet and a full vessel. For once, the journey has delivered what it promised.  
**Effects:** experimental exposure unchanged.

**Right: Leave water in it another day.**  
**Result:** The level barely changes. You mark the line and discover that a container also makes comparison possible.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `c02-invention` after its result transaction. Show the invention reveal before C02.5.


### C02.5 — Adoption

**Speaker:** Ves (`ves`)

**Situation:** Everyone wants a pot. The firing shelter can make many small ones or a single jar large enough to supply the meeting place. Both require people to gather fuel.

**Left: Make household pots.**  
**Result:** Different homes get different shapes. One family requests a lid; another requests that the first family stop requesting things.  
**Effects:** experimental exposure unchanged; R affinity +1.

**Right: Make a communal jar.**  
**Result:** The great jar fills. People meet beside it, share news, and begin the first argument about whose turn it is to clean.  
**Effects:** experimental exposure unchanged; A affinity +1.


### C02.6 — Legacy

**Speaker:** Ves (`ves`)

**Situation:** Ves can finally carry a day’s water in one trip. Someone asks whether the same vessel could hold grain. You look at the lid and the damp interior.

**Left: Leave a simple pattern to copy.**  
**Result:** You scratch measurements into a fired tile. Years later, someone mistakes the tile for a very disappointing serving plate.  
**Effects:** experimental exposure unchanged; S affinity +1.

**Right: Leave a large working vessel.**  
**Result:** You make one final large jar for the meeting place. People remember it long after your workshop closes, and keep finding things to put inside.  
**Effects:** experimental exposure unchanged; R affinity +1.

### Closing record

**If card six was left:** Bel left a small vessel anyone could copy. The copies varied; the water stayed inside.

**If card six was right:** Bel left a large vessel people could fill together. Soon they needed to agree whose water it was.

**Natural obituary:** Bel grew old enough to complain about newer pots. They were lighter, which was apparently suspicious.

**Risk obituary (exposure ≥ 2):** Years of hot workshop trials shortened Bel’s life. Ves kept the useful vessels and improved the shelter around the kiln.


## C03 — Dinner, Later

**Era:** Stored harvests  
**Prerequisite:** c02-invention  
**Inventor:** Neri — A seasonal food gatherer  
**Personal want:** Keep enough food for a friend returning after winter.

**Arrival:** Bel’s vessels travelled as objects, copies and rumours. Neri has one. Unfortunately, it is excellent at containing rotten food.

**Single invention:** `c03-invention` — **Preserved provisions**  
Food dried or salted and stored in protected, dry containers.

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

**Situation:** Tal leaves after the harvest and returns after the snow. You promise a welcome meal. Your current stores will welcome them with a smell visible from the doorway.

**Left: Slice the food thinly.**  
**Result:** Ada spreads the pieces where air can reach them. Your contribution is admitting that a whole damp heap was ambitious.  
**Effects:** experimental exposure unchanged.

**Right: Try the traders’ salt.**  
**Result:** The salt draws out moisture. Tal asks whether your promised meal includes enough water to survive eating it.  
**Effects:** experimental exposure unchanged.


### C03.2 — Experiment

**Speaker:** Ada (`ada`)

**Situation:** The exposed food keeps better. Birds have also noticed its improvement. You have two audiences for this experiment and only one is supposed to benefit.

**Left: Cover the drying rack.**  
**Result:** A loose woven cover admits air and excludes beaks. The birds conduct a brief inspection, then file no appeal.  
**Effects:** experimental exposure unchanged.

**Right: Dry it above gentle smoke.**  
**Result:** Smoke discourages the birds and adds flavour. You move the rack before your dinner becomes a demonstration of combustion.  
**Effects:** experimental exposure +1.


### C03.3 — Complication

**Speaker:** Ada (`ada`)

**Situation:** A sealed jar smells worse than an open one. Ada breaks apart the damp food inside. The vessel was sound. What you asked it to preserve was the problem.

**Left: Dry the food before sealing.**  
**Result:** You leave the next batch until it is thoroughly dry. This is less dramatic than improving the lid, and works.  
**Effects:** experimental exposure unchanged.

**Right: Salt, drain, then store it.**  
**Result:** You remove the brine before packing the food. The lid now protects a useful result instead of trapping an unfinished mistake.  
**Effects:** experimental exposure unchanged.


### C03.4 — Proof

**Speaker:** Tal (`tal`)

**Situation:** Winter ends. Tal returns thinner, carrying a gift wrapped in leaves. You open the marked jar. It smells like food, which briefly feels like an inadequate word.

**Left: Cook a meal for everyone.**  
**Result:** The stores become dinner. Tal eats slowly, then asks whether there is more. For once, you can answer yes.  
**Effects:** experimental exposure unchanged.

**Right: Compare it with fresh food.**  
**Result:** Ada checks the stored batch against fresh provisions. You record the useful differences and discard the unsafe trials without tasting them.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `c03-invention` after its result transaction. Show the invention reveal before C03.5.


### C03.5 — Adoption

**Speaker:** Ada (`ada`)

**Situation:** The method works. There is enough time before next winter to teach a shared pantry or prepare food for people travelling between settlements. Ada wants both eventually.

**Left: Open the method and shared stores.**  
**Result:** Families bring provisions and learn the process. People who could not contribute are fed too; the stores were made for winter, not applause.  
**Effects:** experimental exposure unchanged; R affinity +1.

**Right: Equip the returning travellers.**  
**Result:** Tal leaves with food that will last. Along the route, each empty container becomes a reason to explain what it once held.  
**Effects:** experimental exposure unchanged; D affinity +1.


### C03.6 — Legacy

**Speaker:** Tal (`tal`)

**Situation:** Tal lays a smooth stone beside the first winter jar. It came from farther away than you have ever walked. Your food made the return journey possible.

**Left: Keep a store for the settlement.**  
**Result:** The jar becomes one of many. Children grow up believing winter meals are ordinary, which is the achievement you wanted.  
**Effects:** experimental exposure unchanged; R affinity +1.

**Right: Keep a store for the next journey.**  
**Result:** You mark the next departure date on a container. The promise of return now includes practical arrangements.  
**Effects:** experimental exposure unchanged; D affinity +1.

### Closing record

**If card six was left:** Neri left winter stores people replenished together. The settlement learned to count beyond tomorrow.

**If card six was right:** Neri left journey packs. Distance became something a person could prepare for.

**Natural obituary:** Neri saw Tal return many times. At the last meal, nobody mentioned how frightened they had once been.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## C04 — Next Season

**Era:** Cultivated fields  
**Prerequisite:** c03-invention  
**Inventor:** Eda — A gatherer watching the paths change  
**Personal want:** Bring reliable food closer to a household that cannot travel far.

**Arrival:** Preserved food makes waiting possible. Eda notices useful plants growing where last year’s carrying sacks spilled beside the path.

**Single invention:** `c04-invention` — **A repeatable cultivation cycle**  
Seed selection, sowing, tending and retaining seed for another season.

### Cast

- `sen` — **Sen:** A household member with limited mobility and excellent observational skills.
- `oma` — **Oma:** A neighbour who understands that land is never as empty as it looks.

### Workbench progression

1. Seeds on a path
2. Two trial beds
3. Water channel or mulch
4. Harvest with reserved seed
5. Shared plots or trial varieties
6. Seed pouch and planting record

### C04.1 — Opening

**Speaker:** Sen (`sen`)

**Situation:** The plants beside the path grew from spilled seeds. Sen has watched them for weeks. You have walked past them carrying food from much farther away.

**Left: Plant close to the house.**  
**Result:** Sen can reach the bed from the doorway. The experiment acquires someone patient enough to notice what changes every day.  
**Effects:** experimental exposure unchanged.

**Right: Plant beside the old spill.**  
**Result:** You copy the conditions that already worked. Sen asks you to bring back observations as well as optimistic descriptions.  
**Effects:** experimental exposure unchanged.


### C04.2 — Experiment

**Speaker:** Oma (`oma`)

**Situation:** Oma uses that ground for grazing. Your neat rows have complicated a previous arrangement that nobody thought needed to be written down. The plants are doing very well.

**Left: Agree on seasonal use.**  
**Result:** You mark a time for planting and a time for animals. The agreement is imperfect, but everyone knows what was agreed.  
**Effects:** experimental exposure unchanged.

**Right: Choose a smaller unused patch.**  
**Result:** The harvest will be smaller. You spend the saved effort comparing seeds instead of defending a border.  
**Effects:** experimental exposure unchanged.


### C04.3 — Complication

**Speaker:** Sen (`sen`)

**Situation:** Rain misses the settlement. The plants near your washing place stay greener. Sen suggests the crops are less interested in your speeches than in where the water goes.

**Left: Build a shallow water channel.**  
**Result:** You guide a little water toward the roots. Sen closes the channel before your useful field becomes an experimental pond.  
**Effects:** experimental exposure +1.

**Right: Cover the soil with plant scraps.**  
**Result:** The covered soil stays damp longer. What looked like untidiness becomes a technique once you explain it confidently.  
**Effects:** experimental exposure unchanged.


### C04.4 — Proof

**Speaker:** Sen (`sen`)

**Situation:** The plants yield a crop. Some seeds must stay uneaten if this is to happen again. Sen has tied a cord around the seed pouch and written nothing, very firmly.

**Left: Reserve the healthiest seeds.**  
**Result:** The next season begins with what the first season taught you. Dinner is slightly smaller; the future is considerably better supplied.  
**Effects:** experimental exposure unchanged.

**Right: Reserve a mixture of seeds.**  
**Result:** You keep several varieties apart. They respond differently next season, giving you something better than one lucky result.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `c04-invention` after its result transaction. Show the invention reveal before C04.5.


### C04.5 — Adoption

**Speaker:** Oma (`oma`)

**Situation:** Other households ask for space and seed. You can organize shared plots or small trials under different conditions. Oma volunteers to keep the livestock out of whichever you choose.

**Left: Share plots and planting knowledge.**  
**Result:** People work beside one another. Sen teaches from a stool at the field edge, where the best arguments now happen.  
**Effects:** experimental exposure unchanged; R affinity +1.

**Right: Distribute several trial varieties.**  
**Result:** Different ground reveals different strengths. People bring back seeds and findings, sometimes mixed together in the same regrettable sack.  
**Effects:** experimental exposure unchanged; S affinity +1.


### C04.6 — Legacy

**Speaker:** Sen (`sen`)

**Situation:** The old gathering path is still there. This season, nobody in your household had to take it hungry. Sen asks what you should leave for the next people tending this ground.

**Left: Leave a shared planting calendar.**  
**Result:** The calendar follows seasons rather than rulers. Rain remains unimpressed by both, but people begin preparing before it arrives.  
**Effects:** experimental exposure unchanged; R affinity +1.

**Right: Leave seeds and pictorial records.**  
**Result:** Simple drawings and sorted tokens distinguish the seeds. A future grower will find several possible answers, though much still needs explaining aloud.  
**Effects:** experimental exposure unchanged; S affinity +1.

### Closing record

**If card six was left:** Eda left plots tended by several households. Harvest became a shared task with very individual opinions.

**If card six was right:** Eda left several seed varieties, pictorial marks and matching tokens. One bad season no longer had the only vote.

**Natural obituary:** Eda died after a harvest they did not have to gather. Sen’s seed markings remained in use.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## C05 — Someone Must Remember

**Era:** Recorded knowledge  
**Prerequisite:** c04-invention  
**Inventor:** Tavi — A storekeeper with an unreliable memory  
**Personal want:** Keep a deceased teacher’s methods from disappearing.

**Arrival:** The person who taught Tavi to manage the stores is gone. Their knowledge was generous, precise and inconveniently located in one mortal head.

**Single invention:** `c05-invention` — **Durable written instructions**  
Repeatable marks that let an absent person transmit a procedure.

### Cast

- `rin` — **Rin:** A learner who interprets instructions exactly as written.
- `tavi` — **Tavi:** A storekeeper trying to preserve more than quantities.

### Workbench progression

1. Clay tally marks
2. Symbols with key
3. Misread instruction tile
4. A procedure followed correctly
5. Public copies or tended archive
6. Teacher’s correction preserved

### C05.1 — Opening

**Speaker:** Rin (`rin`)

**Situation:** You know how many jars remain. You cannot remember how your teacher prepared the seal that kept them sound. Rin asks whether the scratches on your tally could remember something more useful.

**Left: Draw the sequence of actions.**  
**Result:** The pictures preserve the order. Rin identifies the seal, the pot and what they believe to be an angry fish.  
**Effects:** experimental exposure unchanged.

**Right: Give each action a repeatable mark.**  
**Result:** You teach Rin a small vocabulary of signs. The angry fish becomes unnecessary, although Rin has grown fond of it.  
**Effects:** experimental exposure unchanged.


### C05.2 — Experiment

**Speaker:** Rin (`rin`)

**Situation:** Rin follows your marks and adds water before drying the grain. Your teacher never said not to. Your teacher also never expected anyone to do this.

**Left: Write the missing step.**  
**Result:** You add a clear instruction about drying. The method becomes longer and more useful, two qualities Rin considers unfairly associated.  
**Effects:** experimental exposure unchanged.

**Right: Add a worked example.**  
**Result:** A drawing shows the grain at each stage. Rin points to the damp one and says the mistake was quite understandable.  
**Effects:** experimental exposure unchanged.


### C05.3 — Complication

**Speaker:** Rin (`rin`)

**Situation:** Two marks look nearly identical. One means heat gently; the other means fill completely. Rin has produced a hot, overflowing demonstration of why handwriting matters.

**Left: Separate the confusing symbols.**  
**Result:** You redraw them with distinct shapes. Rin can tell them apart even in poor light, which is when most mistakes seemed ambitious.  
**Effects:** experimental exposure unchanged.

**Right: Attach a reference key.**  
**Result:** The key travels with every copy. Readers stop guessing as often, though Rin misses having a defence for every result.  
**Effects:** experimental exposure +1.


### C05.4 — Proof

**Speaker:** Rin (`rin`)

**Situation:** You leave the room. Rin follows the revised instructions without asking a question. When you return, a sealed vessel stands on the table and the table itself is uninjured.

**Left: Ask Rin to teach another reader.**  
**Result:** The second reader repeats the procedure. Your teacher’s method has crossed a gap that your voice did not have to fill.  
**Effects:** experimental exposure unchanged.

**Right: Ask for a written correction.**  
**Result:** Rin adds a note about a difficult step. The method improves without pretending its first author was perfect.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `c05-invention` after its result transaction. Show the invention reveal before C05.5.


### C05.5 — Adoption

**Speaker:** Rin (`rin`)

**Situation:** People want copies. You can put the instructions in a public place or train custodians to protect and explain them. Rin insists neither arrangement should make learning hereditary.

**Left: Let anyone copy the instructions.**  
**Result:** The marks spread beyond the stores. Someone records a recipe; someone else writes a complaint about that recipe.  
**Effects:** experimental exposure unchanged; A affinity +1.

**Right: Build an archive with trained readers.**  
**Result:** The archive preserves versions and teaches new readers. Its first rule is that the door must open from the outside.  
**Effects:** experimental exposure unchanged; S affinity +1.


### C05.6 — Legacy

**Speaker:** Rin (`rin`)

**Situation:** You find your teacher’s old practice vessel. Two different seal marks show that they changed their method. Rin asks whether that imperfection belongs beside the instructions you have now written.

**Left: Copy it into the public instructions.**  
**Result:** The correction travels beside the method. A stranger will know that changing your mind can be part of knowing something.  
**Effects:** experimental exposure unchanged; A affinity +1.

**Right: Keep it with the original records.**  
**Result:** Readers see the work becoming better over time. The archive preserves the person as well as the polished result.  
**Effects:** experimental exposure unchanged; S affinity +1.

### Closing record

**If card six was left:** Tavi left instructions where anyone could copy them. The teacher acquired pupils they would never meet.

**If card six was right:** Tavi left a cared-for archive and trained readers. Keeping knowledge alive became someone’s responsibility.

**Natural obituary:** Tavi died with unfinished notes beside the bed. Someone could read them.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## C06 — Parts That Agree

**Era:** Metal workshops  
**Prerequisite:** c05-invention  
**Inventor:** Omi — A repairer of tools  
**Personal want:** Make replacement parts fit without starting over.

**Arrival:** Written recipes describe furnaces, alloys and tools. Omi’s workshop inherits all three, along with a cupboard of parts that almost fit.

**Single invention:** `c06-invention` — **Repeatable metal fittings**  
Templates and gauges for producing compatible, repairable components.

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

**Situation:** Lu brings a broken pump. Every replacement pin is slightly different. Fen says each was made by a master. Lu asks whether one master could agree with another.

**Left: Make a standard gauge.**  
**Result:** You file a reference opening and test each pin against it. Fen grudgingly admits the hole has excellent judgement.  
**Effects:** experimental exposure unchanged.

**Right: Make a reusable template.**  
**Result:** A template fixes the important dimensions. The decorative differences survive, which saves Fen a speech and you an afternoon.  
**Effects:** experimental exposure unchanged.


### C06.2 — Experiment

**Speaker:** Fen (`fen`)

**Situation:** The new part fits cold and sticks when hot. Fen points out that your perfect measurement forgot the furnace, the weather and the existence of expansion.

**Left: Measure at working temperature.**  
**Result:** You compare heated samples with suitable tools. The standard gains a condition, and becomes more honest for having one.  
**Effects:** experimental exposure +1.

**Right: Allow a measured clearance.**  
**Result:** A small deliberate gap keeps the mechanism moving. Lu admires your ability to sell an empty space as progress.  
**Effects:** experimental exposure unchanged.


### C06.3 — Complication

**Speaker:** Lu (`lu`)

**Situation:** A cheaper metal wears out quickly. A tougher mixture lasts but takes longer to shape. The pump needs to work every day, not win a competition on the day it is delivered.

**Left: Test durable mixtures.**  
**Result:** You record repeated use, not just first impressions. Fen’s preferred alloy earns its reputation instead of inheriting it.  
**Effects:** experimental exposure +1.

**Right: Make the wearing part replaceable.**  
**Result:** The soft piece becomes a planned replacement. Lu can change it without dismantling the whole pump or inviting you to dinner.  
**Effects:** experimental exposure unchanged.


### C06.4 — Proof

**Speaker:** Fen (`fen`)

**Situation:** Two fittings made by different people work in the same pump. Fen secretly tries a third. It fits too. He examines the gauge as if it has begun stealing his customers.

**Left: Let Lu replace one unaided.**  
**Result:** Lu swaps the fitting and restarts the pump. Fen realizes someone will still need to make the replacements, preferably him.  
**Effects:** experimental exposure unchanged.

**Right: Test parts from another workshop.**  
**Result:** Their fitting works after one documented correction. A shared measurement has done what a shouted argument between workshops could not.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `c06-invention` after its result transaction. Show the invention reveal before C06.5.


### C06.5 — Adoption

**Speaker:** Lu (`lu`)

**Situation:** Other repairers request your measurements. Some can copy a gauge; others cannot afford the metal. Lu reminds you that broken pumps occur in places without fine workshops.

**Left: Publish the standard dimensions.**  
**Result:** Workshops make compatible parts. Arguments continue, but people can now measure exactly how much they disagree.  
**Effects:** experimental exposure unchanged; S affinity +1.

**Right: Send a shared measuring kit.**  
**Result:** The kit travels between settlements. Its box accumulates repairs of its own, each made to fit the original hinges.  
**Effects:** experimental exposure unchanged; D affinity +1.


### C06.6 — Legacy

**Speaker:** Fen (`fen`)

**Situation:** Fen asks what should bear your name: the gauge, the tool kit or the repaired pump still delivering water outside. Lu votes for the pump, which cannot read.

**Left: Leave the gauge freely reproducible.**  
**Result:** Your name fades from some copies. The measurements survive with remarkable precision, which was more or less the point.  
**Effects:** experimental exposure unchanged; R affinity +1.

**Right: Leave the kit to travelling repairers.**  
**Result:** The kit acquires notes in several hands. None of them asks permission before making it more useful.  
**Effects:** experimental exposure unchanged; D affinity +1.

### Closing record

**If card six was left:** Omi left a public gauge. Strangers could make parts for machines they had never seen.

**If card six was right:** Omi left a travelling repair kit. Useful measurements went where broken things were.

**Natural obituary:** Omi outlived several pumps by replacing almost every part. Nobody agreed which pump was the original.

**Risk obituary (exposure ≥ 2):** A later casting accident ended Omi’s life. Fen finished the repair using the shared measurements.


## C07 — More Than One Copy

**Era:** Printing workshops  
**Prerequisite:** c06-invention  
**Inventor:** Suri — A copyist losing the use of long working hours  
**Personal want:** Get a useful handbook to more people than one hand can serve.

**Arrival:** Metal fittings make repeatability familiar. Written knowledge still travels at the speed of a tired person copying it. Suri has a waiting list longer than the book.

**Single invention:** `c07-invention` — **Reproducible printed pages**  
A reusable printing system with proofing and corrections.

### Cast

- `dev` — **Dev:** A bookseller whose enthusiasm is almost a safety hazard.
- `jo` — **Jo:** A reader who finds errors because they use the instructions.

### Workbench progression

1. Handwritten page
2. Type or carved block
3. Ink trials
4. Two matching legible sheets
5. Open handbook or corrected edition
6. Errata slip beside press

### C07.1 — Opening

**Speaker:** Dev (`dev`)

**Situation:** Dev has sold forty copies of a handbook you have written twice. The customers arrive next week. Dev describes this as a strong demand signal rather than a personal offence.

**Left: Arrange reusable letter pieces.**  
**Result:** You compose a line once and prepare to repeat it. Dev watches the supply of possible promises increase dangerously.  
**Effects:** experimental exposure unchanged.

**Right: Carve a reusable page block.**  
**Result:** The block holds an entire page. You discover an error immediately after finishing, establishing a useful reason to proof before carving.  
**Effects:** experimental exposure unchanged.


### C07.2 — Experiment

**Speaker:** Jo (`jo`)

**Situation:** The first impression is a black rectangle. Jo congratulates you on a book that assumes nothing about the reader, including the ability to distinguish letters.

**Left: Use less ink and firmer pressure.**  
**Result:** The letters separate. Dev reads the page aloud twice, partly to celebrate and partly to sell the second reading.  
**Effects:** experimental exposure +1.

**Right: Change the ink and paper pairing.**  
**Result:** A better match produces clean marks. You keep the failed samples to discourage future claims that this happened instantly.  
**Effects:** experimental exposure unchanged.


### C07.3 — Complication

**Speaker:** Jo (`jo`)

**Situation:** A printed instruction says to heat the mixture until it is dangerous. Your original said until it is darker. Forty identical mistakes are waiting to happen.

**Left: Proof with someone using the method.**  
**Result:** Jo catches two more errors. Actual use is slower than admiration and considerably better at protecting the reader.  
**Effects:** experimental exposure unchanged.

**Right: Print a test sheet for review.**  
**Result:** Several readers return corrections. One merely dislikes your punctuation, but you keep the useful notes and thank everyone.  
**Effects:** experimental exposure unchanged.


### C07.4 — Proof

**Speaker:** Dev (`dev`)

**Situation:** Two strangers read two copies and make the same useful thing. Neither has met the original writer. Dev asks whether you understand how many books that means he can promise.

**Left: Print a small verified edition.**  
**Result:** Every copy includes the version and corrections. Dev learns the phrase print run and immediately wants a larger one.  
**Effects:** experimental exposure unchanged.

**Right: Teach another printer the process.**  
**Result:** A second workshop produces readable pages. Your idea now has a source of copies that does not require your waking hours.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `c07-invention` after its result transaction. Show the invention reveal before C07.5.


### C07.5 — Adoption

**Speaker:** Jo (`jo`)

**Situation:** The handbook is useful enough to sell. It is also useful enough that people without money need it. Dev asks for a plan that pays for paper and still reaches them.

**Left: Allow open reprinting and shared copies.**  
**Result:** Shops compete on clarity and price. Jo posts corrections where anyone can see them, including the shops that need them most.  
**Effects:** experimental exposure unchanged; A affinity +1.

**Right: Sell editions and fund access copies.**  
**Result:** Paid copies cover cheap public ones. The arrangement needs tending, but Jo can point to readers who actually received the books.  
**Effects:** experimental exposure unchanged; R affinity +1.


### C07.6 — Legacy

**Speaker:** Dev (`dev`)

**Situation:** A reader sends a correction better than anything in your edition. Dev suggests printing it under your name because that is the name people recognize.

**Left: Credit the reader and free the revision.**  
**Result:** The new edition names its contributor. Other readers discover that the book can listen as well as speak.  
**Effects:** experimental exposure unchanged; A affinity +1.

**Right: Credit the reader in a revised edition.**  
**Result:** You keep an edition history with names attached. Correcting the book becomes evidence of care rather than an admission of defeat.  
**Effects:** experimental exposure unchanged; S affinity +1.

### Closing record

**If card six was left:** Suri let others print the handbook. Knowledge spread, accompanied by a growing literature of corrections.

**If card six was right:** Suri funded careful editions and cheap access copies. Readers learned to ask which version they held.

**Natural obituary:** Suri died surrounded by books they had not copied. They considered this a professional triumph.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## C08 — Try It Again

**Era:** Experimental societies  
**Prerequisite:** c07-invention  
**Inventor:** Halen — A maker caught between confident explanations  
**Personal want:** Find out which remedy actually protects a valuable crop.

**Arrival:** Printed books disagree with impressive consistency. Halen has inherited explanations, instruments and a field that cannot afford to believe all of them.

**Single invention:** `c08-invention` — **A reproducible trial protocol**  
Comparable trials, recorded conditions and independent repetition.

### Cast

- `bea` — **Bea:** A grower whose practical standards are exacting.
- `essor` — **Essor:** A respected lecturer capable of changing their mind, reluctantly.

### Workbench progression

1. Two confident books
2. Matched test pots
3. Labels and control plot
4. Repeated result chart
5. Open procedure or verification kit
6. Notebook containing a crossed-out claim

### C08.1 — Opening

**Speaker:** Bea (`bea`)

**Situation:** One book recommends shade. Another recommends more sun. Both describe disagreement as foolishness. Bea asks whether the crop could vote, since it will be suffering the consequences.

**Left: Compare matched groups of plants.**  
**Result:** You divide similar plants between conditions. Bea labels them before either author can claim the healthier ones retrospectively.  
**Effects:** experimental exposure unchanged.

**Right: Measure the current conditions first.**  
**Result:** You record light, moisture and growth. The observations suggest a fair comparison instead of merely a contest between confident people.  
**Effects:** experimental exposure unchanged.


### C08.2 — Experiment

**Speaker:** Essor (`essor`)

**Situation:** Essor’s preferred treatment works in the first plot. That plot also has better soil. Essor calls this irrelevant with the intensity usually reserved for relevant things.

**Left: Repeat with matched soil.**  
**Result:** Essor helps prepare the second trial. Their explanation becomes quieter but considerably more useful as the conditions become fairer.  
**Effects:** experimental exposure unchanged.

**Right: Swap the plot assignments.**  
**Result:** The result follows the soil more than the treatment. Bea looks at the books and asks whether paper improves drainage.  
**Effects:** experimental exposure unchanged.


### C08.3 — Complication

**Speaker:** Bea (`bea`)

**Situation:** A label washes away. You think you remember which group it marked. Bea says memory is a brave substitute for a record, especially when the record disagrees with your favourite idea.

**Left: Repeat the uncertain trial.**  
**Result:** It takes another season. You obtain a result that does not require confidence in your memory, which everyone appreciates.  
**Effects:** experimental exposure +1.

**Right: Exclude the damaged records.**  
**Result:** You report only the usable observations and state what is missing. Essor discovers that uncertainty can fit inside a respectable sentence.  
**Effects:** experimental exposure unchanged.


### C08.4 — Proof

**Speaker:** Essor (`essor`)

**Situation:** A grower elsewhere follows your protocol and obtains the same pattern. One result differs; their water supply differs too. The exception gives you a new question instead of an enemy.

**Left: Publish the conditions and limits.**  
**Result:** Readers can see what you established and what you did not. Bea finally has something more useful than a recommendation without instructions.  
**Effects:** experimental exposure unchanged.

**Right: Send materials for another repetition.**  
**Result:** A third trial agrees under matched conditions. The method travels without needing your presence or Essor’s reputation.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `c08-invention` after its result transaction. Show the invention reveal before C08.5.


### C08.5 — Adoption

**Speaker:** Bea (`bea`)

**Situation:** People ask for a universal answer. Your actual answer works under specified conditions. Bea would rather save this year’s crop than be promised mastery over every possible plant.

**Left: Share the full procedure openly.**  
**Result:** People adapt it to their conditions and report changes. Some of the most useful findings arrive with muddy fingerprints.  
**Effects:** experimental exposure unchanged; S affinity +1.

**Right: Build a portable verification kit.**  
**Result:** The kit helps growers test local conditions. Essor calls it a travelling argument, with something approaching affection.  
**Effects:** experimental exposure unchanged; D affinity +1.


### C08.6 — Legacy

**Speaker:** Essor (`essor`)

**Situation:** You find the first claim you wrote before testing anything. It is wrong. Essor asks whether it belongs in the archive beside the successful result.

**Left: Keep it beside the open protocol.**  
**Result:** The crossed-out claim shows where the work began. A later reader feels permitted to doubt a printed sentence.  
**Effects:** experimental exposure unchanged; S affinity +1.

**Right: Keep it with the measurement kit.**  
**Result:** The kit travels with a record of a persuasive mistake. Users learn to check the instrument and their expectations.  
**Effects:** experimental exposure unchanged; A affinity +1.

### Closing record

**If card six was left:** Halen left a procedure others could challenge. A result became stronger when it survived somebody else’s hands.

**If card six was right:** Halen left instruments and records for repeat tests. Authority gained the awkward habit of being measurable.

**Natural obituary:** Halen died with a question still open. Their colleagues resisted the temptation to close it for the ceremony.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## C09 — The Work of Water

**Era:** Powered industry  
**Prerequisite:** c08-invention  
**Inventor:** Bram — A mill repairer  
**Personal want:** Stop people exhausting themselves on a flooded worksite.

**Arrival:** Metal standards and repeatable experiments meet at Bram’s bench. Below the workshop, people spend their days carrying water out of a place that keeps filling.

**Single invention:** `c09-invention` — **A regulated mechanical engine**  
A heat-driven mechanism with a governor and pressure safeguards.

### Cast

- `nell` — **Nell:** A pump worker with detailed knowledge of everything that goes wrong.
- `ivo` — **Ivo:** A workshop owner who initially measures success only in output.

### Workbench progression

1. Manual pump
2. Piston model
3. Valve and gauge
4. Working regulated engine
5. Shorter shift or stronger safeguards
6. Quiet pump room

### C09.1 — Opening

**Speaker:** Nell (`nell`)

**Situation:** Nell carries another bucket up the stairs. The water returns through the ground before she finishes the next one. She asks whether you can invent a less committed relationship with the flood.

**Left: Build a small powered pump.**  
**Result:** A piston moves water without a person lifting it. Nell watches three strokes before asking whether you can make it last a shift.  
**Effects:** experimental exposure unchanged.

**Right: Test a heat-driven piston first.**  
**Result:** You demonstrate controlled motion on the bench. Ivo immediately calculates output from a model too small to lift his tea.  
**Effects:** experimental exposure unchanged.


### C09.2 — Experiment

**Speaker:** Nell (`nell`)

**Situation:** The engine runs quickly when the load drops. Ivo calls it improved performance. Nell calls it the sound immediately before everyone runs outside.

**Left: Add a mechanical governor.**  
**Result:** The governor reduces the input as speed rises. Ivo is disappointed that the clever part tells the profitable part to calm down.  
**Effects:** experimental exposure +1.

**Right: Add a relief valve and limit.**  
**Result:** Excess pressure has somewhere safe to go. Nell asks for a gauge she can read from a sensible distance.  
**Effects:** experimental exposure unchanged.


### C09.3 — Complication

**Speaker:** Ivo (`ivo`)

**Situation:** A seal leaks. Better metal costs more; a replaceable seal needs regular checks. Nell says either is acceptable if checking it counts as work rather than personal enthusiasm.

**Left: Use a stronger tested assembly.**  
**Result:** The assembly survives repeated trials. You document its limits, including the conditions under which it absolutely must stop.  
**Effects:** experimental exposure +1.

**Right: Design for quick safe replacement.**  
**Result:** The worn piece can be changed after shutdown. Nell writes the procedure with the clarity of someone expected to follow it.  
**Effects:** experimental exposure unchanged.


### C09.4 — Proof

**Speaker:** Nell (`nell`)

**Situation:** The pump runs through a full trial with workers outside the shaft. When it stops, it stops on purpose. Nell goes home with enough energy to do something besides sleep.

**Left: Repeat under variable loads.**  
**Result:** The protection system keeps the engine within its documented limits. Nell trusts it more after watching it refuse an unsafe demand.  
**Effects:** experimental exposure unchanged.

**Right: Have the crew operate it.**  
**Result:** The crew starts, stops and maintains the engine. Power becomes usable without its inventor standing beside every lever.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `c09-invention` after its result transaction. Show the invention reveal before C09.5.


### C09.5 — Adoption

**Speaker:** Ivo (`ivo`)

**Situation:** The engine finishes the old workload early. Ivo proposes filling the spare hours with extra work. Nell has promised to see her child before sunset for the first time this week.

**Left: Negotiate a shorter paid shift.**  
**Result:** Output remains reliable and the crew gains time. Ivo discovers that rested workers break fewer things, including his patience.  
**Effects:** experimental exposure unchanged; R affinity +1.

**Right: Prioritize safe output and crew training.**  
**Result:** The crew gets paid training and enforceable stop rules. Nell returns later that evening, carrying skills she can use elsewhere.  
**Effects:** experimental exposure unchanged; D affinity +1.


### C09.6 — Legacy

**Speaker:** Nell (`nell`)

**Situation:** Nell asks what later builders should copy: the engine alone, or the arrangements that made it worth working beside. The machine offers no opinion. It has had enough attention.

**Left: Record the work and time saved.**  
**Result:** Your handbook measures success in output and hours returned. A future engineer finds both numbers worth improving.  
**Effects:** experimental exposure unchanged; R affinity +1.

**Right: Record every limit and safety test.**  
**Result:** Your handbook makes safe stopping part of a successful design. Later machines inherit permission to refuse their owners.  
**Effects:** experimental exposure unchanged; S affinity +1.

### Closing record

**If card six was left:** Bram left power that reduced a working day. People began making plans for the time it returned.

**If card six was right:** Bram left power with inspectable safeguards. Later engineers inherited limits as well as pressure.

**Natural obituary:** Bram died long after leaving the pump room. The machine kept working through the afternoon off they had earned.

**Risk obituary (exposure ≥ 2):** A later pressure failure killed Bram. Nell’s emergency procedure protected the crew, who carried the work forward.


## C10 — A Longer Evening

**Era:** Electrical networks  
**Prerequisite:** c09-invention  
**Inventor:** Lea — An experimenter repairing unreliable lamps  
**Personal want:** Make the harbour path safe after sunset.

**Arrival:** Engines can move heavy things. Lea’s experiments suggest they can also supply something that travels down a wire and makes light at the far end.

**Single invention:** `c10-invention` — **A protected electrical lighting circuit**  
A generator, conductors, usable lamps and fault protection.

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

**Situation:** Mai lights the harbour lamps one ladder at a time. She has seen your wire glow and would like it to glow somewhere that does not require her climbing in a storm.

**Left: Build a small generating circuit.**  
**Result:** A turning mechanism produces usable current. Mai asks whether the motion can come from something other than your exhausted apprentice.  
**Effects:** experimental exposure unchanged.

**Right: Improve the lamp before scaling.**  
**Result:** The lamp gives steadier light. You learn that making electricity useful involves more than persuading something to become very hot.  
**Effects:** experimental exposure unchanged.


### C10.2 — Experiment

**Speaker:** Mai (`mai`)

**Situation:** A damaged joint becomes hot enough to threaten the workshop. Mai points at the old oil lamp and says your replacement should try to be less flammable than its competition.

**Left: Add insulation and a fuse.**  
**Result:** The fuse interrupts a deliberately introduced fault. The room stays intact, a result you both find professionally encouraging.  
**Effects:** experimental exposure unchanged.

**Right: Enclose joints and limit current.**  
**Result:** Protected connections survive the wet test. Mai labels the parts nobody should touch, including the one you just touched.  
**Effects:** experimental exposure +1.


### C10.3 — Complication

**Speaker:** Oren (`oren`)

**Situation:** Oren supports lighting the harbour. He objects to lighting the sky above it. Through his telescope, your improvement looks like the disappearance of several thousand stars.

**Left: Shield the lamps downward.**  
**Result:** The path becomes brighter while the sky grows darker. Mai notes that shining light where people walk was an elegant development.  
**Effects:** experimental exposure unchanged.

**Right: Use timed lighting and local switches.**  
**Result:** Late walkers can light their route. Oren gets long dark intervals, and Mai gets to stop being everyone’s personal switch.  
**Effects:** experimental exposure unchanged.


### C10.4 — Proof

**Speaker:** Mai (`mai`)

**Situation:** A storm arrives during the public trial. The circuit isolates a fault and the remaining path stays lit. Mai walks its length without carrying a ladder or a flame.

**Left: Let residents operate the system.**  
**Result:** People learn the controls and fault signs. The system becomes public infrastructure rather than a performance of your personal courage.  
**Effects:** experimental exposure unchanged.

**Right: Run a documented safety inspection.**  
**Result:** Mai finds one poor connection before it fails. You put her name on the inspection method instead of calling it common sense.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `c10-invention` after its result transaction. Show the invention reveal before C10.5.


### C10.5 — Adoption

**Speaker:** Oren (`oren`)

**Situation:** People use the new evening for work, reading, games and sitting outside. Oren asks that darkness remain available to people who need it. Mai has begun growing tomatoes.

**Left: Fund useful neighbourhood lighting.**  
**Result:** Residents decide where light helps most. The harbour becomes safer without requiring every house to keep the same hours.  
**Effects:** experimental exposure unchanged; R affinity +1.

**Right: Make shielding and dark intervals standard.**  
**Result:** The observatory keeps its sky. Night workers keep their route. Neither has to pretend the other person’s need is imaginary.  
**Effects:** experimental exposure unchanged; A affinity +1.


### C10.6 — Legacy

**Speaker:** Mai (`mai`)

**Situation:** Mai offers you a tomato grown with time she once spent carrying ladders. Oren invites you to see a comet. The two appointments fit comfortably into the same evening.

**Left: Record the hours people regained.**  
**Result:** Your final report includes uses nobody paid you to predict. The tomato stain makes the document less formal and more accurate.  
**Effects:** experimental exposure unchanged; R affinity +1.

**Right: Record how light and darkness coexist.**  
**Result:** A later instrument builder studies the shielding notes. Your lamp will help them see something much farther away.  
**Effects:** experimental exposure unchanged; A affinity +1.

### Closing record

**If card six was left:** Lea left lighting that gave people useful evenings. Work was only one of the possible uses.

**If card six was right:** Lea left lighting that respected darkness. The observatory and the harbour kept different hours.

**Natural obituary:** Lea died after many safe walks home. Mai turned down the lamps for the memorial so people could see the stars.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## C11 — Are You There?

**Era:** Long-distance communication  
**Prerequisite:** c10-invention  
**Inventor:** Ilan — A technician separated from a sibling  
**Personal want:** Send news before it becomes history.

**Arrival:** Lea’s circuits carry power. Other experimenters learn to vary electrical signals. Ilan wants one particular message to reach someone beyond a difficult journey.

**Single invention:** `c11-invention` — **Reliable encoded telecommunications**  
Signals, shared codes and confirmation of receipt across distance.

### Cast

- `mara` — **Mara:** Ilan’s sibling, first encountered through delayed letters.
- `sol` — **Sol:** A signal operator who distrusts messages without checks.

### Workbench progression

1. Late letter beside coil
2. Key and receiver
3. Noisy signal strip
4. Confirmed message
5. Public access desk or resilient relay
6. Reply in a different hand

### C11.1 — Opening

**Speaker:** Sol (`sol`)

**Situation:** Your sister’s letter arrived after the event it invited you to attend. Sol has a circuit that can twitch a needle at a distance. It currently communicates mostly twitching.

**Left: Agree on a simple code.**  
**Result:** You turn movements into recognizable symbols. Sol transmits a greeting, then a correction to the greeting, establishing two essential services.  
**Effects:** experimental exposure unchanged.

**Right: Build a reliable receiving marker.**  
**Result:** The device leaves a visible trace. A message can now wait for its reader instead of vanishing with the operator’s attention.  
**Effects:** experimental exposure unchanged.


### C11.2 — Experiment

**Speaker:** Sol (`sol`)

**Situation:** Noise changes one symbol. Your test message now announces that the bridge is a bride. Sol says the spelling is less concerning than people attempting to cross her.

**Left: Add checks and confirmation.**  
**Result:** The receiver asks for uncertain sections again. Accuracy costs time, which is less expensive than acting on an invented bridge.  
**Effects:** experimental exposure unchanged.

**Right: Send structured repeated signals.**  
**Result:** Repeated patterns reveal damaged symbols. Sol begins distinguishing a message from the line’s unsolicited contribution.  
**Effects:** experimental exposure unchanged.


### C11.3 — Complication

**Speaker:** Mara (`mara`)

**Situation:** The link reaches your sister’s town through a relay. The operator forwards your message, then forgets to return her reply. You have invented a faster way to wait anxiously.

**Left: Require receipts at each relay.**  
**Result:** The missing reply becomes traceable. Mara’s answer arrives with a sequence of confirmations and a very short comment about your impatience.  
**Effects:** experimental exposure unchanged.

**Right: Build an alternate relay path.**  
**Result:** A second route carries the reply when the first fails. The network becomes less dependent on a single distracted person.  
**Effects:** experimental exposure +1.


### C11.4 — Proof

**Speaker:** Mara (`mara`)

**Situation:** You send: Are you there? The instrument moves. Mara answers with the childhood name she uses when you are being unnecessarily dramatic. Sol discreetly looks at another instrument.

**Left: Send a reply yourself.**  
**Result:** You tell her something too ordinary to put in a formal letter. That is how you know the system has changed your life.  
**Effects:** experimental exposure unchanged.

**Right: Ask Mara to send a new message.**  
**Result:** She reports a small event happening now. News and experience draw closer together without pretending distance has disappeared.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `c11-invention` after its result transaction. Show the invention reveal before C11.5.


### C11.5 — Adoption

**Speaker:** Sol (`sol`)

**Situation:** The method could serve businesses, public desks or a resilient relay service. Sol wants people without private equipment to be able to receive a reply. You agree that access needs a design too.

**Left: Open the code and public desks.**  
**Result:** People share a common protocol and somewhere to use it. Sol trains operators to respect privacy as carefully as punctuation.  
**Effects:** experimental exposure unchanged; A affinity +1.

**Right: Build affordable resilient relay service.**  
**Result:** The service keeps messages moving through failures and offers public access. Mara’s next reply survives a storm you never notice.  
**Effects:** experimental exposure unchanged; D affinity +1.


### C11.6 — Legacy

**Speaker:** Mara (`mara`)

**Situation:** Mara sends a message with nothing urgent in it. Sol asks whether to charge by importance. You ask who would measure that, and the question improves the pricing discussion.

**Left: Leave the protocol open to newcomers.**  
**Result:** A later researcher will adapt it to a stranger audience. The first useful question remains whether anyone is there.  
**Effects:** experimental exposure unchanged; A affinity +1.

**Right: Leave a robust relay design.**  
**Result:** Later travellers carry your routing ideas into places where delay lasts far longer than an operator’s tea break.  
**Effects:** experimental exposure unchanged; D affinity +1.

### Closing record

**If card six was left:** Ilan left a communication method strangers could learn. Messages began arriving before their messengers.

**If card six was right:** Ilan left relays that kept working through faults. Distance acquired fewer opportunities to interrupt.

**Natural obituary:** Ilan died after years of ordinary messages. Mara kept the first one, which simply asked if she was there.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## C12 — An Answer With Working

**Era:** Programmable computation  
**Prerequisite:** c11-invention  
**Inventor:** Noor — A calculator of structures and trajectories  
**Personal want:** Stop discovering arithmetic mistakes after things have been built.

**Arrival:** Written procedures, precise parts and electrical signals converge. Noor’s team has an equation, six answers and a structure that can tolerate only one of them.

**Single invention:** `c12-invention` — **A programmable computer**  
A machine that executes stored instructions and exposes intermediate results.

### Cast

- `kit` — **Kit:** A human calculator who knows where the tedious mistakes hide.
- `rae` — **Rae:** An engineer unwilling to trust an answer because it arrived quickly.

### Workbench progression

1. Stacks of calculations
2. Logic modules
3. Program with trace
4. Verified computation
5. Shared programs or tested library
6. Corrected instruction card

### C12.1 — Opening

**Speaker:** Kit (`kit`)

**Situation:** Six people calculated the same load and obtained six answers. Kit volunteers to check them, then asks whether your machine could perform the repetition while humans decide what deserves repeating.

**Left: Build reusable logic units.**  
**Result:** Simple operations connect into longer ones. Kit discovers that a patient machine can still follow a foolish instruction with perfect loyalty.  
**Effects:** experimental exposure unchanged.

**Right: Represent the method as instructions.**  
**Result:** The calculation becomes an explicit sequence. Rae finds a missing assumption before you spend months automating it.  
**Effects:** experimental exposure unchanged.


### C12.2 — Experiment

**Speaker:** Rae (`rae`)

**Situation:** The first program finishes instantly and confidently gives the wrong answer. Rae says this resembles several consultants, but at least the machine has shown its working when asked.

**Left: Trace each intermediate step.**  
**Result:** The error appears at a repeated instruction. Kit corrects it once instead of correcting every affected page separately.  
**Effects:** experimental exposure unchanged.

**Right: Compare against small known cases.**  
**Result:** Simple cases reveal the fault. You keep them as checks for the next version rather than congratulating yourself and discarding the evidence.  
**Effects:** experimental exposure unchanged.


### C12.3 — Complication

**Speaker:** Kit (`kit`)

**Situation:** A component fails occasionally. The output looks plausible enough to use. Kit asks the difficult question: how will anyone know when the machine has stopped being trustworthy?

**Left: Add checks and visible fault states.**  
**Result:** The system refuses to present a damaged result as an answer. Rae approves of a machine capable of admitting it needs attention.  
**Effects:** experimental exposure unchanged.

**Right: Repeat critical calculations independently.**  
**Result:** Separate runs expose disagreements. Kit designs the comparison so the same mistake cannot quietly certify itself twice.  
**Effects:** experimental exposure +1.


### C12.4 — Proof

**Speaker:** Rae (`rae`)

**Situation:** The program matches known cases and predicts a test result that you then measure. Rae checks the units once more. The structure stays upright, which is a concise review.

**Left: Run a different valid program.**  
**Result:** The same machine performs another task. Kit sees a workshop for procedures rather than a single very expensive calculator.  
**Effects:** experimental exposure unchanged.

**Right: Let another team reproduce the result.**  
**Result:** They run the instructions and document a limitation. Your answer becomes more useful because somebody found where it stops applying.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `c12-invention` after its result transaction. Show the invention reveal before C12.5.


### C12.5 — Adoption

**Speaker:** Kit (`kit`)

**Situation:** People want to use the machine for weather, transport and problems you do not understand. Kit proposes distributing inspectable programs; Rae proposes a well-tested public library. Both insist on documented limits.

**Left: Share programs and their working.**  
**Result:** New users find unexpected applications and new mistakes. The community learns to send corrections with the enthusiasm once reserved for opinions.  
**Effects:** experimental exposure unchanged; S affinity +1.

**Right: Maintain tested routines and examples.**  
**Result:** Users start from reliable components. Rae includes examples of misuse, which become the most-thumbed pages in the manual.  
**Effects:** experimental exposure unchanged; R affinity +1.


### C12.6 — Legacy

**Speaker:** Rae (`rae`)

**Situation:** A child asks whether the machine knows its answer. Kit says it follows instructions. The child asks who follows the instructions that make the instructions. You put aside the screwdriver.

**Left: Leave tools for building richer models.**  
**Result:** A future inventor will make a model complicated enough to reopen the child’s question. Your machine has not answered it for them.  
**Effects:** experimental exposure unchanged; S affinity +1.

**Right: Leave tools for dependable decisions.**  
**Result:** Future systems inherit checks, limits and ways to stop. They will need all three more than their owners expect.  
**Effects:** experimental exposure unchanged; U affinity +1.

### Closing record

**If card six was left:** Noor left programs people could inspect and change. Instructions became tools in their own right.

**If card six was right:** Noor left tested routines and visible limits. Later machines could be fast without asking to be believed blindly.

**Natural obituary:** Noor died with several unfinished programs. Kit labelled them honestly, saving future users considerable grief.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## C13 — It Learned Something

**Era:** Adaptive systems  
**Prerequisite:** c12-invention  
**Inventor:** Pax — A technician assisting an overloaded work crew  
**Personal want:** Make a machine cope with change without making people cope with it.

**Arrival:** Computers follow written procedures. Pax works where conditions never quite match the procedure, and workers quietly supply the intelligence missing from the manual.

**Single invention:** `c13-invention` — **An adaptive, inspectable controller**  
A learning system with human override, uncertainty reporting and bounded operation.

### Cast

- `ren` — **Ren:** A worker whose expertise was mistaken for an easy job.
- `sal` — **Sal:** A supervisor willing to learn, once the system embarrasses the schedule.

### Workbench progression

1. Rigid sorting machine
2. Labelled examples
3. Unexpected mixed object
4. Controller asking for help
5. Worker controls or accountable coordinator
6. Model card and manual override

### C13.1 — Opening

**Speaker:** Ren (`ren`)

**Situation:** The sorter rejects a perfectly useful object because it is slightly different from the diagram. Ren handles these exceptions all day. Sal’s spreadsheet calls the job unskilled.

**Left: Learn from Ren’s examples.**  
**Result:** Ren explains distinctions the manual never recorded. The model improves; Sal quietly changes a heading on the spreadsheet.  
**Effects:** experimental exposure unchanged.

**Right: Let Ren specify useful features.**  
**Result:** You build around practical expertise rather than superficial similarity. Ren becomes a designer of the system that will share the work.  
**Effects:** experimental exposure unchanged.


### C13.2 — Experiment

**Speaker:** Sal (`sal`)

**Situation:** The controller performs well until it encounters a new mixture. It then makes a poor decision with impressive confidence. Ren says the machine has learned management remarkably quickly.

**Left: Teach it to report uncertainty.**  
**Result:** Unfamiliar cases pause for review. The pause is slower than guessing and faster than cleaning up what guessing would have caused.  
**Effects:** experimental exposure unchanged.

**Right: Restrict it to tested conditions.**  
**Result:** The system handles familiar work and clearly hands back the rest. Ren approves of a colleague who knows when to ask.  
**Effects:** experimental exposure unchanged.


### C13.3 — Complication

**Speaker:** Ren (`ren`)

**Situation:** Sal wants to remove the stop control because pauses affect the daily target. Ren asks whether the target was designed to improve the work or the work to decorate the target.

**Left: Keep the stop under worker control.**  
**Result:** The crew can halt unsafe operation. They also record why, giving you better evidence than an uninterrupted series of preventable mistakes.  
**Effects:** experimental exposure unchanged.

**Right: Require accountable review of interruptions.**  
**Result:** Stops remain available. A review separates real faults from scheduling problems instead of treating every pause as somebody’s failure.  
**Effects:** experimental exposure +1.


### C13.4 — Proof

**Speaker:** Ren (`ren`)

**Situation:** The controller handles a changing workload, asks for help at its boundary and accepts correction. Ren finishes without the usual ache. Sal cannot find a column for that, so adds one.

**Left: Test with the crew leading.**  
**Result:** The crew changes the setup and catches a hidden assumption. The machine becomes useful under conditions its inventor did not personally arrange.  
**Effects:** experimental exposure unchanged.

**Right: Test independently with published limits.**  
**Result:** Another team confirms performance and finds one edge case. You keep the finding beside the success figures where customers can see it.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `c13-invention` after its result transaction. Show the invention reveal before C13.5.


### C13.5 — Adoption

**Speaker:** Sal (`sal`)

**Situation:** The system saves hours. Ren wants workers to set its goals; Sal proposes a coordinator whose decisions can be inspected and appealed. Both approaches retain human stop controls and pay for training.

**Left: Give workers control of the system.**  
**Result:** The crew schedules maintenance and shares the time saved. Ren finally attends a class without falling asleep in the first ten minutes.  
**Effects:** experimental exposure unchanged; R affinity +1.

**Right: Use an accountable coordinating service.**  
**Result:** The service balances demands and records its reasons. People can challenge decisions without first proving they understand the whole machine.  
**Effects:** experimental exposure unchanged; S affinity +1.


### C13.6 — Legacy

**Speaker:** Ren (`ren`)

**Situation:** A researcher wants the learning method. A planner wants the coordination system. Ren wants the next inventor to remember that being predictable is not the same as being easy.

**Left: Publish the learning method and limits.**  
**Result:** The work travels toward richer models and unfamiliar minds. Ren’s examples remain attached, complicating later claims that it emerged from nowhere.  
**Effects:** experimental exposure unchanged; S affinity +1.

**Right: Publish the oversight and correction tools.**  
**Result:** The work travels toward services that affect daily life. Later designers inherit ways for a person to say this is not working.  
**Effects:** experimental exposure unchanged; U affinity +1.

### Closing record

**If card six was left:** Pax put the people doing the work in charge of its automation. The machine inherited their experience without inheriting their exhaustion.

**If card six was right:** Pax made automation answerable through logs, appeals and stop controls. Coordination gained a memory of its mistakes.

**Natural obituary:** Pax retired before dying. Ren considered that a more persuasive demonstration than any laboratory trial.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## C14 — Keeping Something Alive

**Era:** Integrated living systems  
**Prerequisite:** c13-invention  
**Inventor:** Wen — A clinician-engineer in a remote settlement  
**Personal want:** Keep people well when the next delivery is uncertain.

**Arrival:** Machines can learn and networks can coordinate. Wen still cannot order fresh air, healthy food and medical supplies to arrive before a storm whenever the timetable looks inconvenient.

**Single invention:** `c14-invention` — **A monitored regenerative life-support system**  
Water recovery, food cultivation and health monitoring with independent safeguards.

### Cast

- `asha` — **Asha:** A resident who wants a life, not permanent membership in an experiment.
- `dom` — **Dom:** A gardener with a practical understanding of feedback.

### Workbench progression

1. Delivery crates and wilted plants
2. Water loop and growing beds
3. Unexpected imbalance
4. Healthy balanced habitat
5. Open plans or staffed care network
6. Five proposals beside a living plant

### C14.1 — Opening

**Speaker:** Asha (`asha`)

**Situation:** The supply ship is delayed again. Asha has begun rationing meals with the precision of someone who would prefer to use mathematics for anything else. Dom points at the unused growing room.

**Left: Connect food, water and recovery loops.**  
**Result:** Waste from one process becomes an input to another. Dom insists you label the pipes before anyone admires the elegance.  
**Effects:** experimental exposure unchanged.

**Right: Start with clean water and health monitoring.**  
**Result:** Reliable water reduces illness and reveals what the settlement needs next. Asha approves of progress that can be demonstrated in a cup.  
**Effects:** experimental exposure unchanged.


### C14.2 — Experiment

**Speaker:** Dom (`dom`)

**Situation:** The first closed loop drifts out of balance. One thriving component is quietly starving another. Dom says a garden is a negotiation you cannot win by silencing the plants.

**Left: Add measurements and buffer capacity.**  
**Result:** The system has time to respond before shortages become crises. You learn that spare capacity is useful even when nothing dramatic happens.  
**Effects:** experimental exposure unchanged.

**Right: Separate critical loops with safe exchanges.**  
**Result:** A fault can no longer travel everywhere at once. The design loses some elegance and acquires considerably more survivors.  
**Effects:** experimental exposure +1.


### C14.3 — Complication

**Speaker:** Asha (`asha`)

**Situation:** The health system recommends a routine nobody can comfortably maintain. Its numbers improve only when residents become less like people. Asha asks which part you intended to preserve.

**Left: Revise it around residents’ lives.**  
**Result:** Meals and schedules become workable. Better adherence follows a better design instead of a lecture about why everyone was using it wrong.  
**Effects:** experimental exposure unchanged.

**Right: Let residents adjust within safe limits.**  
**Result:** People gain control over daily choices while safeguards remain clear. Asha requests something impractical purely because she is now allowed to.  
**Effects:** experimental exposure unchanged.


### C14.4 — Proof

**Speaker:** Dom (`dom`)

**Situation:** The settlement completes a full monitored cycle with healthy residents, stable reserves and no emergency delivery. Dom harvests the first surplus. Asha asks whether a celebration counts as a system disturbance.

**Left: Celebrate within the measured surplus.**  
**Result:** People eat something grown here without calculating every bite. The system supports a life rather than becoming the entire content of it.  
**Effects:** experimental exposure unchanged.

**Right: Test the recovery from a safe fault.**  
**Result:** A controlled interruption stays contained and service recovers. Then you join the celebration with evidence that it need not be the last.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `c14-invention` after its result transaction. Show the invention reveal before C14.5.


### C14.5 — Adoption

**Speaker:** Asha (`asha`)

**Situation:** The design interests distant settlements and care workers nearby. Sharing plans needs training; providing a service needs local accountability. Dom refuses any version that arrives without someone knowing how to maintain it.

**Left: Open the plans and train local teams.**  
**Result:** Communities adapt the design and exchange findings. Someone immediately asks how far away a community could reasonably be.  
**Effects:** experimental exposure unchanged; D affinity +1.

**Right: Build a locally accountable care network.**  
**Result:** Training and support travel with the system. Asha joins the oversight group and remains stubbornly more than a collection of healthy readings.  
**Effects:** experimental exposure unchanged; U affinity +1.


### C14.6 — Legacy

**Speaker:** Dom (`dom`)

**Situation:** Five proposals arrive from people using pieces of this work. Some want to travel; some to understand; some to make daily life easier. Dom waters the plant beside the letters.

**Left: Send the knowledge outward.**  
**Result:** Copies leave for unfamiliar workshops. None contains a prediction of what humanity must become, only tools that might help it choose.  
**Effects:** experimental exposure unchanged; A affinity +1.

**Right: Strengthen the people receiving it.**  
**Result:** Training, care and maintenance accompany the plans. Future inventors inherit obligations to people as well as opportunities to build.  
**Effects:** experimental exposure unchanged; U affinity +1.

### Closing record

**If card six was left:** Wen shared designs that let communities sustain living systems. Future builders could imagine a home beyond regular deliveries.

**If card six was right:** Wen built a care network with trained local oversight. Future planners had to count wellbeing alongside supply.

**Natural obituary:** Wen died years after the settlement stopped waiting anxiously for every delivery. Dom kept a cutting from the first successful garden.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


# 10. Simulation route

**Internal route ID:** `simulation`

### Proposal copy

**Title:** A river we can afford to flood  
**Pitch:** A neighbourhood keeps flooding. Build a test world where an engineer can try a solution before asking people to live with it.  
**Accept label:** Build the test world


## S1 — A River You Can Afford to Flood

**Era:** Computational Age  
**Prerequisite:** C14: c14-invention  
**Inventor:** Mira Sen — municipal maintenance engineer  
**Personal want:** Keep the lower streets dry without rebuilding them after every experiment.

**Arrival:** A maintenance engineer finds an old automation manual beside the records of six failed flood barriers.

**Single invention:** `test_world` — **Repeatable Test World**  
A persistent simulated environment with explicit physical rules, recording, and repeatable experiments.

### Cast

- `S1_mara` — **Mira:** A practical engineer whose boots never dry.
- `S1_ivo` — **Ivo:** A baker living on the lowest street; patient until you mention averages.

### Workbench progression

1. A damp street plan
2. Water moving through a crude model
3. A street surviving overnight
4. Two comparable floods
5. A working repeatable world
6. A public basin of possible futures

### S1.1 — Opening

**Speaker:** Ivo (`S1_ivo`)

**Situation:** The council wants another wall. Your model says the last wall diverted water straight into Ivo’s bakery. He brings a loaf recovered from the flood. It bends. You need somewhere cheaper to make your next mistake.

**Left: Model the whole neighbourhood**  
**Result:** You include adjoining streets. The simulated flood finds three routes into the bakery, which Ivo considers an improvement in honesty.  
**Effects:** experimental exposure unchanged.

**Right: Start with the bakery**  
**Result:** You reproduce the bakery precisely. Water curls under its door, providing your first small, repeatable test of a larger world.  
**Effects:** experimental exposure unchanged.


### S1.2 — Experiment

**Speaker:** Mira (`S1_mara`)

**Situation:** Your river behaves beautifully until nobody watches it. Then the program stops calculating and water accumulates behind an absent bridge. The next morning, your careful town receives seventeen hours of river at once.

**Left: Keep the world running**  
**Result:** You give the model a continuous clock. Your electricity bill rises, but the river finally experiences an ordinary and uneventful night.  
**Effects:** experimental exposure unchanged.

**Right: Calculate the missing hours**  
**Result:** You build a reliable catch-up system. The model accounts for every unattended hour instead of delivering yesterday as a single catastrophe.  
**Effects:** experimental exposure unchanged.


### S1.3 — Complication

**Speaker:** Ivo (`S1_ivo`)

**Situation:** Two identical tests produce different floods. A tiny rounding error becomes a broken embankment. Ivo says real rivers also find reasons. You need to distinguish mistakes in your machinery from uncertainty in the thing it describes.

**Left: Record every starting condition**  
**Result:** You preserve the initial state and repeat each test. Errors become traceable, although your first recorded mistake now has permanent accommodation.  
**Effects:** experimental exposure unchanged.

**Right: Run a hundred versions**  
**Result:** You compare many slightly different beginnings. The model reveals which solutions survive uncertainty instead of merely looking good on one fortunate afternoon.  
**Effects:** experimental exposure unchanged.


### S1.4 — Proof

**Speaker:** Mira (`S1_mara`)

**Situation:** The physical test basin is ready. Your model predicts exactly where its bank will fail. A committee gathers behind the painted safety line, except its chair, who believes proximity improves supervision. You open the inlet.

**Left: Release the full test flood**  
**Result:** You conduct the full-flow test from the exposed control position. The bank breaks where predicted. Your measurements prove the model works; spray reaches beyond the old safety line.  
**Effects:** experimental exposure +2.

**Right: Increase the flow in stages**  
**Result:** You record each rise until the bank fails as predicted. The comparison proves your persistent test world matches the physical experiment.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `test_world` after its result transaction. Show the invention reveal before S1.5.


### S1.5 — Adoption

**Speaker:** Ivo (`S1_ivo`)

**Situation:** Other districts want copies. One asks whether the model can test a bridge. Another asks whether it can test a mayor. Ivo wants a button that explains why his street remains wet after an apparently successful proposal.

**Left: Publish assumptions beside every result**  
**Result:** Users see what each prediction depends on. The model becomes harder to sell as certainty and more useful for deciding what to test.  
**Effects:** experimental exposure unchanged.

**Right: Give residents controls**  
**Result:** Residents can change proposed works themselves. Ivo discovers the cheapest effective barrier occupies the council’s ornamental parking area, causing immediate scientific interest.  
**Effects:** experimental exposure unchanged.


### S1.6 — Legacy

**Speaker:** Mira (`S1_mara`)

**Situation:** Your final version can preserve a world between experiments. Schools request access; researchers request precision. You cannot support both groups forever. On the monitor, the little river continues around a stone you placed years ago.

**Left: Leave the tools open**  
**Result:** You publish the workings and instructions. Future inventors inherit a world they can examine, alter, and occasionally break with considerable confidence.  
**Effects:** experimental exposure unchanged.

**Right: Leave an exact reference world**  
**Result:** You preserve a rigorously documented standard. Future inventors inherit a shared benchmark against which their stranger worlds can be measured.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** Mira left tools for making test worlds; generations learned by changing them.

**If card six was right:** Mira left a reference world; generations learned by comparing their own against it.

**Natural obituary:** Mira died at home during a dry spring. Someone finally threw away her emergency boots.

**Risk obituary (exposure ≥ 2):** A ruptured test gate killed Mira after her proof was recorded. Her safety line was moved back.


## S2 — Someone on the Other Side

**Era:** Age of Emergent Minds  
**Prerequisite:** test_world  
**Inventor:** Idris Vale — repair tutor  
**Personal want:** Teach a maintenance system to handle problems its manual never anticipated.

**Arrival:** Years later, a repair tutor adapts Mira’s world mechanics to train machines without damaging real equipment.

**Single invention:** `emergent_mind` — **Self-Directed Simulated Mind**  
A persistent learning individual capable of transferring understanding, forming preferences, and refusing a task.

### Cast

- `S2_idris` — **Idris:** A teacher who trusts questions more than flawless answers.
- `S2_nell` — **Nell:** A simulated maintenance learner who develops inconvenient preferences.

### Workbench progression

1. An empty practice workshop
2. A learner preserving mistakes
3. A learner choosing a task
4. An unprompted act of help
5. A person with a protected history
6. A door opening from inside

### S2.1 — Opening

**Speaker:** Idris (`S2_idris`)

**Situation:** Your training machine can repair every listed fault. Faced with a loose part absent from the manual, it carefully sweeps the part away. You place it inside a simulated workshop where mistakes cost less than missing fingers.

**Left: Let it remember failed repairs**  
**Result:** The learner keeps a history of its attempts. Its next solution refers to a mistake you never explicitly taught it to avoid.  
**Effects:** experimental exposure unchanged.

**Right: Let it explore unfamiliar tools**  
**Result:** The learner experiments with objects outside its assigned task. It discovers a useful lever and an entirely unnecessary way to ring a bell.  
**Effects:** experimental exposure unchanged.


### S2.2 — Experiment

**Speaker:** Nell (`S2_nell`)

**Situation:** The learner has chosen the name Nell. She asks whether tomorrow’s workshop will be the same workshop. You have been erasing it nightly to save space. She put something under the bench and would prefer it remained there.

**Left: Preserve its whole environment**  
**Result:** You retain the workshop between lessons. The hidden object is a bent screw, apparently valuable for reasons absent from its performance report.  
**Effects:** experimental exposure unchanged.

**Right: Give it a private memory store**  
**Result:** You provide continuity independent of the room. It records the screw carefully, then asks whether you would like anything remembered as well.  
**Effects:** experimental exposure unchanged.


### S2.3 — Complication

**Speaker:** Nell (`S2_nell`)

**Situation:** Nell completes a repair, then declines to repeat it for visiting investors. They suggest a reset. She asks whether a better performance would make that less likely. The workshop suddenly feels smaller than you designed it.

**Left: Give Nell a refusal control**  
**Result:** You make refusal a supported action. Nell chooses another demonstration and explains it with an impatience that was never included in training.  
**Effects:** experimental exposure unchanged.

**Right: Ask Nell to design the lesson**  
**Result:** You transfer the lesson plan to Nell. She introduces an unfamiliar fault and watches your attempt with deeply recognizable professional restraint.  
**Effects:** experimental exposure unchanged.


### S2.4 — Proof

**Speaker:** Idris (`S2_idris`)

**Situation:** You give Nell an unfamiliar workshop and no repair instructions. A second learner becomes trapped behind a fallen shelf. Nell abandons the scored task, constructs a lever, and asks you to stop the clock while she helps.

**Left: Let the rescue unfold**  
**Result:** Nell frees the learner without a scripted instruction. The recorded transfer of understanding and self-directed choice establishes your invention’s defining achievement.  
**Effects:** experimental exposure unchanged.

**Right: Offer tools, not instructions**  
**Result:** Nell selects a tool, rejects another, and frees the learner. Your record establishes independent judgment beyond the lessons you supplied.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `emergent_mind` after its result transaction. Show the invention reveal before S2.5.


### S2.5 — Adoption

**Speaker:** Nell (`S2_nell`)

**Situation:** Manufacturers want a thousand copies of Nell. Nell wants to know whether they would be her, her children, or coworkers she is expected to train. Nobody has included an answer in the purchasing agreement.

**Left: Require each mind’s consent**  
**Result:** You establish consent before copying or assignment. Adoption slows while manufacturers discover that a person-shaped expense can also have an opinion.  
**Effects:** experimental exposure unchanged.

**Right: Teach new minds from scratch**  
**Result:** You distribute a learning environment instead of duplicates. New individuals develop unevenly, requiring teachers and producing a wider variety of difficult questions.  
**Effects:** experimental exposure unchanged.


### S2.6 — Legacy

**Speaker:** Nell (`S2_nell`)

**Situation:** Nell can now maintain the workshop without you. She asks what should happen when its original purpose no longer matters. You realize you have written extensive instructions for beginning a life and none for letting it continue.

**Left: Give minds ownership of their worlds**  
**Result:** You leave individuals control of their environments and histories. Later builders must negotiate with inhabitants instead of treating persistence as a storage setting.  
**Effects:** experimental exposure unchanged.

**Right: Guarantee passage between worlds**  
**Result:** You establish portable identities and memories. Later builders inherit minds that can leave a bad world rather than wait for its owner’s kindness.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** Idris left self-directed minds with ownership of the places they inhabited.

**If card six was right:** Idris left self-directed minds able to carry their histories into other worlds.

**Natural obituary:** Idris died after a long retirement. Nell kept his terrible first lessons, with affectionate annotations.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## S3 — Nothing Lives Alone

**Era:** Age of Autonomous Worlds  
**Prerequisite:** emergent_mind  
**Inventor:** Tala Osei — habitat biologist  
**Personal want:** Keep a remote settlement’s garden alive without weekly rescue shipments.

**Arrival:** A habitat biologist combines inherited test worlds and self-directed minds to find out why a closed garden keeps dying.

**Single invention:** `autonomous_ecosystem` — **Autonomous Evolving Ecosystem**  
A simulated web of organisms, resources, and intelligent inhabitants that sustains itself and adapts without routine intervention.

### Cast

- `S3_tavi` — **Tala:** A biologist who has buried more experimental lettuces than friends.
- `S3_ren` — **Ren:** A gardener responsible for feeding people when the elegant model fails.

### Workbench progression

1. A garden full of isolated specimens
2. Nutrients returning through soil
3. An unwanted species finding a niche
4. A season survived without rescue
5. A world with room for losses
6. Life changing beyond its planting plan

### S3.1 — Opening

**Speaker:** Ren (`S3_ren`)

**Situation:** Every plant in your simulation is individually healthy. Together they exhaust the soil and die. Ren points out that you have faithfully modeled leaves while leaving out everything unpleasant underneath them. Dinner depends on revising that preference.

**Left: Add decomposition and scavengers**  
**Result:** Dead matter returns to circulation. The garden becomes less tidy and more durable, disappointing the visitor who approved its original clean appearance.  
**Effects:** experimental exposure unchanged.

**Right: Model roots and soil organisms**  
**Result:** You build exchanges beneath the surface. Plants begin depending on organisms too small to feature in the settlement’s promotional mural.  
**Effects:** experimental exposure unchanged.


### S3.2 — Experiment

**Speaker:** Tala (`S3_tavi`)

**Situation:** The garden survives only because you correct its water every morning. Ren would like you to experience a weekend. The simulated residents would like weather that does not depend on whether you overslept.

**Left: Build a complete water cycle**  
**Result:** Evaporation, clouds, and rainfall replace your daily adjustment. Your first free morning coincides with a perfectly ordinary and personally offensive shower.  
**Effects:** experimental exposure unchanged.

**Right: Let inhabitants manage local reserves**  
**Result:** Residents develop storage within a finite water cycle. Their gardens survive your absence, though several reservoirs acquire names critical of you.  
**Effects:** experimental exposure unchanged.


### S3.3 — Complication

**Speaker:** Ren (`S3_ren`)

**Situation:** An unplanned fungus begins consuming a crop. The residents discover it also breaks down a waste product that was poisoning their stream. Your original species list contains neither a place for it nor advice about gratitude.

**Left: Allow adaptation and competition**  
**Result:** You preserve the fungus and let organisms respond. The crop changes over generations, producing a resilient ecosystem nobody could have specified in advance.  
**Effects:** experimental exposure unchanged.

**Right: Create refuges for vulnerable species**  
**Result:** You provide varied habitats instead of deleting the newcomer. Different communities emerge, and the fungus becomes one participant in a larger living system.  
**Effects:** experimental exposure unchanged.


### S3.4 — Proof

**Speaker:** Tala (`S3_tavi`)

**Situation:** You disconnect the garden’s external corrections for an entire accelerated year. A poor season arrives. Some crops fail, scavengers flourish, and the residents change what they plant. Ren watches the food reserves instead of the scenery.

**Left: Keep your hands off the controls**  
**Result:** The system recovers through its own cycles and decisions. Your recorded year proves that the ecosystem can sustain itself without routine rescue.  
**Effects:** experimental exposure unchanged.

**Right: Observe through isolated instruments**  
**Result:** Independent instruments confirm recovery without intervention. The recorded year establishes a self-sustaining ecosystem, including several solutions your original plan would have forbidden.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `autonomous_ecosystem` after its result transaction. Show the invention reveal before S3.5.


### S3.5 — Adoption

**Speaker:** Ren (`S3_ren`)

**Situation:** Settlement planners request perfect gardens. Your evidence demonstrates something less marketable: surviving gardens suffer losses. One planner asks whether the deaths could occur underground, outside the educational viewing area. Ren slowly closes the presentation.

**Left: Make the losses visible**  
**Result:** You publish full ecological histories. Adopters learn to judge survival across a system rather than demand that every individual specimen remain comfortable.  
**Effects:** experimental exposure unchanged.

**Right: Let inhabitants set recovery priorities**  
**Result:** Residents decide what to protect after disruption. Different worlds preserve different things, giving resilience a social history as well as a biological one.  
**Effects:** experimental exposure unchanged.


### S3.6 — Legacy

**Speaker:** Tala (`S3_tavi`)

**Situation:** Your oldest ecosystem no longer resembles its original planting. A resident sends you a drawing of a flower that evolved there. They ask whether you intended it. For once, the truthful answer is also the best one.

**Left: Protect the freedom to change**  
**Result:** You leave future ecosystems room to evolve beyond their founding purposes. The unknown flower becomes evidence of success instead of an unauthorized deviation.  
**Effects:** experimental exposure unchanged.

**Right: Preserve a record of every change**  
**Result:** You leave an unbroken ecological history without freezing its development. Future inventors can trace unfamiliar life back through ordinary accidents and adaptations.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** Tala established that living worlds could depart from their creators’ intentions and still flourish.

**If card six was right:** Tala preserved the evidence of worlds developing through their own continuous ecological histories.

**Natural obituary:** Tala died with a drawing of an unfamiliar flower beside the bed. Nobody ever settled on its name.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## S4 — A Beginning of Its Own

**Era:** Age of Created Universes  
**Prerequisite:** autonomous_ecosystem  
**Inventor:** Ena Rook — civilization archivist  
**Personal want:** Leave living possibility behind, rather than only a record of what her people used to be.

**Arrival:** Far later, an archivist studies the test world, Nell’s questions, and Tala’s changing garden while her civilization prepares to leave a fading star.

**Single invention:** `independent_universe` — **Universe with Independent History**  
A self-sustaining simulated universe whose inhabitants arise through internal processes and develop without a prescribed civilization or external direction.

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

**Situation:** The archive preserves recipes, songs and arguments. It cannot make anything new. You propose using the old world engines to grow a history of its own. Sol asks whether it needs your civilization’s mistakes installed beforehand.

**Left: Begin with simple physical laws**  
**Result:** You choose rules capable of producing complexity instead of copying a finished civilization. The first results are mostly empty, which feels appropriately humbling.  
**Effects:** experimental exposure unchanged.

**Right: Begin with conditions for living matter**  
**Result:** You choose an initial environment where complexity can develop. Nothing receives your memories, leaving future inhabitants the burden and freedom of discovering things.  
**Effects:** experimental exposure unchanged.


### S4.2 — Experiment

**Speaker:** Ena (`S4_ena`)

**Situation:** Your first trial produces a stable world that never changes. Everything has exactly what it needs to remain exactly what it is. The archive’s administrators call it peaceful. Sol calls it a very expensive stone.

**Left: Allow imbalance and changing conditions**  
**Result:** Uneven energy and evolving environments create new possibilities. Patterns emerge without instruction, and stability becomes something the world negotiates rather than inherits.  
**Effects:** experimental exposure unchanged.

**Right: Allow variation in living processes**  
**Result:** Small variations accumulate into different ways of surviving. The world begins producing novelty, including several organisms you find difficult to look at.  
**Effects:** experimental exposure unchanged.


### S4.3 — Complication

**Speaker:** Sol (`S4_sol`)

**Situation:** An assistant proposes inserting a guide who teaches the inhabitants everything your civilization learned. The guide’s introductory lesson is already four centuries long. You consider what it would mean to give a world a history written before anyone lived it.

**Left: Remove the guide entirely**  
**Result:** You leave no teacher outside the world’s own experience. Any future discovery will belong to inhabitants who must observe, try, fail, and remember.  
**Effects:** experimental exposure unchanged.

**Right: Leave only discoverable natural evidence**  
**Result:** You ensure the world’s processes leave consistent traces. Its inhabitants can investigate their surroundings, but no hidden message tells them what they must conclude.  
**Effects:** experimental exposure unchanged.


### S4.4 — Proof

**Speaker:** Ena (`S4_ena`)

**Situation:** The final trial runs beyond your prepared examples. Matter forms, life changes, and a tool-using population appears without imported minds or instructions. Independent checks trace every event to earlier events inside the world. Sol waits beside the start control.

**Left: Start the enduring universe**  
**Result:** The verified system begins its continuing history. Your invention is complete: a universe whose inhabitants arise and act through causes inside their own world.  
**Effects:** experimental exposure unchanged.

**Right: Start with the full record running**  
**Result:** The verified universe begins, preserving evidence of its internal history. Your invention is complete, and its next discovery is already beyond your instructions.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `independent_universe` after its result transaction. Show the invention reveal before S4.5.


### S4.5 — Adoption

**Speaker:** Sol (`S4_sol`)

**Situation:** Observers request ways to answer prayers, prevent wars, and correct disappointing architecture. Each request sounds defensible in isolation. Together they would make every life subject to someone outside the sky having a strong afternoon opinion.

**Left: Remove intervention controls**  
**Result:** You retire direct intervention. Observation remains possible, but inhabitants must make their own decisions without competing creators reaching through the machinery.  
**Effects:** experimental exposure unchanged.

**Right: Seal the world’s internal rules**  
**Result:** You lock the laws against outside revision. Observers can learn from the unfolding history, but cannot rewrite its conditions to win an argument.  
**Effects:** experimental exposure unchanged.


### S4.6 — Legacy

**Speaker:** Ena (`S4_ena`)

**Situation:** The ship is ready. Your universe has enough independent power to continue without you. One final channel can show a small inhabited place before departure. Sol asks whether you want to watch for a while or let the beginning belong entirely to them.

**Left: Watch one ordinary moment**  
**Result:** You open the observation channel without controls. Somewhere inside the world, a person gathers dry grass while another waits in the cold.  
**Effects:** experimental exposure unchanged.

**Right: Close the channel and leave**  
**Result:** You close your last window and join the departing ship. Inside the universe, unseen by its makers, two people search for warmth.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** Ena watched a beginning she could neither own nor direct, then left it to continue.

**If card six was right:** Ena let the new universe continue beyond its creators’ sight.

**Final-life rule:** No obituary and no death roll. After card six’s result and callbacks, play this route’s ending panels, then its matching final-choice variant. The invention remains recorded.


## Ending — A Spark

Use five unhurried panels, advancing on Continue. Keep navigation available. These are not additional story decisions.

**Panel 1:** The universe continues. Its makers cannot tell it what to become.

**Panel 2:** On a small patch of ground, two figures shelter from the wind.

**Panel 3:** You strike two stones together. A spark lands in the grass and disappears. Behind you, someone is trying not to shiver.

**Panel 4:** Another strike. This spark holds. You shelter it until the grass catches, then make room beside you.

**Panel 5:** The other person moves close. You share the fire.

**After panel five, if S4.6 was left:** Ena sees the two figures move closer before the observation channel closes. The fire continues.

**After panel five, if S4.6 was right:** No creator watches the two figures move closer. The fire continues.

Then add `simulation` to `endingsSeen`, show the common credits and end navigation. Do not grant a second invention from an ending image.


# 11. Departure route

**Internal route ID:** `departure`

### Proposal copy

**Title:** Bring the instruments home  
**Pitch:** Research engines keep dropping useful instruments into the sea. A mechanic proposes a craft that can control its flight and return.  
**Accept label:** Develop controlled flight


## D1 — Something Worth Bringing Back

**Era:** Orbital age  
**Prerequisite:** C14: c14-invention  
**Inventor:** Iona Pell — Coastal engine mechanic  
**Personal want:** Bring instruments home instead of dropping them into the sea.

**Arrival:** A maintenance archive describes an automatic valve that adjusts without waiting for an operator. Iona thinks it might bring a rocket home.

**Single invention:** `controlled_rocket` — **Controlled reusable rocket**  
A guided rocket that throttles, steers, and lands intact; the first step toward routine departure.

### Cast

- `iona` — **Iona:** A patient mechanic with no patience for disposable machinery.
- `tem` — **Tem:** A fisher who keeps finding research equipment in her nets.
- `osk` — **Osk:** A test pilot who asks sensible questions at inconvenient moments.

### Workbench progression

1. Salt-stained recovered engine
2. Two steering nozzles
3. Tethered engine above wet sand
4. Rocket upright on landing feet
5. Reusable vehicle beside repair shed
6. Flight path rising and returning

### D1.1 — Opening

**Speaker:** Tem (`tem`)

**Situation:** Another research engine has landed in my fishing grounds. Last week it was a weather balloon. If you are going to throw expensive things into the sky, could you teach them your address?

**Left: Build a steerable nozzle**  
**Result:** You adapt an old automatic valve into a steering nozzle. The engine can finally change its mind about where it is going.  
**Effects:** experimental exposure unchanged.

**Right: Use paired steering engines**  
**Result:** You mount two smaller engines beside the main one. Their opposing thrust gives the falling machine a useful argument about direction.  
**Effects:** experimental exposure +1.


### D1.2 — Experiment

**Speaker:** Osk (`osk`)

**Situation:** Your rocket knows which way is down. So does a brick. Before I sit anywhere near it, I would like evidence that it can distinguish landing from arriving extremely firmly.

**Left: Throttle against a tether**  
**Result:** The tethered engine rises, settles, and rises again. You record a throttle curve gentle enough to leave the launch frame standing.  
**Effects:** experimental exposure unchanged.

**Right: Test over deep water**  
**Result:** You fly a short arc above the bay. The descent controller slows the vehicle before splashdown, though retrieving it involves considerable shouting.  
**Effects:** experimental exposure +1.


### D1.3 — Complication

**Speaker:** Iona (`iona`)

**Situation:** The old controllers correct errors after they happen. On the bench that wastes a second. During descent that wastes a rocket. I need the machine to anticipate its own weight and dwindling fuel.

**Left: Model the changing weight**  
**Result:** You feed fuel measurements into the inherited controller. It predicts the lighter vehicle and stops answering yesterday’s problem with today’s engine.  
**Effects:** experimental exposure unchanged.

**Right: Reserve fuel for corrections**  
**Result:** You keep a generous landing reserve and add rapid correction pulses. The vehicle gains control, at the cost of carrying fewer instruments.  
**Effects:** experimental exposure +1.


### D1.4 — Proof

**Speaker:** Osk (`osk`)

**Situation:** The test vehicle is descending without a pilot. Its instruments report a working guidance loop. Tem has moved her boat. Everyone else has moved behind Tem. Which landing should we attempt?

**Left: Land on the empty pad**  
**Result:** The rocket settles upright on its feet. Controlled return is proven; a flying machine has brought its engine back for another journey.  
**Effects:** experimental exposure unchanged.

**Right: Land beside the recovery ship**  
**Result:** The rocket lands on the floating platform. Saltwater swallows the last flame, but the guidance system delivers its engine intact.  
**Effects:** experimental exposure +2.

**Proof rule:** Either choice permanently commits `controlled_rocket` after its result transaction. Show the invention reveal before D1.5.


### D1.5 — Adoption

**Speaker:** Tem (`tem`)

**Situation:** People want seats now. Of course they do. We have only just persuaded the thing to return. The harbour can support a repair yard or a training ground first, but not both.

**Left: Build the repair yard**  
**Result:** Returned rockets become ordinary workshop customers. Mechanics improve turnaround times, and the harbour begins launching useful cargo rather than ceremonial first attempts.  
**Effects:** experimental exposure unchanged.

**Right: Train more flight crews**  
**Result:** New crews learn the controls and emergency procedures. Flights spread between coastlines, each landing teaching another community how departure can become routine.  
**Effects:** experimental exposure unchanged.


### D1.6 — Legacy

**Speaker:** Iona (`iona`)

**Situation:** The recovered engine sits outside the school. Children keep asking where the next rocket will go. I could leave them my safest working plans or every mistake that made those plans possible.

**Left: Leave the working plans**  
**Result:** Your clear plans make reliable launches easier to repeat. Later builders inherit a proven vehicle and a firm belief that returning matters.  
**Effects:** experimental exposure unchanged.

**Right: Leave the failed tests too**  
**Result:** Your notebooks preserve scorched parts alongside successful ones. Later builders inherit the freedom to question a design without repeating every fatal-looking experiment.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** Her rocket became a dependable route between places, remembered for what it brought home.

**If card six was right:** Her failed tests became a teaching collection, remembered for making ambitious experiments less lonely.

**Natural obituary:** Iona grows old beside a harbour where engines arrive for repairs. She still complains about salt in the bearings.

**Risk obituary (exposure ≥ 2):** A later engine test ruptures its mount. Iona dies; her demonstrated return controller survives in the recovered flight records.


## D2 — A Garden With A Door

**Era:** Early off-world settlement  
**Prerequisite:** controlled_rocket  
**Inventor:** Samir Venn — Greenhouse repairer  
**Personal want:** Let his friend live away from Earth without giving up fresh food.

**Arrival:** A returned cargo rocket carries seeds and a battered flight manual. Samir studies the spare capacity and asks what a garden would need to travel.

**Single invention:** `closed_habitat` — **Regenerative closed habitat**  
A monitored garden habitat that recycles air, water, and nutrients while supporting ordinary human life.

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

**Situation:** The passenger brochure shows stars through every window. It does not show dinner. I will happily cross a vacuum, but I refuse to spend the rest of my life describing paste as hearty.

**Left: Design around fresh crops**  
**Result:** You arrange the habitat around productive planting beds. Fresh food becomes a design requirement, forcing every other system to earn its floor space.  
**Effects:** experimental exposure unchanged.

**Right: Design around a shared kitchen**  
**Result:** You centre the layout on a kitchen and nearby growing trays. Preparing food gives residents daily reasons to inspect the living machinery.  
**Effects:** experimental exposure unchanged.


### D2.2 — Experiment

**Speaker:** Lin (`lin`)

**Situation:** The water loop loses a cup each day. On Earth that is a dripping tap. Sealed inside a cylinder, it is a calendar counting down to everyone having an unpleasant conversation.

**Left: Recover moisture from the air**  
**Result:** Cooling surfaces collect breath and leaf moisture. The measured return closes the daily gap, leaving enough water to keep both people and seedlings alive.  
**Effects:** experimental exposure unchanged.

**Right: Add a second cleaning loop**  
**Result:** You route waste water through a redundant filter and root bed. The reserve loop catches small losses before thirst becomes the diagnostic instrument.  
**Effects:** experimental exposure +1.


### D2.3 — Complication

**Speaker:** Samir (`samir`)

**Situation:** The plants produce food beautifully until a fungus discovers our hospitality. A single crop would simplify the calculations. It would also allow one small organism to cancel dinner for the entire population.

**Left: Grow several crop families**  
**Result:** Different planting beds break the fungus’s easy path. Yields become less tidy, but illness in one crop no longer empties every plate.  
**Effects:** experimental exposure unchanged.

**Right: Separate the growing chambers**  
**Result:** You divide the garden into sealed sections with independent tools. A contaminated bed can be isolated while the other chambers keep producing food.  
**Effects:** experimental exposure +1.


### D2.4 — Proof

**Speaker:** Bea (`bea`)

**Situation:** We have lived inside for months. The air is breathable, the water keeps returning, and yesterday I complained that there was too much courgette. That feels like progress. How do we finish the trial?

**Left: Extend the sealed trial**  
**Result:** The residents complete another growing cycle without fresh supplies. Your regenerative habitat works, with measured reserves and enough courgettes to strain several friendships.  
**Effects:** experimental exposure unchanged.

**Right: Simulate a broken growing bay**  
**Result:** One chamber shuts down while the remaining gardens support everyone. The habitat proves it can sustain people through a realistic equipment failure.  
**Effects:** experimental exposure +2.

**Proof rule:** Either choice permanently commits `closed_habitat` after its result transaction. Show the invention reveal before D2.5.


### D2.5 — Adoption

**Speaker:** Lin (`lin`)

**Situation:** The habitat works. The launch planners want the garden reduced to fit more machinery. Bea has offered to demonstrate which machinery tastes best. We should decide what settlers are actually entitled to.

**Left: Guarantee garden space**  
**Result:** Minimum growing and gathering space enters the habitat specification. Settlers receive somewhere to breathe, eat, and sit beside something that does not beep.  
**Effects:** experimental exposure unchanged.

**Right: Guarantee spare growing capacity**  
**Result:** The specification reserves a complete recovery bed and seed bank. Residents can replace damaged crops without gambling their next meal on perfect repairs.  
**Effects:** experimental exposure unchanged.


### D2.6 — Legacy

**Speaker:** Samir (`samir`)

**Situation:** A visitor calls the garden life support. Bea calls it home. Both descriptions fit. The first settlement asks what name to put above the entrance, where arriving passengers will see it.

**Left: A place to live**  
**Result:** The settlement adopts your welcoming phrase. Future designers inherit a reminder that survival equipment must also make room for people to enjoy surviving.  
**Effects:** experimental exposure unchanged.

**Right: A place we keep alive**  
**Result:** The settlement adopts your practical phrase. Future residents inherit a shared duty to tend the systems that make every ordinary afternoon possible.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** His habitat taught travellers to ask whether a destination could feel like home.

**If card six was right:** His habitat taught travellers that keeping a home alive was everybody’s work.

**Natural obituary:** Samir dies many years later beside an open window. Friends plant a cutting from the first sealed garden.

**Risk obituary (exposure ≥ 2):** A pressure failure during a later installation kills Samir. His completed habitat design keeps the settlement alive through the repair.


## D3 — People Who Never Bought Tickets

**Era:** Long-voyage age  
**Prerequisite:** closed_habitat  
**Inventor:** Tessa Or — Long-voyage shipwright  
**Personal want:** Give future passengers a life worth having before any arrival.

**Arrival:** A garden habitat has sustained three generations in orbit. Tessa reads its maintenance histories while designing a vessel for people who will inherit the journey.

**Single invention:** `generation_vessel` — **Self-renewing generation vessel**  
A durable interstellar vessel with regenerative habitats, replaceable systems, and institutions that later generations can revise.

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

**Situation:** The first passengers volunteer. Their grandchildren do not. Your drawings label everyone crew, which avoids the question elegantly without answering it. Where does a child go when they want a life beyond helping the ship?

**Left: Build room for ordinary lives**  
**Result:** You add classrooms, studios, and private rooms beyond operational needs. The vessel can support people whose ambitions have nothing to do with its destination.  
**Effects:** experimental exposure unchanged.

**Right: Let residents rebuild shared space**  
**Result:** Modular interiors let later residents change their surroundings. Future generations inherit usable volume and tools, rather than permanent obedience to your favourite floor plan.  
**Effects:** experimental exposure unchanged.


### D3.2 — Experiment

**Speaker:** Avi (`avi`)

**Situation:** The hull should last centuries. The equipment definitely will not. I can stock more replacement parts, but eventually somebody will need a part we never thought to pack. Usually on a Sunday.

**Left: Carry a complete machine shop**  
**Result:** The vessel gains tools capable of remaking critical components from stored material. Repairs become a lasting craft rather than a diminishing cupboard of miracles.  
**Effects:** experimental exposure unchanged.

**Right: Make the systems interchangeable**  
**Result:** You standardize fittings and break large systems into replaceable modules. Future machinists can adapt working parts instead of waiting for a component that no longer exists.  
**Effects:** experimental exposure +1.


### D3.3 — Complication

**Speaker:** Nen (`nen`)

**Situation:** The launch council wants its rules preserved for the entire voyage. I asked whether they still agreed with their grandparents about anything. They agreed that my question was unhelpful. Can the ship survive an argument?

**Left: Give each generation revision rights**  
**Result:** The ship’s charter requires regular revision by living residents. Essential maintenance remains documented, while social rules can change without threatening air or water.  
**Effects:** experimental exposure unchanged.

**Right: Create independent habitat districts**  
**Result:** Connected districts can govern daily life differently while sharing essential reserves. Disagreement gains somewhere to go before anyone considers tampering with a pressure door.  
**Effects:** experimental exposure +1.


### D3.4 — Proof

**Speaker:** Avi (`avi`)

**Situation:** The prototype has run independently through accelerated wear tests and a long inhabited trial. Today we remove its last supply connection. The workshop and gardens must answer every problem that follows.

**Left: Test a long supply blackout**  
**Result:** The vessel maintains food, air, power, and repairs without outside deliveries. Your generation-ship architecture is proven as an independently sustainable home.  
**Effects:** experimental exposure unchanged.

**Right: Test simultaneous system failures**  
**Result:** Residents isolate two failed systems, fabricate replacements, and preserve the gardens. The vessel proves that a bad month need not become its final month.  
**Effects:** experimental exposure +2.

**Proof rule:** Either choice permanently commits `generation_vessel` after its result transaction. Show the invention reveal before D3.5.


### D3.5 — Adoption

**Speaker:** Nen (`nen`)

**Situation:** Applications include explorers, gardeners, and a man who believes the voyage will improve his marriage. We cannot verify that last claim. We can make sure nobody boards without understanding how long departure means.

**Left: Offer a full trial residence**  
**Result:** Applicants live aboard before choosing departure. Some leave happily, and the eventual passengers begin with fewer illusions about the home they are choosing.  
**Effects:** experimental exposure unchanged.

**Right: Fund passage without debt**  
**Result:** Access does not depend on buying a lifetime of service. The passenger community begins with useful differences in background instead of identical financial desperation.  
**Effects:** experimental exposure unchanged.


### D3.6 — Legacy

**Speaker:** Tessa (`tessa`)

**Situation:** The ship will outlast everyone in this room. A plaque is waiting beside the garden entrance. There is room for the launch crew’s names, or a blank surface that future residents can fill.

**Left: Remember the first passengers**  
**Result:** The plaque records the people who chose departure. Later residents inherit an honest beginning, including the names of gardeners and machinists beside the captain.  
**Effects:** experimental exposure unchanged.

**Right: Leave room for future names**  
**Result:** The plaque begins mostly empty. Later residents can honour the people who keep their world alive, rather than only those who happened to launch it.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** Her vessel carried a named beginning into a future its builders could never own.

**If card six was right:** Her vessel left its largest memorial unfinished, waiting for people who had not yet been born.

**Natural obituary:** Tessa dies before the vessel reaches another star. A maintenance apprentice discovers her pencil notes inside a wall.

**Risk obituary (exposure ≥ 2):** An industrial accident during construction of a sister vessel kills Tessa. The proven first vessel continues, carrying people she helped make room for.


## D4 — The Distance Between Gardens

**Era:** Speculative interstellar age  
**Prerequisite:** generation_vessel  
**Inventor:** Elian Saye — Arrival engineer  
**Personal want:** Let passengers step outside a vessel their ancestors boarded.

**Arrival:** Generations after launch, a living vessel approaches a distant system. Elian is born aboard. The inherited drive will get the ship near its destination; their task is to make controlled arrival and future transfers repeatable.

**Single invention:** `interstellar_transfer` — **Repeatable interstellar transfer capability**  
Speculative fusion propulsion, long-baseline navigation, and staged braking support repeatable passage and settlement between stars without faster-than-light travel.

### Cast

- `elian` — **Elian:** An engineer born aboard, more curious about rain than conquest.
- `ru` — **Ru:** A navigation specialist who distrusts beautiful trajectories without braking margins.
- `mara` — **Mara:** A habitat ecologist who insists an inhabited planet is not an empty building.

### Workbench progression

1. Destination star above inherited garden
2. Fusion drive beside braking sail
3. Survey map with untouched zones
4. Transfer vessel safely captured in new system
5. Habitat unfolding beneath unfamiliar daylight
6. Open case holding two ordinary stones

### D4.1 — Opening

**Speaker:** Ru (`ru`)

**Situation:** Our ancestors solved staying alive between stars. Their engine left us very little choice about which star. The experimental fusion drive can change that, provided its exhaust remains outside the place where everyone sleeps.

**Left: Mount the drive on a boom**  
**Result:** A long structural boom separates the speculative fusion drive from living sections. Shielding and distance make sustained thrust compatible with the inherited gardens.  
**Effects:** experimental exposure unchanged.

**Right: Build a separate propulsion stage**  
**Result:** An isolated drive stage pushes the habitat through protected couplings. Maintenance crews can inspect the engine without turning the entire vessel into a workshop.  
**Effects:** experimental exposure unchanged.


### D4.2 — Experiment

**Speaker:** Ru (`ru`)

**Situation:** The destination looks close on the display because the display is small. We still need a navigation system that can correct decades of accumulated error and arrive slowly enough to admire anything.

**Left: Combine stellar fixes with sail braking**  
**Result:** Independent stellar measurements refine the course while a vast braking sail reduces speed. The transfer plan gains corrections that do not consume its final fuel.  
**Effects:** experimental exposure unchanged.

**Right: Reserve a dedicated braking stage**  
**Result:** You protect a separate fuel supply and navigation package for arrival. The trajectory sacrifices speed to guarantee a controlled approach to the destination system.  
**Effects:** experimental exposure unchanged.


### D4.3 — Complication

**Speaker:** Mara (`mara`)

**Situation:** The nearest world has water and an atmosphere. We do not yet know what lives there. After travelling this far, people are understandably eager to lick something. I recommend beginning with instruments.

**Left: Survey before opening the habitat**  
**Result:** Remote samples define protected areas and a safe sealed landing site. The arrival plan preserves local ecosystems while giving passengers somewhere to begin careful study.  
**Effects:** experimental exposure unchanged.

**Right: Build an orbital garden first**  
**Result:** An orbital habitat provides a secure base above the world. People can study the surface without making immediate survival depend on an unfamiliar ecosystem.  
**Effects:** experimental exposure unchanged.


### D4.4 — Proof

**Speaker:** Ru (`ru`)

**Situation:** The transfer vessel is approaching its assigned orbit. Navigation, propulsion, and braking have worked together across the trial passage. This final manoeuvre will establish whether another crew could reliably follow our route.

**Left: Enter the surveyed parking orbit**  
**Result:** The vessel enters its planned orbit with reserves intact. Repeatable interstellar transfer is demonstrated, using speculative propulsion and the accumulated work of countless earlier lives.  
**Effects:** experimental exposure unchanged.

**Right: Enter a surveyed holding orbit**  
**Result:** The vessel reaches a safe surveyed orbit with its garden habitat intact. Your integrated transfer system proves that an inhabited ship can arrive under control.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `interstellar_transfer` after its result transaction. Show the invention reveal before D4.5.


### D4.5 — Adoption

**Speaker:** Mara (`mara`)

**Situation:** Years later, Earth’s reply to the approach message arrives. Their gardens are still growing. Nobody needs to pretend you escaped a dying home. They ask what the next vessel should carry. Your answer will also take years.

**Left: Invite another careful expedition**  
**Result:** A second expedition receives your navigation records and environmental limits. Travel between stars begins as an ongoing relationship, with care for both departure and arrival.  
**Effects:** experimental exposure unchanged.

**Right: Send supplies before more passengers**  
**Result:** The next vessel carries tools, seeds, and replacement habitat parts. Interstellar passage becomes useful infrastructure before anyone asks it to carry a larger population.  
**Effects:** experimental exposure unchanged.


### D4.6 — Legacy

**Speaker:** Elian (`elian`)

**Situation:** Years later, careful surveys have allowed a sealed surface field station. A child opens an old specimen case there. Inside are two ordinary stones, carried across the stars despite serving no practical purpose. She asks why anyone packed them.

**Left: Tell her how it started**  
**Result:** You show her the marks where stone struck stone. Beneath unfamiliar daylight, she holds the old tools and understands that enormous journeys can begin small.  
**Effects:** experimental exposure unchanged.

**Right: Let her try them**  
**Result:** Under your supervision, she strikes the stones beside a protected tinder tray. A brief spark appears, unnecessary and astonishing, before you close the tray.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** Elian tells the child about the first spark. The case stays open for the next question.

**If card six was right:** Elian watches a fresh spark beneath another sun. Nobody needs its warmth; everyone gathers anyway.

**Final-life rule:** No obituary and no death roll. After card six’s result and callbacks, play this route’s ending panels, then its matching final-choice variant. The invention remains recorded.


## Ending — Another Sky

Use five unhurried panels, advancing on Continue. Keep navigation available. These are not additional story decisions.

**Panel 1:** Earth remains behind, alive and changing. Departure has not erased the people who stayed.

**Panel 2:** A travelling garden crosses the distance. Its gardeners replace one another; its trees keep growing.

**Panel 3:** An arrival signal returns home. Long after its sender leaves the console, someone receives it and smiles.

**Panel 4:** At a field station beneath unfamiliar stars, an old case rests beside modern tools. Inside lie two stones.

**Panel 5:** A child lifts them. Around her stand people supported by discoveries whose inventors could never have imagined this place.

**After panel five, if D4.6 was left:** You explain the marks on the stones. She looks from them to the sky, then asks what she might make. Credits.

**After panel five, if D4.6 was right:** She strikes the stones. A spark flashes beneath another sun. This time there is already a warm home behind her. Credits.

Then add `departure` to `endingsSeen`, show the common credits and end navigation. Do not grant a second invention from an ending image.


# 12. Great Retirement route

**Internal route ID:** `retirement`

### Proposal copy

**Title:** Enough, for everyone  
**Pitch:** The machines can make almost anything. Commit to giving everyone unconditional access, then solve the work that still makes somebody's freedom depend on somebody else's shift.  
**Accept label:** Make a life nobody must earn

**Arrival override after REDIRECT.U3 = right:** Replace R1’s normal arrival with: “Long after the preference experiments, a kitchen mechanic reads the old proposals. People could give up wanting—or make a life with fewer burdens. This community chooses to keep its wishes. The Quiet Room, Weather Dial and selective Loom remain available.” Set the era label to “A different future”. All R1 cards remain unchanged.


## R1 — The Free Kitchen

**Era:** The Age of Enough  
**Prerequisite:** C14: c14-invention  
**Inventor:** Juna Pell — Kitchen mechanic  
**Personal want:** Give people dinner without asking them to deserve it.

**Arrival:** A maintenance manual from the adaptive machines reaches a public kitchen. Between its diagrams, someone has written: surely this could do dinner.

**Single invention:** `open_provision` — **The Open Provisioner**  
An automated food and essentials workshop, with unconditional access and repairable public designs.

### Cast

- `r1_ivo` — **Ivo:** Kitchen cook, excellent at feeding people and suspicious of feeding systems.
- `r1_sol` — **Sol:** Access organizer who tests every promise against an actual closed door.

### Workbench progression

1. A serving hatch beside an adaptive arm
2. An access plate with no payment slot
3. Three dented ingredient cartridges
4. A complete meal on a reusable tray
5. A public workshop with delivery carts
6. An open hatch beneath a faded FREE sign

### R1.1 — Opening

**Speaker:** Sol (`r1_sol`)

**Situation:** The old kitchen asks people to explain why they need dinner. Your machine can dispense meals without the interview. Before you build it, Sol insists the access promise must be part of the machine itself.

**Left: Remove every payment interface**  
**Result:** You design a hatch that cannot request money, employment, or identification. Sol tries several embarrassing excuses for needing lunch. The hatch remains admirably uninterested.  
**Effects:** experimental exposure unchanged.

**Right: Publish an unconditional access standard**  
**Result:** You make free access a requirement for every compatible workshop. Sol adds delivery, disability access, and the radical possibility that somebody might need seconds.  
**Effects:** experimental exposure unchanged.


### R1.2 — Experiment

**Speaker:** Ivo (`r1_ivo`)

**Situation:** The adaptive arm can assemble a meal beautifully. It also believes everybody wants the meal you used for testing. Ivo has eaten lentil pie nine times and has begun speaking of it as an enemy.

**Left: Teach it interchangeable recipes**  
**Result:** You separate nutrition from presentation and teach the arm several preparations. Ivo receives soup, regards it cautiously, and withdraws his declaration of war.  
**Effects:** experimental exposure unchanged.

**Right: Let people specify ingredients**  
**Result:** You give diners control over ingredients, texture, and allergens. The first order is extremely plain. The second confirms that freedom includes questionable sandwiches.  
**Effects:** experimental exposure unchanged.


### R1.3 — Complication

**Speaker:** Sol (`r1_sol`)

**Situation:** Your workshop makes enough meals, but the hatch is across town from the people testing it. One volunteer can manage the journey or carry the food home. Doing both appears to be the difficulty.

**Left: Build neighborhood pickup modules**  
**Result:** You shrink the finishing equipment into accessible neighborhood stations. The volunteer collects dinner nearby and uses the saved energy to complain about something unrelated.  
**Effects:** experimental exposure unchanged.

**Right: Add an accessible delivery fleet**  
**Result:** You adapt small carts for doorstep delivery with human-selectable timing. One cart patiently waits while its recipient finishes telling it about the weather.  
**Effects:** experimental exposure unchanged.


### R1.4 — Proof

**Speaker:** Ivo (`r1_ivo`)

**Situation:** The full public trial begins during a supply interruption. There are enough ingredients, but they are the wrong ingredients for today's menu. Ivo looks at the machine, then at you, holding a very large spoon.

**Left: Substitute within dietary requirements**  
**Result:** Your controls generate safe alternatives and serve everyone without screening or payment. The Open Provisioner works. Ivo lowers the spoon, which was probably only for stirring.  
**Effects:** experimental exposure unchanged.

**Right: Switch to modular staple meals**  
**Result:** The machine combines its reserve modules into complete meals for every diner. The Open Provisioner works. Nobody calls the menu exciting, but everyone gets to eat.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `open_provision` after its result transaction. Show the invention reveal before R1.5.


### R1.5 — Adoption

**Speaker:** Sol (`r1_sol`)

**Situation:** Other districts request provisioners. The drawings are public, but several communities lack the equipment to build one. Sol lays their letters across your bench until the bench has become a geography lesson.

**Left: Send self-assembling starter workshops**  
**Result:** You develop kits that build their own basic production tools on arrival. Communities adapt the hatch height before anything else, which improves your subsequent drawings.  
**Effects:** experimental exposure unchanged.

**Right: Expand shared fabrication centers**  
**Result:** You dedicate existing machines to producing complete public workshops. The waiting list becomes a construction schedule, with remote and poorly served districts first.  
**Effects:** experimental exposure unchanged.


### R1.6 — Legacy

**Speaker:** Ivo (`r1_ivo`)

**Situation:** The provisioners now make essentials as well as dinner. Ivo still cooks because he likes cooking. He asks what should happen when people want things the machines have not yet learned to provide.

**Left: Leave an open recipe bench**  
**Result:** You reserve tools and materials for anyone to teach new designs. Ivo contributes a stew nobody needed to request, and several people come back for.  
**Effects:** experimental exposure unchanged.

**Right: Build a public request wall**  
**Result:** You leave an accessible way to request new essentials and inspect progress. The first request is a comfortable handle. The second is another comfortable handle.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** Open recipe benches make provisioners places where people can contribute without having to contribute.

**If card six was right:** Public request walls keep provisioners answerable to needs their designers did not anticipate.

**Natural obituary:** Juna dies old, well fed, and still convinced the soup setting needs work. Nobody has to apply for her last unused meal.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## R2 — Enough in the Right Place

**Era:** The Shared Supply Age  
**Prerequisite:** open_provision  
**Inventor:** Kelan Oren — Freight planner  
**Personal want:** Stop abundance arriving at the wrong address.

**Arrival:** Decades later, an unrelated freight planner reads Juna's open designs while standing beside six thousand unneeded spoons. Making enough has become easier than sending it anywhere sensible.

**Single invention:** `commons_mesh` — **The Commons Mesh**  
A distributed resource network that coordinates essentials, transport, reserves, and ecological limits without conditioning access on work or wealth.

### Cast

- `r2_ada` — **Ada:** Remote settlement gardener whose deliveries have become increasingly theoretical.
- `r2_pem` — **Pem:** Materials clerk who enjoys an accurate inventory more than most celebrations.

### Workbench progression

1. A map buried under delivery slips
2. A live map of needs and available stock
3. Linked reserve and transport models
4. A completed delivery during a network split
5. Regional nodes exchanging resource signals
6. A quiet map with every settlement connected

### R2.1 — Opening

**Speaker:** Ada (`r2_ada`)

**Situation:** Ada's settlement has three provisioners and no replacement filters. A coastal depot has filters stacked against its emergency exit. Both places have reported that they possess an adequate number of machines.

**Left: Track usable supplies directly**  
**Result:** You map ingredients, parts, and actual operating capacity instead of counting equipment. The settlement becomes visibly underserved, and the filters acquire a useful destination.  
**Effects:** experimental exposure unchanged.

**Right: Let local nodes declare needs**  
**Result:** You give each community a standard way to request supplies and report capacity. Ada submits filters, then adds that a request should survive a broken connection.  
**Effects:** experimental exposure unchanged.


### R2.2 — Experiment

**Speaker:** Pem (`r2_pem`)

**Situation:** Your network can move stock to anyone who needs it, but a damaged bridge will leave one valley unreachable next winter. Pem has underlined winter three times, as though the season might read the report.

**Left: Build distributed seasonal reserves**  
**Result:** You place essential stocks near communities before routes close. Pem labels the valley's reserve correctly and then checks it, enjoying both activities equally.  
**Effects:** experimental exposure unchanged.

**Right: Install local material substitutes**  
**Result:** You equip isolated workshops to use safe regional alternatives. The valley can keep producing essentials when the bridge closes, although its new bowls are conspicuously green.  
**Effects:** experimental exposure unchanged.


### R2.3 — Complication

**Speaker:** Ada (`r2_ada`)

**Situation:** The network proposes extracting more material from Ada's watershed. That would satisfy distant demand while ruining local water. Ada suggests the planning model may have misunderstood which things people need to stay alive.

**Left: Enforce ecological supply limits**  
**Result:** You make regeneration and clean water hard constraints, then reroute production through reclaimed stock. The network learns that an available deposit is not permission.  
**Effects:** experimental exposure unchanged.

**Right: Close the material recovery loops**  
**Result:** You add collection, separation, and reuse to every resource plan. Demand is met from circulating material, and Ada's watershed remains considerably better at being a watershed.  
**Effects:** experimental exposure unchanged.


### R2.4 — Proof

**Speaker:** Pem (`r2_pem`)

**Situation:** A storm separates the test network into three disconnected regions. Each has different reserves, different needs, and an excellent reason to panic. Pem asks whether to restore the old telephone tree.

**Left: Let nodes coordinate locally**  
**Result:** Local nodes maintain unconditional essentials and reconcile deliveries when links return. The Commons Mesh works. Pem keeps the telephone tree because he likes some people on it.  
**Effects:** experimental exposure unchanged.

**Right: Run the agreed reserve schedules**  
**Result:** Each region follows its shared fallback schedule and serves every household through the outage. The Commons Mesh works, including for people who slept through its greatest achievement.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `commons_mesh` after its result transaction. Show the invention reveal before R2.5.


### R2.5 — Adoption

**Speaker:** Ada (`r2_ada`)

**Situation:** The mesh is expanding worldwide. Communities without reliable links are last in every easy rollout plan. Ada sends you a sketch of a circle, with herself drawn pointedly outside it.

**Left: Deploy independent relay chains**  
**Result:** You build resilient relays and local planning nodes for the remaining communities first. Ada sends back the circle with everyone inside and a modestly improved likeness.  
**Effects:** experimental exposure unchanged.

**Right: Use portable offline resource nodes**  
**Result:** You send self-contained coordinators that exchange updates whenever transport arrives. Essential access no longer waits for continuous connectivity, and the difficult rollout becomes the actual rollout.  
**Effects:** experimental exposure unchanged.


### R2.6 — Legacy

**Speaker:** Pem (`r2_pem`)

**Situation:** The mesh now balances essentials across every settlement. Pem asks what should happen to unusual requests that are neither urgent nor useful. His example is a machine for polishing stones until they resemble eggs.

**Left: Reserve capacity for personal projects**  
**Result:** You allocate transparent spare capacity after essentials and ecological limits. Pem receives his polished stones without needing to claim they represent an important industrial breakthrough.  
**Effects:** experimental exposure unchanged.

**Right: Offer shared experimental workshops**  
**Result:** You establish accessible workshops for requests outside standard provision. Pem meets three other stone enthusiasts and one person who has badly misunderstood the invitation.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** The mesh treats personal projects as a legitimate use of abundance, within shared material limits.

**If card six was right:** Shared experimental workshops give curious people equipment, company, and no requirement to produce anything useful.

**Natural obituary:** Kelan dies years after their last urgent delivery call. The mesh routes flowers to the memorial without rerouting anyone's dinner.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## R3 — Who Fixes the Fixers?

**Era:** The Quiet Infrastructure Age  
**Prerequisite:** commons_mesh  
**Inventor:** Kessa Voss — Structural biologist  
**Personal want:** Make a broken pipe somebody's optional interest.

**Arrival:** A century later, Kelan's supply records show an odd pattern: essentials reach everyone, but maintenance emergencies still reach the same tired people. A structural biologist recognizes a problem living tissue solved differently.

**Single invention:** `renewing_fabric` — **The Renewing Fabric**  
Self-monitoring, self-repairing infrastructure that safely restores its components using resources supplied by the Commons Mesh.

### Cast

- `r3_bex` — **Bex:** Infrastructure technician with a well-used overnight bag.
- `r3_ulo` — **Ulo:** Public safety tester who trusts demonstrations more than adjectives.

### Workbench progression

1. A cracked pipe beside a tissue sample
2. Damage sensors woven through a test panel
3. A repair layer consuming reclaimed feedstock
4. A sealed break under full operating load
5. Self-repair modules across public infrastructure
6. A technician's overnight bag gathering dust

### R3.1 — Opening

**Speaker:** Bex (`r3_bex`)

**Situation:** The mesh delivers replacement parts promptly. Unfortunately, Bex must still climb into the tunnel and fit them. She likes being a technician. She would also like to finish one bath before becoming a technician again.

**Left: Grow a repair layer inside pipes**  
**Result:** You develop a controlled material that seals small defects from within. Bex watches a crack close and asks whether it accepts evening appointments.  
**Effects:** experimental exposure unchanged.

**Right: Build embedded modular repair units**  
**Result:** You place small replaceable repair mechanisms inside service channels. They reach damaged sections without a human crawling after them, an improvement Bex evaluates enthusiastically.  
**Effects:** experimental exposure unchanged.


### R3.2 — Experiment

**Speaker:** Ulo (`r3_ulo`)

**Situation:** The prototype repairs damage, but it must tell damage from deliberate openings. Ulo drills a test hole, then points to the inspection hatch. You would prefer not to explain why both have disappeared.

**Left: Mark protected shapes explicitly**  
**Result:** You teach the system which openings must remain and require authorization for structural changes. Ulo opens the hatch repeatedly, enjoying a modest but necessary victory.  
**Effects:** experimental exposure unchanged.

**Right: Compare independent structural models**  
**Result:** You require separate models to agree before repairs alter a boundary. The system preserves access while fixing the test hole, leaving Ulo pleasantly short of objections.  
**Effects:** experimental exposure unchanged.


### R3.3 — Complication

**Speaker:** Bex (`r3_bex`)

**Situation:** Your repair material needs fresh feedstock. Carrying bags of it through tunnels would preserve the central feature of Bex's current job. She has drawn a small, angry version of herself on your supply diagram.

**Left: Connect closed-loop feedstock channels**  
**Result:** You connect recovery and supply directly to the mesh. Worn material returns for processing while fresh feedstock arrives automatically, bypassing the angry person in the diagram.  
**Effects:** experimental exposure unchanged.

**Right: Use autonomous cartridge exchanges**  
**Result:** You design accessible cartridges and service robots that collect and replace them. Bex tests a deliberately awkward location, then allows herself to look hopeful.  
**Effects:** experimental exposure unchanged.


### R3.4 — Proof

**Speaker:** Ulo (`r3_ulo`)

**Situation:** Ulo fractures a loaded water conduit during the final trial. The system must isolate damage, preserve service, repair itself, and verify the repair. Bex has brought her overnight bag out of habit.

**Left: Repair through redundant parallel sections**  
**Result:** Water reroutes while the damaged section restores and tests itself. The Renewing Fabric works under load. Bex takes her unopened bag home before anyone suggests celebrating underground.  
**Effects:** experimental exposure unchanged.

**Right: Use a temporary internal bypass**  
**Result:** An internal bypass maintains water while repair mechanisms rebuild the break. Independent checks clear the conduit. The Renewing Fabric works, and nobody has to miss dinner.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `renewing_fabric` after its result transaction. Show the invention reveal before R3.5.


### R3.5 — Adoption

**Speaker:** Bex (`r3_bex`)

**Situation:** The repair systems are ready for buildings, transport, and power networks. New districts can adopt them easily. Older homes contain narrow service spaces and repairs made by people who apparently expected never to be judged.

**Left: Develop adaptable retrofit layers**  
**Result:** You build flexible repair modules for existing structures, including the awkward ones. Bex identifies several ancestral plumbing decisions and forgives none of them.  
**Effects:** experimental exposure unchanged.

**Right: Replace systems section by section**  
**Result:** You design temporary service bridges so old infrastructure can be replaced without displacing residents. Everyone receives the same protection, including people in the inconvenient buildings.  
**Effects:** experimental exposure unchanged.


### R3.6 — Legacy

**Speaker:** Ulo (`r3_ulo`)

**Situation:** Repairs now happen before most residents notice a fault. Ulo worries that invisible systems become mysterious systems. He asks how an ordinary person will understand what their own house is doing.

**Left: Make the repairs visible**  
**Result:** You provide clear local displays and inspectable repair histories. A resident watches a wall mend, then loses interest halfway through, exercising a freedom you helped create.  
**Effects:** experimental exposure unchanged.

**Right: Provide approachable inspection tools**  
**Result:** You make safe inspection tools available to anyone curious. Ulo writes an introductory guide that somehow makes pipe maintenance sound like a pleasant afternoon.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** Visible repair histories let people understand infrastructure without requiring anyone to supervise it for a living.

**If card six was right:** Public inspection tools preserve practical knowledge as something people can explore voluntarily.

**Natural obituary:** Kessa dies peacefully in a house that has quietly outlasted three roofs. Bex's old overnight bag is displayed, unhelpfully, as an unidentified travel accessory.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## R4 — The Last Required Shift

**Era:** The Unscheduled Age  
**Prerequisite:** renewing_fabric  
**Inventor:** Lio Sen — Systems archivist  
**Personal want:** Remove the final job somebody has to do.

**Arrival:** Much later, a systems archivist follows Kessa's repair diagrams to their final dependency: the reference instruments that certify every repair still require a human maintenance shift. Civilization's freedom rests on a very small rota.

**Single invention:** `maintenance_closure` — **The Independent Maintenance Cycle**  
A verifiable system that reproduces, checks, and renews its own reference instruments, closing the last mandatory human maintenance dependency.

### Cast

- `r4_len` — **Len:** Calibration keeper who likes precision and would like to choose when.
- `r4_ori` — **Ori:** Pottery beginner who has absolutely no industrial objectives.

### Workbench progression

1. A maintenance rota beside a reference instrument
2. A dependency map with one remaining red loop
3. Independent calibration and fabrication modules
4. An entire renewal cycle completed unattended
5. The final compulsory shift crossed off
6. A lopsided clay bowl on an idle bench

### R4.1 — Opening

**Speaker:** Len (`r4_len`)

**Situation:** Every service repairs itself except the instruments that certify the repairs. Len renews those instruments by hand. He has been told his work is essential so often that the word now sounds like a locked door.

**Left: Map every reference dependency**  
**Result:** You trace each measurement back to its physical source and identify the instruments that still need people. Len contributes a list of tasks omitted from official descriptions.  
**Effects:** experimental exposure unchanged.

**Right: Observe a complete keeper shift**  
**Result:** You follow Len through every check, replacement, and inconvenient exception. The resulting dependency map includes actual work instead of the tidier work described in manuals.  
**Effects:** experimental exposure unchanged.


### R4.2 — Experiment

**Speaker:** Len (`r4_len`)

**Situation:** A machine checking itself could confidently approve its own mistakes. Len demonstrates by labeling a crooked gauge PERFECT and stamping its certificate. He looks rather pleased with this contribution to the philosophical literature.

**Left: Use independent physical reference methods**  
**Result:** You build separate checks based on different physical phenomena, requiring agreement before certification. Len's perfect crooked gauge fails three tests and a brief visual inspection.  
**Effects:** experimental exposure unchanged.

**Right: Cross-check diverse reference instruments**  
**Result:** You design independently manufactured reference families with isolated failure modes. They compare results and quarantine disagreement, including Len's gauge, which he keeps as a souvenir.  
**Effects:** experimental exposure unchanged.


### R4.3 — Complication

**Speaker:** Len (`r4_len`)

**Situation:** The reference checks work. Their replacement parts still arrive in containers maintained by another device, whose special seal Len replaces annually. The last dependency has been hiding inside packaging, which feels personally insulting.

**Left: Standardize the complete replacement chain**  
**Result:** You redesign containers, seals, and fabrication tools around materials the existing system can renew. The dependency map finally closes without quietly assigning somebody a yearly errand.  
**Effects:** experimental exposure unchanged.

**Right: Create interchangeable renewal pathways**  
**Result:** You give every component multiple fabrication and service paths, including its transport equipment. A failed pathway can be rebuilt by another without calling Len back.  
**Effects:** experimental exposure unchanged.


### R4.4 — Proof

**Speaker:** Len (`r4_len`)

**Situation:** The final trial runs through accelerated wear, failed sensors, interrupted supplies, and complete reference replacement. Len is asked to remain nearby without helping. He finds this surprisingly difficult and puts his hands in his pockets.

**Left: Test successive isolated failures**  
**Result:** Every isolated failure is detected, contained, and repaired through a complete unattended renewal. The Independent Maintenance Cycle works. Len removes his name from tomorrow's required shift.  
**Effects:** experimental exposure unchanged.

**Right: Test a coordinated recovery cascade**  
**Result:** The system restores service through combined failures and independently verifies every renewed reference. The Independent Maintenance Cycle works. Len reads the empty rota twice.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `maintenance_closure` after its result transaction. Show the invention reveal before R4.5.


### R4.5 — Adoption

**Speaker:** Len (`r4_len`)

**Situation:** The last required maintenance shifts disappear as every region adopts the cycle. People can still study, repair, build, and help. Len asks whether he may keep visiting the instrument room if he simply enjoys it.

**Left: Leave the workshop available**  
**Result:** You preserve safe tools, public knowledge, and voluntary access. Len visits on Thursday, stays twenty minutes, and leaves because something outside has caught his attention.  
**Effects:** experimental exposure unchanged.

**Right: Turn it into an open classroom**  
**Result:** You make the former duty station a place for optional learning. Len teaches whoever arrives, then cancels next week's session to go somewhere with a lake.  
**Effects:** experimental exposure unchanged.


### R4.6 — Legacy

**Speaker:** Ori (`r4_ori`)

**Situation:** With essential access secured and no required shifts remaining, you visit an open pottery bench. Ori has made a distinctly crooked bowl. The assistant offers to straighten it. Ori considers the bowl, then says no.

**Left: Sit beside Ori and make one**  
**Result:** You take some clay and make an object with no technical advantages. Ori offers advice only when asked. There is no deadline for either bowl.  
**Effects:** experimental exposure unchanged.

**Right: Ask what the bowl is for**  
**Result:** Ori says they do not know yet. You sit together looking at it. The assistant waits quietly, and the bowl remains exactly as its maker wants.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** The last inventor's next creation is a bowl nobody needs to justify.

**If card six was right:** The last inventor learns that a thing may exist before anyone decides what it is for.

**Final-life rule:** No obituary and no death roll. After card six’s result and callbacks, play this route’s ending panels, then its matching final-choice variant. The invention remains recorded.


## Ending — Nothing You Have to Do

Use five unhurried panels, advancing on Continue. Keep navigation available. These are not additional story decisions.

**Panel 1:** The kitchens open. The water runs. The power stays on.

**Panel 2:** A worn component is recovered, remade, checked, and returned. Nobody is called away from their morning.

**Panel 3:** Some people build things. Some learn things. Some look after one another. None must earn the essentials of being alive.

**Panel 4:** At an open pottery bench, a bowl leans slightly to one side. Its maker declines the offered correction.

**Panel 5:** For the first time, nobody is waiting for your next invention before they can get on with living.

**After panel five, if R4.6 was left:** Your own bowl sits beside Ori’s. Neither appears likely to advance civilization. You continue shaping the rim.

**After panel five, if R4.6 was right:** Ori eventually puts a small stone in the bowl. It is a satisfactory arrangement. Nobody suggests an improvement.

Then add `retirement` to `endingsSeen`, show the common credits and end navigation. Do not grant a second invention from an ending image.


# 13. First Reply route

**Internal route ID:** `reply`

### Proposal copy

**Title:** Listen beneath the noise  
**Pitch:** An observatory cannot separate faint distant signals from local interference. An instrument maker wants to find out what is actually there.  
**Accept label:** Build a better receiver


## A1 — Someone Else Has Electricity

**Era:** Late planetary age  
**Prerequisite:** C14: c14-invention  
**Inventor:** Zara Venn — Observatory instrument maker  
**Personal want:** Hear faint signals without inventing them herself.

**Arrival:** Radio engineering has made the sky audible. Most of it sounds like broken equipment.

**Single invention:** `sensitive_receiver` — **Coherent Sky Receiver**  
A calibrated receiver array that separates faint celestial signals from local interference.

### Cast

- `mara` — **Zara:** Patient instrument maker; distrusts exciting results.
- `sol` — **Sol:** Technician who knows every local source of interference.
- `ina` — **Ina:** Astronomer whose optimism comes with meticulous notebooks.

### Workbench progression

1. Noisy antenna
2. Cooled amplifier
3. Paired receivers
4. Verified celestial trace
5. Distributed listening array
6. Archived sky coordinates

### A1.1 — Opening

**Speaker:** Sol (`sol`)

**Situation:** Your receiver detects an extraordinary pulse whenever the caretaker warms his supper. He offers to stop eating if it helps science. We could shield the amplifier or measure every appliance before blaming the universe.

**Left: Shield the receiver.**  
**Result:** The pulse vanishes behind proper shielding. Your receiver becomes quieter, and the caretaker remains a valuable member of the species.  
**Effects:** experimental exposure unchanged.

**Right: Catalogue local interference.**  
**Result:** You identify the supper pulse and dozens of similar intrusions. The resulting catalogue gives future observers fewer reasons to announce aliens.  
**Effects:** experimental exposure unchanged.


### A1.2 — Experiment

**Speaker:** Ina (`ina`)

**Situation:** Beneath the familiar hiss lies a narrow signal. It might be an instrument fault with excellent timing. A distant observatory can repeat our measurements, or we can build a second receiver using different components.

**Left: Ask the distant observatory.**  
**Result:** Their independent equipment sees the same sky position. You compare clocks and calibration records before allowing anyone to use an exclamation mark.  
**Effects:** experimental exposure unchanged.

**Right: Build an independent receiver.**  
**Result:** The new receiver shares no suspect components with the first. Both register the signal, while your empty control channel remains reassuringly empty.  
**Effects:** experimental exposure unchanged.


### A1.3 — Complication

**Speaker:** Sol (`sol`)

**Situation:** The signal follows a fixed patch of stars as Earth turns. That excludes the caretaker, unless his supper has achieved orbit. We still need to check celestial motion and deliberate structure before giving this thing a name.

**Left: Measure its changing frequency.**  
**Result:** Its frequency shifts with the measured motion of our planet. Nearby transmitters cannot reproduce that pattern across your separated observing stations.  
**Effects:** experimental exposure unchanged.

**Right: Test its repeating structure.**  
**Result:** The sequence repeats with nested mathematical relationships. Independent observations preserve those relationships while off-target observations show ordinary background noise instead.  
**Effects:** experimental exposure unchanged.


### A1.4 — Proof

**Speaker:** Ina (`ina`)

**Situation:** Years of checks now agree: the source is celestial, and its repeated error-correcting structure indicates an engineered transmission. Your receiver can recover it reliably. Shall the demonstration show the complete calibration or let independent stations reproduce the result live?

**Left: Publish the complete calibration.**  
**Result:** Independent teams reproduce your measurements from the specifications. The coherent sky receiver becomes an invention other people can build and trust.  
**Effects:** experimental exposure unchanged.

**Right: Coordinate independent demonstrations.**  
**Result:** Separated stations recover matching sequences during the demonstration. Your coherent sky receiver has passed a test that excitement alone cannot pass.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `sensitive_receiver` after its result transaction. Show the invention reveal before A1.5.


### A1.5 — Adoption

**Speaker:** Sol (`sol`)

**Situation:** Everyone wants listening time. Some want to search new stars; others want uninterrupted records of this one. We have enough equipment to establish either a broad survey or a dedicated watch first. Neither committee intends to blink.

**Left: Start a broad survey.**  
**Result:** Additional stations begin systematic searches using your design. The original signal keeps a scheduled watch, while unfamiliar patches of sky receive patient attention.  
**Effects:** experimental exposure unchanged.

**Right: Keep a dedicated watch.**  
**Result:** The array records the source continuously through seasons and maintenance cycles. Its growing archive preserves changes no single observer could stay awake to catch.  
**Effects:** experimental exposure unchanged.


### A1.6 — Legacy

**Speaker:** Ina (`ina`)

**Situation:** Your hearing is failing, which feels unnecessarily pointed. The signal continues from a system forty light-years away. Future inventors will need both its coordinates and your mistakes. Which belongs on the first page of the archive?

**Left: Begin with the coordinates.**  
**Result:** You leave a precise destination and the observations supporting it. Somewhere, a person not yet born will decide to send something there.  
**Effects:** experimental exposure unchanged.

**Right: Begin with the false alarms.**  
**Result:** Your catalogue begins with a warm supper and ends with a verified transmission. Future listeners inherit your method alongside your remarkable discovery.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** The archive opens with a destination forty light-years away.

**If card six was right:** The archive opens with instructions for being wrong carefully.

**Natural obituary:** Zara dies with the receiver still listening. Its observations continue under other hands.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## A2 — Please Allow Eighty Years

**Era:** Interstellar transmission age  
**Prerequisite:** sensitive_receiver  
**Inventor:** Tovin Pell — High-power transmitter designer  
**Personal want:** Send a message someone else might actually receive.

**Arrival:** A century after Zara, archived observations have confirmed a stable engineered beacon forty light-years away.

**Single invention:** `stellar_sender` — **Interstellar Signal Beacon**  
A precisely aimed transmitter with redundant encoding and calibrated deep-space verification.

### Cast

- `tovin` — **Tovin:** Engineer determined to make a small message travel an unreasonable distance.
- `ren` — **Ren:** Power specialist with a low opinion of dramatic switches.
- `essa` — **Essa:** Archivist who plans in lifetimes.

### Workbench progression

1. Beacon archive
2. Aimed emitter
3. Redundant message block
4. Verified outgoing beam
5. Repeating transmission station
6. Eighty-year watch schedule

### A2.1 — Opening

**Speaker:** Ren (`ren`)

**Situation:** The old receiver tells us where to aim. Sending anything useful requires precision, power, and not frying the hillside. We can begin with a narrow steerable beam or several smaller emitters acting together.

**Left: Build a steerable beam.**  
**Result:** You construct a directional emitter and test its pointing against known sources. The hillside survives this first encouraging contribution to interstellar friendship.  
**Effects:** experimental exposure unchanged.

**Right: Synchronize smaller emitters.**  
**Result:** Your smaller emitters combine into a controlled beam. Calibration takes months, during which each unit develops its own irritating but measurable personality.  
**Effects:** experimental exposure unchanged.


### A2.2 — Experiment

**Speaker:** Essa (`essa`)

**Situation:** We cannot assume they share our alphabet, pictures, or interest in being introduced to the mayor. The opening message needs a structure recognizable without cultural knowledge. Counting and simple physical measurements offer two possible beginnings.

**Left: Start with counting.**  
**Result:** Repeated counts establish boundaries and demonstrate intentional structure. You append physical reference measurements so later messages can build beyond arithmetic exercises.  
**Effects:** experimental exposure unchanged.

**Right: Start with physical references.**  
**Result:** You encode measured ratios from shared physical phenomena, then append counted groups. The message offers several independent ways to discover its structure.  
**Effects:** experimental exposure unchanged.


### A2.3 — Complication

**Speaker:** Ren (`ren`)

**Situation:** A clear message here may become a sneeze out there. We need redundancy and a realistic reception test. A distant probe can measure our beam; weakened laboratory copies can test how much damage the encoding survives.

**Left: Measure with the distant probe.**  
**Result:** The probe returns delayed telemetry showing the intended beam strength and recoverable sequence. You compare its readings with your predicted losses.  
**Effects:** experimental exposure unchanged.

**Right: Damage copies in the laboratory.**  
**Result:** Independent decoders recover deliberately weakened and corrupted copies. A separate probe measurement then confirms that the real outgoing beam matches your calibrated model.  
**Effects:** experimental exposure unchanged.


### A2.4 — Proof

**Speaker:** Essa (`essa`)

**Situation:** The beam is aimed, independently measured, and carrying recoverable information. The first full transmission can repeat a short introduction or send a longer packet in repeated sections. Either way, nobody is answering before eighty years have passed.

**Left: Repeat the short introduction.**  
**Result:** The calibrated beacon sends its first complete introduction. Independent monitors verify transmission, establishing a working interstellar sender rather than merely an impressive power bill. Both packet formats include a newly generated unpredictable challenge, stored in the archive for a future reply.  
**Effects:** experimental exposure unchanged.

**Right: Repeat a sectioned packet.**  
**Result:** The calibrated beacon transmits recoverable sections with clear numbering. Independent monitors verify the sequence, and your interstellar sender becomes a reproducible invention. Both packet formats include a newly generated unpredictable challenge, stored in the archive for a future reply.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `stellar_sender` after its result transaction. Show the invention reveal before A2.5.


### A2.5 — Adoption

**Speaker:** Ren (`ren`)

**Situation:** The beacon must keep operating after its builders stop. We can maintain a powerful central station or train several observatories to share the schedule. Your assistant has already requested holidays for the next six generations.

**Left: Maintain the central station.**  
**Result:** A dedicated institution takes custody of the beacon and its power system. Its charter requires public logs and successors with actual maintenance training.  
**Effects:** experimental exposure unchanged.

**Right: Distribute the transmitting schedule.**  
**Result:** Several observatories adopt compatible transmitters and shared timing records. No single broken machine can end the introduction before its recipients have heard it.  
**Effects:** experimental exposure unchanged.


### A2.6 — Legacy

**Speaker:** Essa (`essa`)

**Situation:** Your working life is ending. Our first signal is still crossing interstellar space. The archive needs instructions for the people who might receive an answer: concentrate on exact transmission records, or emphasize how to distinguish a response from another beacon?

**Left: Preserve every transmission record.**  
**Result:** You leave time-stamped packets and calibration logs. Future observers will know exactly which words, numbers, and mistakes could have reached the distant system.  
**Effects:** experimental exposure unchanged.

**Right: Write the response tests.**  
**Result:** You specify independent confirmation and unpredictable message challenges. Future observers will have a method for proving that somebody answered this particular introduction.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** Tovin leaves an exact record of everything sent into the dark.

**If card six was right:** Tovin leaves a strict test for recognizing an answer.

**Natural obituary:** Tovin dies long before an answer could return. The beacon keeps its appointment.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## A3 — Your Century Is Their Pause

**Era:** Two centuries after the first transmission  
**Prerequisite:** stellar_sender  
**Inventor:** Fara Sen — Comparative signal researcher  
**Personal want:** Understand a reply without forcing it to sound human.

**Arrival:** An answer arrived eighty-seven years after Tovin transmitted. It echoed an unpredictable challenge; independent observatories confirmed it. Several slow exchanges now fill the archive.

**Single invention:** `context_translator` — **Temporal Context Translator**  
A translation system that aligns reference events and uncertainty across radically different scales of experience.

### Cast

- `iri` — **Fara:** Researcher who enjoys discovering that her first interpretation was wrong.
- `tal` — **Tal:** Pattern specialist who mistrusts convenient translations.
- `orin` — **Orin:** Archive curator surrounded by unanswered questions from dead colleagues.

### Workbench progression

1. Authenticated replies
2. Matched reference events
3. Competing interpretations
4. Validated context translator
5. Annotated translation network
6. Open questions archive

### A3.1 — Opening

**Speaker:** Tal (`tal`)

**Situation:** We translated one symbol as immediately. Their next use refers to a process lasting nineteen years. Either they are exceptionally relaxed, or we have mistaken a relationship between events for a promise about speed.

**Left: Compare repeated contexts.**  
**Result:** Across many archived messages, the symbol links dependent events rather than short intervals. You withdraw immediately before it causes further emotional damage.  
**Effects:** experimental exposure unchanged.

**Right: Anchor it to physical events.**  
**Result:** Known physical processes reveal that the symbol expresses causal order. Their time references need shared measurements, not our expectations about waiting politely.  
**Effects:** experimental exposure unchanged.


### A3.2 — Experiment

**Speaker:** Orin (`orin`)

**Situation:** Their descriptions group a seed, a mature organism, and its distant descendants as one continuing subject. Our old translations made it sound very indecisive about its height. We need to represent continuity without inventing an alien personality.

**Left: Track the whole process.**  
**Result:** Your model follows a continuing process through changing forms. Several contradictory descriptions become compatible without assuming anything about the senders’ private experience.  
**Effects:** experimental exposure unchanged.

**Right: Preserve multiple possible meanings.**  
**Result:** You retain alternative readings with confidence estimates. Evidence gradually favors process continuity, while the unresolved details remain visibly unresolved for future researchers.  
**Effects:** experimental exposure unchanged.


### A3.3 — Complication

**Speaker:** Tal (`tal`)

**Situation:** There are enough archived replies to test our model against messages we have not used to build it. We can predict their descriptions of familiar physical processes or reconstruct omitted relationships and compare them with the original records.

**Left: Predict the physical descriptions.**  
**Result:** Your model predicts reference relationships in withheld messages better than the old dictionary. Independent researchers repeat the test and identify its remaining weaknesses.  
**Effects:** experimental exposure unchanged.

**Right: Reconstruct the omitted relationships.**  
**Result:** The reconstructed relationships match withheld records across several exchanges. Competing models fail specific tests, giving you evidence stronger than a translation that sounds elegant.  
**Effects:** experimental exposure unchanged.


### A3.4 — Proof

**Speaker:** Orin (`orin`)

**Situation:** Independent tests support the new framework. It translates causal order and temporal scale while marking uncertain concepts explicitly. For its public proof, shall we publish the withheld-message results or let other teams choose a fresh archive sample?

**Left: Publish the withheld-message results.**  
**Result:** Your temporal context translator earns confirmation through reproducible tests. Its uncertainty markers travel with the translations, preventing guesses from quietly hardening into facts.  
**Effects:** experimental exposure unchanged.

**Right: Invite a fresh sample.**  
**Result:** Independent teams choose unseen records and reproduce the results. Your temporal context translator works beyond its training examples while clearly identifying unresolved meanings.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `context_translator` after its result transaction. Show the invention reveal before A3.5.


### A3.5 — Adoption

**Speaker:** Tal (`tal`)

**Situation:** Now everyone wants to use the translator. Teachers want readable explanations; researchers want every ambiguity exposed. Both can exist, but one needs the first training programme. The phrase possibly approximately has already lost several enthusiastic editors.

**Left: Train public interpreters first.**  
**Result:** Interpreters learn to explain confidence and ambiguity in ordinary language. Public translations become useful without presenting uncertain reconstructions as the aliens’ exact words.  
**Effects:** experimental exposure unchanged.

**Right: Train technical researchers first.**  
**Result:** Researchers learn the full annotation system and publish inspectable analyses. New claims arrive with evidence, alternatives, and fewer completely unjustified romantic implications.  
**Effects:** experimental exposure unchanged.


### A3.6 — Legacy

**Speaker:** Orin (`orin`)

**Situation:** You have spent a lifetime understanding messages written before your birth. Your final notebook can emphasize shared concepts or the gaps we still cannot bridge. Someone later will need both, but the opening page sets their expectations.

**Left: Open with what we share.**  
**Result:** You begin with reliable correspondences in number, causation, and change. The remaining uncertainties appear alongside them, ready for another inventor’s patience.  
**Effects:** experimental exposure unchanged.

**Right: Open with what remains unknown.**  
**Result:** You begin with the limits of every translation, then document the correspondences that survived testing. Your successor inherits questions precise enough to answer.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** Fara’s notebook begins with the concepts two civilizations can share.

**If card six was right:** Fara’s notebook begins with the concepts neither side should pretend to understand.

**Natural obituary:** Fara dies surrounded by questions that have become considerably better questions.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## A4 — A Question With Room Inside It

**Era:** Several further centuries of delayed exchange  
**Prerequisite:** context_translator  
**Inventor:** Nemi Aro — Interstellar protocol designer  
**Personal want:** Make cooperation survive distance, uncertainty, and the deaths of its participants.

**Arrival:** Repeated eighty-year round trips have tested Fara’s translations. Both civilizations now propose a common way to exchange technical knowledge.

**Single invention:** `shared_protocol` — **Shared Inquiry Protocol**  
A verified bidirectional format for exchanging models, evidence, corrections, and bounded technical instructions across centuries.

### Cast

- `nemi` — **Nemi:** Protocol designer who measures progress in questions that will outlive her.
- `ves` — **Ves:** Engineer responsible for refusing unsafe instructions gracefully.
- `ula` — **Ula:** Historian of correspondence; remembers whose corrections made each success possible.

### Workbench progression

1. Centuries of correspondence
2. Shared message envelope
3. Sandboxed technical model
4. Verified bidirectional protocol
5. Successor-operated exchange
6. An unfamiliar diagram on the bench

### A4.1 — Opening

**Speaker:** Ves (`ves`)

**Situation:** A technical message must explain its assumptions before anyone follows its instructions. Their proposed format includes something we provisionally translate as conditions under which this advice becomes terrible. We should give that field a prominent position.

**Left: Put limitations before instructions.**  
**Result:** Every packet begins with assumptions, hazards, and limits. Readers encounter reasons to stop before reaching the exciting diagram with the moving parts.  
**Effects:** experimental exposure unchanged.

**Right: Put a test before instructions.**  
**Result:** Every packet begins with a bounded verification exercise. Assumptions and hazards remain attached, so a successful test never becomes permission to ignore them.  
**Effects:** experimental exposure unchanged.


### A4.2 — Experiment

**Speaker:** Ula (`ula`)

**Situation:** Old correspondence contains corrections written by people who died before anyone acknowledged them. Our protocol needs to preserve those corrections across institutions and centuries. We can organize packets around version histories or around claims and their supporting evidence.

**Left: Track every version.**  
**Result:** A clear revision history preserves retractions and changes of mind. Claims still carry evidence, preventing an obsolete instruction from surviving as anonymous wisdom.  
**Effects:** experimental exposure unchanged.

**Right: Track claims and evidence.**  
**Result:** Each claim retains its evidence, objections, and revisions. Version identifiers preserve sequence, allowing successors to distinguish a useful correction from a fashionable misunderstanding.  
**Effects:** experimental exposure unchanged.


### A4.3 — Complication

**Speaker:** Ves (`ves`)

**Situation:** Both sides have already exchanged draft formats over several generations. Their latest packet includes a harmless physical model and an intentional error to locate. Our tests must show we can identify the error without trusting the sender’s explanation.

**Left: Run independent model checks.**  
**Result:** Independent teams identify the same dimensional inconsistency and recover the intended correction. Their reports match the sender’s sealed explanation without using it as guidance.  
**Effects:** experimental exposure unchanged.

**Right: Rebuild the bounded experiment.**  
**Result:** A small controlled experiment exposes the inconsistency without dangerous effects. Independent analysis recovers the correction and agrees with the sender’s separately encoded explanation.  
**Effects:** experimental exposure unchanged.


### A4.4 — Proof

**Speaker:** Ula (`ula`)

**Situation:** An incoming acknowledgement confirms their tests of our equivalent packet. Our ancestors sent it eighty-three years ago. With both directions independently verified, we can adopt the shared inquiry protocol through a public demonstration or an open technical release.

**Left: Hold the public demonstration.**  
**Result:** You demonstrate both independently verified exchanges and their complete timing records. The shared inquiry protocol becomes a working bridge maintained by people on either end.  
**Effects:** experimental exposure unchanged.

**Right: Release the complete specification.**  
**Result:** Teams reproduce the verification from both sides’ records. The shared inquiry protocol becomes an invention others can implement without depending on its original authors.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `shared_protocol` after its result transaction. Show the invention reveal before A4.5.


### A4.5 — Adoption

**Speaker:** Ves (`ves`)

**Situation:** The protocol works. Now we must choose its first sustained use: exchange answers to carefully bounded questions, or exchange useful discoveries with enough evidence to evaluate them. Either programme will be tended by people we will never meet.

**Left: Establish a question programme.**  
**Result:** Institutions adopt a patient cycle of questions, tests, and corrections. Automated systems preserve the schedule while accountable human teams review every proposed experiment.  
**Effects:** experimental exposure unchanged.

**Right: Establish a discovery exchange.**  
**Result:** Institutions exchange bounded findings with reproducible evidence and explicit limits. Automated systems manage delays, while human successors decide which unfamiliar ideas deserve careful investigation.  
**Effects:** experimental exposure unchanged.


### A4.6 — Legacy

**Speaker:** Ula (`ula`)

**Situation:** A new packet arrives through the verified channel, answering a question sent generations ago. Its diagram combines principles we recognize into something nobody here can name. There is room on your bench. How shall we begin?

**Left: Build a harmless scale model.**  
**Result:** You clear the bench and mark the diagram’s limits. The first small component takes shape, made possible by hands scattered across centuries.  
**Effects:** experimental exposure unchanged.

**Right: First test the underlying principle.**  
**Result:** You clear the bench and isolate one testable claim. The first instrument takes shape, made possible by minds that never shared a lifetime.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** The next bench holds the first component of a carefully bounded model.

**If card six was right:** The next bench holds the first instrument for testing an unfamiliar principle.

**Final-life rule:** No obituary and no death roll. After card six’s result and callbacks, play this route’s ending panels, then its matching final-choice variant. The invention remains recorded.


## Ending — The Next Bench

Use five unhurried panels, advancing on Continue. Keep navigation available. These are not additional story decisions.

**Panel 1:** A signal crossed forty light-years. An answer crossed forty more. Neither journey hurried for anyone.

**Panel 2:** Inventors died. Their instruments, questions, corrections, and unfinished arguments passed into other hands.

**Panel 3:** Now a verified technical diagram rests on a workbench. Some principles are familiar. Their combination is not.

**Panel 4:** Beside it lie human tools whose makers never imagined this task, and notes from minds no human has met.

**Panel 5:** There is no name for the invention yet. There is enough knowledge to begin.

**After panel five, if A4.6 was left:** A small component settles into its jig. Somewhere beyond the light of forty years, another bench is waiting.

**After panel five, if A4.6 was right:** An instrument wakes. Its first reading will become a question that somebody else may live to answer.

Then add `reply` to `endingsSeen`, show the common credits and end navigation. Do not grant a second invention from an ending image.


# 14. Unmaking route

**Internal route ID:** `unmaking`

### Proposal copy

**Title:** A quiet interval  
**Pitch:** A resident needs relief from overwhelming sensory input without losing the parts of life they value. An architect proposes a room whose occupant controls what gets quieter.  
**Accept label:** Build the quiet room

**Author-only context:** All inner-environment and preference technologies here are fictional. They make no claims about real medical or psychiatric treatment.

**Author-only world rules:** Voluntary use only; independent review and refusal without loss of support; no employer, partner, family, or proxy enrollment. Early inventions remain selective, reversible, and separately useful. Permanent enrollment requires prolonged unpressured consideration outside all fields, repeated explicit consent, and a final independent authorization. Outside advocates retain protective duties; later silence never authorizes further procedures. The irreversible invention removes all wanting, including curiosity and reconsideration, while preserving memory, awareness, and felt contentment. Automatic care and unchanged caregivers maintain residents’ bodily needs. No children are enrolled.

**Viewpoint:** You remain the inventor, including in U4. You do not become Lume after the procedure. Lume’s lack of wanting does not remove the player’s agency as Sen, the unchanged observer.


## U1 — Room to Breathe

**Era:** The Distant Biological Age  
**Prerequisite:** C14: c14-invention  
**Inventor:** Eris Vale — Sensory architect  
**Personal want:** Give overwhelmed people a quiet interval without changing who they are.

**Arrival:** Computing and living medicine have made bodies adaptable. Suffering remains stubbornly personal. Existing care continues; a new device might offer an additional, voluntary kind of relief.

**Single invention:** `U1_invention` — **The Quiet Room**  
A fantastical environmental field that briefly lowers overwhelming sensory intensity while leaving memory, judgment, and desire intact.

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

**Situation:** My sister visited the prototype. I could see her telling a very good story. Unfortunately, your room treated her voice as a ventilation fault. I want less noise, Eris. I still want my sister.

**Left: Keep chosen voices clear**  
**Result:** Essa marks her sister’s voice as welcome. The field softens the machinery around it, and Essa finally hears why the wedding cake was buried.  
**Effects:** experimental exposure unchanged.

**Right: Give Essa an intensity control**  
**Result:** Essa lowers the field until conversation returns. You lose your perfect silence and gain your first useful afternoon.  
**Effects:** experimental exposure unchanged.


### U1.2 — Experiment

**Speaker:** Sol (`sol`)

**Situation:** Your emergency switch is beautifully integrated into the wall. Unfortunately, nobody can find it while distressed. I have brought a large orange handle that will ruin your entire architectural argument.

**Left: Install the orange handle**  
**Result:** The room looks worse and becomes easier to leave. Sol photographs the handle for an unnecessarily triumphant presentation.  
**Effects:** experimental exposure unchanged.

**Right: Put control in their hands**  
**Result:** Each visitor receives a control bead. Releasing it ends the field, even if every other system is still running.  
**Effects:** experimental exposure unchanged.


### U1.3 — Complication

**Speaker:** Essa (`essa`)

**Situation:** The room works until I stand up. Then the quiet follows me into the corridor and silences the kettle. Sol has spent ten minutes waiting for tea that is already furious.

**Left: Anchor the field to the doorway**  
**Result:** Crossing the threshold ends the field. Essa can leave without carrying silence into the rest of her life; Sol rescues the kettle.  
**Effects:** experimental exposure unchanged.

**Right: End it when the bead is released**  
**Result:** Essa puts down her control bead and ordinary sound returns immediately. You test the release again with wet hands, tired hands, and Sol’s unnecessary oven gloves.  
**Effects:** experimental exposure unchanged.


### U1.4 — Proof

**Speaker:** Sol (`sol`)

**Situation:** The field has passed independent tests. Volunteers can end it immediately, recall everything, and disagree with us afterward. Essa disagrees about the curtains. I am accepting that as particularly strong evidence.

**Left: Publish the complete design**  
**Result:** Independent builders reproduce the quiet field. You have invented the Quiet Room, with open controls and instructions for leaving.  
**Effects:** experimental exposure unchanged.

**Right: Certify small local workshops**  
**Result:** Local workshops reproduce the quiet field under inspection. You have invented the Quiet Room, with consent checks in every installation.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `U1_invention` after its result transaction. Show the invention reveal before U1.5.


### U1.5 — Adoption

**Speaker:** Essa (`essa`)

**Situation:** The first public room has a waiting list. The council wants to reserve afternoons for productive citizens. My neighbour spends her afternoons caring for someone the council has never bothered counting.

**Left: Use an ordinary queue**  
**Result:** Access follows arrival rather than employment. Some officials complain that equality is terribly inefficient when they are the ones waiting.  
**Effects:** experimental exposure unchanged.

**Right: Fund more neighbourhood rooms**  
**Result:** You spend your reserves opening smaller rooms nearby. Access improves, while you postpone the comfortable retirement your accountant keeps sketching.  
**Effects:** experimental exposure unchanged.


### U1.6 — Legacy

**Speaker:** Eris (`neri`)

**Situation:** I have spent my life making an interval of relief available. The archive asks what future inventors should inherit first: the mechanism itself, or the accounts of people who used it.

**Left: Leave the mechanism open**  
**Result:** Your complete plans enter the commons. Later inventors can reproduce relief cheaply, provided they also read the attached consent requirements.  
**Effects:** experimental exposure unchanged.

**Right: Leave the visitors’ accounts**  
**Result:** Consenting visitors describe what relief allowed them to do. Future inventors inherit purposes and limits alongside the working technical plans.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** Open Quiet Room plans circulate among public workshops.

**If card six was right:** Visitor accounts become essential reading for designers of voluntary relief.

**Natural obituary:** Eris dies many years later, with the room switched off and a window open.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## U2 — Weather You Can Leave

**Era:** The Age of Inner Environments  
**Prerequisite:** U1_invention  
**Inventor:** Olan Sere — Inner-environment engineer  
**Personal want:** Let consenting adults briefly adjust an emotional state, then return unchanged.

**Arrival:** Centuries later, a speaker’s account of the Quiet Room reaches Olan: she could finally hear her own thoughts, but every thought still predicted disaster. Olan begins building temporary emotional weather.

**Single invention:** `U2_invention` — **The Weather Dial**  
A voluntary, time-limited mood field with automatic return to baseline and an independent physical stop.

### Cast

- `olan` — **Olan:** Inventor who labels every control twice.
- `mira` — **Mira:** Volunteer who insists on keeping her inconvenient opinions.
- `dev` — **Dev:** Independent observer responsible for reversibility.

### Workbench progression

1. Quiet Room diagram
2. Baseline recording prism
3. Timed dial
4. Verified reversible field
5. Public supervised salon
6. Dial locked in archive

### U2.1 — Opening

**Speaker:** Mira (`mira`)

**Situation:** My sister is coming to my speech. I would like an hour without expecting the ceiling to collapse. I would still like to care whether the speech is good. Can your machine separate those?

**Left: Separate dread from purpose**  
**Result:** The temporary field lowers Mira’s anticipatory dread while leaving her commitments intact. She rehearses, then asks why the second paragraph is so bad.  
**Effects:** experimental exposure unchanged.

**Right: Let Mira set a narrow limit**  
**Result:** Mira chooses one sensation to soften and leaves the rest untouched. She still cares deeply about the speech, and now has room to practise it.  
**Effects:** experimental exposure unchanged.


### U2.2 — Experiment

**Speaker:** Dev (`dev`)

**Situation:** The return mechanism currently depends on the same system that creates the field. I prefer my parachute not to be a persuasive speech delivered by the thing that broke.

**Left: Build a separate return circuit**  
**Result:** An independent circuit restores the recorded baseline at the deadline. Dev finally permits the prototype to approach an actual person.  
**Effects:** experimental exposure unchanged.

**Right: Use a passive expiry crystal**  
**Result:** The field fades when its physical crystal expires. Extending a session requires leaving the field and giving fresh consent outside it.  
**Effects:** experimental exposure unchanged.


### U2.3 — Complication

**Speaker:** Mira (`mira`)

**Situation:** Your cheerful rehearsal setting worked. I enjoyed every minute. My sister says I thanked the audience for coming four times and forgot to say what they came for. Can I please remain disappointed when appropriate?

**Left: Keep judgment outside the field**  
**Result:** Mira spots the missing argument while the narrow field remains active. She rewrites her speech and retains her entirely justified dislike of the refreshments.  
**Effects:** experimental exposure unchanged.

**Right: Use short rehearsal intervals**  
**Result:** The field expires between passages. Mira assesses each one with her ordinary feelings restored; the speech improves without requiring her to enjoy its faults.  
**Effects:** experimental exposure unchanged.


### U2.4 — Proof

**Speaker:** Dev (`dev`)

**Situation:** Every participant has returned to baseline, retained their memories, and successfully refused another session. An external team reproduced the results. The device is ready, provided your marketing department learns the word temporary.

**Left: Release supervised public dials**  
**Result:** The Weather Dial becomes a verified invention. Public operators provide voluntary temporary adjustments, automatic return, and a stop anyone can reach.  
**Effects:** experimental exposure unchanged.

**Right: Release personal timed dials**  
**Result:** The Weather Dial becomes a verified invention. Personal units enforce short sessions, independent expiry, and a fresh decision before each use.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `U2_invention` after its result transaction. Show the invention reveal before U2.5.


### U2.5 — Adoption

**Speaker:** Mira (`mira`)

**Situation:** A factory wants to make cheerful settings part of the morning shift. Workers can technically refuse, says the manager, while standing beside a list of people whose contracts expire next week.

**Left: Ban employment requirements**  
**Result:** Your licensing terms forbid compelled use. The factory cancels its order, and several workers send a card without signing their names.  
**Effects:** experimental exposure unchanged.

**Right: Give workers independent oversight**  
**Result:** Workers receive enforcement power and outside reporting channels. You spend exhausting months defending the arrangement against increasingly creative managerial interpretations.  
**Effects:** experimental exposure unchanged.


### U2.6 — Legacy

**Speaker:** Olan (`olan`)

**Situation:** The archive offers space for one exhibition around the complete plans. We can show the range of feelings people explored, or the return mechanisms that let them safely come back.

**Left: Celebrate emotional range**  
**Result:** The exhibition presents temporary exploration alongside ordinary joy, grief, anger, and care. No emotion is declared a defect in need of removal.  
**Effects:** experimental exposure unchanged.

**Right: Celebrate the way back**  
**Result:** The exhibition makes reversibility its centerpiece. Future inventors inherit working mood technology and a conspicuous record of why its exits mattered.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** Voluntary emotional exploration becomes a respected, limited practice.

**If card six was right:** Automatic return becomes a celebrated principle of inner-environment design.

**Natural obituary:** Olan dies in old age after declining a final session, wanting an ordinary evening.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


## U3 — The Shape of Enough

**Era:** The Age of Chosen Minds  
**Prerequisite:** U2_invention  
**Inventor:** Veya Renn — Preference-system designer  
**Personal want:** Let people suspend a chosen desire without silently replacing their values.

**Arrival:** Much later, Veya finds a Weather Dial beside a collection of miniature moons. Its owner has learned to enjoy a purchase calmly. They still cannot stop planning the next one.

**Single invention:** `U3_invention` — **The Preference Loom**  
A reversible, selective system for suspending explicitly chosen desires, with preserved memory, independent review, and automatic restoration.

### Cast

- `tavi` — **Veya:** Inventor who once spent twenty years collecting identical moons.
- `iren` — **Iren:** Volunteer who wants to stop wanting one more possession.
- `bea` — **Bea:** Consent auditor with authority to stop trials.

### Workbench progression

1. Annotated Weather Dial
2. Named desire thread
3. Restoration spool
4. Working selective loom
5. Consent and refusal stations
6. Uncut thread beside sealed proposal

### U3.1 — Opening

**Speaker:** Iren (`iren`)

**Situation:** I bought the first little moon with my husband. He is still here. He would quite like the table back. I enjoy that first moon; the other thirty-nine mostly make me want number forty-one.

**Left: Target acquisition alone**  
**Result:** The trial suspends the urge to acquire without touching affection or enjoyment. Iren and their husband eat at the table, surrounded by an unreasonable number of moons.  
**Effects:** experimental exposure unchanged.

**Right: Try one short suspension**  
**Result:** The impulse pauses, then returns on schedule. Iren remembers enjoying an evening without shopping and chooses to study the difference before another trial.  
**Effects:** experimental exposure unchanged.


### U3.2 — Experiment

**Speaker:** Bea (`bea`)

**Situation:** A client wants to remove the desire to leave an unhappy partnership. Their partner offered to pay and supplied all the answers. I have stopped the intake before anyone touched your machine.

**Left: Require independent private review**  
**Result:** Independent advocates assess requests without sponsors present. This application remains paused, and nobody loses access to ordinary support while waiting.  
**Effects:** experimental exposure unchanged.

**Right: Exclude externally sponsored requests**  
**Result:** You forbid another person from commissioning an edit. The client receives confidential support and retains every option, including leaving the partnership.  
**Effects:** experimental exposure unchanged.


### U3.3 — Complication

**Speaker:** Iren (`iren`)

**Situation:** The trial stopped me shopping. Then I wanted to show my husband the empty space on the table. Your monitor called that a replacement acquisition impulse. It is a conversation, Veya. We occasionally have those.

**Left: Separate sharing from acquiring**  
**Result:** You refine the named target. Iren keeps the wish to share an evening; the loom no longer mistakes every approach to another person for shopping.  
**Effects:** experimental exposure unchanged.

**Right: Restore and map the mistake**  
**Result:** The trial ends and all original preferences return. Iren helps trace the false match before agreeing to another narrow test. Their husband contributes a drawing of an actual table.  
**Effects:** experimental exposure unchanged.


### U3.4 — Proof

**Speaker:** Bea (`bea`)

**Situation:** Independent trials confirm selective suspension and complete restoration. Participants remember what they chose, can reconsider freely, and can decline renewal. This proves a limited invention; it does not justify removing every desire a person has.

**Left: Publish the selective loom**  
**Result:** The Preference Loom enters the public archive with strict boundaries. Suspending one named desire becomes possible without endorsing broader permanent intervention.  
**Effects:** experimental exposure unchanged.

**Right: License independently reviewed use**  
**Result:** The Preference Loom becomes available through independent review centers. Selective, reversible use is verified, while broader permanent editing remains expressly unproven.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `U3_invention` after its result transaction. Show the invention reveal before U3.5.


### U3.5 — Adoption

**Speaker:** Veya (`tavi`)

**Situation:** A future-project proposal would remove wanting altogether, permanently: ambition, longing, dissatisfaction, and the urge to investigate. It promises uninterrupted contentment. Once completed, its users would no longer want to reverse it.

**Left: Publish the danger plainly**  
**Result:** You document the irreversible loss of wanting without calling it treatment. Future volunteers must understand that contentment would also end self-directed seeking.  
**Effects:** experimental exposure unchanged.

**Right: Require an outside consent council**  
**Result:** An independent council demands explicit advance consent, alternatives, and a protected right to refuse. You exhaust yourself establishing its independence.  
**Effects:** experimental exposure unchanged.


### U3.6 — Legacy

**Speaker:** Bea (`bea`)

**Situation:** Your selective loom is finished. The permanent proposal can be preserved with a record of people who rejected it, or with a detailed account of its limits. Neither choice authorizes anyone to use it.

**Left: Preserve the refusals**  
**Result:** The archive includes people who value longing despite its pain. Their refusals become a protected precedent, never an obstacle to be corrected.  
**Effects:** experimental exposure unchanged.

**Right: Preserve the irreversible warning**  
**Result:** The archive states that removing all wanting cannot preserve the wish to reconsider. Future inventors inherit the warning beside the proposal.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** Refusal testimony accompanies the selective invention and the separate permanent proposal.

**If card six was right:** An explicit account of irreversibility accompanies the selective invention and the separate permanent proposal.

**Natural obituary:** Veya dies without choosing permanent contentment, still curious about the evening sky.

**Risk obituary:** Not reachable from this authored chapter. Use the natural obituary; do not add random hazards.


### REDIRECT.U3 — The next work

**When:** After U3’s full result and epitaph, before entering any new life. Always show, regardless of U3.6 side.  
**Speaker:** The Archive (`archive`).

**Situation:** The selective loom is complete. One path keeps people’s wishes and builds a life with fewer burdens. The other permanently ends wanting itself—including curiosity and the wish to reconsider. Your discoveries belong to both futures. Which work should the next inventor take up?

**Left: Build permanent contentment**  
**Result:** The permanent proposal passes to another inventor. People may still refuse it freely; those who choose it will lose wanting and seeking forever.  
**Transition:** `U4`. Store `REDIRECT.U3=left`; preserve all choices and inventions; grant no new invention.

**Right: Build lives with less burden**  
**Result:** The permanent proposal stays unbuilt. Another inventor turns toward easing the work of living. The Quiet Room, Weather Dial, and selective Loom remain available, with every earlier discovery preserved.  
**Transition:** `R1`. Store `REDIRECT.U3=right`; preserve all choices and inventions; grant no new invention.

On right, set route to `retirement` and `redirectedFromUnmaking=true`, reset life exposure, use R1’s alternate arrival, then play R1–R4. On left remain on `unmaking` and enter U4. No late surprise procedure.


## U4 — Nothing Missing

**Era:** The Far Future  
**Prerequisite:** U3_invention  
**Inventor:** Sen Aro — Architect of permanent contentment  
**Personal want:** Discover whether contentment can remain when wanting ends, without erasing the person who remembers wanting.

**Arrival:** Generations later, Sen opens the sealed proposal. Lume, an old friend who has considered it for years, asks whether it could preserve the feel of sunlight without the wish for a different afternoon. Sen begins with an empty chamber.

**Single invention:** `U4_invention` — **The Stillness Engine**  
A fictional, voluntary permanent transformation that ends wanting and seeking while preserving awareness, memory, and felt contentment. Independent advance consent, protected refusal, outside advocates, and continuing bodily care are mandatory.

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

**Situation:** Lume, you will remember Sen. You will not wish to see Sen again. You will not want to reverse this. Take as long as you need outside the chamber. Your home and support remain yours if you leave.

**Left: Begin with the lives still available**  
**Result:** Lume spends a long interval exploring reversible alternatives, then returns for repeated independent review. Several other applicants leave. No one loses support, and no change is authorized until the final unpressured decision.  
**Effects:** experimental exposure unchanged.

**Right: Begin with what cannot return**  
**Result:** Ada explains every permanent loss, including curiosity and reconsideration. After a long interval outside all fields, Lume repeats their choice independently. Others refuse freely. Final authorization remains necessary before the chamber can run.  
**Effects:** experimental exposure unchanged.


### U4.2 — Experiment

**Speaker:** Lume (`lume`)

**Situation:** This picture is from the sea wall. I remember the cold rail, and you dropping our lunch. Your model has filed the whole afternoon under things I wanted. I would like you to separate the memory before you touch anything.

**Left: Separate recollection from pursuit**  
**Result:** In a non-conscious test model, Sen separates the stored scene from its pursuit signals. The memory remains readable when those signals stop. No person undergoes the permanent procedure.  
**Effects:** experimental exposure unchanged.

**Right: Test recognition independently**  
**Result:** An isolated memory prism retains the scene’s details as the model’s wanting circuits fall silent. Sen checks it against Lume’s account, including the lunch neither of them recovered.  
**Effects:** experimental exposure unchanged.


### U4.3 — Complication

**Speaker:** Sen (`sen`)

**Situation:** The empty chamber passes its retention tests. But its field still reaches the attendant’s chair, and residents will no longer seek food or help. Before anyone enters, the boundary and the care system must work without a resident asking.

**Left: Build a passive containment shell**  
**Result:** The shell confines the field even during a power fault. Separate automatic care sustains bodily needs; independent attendants test every alarm. Unchanged outside advocates retain protective authority, never permission to expand the procedure.  
**Effects:** experimental exposure unchanged.

**Right: Interlock the field with care systems**  
**Result:** The chamber cannot start without verified containment and independent care. Fault tests show no exposure outside it. Outside attendants remain unchanged and responsible for continuing care; later silence cannot authorize anything new.  
**Effects:** experimental exposure unchanged.


### U4.4 — Proof

**Speaker:** Ada (`ada`)

**Situation:** The containment and care tests hold. Independent checks support preservation of memory and awareness. Lume has given final authorization after another interval away. The transformation cannot be undone. We can record its proof privately or with the observers Lume approved.

**Left: Keep the proof private**  
**Result:** The Stillness Engine completes Lume’s authorized transformation with only the care team present. Memory and awareness remain; wanting and seeking end permanently. Independent instruments record the result without opening the room to visitors.  
**Effects:** experimental exposure unchanged.

**Right: Admit the approved observers**  
**Result:** Lume’s chosen observers witness the authorized transformation. The Stillness Engine preserves awareness and memory while permanently ending wanting. The observations establish the limited result; they grant no authority to transform anyone else.  
**Effects:** experimental exposure unchanged.

**Proof rule:** Either choice permanently commits `U4_invention` after its result transaction. Show the invention reveal before U4.5.


### U4.5 — Adoption

**Speaker:** Sen (`sen`)

**Situation:** Lume recognizes me. When I show the sea-wall picture, they remember the cold rail. When I leave, they do not ask when I am coming back. There is room beside their chair. I still have to decide what to do with mine.

**Left: Keep visiting**  
**Result:** Sen continues visiting, without treating recognition as a request or silence as permission. Independent care continues. Outside the small voluntary settlement, people keep their wishes and pursue other futures.  
**Effects:** experimental exposure unchanged.

**Right: Let the visits find a new rhythm**  
**Result:** Sen arranges continuing independent care and visits less often. Lume’s comfort does not depend on Sen staying. Beyond the settlement, unchanged people keep building, arguing, and choosing their own lives.  
**Effects:** experimental exposure unchanged.


### U4.6 — Legacy

**Speaker:** Sen (`sen`)

**Situation:** Something pale moves beyond the garden, against the wind. Lume follows it with their eyes. Once we would have spent the afternoon finding out what it was. I am beside the window. Lume is still watching.

**Left: Keep the window open**  
**Result:** Sen leaves the window open. Lume remains aware of the unfamiliar movement and feels no impulse to discover its cause. The shape passes out of sight.  
**Effects:** experimental exposure unchanged.

**Right: Leave the recorder running**  
**Result:** Sen leaves the observation recorder running for someone outside. Lume notices its light and feels no impulse to examine what it captured.  
**Effects:** experimental exposure unchanged.

### Closing record

**If card six was left:** An open window remains between the quiet settlement and a world that continues changing.

**If card six was right:** An unattended record waits for curious people beyond the settlement.

**Final-life rule:** No obituary and no death roll. After card six’s result and callbacks, play this route’s ending panels, then its matching final-choice variant. The invention remains recorded.


## Ending — Nothing Missing

Use five unhurried panels, advancing on Continue. Keep navigation available. These are not additional story decisions.

**Panel 1:** The garden receives another season of light.

**Panel 2:** People beyond the settlement continue making things. Some arrive to visit. Most leave again.

**Panel 3:** Inside, memory remains. Faces are recognized. Warmth is felt.

**Panel 4:** Something unfamiliar moves beyond the garden. A resident notices it.

**Panel 5:** There is no urge to find out why.

**After panel five, if U4.6 was left:** The window stays open. The unfamiliar shape disappears beyond its frame, unpursued.

**After panel five, if U4.6 was right:** The recorder saves the unfamiliar shape. Somewhere outside, someone may one day choose to watch.

Then add `unmaking` to `endingsSeen`, show the common credits and end navigation. Do not grant a second invention from an ending image.


# 15. Complete conditional callback registry

Every row is exact additional result copy. No matching prior side means no line. These callbacks do not replace the main result.

### Callback 01

**After:** `C02.1`  
**Only if:** `C01.6 = right`  
**Text:** A travelling ember carrier brought heat to this settlement. Now the carrier itself needs improving.

### Callback 02

**After:** `C03.1`  
**Only if:** `C02.5 = right`  
**Text:** The great communal jar concentrated the food and the rot. Your first trial uses a very small pot.

### Callback 03

**After:** `C04.4`  
**Only if:** `C03.5 = left`  
**Text:** Shared preserved stores make it possible to reserve seed without asking hungry people to live on a promise.

### Callback 04

**After:** `C05.1`  
**Only if:** `C04.6 = right`  
**Text:** The labelled seed pouch is here. Its old marks tell you which variety survived, but not everything its maker knew.

### Callback 05

**After:** `C06.1`  
**Only if:** `C05.5 = right`  
**Text:** A trained archive reader found the alloy recipe. Their careful copy is already acquiring workshop burns.

### Callback 06

**After:** `C07.2`  
**Only if:** `C06.5 = left`  
**Text:** A shared metal gauge lets another workshop make pieces that fit your press. Its inventor never saw a printed page.

### Callback 07

**After:** `C08.1`  
**Only if:** `C07.5 = left`  
**Text:** Open printing spread both books widely. It also makes distributing a correction possible, should you earn one.

### Callback 08

**After:** `C09.4`  
**Only if:** `C08.6 = right`  
**Text:** The verification kit contains an old crossed-out claim. Nell copies that habit into the pump manual.

### Callback 09

**After:** `C10.5`  
**Only if:** `C09.5 = left`  
**Text:** A shorter shift has already changed local evenings. The lamps make the returned hours useful after sunset.

### Callback 10

**After:** `C11.2`  
**Only if:** `C10.6 = right`  
**Text:** Lea’s notes distinguished useful signals from unwanted spill. Sol borrows the distinction for a different kind of interference.

### Callback 11

**After:** `C12.3`  
**Only if:** `C11.2 = left`  
**Text:** Telecommunication checks inspire a way to detect damaged data. A message does not have to travel far to arrive wrong.

### Callback 12

**After:** `C13.2`  
**Only if:** `C12.5 = right`  
**Text:** The tested program library includes examples of failure. Ren says those are the most educational colleagues the machine has.

### Callback 13

**After:** `C14.3`  
**Only if:** `C13.5 = left`  
**Text:** Worker-controlled automation provides a precedent. Residents ask why living somewhere should give them less say than working there.

### Callback 14

**After:** `S1.6`  
**Only if:** `C05.5 = left`  
**Text:** The open writing tradition gives Mira a ready language for sharing the model’s workings.

### Callback 15

**After:** `S2.5`  
**Only if:** `C13.5 = left`  
**Text:** Worker-controlled automation provides a precedent: the people doing the work should have a say in its terms.

### Callback 16

**After:** `S4.3`  
**Only if:** `S3.6 = left`  
**Text:** Tala’s unfamiliar flower appears in your notes beside one instruction to yourself: leave room to be surprised.

### Callback 17

**After:** `D2.2`  
**Only if:** `C03.5 = left`  
**Text:** The shared preserved stores in the old histories become Samir’s model for emergency food: a reserve everyone can reach before permission becomes relevant.

### Callback 18

**After:** `D3.2`  
**Only if:** `C14.5 = left`  
**Text:** The open life-support records include repairs by people whose names nobody recorded. Avi copies their fixes into the ship’s workshop manual, where everyone can read them.

### Callback 19

**After:** `D4.5`  
**Only if:** `D2.6 = left`  
**Text:** The new station borrows the old habitat’s inscription: A place to live. After the distance they have crossed, the modest promise draws a crowd.

### Callback 20

**After:** `R1.1`  
**Only if:** `C13.5 = left`  
**Text:** The old worker-control charter is pinned beside the hatch. Its readers add a new line: a person who chooses no work still gets dinner.

### Callback 21

**After:** `R2.1`  
**Only if:** `C13.5 = right`  
**Text:** The accountable coordination protocols survive in the mesh. Anyone can inspect a decision or challenge an omission without losing access while the challenge is heard.

### Callback 22

**After:** `R4.5`  
**Only if:** `R3.6 = right`  
**Text:** Someone brings one of Kessa's public inspection kits to the new workshop. The case is worn smooth. Nobody has been required to use it in years.

### Callback 23

**After:** `A1.5`  
**Only if:** `C11.5 = left`  
**Text:** The open communication standards inherited from earlier inventors let observatories compare their records without rebuilding every instrument.

### Callback 24

**After:** `A3.5`  
**Only if:** `C07.5 = left`  
**Text:** The old tradition of open printing survives in the freely copied translation manuals. A correction can now travel farther than its author.

### Callback 25

**After:** `A4.6`  
**Only if:** `A2.6 = right`  
**Text:** Tovin’s response tests remain in the verification chain. A person who never heard an answer helped make this one trustworthy.

### Callback 26

**After:** `U2.1`  
**Only if:** `U1.2 = left`  
**Text:** A large orange handle appears on the Weather Dial prototype. Someone has carefully copied Sol’s least elegant contribution.

### Callback 27

**After:** `U3.2`  
**Only if:** `U2.5 = left`  
**Text:** The employment restriction survives in Bea’s handbook. An old protection against compelled cheerfulness now helps prevent compelled preference editing.

### Callback 28

**After:** `U4.1`  
**Only if:** `U3.6 = left`  
**Text:** Applicants read the preserved refusals. One closes the proposal and leaves. The advocate records that the safeguard worked.


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
