# Soul Foundry Economy Rebuild — Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans or subagent-driven-development to implement task-by-task. Steps use `- [ ]` checkboxes.

**Goal:** Replace the borrowed forage-and-warmth economy with a native one — the dead, rendered up a chain that mirrors the real semiconductor → datacenter → Compute supply chain — plus bound-not-born population, player-set tempo, building throughput/refunds, and a wooden low-poly-twig spooky UI.

**Architecture:** Single self-contained `game/index.html`. The sim stays deterministic (fixed 1/30s step, seeded RNG) and rendering stays separate so `tools/sim3dtest.js` keeps driving it headless. We re-theme and rewire the data tables (RES / NODE / BLD / recipes), then layer population, pacing, and UI. Game stays playable and tests stay green after every task.

**Tech Stack:** Three.js r128 (vendored), classic script, Node headless test harness, Higgsfield for new art.

## Global Constraints

- Single file `game/index.html`; classic `<script>` only (must run from `file://`).
- Deterministic sim: fixed 1/30s timestep, seeded `mulberry32`; no `Math.random()` in sim — use `rnd()/rint()/rr()`.
- `node tools/sim3dtest.js` must pass after every task (extend it; never let it go red).
- Currency var stays `G.writ` internally (save-compat), displayed as "Bones".
- Aesthetic: PS1 low-poly, desolate wastes, white-on-black markers, no glow but faint ember; new UI = low-poly twigs, spooky, not cozy/parchment.
- Keep: build grid+ghost, save/load+autosave, audio (SND), stockpile-hub haul loop, start-paused, lose-clears-save, inspector, alert line, world/biomes/megacity.

---

## New economy data (the concrete target)

**Resources** (`RES` id → name, col):
`dead`→Corpses `0x8a8170` · `bonesil`→Bone-Silica `0xb9b0a0` · `soulash`→Soul-Ash `0x8d8aa0` · `ichor`→Ichor `0x5fa0b0` · `ingot`→Silicon Ingot `0x9aa0a8` · `wafer`→Wafer `0x6fae9b` · `die`→Etched Die `0xb6c24a` · `core`→Reliquary Core `0xb25fae` · `power`→Power `0xe8a23a` · `compute`→Compute `0xe8d24a`. Currency: Bones (`G.writ`).
`RES_ORDER=["dead","bonesil","soulash","ichor","ingot","wafer","die","core","power","compute"]`

**Nodes** (`NODE`): `grave`→Cemetery (gives `dead`, renew 0.5, cute headstones) · `waste`→Corpse-Waste (gives `dead`, finite, larger).

**Buildings** (`BLD`): chain steps below, each `kind:"refine"` unless noted.
| key | name | kind | recipe in→out | workers |
|---|---|---|---|---|
| pyre | The Binding Pyre | bind | dead1+compute2 → (bind a husk) | 0 |
| exhumer | Grave-Exhumer | gather(grave→dead) | — | 3 |
| dredge | Waste-Dredge | gather(waste→dead) | — | 3 |
| crematory | Crematory | refine | dead2 → bonesil1+soulash1+ichor1 | 3 |
| furnace | Soul Furnace | refine | bonesil2+soulash1 → ingot1 | 3 |
| mill | Wafer Mill | refine | ingot1 → wafer2 | 3 |
| litho | Etch-Litho | refine | wafer1 → die1 | 3 |
| ossuary | Assembly Ossuary | refine | die1+soulash1 → core1 | 4 |
| substation | Substation | refine | soulash1 → power2 | 2 |
| datacenter | Spectral Datacenter | datacenter | core1+power1+ichor1 → compute3 | 5 |
| stockpile | Reliquary Yard | stockpile | — (hub + piles) | 0 |
| den | Bone Den | den | housing | 0 |
| ward | Ward Obelisk | ward | suppress backlog | 0 |
| market | Black Market | market | trade | 1 |
| path | Bone Path | path | — | 0 |

`crematory` is a multi-output recipe (out has 3 keys). Stockpile pile bins update to the new `RES_ORDER`.

---

## Task 1: Re-theme resources + nodes

**Files:** Modify `game/index.html` (RES, RES_ORDER, NODE, biome/node colors), `tools/sim3dtest.js` (new assertions).

- [ ] Step 1 (RED): in `sim3dtest.js`, after the chain test, assert the new resources exist: `ok("new resources defined", T.RES.dead&&T.RES.bonesil&&T.RES.core&&!T.RES.silica)`. Expose `RES` in `__T`. Run → fails (silica still defined / dead missing).
- [ ] Step 2 (GREEN): replace `RES` + `RES_ORDER` with the table above; replace `NODE` with `grave`+`waste` (both give `dead`). Update `makeNode` so `grave` renders cute leaning headstones/crosses/mounds and `waste` renders a heap of shrouded bodies.
- [ ] Step 3: run `node tools/sim3dtest.js` — fix references until the suite loads (it will surface every renamed key). Expect the chain test to now fail (recipes not rewired yet) — that's Task 2.
- [ ] Step 4: commit `feat: re-theme resources to the dead + chip-chain materials`.

## Task 2: Rewire the building chain + recipes

