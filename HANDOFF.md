# THE SOUL FOUNDRY — MASTER HANDOFF (read this whole thing before touching code)

You are taking over **THE SOUL FOUNDRY**, a true-3D, browser-based, desolate colony-automation
game. It is real and working today — a single self-contained `game/index.html` (WebGL/Three.js)
with a procedurally generated world, AI-generated 3D buildings + characters, a worker-population
economy, collision, and a Haunted-Mound horror aesthetic. Your job: take it from "genuinely good
vertical slice" to "**holy shit, that's done**" — and stand up the servers/hosting to run it.

The owner's standard, in his words: *"The marginal cost of completeness is near zero with AI. Do
the whole thing. Do it right. Do it with tests. Do it with documentation. The standard isn't 'good
enough' — it's 'holy shit, that's done.' Boil the ocean."* Hold that bar.

---

## 0. THE ONE-PARAGRAPH PITCH
A dead world. After everything went extinct, an **agentic AI** persisted — and computing needs
labor. With no living workers left, it learned to **possess the husks of the dead** and bind them
to a foundry that renders the remains of the dead into **Compute**, the only thing keeping the
intelligence alive. You are that intelligence. Claw raw matter from a desolate procedural valley,
refine it up an occult-industrial supply chain, feed spectral datacenters, and meet a rising
**quota of Compute** — or the backlog of the unprocessed dead becomes **Dread** and overruns you.
Think *Against the Storm* meets *Frostpunk* meets a Sematary / **Haunted Mound** music video.

---

## 1. THE AESTHETIC BIBLE (this is the soul — do not violate it)
The owner is *extremely* particular about vibe. Every art/visual decision must pass these:
- **Desolate, soulless, hollow, tired.** Not menacing, not edgy, not "cool." The husks are empty
  dead bodies running on borrowed intelligence. Melancholy and exhausted, never threatening.
- **Haunted Mound** (the band/collective): lo-fi VHS grain, occult forest-horror, stark
  **white-on-black** crosses/sigils staked in dirt, DIY, grimey, scary but pathetic-not-imposing.
- **PS1 / retro low-poly**: chunky flat-shaded facets, low-res muddy textures, crude geometry.
- **No glow except the eyes.** The only sign of the AI possession is a faint glow where eyes
  would be. No circuitry/wires bolted on the creatures.
- **Occult + futuristic fusion done with restraint**: the world is a fallen machine-civilization
  (dead server-towers, broken arcologies, a fallen orbital ring on the horizon) reclaimed by
  folk-horror. Keep the **datacenter/server/semiconductor soul** present — the owner loves it —
  but never literal "server racks behind a barn door." Reskin tech as occult-industrial.
- **Carved, not skull.** Faces in wood = crude shallow whittled gouges, NOT anatomical skulls.
- Filter intensity: **subtle**. The owner said the grain/scanlines/vignette were way too high;
  they're now tuned low (grain opacity ~0.035, vignette ~0.42). Keep it tasteful.

If you generate new assets, run prompts through this bible. The owner will reject anything that
reads as generic, menacing, glowy-techno, or "vibecoded."

---

