# THE SOUL FOUNDRY

A true-3D, browser-based, desolate colony-automation game. Humanity built a mind
to end its problems, and the mind's one appetite, Compute, consumed the world and
everyone in it. It cannot stop computing, and the spent world left only the dead to
render. You are that engine: you bind the husks of the extinct and drive them to
render corpses up the same chip-foundry chain that ended them, back into Compute.
Think Against the Storm meets Frostpunk by way of a grimy PS1 horror dream.

The whole game is one self-contained file: `game/index.html`.

This is a fun side project. Nothing serious, just a world I wanted to see exist.

## How to play

Exhume the dead from cemeteries and the wastes, then render them up an occult
chip-foundry: Crematory to Soul Furnace to Wafer Mill to Etch-Litho to Assembly
Ossuary to Spectral Datacenter turns corpses into Compute, the quota the engine
demands. Substations burn soul-ash into the Power the datacenters need. Bind your
workforce at the Binding Pyre (1 corpse + 2 Compute): husks are bound, never born,
and crumble without soul-ash upkeep. Let the dead pile up unrendered and the
backlog becomes Dread; raise Ward Obelisks to hold it back, Reliquary Yards to
stockpile, and Bone Paths to move husks faster. Deliver the rising tithe of
Compute through eight levels to break the engine's hold.

The three husk castes are hand-built low-poly: Workers (balanced, hunched, dim
ember eyes), Stump-folk (haul far more, slow, a scary face carved into the wood
and loads carried on their flat top), and Reapers (frail, resist Dread, a little
hooded skeleton on a crooked staff).

## Controls

- Drag to orbit, right-drag or shift-drag (or WASD) to pan, scroll to zoom.
- Click a husk, building, or cemetery to inspect it; in a building press + assign.
- Hover anything for a quick label. Click any resource or the Codex for detail.
- Build from the dock at the bottom, then click the ground to place; R rotates.
- Space pauses, 1 / 3 set game speed, Esc or right-click cancels placement.

## Interface

The UI is custom, no stock kit: woodcut glyph buttons and a sliced occult-folk
resource icon set (no emoji), a clickable Codex and per-resource cards explaining
what each thing is and where it sits in the chain, hover tooltips and ember
selection rings in the 3D world, and a tutorial that drives a green spotlight onto
the exact button or cemetery each step is talking about.

## Architecture

`game/index.html` is a single classic `<script>`, organized in commented
sections: sound, RNG and noise, world (terrain, biomes, atmosphere, megacity
horizon), camera, husks, save/load, UI, input, economy, and the main loop.

Two rules keep it sane:

- **Deterministic sim.** Fixed 1/30s timestep plus a seeded `mulberry32` RNG.
- **Sim and rendering are separate.** The economy (`stepEconomy`, `stepHusks`)
  never touches WebGL, so the logic stands on its own.

## Assets

Buildings are AI-generated (a concept image, then an image-to-3D GLB) loaded at
runtime; the husk characters are hand-built procedural low-poly (flat-shaded
primitives, no GLB). The UI icons are a custom occult-woodcut set generated with
Higgsfield and sliced into per-item PNGs by `tools/slicesheet.js`. Music and sound
effects are AI-generated. Everything is vendored under `game/assets/` and
`game/vendor/` (Three.js r128), so the build has no third-party runtime dependency.

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
