# THE SOUL FOUNDRY — Economy & Concept Rebuild

Date: 2026-06-19

## Premise

You are the agentic AI. You render the dead up a chain that **mirrors the real
semiconductor → datacenter → Compute supply chain**, reskinned as occult-industrial
rendering. Every input traces back to a corpse. The backlog of unprocessed dead is
your pressure. This replaces the Against-the-Storm forage-and-assign / warmth-survival
framing the owner flagged as too derivative.

## Sources of the dead (the root resource: "the Dead")

- **Graves** — cute low-poly graveyards (little leaning headstones, crosses, dirt
  mounds) you exhume for corpses. The primary, slowly-renewing source, seeded close
  to the settlement so it's visible and reachable immediately.
- **The wastes** — husks and bodies dragged in from the far desolation: larger but
  finite fields farther out, the reason to expand.

## The line (each step maps to the real chip supply chain)

| # | Building | In → Out | Real-world parallel |
|---|----------|----------|---------------------|
| 1 | Graveyard / Wastes | (exhume) → **Dead** (corpses) | raw extraction |
| 2 | Crematory (Render) | Dead → **Bone-silica**, **Soul-ash**, **Ichor** | quartz sand + dopant/flux + coolant |
| 3 | Soul Furnace | Bone-silica + Soul-ash → **Ingot** | polysilicon ingot |
| 4 | Glass Mill | Ingot → **Wafers** | wafer slicing |
| 5 | Etch-Litho | Wafers → **Etched Dies** | photolithography (etched circuits) |
| 6 | Assembly Ossuary | Etched Dies → **Cores** | dicing + packaging (chips) |
| 7 | Server-wright | Cores → **Server-Reliquaries** | board/server assembly |
| 8 | Spectral Datacenter | Servers + **Power** + Ichor → **Compute** | datacenter (power + cooling) |
| — | Substation / Binding Pyre | (fuel) → **Power** | the grid bottleneck |

Constraints that tie it to reality: the **datacenter is power-hungry and needs
cooling (ichor)** — no power or coolant, no Compute. Processing the dead **reduces
the backlog**, so clearing corpses is both how you produce and how you relieve pressure.

## Resources

Dead, Bone-silica, Soul-ash, Ichor, Ingot, Wafers, Etched Dies, Cores,
Server-Reliquaries, Power, Compute. Writ stays as the trade currency.

## Population — bound, not born

No free spawning. You **bind** a husk at the Binding Pyre for **1 corpse + a little
Compute**. Husks slowly decay and need a trickle of upkeep (soul-ash/ichor) or they
crumble. Workforce size is a deliberate spend (capex/opex), capped by housing.
Castes unchanged: Worker (balanced), Stump (hauls more, slow), Reaper (frail, resists
the backlog).

## Pacing & win/lose — the player sets the tempo

- **Tempo select at start:** Slow / Standard / Harsh. Sets quota cadence and how fast
  the dead pile in.
- **Grace period:** no quota for the first few minutes; the tutorial runs during it.
- **Lose** only if the backlog of unprocessed dead overwhelms you (you stopped
  processing) or your workforce crumbles to zero — both things the player drives.
- **Win** by sustaining the tithe of Compute to level 8 at the chosen tempo.
- No more dying in a minute.

## Buildings

Each chain step is a building. The inspector shows, for every building: its recipe,
its **exact throughput** (e.g. "Glass Mill · 1 wafer / 4.0s · 2 husks"), **who works
there** (named husks + live state), and a **demolish/refund** action returning a clear
fraction of cost. Build grid + footprint ghost kept.

## UI / visual overhaul

- **De-cozy:** drop the warm wood/parchment ATS tone; push the desolation, colder,
  grimier, lo-fi, starker white-on-black markers.
- **Low-poly dead-branch UI borders** + a **branch/bone wordmark** (generating now).
- A **more distinctive display typeface** for headings (paired with the wordmark).
- **Lower-poly husks** — the AI characters re-generated blockier/chunkier.
- **Denser foliage at the start.**

## Kept vs. changed

- **Keep:** the build grid + ghost, save/load + autosave, the audio system, the
  stockpile-as-hub physical haul loop, the world/biomes/megacity, the start-paused +
  fixed lose-restart, the building inspector + on-screen alert.
- **Change/remove:** free population growth (→ bind-from-corpses); warmth-as-survival
  (→ Pyre becomes Binding + Power); the generic biome-forage framing (→ the dead +
  real chip chain); rename the resource/building set per the table above.

## Approach

Rebuild incrementally and **test-first**, keeping the game deployable at every step:
re-theme + reshape the economy data first (resources, buildings, recipes, sources),
then population/pacing, then UI/visual. Extend `tools/sim3dtest.js` to assert the new
chain end-to-end (Dead → Render → … → Compute), that binding a husk consumes a corpse,
that population never grows for free, that the tempo bounds hold, and that refunds work.

## Out of scope (for now)

Multiplayer, leaderboards, new audio tracks beyond the existing set, the title video.