**Files:** `game/index.html` (BLD, BLD_ORDER, TABS, bldTab, multi-output handling in stepEconomy), `tools/sim3dtest.js`.

- [ ] Step 1 (RED): rewrite the chain assertions in `sim3dtest.js` to drive the new chain: build exhumer+dredge (gather dead), crematory, furnace, mill, litho, ossuary, substation, datacenter; place grave+waste nodes; staff all; run 5 min; assert `maxCompute>0` and intermediates (`ingot`,`wafer`,`die`,`core`,`power`) each peaked >0. Run → fails.
- [ ] Step 2 (GREEN): rewrite `BLD` per the table; set `BLD_ORDER`; ensure `stepEconomy` handles multi-output recipes (`for(const r in rec.out) addStock(...)` already loops — verify crematory's 3 outputs work). Gather posts now harvest `dead` from `grave`/`waste`.
- [ ] Step 3: confirm gatherers haul `dead` to the stockpile hub and refiners fetch/haul/tend as before (the existing hub loop is resource-agnostic — verify).
- [ ] Step 4: run tests → green (full new chain dead→…→compute). Fix `seedSettlement` to place the new starter set (exhumer+crematory + stockpile + pyre + den).
- [ ] Step 5: commit `feat: rewire foundry into the dead→chip→Compute supply chain`.

## Task 3: Population — bound, not born

**Files:** `game/index.html` (remove growth in `stepEconomy`; add `bindHusk()`; Pyre interaction; upkeep/decay), `tools/sim3dtest.js`.

- [ ] Step 1 (RED): assert `bindHusk` consumes a corpse + Compute and adds one husk, and that running the sim with thriving conditions does NOT increase population on its own. Run → fails.
- [ ] Step 2 (GREEN): delete the `G.grow` free-spawn block. Add `function bindHusk()` (needs `G.stock.dead>=1 && G.stock.compute>=2 && pop<popCap` → spend, `spawnVillager` near the Pyre). Add a slow decay: husk `resolve` drains unless upkeep (a trickle of `soulash`/`ichor`) is present; crumble at 0 (keep existing crumble).
- [ ] Step 3: wire the Pyre: selecting it shows a "Bind a husk (1 corpse, 2 Compute)" button → `bindHusk()`. `popCap` still from dens.
- [ ] Step 4: run tests → green (no free growth; binding works). Commit `feat: husks are bound from corpses, not spawned`.

## Task 4: Tempo, grace, win/lose

**Files:** `game/index.html` (title/tempo select, grace timer, backlog pressure replaces free Dread creep, win/lose), `tools/sim3dtest.js`.

- [ ] Step 1 (RED): assert tempo sets `G.quota.period` + dead-intake; assert no quota fires before `G.graceT`. Run → fails.
- [ ] Step 2 (GREEN): add `G.tempo` (slow/standard/harsh) chosen at start (buttons on the help/title overlay) → sets quota period + waste/grave spawn rate. Add `G.graceT` (e.g. 180s standard) during which no quota fires. Reframe Dread as the unprocessed-dead backlog: it rises with `G.stock.dead` left unrendered, falls as you render; breach = sustained max.
- [ ] Step 3: run tests → green. Commit `feat: player-set tempo, grace period, backlog-driven pressure`.

## Task 5: Building details + refund

**Files:** `game/index.html` (`refreshInspect` building branch).

- [ ] Step 1: in the building inspector, add a throughput line computed from the recipe + staffing: `"<out> · 1 per <time>s · <n> husks"`; keep the worker name+state list; ensure Demolish refunds a clear 50% (label it). No test needed (UI), but `sim3dtest` must still pass.
- [ ] Step 2: commit `feat: building inspector shows throughput + refund`.

## Task 6: Wooden twig UI + spooky restyle + foliage + low-poly husks

**Files:** `game/index.html` (CSS + frame elements), `game/assets/ui/*`, regenerate husk GLBs (Higgsfield).

- [ ] Step 1: vendor the branch art (`border-corner.png`, `border-bar.png`, `wordmark.png`, already in `game/assets/ui/`). Add CSS to frame HUD panels with the corner/bar art via `mix-blend-mode:screen` (drops the black). Replace parchment/iron panel fills with darker, colder tones; lean into white markers.
- [ ] Step 2: put the `wordmark.png` on the boot/title screen; pick a distinctive display font for headings (`@font-face` vendored, with a serif fallback).
- [ ] Step 3: increase starting foliage density further (more close trees/twigs).
- [ ] Step 4: regenerate Worker + Reaper husks at lower polycount / blockier (Higgsfield image_to_3d, lower `target_polycount`), re-vendor, re-wire.
- [ ] Step 5: commit `feat: wooden twig UI, spooky restyle, denser foliage, lower-poly husks`.

## Self-review notes

- Spec coverage: dead+graves (T1), real chip chain (T2), bound population (T3), tempo/grace/pressure (T4), throughput+refund (T5), wooden UI+lowpoly+foliage (T6). All covered.
- Keep `sim3dtest.js` green after each task; it's the safety net for the sim during a big re-theme.
- Power + ichor are real datacenter constraints (T2 recipe gates compute on both).
