# Changelog

## 2026-06-25 — v4: Teeth & Payoff

An automated 5-dimension audit found the literal cause of "zero challenge, where's
the payoff": one Datacenter out-produced the *final* tithe from minute one, so the
quota — the meter meant to force expansion — was never a threat, and meeting it fired
only a bell. This pass puts teeth on the quota and a beat on the payoff. Full spec in
`design/v4-teeth-and-payoff.md`.

- **The quota scales to your own throughput.** Each paid tithe floors the next demand
  to most of your peak output (`need = max(prev×1.55, peakRate×period×0.68)`), and the
  period tightens as levels climb. You can no longer coast — you must expand to stay
  ahead. The quota bar now **forecasts** pass/fail at your current rate ("on track" /
  "SHORT by K") and shows "behind ×N" after a miss.
- **Material reservation.** A per-resource reserve floor (± stepper on each resource
  card) that *refiners respect* but *building and binding can still spend below* — so
  a Furnace stops eating the Power or Remains you were saving to raise a Datacenter.
  A refiner idled only by its reserve reads "idle — its inputs are held in reserve."
- **Build priority.** Each refiner has a priority (default by tier: Datacenter highest,
  Crematory lowest; ▾/▴ on the inspector). A Power or matter shortage now feeds the
  high-value end of the chain first instead of whatever sits later in the array.
- **The tithe is an event.** Paying one surges the valley light ~35% and swells the
  Pyre's data-core for ~1.5s, then eases back (render-only, deterministic-safe). A
  dead flicker path that pointed at a never-built hearth was removed.
- **Save integrity.** Tempo/grace/pressure, breach time, the first-Compute flourish,
  reservations, priorities, and the mid-countdown timers now persist — a Harsh run no
  longer snaps to Standard on reload. `SAVE_VERSION` bumped; old saves drop cleanly.
