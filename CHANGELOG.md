# Changelog

## The "boil the ocean" pass

Took the working vertical slice to a complete, tested, vendored, deployable game.

### Fixed
- **Test harness was broken.** `tools/sim3dtest.js` read `index.html` from the
  repo root, but the game lives at `game/index.html`. The suite could not run.
  Fixed the path; the baseline is green again, then grown from 12 to 29 assertions.
- **World preview had drifted from the game.** `tools/worldpreview.js` carried
  its own copy of the terrain math with different constants, so the preview was a
  lie. It now evaluates the real `terrainHeight` / `genRegions` / `biomeColor` out
  of `game/index.html` with a faithful Color stub. A test asserts parity, so it
  can never drift again.

### Added
- **Material repositories (the #1 ask).** A Reliquary Yard building. It raises
  storage capacity and renders eight material bins (logs, sand, ash, water,
  salvage, glass, cores) whose piles rise and fall with your actual stores. A
  central yard is seeded at the start so the economy is legible from the first
  frame. Husks now also visibly carry tinted loads while hauling.
- **AI models for (almost) every building.** Generated concept art plus
  image-to-3D GLBs for the six gathering posts, the market, and a tech-forward
  crypt-server datacenter, matching the existing six. Wired with procedural
  fallbacks. The Pyre and the Reliquary Yard stay procedural on purpose (live
  flame, dynamic piles).
- **Full audio.** A WebAudio synth drone and synth SFX that need zero downloads
  (offline and `file://` safe), with AI-generated music beds (calm + dread,
  crossfaded by Dread level) and AI SFX (placement, quota bell, crumble,
  haunting, husk-rise) layered on top. A mixer in the options menu and a rail
  mute toggle.
- **Husks.** Reaper uses a hooded husk (the AI auto-rigger could not handle the
  cloaked thin-limbed mesh after several attempts; documented). Stump-folk got a
  bespoke heave-and-tilt log shuffle.
- **Belonging.** Placed buildings now face the Pyre, sink a foundation skirt and
  rim stones into the terrain, and scatter kind-matched debris and a white sigil.
- **Progression.** localStorage save/load with autosave and save-on-exit, an
  options menu (music, SFX, film-grain, mute), a staged tutorial, drifting
  weather (clear to ashfall, shifting fog and ash), and random world events.
- **Performance.** The megacity horizon is instanced (about 150 tower meshes down
  to 2 draw calls). Building GLBs stream lazily on first placement instead of all
  at boot. Concept card images downsized from 1024px to 384px (94 MB to 2.6 MB).
- **Vendored everything.** Three.js r128, all GLBs, images, and audio are local
  under `game/`, with a CDN fallback so `file://` still works.
- **CI + deploy.** `.github/workflows/ci.yml` runs the headless tests on every
  push and deploys `game/` to GitHub Pages on `main`.

### Tests
`node tools/sim3dtest.js` -> 29 passing. `node tools/worldpreview.js` renders the
real terrain.
