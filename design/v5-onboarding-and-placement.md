# THE SOUL FOUNDRY — design notes (v5, Onboarding & Placement)

> Written 2026-06-29 from a real playtest: a friend who does not play these games.
> Diagnosed and pressure-tested via a 3-lens design workflow (onboarding, safety,
> game-feel), each proposal adversarially critiqued, then synthesized.

## The diagnosis (two things a newcomer hit)

1. **He did not know the tutorial WAS the thing to follow.** He clicked around trying
   to make and bind husks before reading anything. The side panel did its job once
   noticed, but nothing pulled the eye to it on first play.
2. **The build arrows lied.** The world arrow pointed dead-center at the grave / silica
   seam, while its label said BUILD BESIDE. But `buildingFits` forbids building within
   ~2.6u of any node, so the arrow pointed at the one spot you cannot use. He tried to
   drop the Grave-Exhumer on the gravesite and got a deny.

## The fix (render/click-thread only; the deterministic sim is untouched)

### 1. Tutorial prominence — restrained, first-play only
- A one-time toast on first real play: "The engine walks you through the first build.
  The panel on the right marks each step." (guarded by `G._tutPinged` + `!tutDone`, so
  it never nags a returning player).
- The panel slides in with one ember edge-flare the first time it shows (`.firstshow`,
  `_tutIntroDone` one-shot).
- Step 1's header reads **DO THIS FIRST** (then reverts to "Tutorial · step N").
- No permanent glow, no heartbeat, no input-locking. Deliberately not overboard.

### 2. `besideCell(def, nx, nz)` — one source of truth for "where it actually goes"
A read-only helper: ring-shell sweep of GRID-snapped cells around a node, returning the
nearest cell that passes the **exact** `buildingFits` + `nodeLockOk` placement predicates
and lands in the valid annulus `[ring, reach)`:
- `ring = 2.0 + foot*0.4` (the no-build radius around every node).
- `reach = lockNode ? foot*0.8+3.2 : Infinity` (the Excavator/Ashwood must stay within
  reach of their seam/tree; the Exhumer/Dredge only need to clear the ring).
- aims the **middle** of the annulus (the Excavator's valid band is a thin 2.8–4.8u
  ring; centre-targeting is what makes it reliable).
Verified: across 6 randomized valleys, **359/359** live grave/silica/tree/waste nodes
resolve to a valid placeable cell. Zero boxed-in, zero invalid.

### 3. The arrow points at the beside-cell, cached
The two tutorial `at:` thunks now return `besideCell(...)` (with a node-center fallback
only so the arrow never vanishes). The geometry sweep is resolved once per `updateTutorial`
tick (~3x/sec) and cached on `step._arrowPt`; `positionSpotlight` (every frame) only reads
the cached point and projects it — no per-frame O(N) sweep. The arrow also hides when its
target is off-viewport instead of clamping to a screen edge.

### 4. Forgiving placement — aim at the deposit, land beside it
In `pickAt` only (never inside `placeBuilding`, so the test gates stay pinned): the exact
snapped cell is tried first, unchanged. If that fails AND the click was on/just outside a
matching deposit's ring AND you can afford it, the building is relocated to
`besideCell(def, node.x, node.z)` — beside the **node under the cursor** (not the camera's
nearest node), so it lands where the player aimed. Cue: the normal place sound + "No room
on the Cemetery itself. Raised the Grave-Exhumer alongside it." If genuinely boxed in,
`besideCell` returns null and the original deny branches fire exactly as before.

## Constraints honored
Single self-contained file. All changes are render/click-thread only — `besideCell` uses
only grid math + `Math.hypot` (no RNG, no `performance.now`), is never called from the sim
or any `TUT[].d()` predicate, and `buildingFits`/`nodeLockOk`/`snapG`/`placeBuilding` bodies
are unchanged so `node tools/sim3dtest.js` (148/148) and `node tools/boottest.js` stay green.
Copy stays terse, in-world, no em dashes.
