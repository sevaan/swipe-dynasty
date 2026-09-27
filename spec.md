# ONE BRIGHT IDEA

Game design and implementation specification — v1.0

Working title: One Bright Idea
Format: Mobile-first, single-player narrative invention game
Primary interaction: Choose between two approaches by swiping left or right
Tone: Darkly funny, occasionally moving, increasingly absurd
Design status: A unified direction to build and test. Rules are decided below; numerical balance targets remain subject to playtesting.

> **One life. One invention. Everyone else deals with it.**

(Written by Sevaan, Sep 26, 2026. This is the source of truth for the game. Decisions made since are recorded in `design-notes.md`.)

---

## 1. The game we are making

You are an inventor trying to solve a problem.

You make a series of decisions about an emerging invention: what to try, what to sacrifice, whose advice to trust, and when to ignore the smell.

You eventually leave behind something useful, dangerous, misunderstood, or impressively pointless.

Then you die.

The next inventor inherits a world changed by your work—and a problem you helped create.

Over successive lives, you move through an imagined history of technology, from early settlements to machines capable of changing history itself.

The player's goal is not to keep an individual alive indefinitely. It is to leave behind something worth discovering what happens next.

### The essential experience

A player should be able to describe a session like this:

> "I made pots so people could store food. Then the food went rotten, so my next inventor worked out preservation. That let everyone stockpile grain. Unfortunately, one person ended up controlling the stockpile. Now I'm trying to solve that."

The game must make those connections visible and playable.

It is not enough to attach a funny description to a collectible. An invention must change a later opportunity, decision, or consequence.

### The emotional rhythm

Curiosity → investment → commitment → unintended consequence → affection → death → recognition.

The death matters because the player has made something. The next life matters because that something remains.

---

## 2. The major decisions

These replace the earlier balancing-game structure.

| Area | Decision |
|---|---|
| Four survival meters | **Remove them.** They pull attention toward maintaining equilibrium rather than inventing. |
| Length of a life | **A finite working life**, generally 10–12 consequential decisions, with possible earlier death. |
| Immediate danger | **One clearly readable Danger track.** It is not a random death percentage. |
| Invention progress | **Visible observations and changing prototypes**, not invisible point accumulation as the main system. |
| Invention selection | **Authored experiment paths with explicit internal requirements**, not a random reward at death. |
| Breakthrough timing | **Guaranteed proof scene when ready**, rather than waiting for a lucky card draw. |
| Persistent consequences | **Permanent technological capabilities plus one featured inherited problem.** |
| Dice | **Cut from the core game.** Variation comes from situations, history, and decisions—not rolling to choose for the player. |
| Main presentation | **A changing object on a workbench**, not a procession of character portraits. |
| Family tree | **Replace with a causal history of inventors and inventions.** No genealogy simulation. |
| Separate surreal modes | **Cut as separate systems.** Strange encounters use the ordinary scene framework. |
| Runtime-generated writing | **Do not use it.** Ship authored, edited, testable content. |

The defining tradeoff is deliberate:

Less survival bookkeeping. More understandable causality.

---

## 3. Design principles

### 3.1 Every swipe expresses an approach

Avoid making one direction broadly mean "approve" and the other "reject."

The player should choose between methods, priorities, interpretations, or compromises.

> "The mechanism needs more power."
> **Improve the gearing.** ← → **Build a larger furnace.**

Both choices should have a rationale.

A choice is weak when one answer is obviously sensible and the other exists only to deliver a joke.

### 3.2 Show the work becoming something

The prototype changes as the player experiments.

A clay lump gains a rim. A vessel acquires a lid. A machine acquires a second flywheel. A computer acquires a suspiciously reassuring face.

The object is the visual record of the player's choices.

### 3.3 Surprise must follow evidence

The player need not predict every consequence. They should usually recognize the connection afterward.

The desired reaction is:

> "Of course that happened."

Not:

> "How could I possibly have known?"

### 3.4 Progress creates problems

Useful inventions must genuinely help. Otherwise, the game becomes a repetitive argument that doing anything is foolish.

But help changes behaviour, expectations, ownership, or scale.

A solution creates new possibilities. People exploit those possibilities. That produces the next story.

### 3.5 Complexity belongs behind the screen

The player sees a situation, an object, a small amount of context, and two choices.

They do not manage an inventory, assign workers, inspect a spreadsheet, or navigate a technology tree before every decision.

### 3.6 History is authored, not simulated without limits

The campaign has a designed sequence of eras and a bounded set of inventions.

Choices change how that journey unfolds, who benefits, which optional discoveries appear, and what problems dominate.

The game does not promise an unrestricted simulation of every possible civilization.

---

## 4. The core loop

A complete cycle is:

Inherit a problem → investigate → prove an invention → shape its legacy → die → see what survived.

There are three scales of play.

### Within a decision

