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
