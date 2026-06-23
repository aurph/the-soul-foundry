# THE SOUL FOUNDRY — Challenge Edition, Phase 1 — Implementation Plan

Date: 2026-06-22
Spec: `docs/superpowers/specs/2026-06-22-challenge-edition-design.md`

## Goal

Add a second game mode — a timed, shareable **Challenge** (10 / 20 / 30 min) — alongside
the existing **Campaign**, behind a start-screen mode picker. Challenge suppresses the
quota/tithe loop, is very hard to lose (the clock is the only end), tracks a blended
score, shows an end screen with a local best + share link, and never clobbers the
campaign save. Phase 1 ships on GitHub Pages with **no backend** (leaderboard is Phase 2,
explicitly out of scope).

## Architecture

Everything lives in the single self-contained `game/index.html` (classic `<script>`,
deterministic fixed-step sim). Behaviour branches read through one tiny `MODES` config
object and a `(G.mode||'campaign')` default so campaign stays byte-compatible and a third
mode would stay a one-liner — matching the existing `setTempo`/`AFFINITY`/`UPKEEP` idiom.
New state hangs off the existing `G` global and is default-safe when absent (so old
`sf_save` blobs and the existing save/load test are unaffected). Headless tests in
`tools/sim3dtest.js` drive the new functions through the `__T` export, exactly as today.

## Tech Stack

- HTML5 / vanilla JS / Three.js (already vendored), no build step, no npm.
- Deterministic sim: fixed `1/30` s step, seeded `mulberry32` (`RNG`/`WORLD_SEED`). The
  sim NEVER calls `Math.random` (only cosmetics do). New sim code obeys this.
- Tests: `node tools/sim3dtest.js` and `node tools/boottest.js`. No npm script. The
  `ok(name,cond,extra)` helper prints PASS/FAIL and `process.exit(fail?1:0)`.
- Persistence: `localStorage` (`sf_save`, `sf_best_challenge_<dur>`).
- Deploy: `git push` to `main` → GitHub Pages. Out of scope here, but **one commit per
  task**.

## Global Constraints (exact values)

- `G.mode` ∈ `'campaign' | 'challenge'`; default **campaign**. Anything falsy reads as
  campaign (`(G.mode||'campaign')`). Save/load shape for campaign is **unchanged**.
- `MODES` config:
  ```js
  const MODES = {
    campaign:  { quota:true,  timeLimit:false, softLoss:false },
    challenge: { quota:false, timeLimit:true,  softLoss:true  },
  };
  ```
- Challenge durations (seconds): **10 min = 600**, **20 min = 1200**, **30 min = 1800**.
  Default `G.challengeDur = 600`.
- New `G` fields, all default-safe when absent: `G.mode`, `G.challengeDur`,
  `G.computeRendered`, `G.deadRendered`, `G.husksBoundRun`, `G.peakRate`, `G.rateWinAccum`,
  `G.rateWinT`.
- Score weights (named consts, the tunable knobs):
  ```js
  const SCORE_W_COMPUTE=100, SCORE_W_DEAD=3, SCORE_W_HUSK=30, SCORE_W_PEAK=20;
  // score = round( computeRendered*SCORE_W_COMPUTE + deadRendered*SCORE_W_DEAD
  //              + husksBoundRun*SCORE_W_HUSK + peakRate*SCORE_W_PEAK )
  ```
- Peak-rate sampler window: **10 s** (`PEAK_WIN=10`); `peakRate` is Compute-per-minute, so
  `rate = (computeInWindow / PEAK_WIN) * 60`.
- Challenge soft-throttle: at max Dread the Datacenter/refiner output multiplier bottoms
  at **0.35** (`DREAD_THROTTLE_MIN=0.35`); it scales the recipe progress, it never sets
  `G.over`.
- Local best key: `localStorage['sf_best_challenge_'+dur]` → `{score,seed,date}`.
- Share link: `?mode=challenge&seed=<seed>&dur=<dur>`.
- All existing **48** assertions stay green after every task.

## File Structure

This is a single-file game; the plan touches exactly two files:

- `game/index.html` — all game + sim + UI code (the `use strict` `<script>` block).
- `tools/sim3dtest.js` — headless economy tests; add new `__T` exports + new assertions.

`tools/boottest.js` is run only as a regression check (it must keep printing
`=== all world-build steps ran ===`); we do not edit it.

### Key line anchors in `game/index.html` (as of this plan)

- `bootWorld(seedOverride)` — line ~643 (already accepts a forced seed).
- `renderQuota()` — line ~1022; `renderAlert()` — line ~1029.
- `setTempo()` — line ~1242; the tempo picker markup in `showHelp()` — lines ~1297–1299.
- `showEnd(win,why)` — line ~1309; `showOverlayHTML`/`hideOverlay` — ~1312–1313.
- `getGrain`/`setGrain` getter/setter idiom — lines ~1316–1317.
- `simStep(dt)` autosave — line ~1428.
- `serializeState()` — ~1474; `applySave()` — ~1493; `saveGame`/`readSave`/`loadGame` —
  ~1506–1510.
- `start()` — line ~1512; `beforeunload` autosave — line ~1522; `start();` call — ~1525.
- `const G={...}` — line ~1760; `WIN_LEVEL=8` — line ~1759.
- `addStock(r,n)` — line ~1791.
- `stepEconomy(dt)` — line ~2169; production/recipe loop — ~2182–2191 (Compute is output
  at ~2189 via `addStock(r,rec.out[r])`); Dread `basePressure` — ~2196–2197; quota block —
  ~2210–2217; breach-loss — ~2222; `G.time=(G.time||0)+dt` — line ~2223.
- `endGame(win,why)` — line ~2247 (clears `sf_save`, calls `showEnd`).
- `__T` export — `tools/sim3dtest.js` line ~8.

## How the tests drive things (idiom recap)

`tools/sim3dtest.js` loads the `<script>` body into a VM sandbox, strips the `start();`
call, and appends a `this.__T={...}` export. The sandbox stubs THREE + DOM;
`location.search` is `""` and `localStorage` is **not** stubbed in sim3dtest (so any new
code reading `localStorage` must be wrapped in try/catch, which the existing
`getGrain`/`saveGame` already are). Tests reset world arrays with
`T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.G.over=null;` then call
`T.seedSettlement()` / `T.placeBuildingFree(...)` / `T.stepEconomy(1/30)` directly. Pattern
for a new assertion: `ok("name", condition, "extra debug")`.

---

# Tasks

> Each task: write the failing test FIRST, run to watch it fail, write the minimal impl,
> run to watch it pass, confirm all 48 prior assertions still green, then **commit**
> (`git commit -m "..."`, identity Jack Schwartz <jacksch45@gmail.com>, NO co-authored-by).

---

## Task 1 — Mode state + MODES config + campaign-safe defaults + `__T` exposure

Introduce `G.mode`, `G.challengeDur`, the `MODES` object, and a `modeCfg()` helper, and
expose them to tests. Pure scaffolding — no behaviour changes yet. Campaign defaults must
be untouched.

**Files:** `game/index.html`, `tools/sim3dtest.js`

**Steps:**