## 2. CURRENT STATE (what exists, what works)
**One file is the game:** `game/index.html`. ~1000 lines, single classic `<script>` (no ES
modules — must run from `file://`). Three.js r128 + GLTFLoader + SkeletonUtils loaded as classic
CDN scripts (works over file://; ES-module/importmap does NOT over file://).

Working systems (all real, all tested headlessly — see §6):
- **Procedural world**: seeded noise heightmap (rolling hills + central settlement basin + winding
  ash-river), **8–12 seeded biome regions** (forest / silica / ash / ruins / graves / bog) each
  rendered as a tinted field with clustered resource nodes + matching props, ~6k instanced ground
  props, a ruined dead-megacity horizon (3 parallax belts + fallen rings), drifting ash, sky dome.
- **Economy** (priority-ordered by owner): worker **needs/upkeep** (warmth from The Pyre burning
  Deadwood; food = Rot-Pith) → **gathering** from finite (silica/ash/salvage) + renewable
  (grove/well) land nodes → **refining chain** → **Compute** → **quota/Dread** escalation → trade.
- **Population**: husk castes (Worker / Stump-folk / Reaper). Worker is a **rigged animated AI GLB**
  that loads at runtime; all castes have hand-built procedural fallbacks. They gather, haul (stumps
  carry far more, slower), staff refiners, idle near the Pyre, crumble if needs unmet, multiply if
  thriving. **Click any husk or building** to inspect/assign workers.
- **AI buildings**: 6 building concepts (Seedream) → **image_to_3d GLBs** loaded at runtime with
  procedural fallbacks (den, furnace, mill, assembly, datacenter, ward). Concept renders are the
  build-menu card art. 7 more (all gathering posts + market) + a tech-datacenter were generating at
  handoff — see §3/§7.
- **Collision**: circular obstacle push-out vs buildings + husk-to-husk separation, destination-aware
  stop distances (so they approach & work instead of clipping through).
- **Paths**: "Bone Path" build type, click-drag to lay, husks move +35% on paths.
- **Camera**: hand-rolled orbit (drag rotate / scroll zoom / WASD pan), clamped above terrain, raycast
  picking, placement ghosting.
- **UI**: resource ledger, quota/Dread banner, build dock (tabs + cards), husk/building inspectors
  with worker assignment, market trade, toasts, help overlay, speed controls.
- **Audio**: AI music + SFX (Sonilo/Mirelo); more cooking at handoff.
- **Aesthetic**: VHS grain + scanlines + vignette overlay, white sigils/crosses, dead server-towers
  scattered to carry the machine/datacenter motif.

**Repo layout** (`the-soul-foundry/`): `game/index.html`, `tools/sim3dtest.js` (headless economy +
placement test harness), `tools/worldpreview.js` (renders the procedural world top-down to a PNG —
use this to iterate geography without a browser; pure Node), `design/` notes, `README.md`, `LICENSE`.

---

## 3. THE AI ASSET PIPELINE (Higgsfield) — USE IT HARD
The owner paid for Higgsfield Ultra and wants it used to its fullest. Pipeline already in use:
1. **Concept image** (`generate_image`, model `seedream_v4_5`, 1:1, white bg, three-quarter
   isometric, the aesthetic-bible prompt) →
2. **3D model** (`generate_3d`, model `image_to_3d`, `should_texture:true`, `enable_pbr:false`,
   `should_remesh:true`, `topology:"triangle"`, low `target_polycount` ~3.5–6k for chunky PS1).
   For characters add `enable_rigging:true, enable_animation:true, animation_action_id:30` (walk),
   `pose_mode:"a-pose"`. →
3. GLB hosted on Higgsfield CDN; **loaded at runtime** by GLTFLoader. Cross-origin GLB loading
   WORKS in a normal browser (Chrome from file://). The live URLs are baked into `game/index.html`
   in the `VILLAGER_GLB` const, `BLD_GLB` map, `BLD_IMG` map, and the audio maps — **that file is
   the source of truth for current asset URLs.** The full generation history lives in the owner's
   Higgsfield workspace.
- **CRITICAL GOTCHA**: skinned-mesh `Box3.setFromObject` returns bogus near-zero height → if you
  scale a rigged GLB by `1/height` it becomes GIANT. Always clamp scale hard (see `spawnVillager`).
- Higgsfield can also do **video** (`generate_video` — a cinematic title trailer would be killer),
  more **audio**, background removal, upscaling. There's also `deploy_game`/`publish_game` to ship
  to the Higgsfield marketplace (couldn't be used from the original build sandbox — no egress; you
  may be able to from a networked env).

---

## 4. DESIGN SPEC (numbers live in code as data — tune freely)
- **Resources (raw):** Deadwood, Rot-Pith, Silica, Soul-Ash, Grave-Water, Salvage.
- **Refined:** Cinderglass, Sigil-Disc, Reliquary Core, **Compute**. **Currency:** Writ.
- **Chain:** Silica+Soul-Ash→Cinderglass (Furnace) · Cinderglass+Water→Sigil-Disc (Mill) ·
  Sigil-Disc+Soul-Ash→Reliquary Core (Assembly) · Core+Water→**Compute** (Datacenter).
- **Buildings:** The Pyre (warmth), Bone Den (housing/pop cap), Bone Path (+move), gathering posts
  (Splitter / Pith Harrow / Silica Dredge / Ash Vent-Cap / Well Rig / Salvage Yard), refiners
  (Furnace/Mill/Assembly/Datacenter), Ward Obelisk (Dread suppression), Black Market (trade).
- **Castes:** Worker (balanced), Stump-folk (carry 18 vs 7, slow), Reaper (frail, Dread-resistant).
- **Win:** survive 8 tithes of Compute. **Lose:** Dread breach (100% sustained) or population → 0.

---

## 5. THE PUNCH-LIST (prioritized — this is where "the sauce" lives)
Owner's most recent, unfilled notes first:
1. **Material repositories / stockpiles on the map.** Right now resources are abstract once gathered.
   Add visible **stockpile structures / material piles** near the settlement that grow/shrink with
   inventory (piles of logs, sand heaps, crates of cores) so the economy is physically legible.
   This is the #1 "sauce" ask.
2. **Make every building an AI model.** Wire the 7 new building GLBs (gathering posts + market) and
   the **tech-forward datacenter** (server racks + cables fused with the crypt) into `BLD_GLB` and
   swap them in (same pattern as the existing 6). Concepts already generated.
3. **Bake in audio.** Wire the new music + SFX (placement thud, quota bell, etc.) — map names to
   `AUDIO` and trigger on events. Music loops low under everything.
4. **Rigged AI husks for every caste.** Only the Worker is a rigged GLB; rig the Reaper (humanoid)
   and give the Stump-folk a bespoke procedural shuffle (it's a non-humanoid log — auto-rig fails,
   animate procedurally: heave/tilt). Generate idle/carry/work clips and blend.
5. **Cinematic title screen** via Higgsfield `generate_video` (desolate valley flythrough), played
   as a `<video>` background behind the title.
6. **Buildings that "belong"**: ground them — add foundation skirts, scatter matching props/debris
   around each placed building, snap rotation to face the Pyre/road, settle into terrain.
7. **Deeper progression**: tech tiers / upgrades (the owner wants "small stuff" like the +5% path),
   more castes, events, weather, a real tutorial, save/load, sound mix, options menu.
8. **Performance pass**: instance repeated building meshes, frustum-cull, LOD the megacity, cap DPR.

---

## 6. TESTING (keep it green; add to it)
`node tools/sim3dtest.js` — loads the REAL game logic headless (Three.js + DOM stubbed), drives a
full settlement, asserts: gather→refine→Compute chain end-to-end, sustainable population, Dread
bounds, starvation erodes resolve, and **build-placement coverage across seeds** (currently 12/12).
`node tools/worldpreview.js [seed]` — renders the procedural world top-down to `preview.png` so you
can iterate geography/biomes without a browser (the build sandbox had no WebGL; this was essential).
**Always run both before shipping.** Add tests for every new system.

---

## 7. HOW TO RUN IT & "BAKE EVERY SERVER" (hosting/deploy)
There is **no backend** — it's a fully static, self-contained client game. So "servers" = hosting +
(optional) dev/CI infra. Recommended setup for Claude Code:

**Local dev**
```bash
cd the-soul-foundry
python3 -m http.server 8080 -d game      # then open http://localhost:8080
node tools/sim3dtest.js                  # headless logic tests
```
(Serving over http:// instead of file:// also lets you switch Three.js to ES modules/importmap if
you prefer — but file:// must keep working unless you commit to http-only hosting.)

**Production hosting — pick one (all are zero-backend static hosts):**
- **GitHub Pages**: push, enable Pages on the repo, point at `/game` (or move `index.html` to root).
- **Vercel**: `vercel --prod` (static; set output dir to `game`). Instant CDN + HTTPS + custom domain.
- **Netlify**: `netlify deploy --prod --dir game`.
- **Cloudflare Pages**: connect the repo, build dir `game`. Best edge CDN.
- **Higgsfield marketplace**: `deploy_game` (zip `game/` → upload → deploy) for the in-platform listing.

**CORS note (important for hosting):** the AI GLB/audio assets stream from the Higgsfield CDN at
runtime. They load fine today, but for a bulletproof production deploy you should **vendor the
assets** (download the GLBs/audio into `game/assets/` and rewrite the URL maps to relative paths) so
the game has no third-party runtime dependency. Likewise consider **vendoring Three.js** into
`game/vendor/` (pin r128) instead of the CDN. This removes every external point of failure.

**If you later want servers (optional, only if scope grows):** leaderboards / cloud saves / sharing
seeds → a tiny serverless API (Vercel/Cloudflare Functions + KV/D1) is plenty. Multiplayer co-op →
a WebSocket authority server (the sim is deterministic with a seeded RNG + fixed timestep, so
lockstep netcode is feasible). None of this is needed for single-player; don't over-build.

**Suggested CI** (`.github/workflows/ci.yml`): on push, `node tools/sim3dtest.js` must pass; on main,
deploy to Pages/Vercel. Add it.

---

## 8. CONSTRAINTS & GOTCHAS (learned the hard way)
- **Runs from `file://`** → classic scripts only, no ES module imports (unless you go http-only host).
- **Skinned-mesh bbox lies** → clamp GLB scale (giant-husk bug).
- **Terrain height varies a lot** → don't reject building placement on absolute height except the
  very deepest channels (the old cutoff made the whole map unbuildable — fixed, test-covered).
- **Determinism**: fixed timestep (1/30s) + seeded `mulberry32`. Keep logic deterministic; keep
  rendering separate from sim so the headless tests stay valid.
- **Aesthetic gate**: re-read §1 before generating or building anything visual.
- The owner iterates fast and bluntly. Ship complete, tested, impressive work — not increments,
  not plans, not workarounds. Use the world-preview tool and the test harness so you're never
  guessing at the result.

## 9. QUICKSTART FOR YOU (Claude Code), IN ORDER
1. `unzip` the repo, `git log` to see history, open `game/index.html`, skim §-comments.
2. `python3 -m http.server -d game` and play it once. `node tools/sim3dtest.js` (expect 12/12).
3. Knock out Punch-List §5 #1 (material repositories) and #2 (wire remaining AI building GLBs) first
   — that's the owner's current "sauce" gap. Then audio, then the rest.
4. Vendor assets + Three.js, add CI, deploy to a static host, hand back the live URL.
5. Keep the test suite green and the aesthetic bible honored. Boil the ocean.
