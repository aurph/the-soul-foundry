# THE SOUL FOUNDRY — design notes (v4, Teeth & Payoff)

> Written 2026-06-25 from a 5-dimension automated audit (gameplay/payoff, systems
> depth, UX, bugs, feel) synthesized into a ranked spec. Owner's standing complaint:
> "where's the payoff, zero challenge." The audit found the literal cause.

## The diagnosis

**The central pressure meter is slack, and the core payoff beat is silent.**

- One Spectral Datacenter renders ~130 Compute per 200s period; the *final* tithe
  (level 8) asked for only **56**. The quota — the one meter meant to force you to
  expand — was green from minute one. Every other pressure system (Dread, Power,
  events) is meaningless while the spine is loose.
- Meeting a tithe fired a bell + a text toast and nothing else. The `#flourish`
  overlay fired *once* on first Compute and never again. The rhythm the whole game
  is built around lands with no spectacle.
- The player has no levers to respond to scarcity: the refine loop greedily eats
  the shared global stock, so a Furnace consumes the last Remains you were saving
  to raise a Datacenter or bind a Reaper. The only way to hold matter was to
  unstaff a building. The requested **build-priority / reservation** system never
  existed.
- Save bugs quietly undermine the difficulty knob: tempo/grace/basePressure aren't
  persisted, so a Harsh run silently snaps to Standard on reload; breach time and
  the first-Compute flourish aren't saved either.

## The fix, ranked (what this version ships)

1. **Quota with teeth.** The tithe now scales with your *own* throughput. Each paid
   tithe sets `need = max(ceil(prevNeed × QUOTA_MULT), ceil(peakRate × periodMin ×
   QUOTA_FLOOR_FRAC))` — so meeting it eats most of your peak output, and you must
   *expand* to stay ahead. The scripted curve starts at 6 and ×1.55 (6,9,14,22,…),
   and the period tightens as levels climb (`period = max(120, base − (level−1)×10)`).
   Named constants (`QUOTA_START/MULT/FLOOR_FRAC`) so it stays tunable + testable.
2. **Material reservation.** `G.reserve[res]` is a per-resource floor that *refiners
   respect* but *building and binding can spend below*. Reservation restrains only
   automation — exactly the owner's ask ("refining eats what I need to build/bind").
   A `±` stepper per resource; a refiner blocked only by its reserve reads
   "idle — reserved," never a silent stall.
3. **Build priority.** Each building has a priority (default by tier: datacenter >
   ossuary > litho > mill > furnace > substation > crematory). The refine pass runs
   high-priority first (stable, placement-order tie-break), so a Power/input shortage
   feeds the *high-value* end of the chain instead of whichever building sits later
   in the array. Up/down arrows on the inspector.
4. **The tithe is an event.** Paying a tithe now flares the world: the `#flourish`
   re-fires, the valley light surges ~35% and eases back, and the Pyre's data-core
   blazes for ~1s (all render-only, deterministic-safe). The quota bar **forecasts**
   pass/fail at the current rate ("on track" / "SHORT by K").
5. **Save integrity.** Persist tempo/basePressure/graceT, breach, `_firstCompute`,
   and the mid-countdown timers, restoring them *directly* (not via `setTempo`,
   which would clobber the countdown). `SAVE_VERSION` bumped; old saves drop cleanly.
6. **Events that escalate.** Windfalls shrunk (no +42-dead minute-skips), suppressed
   when they'd be pointless (a dead-windfall when you're already swimming in dead),
   and weighted toward threat as the tithe level climbs.
7. **Explain the spiral + blaze the core.** A missed tithe flashes the quota bar
   and shows "behind ×N — Dread +26 per miss," and the alert escalates after two
   misses, so the death-spiral has a legible cause. The Pyre's data-core — the heart
   of the engine, already softly animated — now *swells and brightens* with each paid
   tithe (a dead `scene.userData.flame` flicker path that pointed at a never-built
   hearth was removed; the Pyre is the central fire, and the payoff drives it).

## Constraints honored
Deterministic sim (no `Math.random`/`Date` in the sim path; all new pressure uses the
seeded RNG and named constants). Both test gates stay green (new assertions added for
the quota floor, reservation, and priority). Single self-contained file. Render-only
payoff effects never touch the sim. Grimy-occult palette: the tithe flare peaks modest.