1. **Write failing test.** In `tools/sim3dtest.js`, add a new block after the
   `save/load round-trips` block (before `=== research rites ===`):
   ```js
   // --- mode config (Challenge Edition) ---
   { ok("MODES config exists with campaign + challenge", !!(T.MODES&&T.MODES.campaign&&T.MODES.challenge),
        "keys="+(T.MODES?Object.keys(T.MODES).join(","):"none"));
     ok("campaign reads as the default mode", T.modeCfg().quota===true && T.modeCfg().timeLimit===false,
        "default quota="+T.modeCfg().quota);
     T.G.mode='challenge';
     ok("challenge mode disables quota + enables timeLimit + softLoss",
        T.modeCfg().quota===false && T.modeCfg().timeLimit===true && T.modeCfg().softLoss===true,
        "quota="+T.modeCfg().quota+" timeLimit="+T.modeCfg().timeLimit+" softLoss="+T.modeCfg().softLoss);
     T.G.mode=undefined;
     ok("absent mode still reads campaign (save-compat)", T.modeCfg().quota===true, "quota="+T.modeCfg().quota);
   }
   ```
2. **Run to see it fail.** `node tools/sim3dtest.js` → the new block FAILs (`T.MODES`/
   `T.modeCfg` undefined). Confirm the prior 48 still pass.
3. **Minimal impl — add config.** In `game/index.html`, immediately after the `const G={...}`
   / `RES_ORDER.forEach(...)` lines (~1762), add:
   ```js
   // --- game modes: campaign (the tithe-survival game) | challenge (timed score run) ---
   const MODES = {
     campaign:  { quota:true,  timeLimit:false, softLoss:false },
     challenge: { quota:false, timeLimit:true,  softLoss:true  },
   };
   function modeCfg(){ return MODES[G.mode||'campaign']||MODES.campaign; }
   ```
   Do NOT add `G.mode` to the `const G={...}` initializer — leaving it absent is what keeps
   `(G.mode||'campaign')` and the save shape correct.
4. **Minimal impl — expose in `__T`.** In `tools/sim3dtest.js` line ~8, extend the export
   object with `,MODES,modeCfg`:
   ```js
   code+=`\n;this.__T={G,buildings,villagers,nodes,BLD,placeBuildingFree,placeBuilding,spawnVillager,assignHusk,stepEconomy,stepHusks,placeNode,seedSettlement,terrainHeight,canAfford,buildingWorkSpot,buildingFits,genRegions,storageCap,addStock,pileFill,updateStockpiles,serializeState,applySave,SND,techMul,RES,bindHusk,affinity,casteRole,CARRY,GRATE,MODES,modeCfg};`;
   ```
5. **Run to see green.** `node tools/sim3dtest.js` → new block PASSes; total now **52
   passed, 0 failed**. Run `node tools/boottest.js` → still `=== all world-build steps ran ===`.
6. **Commit.** `git commit -am "Challenge: mode state + MODES config + modeCfg() defaults"`

---

## Task 2 — Cumulative scoring tallies (computeRendered / deadRendered / husksBoundRun / peakRate)

Tally the four score components at their deterministic sim sites. They always run (cheap,
mode-agnostic) so they are easy to test via the existing full-chain sim, and the end
screen later just reads them. Add a reset helper so a run starts clean.

**Files:** `game/index.html`, `tools/sim3dtest.js`

**Steps:**

1. **Write failing test.** In `tools/sim3dtest.js`, append after the Task-1 block:
   ```js
   // --- challenge scoring tallies ---
   { T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.G.over=null;
     T.resetRunScore();
     ok("resetRunScore zeroes the tallies",
        T.G.computeRendered===0 && T.G.deadRendered===0 && T.G.husksBoundRun===0 && T.G.peakRate===0,
        "c="+T.G.computeRendered+" d="+T.G.deadRendered+" h="+T.G.husksBoundRun+" p="+T.G.peakRate);
     // bound husks tally
     T.placeBuildingFree("den",6,6); T.placeBuildingFree("pyre",0,0);
     T.G.stock.dead=5; T.G.stock.compute=10;
     T.bindHusk();
     ok("husksBoundRun increments when a husk is bound", T.G.husksBoundRun===1, "h="+T.G.husksBoundRun);
     // compute + dead throughput tally over a full-chain run
     T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.G.over=null; T.G.time=999;
     T.resetRunScore();
     T.placeBuildingFree("stockpile",0,-12);
     const cr=T.placeBuildingFree("crematory",-8,0), dc=T.placeBuildingFree("datacenter",8,0);
     for(let i=0;i<3;i++) T.assignHusk(T.spawnVillager(-8,2,"reaper"),cr);
     for(let i=0;i<4;i++) T.assignHusk(T.spawnVillager(8,2,"reaper"),dc);
     for(let st=0;st<30*200;st++){ T.G.stock.dead=100000; T.G.stock.soulash=300; T.G.stock.bonesil=0; T.G.stock.ichor=0;
       T.G.stock.core=100000; T.G.stock.power=100000; T.stepHusks(1/30); T.stepEconomy(1/30); }
     ok("deadRendered tallies Crematory throughput", T.G.deadRendered>0, "deadRendered="+Math.floor(T.G.deadRendered));
     ok("computeRendered tallies Datacenter output", T.G.computeRendered>0, "computeRendered="+Math.floor(T.G.computeRendered));
     ok("computeRendered equals total Datacenter compute out (cyc*3)", Math.abs(T.G.computeRendered-dc.cyc*3)<1e-6,
        "computeRendered="+T.G.computeRendered+" expected="+dc.cyc*3);
     ok("peakRate observed a positive Compute/min", T.G.peakRate>0, "peakRate="+T.G.peakRate.toFixed(1));
   }
   ```
2. **Run to see it fail.** `node tools/sim3dtest.js` → fails (`resetRunScore` undefined,
   tallies undefined).
3. **Minimal impl — reset helper.** In `game/index.html`, right after `modeCfg()` (Task 1),
   add:
   ```js
   const PEAK_WIN=10; // seconds — peak Compute/min sampling window
   function resetRunScore(){
     G.computeRendered=0; G.deadRendered=0; G.husksBoundRun=0; G.peakRate=0;
     G.rateWinAccum=0; G.rateWinT=PEAK_WIN;
   }
   ```
