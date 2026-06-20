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
