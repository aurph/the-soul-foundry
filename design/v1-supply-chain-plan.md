# CURSED FOUNDRY — Design Plan

## Logline
You inherit a dead, fog-drowned valley and must rebuild the lost art of soulbound
silicon. Drag raw cursed sand up a full semiconductor supply chain — Sand → Silicon →
Wafers → Chips → Modules → Compute — across smelters, lithography spires, assembly
crypts and spectral datacenters. Goods do not teleport: spectral hauler-wisps carry
them along roads you lay. Manage a power grid, worker souls, money and a rising Dread
meter. Industrialize too hard and hauntings sabotage your lines until you ward them.

## Profile (game-design-system §1)
- Time: real-time with pause + 1x/2x/3x speed.
- Space: discrete grid (32x32 tiles), continuous hauler movement on top.
- Agency: disembodied builder hand.
- Conflict: vs system (logistics, economy, dread).
- Content: emergent (player-built supply networks).
- Outcome: win = sustain target Compute/min for 60s; lose = bankruptcy or Dread breach.
- Players: solo.
- Session: 20–60 min run.
- Engagement: calculation + accumulation (optimize the chain, watch it grow).

## Delivery context
Desktop + mobile browsers + gamepad. Physical key codes. Strings external. Web only.

## Resource graph (the supply chain)
Sand (raw, from Quarry)
  -> Silicon      (Soul Furnace: Sand + Power)
  -> Wafer        (Wafer Sanctum: Silicon + Coolant)
  -> Chip         (Etching Spire: Wafer + Power + Coolant)
  -> Module       (Assembly Ossuary: Chip + Silicon)
  -> Compute      (Spectral Datacenter: Module + Power + Coolant) => sells for Coin + Research
Coolant (from Gravewell Cooler: Power)
Power   (live grid, from Wisp Reactor; not stored)
Souls   (workers, from Bone Hovel; staff nearby buildings)
Coin    (money; from selling Compute/goods at Soul Market; pays upkeep + build)
Research(unlocks tech tiers; from Datacenter + Ward Obelisk)
Dread   (hazard meter; rises with active industry, falls near Ward Obelisks)

## Logistics model (the core verb)
- Buildings have input buffers + output buffers.
- A producer only runs when: inputs present, power satisfied, staffed by souls.
- Output goods must be physically HAULED by wisps from source output buffer to a
  consumer input buffer along the ROAD network (4-connected). No road path => no delivery.
- Hauler-wisps spawn from the Hauler Roost; each carries 1 crate, picks nearest
  unmet demand reachable by road, animates along the path, deposits, returns.
- Throughput is bounded by hauler count + path length => distance and layout matter.
  This is the logistics puzzle.

## Power grid
- Reactors produce P power. Sum of active building demand must be <= supply, else a
  brownout scales ALL production by supply/demand (soft fail, not hard stop).

## Dread system (ties theme to mechanics — L2)
- Each active industrial building emits dread/min. Global Dread 0..100.
- Ward Obelisks suppress dread within radius and slowly lower global Dread.
- Dread thresholds: >50 random hauntings (a building stalls for N sec, red flare);
  >85 "breach" warning; 100 for 20s sustained => loss.

## Tech tiers (progression / L3 — one new pattern at a time)
- T0 (start): Road, Hauler Roost, Cinderdune Quarry, Soul Furnace, Wisp Reactor,
  Bone Hovel, Soul Market.
- T1 (Research 40): Gravewell Cooler, Wafer Sanctum, Ward Obelisk.
- T2 (Research 120): Etching Spire.
- T3 (Research 280): Assembly Ossuary.
- T4 (Research 600): Spectral Datacenter (the win engine).
Each unlock is the strongest reward (a new verb / chain stage), gated by banked Research.

## Win / lose
- Win: sustain >= 20 Compute/min for 60 continuous seconds.
- Lose: Coin < 0 for 30s (bankruptcy) OR Dread == 100 for 20s (breach).

## Interest curve
Hook: place quarry+furnace, see first silicon hauled and sold. Breather: stabilize coin.
Peak each tier: new building demands a new input you must route. Max near end: datacenter
needs Module+Power+Coolant simultaneously while Dread fights you.

## Economy (sources + sinks; §5.8, §9.3)
Sources: selling Compute/goods (Coin), Datacenter/Obelisk (Research).
Sinks: build cost (Coin), per-tick upkeep per building (Coin), reroll/demolish.
Inflation guard: upkeep scales with building count; selling price fixed.
