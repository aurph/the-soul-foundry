# Make It Serious — Build Log

## 2026-06-20 — Phase 1: Iconography & de-emoji
**Did:**
- Generated two custom glyph sheets with Higgsfield (nano_banana, woodcut occult-folk
  style on charred-wood plaques): 12 action/tab glyphs + 8 more (rites, sound on/off,
  options, assign, close, objective, codex). 538 -> ~534 credits.
- Built `tools/slicesheet.js` (pngjs): slices the resource sheet
  (`kit/icons-sheet.png`, pure black) into 12 transparent, keyed, trimmed resource
  icons (`assets/ui/res/*.png`); slices the two glyph sheets into 20 square wooden
  button tiles (`assets/ui/glyph/*.png`).
- Added an icon system to the game: `ricon()` / `gicon()` helpers + CSS. Replaced
  every emoji: market 🏪, economy 📊, pause ❚❚, the rail's ▶ » ? ✦ ♪ ⚙, and the alert ⚠.
  Rail buttons are now wooden glyph tiles; dock tabs carry their category glyph.
- Resource chips in the top ledger now show the custom icon and are **clickable** ->
  `showResInfo(r)`: a codex card with the icon, what the resource is (RES_HELP), what
  makes it and what consumes it (derived live from the building recipes), and stock.
  Bones uses the bone-coin icon and opens the market.

**Decisions:**
- Kept the glyph plaques' charred-wood backgrounds rather than keying them — they read
  as wooden buttons, which matches the UI direction better than floating symbols.
- Hid the mid-chain resources (bone-silica, ingot, wafer, die, core) from the ledger
  when zero, to cut clutter; dead/soul-ash/ichor/power/compute always show.
- Inline icon sizing 17-18px in the ledger; rail tiles fill the 40px buttons.

**Verify (real output):**
- `node tools/boottest.js` -> `=== all world-build steps ran ===`
- `node tools/sim3dtest.js` -> `=== 37 passed, 0 failed ===`

**Next:** Phase 1b — icons into the economy panel, shop, and building inspector.
Then Phase 2 (clickable everything + hover tooltips + 3D selection outline + a Codex
overlay), Phase 3 (tutorial spotlight). Also still owe: stump frowning mouth + the
last spawn boulders (folding into the husk/world polish pass).

## 2026-06-20 — Phases 2 & 3 (shipped, live)
**Phase 2 — clickable + explainable:**
- Resource codex card (showResInfo) from any resource chip; icons added to the economy
  panel, market, and building inspector (recipe/throughput/harvests).
- Hover layer: a tooltip names any husk/building/deposit you point at and says what it
  does/gives; ember selection ring + softer hover ring in 3D (driven in the loop).
- In-game Codex overlay (rail) listing every material (click-through) and building with
  its role/recipe. Husks/Dread ledger chips are clickable to their explanation.

**Phase 3 — tutorial spotlight:**
- Each step drives a pulsing GREEN spotlight onto its exact target: the gather tab, the
  specific building card (data-bld; falls back to the right tab when off-screen), the
  ledger, the quota banner; plus a green world-marker over the nearest cemetery for the
  place-the-Exhumer step. Per-frame positioning; panel rebuilds only on step change.

**Verify:** boottest `all world-build steps ran`; sim `37 passed, 0 failed`; live check
shows positionSpotlight/showCodex/hoverPick present and 0 target emoji remaining.

**Next:** Phase 4 controls overlay + placement readout; Phase 5 onboarding/feel.

## 2026-06-20 — Feedback batch (4 chunks, all shipped + live)
Owner gave 11 points; grouped into 4 deployable chunks, each boottest+sim green.

**Chunk 1 — models & spawn:**
- Reaper: shroud now drapes OVER the skeleton (robe + shoulders + hood, skull peeking,
  scythe-staff) instead of a cone with a spine sticking out.
- Reliquary Yard: redesigned as a server-reliquary (dark metal racks, glowing teal core
  + blade-lines, bone uprights with skulls), piles preserved.
- Building debris: 0-2 bits scaled 0.35-0.6x (never bigger than the building).
- Graves: spawn 22->13, field 60->34, + a 6.5-8u clearance so deposits never clip.