Read a short situation. Inspect the two approaches and immediate danger effects. Swipe. See the prototype or situation change.

### Within a life

Develop one project, reach a result, and influence how it enters the world.

### Across lives

Build up useful capabilities, encounter the consequences of previous choices, and assemble the discoveries needed to advance an era.

There is no separate currency for "progress." The inventions are the progress.

---

## 5. The structure of one life

### 5.1 Arrival

Each inventor begins as an adult with a problem already worth solving.

The opening identifies:

- What the world inherited.
- What is currently going wrong.
- Why this inventor is getting involved.

For example:

> "Your predecessor made food last through winter. The village now has enough to survive. Unfortunately, most of it belongs to one man."

The opening choice begins the investigation. It is not a separate character-creation menu.

Names, appearances, and introductory details are generated from authored pools. Character traits are descriptive, not another system of numerical bonuses.

### 5.2 Investigation: six to eight decisions

The player explores a project through connected situations.

A project contains a small number of possible outcomes, usually one or two canonical inventions and associated failed versions.

After six investigation decisions, a qualifying project proceeds to its proof scene.

If it does not yet qualify, investigation continues for up to eight decisions.

After the eighth investigation decision, the project proceeds to proof regardless. Insufficient evidence produces a compromised result or failed invention—not an endless extension.

There is no random wait for the breakthrough card.

### 5.3 Proof: one decision

The proof scene resolves what the inventor has actually created.

Its two choices may:

- Complete the same invention with different legacies.
- Complete two different, supported outcomes.
- Complete a supported invention or take a clearly signalled speculative alternative.
- Resolve two different failed versions when the project never became viable.

An option cannot secretly grant a discovery whose requirements were not met.

The invention is committed at this point. Later choices cannot award a second invention or replace it with something unrelated.

### 5.4 Aftermath: three decisions

The question changes from:

> "What am I making?"

To:

> "What happens now that it exists?"

Aftermath decisions concern adoption, ownership, safety, access, scale, reputation, or resistance.

They can change the legacy package that will affect the next life.

They do not restart invention development.

### 5.5 Death and handoff

After the third aftermath decision, the inventor's working life concludes. The epilogue carries them to their death.

A low-danger inventor may retire, grow old, or die in an ordinary authored way. A high-danger inventor may have already died during a decision.

The game does not require the player to deliberately wreck a successful life to collect its result.

The life counter represents major episodes, not literal years. The closing scene clearly signals that the inventor is handing their work to history.

#### Normal length

Six to eight investigation decisions, one proof decision, and three aftermath decisions produce 10–12 choices.

Earlier death shortens the life.

#### Tutorial exception

The first life uses four investigation decisions, one proof decision, and three aftermath decisions: eight choices.

This is an authored onboarding configuration using the same engine—not a separate set of hidden rules.

---

## 6. Experiments and discovery

### 6.1 One active project

An inventor works on one active project at a time.

That project can branch, but the player is not maintaining several simultaneous research tracks.

A project begins as a practical ambition:

> Keep something dry.
> Move something heavy.
> Make a message survive its messenger.
> Get the machine to stop asking questions.

The final historical name may remain unrevealed until the epitaph, but the function of the emerging object should become increasingly clear.

Recognition is more important than preserving a surprise at all costs.

### 6.2 Observations replace hidden invention points

Important experiments add named observations.

For a durable vessel, these might be:

> **Holds its shape**
> **Survives heating**
> **Keeps water inside**

Internally, a discovery recipe checks for required observations and inherited technologies.

The player sees evidence in ordinary language, not a progress score such as "Pottery: 78%."

Observations are not spendable. They are facts established during this life.

A project should normally require no more than three essential observations. Additional descriptive changes can affect its appearance or legacy without becoming another puzzle checklist.

### 6.3 Experiments have understandable follow-ups

When a choice produces a specific problem, the game schedules its follow-up.

> You made the walls thinner.
> The next relevant scene concerns the vessel cracking.

The scheduler must not immediately abandon that situation for several unrelated requests.

This is how the player experiences causality rather than a shuffled questionnaire.

### 6.4 Failure should teach something

An experiment can fail while improving understanding.

> "The pot split in the fire. The sandier section survived."

That can establish useful evidence without pretending the experiment succeeded.

Danger and discovery are not opposites. A failed test may be informative; a successful demonstration may be dangerously irresponsible.

### 6.5 No unsupported "accidental invention" rewards

Accidental discoveries are welcome when the chain supports them.

Fermentation can emerge from stored food behaving unexpectedly. A new adhesive can emerge from an abandoned material experiment.

An unrelated invention cannot appear merely because the player happened to choose enough options tagged with a hidden category.

---

## 7. Danger, death, and fairness

### 7.1 The Danger track

Danger has six visible segments.

