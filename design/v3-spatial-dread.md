# THE SOUL FOUNDRY — design notes (v3, Spatial Dread)

> Written 2026-06-24 after a full DMAD council review of "where does this game go
> next?" This is the one structural change that turns strong bones (art, audio,
> deterministic sim, 100+ tests) into a game where your choices have visible,
> felt consequence — without rebuilding the working economy or chasing Factorio.

## The problem the council found

The game looked finished but played consequence-free. You could ignore placement,
ignore Dread (a forgiving global number), and mostly ignore caste mix. A stranger
couldn't *see* why anything they did mattered. The design docs promised a spatial
logistics puzzle (hauler-wisps on roads, per-building buffers, a power grid) that
was never built; the real sim is a forgiving global stockpile. Six weeks of
commits had been almost entirely cosmetic.

Two camps formed: (A) close the vision gap — make hauling/placement/power gate
production; (B/C) deepen the horror/Dread instead. A devil's advocate landed the
decisive point: the game's magic is **mood**, and bolting Factorio-style buffer
babysitting onto it would spend the one thing it has — tone — to compete on an
axis it can't win. But the same critique does *not* forbid making consequence
visible **through the theme itself**.

## The decision: Spatial Dread

Dread stops being one global scalar and becomes **the backlog of the unrendered
dead, made physical on the map.** This is the convergence point of the whole
council: it makes placement matter (camp A), is visceral and legible (the fresh
player + the executor), owns the horror premise (camp B/C — "the dead you can't
process rise against you"), preserves and amplifies mood instead of fighting it
(the devil's advocate), and does **not** touch the working production math.

It also activates three systems that were dead weight:

- the **Ward radius** (`ward:14`) — defined for months, never used in the sim;
- the flat **Dread scalar** — now derived, not arbitrary;
- the under-used **spatial premise** — placement, distance, and containment.

## The model (`stepDread`, called from `stepEconomy`)

A coarse fixed grid (`DCELL = 12u`, ~21×21 cells) of Dread 0–100 over the valley.
Each sim tick, deterministically and in index order:

1. **Sources.** Every cemetery / charnel pit with bodies left radiates Dread into
   its cell, scaled by how *full* it sits (`amount / max`). The fill is the
   source, so harvesting a deposit down quiets the ground it poisons on its own —
   "tap the dead to still them," for free.
2. **Sinks.** An **active Crematory** (anything `render:true`) and a **Ward
   Obelisk** pull Dread back, with radial falloff — the ward over its `ward:14`
   radius, the Crematory over a small local one. Radius finally matters: a ward
   beside a grave crushes it; a ward across the map does nothing to it.
3. **Diffuse + decay.** The stain creeps toward neighbours (double-buffered so
   order can't bias it) and the ground slowly forgets.

### Local bite — why placement now matters
- **Production:** a building's work rate is multiplied by `dreadBite(dreadAt(b), crewResist)`
  — `1.0` on clean ground down to `0.5` in full Dread. A Worker-crewed Furnace
  mired in a cemetery's backlog runs ~40% slower than one on clean ground.
- **Resolve:** a husk **deployed** in the haze (assigned to a post in it) loses
  resolve faster, on top of soul-ash upkeep. Idle husks milling at the Pyre
  aren't "out in it."

### Caste × Dread — the interlock (this is the consolidation)
Spatial Dread is only worth building if it pulls the *other* systems into one
decision. It does, via `DREAD_RESIST = {worker:1, stump:1, reaper:0.15}`:
- **Reapers shrug off the haze.** Their resolve barely erodes in full Dread (the
  lore was already there — "it came at the end to cut the engine's power… unbowed
  by the backlog"), and a Reaper-staffed crew keeps a building working at near
  full speed even mired in the dead. So the Reaper — dear to bind, no upkeep — is
  the caste you *deploy into the backlog*.
- **Workers and Stumps suffer the full bite.** Post them in clean ground or behind
  a Ward.

So now WHO you bind, WHERE you build, and HOW you contain the dead are a single
interlocking decision — caste affinity (which stage), caste Dread-resistance
(can it stand in the backlog), placement, and Ward/Crematory containment all
resolve together. That is what "rein it in" means here: existing systems made to
*matter through each other*, not in isolation. The building inspector shows the
real, crew-adjusted penalty ("Dread here: 46% · −7% work" for a Reaper crew vs
"−20% work" for Workers), so the interlock is legible, not hidden.

### The rising tide — the arc, made spatial
The 8-tithe campaign used to be a number divorced from the world (`need × 1.4`).
Now the wave-of-the-dead is tied to the tithe count: as the engine's quota climbs,
the dead come **faster** (`driftPeriod` ~2× shorter by the 8th tithe) and in
**bigger** waves (`deadDrift` replenishes more). So late tithes mean more standing
backlog → more pooled Dread → harder placement and more Reapers/Wards needed. The
escalation you feel is the spatial system tightening, not just a bigger number.

### The haze, rendered (one draw call)
The visible miasma is a single `InstancedMesh` of 441 soft radial-alpha smudges
(not 441 meshes), rebuilt at ~12 fps, that blend into one organic violet stain —
NormalBlending, a darkening stain rather than a glow. Cells the backlog hasn't
reached collapse to zero scale. Pure render: it reads `DREAD`, never writes it.

### Backward compatibility — why nothing broke
The **global** `G.dread` keeps its exact old formula (base pressure − renderers −
ward count) so every prior balance point and every test that forces `G.dread`
still holds. The field contributes only an **additive push**, gated to live quota
play, proportional to how hard it presses on your settlement (`dreadFieldPressure`).
The field is additive, not a rewrite. **134 sim assertions (was 100)** + boottest
stay green; save/load round-trips the field; the full sim path (field + bites +
hauntings) is bit-identical across runs under a forced seed; the global push is
proven to feed the meter in live quota play and to stay off during grace and in
challenge (so the forced-Dread breach tests still hold).

## Legibility (the council's load-bearing insight: "logic alone doesn't teach")
- A low, translucent **violet miasma** on the ground (`updateDreadViz`, pure
  render) that pools, creeps, and pulls back in real time. `V` toggles it.
- The **Ward radius ring** on select / hover, so the protected zone is explicit.
- Inspector readouts: every production building shows **"Dread here: N% · −N%
  work"**; a Ward shows its radius; a cemetery shows **"Radiates Dread — harvest
  to still it."**
- The Dread ledger chip explains the spatial mechanic and the `V` key.

## What this deliberately does NOT do (informed consent)
- No hauler-wisps, per-building buffers, or power grid (the literal v1 vision).
  That fork is declined: it risks turning a mood game into a lesser Factorio.
- The forgiving global stockpile stays — you can still sit in the world; the
  spatial consequence lives in Dread, not in logistics babysitting.
- Grip remains unproven without a stranger playtest; this shipped reversibly
  (`V` to hide, additive, save-compatible) precisely so it can be a real
  experiment rather than a bet.

## Verify
- `node tools/sim3dtest.js` (134 green) and `node tools/boottest.js`.
- In play: an untapped cemetery darkens the ground; raise a Ward beside it and
  watch the stain pull back. If you can't *see* that, it failed regardless of
  the tests.
