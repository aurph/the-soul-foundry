# THE SOUL FOUNDRY

A true-3D, browser-based, desolate colony-automation game. A dead world, an
agentic AI that persists by computing, and the husks of the dead bound to a
foundry that renders their remains into Compute. Think Against the Storm meets
Frostpunk by way of a Haunted Mound music video.

The whole game is one self-contained file: `game/index.html`.

This is a fun side project. Nothing serious, just a world I wanted to see exist.

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

## Controls

- Drag to orbit, scroll to zoom, WASD to pan, Q/E to rotate.
- Click a husk or a building to inspect it and assign workers.
- Build from the dock at the bottom, then click the ground to place.
- Space pauses, 1 / 3 set game speed, Esc cancels placement.

## Architecture

`game/index.html` is a single classic `<script>`, organized in commented
sections: sound, RNG and noise, world (terrain, biomes, atmosphere, megacity
horizon), camera, husks, save/load, UI, input, economy, and the main loop.

Two rules keep it sane:

- **Deterministic sim.** Fixed 1/30s timestep plus a seeded `mulberry32` RNG.
- **Sim and rendering are separate.** The economy (`stepEconomy`, `stepHusks`)
  never touches WebGL, so the logic stands on its own.

## Assets

Buildings and characters are AI-generated: a concept image, then an image-to-3D
GLB, loaded at runtime. Music and sound effects are AI-generated. Everything is
vendored under `game/assets/` (`glb/`, `img/`, `audio/`) and `game/vendor/`
(Three.js r128), so the build has no third-party runtime dependency.

Audio degrades gracefully: a WebAudio synth drone and synth sound effects always
play, with the AI clips layered on top when their files load. The game has full
sound even offline.

Two buildings stay procedural on purpose: the Pyre (it needs its live animated
flame) and the Reliquary Yard (its material piles rise and fall with your
stores).

## Layout

```
the-soul-foundry/
├── game/
│   ├── index.html        # the entire game, self-contained
│   ├── assets/           # AI GLBs, concept images, audio
│   └── vendor/           # Three.js r128 + GLTFLoader + SkeletonUtils
├── tools/                # headless economy test + top-down world preview
├── design/               # design notes
└── LICENSE
```

## License

MIT. See `LICENSE`.