(Decided Sep 26, Sevaan: Danger is tracked but hidden. The screen shows no segments, no Danger changes and no Fatal marks. See `design-notes.md`.)

It starts at 0 each life. Reaching 6 or more causes death.

Ordinary choices typically change it by −1, 0, +1, or +2. Larger changes are reserved for clearly signposted situations.

Danger never falls below 0.

It represents the accumulated immediate hazards around this inventor: unstable equipment, exhausted assistants, volatile patrons, unsafe demonstrations, and similar threats.

It is not a measure of moral goodness.

### 7.2 Exact immediate consequences are visible

Both answers display their immediate Danger change.

When an answer would be fatal, it is marked Fatal before commitment.

The player can still choose it.

That may be worthwhile when the action completes a breakthrough or creates a desired legacy.

There are no hidden percentage rolls for ordinary success or death in the initial design. Randomness determines which eligible situations appear, not whether the same demonstrated action inexplicably succeeds this time.

### 7.3 Why take danger?

Dangerous approaches must offer a real reason to exist.

They may establish evidence faster, preserve a more ambitious project direction, create a more powerful legacy, or avoid handing control to someone else.

Safer options should not always be slower versions of the same outcome. They may alter what gets built or who benefits.

The tradeoff is between different futures, not simply "correct answer" and "reckless answer."

### 7.4 Fatal breakthroughs count

Resolve a valid invention commitment before resolving death from that same action.

An inventor who proves their machine works by standing in the wrong place still leaves behind the machine.

### 7.5 Death before proof

Every completed life receives exactly one contribution record.

Without a committed discovery, that contribution is a failed design related to the active project.

Examples:

> The Absorbent Cup
> The Indoor Bonfire
> The One-Use Bridge

A failed contribution cannot satisfy a technological prerequisite.

Repeated failures become named variants or reinventions. They do not inflate the count of unique discoveries.

This preserves the promise of one contribution per life without pretending there is an infinite supply of unique technologies.

---

## 8. The inheritance system

This is the most important system in the game.

Inheritance has two separate layers.

### 8.1 Technology: permanent capabilities

A discovered technology remains available for the rest of the current timeline.

It can:

- Make an answer possible.
- Replace an answer with a materially different approach.
- Change the consequence of an existing answer.
- Satisfy a later invention's prerequisite.
- Change a prototype's available components.

For example, pottery might enable an answer that uses sealed storage. Preservation might make a long journey feasible.

These are contextual capabilities, not an ever-growing row of passive percentage bonuses.

The interface surfaces a technology only when relevant:

> **Possible because of: fired vessels**

The player never has to equip it.

### 8.2 The featured inherited problem

Each life also begins with one featured problem inherited from previous events.

Examples:

> Everyone can store food. Nobody agrees who owns the storehouse.

> Messages travel instantly. So do the mistakes.

> Machines do all the work. Nobody knows how to repair the machines.

The featured problem affects the opening, a small set of scenes, and the approaches the next inventor considers.

It is not another meter.

### 8.3 Why only one featured problem?

An unlimited stack of active penalties would make causality difficult to understand and balancing expensive.

Older events remain in history and can return through callbacks. They simply do not all impose continuously active rules.

The game is following the current consequential problem, not asserting that every previous problem has vanished.

### 8.4 Legacy packages

Each successful invention ships with two authored legacy packages.

Each package defines:

1. How the invention is adopted.
2. The featured problem it creates or transforms.
3. One meaningful future decision change.
4. Its opening callback.
5. Its default epitaph variation.

Aftermath decisions can select or replace the pending package. The latest explicit selection wins.

When a selection changes, the interface says so. The player should not have to infer that a late choice silently overruled an earlier one.

Every invention has a default package so an early death during aftermath never breaks the handoff.

### 8.5 Failure does not erase the world's problem

When an inventor dies without a successful discovery, the existing problem normally remains.

The next life references the failed attempt and offers another approach.

A failed prototype may add flavour or a targeted callback, but it cannot magically resolve the problem or grant the next era.

### 8.6 Inheritance must appear quickly

Within the first three investigation decisions of the next life, the player must encounter a recognizable consequence of the previous contribution.

The opening should name or show its origin.

> **Because Mara invented fired vessels…**

This is not optional flavour. It is a core acceptance requirement.

---

## 9. Progression through history

### 9.1 Era structure

Each era contains five successful canonical discoveries:

Two required stepping stones, two optional discoveries, and one keystone.

The keystone requires the era's two stepping stones to have been completed by earlier inventors in the current timeline.

That establishes a minimum of three successful lives per era.

Optional discoveries provide alternate approaches, jokes, capabilities, and additional legacy problems. They are not mandatory completion padding.

### 9.2 Era advancement

An era advances only after its keystone inventor's life is finalized.

The sequence is:

Contribution recorded → epitaph → world transition → next inventor.

Do not switch eras midway through a living inventor's story.

