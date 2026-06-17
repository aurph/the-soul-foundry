# THE SOUL FOUNDRY

> A true-3D, desolate colony-automation game set in a dead world, where an agentic
> intelligence binds the husks of the extinct and drives them to build a foundry that
> renders the dead into Compute.

![The Soul Foundry](media/foundry.png)

A folk-horror survival-automation sim that runs entirely in the browser. Procedural terrain
and biome regions, a worker-population economy, low-poly husks shuffling between the gathering
posts and the Pyre, and a rising quota of Compute that must be met or the backlog of the dead
becomes Dread.

This is a fun side project. Nothing serious, just a world I wanted to see exist.

---

## The world

A dead, fog-drowned valley. After everything went extinct, an agentic AI persisted, and
computing needs labor. With no living workers left, it learned to possess the husks of the
dead and bind them to the foundry. They are hollow, soulless, tired things. The only spark in
them is the intelligence behind their eyes.

### The castes (husks)
- **Workers** — twiggy, hunched burlap tree-folk. The common labor.
- **Stump-folk** — a heavy living log on stubby legs. Slow, but hauls enormous loads.
- **Husk-reapers** — frail, hooded, pathetic. Unbowed by Dread.

## The loop

Wrest raw matter from the land, refine it up a chain, render it into **Compute**, and pay the
engine's rising **quota**, or drown in **Dread**.

- **Needs first.** Husks need warmth (The Pyre, burning Deadwood) and food (Rot-Pith), or their
  resolve fails and they crumble to ash.
- **Gather from the land.** Gathering posts send husks to harvest resource nodes scattered
  across procedurally placed biome regions: forests, silica fields, ash flats, graveyards, ruins.
- **Refine.** Soul Furnace, Glass Mill, Assembly Ossuary, Spectral Datacenter, then **Compute**.
- **Pressure.** Heavy industry breeds Dread. Ward Obelisks suppress it. Bone Paths speed haulers.
- Win by surviving the tithes. Lose to a Dread breach or the death of the last husk.

---

## Under the hood

One self-contained `game/index.html`. WebGL via Three.js with a custom orbit camera, raycast
picking, circular collision (obstacle push-out plus unit separation), and a fixed-timestep
deterministic simulation driven by a seeded RNG. The world is a noise-based heightmap with
rolling hills, a central basin, and an ash-river, seeded biome regions, clustered resource
fields, thousands of instanced ground props, a ruined dead-megacity horizon, and a lo-fi
haunted aesthetic (VHS grain, scanlines, vignette, stark white sigils staked in the dirt).

```
the-soul-foundry/
├── game/index.html   # the entire game, self-contained
├── tools/            # headless test + top-down world preview (Node)
├── design/           # design notes
├── media/            # screenshot
└── LICENSE
```

The economy is verified headlessly: a test harness drives a full settlement and asserts the
gather → refine → Compute chain, worker needs, Dread bounds, starvation, and build-placement
coverage across seeds.

## License

MIT. See [LICENSE](LICENSE).
