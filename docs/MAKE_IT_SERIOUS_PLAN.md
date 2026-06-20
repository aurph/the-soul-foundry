# THE SOUL FOUNDRY — "Make It Serious" Build Plan

> Self-directing plan written 2026-06-20. Goal: take the game from a good tech demo
> to something **playable, demoable, and intuitive** — a real product a stranger can
> sit down with and understand. Owner has been clear: stop the fine cosmetic edits,
> give the visuals a backbone, kill emoji / generic AI-kit UI, make EVERYTHING
> clickable and explainable, and rebuild the tutorial and controls. The economy is
> already solid; do not rebuild it. Be intentional. Boil the ocean.

## Operating rules (apply to every phase)
- Single self-contained `game/index.html`, classic `<script>`, deterministic sim.
- **Before every commit:** `node tools/boottest.js` (world-build + husk spawn runs clean)
  AND `node tools/sim3dtest.js` (37+ assertions green). Evidence, not "should pass."
- **No emoji anywhere.** Custom icons only. No generic AI-kit look. Aesthetic =
  grimy occult-industrial, bone / charred wood / lashed branch / faint ember, the
  carved-wood + Szymanski direction already established.
- Commit + push + poll GitHub Pages + verify live after each phase. Identity
  `Jack Schwartz <jacksch45@gmail.com>`, no co-authored-by line.
- Work continuously; pick the most defensible option when ambiguous and note it in
  the build log (`docs/MAKE_IT_SERIOUS_LOG.md`).

## North star
A first-time player should, within 60 seconds and without reading anything external:
know what the dead are, how to bring them in, what each building does, what every
resource is and what it's for, and what they're trying to achieve. Anything on screen
that raises a question should be **clickable to answer that question.**

---

## Phase 1 — Iconography & de-emoji (the "no chart emoji" fix)
**Why:** emoji and bare colored dots are the most obvious "unfinished / AI-kit" tells.
- Generate a custom UI glyph sheet (Higgsfield): ledger/tithe, market, info-eye,
  economy-chain, pause, play, fast-forward, demolish, + the four build tabs
  (dwelling, gathering, refining, civic). On pure black for transparency keying.
- Slice the existing `assets/ui/kit/icons-sheet.png` (12 occult-folk icons) into one
  PNG per resource (skull→Corpses, bone-sand→Bone-Silica, ash→Soul-Ash, vial→Ichor,
  ingot, wafer, die, core, bolt→Power, cube→Compute, coin→Bones). Pipeline:
  `tools/slicesheet.js` (pngjs, autodetect cells on black, trim, export).
- Slice the glyph sheet the same way.
- Add an `ICON` map + a tiny `icon(name,size)` helper that emits `<img>`.
- Replace **every** emoji: `🏪` market, `📊` economy, `❚❚` pause, `✕` close, `⚠` alert.
- Wire resource icons into: the top ledger chips, the economy panel, the shop, the
  building inspector throughput lines, and dock card costs.
- Verify (boottest+sim3dtest), commit, deploy, confirm icons load live.

## Phase 2 — Everything clickable + a "what is this?" layer
**Why:** "If I'm curious about something, I should be able to find out what it is and
why it's there, or at least what I get from it."
- A single resource codex: `RES_INFO[res] = {what, source, uses, note}` (sourced,
  honest, plain voice). Clicking any resource chip (ledger/economy/shop/inspector)
  opens a compact card: icon, name, what it is, where it comes from, what consumes it,
  current stock + net rate.
- Hover tooltips on every interactive control (rail buttons, dock cards, tabs, stat
  chips, husk/building/node on hover in 3D via raycast → name + one line).
- 3D selection feedback: an outline / ember ring under the selected building, node,
  or husk; a softer highlight on hover.
- A Codex overlay (rail button) listing all resources and buildings with their role
  in the chain — the manual, in-game.
- Verify, commit, deploy.

## Phase 3 — Tutorial rebuilt with spotlight highlighting
**Why:** "The tutorial isn't very good. Green highlighting of different spots."
- Rewrite the tutorial as an ordered, mostly action-gated sequence (do the thing to
  advance where it's natural; Next where it isn't).
- **Spotlight:** each step names a target (a CSS selector for a UI element, or a 3D
  anchor like the Pyre / nearest cemetery). Draw a green glow/outline + a pointer at
  that target. Implement a `highlight(target)` that positions an overlay ring over a
  DOM element's rect, and a world-anchored marker that projects a 3D point to screen.
- Steps cover: the dead are your matter → open Gathering → place a Grave-Exhumer on a
  cemetery → staff it → render at the Crematory → follow the line to Compute → bind a
  husk at the Pyre → meet the tithe. Each with its spotlight.
- Clear Back / Next / Skip, progress "step n of N", contextual copy.
- Verify, commit, deploy.

## Phase 4 — Controls & placement UX
**Why:** "The controls aren't very good."
- A controls overlay (keys + mouse), reachable from the rail and the help screen.
- Placement: stronger valid/invalid ghost states, a cost+footprint readout that
  follows the cursor, R-to-rotate hint, ESC/right-click to cancel, snap feedback.
- Camera: gentle smoothing, double-click a thing to focus it, keep current zoom (the
  owner explicitly does not want zoom limits changed).
- Selection: click-empty to deselect, clear selected state, keyboard 1/3 speed +
  space pause already exist — surface them in the overlay.
- Verify, commit, deploy.

## Phase 5 — Onboarding, goals & game feel
- A first concrete objective surfaced on screen ("Bring in the dead: raise a
  Grave-Exhumer on a cemetery and staff it") tied to the tutorial.
- Alerts and goals get icons + plainer copy; the "Nothing feeds the line" nudge
  points (spotlight) at the Gathering tab.
- Win / lose / pause screens get the wooden frame + custom type, readable summaries.
- Action audio cues via existing SND (place, bind, tithe met, breach).
- Verify, commit, deploy.

## Phase 6 — Visual cohesion
- Apply the lashed-branch frame + carved headers consistently; retire the leftover
  iron/parchment bits; unify spacing, type, and the ember accent.
- Replace any remaining bare swatches with icons; consistent empty/loading states.
- Verify, commit, deploy.

## Phase 7 — Deepen (only after 1-6 are live and green)
- More husk + building model polish; building model textures.
- An in-game About / methodology screen (what the game is, the supply-chain mapping).
- More codex depth, more tutorial branches, more SND.
- Keep going: every loop, leave it green, committed, deployed.

## Decisions log → see docs/MAKE_IT_SERIOUS_LOG.md (append per phase)
## Agents: executing inline. One self-contained file; I hold the full context and the
## asset pipeline. Subagents would cold-start and collide on the file. Higgsfield +
## my pngjs tooling provide the parallel asset throughput instead.