4. **Minimal impl — compute + dead tally in the recipe loop.** In `stepEconomy`, inside the
   production loop where a cycle completes (the `if(b.prog>=rec.time){...}` line, ~2189),
   change the output-accumulation line so it also tallies. Replace:
   ```js
   if(b.prog>=rec.time){ b.prog-=rec.time; for(const r in rec.in)G.stock[r]-=rec.in[r]; for(const r in rec.out)addStock(r,rec.out[r]); b.cyc++; }
   ```
   with:
   ```js
   if(b.prog>=rec.time){ b.prog-=rec.time;
     for(const r in rec.in){ G.stock[r]-=rec.in[r]; if(r==='dead'&&b.def.kind==='refine') G.deadRendered=(G.deadRendered||0)+rec.in[r]; }
     for(const r in rec.out){ addStock(r,rec.out[r]); if(r==='compute'){ G.computeRendered=(G.computeRendered||0)+rec.out[r]; G.rateWinAccum=(G.rateWinAccum||0)+rec.out[r]; } }
     b.cyc++; }
   ```
   (The `r==='dead'&&b.def.kind==='refine'` guard targets the Crematory, the only refiner
   that consumes corpses, matching the spec's "dead consumed by Crematories".)
5. **Minimal impl — peak-rate sampler.** Still in `stepEconomy`, just before
   `G.time=(G.time||0)+dt;` (~2223), add:
   ```js
   // peak Compute-per-minute over a rolling PEAK_WIN window (deterministic; reads tallies only)
   G.rateWinT=(G.rateWinT==null?PEAK_WIN:G.rateWinT)-dt;
   if(G.rateWinT<=0){ const r=((G.rateWinAccum||0)/PEAK_WIN)*60; if(r>(G.peakRate||0)) G.peakRate=r; G.rateWinAccum=0; G.rateWinT=PEAK_WIN; }
   ```
6. **Minimal impl — husk bind tally.** In `bindHusk`, on the success path (right after the
   `spawnVillager(...)` / `SND.sfx('rise')` line, ~2244), add:
   ```js
   G.husksBoundRun=(G.husksBoundRun||0)+1;
   ```
7. **Minimal impl — expose helper + zero-init.** Add `resetRunScore` to the `__T` export in
   `tools/sim3dtest.js` (append `,resetRunScore`). Also call `resetRunScore()` once at the
   top of `seedSettlement()` (so a fresh game starts with zeroed tallies, and the test's
   `resetRunScore()` is belt-and-suspenders).
8. **Run to see green.** `node tools/sim3dtest.js` → new tallies pass; total **57 passed**.
   Verify the existing `production scales with caste affinity` assertion (which also runs a
   Crematory/Datacenter sim) still passes — the tally additions are side-effect-only.
9. **Run boottest.** `node tools/boottest.js` → `=== all world-build steps ran ===`
   (`seedSettlement` now calls `resetRunScore`; confirm no throw).
10. **Commit.** `git commit -am "Challenge: cumulative score tallies (compute/dead/husks/peakRate)"`

---

## Task 3 — Challenge clock + time-up end + quota/basePressure suppression

In challenge mode: no quota block, no Dread `basePressure`, and when `G.time>=G.challengeDur`
the run ends via `endChallenge()`. Campaign is unchanged. `renderQuota`/`renderAlert` get
challenge branches.

**Files:** `game/index.html`, `tools/sim3dtest.js`

**Steps:**

1. **Write failing test.** Append to `tools/sim3dtest.js`:
   ```js
   // --- challenge clock + quota suppression ---
   { T.buildings.length=0; T.villagers.length=0; T.nodes.length=0;
     // CAMPAIGN baseline: quota still fires past grace
     T.G.mode='campaign'; T.G.over=null; T.G.time=999; T.G.graceT=0;
     T.G.quota={need:5,period:150,t:0.001,level:1}; T.G.stock.compute=50;
     T.stepEconomy(1/30);
     ok("campaign: quota still levels up past grace", T.G.quota.level===2 && T.G.stock.compute<50,
        "lvl="+T.G.quota.level+" compute="+T.G.stock.compute);
     // CHALLENGE: same setup, quota must NOT fire
     T.buildings.length=0; T.villagers.length=0; T.nodes.length=0;
     T.G.mode='challenge'; T.G.challengeDur=600; T.G.over=null; T.G.time=300; T.G.graceT=0;
     T.G.quota={need:5,period:150,t:0.001,level:1}; T.G.stock.compute=50; T.G.endedChallenge=false;
     T.stepEconomy(1/30);
     ok("challenge: quota level is untouched", T.G.quota.level===1, "lvl="+T.G.quota.level);
     ok("challenge: compute is NOT drained by a tithe", T.G.stock.compute===50, "compute="+T.G.stock.compute);
     // CHALLENGE: time-up ends the run
     T.G.time=T.G.challengeDur-0.001; T.G.over=null; T.G.endedChallenge=false;
     T.stepEconomy(1/30);
     ok("challenge: hitting challengeDur ends the run", T.G.over==='time' || T.G.endedChallenge===true,
        "over="+T.G.over+" ended="+T.G.endedChallenge);
     T.G.mode=undefined;
   }
   ```
   (Note: `endChallenge()` calls `showChallengeEnd()` which is DOM/localStorage; both are
   safe-guarded — `$('modal')` returns a stub element and the best-score read is in
   try/catch. The assertion checks the state flag, not the overlay.)
2. **Run to see it fail.** `node tools/sim3dtest.js` → challenge assertions fail (quota
   still fires, no time-up end).
3. **Minimal impl — `endChallenge` stub.** In `game/index.html`, just above `endGame` (~2247),
   add:
   ```js
   function endChallenge(){ if(G.over) return; G.over='time'; G.endedChallenge=true; paused=true;
     if(typeof SND!=="undefined") SND.sfx('bell');
     // NB: do NOT remove sf_save here — a challenge run must never clobber the campaign save
     if(typeof showChallengeEnd==="function") showChallengeEnd(); }
   ```
4. **Minimal impl — gate the quota block.** In `stepEconomy`, wrap the quota block
   (~2210–2217) so it only runs in campaign. Change:
   ```js
   if(!grace){ G.quota.t-=dt;
     ... existing tithe logic ...
   } }
   ```
   to:
   ```js
   if(modeCfg().quota && !grace){ G.quota.t-=dt;
     ... existing tithe logic ...
   } }
   ```
5. **Minimal impl — suppress basePressure in challenge.** Change the `basePressure` line
   (~2196) from:
   ```js
   const basePressure=grace?0:(G.basePressure||0.6);
   ```
   to:
   ```js
   const basePressure=(grace||!modeCfg().quota)?0:(G.basePressure||0.6);
   ```
   (Dread can still rise from backlog via the `-renderers`/`-wards` terms; we only drop the
   constant push, per spec.)
6. **Minimal impl — time-up end.** In `stepEconomy`, right after `G.time=(G.time||0)+dt;`
   (~2223), add:
   ```js
   if(modeCfg().timeLimit && (G.time||0)>=(G.challengeDur||0)) endChallenge();
   ```
7. **Minimal impl — `renderQuota` branch.** At the top of `renderQuota()` (~1022), before
   `const q=G.quota`, add:
   ```js
   if(modeCfg().timeLimit){ const left=Math.max(0,(G.challengeDur||0)-(G.time||0)); const m=Math.floor(left/60), s=Math.floor(left%60);
     const red=left<30; $('quota').innerHTML=`<b style="color:${red?'#9e3b2c':'var(--ember)'}">TIME ${m}:${String(s).padStart(2,'0')}</b> &nbsp;·&nbsp; score <b>${challengeScore()}</b>`; return; }
   ```
   (`challengeScore()` is added in Task 5; until then this references an undefined function.
   To keep the game runnable BETWEEN tasks, temporarily inline `(G.computeRendered||0)` here
   and swap to `challengeScore()` in Task 5 — OR sequence Task 5 before wiring this line.
   Chosen approach: inline `${Math.round((G.computeRendered||0)*100)}` now, replace in Task 5
   step 6. Note the placeholder in the commit message.)
8. **Minimal impl — `renderAlert` branch.** At the top of `renderAlert()` body, after the
   `if(G.over){...}` guard (~1029), add an early challenge branch that suppresses
   quota-specific advice:
   ```js
   if(modeCfg().timeLimit){ const pop=villagers.filter(v=>!v.dead).length;
     let msg=''; if(pop===0) msg="No husks bound. Open the Binding Pyre and bind one (1 corpse + 2 Compute).";
     else if((G.stock.soulash||0)<=0.5) msg="Soul-ash is out — your husks weaken. Staff a Crematory.";
     else if(!buildings.some(b=>b.kind==="datacenter"&&b.workers.length>0)) msg="No Datacenter running — staff the chain end to render Compute and score.";
     if(msg){ el.textContent=msg; el.classList.add('show'); } else el.classList.remove('show'); return; }
   ```
9. **Run to see green.** `node tools/sim3dtest.js` → challenge clock/quota assertions pass;
   campaign quota assertion still passes (proves campaign untouched). Total **62 passed**.
10. **Run boottest.** `node tools/boottest.js` → unchanged.
11. **Commit.** `git commit -am "Challenge: clock + time-up end + quota/basePressure suppression (score placeholder)"`

---

## Task 4 — Very-hard-to-lose: soft Dread throttle, no breach-loss, crew rebind

In challenge mode, max Dread throttles refiner/Datacenter output (a multiplier) instead of
ending the run; the breach-loss is disabled. If the crew bottoms out, the player simply
rebinds (cheap — they start with a crew); we do not auto-end on extinction in challenge.

**Files:** `game/index.html`, `tools/sim3dtest.js`

**Steps:**

1. **Write failing test.** Append to `tools/sim3dtest.js`:
   ```js
   // --- challenge: very hard to lose (no breach-loss; Dread throttles, not kills) ---
   { // CAMPAIGN: sustained max Dread still breaches -> over
     T.buildings.length=0; T.villagers.length=0; T.nodes.length=0;
     T.G.mode='campaign'; T.G.over=null; T.G.time=999; T.G.graceT=0; T.G.dread=100; T.G.breach=0;
     T.spawnVillager(0,0,"reaper");
     for(let s=0;s<30*20 && !T.G.over;s++){ T.G.dread=100; T.stepEconomy(1/30); }
     ok("campaign: sustained max Dread breaches (over=lose)", T.G.over==='lose', "over="+T.G.over);
     // CHALLENGE: sustained max Dread does NOT end the run
     T.buildings.length=0; T.villagers.length=0; T.nodes.length=0;
     T.G.mode='challenge'; T.G.challengeDur=600; T.G.over=null; T.G.time=10; T.G.graceT=0; T.G.dread=100; T.G.breach=0; T.G.endedChallenge=false;
     T.spawnVillager(0,0,"reaper");
     for(let s=0;s<30*30;s++){ T.G.dread=100; T.G.time=10; T.stepEconomy(1/30); }
     ok("challenge: sustained max Dread does NOT set over", !T.G.over, "over="+T.G.over);
     // CHALLENGE: empty crew does not auto-end (player rebinds)
     T.buildings.length=0; T.villagers.length=0; T.nodes.length=0;
     T.G.mode='challenge'; T.G.over=null; T.G.time=300; T.G.dread=0; T.G.endedChallenge=false;
     for(let s=0;s<30*5;s++) T.stepEconomy(1/30);
     ok("challenge: zero crew does not end the run", !T.G.over, "over="+T.G.over);
     // throttle multiplier: dreadThrottle(100) is reduced, dreadThrottle(0) is 1
     ok("dreadThrottle is 1 at zero Dread", Math.abs(T.dreadThrottle(0)-1)<1e-9, "t0="+T.dreadThrottle(0));
     ok("dreadThrottle bottoms at DREAD_THROTTLE_MIN at max Dread", T.dreadThrottle(100)<1 && T.dreadThrottle(100)>=0.34,
        "t100="+T.dreadThrottle(100).toFixed(2));
     T.G.mode=undefined;
   }
   ```
2. **Run to see it fail.** `node tools/sim3dtest.js` → challenge soft-loss assertions fail
   (`dreadThrottle` undefined; challenge run currently breaches + auto-ends on extinction).
3. **Minimal impl — throttle helper.** Near `modeCfg()` / `resetRunScore` add:
   ```js
   const DREAD_THROTTLE_MIN=0.35;
   // challenge soft-loss: max Dread throttles output (never ends the run). Campaign uses the breach-loss instead.
   function dreadThrottle(d){ const f=clamp(d/100,0,1); return 1-(1-DREAD_THROTTLE_MIN)*f; }
   ```
4. **Minimal impl — apply throttle to production.** In `stepEconomy`'s production loop,
   where progress advances (`b.prog+=dt*aff;`, ~2188), apply the multiplier in challenge.
   Change:
   ```js
   if(b.built!==false&&present>0&&inOk&&outOk){ b.active=true; b.prog+=dt*aff; if(b.def.render)renderers++;
   ```
   to:
   ```js
   if(b.built!==false&&present>0&&inOk&&outOk){ b.active=true; b.prog+=dt*aff*(modeCfg().softLoss?dreadThrottle(G.dread):1); if(b.def.render)renderers++;
   ```
5. **Minimal impl — disable breach-loss + extinction auto-end in challenge.** Change the
   breach-loss line (~2222):
   ```js
   if(G.dread>=100){ G.breach=(G.breach||0)+dt; if(G.breach>=15) endGame(false,"breach"); } else G.breach=0;
   ```
   to:
   ```js
   if(!modeCfg().softLoss){ if(G.dread>=100){ G.breach=(G.breach||0)+dt; if(G.breach>=15) endGame(false,"breach"); } else G.breach=0; }
   else G.breach=0;
   ```
   And the extinction line (~2221):
   ```js
   if(villagers.filter(v=>!v.dead).length===0 && G.time>20) endGame(false,"extinct");
   ```
   to:
   ```js
   if(!modeCfg().softLoss && villagers.filter(v=>!v.dead).length===0 && G.time>20) endGame(false,"extinct");
   ```
6. **Minimal impl — expose helper.** Add `,dreadThrottle` to the `__T` export.
7. **Run to see green.** `node tools/sim3dtest.js` → soft-loss assertions pass; the campaign
   breach assertion proves campaign still loses. Total **67 passed**.
8. **Run boottest.** `node tools/boottest.js` → unchanged.
9. **Commit.** `git commit -am "Challenge: very-hard-to-lose (Dread soft-throttle, no breach/extinction end)"`

---

## Task 5 — Blended score function (pure, unit-tested)

A pure `computeScore(c,d,h,p)` against known inputs, plus a `challengeScore()` reading live
`G` tallies. Then swap the `renderQuota` placeholder from Task 3 to `challengeScore()`.

**Files:** `game/index.html`, `tools/sim3dtest.js`

**Steps:**

1. **Write failing test.** Append to `tools/sim3dtest.js`:
   ```js
   // --- blended score (pure) ---
   { ok("computeScore is the weighted sum, rounded",
        T.computeScore(10,20,3,12)===Math.round(10*100+20*3+3*30+12*20),
        "got="+T.computeScore(10,20,3,12)+" expected="+Math.round(10*100+20*3+3*30+12*20));
     ok("computeScore is zero for an empty run", T.computeScore(0,0,0,0)===0, "got="+T.computeScore(0,0,0,0));
     ok("computeScore rounds fractional peakRate", T.computeScore(0,0,0,1.5)===Math.round(1.5*20), "got="+T.computeScore(0,0,0,1.5));
     T.G.computeRendered=5; T.G.deadRendered=10; T.G.husksBoundRun=2; T.G.peakRate=8;
     ok("challengeScore reads the live G tallies",
        T.challengeScore()===T.computeScore(5,10,2,8), "got="+T.challengeScore());
   }
   ```
2. **Run to see it fail.** `node tools/sim3dtest.js` → fails (`computeScore`/`challengeScore`
   undefined).
3. **Minimal impl — weights + pure function.** Near `dreadThrottle` add:
   ```js
   const SCORE_W_COMPUTE=100, SCORE_W_DEAD=3, SCORE_W_HUSK=30, SCORE_W_PEAK=20;
   function computeScore(c,d,h,p){ return Math.round((c||0)*SCORE_W_COMPUTE + (d||0)*SCORE_W_DEAD + (h||0)*SCORE_W_HUSK + (p||0)*SCORE_W_PEAK); }
   function challengeScore(){ return computeScore(G.computeRendered,G.deadRendered,G.husksBoundRun,G.peakRate); }
   ```
4. **Minimal impl — expose.** Add `,computeScore,challengeScore` to the `__T` export.
5. **Run to see green.** `node tools/sim3dtest.js` → score assertions pass. Total **71 passed**.
6. **Wire the live banner.** Replace the Task-3 placeholder in `renderQuota` — change
   `score <b>${Math.round((G.computeRendered||0)*100)}</b>` to `score <b>${challengeScore()}</b>`.
   (Now the banner shows the true blended score.)
7. **Run again.** `node tools/sim3dtest.js` still **71 passed**; `node tools/boottest.js`
   unchanged.
8. **Commit.** `git commit -am "Challenge: pure blended score function + live banner score"`

---

## Task 6 — URL param parse (`?mode/seed/dur`) + seed determinism

Parse `URLSearchParams(location.search)` for `mode`, `seed`, `dur` in `start()`, route to
the picker, and prove two same-seed challenge sims produce identical `computeRendered`.
Because the sandbox `location.search` is `""`, the determinism test drives `bootWorld(seed)`
+ `seedSettlement()` directly; the URL parse itself is verified by a small pure helper.

**Files:** `game/index.html`, `tools/sim3dtest.js`

**Steps:**

1. **Write failing test.** Append to `tools/sim3dtest.js`:
   ```js
   // --- URL params + seed determinism ---
   { ok("parseParams reads mode/seed/dur", (()=>{ const p=T.parseParams('?mode=challenge&seed=42&dur=1200');
        return p.mode==='challenge'&&p.seed===42&&p.dur===1200; })(), "parsed="+JSON.stringify(T.parseParams('?mode=challenge&seed=42&dur=1200')));
     ok("parseParams is empty-safe", (()=>{ const p=T.parseParams(''); return p.mode==null&&p.seed==null&&p.dur==null; })(), "empty");
     ok("parseParams clamps an out-of-range dur to a preset", [600,1200,1800].includes(T.parseParams('?dur=99999').dur)||T.parseParams('?dur=99999').dur==null, "dur="+T.parseParams('?dur=99999').dur);
     // determinism: same forced seed -> identical computeRendered
     function runSeed(seed){ T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.G.over=null;
       T.G.mode='challenge'; T.G.challengeDur=600; T.bootWorld(seed); T.resetRunScore();
       T.seedSettlement();
       // raise + staff a deterministic chain
       const cr=T.placeBuildingFree("crematory",-8,0), dc=T.placeBuildingFree("datacenter",8,0);
       for(let i=0;i<3;i++) T.assignHusk(T.spawnVillager(-8,2,"reaper"),cr);
       for(let i=0;i<4;i++) T.assignHusk(T.spawnVillager(8,2,"reaper"),dc);
       for(let st=0;st<30*120;st++){ T.G.stock.dead=100000; T.G.stock.soulash=300; T.G.stock.core=100000; T.G.stock.power=100000; T.G.stock.ichor=100000;
         T.stepHusks(1/30); T.stepEconomy(1/30); }
       return T.G.computeRendered; }
     const a=runSeed(12345), b=runSeed(12345);
     ok("same forced seed yields identical computeRendered (determinism)", a===b, "a="+a+" b="+b);
     T.G.mode=undefined;
   }
   ```
   (`bootWorld` is DOM-heavy — it calls `resize`/`buildTerrain`/`requestAnimationFrame`.
   The sim3dtest sandbox stubs all of these as no-ops, and `requestAnimationFrame` returns
   0, so `bootWorld(seed)` runs headless; it must be added to `__T`. If `bootWorld` proves
   noisy in the VM, fall back to seeding RNG directly via a tiny `__T` hook
   `seedRNG:(s)=>{WORLD_SEED=s;RNG=mulberry32(s);genRegions(s);}` like boottest's `__seed`,
   and call that instead of `bootWorld` in `runSeed`. Prefer `bootWorld`; use the fallback
   only if it throws.)
2. **Run to see it fail.** `node tools/sim3dtest.js` → fails (`parseParams`/`bootWorld` not
   exposed).
3. **Minimal impl — pure parser.** Near `start()` (~1512) add:
   ```js
   function parseParams(search){ const p=new URLSearchParams(search||'');
     const out={mode:null,seed:null,dur:null};
     const m=p.get('mode'); if(m==='challenge'||m==='campaign') out.mode=m;
     const s=p.get('seed'); if(s!=null && s!=='' && isFinite(+s)) out.seed=(+s)|0;
     const d=p.get('dur'); if(d!=null && [600,1200,1800].includes(+d)) out.dur=+d;
     return out; }
   ```
4. **Minimal impl — route in `start()`.** Replace the body of `start()` so it reads the
   params and routes. New `start()`:
   ```js
   function start(){
     setGrain(getGrain()); loadTut();
     const params=parseParams(location.search);
     const save=readSave();
     loadVillager(ok=>{
       if(params.mode==='challenge'){
         G.mode='challenge'; G.challengeDur=params.dur||600;
         bootWorld(params.seed!=null?params.seed:null); seedSettlement(); resetRunScore();
         paused=true; if(typeof buildRail==="function") buildRail();
         setTimeout(()=>{ try{ showModePicker(params); }catch(e){} }, 600);
         return;
       }
       bootWorld(save?save.seed:null);
       if(!(save&&loadGame())){ seedSettlement(); setTimeout(()=>{ try{ let seen=false; try{seen=localStorage.getItem('sf_prologue')==='seen';}catch(e){} if(seen)showHelp(); else showPrologue(); }catch(e){} }, 700); }
       paused=true; if(typeof buildRail==="function") buildRail();
     });
   }
   ```
   `showModePicker` is added in Task 7; until then guard with `typeof showModePicker==="function"`.
   To keep the build runnable between tasks, the `setTimeout(...)` already wraps it in
   try/catch — if `showModePicker` is absent the picker just doesn't show, which is fine for
   a same-session build (no challenge URL yet). NOTE this in the commit; Task 7 finishes it.
5. **Minimal impl — expose.** Add `,parseParams,bootWorld` to the `__T` export. (If the
   fallback was needed, also add `seedRNG`.)
6. **Run to see green.** `node tools/sim3dtest.js` → param + determinism assertions pass.
   Total **76 passed**.
7. **Run boottest.** `node tools/boottest.js` → unchanged.
8. **Commit.** `git commit -am "Challenge: URL ?mode/seed/dur parse + start() routing + seed determinism"`

---

## Task 7 — Mode picker UI (`showModePicker`)

The first overlay: **Campaign** | **Challenge**; choosing Challenge reveals 10/20/30
buttons + a seed line (random, or from the URL); **Begin** un-pauses and starts. Cloned
from the `showHelp` tempo-picker idiom. UI-only — no headless assertion (DOM), but it must
not break the test load (the function only runs in the browser via `start()`).

**Files:** `game/index.html`

**Steps:**

1. **Add `showModePicker`.** Just below `showHelp` (~1308), add a function that renders the
   picker into the standard overlay (`showOverlayHTML`), using existing `.btn` styling. It
   tracks a module-local `_pickDur` and `_pickSeed`:
   ```js
   let _pickDur=600, _pickSeed=null;
   function showModePicker(params){ SND.resume(); params=params||{};
     if(params.dur) _pickDur=params.dur;
     if(params.seed!=null) _pickSeed=params.seed;
     const durBtn=(d,lbl)=>`<span class="btn" style="${_pickDur===d?'border-color:var(--ember);color:var(--ember)':''}" onclick="pickDur(${d})">${lbl}</span>`;
     const isChal=(G.mode||'campaign')==='challenge';
     showOverlayHTML(`<h1 style="font-size:24px">THE SOUL FOUNDRY</h1>
       <h2>choose how you play</h2>
       <p style="line-height:1.7"><b>Campaign</b> — the tithe-survival game: meet ${WIN_LEVEL} quotas of Compute and the engine endures. <br>
       <b>Challenge</b> — a timed score run: render as much Compute as you can before the clock runs out. Shareable seed, local best.</p>
       <p><span class="btn" style="${!isChal?'border-color:var(--ember);color:var(--ember)':''}" onclick="pickMode('campaign')">Campaign</span>
          <span class="btn" style="${isChal?'border-color:var(--ember);color:var(--ember)':''}" onclick="pickMode('challenge')">Challenge</span></p>
       ${isChal?`<p style="margin-top:8px"><b>Duration</b><br>${durBtn(600,'10 min')} ${durBtn(1200,'20 min')} ${durBtn(1800,'30 min')}</p>
         <p style="color:var(--ink-dim);font-size:12px">Seed <b style="color:var(--ember-soft)">${_pickSeed!=null?_pickSeed:'random'}</b> — a shared link reproduces the exact run.</p>`:''}
       <p style="margin-top:10px"><span class="btn" onclick="beginFromPicker()">Begin</span></p>`); }
   function pickMode(m){ G.mode=m; if(m==='campaign'){ G.mode=undefined; } showModePicker(); }
   function pickDur(d){ _pickDur=d; showModePicker(); }
   function beginFromPicker(){
     if((G.mode||'campaign')==='challenge'){
       const seed=_pickSeed!=null?_pickSeed:((Date.now())%1e6)|0;
       _pickSeed=seed; G.mode='challenge'; G.challengeDur=_pickDur;
       clearDynamic(); bootWorld(seed); seedSettlement(); resetRunScore(); G.time=0; G.over=null; G.endedChallenge=false;
     }
     hideOverlay(); beginPlay();
   }
   ```
   (Note: `pickMode('campaign')` sets `G.mode=undefined` so the campaign branch and save
   shape stay clean. The challenge `beginFromPicker` re-boots with the chosen seed so the
   picker's seed line is authoritative.)
2. **Show the picker on a fresh campaign start too.** In `start()` (Task 6), the
   non-challenge path currently jumps straight to prologue/help. Leave that for resume
   (`save` exists), but for a brand-new game with NO save and NO URL mode, route through the
   picker so the player can pick Challenge. Adjust the non-challenge branch:
   ```js
   if(!(save&&loadGame())){
     seedSettlement();
     setTimeout(()=>{ try{ if(typeof showModePicker==="function") showModePicker(params);
       else { let seen=false; try{seen=localStorage.getItem('sf_prologue')==='seen';}catch(e){} if(seen)showHelp(); else showPrologue(); } }catch(e){} }, 700);
   }
   ```
   (Resume still skips the picker and restores the campaign save directly. Prologue/help
   remain reachable from within the picker's Campaign → Begin → existing help flow if
   desired; keep it simple — Begin just starts.)
3. **Manual smoke (browser).** Open `game/index.html`, confirm: picker shows; Challenge
   reveals duration + seed; Begin starts a paused-then-running challenge; the banner shows
   `TIME mm:ss · score N`. (No automated assertion — note it as a manual check in the
   commit body.)
4. **Run tests.** `node tools/sim3dtest.js` → still **76 passed** (the new functions are
   never called headlessly; they only need to parse without error at load). `node
   tools/boottest.js` → unchanged.
5. **Commit.** `git commit -am "Challenge: mode picker overlay (Campaign/Challenge + 10/20/30 + seed)"`

---

## Task 8 — Challenge end screen + local best + share link (`showChallengeEnd`)

The end overlay: big score, four-part breakdown, seed + duration, local best for that
duration (celebrate if beaten), a **share link** button, and **Again** (new random seed) /
**Retry** (same seed). Best read/write uses the `getGrain`/`setGrain` getter/setter idiom
and must NOT touch `sf_save`. Add a headless test for the best getter/setter and the share
URL builder (both pure-ish; the overlay render itself is browser-only).

**Files:** `game/index.html`, `tools/sim3dtest.js`

**Steps:**

1. **Write failing test.** Append to `tools/sim3dtest.js` (guarded — `localStorage` is NOT
   stubbed in sim3dtest, so the getter/setter must degrade gracefully; we assert the share
   builder unconditionally and the best round-trip only if storage is available):
   ```js
   // --- challenge end: share link + best round-trip ---
   { ok("shareURL builds a reproducible challenge link",
        T.shareURL(42,1200)==='?mode=challenge&seed=42&dur=1200', "got="+T.shareURL(42,1200));
     // best getter/setter is try/catch-wrapped; with no localStorage it returns null and no-ops without throwing
     let threwB=null, got=null;
     try{ T.setChallengeBest(1200,{score:9999,seed:42,date:'2026-06-22'}); got=T.getChallengeBest(1200); }catch(e){ threwB=e; }
     ok("best getter/setter never throws headless", !threwB, threwB?String(threwB):"ok");
     // if storage worked, it round-trips; if not (sandbox), got is null — both acceptable
     ok("best round-trips when storage is present (else null headless)",
        got===null || (got&&got.score===9999&&got.seed===42), "got="+JSON.stringify(got));
   }
   ```
2. **Run to see it fail.** `node tools/sim3dtest.js` → fails (`shareURL`,
   `getChallengeBest`, `setChallengeBest` undefined).
3. **Minimal impl — best getter/setter + share builder.** Near `getGrain`/`setGrain`
   (~1316) add:
   ```js
   function getChallengeBest(dur){ try{ const s=localStorage.getItem('sf_best_challenge_'+dur); return s?JSON.parse(s):null; }catch(e){ return null; } }
   function setChallengeBest(dur,rec){ try{ localStorage.setItem('sf_best_challenge_'+dur,JSON.stringify(rec)); return true; }catch(e){ return false; } }
   function shareURL(seed,dur){ return '?mode=challenge&seed='+(seed|0)+'&dur='+(dur|0); }
   ```
4. **Minimal impl — expose.** Add `,getChallengeBest,setChallengeBest,shareURL` to `__T`.
5. **Run to see green.** `node tools/sim3dtest.js` → the three end-screen helper assertions
   pass. Total **79 passed**.
6. **Minimal impl — the overlay (browser-only).** Below `showEnd` (~1311) add
   `showChallengeEnd()`. It computes the final score, reads/writes the best (writing only if
   beaten), and renders. It must NOT call `localStorage.removeItem('sf_save')`:
   ```js
   function showChallengeEnd(){
     const dur=G.challengeDur||600, seed=WORLD_SEED;
     const c=G.computeRendered||0, d=G.deadRendered||0, h=G.husksBoundRun||0, p=G.peakRate||0;
     const score=challengeScore();
     const prev=getChallengeBest(dur); const beat=!prev || score>prev.score;
     if(beat) setChallengeBest(dur,{score,seed,date:new Date().toISOString().slice(0,10)});
     const best=getChallengeBest(dur);
     const mm=Math.floor(dur/60);
     const row=(lbl,val,w)=>`<div class="row"><span>${lbl} <span style="color:var(--ink-dim)">×${w}</span></span><b>${val}</b></div>`;
     const link=location.origin+location.pathname+shareURL(seed,dur);
     showOverlayHTML(`<h1 style="color:#caa15f">RUN COMPLETE</h1>
       <h2>${mm}-minute challenge · seed ${seed}</h2>
       <div style="text-align:center;margin:6px 0 10px"><div style="font-size:46px;font-family:'Grenze Gotisch',serif;color:var(--ember)">${score}</div>
         <div style="color:var(--ink-dim);font-size:12px">${beat?'NEW LOCAL BEST':'best for '+mm+' min: '+(best?best.score:'—')}</div></div>
       <div style="border:1px solid var(--line);border-radius:6px;padding:8px 12px;font-size:12.5px">
         ${row('Compute rendered',Math.floor(c),SCORE_W_COMPUTE)}
         ${row('Dead rendered',Math.floor(d),SCORE_W_DEAD)}
         ${row('Husks bound',h,SCORE_W_HUSK)}
         ${row('Peak Compute/min',Math.round(p),SCORE_W_PEAK)}</div>
       <p style="margin-top:10px">
         <span class="btn" onclick="(function(){try{navigator.clipboard&&navigator.clipboard.writeText('${link}');toast('Share link copied.','good');}catch(e){}})()">Copy share link</span>
         <span class="btn" onclick="location.href='${shareURL(seed,dur)}'">Retry (same seed)</span>
         <span class="btn" onclick="location.href='?mode=challenge&dur=${dur}'">Again (new seed)</span></p>
       <p style="font-size:11px;color:var(--ink-dim);word-break:break-all">${link}</p>`); }
   ```
   (Retry keeps the seed; Again drops `seed` so `start()` rolls a fresh one. Both go through
   the URL so the run cleanly reboots.)
7. **Wire `endChallenge` → `showChallengeEnd`.** Already wired in Task 3
   (`if(typeof showChallengeEnd==="function") showChallengeEnd();`). Confirm it now resolves.
8. **Manual smoke (browser).** Run a 10-min challenge (or temporarily set `G.challengeDur`
   small via console), let the clock expire, confirm the end screen shows the score +
   breakdown + best + share link, and that `localStorage.getItem('sf_save')` is unchanged
   (campaign save survives). Note as a manual check.
9. **Run tests.** `node tools/sim3dtest.js` → **79 passed**; `node tools/boottest.js`
   unchanged.
10. **Commit.** `git commit -am "Challenge: end screen + local best (sf_best_challenge_<dur>) + share/Retry/Again"`

---

## Task 9 — Autosave gating (challenge never clobbers `sf_save`)

Gate the `simStep` periodic autosave AND the `beforeunload` save to campaign only, so a
challenge run can never overwrite the campaign save. Add a headless test that proves
`serializeState` is still campaign-shaped and that a guarded `saveGame` path is mode-aware.

**Files:** `game/index.html`, `tools/sim3dtest.js`

**Steps:**

1. **Write failing test.** Append to `tools/sim3dtest.js`. Since `localStorage` is unstubbed
   here, we test the *gate predicate* (`shouldAutosave()`), not the write itself:
   ```js
   // --- autosave gated to campaign ---
   { T.G.mode='campaign'; ok("campaign autosaves", T.shouldAutosave()===true, "campaign="+T.shouldAutosave());
     T.G.mode='challenge'; ok("challenge does NOT autosave", T.shouldAutosave()===false, "challenge="+T.shouldAutosave());
     T.G.mode=undefined; ok("absent mode autosaves (campaign default)", T.shouldAutosave()===true, "default="+T.shouldAutosave());
     // campaign save shape is still intact (round-trip already covered; re-assert key fields)
     T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.G.over=null; T.G.mode=undefined;
     T.seedSettlement(); const snap=T.serializeState();
     ok("serializeState still campaign-shaped (no mode leak breaks load)", snap.G&&snap.G.quota&&typeof snap.seed==='number', "keys="+Object.keys(snap).join(","));
   }
   ```
2. **Run to see it fail.** `node tools/sim3dtest.js` → fails (`shouldAutosave` undefined).
3. **Minimal impl — gate predicate.** Near `saveGame` (~1506) add:
   ```js
   function shouldAutosave(){ return (G.mode||'campaign')==='campaign'; }
   ```
4. **Minimal impl — gate the periodic autosave.** In `simStep` (~1428) change:
   ```js
   G.autosaveT=(G.autosaveT==null?25:G.autosaveT)-dt; if(G.autosaveT<=0){ G.autosaveT=25; saveGame(); }
   ```
   to:
   ```js
   G.autosaveT=(G.autosaveT==null?25:G.autosaveT)-dt; if(G.autosaveT<=0){ G.autosaveT=25; if(shouldAutosave()) saveGame(); }
   ```
5. **Minimal impl — gate `beforeunload`.** Change (~1522):
   ```js
   addEventListener('beforeunload',()=>{ try{ if(!G.over) saveGame(); }catch(e){} });
   ```
   to:
   ```js
   addEventListener('beforeunload',()=>{ try{ if(!G.over && shouldAutosave()) saveGame(); }catch(e){} });
   ```
6. **Minimal impl — expose.** Add `,shouldAutosave` to the `__T` export.
7. **Run to see green.** `node tools/sim3dtest.js` → autosave-gating assertions pass; the
   existing save/load round-trip assertions still pass (campaign shape intact). Total **83
   passed**.
8. **Run boottest.** `node tools/boottest.js` → unchanged.
9. **Commit.** `git commit -am "Challenge: gate autosave + beforeunload to campaign (never clobber sf_save)"`

---

## Task 10 — Final verification + docs

Full green sweep, a manual browser pass of both modes, and a short build-log note.

**Files:** (verification only; optional log note)

**Steps:**

1. **Full test sweep.** Run both, capture output:
   ```
   node tools/sim3dtest.js
   node tools/boottest.js
   ```
   Confirm sim3dtest prints `=== 83 passed, 0 failed ===` (48 original + 35 new) and
   boottest prints `=== all world-build steps ran ===`. If the count differs, reconcile
   against the per-task running totals (52, 57, 62, 67, 71, 76, 79, 83).
2. **Manual browser pass — Campaign unaffected.** Open `game/index.html` with no URL params.
   Picker → Campaign → Begin: confirm the GRACE banner, tithe banner, and a real tithe fire
   as before; reload mid-run and confirm the autosave restored the campaign (proves save
   path untouched).
3. **Manual browser pass — Challenge.** Open `?mode=challenge&seed=42&dur=600`. Confirm: the
   picker shows seed 42 + 10 min; Begin starts the clock; banner reads `TIME mm:ss · score
   N`; no tithe ever fires; Dread can rise but never ends the run; at expiry the end screen
   shows score + breakdown + best + share link; **Retry** reuses seed 42 (identical run),
   **Again** rolls a new seed. Confirm `localStorage.sf_save` is unchanged after a challenge.
4. **Determinism spot-check.** In two tabs open the same `?mode=challenge&seed=42&dur=600`,
   play identically (or just let both idle) and confirm the score tracks the same — the
   determinism unit test already guarantees the sim, this is a sanity check.
5. **Optional: build log.** If a build-log convention exists under `docs/`, add a one-line
   entry: "Challenge Edition Phase 1 shipped — mode picker, clock, quota-off, soft-loss,
   blended score, end screen, local best, share link. 83 assertions green. Phase 2
   (Neon/Worker leaderboard) deferred." Do NOT create a new doc file otherwise.
6. **Commit.** `git commit -am "Challenge: Phase 1 verification — 83 assertions green, both modes manually confirmed"`
   (If only verification ran with no file change, fold this note into the Task 9 commit
   instead — do not create an empty commit.)

---

# Self-review — spec coverage

| Spec requirement | Covered by |
|---|---|
| `G.mode` `'campaign'|'challenge'`, default campaign, falsy=campaign | Task 1 (`MODES`, `modeCfg`, no `G.mode` in initializer) |
| `MODES` config object (quota/timeLimit/softLoss) | Task 1 |
| New `G` fields default-safe when absent | Tasks 1–2 (all `(G.x||0)` reads; `resetRunScore`) |
| Mode picker first overlay (Campaign/Challenge + 10/20/30 + seed line) | Task 7 (`showModePicker`) |
| `start()` parses `?mode/seed/dur`; forced seed → `bootWorld(seedOverride)` | Task 6 (`parseParams`, `start()` rewrite) |
| Clock: `G.time>=challengeDur` ends run; banner `TIME mm:ss · score N`, red <30s; no grace | Tasks 3 (`endChallenge`, time-up, `renderQuota` branch) + 5 (live score) |
| Quota/tithe block + `basePressure` disabled in challenge | Task 3 (`modeCfg().quota` gates) |
| Very hard to lose: Dread throttles output, no breach-loss; rebind on empty crew | Task 4 (`dreadThrottle`, gated breach + extinction) |
| `renderAlert` suppresses quota advice in challenge | Task 3 (challenge branch) |
| Tally `computeRendered` at Datacenter output (excl. starter/bought) | Task 2 (recipe-loop `compute` out tally) |
| Tally `deadRendered` (Crematory throughput) | Task 2 (`r==='dead' && kind==='refine'`) |
| Tally `husksBoundRun` | Task 2 (`bindHusk` success path) |
| `peakRate` from a rolling sample (Compute/min) | Task 2 (`PEAK_WIN` sampler) |
| Blended score, weights as named consts, pure + unit-tested | Task 5 (`SCORE_W_*`, `computeScore`, test) |
| End screen: score + four-part breakdown + seed/dur + local best + share + Again/Retry; no `sf_save` wipe | Task 8 (`showChallengeEnd`) |
| Local best `sf_best_challenge_<dur>` `{score,seed,date}`, getter/setter idiom | Task 8 (`getChallengeBest`/`setChallengeBest`) |
| Share link `?mode=challenge&seed=…&dur=…` | Task 8 (`shareURL`) |
| Autosave (`simStep`) + `beforeunload` gated to campaign | Task 9 (`shouldAutosave`) |
| `serializeState`/`applySave` campaign shape unchanged; save/load test green | Tasks 1 & 9 (no `G.mode` in save; re-assert shape) |
| Determinism: same seed → identical `computeRendered` | Task 6 |
| All existing 48 assertions stay green | every task re-runs both suites |
| Deterministic sim, no `Math.random` in new sim code | Tasks 2 & 4 (tallies/throttle use `G`/`dt` only) |
| `__T` exposes new fns/fields for headless tests | Tasks 1,2,4,5,6,8,9 (export extended each time) |
| One commit per task; identity Jack Schwartz, no co-authored-by | every task ends with a commit |
| NO leaderboard / Neon / Worker (Phase 2) | out of scope — not in any task |

**Risks / watch-items noted while planning:**

1. **`renderQuota` placeholder ordering (Task 3 ↔ 5).** Task 3 wires the challenge banner but
   `challengeScore()` doesn't exist until Task 5; the plan inlines `(G.computeRendered||0)*100`
   in Task 3 and swaps it in Task 5 so the game stays runnable between commits. Don't ship
   Task 3's commit assuming the final score string.
2. **`bootWorld` in the sim3dtest VM (Task 6).** `bootWorld` calls `resize`,
   `requestAnimationFrame(loop)`, `setTimeout`, and DOM removal. The sandbox stubs these as
   no-ops (`requestAnimationFrame`→0, `setTimeout` real but harmless), so it should run, but
   if it throws, use the documented `seedRNG` fallback hook (mirrors boottest's `__seed`).
3. **`localStorage` is unstubbed in sim3dtest.** The best getter/setter test (Task 8) asserts
   "no throw" + "null-or-round-trip" precisely because writes may silently fail in the VM.
   Keep every storage call in try/catch (matches `getGrain`/`saveGame`).
4. **Test count is illustrative.** Running totals (52→83) assume each new block adds the
   asserted number of `ok(...)` calls. If you add/remove an assertion, update Task 10's
   expected `=== N passed ===` accordingly; the invariant that matters is **0 failed** and
   the original 48 intact.
5. **Picker on fresh campaign (Task 7 step 2).** Routing a brand-new campaign through the
   picker changes first-run UX (picker before prologue). If the owner prefers prologue-first
   for campaign, keep the picker challenge-only (URL-driven) and revert step 2 — campaign
   defaults are unaffected either way.
6. **`deadRendered` definition.** Spec says "dead consumed by Crematories (throughput)." The
   Task-2 guard keys on `b.def.kind==='refine'` + input `dead`; the Crematory is the only
   refiner consuming `dead`, so this is exact, but if a future building also consumes `dead`
   as a refine input the tally would widen — fine for Phase 1, flag for Phase 2.
7. **`endChallenge` idempotency.** Guarded by `if(G.over) return;` and the `timeLimit`
   check fires every step past `challengeDur`; the guard ensures the end screen shows once.
   Confirmed safe in the Task-3 test (single end).
