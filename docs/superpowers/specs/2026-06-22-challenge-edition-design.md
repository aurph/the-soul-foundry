# THE SOUL FOUNDRY — Challenge Edition

Date: 2026-06-22

## Premise

A second game mode that leans into the web build: a **timed challenge** where the
player has a short, shareable session (10 / 20 / 30 minutes) to render as much
Compute as possible. Instant restart, seeded runs anyone can race, a blended score,
a local best, and (Phase 2) an online leaderboard. The existing tithe-survival game
becomes the **Campaign**; the two coexist behind a start-screen mode picker.

Owner decisions (brainstorm 2026-06-22):
- **Clock:** short + shareable — presets **10 / 20 / 30 min**, chosen at start.
- **Score:** **blended** — Compute rendered is the spine, plus bonuses.
- **Losing:** **very hard to lose** — the clock is effectively the only end.
- **Sharing:** **online leaderboard** (Phase 2) on **Neon Postgres** behind a thin
  Cloudflare Worker; Phase 1 ships local-best + shareable seed link, no backend.

## Mode system

A single `G.mode` of `'campaign' | 'challenge'` (default `'campaign'`; anything
falsy reads as campaign for save-compat). On/off behaviours read through one small
`MODES` config object so branch sites stay one-liners and a third mode stays cheap,
matching the codebase idiom (`setTempo`, `AFFINITY`, `UPKEEP`).

```
const MODES = {
  campaign:  { quota:true,  timeLimit:null, softLoss:false },
  challenge: { quota:false, timeLimit:'dur', softLoss:true  },
};
```

New `G` fields: `G.mode`, `G.challengeDur` (seconds), `G.computeRendered`,
`G.deadRendered`, `G.husksBoundRun`, `G.peakRate`. All default-safe when absent.

## Start flow & seed

A `showModePicker()` (cloned from `showHelp`'s tempo picker) is the first overlay:
**Campaign** | **Challenge**. Choosing Challenge reveals duration buttons
(10 / 20 / 30) and a seed line (random, or inherited from the URL). Begin un-pauses
and starts the clock.

`start()` parses `URLSearchParams(location.search)` for `mode`, `seed`, `dur`. A
forced `seed` flows into the existing `bootWorld(seedOverride)`; determinism already
holds (all sim RNG is seeded `mulberry32`; only cosmetics use `Math.random`). A
shared link reproduces the exact run.

## The clock

`G.time` already advances at the end of `stepEconomy`. In challenge mode, when
`G.time >= G.challengeDur` the run ends (score screen). The top banner
(`renderQuota`) branches on `G.mode` to show `TIME LEFT mm:ss · score N` instead of
the tithe line, turning red under ~30s. The opening grace does not apply.

## Very hard to lose

In challenge mode the quota/tithe block and the Dread `basePressure` term are
disabled. Dread may still rise from backlog but **cannot end the run** — at its
worst it throttles production (a soft output multiplier), it does not trigger the
breach-loss. If the workforce hits zero the player simply rebinds (cheap, and they
start with a crew). Net: the clock is the only end. `renderAlert` suppresses
quota-specific advice in challenge mode.

## Blended score

Tracked cumulatively during the run (all at deterministic sim sites):
- `computeRendered` — every Compute the Datacenter outputs (tallied where
  `addStock('compute',…)` happens in the recipe loop; excludes starter/bought).
- `deadRendered` — dead consumed by Crematories (throughput).
- `husksBoundRun` — husks bound this run.
- `peakRate` — best Compute-per-minute observed (from a rolling sample).

Proposed score (weights are tunable knobs in the plan):
```
score = round( computeRendered*100 + deadRendered*3 + husksBoundRun*30 + peakRate*20 )
```
`computeRendered` dominates; the others reward throughput, workforce investment, and
efficiency. The end screen shows the headline `score` and the four components.

## End screen

A `showChallengeEnd()` overlay (sibling of `showEnd`): the big score, the four-part
breakdown, the run's seed + duration, the **local best** for that duration (beaten?
celebrate), a **share link** button (`?mode=challenge&seed=…&dur=…`), and
**Again** (new random seed) / **Retry** (same seed). It must NOT wipe an existing
campaign `sf_save`.

## Persistence

- **Local best:** `localStorage['sf_best_challenge_'+dur]` storing `{score,seed,date}`,
  read/written at challenge end (getter/setter pattern of `getGrain`/`setGrain`).
- **Autosave:** `simStep` autosave + `beforeunload` save are gated to campaign only,
  so a challenge run never overwrites the campaign save; `endChallenge` does not
  remove `sf_save`.
- **serializeState/applySave:** challenge runs are not saved/resumed in Phase 1
  (short sessions; a refresh restarts the run). Campaign save shape is unchanged, so
  the existing save/load test stays green.

## Phase 2 — online leaderboard (separate effort)

- **Store:** Neon Postgres, table `scores(id, name, score, seed, dur, mode,
  components jsonb, created_at)`.
- **API:** a Cloudflare Worker holding the Neon connection string (server-side
  secret) exposing `POST /score` (validate + insert) and `GET /top?dur=` (top N).
  The browser calls the Worker, never Neon directly. Light anti-cheat in the Worker
  (rate-limit, sane bounds; optional seed-replay verification later).
- **Client:** the end screen submits (name + score + components + seed + dur) and
  shows the top N for that duration. Graceful offline fallback to local best.
- Alternative if we skip the Worker: Neon Data API (PostgREST) browser-direct with
  RLS. Noted, not chosen.
- Needs the owner's Neon project + Cloudflare account; out of scope for Phase 1.

## Integration points (from the code brief)

- `start()` — parse `?mode/seed/dur`; route to `showModePicker()`.
- `bootWorld(seedOverride)` — already accepts the forced seed.
- `stepEconomy()` — guard the quota block + `basePressure` behind mode; add the
  time-up end check after `G.time+=dt`; tally `computeRendered`/`deadRendered` at the
  recipe in/out sites; apply the Dread soft-throttle in challenge.
- `renderQuota()` / `renderAlert()` — challenge-mode branches.
- `simStep()` — gate autosave to campaign.
- New: `showModePicker()`, `showChallengeEnd()`, `endChallenge()`, best-score
  getter/setter, share-URL builder, peak-rate sampler.
- `tools/sim3dtest.js` — expose new fns/fields in `__T` for headless tests.

## Testability (headless, TDD)

- **Cumulative compute** grows monotonically and equals the sum of Datacenter
  outputs.
- **Timer expiry:** with `mode='challenge'`, stepping past `challengeDur` ends the
  run and the quota tithe never fires (no `level++`, compute not drained).
- **Quota suppression:** in challenge, past grace+period, `quota.level` unchanged and
  `stock.compute` not decremented.
- **Soft loss:** a sustained max-Dread challenge run does NOT set `G.over` from a
  breach (campaign still does).
- **Seed determinism:** two challenge sims with the same forced seed yield identical
  `computeRendered`.
- **Score:** the blended-score function is pure and unit-tested against known inputs.
- **Campaign untouched:** all existing 48 assertions stay green.

## Phasing

- **Phase 1 (ships on GitHub Pages, no backend):** mode picker, clock, quota-off,
  soft-loss, blended scoring, end screen, local best, share link. Fully TDD.
- **Phase 2:** Neon + Cloudflare Worker leaderboard, end-screen submit/display.

## Out of scope

- Resuming an in-progress challenge after refresh (Phase 1).
- Server-side seed-replay score verification (possible Phase 2+ hardening).
- New audio/art beyond reusing the existing set.