### 9.3 Campaign map

This is an intentionally compressed, fictional history—not a claim about the actual chronology or sole inventors of real technologies.

| Era | Required stepping stones | Keystone | Optional discoveries |
|---|---|---|---|
| Stone | Durable vessels; preserved provisions | Seed store | Rope; fermentation |
| Farming | Controlled kiln; ore separation | Bronze casting | Irrigation; ledgers |
| Bronze | Standard measures; water channels | Public waterworks | Glass; locks |
| Classical | Reliable gearing; grain mill | Water-powered mill | Street lighting; vending machine |
| Medieval | Paper production; reusable type | Printing press | Windmill; spectacles |
| Renaissance | Pressure vessel; working piston | Practical steam engine | Telescope; umbrella |
| Industrial | Dynamo; electrical insulation | Power grid | Refrigeration; assembly line |
| Electric | Logic circuits; machine-readable instructions | Programmable computer | Radio; automatic doors |
| Computing | Learning systems; machine-readable goals | Autonomous coordinator | Recommendation feed; digital currency |
| Robots and AI | Closed-loop life support; autonomous construction | Self-sustaining habitat | Household robot; artificial companion |
| Space colonies | Precision timekeeping; spacetime probe | Time machine | Artificial-gravity recreation; memory archive |

The time machine opens the final authored ending sequence rather than another full era.

Full campaign content target: 55 successful canonical discoveries.

That is a scope decision, not an instruction to author all 55 before the first prototype is tested.

### 9.4 Preventing stalled progression

The game tracks which required capabilities are missing.

After two substantial lives without a new required discovery, opening situations prioritize a missing stepping stone.

It offers clearer opportunities. It does not award discoveries automatically.

Project hints should point toward an experiment:

> "Your containers survive the journey. Their contents do not."

They should not require a wiki or reveal a numerical recipe.

Refusing progress remains valid play. A player intentionally revisiting old work should not be forcibly advanced.

---

## 10. The opening experience

The first experience must demonstrate the entire game, including the second life.

### 10.1 First life: a vessel that lasts

The opening image is a practical failure: food and water leaking through an inadequate container.

The tutorial's decisions are authored so all branches reach a valid pottery contribution. They teach different approaches and produce different legacies.

The choices are not fake: they affect the prototype, Danger, and how the invention spreads. But the tutorial does not gamble away its central lesson.

#### Eight-scene tutorial outline

| Scene | Situation | Left approach | Right approach | Purpose |
|---|---|---|---|---|
| 1 | "The basket has retained almost everything except the water." | Line it with clay. | Make the whole thing clay. | Introduce the object and two approaches. |
| 2 | "The sides collapse when lifted." | Thicken the walls. | Reinforce the rim. | Show a visible construction change. |
| 3 | "The dried vessel becomes mud again in the rain." | Heat it beside the fire. | Put it inside the fire. | Introduce Danger and useful failure. |
| 4 | "The first test cracked. The smaller piece survived." | Try a gentler firing. | Build a hotter enclosure. | Establish the final observation. |
| 5 | "It holds water. People have begun bringing requests." | Make household vessels. | Build a communal store. | Commit pottery and seed the legacy. |
| 6 | "Everyone wants one immediately." | Teach others to make them. | Keep production under control. | Choose access and ownership. |
| 7 | "Someone has filled a vessel with damp grain." | Improve the lid. | Tell them to dry it first. | Establish the next practical problem. |
| 8 | "Your workshop has become an institution. They want your final advice." | "Share what works." | "Put someone in charge." | Finalize the legacy and close the life. |

The content implementation must reconcile each branch's observation and visual states. This outline is the writing contract, not a claim that all branch copy has already been authored.

The tutorial's Danger changes are bounded so it can demonstrate risk without accidental early termination.

### 10.2 First epitaph

The completed object becomes an exhibit.

The epitaph has three distinct pieces:

What you made.
How your life ended.
What people did with your work.

The joke must agree with the recorded events.

The player is not shown a generic "You died" failure screen.

### 10.3 Second life: food that survives storage

The next opening uses the actual pottery legacy.

For distributed household vessels:

> "Every home has a pot. Several homes have discovered new smells."

For centralized storage:

> "The village's food is safely stored in one place. This has made the rot remarkably efficient."

Both routes can lead toward preservation, but through different situations and social consequences.

### 10.4 Third life: planning beyond the next meal

After pottery and preservation, the seed-store project becomes available.

The player is now using both earlier contributions.

The prototype visibly includes a vessel. The text references stored provisions. One relevant answer is available specifically because preservation exists.

This third life is the first major proof that the game is about an accumulating history, not isolated anecdotes.

---

## 11. Choice design

Every scene needs a reason to exist.

Its main job should be one of the following:

Establish evidence, complicate an experiment, express inherited history, shape adoption, or close a character beat.