- **Events escalate.** Windfalls shrunk (no more +42-dead minute-skips), suppressed
  when pointless (a dead-windfall while you're already swimming in dead), and weighted
  toward threat as the tithe level climbs.
- Tests: +9 assertions (quota floor + period tighten, reservation respect/override,
  priority arbitration both ways). `node tools/sim3dtest.js` → 148 passed, 0 failed.

## 2026-06-24 — Second playtest pass: grip + pacing

The game played like a checklist — too fast, too cheap, quota firing mid-tutorial,
husks dying while you learn. This pass is about friction and grip.

- **Chain is gated by its own output.** A Wafer Mill now costs ingots to build, an
  Etch-Litho costs wafers, the Ossuary costs dies, the Datacenter cores. You can't
  blast to the deep chain — you must run each stage before unlocking the next.
- **Husks are an investment.** Binding costs more Compute (it's your hard-won
  output), and gathering is slower, so a husk must work a deposit a while before it
  has a load worth hauling. No more click-click-spam.
- **The opening is safe to learn in.** Grace runs much longer (a first tithe never
  lands mid-tutorial) and husks never crumble during it.
- **TUTORIAL BUG FIXED:** the world marker computed a NaN position and silently
  never showed, so the cemetery never "glowed." Fixed, and rebuilt as a big bobbing
  green arrow over the target.
- **Dread readout is plain:** "Dread on this ground: N / 100" and "↳ slows this
  building's work: −N%," so the numbers explain themselves.
- **Messages linger** (~9s, stacked) instead of flashing past; removed the separate
  "Annals" window. **Esc** now closes any open text window.
- **Bound husks look normal** — removed the green-tinted wood from the husk palette.

## 2026-06-24 — First playtest pass (Jack's notes)

- **CRITICAL FIX: depleted deposits kept being worked.** Renewable cemeteries
  trickle-regrew, so husks pecked a "done" node forever. Now a worked-out deposit
  goes EMPTY (dug-out, dimmed) and stops; renewable ones RESET to full after a
  cooldown; the wastes and silica seams are gone for good.
- **Reworked the Dread haze.** It read like spilt purple. Now a dark, desaturated
  necrotic green, much lower opacity, only rendered where the backlog is genuinely
  high, and much less diffusion — pooled dark stains at untapped cemeteries, not a
  world-covering sheet. Empty deposits emit no Dread, so harvesting clears it.
- **Husks move like the dead.** Cut their speed, tied the step cadence to actual
  speed so feet keep up (no more gliding), heavier sway and slower turns.
- **Balance.** Far fewer cemeteries (graves ~41→25), more ashwood/silica/waste,
  richer starting stock so the chain doesn't starve.
- **The Annals.** A notification log (right-rail) to read back any message that
  flashed past, so the Dread-haze nudge (and everything else) is reviewable.
- **Dock icons are the real models.** Each card now renders the building's actual
  procedural mesh to a focused thumbnail instead of a mismatched plaque.
- **The Binding Pyre reads as a server** — a ring of server cabinets with
  blade-lights around a central tower and a pulsing data-core.

## 2026-06-24 — Spatial Dread (the consequence layer)

Ran a full council review of the game's direction. Verdict: it looked finished but
played consequence-free — placement, Dread, and caste mix barely mattered, and a
stranger couldn't *see* why anything they did counted. The fix is one structural
change that makes choices matter **through the theme**, not by bolting on a
logistics puzzle. Design + rationale: `design/v3-spatial-dread.md`.

### Added
- **Spatial Dread.** The backlog of the unrendered dead is now physical: a Dread
  field over the valley (`stepDread`, stepped deterministically from the sim).
  Cemeteries and pits radiate Dread by how full they sit; it creeps; and it
  **bites production and husk resolve where it pools** — so *where you build now
  matters*. A Furnace mired in a cemetery's backlog runs ~40% slower than one on
  clean ground.
- **Wards and Crematories pull it back, by radius.** A Ward Obelisk finally uses
  its `ward:14` radius (defined for months, never wired into the sim) — beside a
  grave it crushes the Dread; across the map it does nothing. Rendering the
  backlog at a Crematory suppresses it locally. Harvesting a deposit down quiets
  the ground it poisons on its own (the fill is the source).
- **The rising tide.** The 8-tithe arc is tied to the spatial system: as the
  engine's quota climbs, the dead come back **faster** (waves ~2× more often by
  the 8th tithe), so late-game pressure is a mounting backlog of Dread you must
  out-render — not just a larger number.
- **Rites interlock with Dread.** The dead "Banked Embers / warmth" rite (warmth
  was cut long ago) is repurposed to **Grave-Salt** — husks and buildings suffer
  ~40% less from the haze (`dreadGuard`). With Ward Stones, research now has real
  Dread-management choices. Old saves that bought the retired rite migrate to it.
