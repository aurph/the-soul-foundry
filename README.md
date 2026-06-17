# THE SOUL FOUNDRY

> A true-3D, desolate colony-automation game set in a dead world — where an agentic
> intelligence binds the husks of the extinct and drives them to build a foundry that
> renders the dead into Compute.

A folk-horror / Haunted-Mound-flavored survival-automation sim built entirely in the
browser (WebGL), with AI-generated 3D characters and buildings, procedurally generated
terrain and biome regions, a worker-population economy, and a rising quota of Compute
that must be met or the backlog of the dead becomes Dread.

---

## The world

A dead, fog-drowned valley. After everything went extinct, an **agentic AI** persisted —
and computing needs labor. With no living workers left, it learned to **possess the husks**
of the dead and bind them to the foundry. They are hollow, soulless, tired things; the only
spark in them is the intelligence behind their eyes.

### The castes (husks)
- **Workers** — twiggy, hunched burlap tree-folk. The common labor.
- **Stump-folk** — a heavy living log on stubby legs; slow, but hauls enormous loads.
- **Husk-reapers** — frail, hooded, pathetic; unbowed by Dread.

## The loop
Wrest raw matter from the land → refine it up a chain → render it into **Compute** →
pay the engine's rising **quota**, or drown in **Dread**.

- **Needs first.** Husks need **warmth** (The Pyre, burning Deadwood) and **food** (Rot-Pith),
  or their resolve fails and they crumble to ash.
- **Gather from the land.** Gathering posts send husks to harvest resource nodes scattered
  across procedurally-placed biome regions (forests, silica fields, ash flats, graveyards, ruins).
- **Refine.** Soul Furnace → Glass Mill → Assembly Ossuary → Spectral Datacenter → **Compute**.
- **Pressure.** Heavy industry breeds Dread; Ward Obelisks suppress it. Bone Paths speed haulers.
- Win by surviving the tithes; lose to a Dread breach or the death of the last husk.

---

## Technology

- **Engine:** a single self-contained `game/index.html` — WebGL via Three.js (+ GLTFLoader,
  SkeletonUtils) loaded as classic scripts. Custom orbit camera, raycast picking, circular
  collision (obstacle push-out + unit separation), fixed-timestep deterministic simulation
  with a seeded RNG.
- **Procedural world:** noise-based heightmap (rolling hills, central basin, ash-river),
  seeded biome-region generation, clustered resource fields, ~6k instanced ground props,
  a ruined dead-megacity horizon, and Haunted-Mound styling (VHS grain, scanlines, vignette,
  stark white sigils/crosses).
- **AI asset pipeline (Higgsfield):** every character and building began as an AI image
  (Seedream) → converted to a rigged/animated or static **GLB** (image_to_3d) → loaded at
  runtime, with hand-built low-poly procedural meshes as a guaranteed fallback. Ambient music
  and SFX are AI-generated (Sonilo / Mirelo).

## Repository layout
```
the-soul-foundry/
├── game/index.html        # the entire game (self-contained)
├── tools/
│   ├── sim3dtest.js        # headless economy/placement test harness (Node)
│   └── worldpreview.js     # top-down procedural-world renderer -> preview.png (Node)
├── design/                 # design notes
├── LICENSE
└── README.md
```

## Testing
The simulation is verified headlessly (Three.js + DOM stubbed) — `tools/sim3dtest.js` drives a
full settlement and asserts the gather→refine→Compute chain, worker needs, dread bounds,
starvation, and build-placement coverage across seeds.

## Status
Active development / research preview. Built with the Higgsfield game pipeline.