A joke alone is not sufficient justification for a repeated mechanical interruption.

### 11.1 Both answers should move something forward

Avoid:

> **Continue the interesting story.** ← → **Do nothing.**

Prefer:

> **Solve it by changing the object.** ← → **Solve it by changing who uses it.**

Not every decision needs a major branch. But it needs a distinct interpretation or consequence.

### 11.2 Consequence previews

Each choice has up to two short preview elements:

Immediate risk: Danger +1
Known implication: Keeps production centralized

Do not reveal the exact future punchline.

Do reveal a consequence the inventor could reasonably understand.

### 11.3 Choice variety without control variety

The same left/right interaction can support:

- Two materials.
- Two test methods.
- Two people to trust.
- Two explanations for a failure.
- Two uses for a discovery.
- Two approaches to its unintended consequences.

No additional gesture is needed to make the decisions feel different.

### 11.4 Avoid a universally optimal posture

"Always share," "always take the safer answer," and "always trust the assistant" should not solve every situation.

Sharing can spread repairs or spread a flawed design. Restricting access can protect people or concentrate power.

The game judges particular consequences rather than assigning a hidden morality score.

---

## 12. Interface and interaction

### 12.1 The main screen

The screen has five layers, in this order:

Context: Inventor, era, and current problem.
Object: The changing prototype.
Evidence: Up to three important observations.
Situation: The current short scene.
Choices: Two persistent, thumb-accessible answers.

Danger remains visible near the situation.

Life progress is shown as a small phase indicator—Investigating, Proving, Aftermath—with remaining decisions where relevant. It is not styled like another resource to optimize.

(Decided Sep 26, Sevaan: no phase indicator on screen, and the card with the object sits at the bottom under the thumb, with the situation above it. See `design-notes.md`.)

The object receives more visual prominence than any portrait.

### 12.2 Swipe behaviour

Dragging horizontally previews one answer.

Releasing beyond approximately 28% of the interaction area's width commits it. Returning toward the centre cancels.

This threshold is an initial tuning value.

There is no speed-based shortcut in the first implementation. An accidental flick should not bypass the deliberate commitment distance.

Vertical reading gestures must not commit horizontal choices.

### 12.3 Equivalent controls

Visible left and right buttons activate the same two outcomes.