**Chunk 2 — payloads & building animation:**
- Husks carry the actual material (corpse bundle, powder heaps, coolant vial, wafer
  discs, ingot bar, dies, glowing cores/compute, power spark), geometry+material swap.
- Crematory/Furnace/Ossuary emit rising fading smoke while active (render-only,
  Math.random, cleaned on demolish/load). (Husk work-animation already existed.)

**Chunk 3 — clarity:**
- Soul-ash reframed as husk UPKEEP everywhere (bar renamed Condition, turns red when
  low; alert/codex/tutorial unified, "patch/resolve" jargon gone).
- Tempo buttons: active one ember-highlighted, help shows current tempo + each option's
  timing, picking one toasts exact grace seconds + refreshes the panel.

**Chunk 4 — supply-chain blueprint:**
- New rail button (custom blueprint glyph) -> The Line: visual corpse-to-Compute
  blueprint, 8 steps with input->output icons and live red/amber/green status dots,
  tap a step to jump to that building.

**Verify:** boottest `all world-build steps ran`; sim `37 passed, 0 failed`; live shows
showSupplyChain/payloadSpec/animateSmoke present, blueprint.png 200, 0 emoji.
Higgsfield: ~533 credits (used ~1 for the blueprint glyph).

**Deferred (noted, not yet done):** none outstanding from this batch. Future polish:
more building model variety/textures, deeper husk work anims per job, methodology page.

## 2026-06-22 — Caste chain-role specialization (full build, TDD, live)
Differentiate the three castes by their ROLE IN THE DEATH-TO-COMPUTE CHAIN (not
AtS-style needs/happiness), turning assignment into a supply-chain puzzle.

- **Phase 1 — Affinity:** AFFINITY table + affinity() scales refine/render/compute
  speed by worker mix. Reapers render best (Crematory/Litho/Ossuary/Datacenter),
  Stumps extract (Exhumer/Dredge + big CARRY/GRATE) and are crude at fine work,
  Husks are generalists. Production prog scales by avg worker affinity. (+4 tests)
- **Phase 2 — Capex:** per-caste bind costs at the Pyre — Husk 1 corpse+2 Compute,
  Stump 2 corpses+1 Compute (cheap/slow), Reaper 1 corpse+4 Compute (dear/skilled).
  Pyre UI = three bind buttons with cost + role. (+3 tests)
- **Phase 3 — Opex:** Reapers need no soul-ash and self-sustain (payoff for the high
  bind cost); Husks baseline, Stumps a touch more. Upkeep drain scales by who's
  bound (UPKEEP table). (+4 tests)
- **Phase 4 — UI:** husk inspector shows Specialty + suited-to-current-job %;
  building inspector shows best caste + crew efficiency %; Codex gains a caste legend.

Verify: boottest clean; sim 48/48 (was 37). Why-not-AtS: specialization is by chain
stage + capex/opex, not food/housing/happiness; no needs system added.

## 2026-06-22 — Challenge Edition Phase 1 (full TDD build, shipped)
Brainstormed (subagent integration brief + owner forks) -> spec -> subagent plan ->
10-task TDD build. Timed shareable mode alongside the campaign.
- Mode system: G.mode + MODES config + modeCfg(); campaign byte-compatible (absent=campaign).
- Score tallies: computeRendered / deadRendered / husksBoundRun / peak Compute-min.
- Clock: countdown banner, time-up endChallenge; quota + basePressure suppressed in challenge.
- Very hard to lose: Dread soft-throttles output (min 0.35), no breach/extinction end.
- Blended score (computeScore, weights as consts) + live banner.
- URL ?mode/seed/dur parse + start() routing; seedWorld determinism (same seed = same score).
- Mode picker (Campaign/Challenge + 10/20/30 + seed), end screen (score breakdown, local
  best per dur, share/Retry/Again), autosave gated to campaign (never clobbers sf_save).
- Phase 2 (Neon Postgres + Cloudflare Worker leaderboard) deferred per spec.
Verify: sim3dtest 83/83 (was 48), boottest clean. Campaign quota/breach/save regressions
all still green. Determinism a==b. End-to-end 30s run ends on clock with score.
