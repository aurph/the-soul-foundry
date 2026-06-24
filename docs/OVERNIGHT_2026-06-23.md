# Overnight Build — Soul Foundry (self-prompt, 2026-06-23)

Jack left a voice brain-dump before bed. Work autonomously through it, test + deploy each
piece, don't stop, leave a morning summary. Tables: **accounts** (defer). Keep the wooden
art direction — he loves it; use much more of it. Honor the verified-before-completion rule:
`node tools/sim3dtest.js` + `node tools/boottest.js` green before every commit; campaign +
challenge stay intact (84 assertions). Commit + push + verify live per item. Voice = infer
charitably; note assumptions.

## The items (with my decisions), roughly prioritized

### A. Copy / naming / numbers (quick, high value)
1. **"Corpses" is off-putting.** Rename the `dead` resource display "Corpses" → **"Remains"**
   everywhere (ledger, costs, codex, shop, tutorial). Keep the skull icon. (Decision: Remains
   is clean, grounded, works in cost strings.)
2. **Verbiage is painfully AI.** Rewrite the Codex + resource/building help to drop the tells:
   "X — Y by another name", "not this, but that", "the whole stack", triadic "blah, blah, blah".
   Plain, terse, a little dry. Jack flagged the Codex specifically.
3. **Funny names for random husks.** The husk NAMES list → dead AI / dead-tech companies &
   bots (Clippy, TayBot, Ask-Jeeves, Theranos, Pets-com, Cyc, Deep-Blue, Vine, Juicero,
   Friendster, Quibi, Cortana, SmarterChild…), suffixed with a unit id. On-theme: an AI
   rendering the dead, staffed by dead AIs.
4. **Fog starts a little closer.** FOG_REVEAL_HOME 60 → ~46.

### B. Sound
5. **Place-build sound: still too loud AND wrong.** It should sound like assembling sticks/
   stone from the ground up, not a "big bang". Generate a soft constructive SFX (Higgsfield
   mirelo) and wire it as `place` at low volume; drop the per-sound `place` even lower.

### C. Bottom dock — the #1 focus
6. **Giant overhaul, more wood.** The dock cards still show the OLD AI concept thumbnails
   (white bg, no longer match the procedural models). Decision: **drop the photo thumbnails**
   and rebuild the cards in the wooden art direction — a carved wood card with a per-category
   woodcut glyph, the name, the cost with resource icons, and the hotkey. No more white-bg
   mismatched photos.
7. **Description on hover / before buy.** Each dock card shows its building's description in a
   tooltip after a short hover (or always-visible expandable). Reuse BLD[k].desc.
8. **Missing icons at the bottom.** Audit dock/ledger for any missing-icon elements and fix.

### D. UI layout / handholding
9. **Spread the top-right rail.** Move the **speed (pause/play/fast)** controls OUT of the
   rail to the **top bar** (lots of empty space up there). Keep economy/blueprint/codex/rites/
   options on the right rail; consider moving a couple of gameplay items to bottom-right.
10. **Handhold more.** Strengthen the tutorial's green spotlight to drive the first Compute,
    and add a rewarding payoff when first Compute is rendered (toast + a little flourish).

### E. Models (find the MIDDLE GROUND — congruent, a touch futuristic, considered)
11. **Den too dilapidated.** I overcorrected to a "pile of sticks with a SpongeBob inside".
    Pull back: a real little shelter — stick frame + patched hide BUT with clean lines, a
    faint server/data glow inside (futuristic touch), congruent with the other buildings.
12. **Reaper looks like a vampire, not a skeleton.** Rebuild: a **thin skeleton** (skull,
    spine, thin ribs, stick limbs) under **simply a hood/cowl** — a wannabe grim reaper, not
    a caped vampire. Drop the body-robe drape that reads as a cape.
13. **Binding Pyre → server-themed, tied to story.** The fire pit is too AoE/AtS. Make it a
    server-altar: a dark rack/obelisk that *reads* the dead. Lore: the dead's minds left a
    residual imprint on the engine's old servers; the Pyre is where the engine re-reads that
    imprint and binds it into a husk. Replace the literal campfire with a glowing data-core /
    server-flame. Keep an animated glow.
14. **All models congruent + slightly futuristic, not obviously unconsidered.** Pass over the
    set for a shared vocabulary (dark metal + bone + a faint ember/teal data glow + a clean
    edge). Avoid "no one looked at this".

### F. Start screen / menu
15. **Challenge as a real main-menu item, not a vibe popup.** Build a proper start screen:
    Campaign vs Challenge as two distinct **stylized cards** (ideally little pictures of our
    husk models), challenge durations selectable inline, wooden framing kept but elevated,
    branding. Campaign and Challenge must read clearly different.
16. **Stylized mode icons** — small pictures, ideally of guys that look like our models.

### G. World / economy
17. **Love the cemetery deposits — want many more deposits.** Bump deposit density.
18. **Two new nodes + early crafting resource.** Add a **tree node** giving **ashwood** (early
    building material — buildings feel a bit like crafts) and a **silica node** giving silica.
    Decision: add `ashwood` + `silica` resources and the two node types; fold ashwood into a
    couple of early build costs; silica supplements the Furnace (parallel to bone-silica).
    Keep the dead→Compute spine intact and the tests green.
19. **Excavator only on silica.** A node-locked gatherer that places only on a silica node
    (nowhere else), with a suited drilling animation. Like the early mockups Jack liked.

### H. Visual polish
20. **Birds.** A few (≤~6) extremely small birds drifting near the bottom edge of the fog
    where they're visible. Render-only (Math.random), cheap.
21. **Branch frame shows black bg.** Re-key the branch frame art so the black background is
    fully transparent (no dark halos in the borders). Regenerate frame-branch.png with a
    stronger alpha key in tools/makeframe.js.

### Tabled
- **Accounts / cloud campaign saves** — defer (Jack said table it). Local campaign save already
  exists and is gated off challenge. Leave a note.

## Execution order
A (copy/names/fog) → B sound fire → C dock overhaul → D layout → H21 branch fix → E12 reaper →
E11 den → E13 pyre → H20 birds → F menu → G nodes/excavator → D10 handhold → wire sound.
Commit/deploy each. Morning summary at the end.