- **Onboarding.** Spatial Dread is woven into the always-on alert ("the dead pool
  around your Soul Furnace and slow it — render the backlog, raise a Ward, or post
  Reapers"), with a one-time teaching nudge the first time the haze pools.
- **Earned ending.** The campaign win screen shows a personalized run tally (dead
  rendered, husks bound, peak Compute/min), persisted across sessions so it
  reflects the whole run.
- **Caste × Dread interlock.** Reapers now genuinely *shrug off* the haze
  (`DREAD_RESIST`): their resolve barely erodes in full Dread and a Reaper crew
  keeps a building near full speed even mired in the dead — so the Reaper is the
  caste you *deploy into the backlog*. WHO you bind, WHERE you build, and HOW you
  contain the dead became one decision. The inspector shows the real,
  crew-adjusted penalty, and the Pyre / Codex copy sells it.
- **The Dread haze (legibility).** A low violet miasma renders the field on the
  ground in real time — it pools, creeps, and recedes as you act (`V` toggles it).
  One `InstancedMesh` of soft radial smudges (1 draw call, not 441), throttled to
  ~12 fps. Ward-radius rings on select/hover. Inspector readouts: refiners show
  "Dread here: N% · −N% work," a Ward shows its radius, a cemetery shows "Radiates
  Dread — harvest to still it."

### Compatibility
- Additive, not a rewrite. The global Dread meter keeps its exact old formula plus
  a small push from how hard the field presses on your settlement, so all prior
  balance and every save still work. Save/load round-trips the field; a legacy
  save with no field loads clean.

### Verified
- Two adversarial review passes (multi-lens, every finding independently
  re-verified): the Spatial Dread core (12 confirmed findings, 0 false positives)
  and the consolidation pass (4 confirmed, 1 false positive correctly rejected).
  All 16 fixed — crew-aware bite, ward build-guard, instanced haze, deployed-only
  resolve bite, persisted run tallies, the `embers`→Grave-Salt save migration,
  the rising-tide material/pressure rebalance, the crew-weighted Dread nudge.
- `tools/sim3dtest.js`: **100 → 134** assertions (deposits pool Dread; ward radius
  suppresses and falls off with distance; overlapping wards go deeper; draining a
  deposit quiets its ground; placement changes throughput; the Caste × Dread
  interlock — Reaper crew out-works a Worker crew in heavy Dread, Reapers hold
  resolve where Workers crumble; the global push feeds the meter only in live quota
  play; the full sim is deterministic with the dread terms + hauntings; save/load
  round-trips; legacy saves load clean). `boottest.js` green.
- Render path verified in real headless Chrome (zero JS errors; the instanced
  stain + ward ring render; the "raise a Ward, watch it pull back" thesis
  confirmed on screen).

## The "boil the ocean" pass

Took the working vertical slice to a complete, tested, vendored, deployable game.

### Fixed
- **Test harness was broken.** `tools/sim3dtest.js` read `index.html` from the
  repo root, but the game lives at `game/index.html`. The suite could not run.
  Fixed the path; the baseline is green again, then grown from 12 to 29 assertions.
- **World preview had drifted from the game.** `tools/worldpreview.js` carried
  its own copy of the terrain math with different constants, so the preview was a
  lie. It now evaluates the real `terrainHeight` / `genRegions` / `biomeColor` out
  of `game/index.html` with a faithful Color stub. A test asserts parity, so it
  can never drift again.

### Added
- **Material repositories (the #1 ask).** A Reliquary Yard building. It raises
  storage capacity and renders eight material bins (logs, sand, ash, water,
  salvage, glass, cores) whose piles rise and fall with your actual stores. A
  central yard is seeded at the start so the economy is legible from the first
  frame. Husks now also visibly carry tinted loads while hauling.
- **AI models for (almost) every building.** Generated concept art plus
  image-to-3D GLBs for the six gathering posts, the market, and a tech-forward
  crypt-server datacenter, matching the existing six. Wired with procedural
  fallbacks. The Pyre and the Reliquary Yard stay procedural on purpose (live
  flame, dynamic piles).
- **Full audio.** A WebAudio synth drone and synth SFX that need zero downloads
  (offline and `file://` safe), with AI-generated music beds (calm + dread,
  crossfaded by Dread level) and AI SFX (placement, quota bell, crumble,
  haunting, husk-rise) layered on top. A mixer in the options menu and a rail
  mute toggle.
- **Husks.** Reaper uses a hooded husk (the AI auto-rigger could not handle the
  cloaked thin-limbed mesh after several attempts; documented). Stump-folk got a
  bespoke heave-and-tilt log shuffle.
- **Belonging.** Placed buildings now face the Pyre, sink a foundation skirt and
  rim stones into the terrain, and scatter kind-matched debris and a white grave-marker.
- **Progression.** localStorage save/load with autosave and save-on-exit, an
  options menu (music, SFX, film-grain, mute), a staged tutorial, drifting
  weather (clear to ashfall, shifting fog and ash), and random world events.
- **Performance.** The megacity horizon is instanced (about 150 tower meshes down
  to 2 draw calls). Building GLBs stream lazily on first placement instead of all
  at boot. Concept card images downsized from 1024px to 384px (94 MB to 2.6 MB).
- **Vendored everything.** Three.js r128, all GLBs, images, and audio are local
  under `game/`, with a CDN fallback so `file://` still works.

### Tests
The headless suite covers 29 assertions, and a world-preview renderer mirrors the
real terrain.