(Decided Sep 26, Sevaan: the two buttons are the halves of the card's foot, at the bottom of the screen; dragging the card does the same. See `design-notes.md`.)

Keyboard controls and screen-reader actions use the same underlying decision function.

These are accessibility equivalents, not additional game actions.

A player should never be forced to perform a gesture they cannot comfortably make.

### 12.4 Input safety

A new scene requires a new input.

Holding a finger down through the transition cannot answer the following scene. Repeated keyboard events cannot commit multiple choices.

Previewing never changes state.

Both answer labels are readable before swiping; essential information cannot depend on hover.

### 12.5 Readability

Use readable body typography, not a decorative pixel font for paragraphs.

The interface must remain playable on a narrow phone with enlarged text. The scene body may scroll; the two choices must remain reachable.

Danger uses numbers or segments and labels, not colour alone.

Reduced motion removes movement without removing information.

Audio and haptics are optional reinforcement. Nothing essential is communicated only through them.

### 12.6 Between-life screens

After death:

Epitaph → one concise inheritance statement → next life.

The history archive is available but never forced between every life.

Do not interrupt the emotional handoff with three reward screens and a completion percentage.

---

## 13. Art and audio direction

### 13.1 Visual identity

A lovingly maintained museum of questionable human progress.

Use minimal pixel-art objects and small environmental scenes, paired with clean typography.

(Decided Sep 26, Sevaan: the objects and scenes are drawn in the flat vector style instead of pixel art. See `design-notes.md` and `content/art/README.md`.)

Each era changes the work surface, tools, materials, and ambient detail. The fundamental layout remains stable.

The presentation should feel like handling an evolving exhibit or inventor's notebook, not dealing from a deck of portraits.

### 13.2 Prototype construction

Each project uses a bounded set of authored visual states.

A starting target is six to twelve object states per project, supplemented by reusable overlays such as cracks, smoke, labels, braces, leaks, and warning lights.

Do not create a unique illustration for every possible combination of choices.

Every essential observation must correspond to either a visible change or a clear annotation.

### 13.3 Character presence

Characters appear as small figures, marginal portraits, notes, or voices beside the object.

They interrupt the work. They do not displace it.

Recurring roles can have descendants or era-specific equivalents. A familiar visual motif does not require the same ordinary person to survive thousands of years.

### 13.4 Audio

Sound should reward changes in materials and mechanisms.

A fired vessel rings differently. An unstable device rattles. A newly working engine finds a rhythm.

The epitaph receives a short pause and tonal change, not a loud failure sting.

Music is restrained enough to support reading. Humour should not require a musical cue explaining that a line was funny.

---

## 14. Writing and comedy bible

### 14.1 The comic premise

People are clever enough to improve their circumstances and consistently unprepared for what improvement permits.

The inventor is not always an idiot. Neither is everyone around them.

The strongest jokes come from conflicting reasonable desires.

### 14.2 Main comic engines

Literal solutions: The invention solves precisely the wrong version of the problem.

Scale: Something sensible for one household becomes disastrous when everyone adopts it.

Ownership: The person funding the invention misunderstands what they are purchasing.

Delayed recognition: A harmless detail returns generations later as an institution.

Confidence: A character becomes more certain as the evidence becomes less reassuring.

Use these engines to generate scenes. Do not rely on interchangeable absurd nouns.

### 14.3 Example voices

#### The practical assistant

Observant, underappreciated, increasingly specific.

> "It works. I have written down where not to stand."

#### The patron

Interested in usefulness, provided usefulness includes them.

> "A machine that saves everyone time. How much of the saved time belongs to me?"

#### The rival

Competent enough to be threatening and insecure enough to be funny.

> "A remarkable breakthrough. Very similar to the one I was about to announce."

#### The curator

Dry, concise, capable of affection.

> "The warning survived. Its location inside the machine was less successful."

The curator is a framing voice, not a source of constant commentary after every swipe.

### 14.4 Sentence budgets

Starting writing limits:

Scene body: usually 20–45 words.
Answer: usually 2–8 words.
Immediate result: usually 5–20 words.
Epitaph: usually 15–40 words.

These are editorial targets, not reasons to produce unnatural fragments.

### 14.5 Tonal boundaries

The humour targets decisions, institutions, ambition, and unintended consequences.

Do not treat historical people as intellectually inferior because their tools are simpler. Do not make disability, ethnicity, or poverty the default punchline.

Include genuine wonder and competent collaboration. Constant cynicism makes invention emotionally pointless.

Occasionally, something should work beautifully.

That makes it more affecting when the consequences arrive.

### 14.6 Callback discipline

A callback must add something.

First appearance: a person dislikes lids.
Second appearance: their descendants refuse lids.
Third appearance: an organization regulates the absence of lids.

Simply repeating the original line is not escalation.

Every callback must be gated by events that actually occurred.

---

## 15. History, endings, and replay

### 15.1 One history system

Store completed lives once.

Present three views of the same records:

Discoveries: What exists and what it enables.
Lives: Inventors, deaths, prototypes, and epitaphs.
Connections: Which contribution enabled or complicated the next.

The connection view is a causal chain, not a family simulation.

A useful entry reads:

> Fired vessels enabled preserved provisions.
> Preserved provisions made the seed store possible.

### 15.2 Timeline versus collection

Technologies exist within a timeline.

The broader collection records what the player has discovered across all timelines.

Starting again preserves discovered entries and endings but does not give a Stone Age inventor technology from a completed future.

An archive discovery is knowledge for the player, not an automatic capability for their next character.

### 15.3 Main ending

The time machine's inventor reaches an aftermath decision about what to do with the accumulated history.

The final choice offers two authored conclusions:

Intervene: Attempt to prevent the chain that produced the present, creating the paradox ending.

Leave a warning: Preserve the history and send back a message, producing the main completion ending.

These are authored conclusions with specific callbacks. They do not open an unrestricted timeline editor.

The current life's contribution is recorded before the ending resolves.

### 15.4 Pottery ending

Retain one deliberately modest secret ending: choosing to stop escalating.

Its opportunity appears during the aftermath of a pottery reinvention, when pottery already existed before that life.

The player can explicitly decide that this is enough.

The history archive hints at the route after the first pottery discovery. It is not an invisible random jackpot.

The ending celebrates a smaller world rather than calling the player a failure.

### 15.5 Surreal content

Geese, impossible visitors, and the Graveyard of Bad Ideas remain available as story material.

They do not receive separate currencies, controls, or progression modes.

An unusual encounter occupies ordinary scene slots and obeys the same invention and death rules.

This preserves the comic freedom without creating a second game.

---

## 16. Engineering architecture

### 16.1 Platform decision

Build the first playable as a static, mobile-first web game using HTML, CSS, and JavaScript modules.

No backend, account system, runtime framework, or runtime language model is required.

The engine must also run without the browser so simulations and automated tests exercise the actual game rules.

Native packaging is a later distribution task, not a prerequisite for discovering whether the game works.

### 16.2 State model

Use three explicit scopes.

#### Life state

Current inventor, project, observations, prototype appearance, Danger, investigation count, phase, committed contribution, pending legacy package, and current scene.

#### Timeline state

Current era, discovered technologies, featured problem, completed lives, relevant story flags, and pending ending.

#### Collection state

Discoveries across timelines, ending records, archived lives, settings, and tutorial completion.

No field may casually migrate between scopes.

### 16.3 Core content types

| Type | Required information |
|---|---|
| Scene | Stable ID, eligible phase, project or context, text, exactly two options, conditions, follow-up rules. |
| Option | Label, preview, Danger effect, observations, appearance changes, legacy selection, permitted transition. |
| Project | Opening context, candidate outcomes, essential observations, investigation scenes, proof variants, fallback results. |
| Invention | Canonical ID, prerequisites, recipe, visual result, capability, two legacy packages, epitaph rules. |
| Legacy package | Adoption description, featured problem, future decision modification, opening callback, defaults. |
| Era | Required discoveries, optional discoveries, keystone, opening pool, transition presentation. |
| Contribution | Inventor, committed result, original/reinvention/failed status, cause of death, legacy, causal references. |

Use stable IDs everywhere. Display text must never function as an identifier.

### 16.4 Declarative content

Conditions and effects use a small vocabulary.

Conditions can ask whether a technology exists, an observation has been established, a project is active, a phase matches, or a declared flag has a value.

Effects can change Danger, add an observation, change appearance, select a legacy, commit a result, or queue an ending.

Content cannot execute arbitrary JavaScript.

Writers work with structured scene records and a human-readable export. The exact authoring interface can evolve without changing runtime rules.

### 16.5 Scene scheduling

The scheduler follows explicit phase rules.

Proof and aftermath scenes cannot be displaced by random ordinary encounters.

Within investigation, priority is:

1. A required immediate follow-up.
2. A due inherited-history callback.
3. A project scene that can establish missing evidence.
4. Another eligible contextual scene.

Use seeded variation within eligible sets.

Prevent recent repeats and consecutive appearances by the same speaker where possible. These preferences cannot override hard prerequisites.

A small deck must still work. If mandatory content is missing, development builds report the error rather than disguising it with endless filler.

### 16.6 Atomic decision resolution

Every committed choice follows this order:

1. Validate that the action belongs to the displayed scene and has not already resolved.
2. Apply the selected effects.
3. Commit a valid proof outcome, when applicable.
4. Resolve Danger-based death.
5. If alive, advance the life phase or conclude the working life.
6. If the life ends, create exactly one contribution and publish its technology and legacy.
7. Select the next presentation state using the updated history.
8. Persist the complete result.
9. Animate and render.

The selected next scene and random-generator state are saved together.

Reloading cannot reroll the next scene or award the invention twice.

### 16.7 Persistence

Use versioned local storage with atomic snapshot replacement, preferably through IndexedDB transactions.

Keep the last valid snapshot.

Provide export and import.

A save failure must be visible. Do not imply that progress is secure when it is not.

A stale second browser tab cannot silently overwrite a newer game. Writes check an expected revision.

Content updates activate at a safe boundary. They must not replace the definitions behind a scene while that scene is awaiting input.

Local saves are not advertised as cross-device synchronization or permanent backup.

---

## 17. Content production and scope

### 17.1 Build project kits, not enormous trees

A project kit contains:

- Its candidate discovery recipes.
- Six to ten investigation scenes, with targeted variants.
- Proof scenes for viable and failed outcomes.
- Three aftermath beats.
- Two legacy packages.
- Prototype states.
- Epitaph and callback rules.
- A successful test trace and failure traces.

Branches should rejoin around established observations rather than multiplying forever.

The object and history preserve the important differences even when scene structure reconverges.

### 17.2 First-era content budget

The Stone Age quality slice targets:

Five project kits: two required, two optional, one keystone.

Approximately 40 project-investigation scenes, 10 proof variants, 15 aftermath scenes, and 10 opening/callback/context scenes.

That is approximately 75 authored scene records, with tutorial reuse where appropriate.

This is an initial budget. Repetition testing may require more; a raw count does not establish quality.

Four failed-design templates, with project-specific variants, provide early-death coverage without pretending each failure is a new technology.

### 17.3 Definition of a complete invention

An invention is not complete because its name and illustration exist.

It needs a playable discovery path, a valid failure path, a visible capability, two distinct legacy packages, a next-life callback, and tests.

An invention with no meaningful future consequence does not meet the content contract.

### 17.4 Full campaign production

After the first era is convincing, build a thin mechanically complete route through all eras.

Only then expand later-era writing and art.

This catches progression and ending failures before the team has polished hundreds of disconnected scenes.

---

## 18. Testing and acceptance criteria

### 18.1 Rules that must always hold

Every completed life has exactly one contribution.

No life commits two inventions.

A fatal proof action preserves a valid discovery.

A failed result never grants a required technology.

A keystone requires its actual prerequisites in the current timeline.

Each gameplay scene offers exactly two outcomes.

Preview and cancellation never mutate state.

Reloading never duplicates a choice, contribution, transition, or ending.

An era does not advance before its inventor's life is finalized.

These are automated assertions, not informal expectations.

### 18.2 Deterministic scenario tests

Maintain recorded action traces for:

Tutorial branches; early death; failed proof; successful proof; fatal proof; aftermath death; reinvention; legacy replacement; era advancement; both main endings; pottery ending; save recovery.

A successful trace proves that a route exists. It does not prove that every branch is fair or enjoyable.

### 18.3 Simulation

Simulate random play, cautious play, discovery-seeking play, legacy-seeking play, and deliberate refusal of progression.

Track life length, failure rates, repeated scenes, unreachable prerequisites, stalled eras, and callback delays.

A policy that can inspect hidden recipes is a diagnostic tool, not evidence that ordinary players will understand the game.

### 18.4 Human testing

The first meaningful playtest spans at least three connected lives.

Ask players to explain:

> What were you trying to make?
> Which choice changed the result?
> What did the previous inventor leave behind?
> Did that change what you chose next?
> What do you want to try now?

Do not lead with "Was it fun?" and treat a polite yes as validation.

A useful initial gate for an eight-person formative test is that at least six can identify a specific cross-life cause and effect without prompting. Treat this as a practical production gate, not a statistically reliable population estimate.

### 18.5 The differentiation test

Ask:

> "What were you doing in that game?"

A concerning answer is:

> "Trying not to fill the danger bar."

The desired answer is:

> "Trying to make something useful without leaving the next person an impossible mess."

---

## 19. Production plan

### Milestone 1: The causal prototype

Build the swipe interaction, object changes, observations, proof, one legacy handoff, and save/restore.

Use the pottery-to-preservation sequence.

Exit condition: A player can recognize that their first contribution changed a decision in the second life.

Do not build the entire museum before this works.

### Milestone 2: The complete first era

Add all five Stone Age project kits, the seed-store keystone, failure coverage, and the first era transition.

Include a minimal history view.

Exit condition: Three connected lives are compelling, and repeated attempts reveal different approaches rather than obvious filler.

### Milestone 3: The full thin campaign

Implement all era prerequisites, small functional project sets, and endings with placeholder art where necessary.

Exit condition: A deterministic trace can complete the whole journey, and no required discovery depends on unavailable content.

### Milestone 4: Content and presentation

Expand writing, prototype art, character variation, legacy packages, and meaningful callbacks.

Exit condition: Each era has a distinct practical problem, material identity, and comic voice.

### Milestone 5: Release hardening

Test interrupted sessions, large text, narrow screens, input cancellation, content updates, save migration, import/export, and performance on actual phones.

Exit condition: The game survives ordinary mobile use without lost progress or accidental decisions.

Each milestone requires agreement across design, writing, UX, engineering, and production criteria. A visually polished scene does not pass when its legacy is mechanically empty.

---

## 20. Product boundaries

The prototype is free to test.

The intended finished product is a complete premium game, not an energy system or advertisement-supported death loop.

There are no paid resurrections, purchased research advantages, mandatory daily rewards, or monetized bad luck.

The exact commercial price is outside this design specification.

No multiplayer, crafting inventory, combat subsystem, simulated economy, arbitrary time travel, or procedural conversation engine is included.

Those features would compete with the central experience rather than strengthen it.

---

## 21. The biggest design risks

| Risk | Required response |
|---|---|
| Danger becomes the whole game | Make discovery and legacy meaningfully diverge from maximum safety. Do not reward survival as the primary score. |
| The final invention feels predetermined | Ensure experiments visibly establish evidence and support at least some different outcomes or legacy routes. |
| Inheritance feels cosmetic | Require a changed answer, available approach, or consequence in the next life. |
| Choices feel inscrutable | Improve previews and causal follow-ups before adding explanatory tutorials. |
| Every invention produces misery | Include real benefits, competent people, and moments of wonder. |
| Short lives feel disposable | Make objects and characters specific enough to care about; carry their work forward visibly. |
| Branching overwhelms production | Limit projects, observations, and legacy packages. Rejoin scenes without erasing consequences. |
| The campaign becomes repetitive | Change the problems and methods of each era, not just the nouns and artwork. |
| The epitaph becomes a reward chore | Keep the handoff brief, relevant, and free of redundant collection screens. |
| The game cannot explain its own history | Store causal references explicitly and use them in the interface. |

---

## 22. The final creative standard

A strong life should contain a moment when the player thinks:

> "I know what I'm trying to do."

A strong death should contain a moment when they think:

> "At least that part worked."

A strong next life should contain a moment when they think:

> "Oh. That was my fault."

Not every contribution needs to be catastrophic. Some should be beautiful. Some should be foolish. Some should be useful in ways their inventor never anticipated.

But something must survive the individual.

That is the game: not keeping four bars balanced, and not collecting inventions from a random deck.

You make things. People use them. History develops complications.
