# THE SOUL FOUNDRY

A true-3D, browser-based, desolate colony-automation game. A dead world, an
agentic AI that persists by computing, and the husks of the dead bound to a
foundry that renders their remains into Compute. Think Against the Storm meets
Frostpunk by way of a Haunted Mound music video.

The whole game is one self-contained file: `game/index.html`. It runs from
`file://` with no build step and no backend.

## Run it

Local, recommended (lets every asset load cleanly):

```bash
cd the-soul-foundry
python3 -m http.server 8080 -d game
# open http://localhost:8080
```

Or just open `game/index.html` in a browser. Over `file://` the building 3D
models load from the Higgsfield CDN fallback (browsers block local XHR there);
over `http://` they load from the vendored copies in `game/assets/`.

## Controls

- Drag to orbit, scroll to zoom, WASD to pan, Q/E to rotate.
- Click a husk or a building to inspect it and assign workers.
- Build from the dock at the bottom, then click the ground to place.
- Space pauses, 1 / 3 set game speed, Esc cancels placement.
- The rail on the right has pause, speed, help, a sound toggle, and options.

## How to play

Claw raw matter from the valley, refine it up an occult-industrial supply chain,
feed the spectral datacenters, and meet a rising quota of Compute. Keep the Pyre
fed with Deadwood for warmth and gather Rot-Pith for food, or the husks crumble.
Miss a quota and the backlog of the unprocessed dead becomes Dread. Build Ward
Obelisks to hold Dread back, Reliquary Yards to stockpile your matter, and Bone
Paths to move husks faster. Survive eight tithes of Compute to break the engine.

The three husk castes: Workers (balanced, a rigged animated model), Stump-folk
(haul far more, slow, a bespoke procedural log), and Reapers (frail, resist
Dread, a hooded husk).

## Architecture

`game/index.html` is a single classic `<script>` (no ES modules, so it works
over `file://`). It is organized in commented sections: sound, RNG and noise,
world (terrain, biomes, atmosphere, megacity horizon), camera, husks, save/load,
UI, input, economy, and the main loop.

Two rules keep it sane:

- **Deterministic sim.** Fixed 1/30s timestep plus a seeded `mulberry32` RNG.
- **Sim and rendering are separate.** The economy (`stepEconomy`, `stepHusks`)
  never touches WebGL, so it can be driven headless in tests.

## Assets

Buildings and characters are AI-generated: a concept image (Nano Banana /
Seedream), then an image-to-3D GLB (Meshy), loaded at runtime. Music and sound
effects are AI-generated (Sonilo, Mirelo). Everything is vendored under
`game/assets/` (`glb/`, `img/`, `audio/`) and `game/vendor/` (Three.js r128), so
a hosted build has no third-party runtime dependency. Each GLB also keeps a
Higgsfield CDN URL as a fallback for `file://`.

Audio degrades gracefully: a WebAudio synth drone and synth sound effects always
play, with the AI clips layered on top when their files load. The game has full
sound even offline.

Two buildings stay procedural on purpose: the Pyre (it needs its live animated
flame) and the Reliquary Yard (its material piles rise and fall with your
stores).

## Tests

```bash
node tools/sim3dtest.js      # 29 assertions: gather -> refine -> Compute chain,
                             # needs/starvation, dread bounds, build placement,
                             # stockpile capacity + piles, save/load round-trip,
                             # audio safety, world-preview parity
node tools/worldpreview.js [seed]   # renders the REAL game terrain to preview.png
```

`sim3dtest.js` loads the actual game logic with Three.js and the DOM stubbed.
`worldpreview.js` evaluates the same terrain functions out of `game/index.html`,
so the preview can never drift from the game (a test asserts parity).

A CI workflow is provided at `ci.github-workflow.yml`. Move it to
`.github/workflows/ci.yml` (via the GitHub web editor, or push with a token that
has the `workflow` scope) to run the tests on every push and auto-deploy.

## Deploy

- **GitHub Pages (live now):** served from the `main` branch root. The root
  `index.html` redirects into `game/`, so the game is at the repo's Pages URL.
- **GitHub Actions:** enable the provided workflow (see above) and switch the
  Pages source to "GitHub Actions" to publish `game/` directly with tests gating.
- **Vercel / Netlify / Cloudflare Pages:** static host, output directory `game`.

## Known tradeoffs

- The AI building GLBs are textured and run about 8 MB each. They stream in
  lazily (only when you first raise that building type) over the procedural
  placeholder, so first load stays light. Re-encoding them to KTX2/Draco would
  cut size further and is the obvious next optimization.

```
the-soul-foundry/
├── game/
│   ├── index.html        # the entire game, self-contained
│   ├── assets/           # vendored AI GLBs, concept images, audio
│   └── vendor/           # Three.js r128 + GLTFLoader + SkeletonUtils
├── tools/                # headless test + top-down world preview (Node)
├── design/               # design notes
├── .github/workflows/    # CI + Pages deploy
└── LICENSE
```

## License

MIT. See `LICENSE`.
