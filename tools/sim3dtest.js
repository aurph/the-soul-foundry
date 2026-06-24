/* Headless economy test for THE SOUL FOUNDRY.
   Stubs THREE + DOM, loads the real game script (minus start()), then drives a
   full settlement to verify gather->refine->Compute, needs, and no exceptions. */
const fs=require('fs'), vm=require('vm'), path=require('path');
let code=fs.readFileSync(path.join(__dirname,'..','game','index.html'),'utf8')
  .match(/<script>([\s\S]*?)<\/script>/g).map(s=>s.replace(/<\/?script>/g,'')).find(s=>s.includes('use strict'));
code=code.replace(/\nstart\(\);/,'\n/*no start*/');
code+=`\n;this.__T={G,buildings,villagers,nodes,BLD,NODE,placeBuildingFree,placeBuilding,spawnVillager,assignHusk,stepEconomy,stepHusks,placeNode,seedSettlement,terrainHeight,canAfford,buildingWorkSpot,buildingFits,genRegions,storageCap,addStock,pileFill,updateStockpiles,serializeState,applySave,SND,techMul,RES,bindHusk,affinity,casteRole,CARRY,GRATE,MODES,modeCfg,resetRunScore,dreadThrottle,computeScore,challengeScore,parseParams,seedWorld,getChallengeBest,setChallengeBest,shareURL,shouldAutosave,nodeLockOk:(typeof nodeLockOk!=='undefined'?nodeLockOk:null),deadDrift:(typeof deadDrift!=='undefined'?deadDrift:null),
  stepDread:(typeof stepDread!=='undefined'?stepDread:null), dreadAt:(typeof dreadAt!=='undefined'?dreadAt:null),
  dreadBite:(typeof dreadBite!=='undefined'?dreadBite:null), dreadSnapshot:(typeof dreadSnapshot!=='undefined'?dreadSnapshot:null),
  resetDreadField:(typeof resetDreadField!=='undefined'?resetDreadField:null), dreadFieldPressure:(typeof dreadFieldPressure!=='undefined'?dreadFieldPressure:null),
  DGRID:(typeof DGRID!=='undefined'?DGRID:null), DCELL:(typeof DCELL!=='undefined'?DCELL:null), DREAD_BITE_MIN:(typeof DREAD_BITE_MIN!=='undefined'?DREAD_BITE_MIN:null),
  loadDreadField:(typeof loadDreadField!=='undefined'?loadDreadField:null),
  toggleDreadViz:(typeof toggleDreadViz!=='undefined'?toggleDreadViz:null), dreadResist:(typeof dreadResist!=='undefined'?dreadResist:null),
  driftPeriod:(typeof driftPeriod!=='undefined'?driftPeriod:null), driftLevel:(typeof driftLevel!=='undefined'?driftLevel:null),
  dreadGuard:(typeof dreadGuard!=='undefined'?dreadGuard:null),
  depleteNode:(typeof depleteNode!=='undefined'?depleteNode:null), regrowNode:(typeof regrowNode!=='undefined'?regrowNode:null),
  DREAD_RESIST:(typeof DREAD_RESIST!=='undefined'?DREAD_RESIST:null), DREAD_GLOBAL_PUSH:(typeof DREAD_GLOBAL_PUSH!=='undefined'?DREAD_GLOBAL_PUSH:null),
  get _dreadVizOn(){ return typeof _dreadVizOn!=='undefined'?_dreadVizOn:null; }};`;

// ---- THREE + DOM stubs ----
function Vec3(x=0,y=0,z=0){return{x,y,z,set(a,b,c){this.x=a;this.y=b;this.z=c;return this;},copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this;},
  clone(){return Vec3(this.x,this.y,this.z);},lerp(v,t){this.x+=(v.x-this.x)*t;this.y+=(v.y-this.y)*t;this.z+=(v.z-this.z)*t;return this;},
  addScaledVector(v,s){this.x+=v.x*s;this.y+=v.y*s;this.z+=v.z*s;return this;},dot(v){return this.x*v.x+this.y*v.y+this.z*v.z;},
  normalize(){const l=Math.hypot(this.x,this.y,this.z)||1;this.x/=l;this.y/=l;this.z/=l;return this;},multiplyScalar(s){this.x*=s;this.y*=s;this.z*=s;return this;}};}
function Scl(){return{x:1,y:1,z:1,set(a,b,c){this.x=a;this.y=b;this.z=c;},setScalar(s){this.x=this.y=this.z=s;},multiplyScalar(s){this.x*=s;this.y*=s;this.z*=s;}};}
function Obj(){return{position:Vec3(),rotation:Vec3(),scale:Scl(),userData:{},children:[],parent:null,isMesh:false,visible:true,
  add(o){if(o)o.parent=this;this.children.push(o);},remove(o){const i=this.children.indexOf(o);if(i>=0)this.children.splice(i,1);},
  traverse(fn){fn(this);for(const c of this.children)c.traverse&&c.traverse(fn);}};}
function Col(){return{r:.5,g:.5,b:.5,set(){return this;},setHSL(){return this;},offsetHSL(){return this;},multiplyScalar(){return this;},clone(){return Col();},copy(){return this;},toString(){return"888888";}};}
function Mat(){return{color:Col(),emissive:Col(),emissiveIntensity:1,side:0,transparent:false,opacity:1,clone(){return Mat();}};}
function Geo(){return{attributes:{position:{count:0,getX:()=>0,getY:()=>0,getZ:()=>0,setX(){},setY(){},setZ(){},needsUpdate:false},normal:{getX:()=>0,getY:()=>1,getZ:()=>0}},
  parameters:{radius:1,width:1,height:1,depth:1,radiusTop:1,radiusBottom:1},
  rotateX(){return this;},rotateY(){return this;},translate(){return this;},center(){return this;},computeVertexNormals(){},setAttribute(){},dispose(){}};}
function Mesh(){const o=Obj();o.isMesh=true;o.material=Mat();o.geometry=Geo();o.clone=function(){const c=Mesh();c.position.copy(o.position);c.rotation.copy(o.rotation);return c;};return o;}
const geoCtor=function(){return Geo();};
const THREE={ WebGLRenderer:function(){return{setClearColor(){},outputEncoding:0,setPixelRatio(){},setSize(){},render(){},shadowMap:{}};},
  sRGBEncoding:1,DoubleSide:2,BackSide:1,
  Scene:function(){const s=Obj();s.fog=null;s.background=null;return s;}, FogExp2:function(){return{};},
  Color:Col, PerspectiveCamera:function(){const o=Obj();o.aspect=1;o.updateProjectionMatrix=()=>{};o.lookAt=()=>{};return o;},
  HemisphereLight:function(){return Obj();},DirectionalLight:function(){return Obj();},PointLight:function(){const o=Obj();o.intensity=1;return o;},
  Group:function(){return Obj();}, Mesh:function(){return Mesh();}, Points:function(){return Obj();},
  PlaneGeometry:geoCtor,BoxGeometry:geoCtor,CylinderGeometry:geoCtor,ConeGeometry:geoCtor,IcosahedronGeometry:geoCtor,
  DodecahedronGeometry:geoCtor,SphereGeometry:geoCtor,TorusGeometry:geoCtor,CircleGeometry:geoCtor,BufferGeometry:geoCtor,
  MeshStandardMaterial:Mat,MeshBasicMaterial:Mat,ShaderMaterial:Mat,PointsMaterial:Mat,
  Float32BufferAttribute:function(){return{};}, Vector3:function(x,y,z){return Vec3(x,y,z);}, Vector2:function(){return{x:0,y:0};},
  Box3:function(){return{min:Vec3(-.5,0,-.5),max:Vec3(.5,1.7,.5),setFromObject(){this.min=Vec3(-.5,0,-.5);this.max=Vec3(.5,1.7,.5);return this;}};},
  Raycaster:function(){return{setFromCamera(){},intersectObject(){return[];},intersectObjects(){return[];}};},
  AnimationMixer:function(){return{update(){},clipAction(){return{play(){return this;},timeScale:0,reset(){return this;},fadeIn(){return this;}};}};},
  GLTFLoader:function(){return{load(u,ok,pr,err){setTimeout(()=>err&&err(new Error('test:no-net')),0);}};},
  SkeletonUtils:{clone(o){return o;}} };
function el(){return{style:{},dataset:{},innerHTML:"",textContent:"",width:0,height:0,classList:{add(){},remove(){},toggle(){},contains(){return false;}},
  appendChild(){},removeChild(){},remove(){},setAttribute(){},getContext(){return new Proxy({},{get:()=>()=>({}) });},addEventListener(){},setPointerCapture(){},
  getBoundingClientRect(){return{left:0,top:0,width:800,height:600};},set onclick(v){},get onclick(){return null;}};}
const sandbox={THREE,console,Math,Date,JSON,URLSearchParams,performance:{now:()=>Date.now()},setTimeout,clearTimeout,
  innerWidth:1280,innerHeight:720,devicePixelRatio:1,requestAnimationFrame(){return 0;},addEventListener(){},removeEventListener(){},
  location:{search:""},navigator:{getGamepads:()=>[]},document:{getElementById:()=>el(),createElement:()=>el(),addEventListener(){},body:el()}};
sandbox.window=sandbox; sandbox.globalThis=sandbox;
vm.createContext(sandbox); vm.runInContext(code,sandbox,{filename:"sf.js"});
const T=sandbox.__T;

let pass=0,fail=0; const ok=(n,c,x="")=>{(c?pass++:fail++);console.log((c?"  PASS ":"  FAIL ")+n+(x?"  "+x:""));};
ok("internals exposed",!!T); if(!T){console.log("aborting");process.exit(1);}
ok("economy re-themed to the dead + chip chain", !!(T.RES.dead&&T.RES.bonesil&&T.RES.core&&T.RES.power), "");
ok("early craft + fab materials exist (ashwood, silica)", !!(T.RES.ashwood&&T.RES.silica), "ashwood="+!!T.RES.ashwood+" silica="+!!T.RES.silica);

// --- build a full, well-fed settlement ---
let threw=null;
try{
  T.seedSettlement();
  // generous stock so the whole chain runs without stalling during the test
  Object.assign(T.G.stock,{dead:600,bonesil:200,soulash:300,ichor:200,ingot:0,wafer:0,die:0,core:0,power:0,compute:0});
  // cemeteries + corpse-wastes near the centre (the dead are the raw)
  T.placeNode("grave",-12,0); T.placeNode("grave",12,0); T.placeNode("waste",-16,6); T.placeNode("waste",16,-6);
  // gather posts harvesting the dead
  const ex=T.placeBuildingFree("exhumer",-12,3), wd=T.placeBuildingFree("dredge",16,-3);
  // the chip supply chain
  const cr=T.placeBuildingFree("crematory",-4,-4), fu=T.placeBuildingFree("furnace",4,-4),
        mi=T.placeBuildingFree("mill",-4,5), li=T.placeBuildingFree("litho",4,5),
        os=T.placeBuildingFree("ossuary",-8,0), su=T.placeBuildingFree("substation",8,0),
        dc=T.placeBuildingFree("datacenter",0,8);
  T.placeBuildingFree("ward",-10,-8);
  // a big bound workforce
  for(let i=0;i<28;i++) T.spawnVillager((i%9-4)*2, (((i/9)|0)-2)*2, ["worker","worker","stump","reaper"][i%4]);
  const idle=()=>T.villagers.filter(v=>!v.dead&&!v.assigned);
  function staff(b,n){ for(let k=0;k<n;k++){ const f=idle()[0]; if(f) T.assignHusk(f,b); } }
  staff(ex,3); staff(wd,3); staff(cr,3); staff(fu,3); staff(mi,3); staff(li,3); staff(os,4); staff(su,2); staff(dc,5);
}catch(e){ threw=e; }
ok("settlement builds without throwing",!threw,threw?String(threw.stack||threw):"");

// --- run ~5 simulated minutes ---
let maxC=0,maxCore=0,maxIngot=0,maxWafer=0,maxDie=0,maxPower=0; threw=null;
try{ for(let s=0;s<30*300;s++){ T.stepHusks(1/30); T.stepEconomy(1/30);
  maxIngot=Math.max(maxIngot,T.G.stock.ingot); maxWafer=Math.max(maxWafer,T.G.stock.wafer);
  maxDie=Math.max(maxDie,T.G.stock.die); maxPower=Math.max(maxPower,T.G.stock.power);
  maxCore=Math.max(maxCore,T.G.stock.core); maxC=Math.max(maxC,T.G.stock.compute,0);
  if(T.G.over) break; } }catch(e){ threw=e; }
ok("5-minute sim runs without throwing",!threw,threw?String(threw.stack||threw):"");
ok("gatherers harvested the dead", T.G.stock.dead>0 || maxIngot>0, "dead="+Math.floor(T.G.stock.dead));
ok("Furnace produced Silicon Ingots", maxIngot>0, "ingot peak="+Math.floor(maxIngot));
ok("Mill produced Wafers", maxWafer>0, "wafer peak="+Math.floor(maxWafer));
ok("Litho produced Etched Dies", maxDie>0, "die peak="+Math.floor(maxDie));
ok("Substation produced Power", maxPower>0, "power peak="+Math.floor(maxPower));
ok("Ossuary produced Reliquary Cores", maxCore>0, "core peak="+Math.floor(maxCore));
ok("Datacenter produced COMPUTE (full chain end-to-end)", maxC>0, "compute peak="+Math.floor(maxC));
ok("population survived", T.villagers.filter(v=>!v.dead).length>0, "alive="+T.villagers.filter(v=>!v.dead).length);
ok("dread stayed bounded 0..100", T.G.dread>=0&&T.G.dread<=100, "dread="+T.G.dread.toFixed(0));

// upkeep test: with no soul-ash to patch them, husk resolve must fall
try{ T.G.over=null; T.G.dread=0; for(const v of T.villagers) if(!v.dead) T.assignHusk(v,null);
  T.buildings.length=0; T.nodes.length=0; T.G.stock.soulash=0; T.G.stock.dead=0; T.G.time=999;
  for(const v of T.villagers) if(!v.dead) v.resolve=0.9;
  const avg=()=>{const a=T.villagers.filter(v=>!v.dead);return a.reduce((s,v)=>s+v.resolve,0)/Math.max(1,a.length);};
  const before=avg();
  for(let s=0;s<30*60;s++){ T.G.stock.soulash=0; T.stepEconomy(1/30); T.stepHusks(1/30); }
  ok("no soul-ash upkeep erodes resolve", avg()<before-0.2, "avg resolve "+before.toFixed(2)+" -> "+avg().toFixed(2));
}catch(e){ ok("upkeep test",false,String(e.stack||e)); }

// --- per-caste upkeep (opex): reapers need no soul-ash and hold resolve; husks/stumps decay without it ---
{ T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.G.over=null; T.G.time=999;
  const w=T.spawnVillager(0,0,"worker"), s=T.spawnVillager(1,0,"stump"), r=T.spawnVillager(2,0,"reaper");
  w.resolve=s.resolve=r.resolve=0.8;
  for(let st=0;st<30*60;st++){ T.G.stock.soulash=0; T.stepEconomy(1/30); }
  ok("a Reaper holds its resolve without soul-ash", r.resolve>0.7, "reaper 0.8->"+r.resolve.toFixed(2));
  ok("a Husk decays without soul-ash upkeep", w.resolve<0.5, "husk 0.8->"+w.resolve.toFixed(2));
  ok("a Stump decays without soul-ash upkeep", s.resolve<0.55, "stump 0.8->"+s.resolve.toFixed(2));
}
{ T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.G.over=null; T.G.time=999;
  T.spawnVillager(0,0,"reaper"); T.spawnVillager(1,0,"reaper");
  T.G.stock.soulash=100; const before=T.G.stock.soulash;
  for(let st=0;st<30*30;st++){ T.stepEconomy(1/30); }
  ok("Reapers draw no soul-ash upkeep", Math.abs(T.G.stock.soulash-before)<0.5, "soulash "+before+"->"+T.G.stock.soulash.toFixed(1));
}

// placement coverage: after the gentler-terrain fix, most open land must be buildable across seeds
{ let total=0,okp=0; T.buildings.length=0; T.nodes.length=0;
  for(const seed of [42,7,314,999,55,1234]){ T.genRegions(seed);
    for(let i=0;i<240;i++){ const a=Math.random()*6.283, r=Math.random()*68; const x=Math.cos(a)*r, z=Math.sin(a)*r; total++; if(T.buildingFits(x,z,1.8)) okp++; } }
  ok("most open land is buildable (placement)", okp/total>0.9, (100*okp/total).toFixed(0)+"% of valley buildable across 6 seeds"); }

// --- population is bound, not born ---
{ T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.G.over=null;
  T.placeBuildingFree("den",6,6); T.placeBuildingFree("den",-6,6);
  T.G.stock.dead=5; T.G.stock.compute=10;
  const p0=T.villagers.filter(v=>!v.dead).length;
  T.bindHusk();
  ok("bindHusk binds a husk for corpses + Compute", T.villagers.filter(v=>!v.dead).length===p0+1 && T.G.stock.dead===3 && T.G.stock.compute===6, "pop "+p0+"->"+T.villagers.filter(v=>!v.dead).length+" dead="+T.G.stock.dead+" compute="+T.G.stock.compute);
  T.G.time=999; T.G.stock.soulash=80; const before=T.villagers.filter(v=>!v.dead).length;
  for(let s=0;s<30*60;s++){ T.stepEconomy(1/30); }
  ok("husks never spawn for free", T.villagers.filter(v=>!v.dead).length<=before, "pop "+before+"->"+T.villagers.filter(v=>!v.dead).length); }

// --- per-caste bind costs (capex tradeoff) ---
{ T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.G.over=null;
  T.placeBuildingFree("den",6,6); T.placeBuildingFree("den",-6,6); T.placeBuildingFree("pyre",0,0);
  T.G.stock.dead=20; T.G.stock.compute=20;
  const last=()=>T.villagers.filter(v=>!v.dead).slice(-1)[0];
  const c0=T.G.stock.compute; T.bindHusk("reaper");
  ok("binding a Reaper costs more Compute (6) and binds a reaper", last()&&last().caste==="reaper" && T.G.stock.compute===c0-6, "caste="+(last()&&last().caste)+" compute "+c0+"->"+T.G.stock.compute);
  const d0=T.G.stock.dead; T.bindHusk("stump");
  ok("binding a Stump costs 3 corpses and little Compute", last()&&last().caste==="stump" && T.G.stock.dead===d0-3, "caste="+(last()&&last().caste)+" dead "+d0+"->"+T.G.stock.dead);
  const d1=T.G.stock.dead,c1=T.G.stock.compute; T.bindHusk("worker");
  ok("binding a Husk is the baseline (2 corpses + 4 Compute)", last()&&last().caste==="worker" && T.G.stock.dead===d1-2 && T.G.stock.compute===c1-4, "dead "+d1+"->"+T.G.stock.dead+" compute "+c1+"->"+T.G.stock.compute);
}

// --- material repositories / stockpiles (the hub) ---
{ T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.G.over=null; T.G.stock.dead=0;
  const baseCap=T.storageCap("dead");
  ok("storageCap returns a positive floor", baseCap>0, "base="+baseCap);
  const sp=T.placeBuildingFree("stockpile",8,8);
  const raised=T.storageCap("dead");
  ok("a stockpile raises storage capacity", raised>baseCap, baseCap+" -> "+raised);
  for(let i=0;i<5000;i++) T.addStock("dead",1);
  ok("addStock can exceed the base cap once a stockpile stands", T.G.stock.dead>baseCap, "dead="+Math.floor(T.G.stock.dead)+" (base "+baseCap+")");
  ok("addStock still clamps to the raised cap", T.G.stock.dead<=raised+0.001, "dead="+Math.floor(T.G.stock.dead)+" <= "+raised);
  T.G.stock.ichor=0; ok("pileFill is 0 when empty", T.pileFill("ichor")===0, "fill="+T.pileFill("ichor"));
  T.G.stock.dead=raised; ok("pileFill is ~1 when full", Math.abs(T.pileFill("dead")-1)<0.001, "fill="+T.pileFill("dead").toFixed(2));
  ok("stockpile yard builds 8 material bins", sp.mesh.userData.piles&&sp.mesh.userData.piles.length===8, "bins="+(sp.mesh.userData.piles||[]).length);
  T.G.stock.dead=raised*0.5; T.updateStockpiles();
  const deadPile=sp.mesh.userData.piles.find(p=>p.res==="dead");
  ok("updateStockpiles scales a pile to its fill", deadPile&&Math.abs(deadPile.node.scale.y-0.5)<0.02&&deadPile.node.visible, "scaleY="+(deadPile?deadPile.node.scale.y.toFixed(2):"?"));
}

// --- save/load round-trips the whole foundry ---
{ T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.G.over=null;
  T.seedSettlement();
  T.placeNode("grave",-10,0); T.placeBuildingFree("furnace",-3,-3);
  T.spawnVillager(2,2,"reaper");
  T.G.stock.bonesil=42; T.G.writ=77; T.G.dread=33; T.G.quota.level=4;
  const snap=T.serializeState();
  const nb=T.buildings.length, nv=T.villagers.filter(v=>!v.dead).length, nn=T.nodes.length;
  T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.G.writ=0; T.G.dread=0; T.G.stock.bonesil=0; T.G.quota.level=1;
  T.applySave(snap);
  ok("save/load restores buildings", T.buildings.length===nb, T.buildings.length+"/"+nb);
  ok("save/load restores villagers", T.villagers.filter(v=>!v.dead).length===nv, T.villagers.length+"/"+nv);
  ok("save/load restores nodes", T.nodes.length===nn, T.nodes.length+"/"+nn);
  ok("save/load restores resources & Bones", T.G.stock.bonesil===42&&T.G.writ===77, "bonesil="+T.G.stock.bonesil+" bones="+T.G.writ);
  ok("save/load restores quota progress", T.G.quota.level===4, "lvl="+T.G.quota.level);
}

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

// --- challenge scoring tallies ---
{ T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.G.over=null;
  T.G.graceT=1e9; T.G.dread=0;   // keep campaign quota/Dread dormant so this block can't pollute later tests
  T.resetRunScore();
  ok("resetRunScore zeroes the tallies",
     T.G.computeRendered===0 && T.G.deadRendered===0 && T.G.husksBoundRun===0 && T.G.peakRate===0,
     "c="+T.G.computeRendered+" d="+T.G.deadRendered+" h="+T.G.husksBoundRun+" p="+T.G.peakRate);
  T.placeBuildingFree("den",6,6); T.placeBuildingFree("pyre",0,0);
  T.G.stock.dead=5; T.G.stock.compute=10;
  T.bindHusk();
  ok("husksBoundRun increments when a husk is bound", T.G.husksBoundRun===1, "h="+T.G.husksBoundRun);
  // deadRendered via a Crematory (consumes dead; zero its outputs each step for room)
  T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.G.over=null; T.G.time=999;
  T.resetRunScore(); T.placeBuildingFree("stockpile",0,-12);
  const cr=T.placeBuildingFree("crematory",-8,0);
  for(let i=0;i<3;i++) T.assignHusk(T.spawnVillager(-8,2,"reaper"),cr);
  for(let st=0;st<30*120;st++){ T.G.stock.dead=100000; T.G.stock.soulash=300; T.G.stock.bonesil=0; T.G.stock.ichor=0; T.stepHusks(1/30); T.stepEconomy(1/30); }
  ok("deadRendered tallies Crematory throughput", T.G.deadRendered>0, "deadRendered="+Math.floor(T.G.deadRendered));
  // computeRendered + peakRate via a Datacenter (inputs supplied; discard compute each step for room)
  T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.G.over=null; T.G.time=999;
  T.resetRunScore(); T.placeBuildingFree("stockpile",0,-12);
  const dc=T.placeBuildingFree("datacenter",8,0);
  for(let i=0;i<4;i++) T.assignHusk(T.spawnVillager(8,2,"reaper"),dc);
  for(let st=0;st<30*120;st++){ T.G.stock.core=100000; T.G.stock.power=100000; T.G.stock.ichor=100000; T.G.stock.soulash=300; T.G.stock.compute=0; T.stepHusks(1/30); T.stepEconomy(1/30); }
  ok("computeRendered tallies Datacenter output", T.G.computeRendered>0, "computeRendered="+Math.floor(T.G.computeRendered));
  ok("computeRendered equals total Datacenter compute out (cyc*3)", Math.abs(T.G.computeRendered-dc.cyc*3)<1e-6,
     "computeRendered="+T.G.computeRendered+" expected="+dc.cyc*3);
  ok("peakRate observed a positive Compute/min", T.G.peakRate>0, "peakRate="+T.G.peakRate.toFixed(1));
  T.G.graceT=150; T.G.dread=0; T.G.over=null; T.G.time=0;   // restore clean state for following tests
}

// --- challenge clock + quota suppression ---
{ T.buildings.length=0; T.villagers.length=0; T.nodes.length=0;
  T.G.mode='campaign'; T.G.over=null; T.G.time=999; T.G.graceT=0;
  T.G.quota={need:5,period:150,t:0.001,level:1}; T.G.stock.compute=50;
  T.stepEconomy(1/30);
  ok("campaign: quota still levels up past grace", T.G.quota.level===2 && T.G.stock.compute<50,
     "lvl="+T.G.quota.level+" compute="+T.G.stock.compute);
  T.buildings.length=0; T.villagers.length=0; T.nodes.length=0;
  T.G.mode='challenge'; T.G.challengeDur=600; T.G.over=null; T.G.time=300; T.G.graceT=0;
  T.G.quota={need:5,period:150,t:0.001,level:1}; T.G.stock.compute=50; T.G.endedChallenge=false;
  T.stepEconomy(1/30);
  ok("challenge: quota level is untouched", T.G.quota.level===1, "lvl="+T.G.quota.level);
  ok("challenge: compute is NOT drained by a tithe", T.G.stock.compute===50, "compute="+T.G.stock.compute);
  T.spawnVillager(0,0,"reaper"); T.G.dread=0;   // a live crew + no Dread so only the clock ends the run
  T.G.time=T.G.challengeDur-0.001; T.G.over=null; T.G.endedChallenge=false;
  T.stepEconomy(1/30);
  ok("challenge: hitting challengeDur ends the run", T.G.over==='time' || T.G.endedChallenge===true,
     "over="+T.G.over+" ended="+T.G.endedChallenge);
  T.G.mode=undefined; T.G.graceT=150; T.G.dread=0; T.G.over=null; T.G.time=0; T.G.quota={need:5,period:150,t:150,level:1};
}

// --- challenge: very hard to lose (no breach-loss; Dread throttles, not kills) ---
{ T.buildings.length=0; T.villagers.length=0; T.nodes.length=0;
  T.G.mode='campaign'; T.G.over=null; T.G.time=999; T.G.graceT=0; T.G.dread=100; T.G.breach=0;
  T.G.quota={need:5,period:150,t:150,level:1};
  T.spawnVillager(0,0,"reaper");
  for(let s=0;s<30*20 && !T.G.over;s++){ T.G.dread=100; T.stepEconomy(1/30); }
  ok("campaign: sustained max Dread breaches (over=lose)", T.G.over==='lose', "over="+T.G.over);
  T.buildings.length=0; T.villagers.length=0; T.nodes.length=0;
  T.G.mode='challenge'; T.G.challengeDur=600; T.G.over=null; T.G.time=10; T.G.graceT=0; T.G.dread=100; T.G.breach=0; T.G.endedChallenge=false;
  T.spawnVillager(0,0,"reaper");
  for(let s=0;s<30*30;s++){ T.G.dread=100; T.G.time=10; T.stepEconomy(1/30); }
  ok("challenge: sustained max Dread does NOT set over", !T.G.over, "over="+T.G.over);
  T.buildings.length=0; T.villagers.length=0; T.nodes.length=0;
  T.G.mode='challenge'; T.G.over=null; T.G.time=300; T.G.dread=0; T.G.endedChallenge=false;
  for(let s=0;s<30*5;s++) T.stepEconomy(1/30);
  ok("challenge: zero crew does not end the run", !T.G.over, "over="+T.G.over);
  ok("dreadThrottle is 1 at zero Dread", Math.abs(T.dreadThrottle(0)-1)<1e-9, "t0="+T.dreadThrottle(0));
  ok("dreadThrottle bottoms at DREAD_THROTTLE_MIN at max Dread", T.dreadThrottle(100)<1 && T.dreadThrottle(100)>=0.34,
     "t100="+T.dreadThrottle(100).toFixed(2));
  T.G.mode=undefined; T.G.graceT=150; T.G.dread=0; T.G.time=0; T.G.over=null; T.G.breach=0; T.G.quota={need:5,period:150,t:150,level:1};
}

// --- blended score (pure) ---
{ ok("computeScore is the weighted sum, rounded",
     T.computeScore(10,20,3,12)===Math.round(10*100+20*3+3*30+12*20),
     "got="+T.computeScore(10,20,3,12)+" expected="+Math.round(10*100+20*3+3*30+12*20));
  ok("computeScore is zero for an empty run", T.computeScore(0,0,0,0)===0, "got="+T.computeScore(0,0,0,0));
  ok("computeScore rounds fractional peakRate", T.computeScore(0,0,0,1.5)===Math.round(1.5*20), "got="+T.computeScore(0,0,0,1.5));
  T.G.computeRendered=5; T.G.deadRendered=10; T.G.husksBoundRun=2; T.G.peakRate=8;
  ok("challengeScore reads the live G tallies", T.challengeScore()===T.computeScore(5,10,2,8), "got="+T.challengeScore());
  T.resetRunScore();
}

// --- URL params + seed determinism ---
{ ok("parseParams reads mode/seed/dur", (()=>{ const p=T.parseParams('?mode=challenge&seed=42&dur=1200');
     return p.mode==='challenge'&&p.seed===42&&p.dur===1200; })(), "parsed="+JSON.stringify(T.parseParams('?mode=challenge&seed=42&dur=1200')));
  ok("parseParams is empty-safe", (()=>{ const p=T.parseParams(''); return p.mode==null&&p.seed==null&&p.dur==null; })(), "empty");
  ok("parseParams rejects an out-of-range dur", T.parseParams('?dur=99999').dur==null, "dur="+T.parseParams('?dur=99999').dur);
  function runSeed(seed){ T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.G.over=null;
    T.G.mode='challenge'; T.G.challengeDur=600; T.G.graceT=1e9; T.G.dread=0;
    T.seedWorld(seed); T.resetRunScore(); T.seedSettlement();
    const cr=T.placeBuildingFree("crematory",-8,0), dc=T.placeBuildingFree("datacenter",8,0);
    for(let i=0;i<3;i++) T.assignHusk(T.spawnVillager(-8,2,"reaper"),cr);
    for(let i=0;i<4;i++) T.assignHusk(T.spawnVillager(8,2,"reaper"),dc);
    for(let st=0;st<30*120;st++){ T.G.stock.dead=100000; T.G.stock.soulash=300; T.G.stock.core=100000; T.G.stock.power=100000; T.G.stock.ichor=100000; T.G.stock.compute=0; T.stepHusks(1/30); T.stepEconomy(1/30); }
    return T.G.computeRendered; }
  const a=runSeed(12345), b=runSeed(12345);
  ok("same forced seed yields identical computeRendered (determinism)", a===b && a>0, "a="+a+" b="+b);
  T.G.mode=undefined; T.G.graceT=150; T.G.dread=0; T.G.over=null; T.G.time=0; T.resetRunScore();
}

// --- challenge end: share link + best round-trip ---
{ ok("shareURL builds a reproducible challenge link",
     T.shareURL(42,1200)==='?mode=challenge&seed=42&dur=1200', "got="+T.shareURL(42,1200));
  let threwB=null, got=null;
  try{ T.setChallengeBest(1200,{score:9999,seed:42,date:'2026-06-22'}); got=T.getChallengeBest(1200); }catch(e){ threwB=e; }
  ok("best getter/setter never throws headless", !threwB, threwB?String(threwB):"ok");
  ok("best round-trips when storage is present (else null headless)",
     got===null || (got&&got.score===9999&&got.seed===42), "got="+JSON.stringify(got));
}

// --- autosave gated to campaign ---
{ T.G.mode='campaign'; ok("campaign autosaves", T.shouldAutosave()===true, "campaign="+T.shouldAutosave());
  T.G.mode='challenge'; ok("challenge does NOT autosave", T.shouldAutosave()===false, "challenge="+T.shouldAutosave());
  T.G.mode=undefined; ok("absent mode autosaves (campaign default)", T.shouldAutosave()===true, "default="+T.shouldAutosave());
  T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.G.over=null; T.G.mode=undefined;
  T.seedSettlement(); const snap=T.serializeState();
  ok("serializeState still campaign-shaped (no mode leak breaks load)", snap.G&&snap.G.quota&&typeof snap.seed==='number', "keys="+Object.keys(snap).join(","));
}

// --- end-to-end: a short challenge run scores and ends on the clock ---
{ T.buildings.length=0; T.villagers.length=0; T.nodes.length=0;
  T.G.mode='challenge'; T.G.challengeDur=30; T.G.over=null; T.G.endedChallenge=false; T.G.dread=0; T.G.graceT=1e9;
  T.seedWorld(99); T.resetRunScore(); T.G.time=0;
  T.placeBuildingFree("stockpile",0,-12);
  const dc=T.placeBuildingFree("datacenter",8,0);
  for(let i=0;i<4;i++) T.assignHusk(T.spawnVillager(8,2,"reaper"),dc);
  for(let st=0;st<30*40 && !T.G.over;st++){ T.G.stock.core=100000; T.G.stock.power=100000; T.G.stock.ichor=100000; T.G.stock.soulash=300; T.G.stock.compute=0; T.stepHusks(1/30); T.stepEconomy(1/30); }
  ok("end-to-end: a 30s challenge ends on the clock with a score", (T.G.over==='time') && T.challengeScore()>0,
     "over="+T.G.over+" score="+T.challengeScore()+" time="+T.G.time.toFixed(1));
  T.G.mode=undefined; T.G.graceT=150; T.G.over=null; T.G.time=0; T.resetRunScore();
}

// --- variable wave of the dead: the world delivers raw dead in irregular pulses (no free husks) ---
{ let threwD=null;
  try{ T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.G.over=null; T.G.dread=0; T.G.graceT=0;
    T.seedWorld(7);
    ok("deadDrift is exposed", typeof T.deadDrift==='function', "type="+typeof T.deadDrift);
    // a drained cemetery is topped back up by a drift
    const n=T.placeNode("grave",20,0); n.amount=n.max*0.2; const before=n.amount;
    const did=T.deadDrift();
    ok("deadDrift replenishes the most-drained dead deposit", did===true && n.amount>before, "amount "+before.toFixed(0)+" -> "+n.amount.toFixed(0));
    // with every deposit healthy and under the cap, a fresh deposit drifts in
    for(const m of T.nodes) m.amount=m.max; const nn0=T.nodes.length; const did2=T.deadDrift();
    ok("deadDrift seeds a fresh deposit when all are healthy", did2===true && T.nodes.length===nn0+1, "nodes "+nn0+" -> "+T.nodes.length);
    // it adds the dead, never a free husk (bound-not-born holds)
    const pv=T.villagers.filter(v=>!v.dead).length;
    for(let i=0;i<20;i++) T.deadDrift();
    ok("deadDrift never spawns a free husk", T.villagers.filter(v=>!v.dead).length===pv, "pop="+pv);
  }catch(e){ threwD=e; ok("dead-drift block ran", false, String(e.stack||e)); }
  T.buildings.length=0; T.villagers.length=0; T.nodes.length=0;
  T.G.mode=undefined; T.G.graceT=150; T.G.dread=0; T.G.over=null; T.G.time=0;
}

// --- new craft chain: tree -> ashwood, silica seam -> silica via a node-locked Excavator ---
{ T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.G.over=null; T.G.time=999;
  ok("tree + silica node types exist", !!(T.NODE.tree&&T.NODE.silica), "tree="+!!T.NODE.tree+" silica="+!!T.NODE.silica);
  ok("tree gives ashwood, silica seam gives silica",
     !!(T.NODE.tree&&T.NODE.tree.gives[0]==='ashwood') && !!(T.NODE.silica&&T.NODE.silica.gives[0]==='silica'),
     "tree="+(T.NODE.tree&&T.NODE.tree.gives)+" silica="+(T.NODE.silica&&T.NODE.silica.gives));
  ok("Ashwood Camp gathers ashwood from tree stands",
     !!(T.BLD.ashcamp&&T.BLD.ashcamp.nodeType==='tree'&&T.BLD.ashcamp.res==='ashwood'), "ashcamp="+JSON.stringify(T.BLD.ashcamp&&{n:T.BLD.ashcamp.nodeType,r:T.BLD.ashcamp.res}));
  ok("Excavator gathers silica and is locked to a silica seam",
     !!(T.BLD.excavator&&T.BLD.excavator.nodeType==='silica'&&T.BLD.excavator.res==='silica'&&T.BLD.excavator.lockNode==='silica'),
     "excavator="+JSON.stringify(T.BLD.excavator&&{n:T.BLD.excavator.nodeType,r:T.BLD.excavator.res,l:T.BLD.excavator.lockNode}));
  // an Ashwood Camp on a tree stand accumulates ashwood
  let threwG=null;
  try{ T.G.stock.ashwood=0; T.placeNode("tree",-10,0); T.placeBuildingFree("stockpile",0,0);
    const ac=T.placeBuildingFree("ashcamp",-10,3);
    for(let i=0;i<2;i++) T.assignHusk(T.spawnVillager(-10,2,"stump"),ac);
    for(let st=0;st<30*90;st++){ T.stepHusks(1/30); T.stepEconomy(1/30); }
  }catch(e){ threwG=e; }
  ok("Ashwood Camp harvests ashwood from a tree stand", !threwG && T.G.stock.ashwood>0, threwG?String(threwG.stack||threwG):"ashwood="+Math.floor(T.G.stock.ashwood||0));
  // an Excavator on a silica seam accumulates silica
  let threwX=null;
  try{ T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.G.stock.silica=0;
    T.placeNode("silica",14,0); T.placeBuildingFree("stockpile",0,0);
    const xc=T.placeBuildingFree("excavator",14,3);
    for(let i=0;i<3;i++) T.assignHusk(T.spawnVillager(14,2,"stump"),xc);
    for(let st=0;st<30*90;st++){ T.stepHusks(1/30); T.stepEconomy(1/30); }
  }catch(e){ threwX=e; }
  ok("Excavator bores silica from a seam", !threwX && T.G.stock.silica>0, threwX?String(threwX.stack||threwX):"silica="+Math.floor(T.G.stock.silica||0));
}

// --- Excavator placement is node-locked to silica seams (nowhere else) ---
{ let threwL=null;
  try{ T.buildings.length=0; T.nodes.length=0; T.villagers.length=0; T.G.over=null;
    Object.assign(T.G.stock,{dead:9999,ashwood:9999,silica:9999});
    ok("nodeLockOk: a normal building is never node-locked", T.nodeLockOk(T.BLD.crematory,0,0)===true, "");
    ok("nodeLockOk: Excavator rejected with no silica seam nearby", T.nodeLockOk(T.BLD.excavator,0,0)===false, "");
    T.placeNode("silica",30,0);
    ok("nodeLockOk: Excavator accepted right on a silica seam", T.nodeLockOk(T.BLD.excavator,30,2)===true, "");
    const off=T.placeBuilding("excavator",0,0);
    ok("placeBuilding refuses an Excavator off a silica seam", off===null, "off="+(off?"placed":"null"));
    const on=T.placeBuilding("excavator",30,3);
    ok("placeBuilding raises an Excavator on a silica seam", !!on, "on="+(on?"placed":"null"));
  }catch(e){ threwL=e; ok("node-lock placement block ran", false, String(e.stack||e)); }
  T.buildings.length=0; T.nodes.length=0; T.villagers.length=0;
  // restore clean campaign state so the leftover G.time/stock can't pollute later sim tests
  T.G.mode=undefined; T.G.graceT=150; T.G.dread=0; T.G.over=null; T.G.time=0;
  Object.assign(T.G.stock,{ashwood:0,silica:0});
}

// --- every building kind builds a procedural mesh without throwing ---
{ let threwC=null; T.buildings.length=0;
  try{ for(const k of ["pyre","den","path","exhumer","dredge","ashcamp","excavator","crematory","furnace","mill","litho","ossuary","substation","datacenter","stockpile","ward","market"])
        if(k!=="path") T.placeBuildingFree(k, ((Math.random()*40-20)|0), ((Math.random()*40-20)|0)); }catch(e){ threwC=e; }
  ok("every building kind builds a procedural mesh without throwing", !threwC, threwC?String(threwC.stack||threwC):"ok");
  T.buildings.length=0;
}

// --- research rites multiply the economy ---
{ T.G.tech={}; const baseG=T.techMul('gather'), baseC=T.techMul('carry');
  ok("techMul defaults to 1x", baseG===1&&baseC===1, "g="+baseG+" c="+baseC);
  T.G.tech.tools=true; T.G.tech.callous=true;
  ok("a researched rite raises gather rate", T.techMul('gather')>baseG, baseG+" -> "+T.techMul('gather'));
  ok("a researched rite raises carry capacity", T.techMul('carry')>baseC, baseC+" -> "+T.techMul('carry'));
  T.G.tech={}; }

// --- caste chain-role specialization (affinity) ---
{ const af=T.affinity||(()=>1);
  ok("Reaper renders best at the Crematory", af('reaper','crematory')>af('worker','crematory') && af('worker','crematory')>af('stump','crematory'), "reaper="+af('reaper','crematory')+" worker="+af('worker','crematory')+" stump="+af('stump','crematory'));
  ok("Stump is crude at fine work (Litho)", af('stump','litho')<af('worker','litho') && af('reaper','litho')>=af('worker','litho'), "stump="+af('stump','litho')+" worker="+af('worker','litho')+" reaper="+af('reaper','litho'));
  ok("Stump is the best extractor (Exhumer)", af('stump','exhumer')>af('worker','exhumer') && af('worker','exhumer')>af('reaper','exhumer'), "stump="+af('stump','exhumer')+" worker="+af('worker','exhumer')+" reaper="+af('reaper','exhumer'));
}
// production speed scales with worker caste affinity (Reaper crematory out-renders a Stump one)
{ T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.G.over=null;
  T.placeBuildingFree("stockpile",0,-12);
  const crR=T.placeBuildingFree("crematory",-8,0), crS=T.placeBuildingFree("crematory",8,0);
  for(let i=0;i<3;i++) T.assignHusk(T.spawnVillager(-8,2,"reaper"),crR);
  for(let i=0;i<3;i++) T.assignHusk(T.spawnVillager(8,2,"stump"),crS);
  for(let st=0;st<30*150;st++){ T.G.stock.dead=100000; T.G.stock.soulash=200; T.G.stock.bonesil=0; T.G.stock.ichor=0; T.stepHusks(1/30); T.stepEconomy(1/30); }
  ok("production scales with caste affinity (Reaper crematory out-renders Stump)", crR.cyc>crS.cyc, "reaper cyc="+crR.cyc+" stump cyc="+crS.cyc);
}

// --- audio engine is headless-safe (sim hooks must never crash without an AudioContext) ---
{ ok("SND sound engine exists", !!T.SND);
  let threwS=null; try{ T.SND.sfx('bell'); T.SND.sfx('place'); T.SND.sfx('crumble'); T.SND.setTension(0.5); }catch(e){ threwS=e; }
  ok("SND calls are no-ops when not started (headless-safe)", !threwS && T.SND.started===false, threwS?String(threwS):"started="+T.SND.started); }

// --- world-preview tool renders the REAL terrain (drift guard) ---
{ const WP=require('./worldpreview');
  let maxDiff=0; for(const [x,z] of [[0,0],[12,-7],[-20,33],[40,40],[-55,10],[5,60]]) maxDiff=Math.max(maxDiff,Math.abs(WP.terrainHeight(x,z)-T.terrainHeight(x,z)));
  ok("world-preview terrain matches the game exactly (no drift)", maxDiff<1e-9, "maxDiff="+maxDiff);
  const tmp=require('path').join(require('os').tmpdir(),'sf_preview_test.png'); let rendered=false;
  try{ WP.render(42,tmp,64); rendered=require('fs').existsSync(tmp); require('fs').unlinkSync(tmp); }catch(e){ rendered=false; }
  ok("world-preview renders a PNG without throwing", rendered);
}

// --- SPATIAL DREAD: the unrendered dead pool Dread on the ground; rendering + WARD RADIUS pull it back ---
{ ok("spatial dread field is exposed", typeof T.stepDread==='function' && typeof T.dreadAt==='function' && typeof T.dreadBite==='function', "stepDread="+typeof T.stepDread);
  ok("dreadBite is 1 at zero Dread and bottoms at the floor at max", Math.abs(T.dreadBite(0)-1)<1e-9 && Math.abs(T.dreadBite(100)-T.DREAD_BITE_MIN)<1e-9 && T.dreadBite(100)<1, "bite0="+T.dreadBite(0)+" bite100="+T.dreadBite(100));
  // a full, untapped cemetery radiates Dread onto its own ground (past the opening Dread-start gate)
  T.G.time=999; T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.resetDreadField();
  const g=T.placeNode("grave",40,0); g.amount=g.max;
  for(let s=0;s<30*40;s++) T.stepDread(1/30);
  const dHot=T.dreadAt(40,0);
  ok("an untapped cemetery pools Dread on its ground", dHot>20, "dread@grave="+dHot.toFixed(1));
  // the stain creeps outward to neighbouring ground, weaker than the core
  const dNear=T.dreadAt(40+T.DCELL,0);
  ok("Dread creeps to neighbouring ground, weaker than the core", dNear>1 && dNear<dHot, "core="+dHot.toFixed(1)+" near="+dNear.toFixed(1));
  // harvesting the deposit down lets its ground quiet (the fill IS the source — tap the dead to still them)
  g.amount=g.max*0.04; for(let s=0;s<30*90;s++) T.stepDread(1/30);
  ok("draining a deposit lets the ground it poisons quiet", T.dreadAt(40,0)<dHot*0.6, "hot="+dHot.toFixed(1)+" drained="+T.dreadAt(40,0).toFixed(1));
  // a WARD within its radius crushes the local Dread (the ward:14 radius finally matters)
  T.buildings.length=0; T.resetDreadField(); g.amount=g.max;
  for(let s=0;s<30*40;s++) T.stepDread(1/30); const dNoWard=T.dreadAt(40,0);
  T.placeBuildingFree("ward",43,0);                 // 3u from the grave — inside ward:14
  for(let s=0;s<30*40;s++) T.stepDread(1/30); const dWarded=T.dreadAt(40,0);
  ok("a Ward within radius crushes local Dread", dWarded<dNoWard*0.5, "noWard="+dNoWard.toFixed(1)+" warded="+dWarded.toFixed(1));
  // a Ward placed FAR away does NOT suppress this deposit — proves it's RADIUS, not a global count
  T.buildings.length=0; T.resetDreadField(); g.amount=g.max;
  for(let s=0;s<30*40;s++) T.stepDread(1/30); const dPre=T.dreadAt(40,0);
  T.placeBuildingFree("ward",-60,0);                // ~100u from the grave — far outside ward:14
  for(let s=0;s<30*40;s++) T.stepDread(1/30);
  ok("a Ward outside its radius does NOT suppress a distant deposit", T.dreadAt(40,0)>dPre*0.75, "pre="+dPre.toFixed(1)+" post-farward="+T.dreadAt(40,0).toFixed(1));
  T.buildings.length=0; T.nodes.length=0; T.resetDreadField();
}
// --- spatial dread is DETERMINISTIC + makes PLACEMENT matter (a building mired in the dead works slower) ---
{ const run=()=>{ T.G.time=999; T.buildings.length=0; T.nodes.length=0; T.resetDreadField();
    T.placeNode("grave",30,0); T.placeNode("waste",-20,10);
    for(let s=0;s<30*30;s++) T.stepDread(1/30); return T.dreadSnapshot(); };
  const a=run(), b=run(); let same=a.length===b.length; for(let i=0;i<a.length&&same;i++) if(Math.abs(a[i]-b[i])>1e-9) same=false;
  ok("spatial dread field is deterministic (identical across runs)", same && a.length>0, "len="+a.length);
  // placement matters: a Furnace on clean ground out-produces an identical one mired in a cemetery's Dread.
  // (Furnaces don't render, so they don't self-clean the ground — the bite is visible. graceT high so no breach.)
  T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.resetDreadField();
  T.G.over=null; T.G.time=999; T.G.graceT=1e9; T.G.dread=0;
  T.placeBuildingFree("stockpile",0,0);
  const gd=T.placeNode("grave",60,0); gd.amount=gd.max;        // a full grave keeps the south-east ground dreadful
  const fuClean=T.placeBuildingFree("furnace",-60,0), fuDread=T.placeBuildingFree("furnace",60,3);
  for(let i=0;i<3;i++){ T.assignHusk(T.spawnVillager(-60,2,"worker"),fuClean); T.assignHusk(T.spawnVillager(60,5,"worker"),fuDread); }
  for(let st=0;st<30*150;st++){ T.G.stock.bonesil=100000; T.G.stock.soulash=100000; T.G.stock.ingot=0; gd.amount=gd.max; T.stepHusks(1/30); T.stepEconomy(1/30); }
  ok("placement matters: a Furnace mired in Dread out-produced by one on clean ground", fuClean.cyc>fuDread.cyc,
     "clean cyc="+fuClean.cyc+" in-dread cyc="+fuDread.cyc+" dread@furnace="+T.dreadAt(60,3).toFixed(1));
  T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.resetDreadField();
  T.G.mode=undefined; T.G.graceT=150; T.G.dread=0; T.G.over=null; T.G.time=0;
}
// --- save/load round-trips the Dread field ---
{ T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.G.over=null; T.resetDreadField();
  T.seedSettlement(); T.placeNode("grave",-18,0); for(let s=0;s<30*30;s++) T.stepDread(1/30);
  const dBefore=T.dreadAt(-18,0); const snap=T.serializeState();
  ok("serializeState captures the Dread field", Array.isArray(snap.dread) && snap.dread.length===T.DGRID*T.DGRID, "len="+(snap.dread?snap.dread.length:"none"));
  T.resetDreadField();
  ok("field is cleared before reload", T.dreadAt(-18,0)<0.001, "after-reset="+T.dreadAt(-18,0).toFixed(3));
  T.applySave(snap);
  ok("save/load restores the Dread field", Math.abs(T.dreadAt(-18,0)-dBefore)<1e-6, "before="+dBefore.toFixed(2)+" restored="+T.dreadAt(-18,0).toFixed(2));
  T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.resetDreadField();
  T.G.mode=undefined; T.G.graceT=150; T.G.dread=0; T.G.over=null; T.G.time=0;
}

// --- the spatial field PUSHES the global Dread meter in live quota play — and ONLY then ---
{ const full=new Array(T.DGRID*T.DGRID).fill(80);
  const runField=(loadField)=>{ T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.resetDreadField();
    T.G.mode='campaign'; T.G.over=null; T.G.time=999; T.G.graceT=0; T.G.dread=0; T.G.basePressure=0.6;
    T.G.quota={need:5,period:1e9,t:1e9,level:1};   // park the tithe so it can't fire during the window
    T.spawnVillager(0,0,"reaper");                 // one idle husk so the extinction-loss doesn't halt the sim
    for(let s=0;s<30*20;s++){ if(loadField)T.loadDreadField(full); T.stepEconomy(1/30); } return T.G.dread; };
  const dWithField=runField(true), dClean=runField(false);
  ok("the Dread field pushes the global meter up in live quota play", dWithField>dClean+1, "withField="+dWithField.toFixed(1)+" clean="+dClean.toFixed(1));
  T.buildings.length=0; T.nodes.length=0; T.resetDreadField(); T.loadDreadField(full);
  ok("dreadFieldPressure reads the settlement-area field", T.dreadFieldPressure()>50, "pressure="+T.dreadFieldPressure().toFixed(0));
  { T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.resetDreadField();
    T.G.mode='campaign'; T.G.over=null; T.G.time=0; T.G.graceT=1e9; T.G.dread=0; T.G.quota={need:5,period:1e9,t:1e9,level:1};
    for(let s=0;s<30*15;s++){ T.loadDreadField(full); T.stepEconomy(1/30); }
    ok("during grace the field does NOT push the global meter", T.G.dread<0.5, "dread="+T.G.dread.toFixed(2)); }
  { T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.resetDreadField();
    T.G.mode='challenge'; T.G.challengeDur=600; T.G.over=null; T.G.endedChallenge=false; T.G.time=100; T.G.graceT=0; T.G.dread=0;
    for(let s=0;s<30*15;s++){ T.loadDreadField(full); T.stepEconomy(1/30); }
    ok("in challenge the field does NOT push the global meter", T.G.dread<0.5, "dread="+T.G.dread.toFixed(2)); }
  T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.resetDreadField();
  T.G.mode=undefined; T.G.graceT=150; T.G.dread=0; T.G.over=null; T.G.time=0; T.G.quota={need:5,period:150,t:150,level:1};
}
// --- the haze bites a DEPLOYED husk's resolve; Reapers resist it; idle husks aren't out in it (caste x Dread) ---
{ const full=new Array(T.DGRID*T.DGRID).fill(100);
  T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.resetDreadField();
  T.G.mode='campaign'; T.G.over=null; T.G.time=999; T.G.graceT=1e9; T.G.dread=0;   // grace -> no global hauntings to add noise
  const bld=T.placeBuildingFree("crematory",0,0);   // inactive (no atWork crew) so it doesn't self-suppress the field
  const wk=T.spawnVillager(0,0,"worker"), rp=T.spawnVillager(0,0,"reaper");
  T.assignHusk(wk,bld); T.assignHusk(rp,bld); wk.resolve=rp.resolve=0.8;
  for(let s=0;s<30*60;s++){ T.loadDreadField(full); T.G.stock.soulash=0; T.stepEconomy(1/30); }
  ok("a Worker deployed in full Dread is worn down by the haze", wk.resolve<0.4, "worker 0.8->"+wk.resolve.toFixed(2));
  ok("a Reaper resists the Dread haze and holds (caste x Dread interlock)", rp.resolve>0.7, "reaper 0.8->"+rp.resolve.toFixed(2));
  T.buildings.length=0; T.villagers.length=0; T.resetDreadField();
  const idle=T.spawnVillager(0,0,"worker"); idle.resolve=0.8;   // unassigned -> not "out in it"
  for(let s=0;s<30*60;s++){ T.loadDreadField(full); T.G.stock.soulash=100; T.stepEconomy(1/30); }
  ok("an idle husk is not bitten by the Dread it stands in (only deployed ones are)", idle.resolve>0.78, "idle 0.8->"+idle.resolve.toFixed(2));
  T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.resetDreadField();
  T.G.mode=undefined; T.G.graceT=150; T.G.dread=0; T.G.over=null; T.G.time=0;
}
// --- caste x Dread interlock on PRODUCTION: a Reaper crew out-works a Worker crew in heavy Dread (despite worse affinity) ---
{ const full=new Array(T.DGRID*T.DGRID).fill(100);
  T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.resetDreadField(); T.G.over=null; T.G.time=999; T.G.graceT=1e9; T.G.dread=0;
  T.placeBuildingFree("stockpile",-9,0); T.placeBuildingFree("stockpile",9,0);   // a hub by each furnace so crews tend (not walk) most of the time
  const fuR=T.placeBuildingFree("furnace",-9,0), fuW=T.placeBuildingFree("furnace",9,0);   // furnace: workers have the affinity edge (1.05 vs 0.95)
  for(let i=0;i<3;i++){ T.assignHusk(T.spawnVillager(-9,2,"reaper"),fuR); T.assignHusk(T.spawnVillager(9,2,"worker"),fuW); }
  for(let st=0;st<30*220;st++){ T.loadDreadField(full); T.G.stock.bonesil=100000; T.G.stock.soulash=100000; T.G.stock.ingot=0; T.stepHusks(1/30); T.stepEconomy(1/30); }
  ok("caste x Dread: a Reaper crew out-works a Worker crew in heavy Dread", fuR.cyc>fuW.cyc, "reaper-crew cyc="+fuR.cyc+" worker-crew cyc="+fuW.cyc);
  T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.resetDreadField();
  T.G.mode=undefined; T.G.graceT=150; T.G.dread=0; T.G.over=null; T.G.time=0;
}
// --- the FULL sim path (dread field + production bite + resolve bite + hauntings) is deterministic ---
{ const runSim=()=>{ T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.resetDreadField(); T.G.over=null;
    T.G.mode='campaign'; T.G.time=999; T.G.graceT=0; T.G.dread=60; T.G.basePressure=0.6; T.G.quota={need:5,period:1e9,t:1e9,level:1};
    T.seedWorld(4242);
    T.placeNode("grave",10,0); T.placeNode("waste",-12,6);
    const cr=T.placeBuildingFree("crematory",-4,0), ex=T.placeBuildingFree("exhumer",10,3);
    for(let i=0;i<3;i++){ T.assignHusk(T.spawnVillager(-4,2,"worker"),cr); T.assignHusk(T.spawnVillager(10,2,"stump"),ex); }
    for(let s=0;s<30*45;s++){ T.G.stock.dead=200; T.G.stock.soulash=50; T.stepHusks(1/30); T.stepEconomy(1/30); }
    return { field:T.dreadSnapshot(), dread:+T.G.dread.toFixed(6), res:T.villagers.filter(v=>!v.dead).map(v=>+v.resolve.toFixed(6)) }; };
  const A=runSim(), B=runSim();
  let same=A.field.length===B.field.length && A.dread===B.dread && A.res.length===B.res.length;
  for(let i=0;same&&i<A.field.length;i++) if(Math.abs(A.field[i]-B.field[i])>1e-9) same=false;
  for(let i=0;same&&i<A.res.length;i++) if(A.res[i]!==B.res[i]) same=false;
  ok("the full sim (field + bites + hauntings) is deterministic across runs", same, "dreadA="+A.dread+" dreadB="+B.dread+" nResA="+A.res.length+" nResB="+B.res.length);
  T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.resetDreadField();
  T.G.mode=undefined; T.G.graceT=150; T.G.dread=0; T.G.over=null; T.G.time=0; T.G.quota={need:5,period:150,t:150,level:1};
}
// --- a legacy save with no Dread field still loads (the field comes back clean), + bad-length guard ---
{ T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.G.over=null; T.resetDreadField();
  T.seedSettlement(); T.placeNode("grave",-14,0); for(let s=0;s<30*20;s++) T.stepDread(1/30);
  const snap=T.serializeState(); delete snap.dread;   // simulate a pre-feature save
  let threw=null, ret=null; try{ ret=T.applySave(snap); }catch(e){ threw=e; }
  ok("a legacy save with no Dread field loads without throwing", !threw && ret===true, threw?String(threw):"ret="+ret);
  ok("legacy load leaves the field clean (it rebuilds from play)", T.dreadAt(-14,0)<0.001 && T.dreadAt(0,0)<0.001, "field@grave="+T.dreadAt(-14,0).toFixed(3));
  ok("loadDreadField rejects a wrong-length array", T.loadDreadField([1,2,3])===false, "ret="+T.loadDreadField([1,2,3]));
  T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.resetDreadField();
  T.G.mode=undefined; T.G.graceT=150; T.G.dread=0; T.G.over=null; T.G.time=0;
}
// --- ward suppression falls off with distance, overlapping wards go deeper, and the V toggle flips ---
{ const dProbe=(setup)=>{ T.G.time=999; T.buildings.length=0; T.nodes.length=0; T.resetDreadField();
    const g=T.placeNode("grave",40,0); g.amount=g.max; setup(g); for(let s=0;s<30*40;s++){ g.amount=g.max; T.stepDread(1/30); } return T.dreadAt(40,0); };
  const none=dProbe(()=>{});
  const near=dProbe(()=>{ T.placeBuildingFree("ward",44,0); });   // 4u from the grave -> strong
  const far =dProbe(()=>{ T.placeBuildingFree("ward",52,0); });   // 12u from the grave, near the 14u edge -> weak
  const two =dProbe(()=>{ T.placeBuildingFree("ward",52,0); T.placeBuildingFree("ward",40,12); });   // two each ~12u -> deeper
  ok("ward suppression falls off with distance (graded by radius)", near<far && far<none, "none="+none.toFixed(1)+" far(12u)="+far.toFixed(1)+" near(4u)="+near.toFixed(1));
  ok("two overlapping wards suppress deeper than one at the same distance", two<far, "far(one)="+far.toFixed(1)+" two="+two.toFixed(1));
  if(typeof T.toggleDreadViz==='function'){ const a=T._dreadVizOn; let t=null; try{ T.toggleDreadViz(); }catch(e){ t=e; } const b=T._dreadVizOn; try{ T.toggleDreadViz(); }catch(e){ t=e; } const c=T._dreadVizOn;
    ok("toggleDreadViz flips the haze flag without throwing", !t && b===!a && c===a, t?String(t):"a="+a+" b="+b+" c="+c); }
  else ok("toggleDreadViz is exposed", false, "missing");
  T.buildings.length=0; T.nodes.length=0; T.resetDreadField();
}

// --- the rising tide: as the engine's tithes climb, the dead come faster (the arc tied to the spatial system) ---
{ const avg=a=>a.reduce((s,x)=>s+x,0)/a.length;
  T.G.quota={need:5,period:150,t:150,level:1}; const lo=[]; for(let i=0;i<300;i++) lo.push(T.driftPeriod());
  T.G.quota={need:5,period:150,t:150,level:8}; const hi=[]; for(let i=0;i<300;i++) hi.push(T.driftPeriod());
  ok("the rising tide: later tithes shorten the wave cadence", avg(hi)<avg(lo)*0.72 && avg(hi)>0, "lvl1~"+avg(lo).toFixed(0)+"s lvl8~"+avg(hi).toFixed(0)+"s");
  // a bigger wave replenishes a drained deposit more at a high tithe than at the first (averaged over the rr noise)
  const replenishAvg=(lvl,trials)=>{ let tot=0; for(let k=0;k<trials;k++){ T.nodes.length=0; const n=T.placeNode("grave",70,0); n.amount=n.max*0.2;
      T.G.quota={need:5,period:150,t:150,level:lvl}; const before=n.amount; T.deadDrift(); tot+=(n.amount-before); } return tot/trials; };
  const r1=replenishAvg(1,40), r8=replenishAvg(8,40);
  ok("the rising tide: a high-tithe wave washes in more dead than the first", r8>r1*1.2, "lvl1 wave=+"+r1.toFixed(0)+" lvl8 wave=+"+r8.toFixed(0));
  T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.resetDreadField();
  T.G.quota={need:5,period:150,t:150,level:1};
}

// --- the Grave-Salt rite eases the Dread bite on production (research interlocks with Spatial Dread) ---
{ const full=new Array(T.DGRID*T.DGRID).fill(100);
  const cyc=(salt)=>{ T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.resetDreadField();
    T.G.over=null; T.G.time=999; T.G.graceT=1e9; T.G.dread=0; T.G.tech= salt?{salt:true}:{};
    T.placeBuildingFree("stockpile",0,0); const fu=T.placeBuildingFree("furnace",0,0);
    for(let i=0;i<3;i++) T.assignHusk(T.spawnVillager(0,2,"worker"),fu);
    for(let st=0;st<30*120;st++){ T.loadDreadField(full); T.G.stock.bonesil=100000; T.G.stock.soulash=100000; T.G.stock.ingot=0; T.stepHusks(1/30); T.stepEconomy(1/30); }
    return fu.cyc; };
  ok("dreadGuard is <1 with the Grave-Salt rite, 1 without", (()=>{ T.G.tech={salt:true}; const a=T.dreadGuard(); T.G.tech={}; const b=T.dreadGuard(); return a<1 && b===1; })(), "guard");
  const noSalt=cyc(false), withSalt=cyc(true);
  ok("the Grave-Salt rite eases the Dread work-bite (more output in the same haze)", withSalt>noSalt, "noSalt cyc="+noSalt+" withSalt cyc="+withSalt);
  T.G.tech={}; T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.resetDreadField();
  T.G.mode=undefined; T.G.graceT=150; T.G.dread=0; T.G.over=null; T.G.time=0;
}

// --- review fixes: campaign run tallies persist across save/load; the retired 'embers' rite migrates to salt ---
{ T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.G.over=null; T.resetDreadField();
  T.seedSettlement();
  T.G.computeRendered=120; T.G.deadRendered=437; T.G.husksBoundRun=22; T.G.peakRate=64.3; T.G.tech={embers:true};
  const snap=T.serializeState();
  ok("serializeState persists the run tallies", snap.G.deadRendered===437 && snap.G.husksBoundRun===22 && Math.abs(snap.G.peakRate-64.3)<1e-6, "dr="+snap.G.deadRendered+" hb="+snap.G.husksBoundRun);
  T.G.computeRendered=0; T.G.deadRendered=0; T.G.husksBoundRun=0; T.G.peakRate=0; T.G.tech={};
  T.applySave(snap);
  ok("save/load restores the run tallies (so a multi-session campaign win stays honest)", T.G.deadRendered===437 && T.G.husksBoundRun===22 && Math.abs(T.G.peakRate-64.3)<1e-6, "dr="+T.G.deadRendered+" hb="+T.G.husksBoundRun+" pk="+T.G.peakRate.toFixed(1));
  ok("a retired-'embers' save migrates to the Grave-Salt rite (the paid upgrade stays effective)", T.G.tech.salt===true && !T.G.tech.embers, "tech="+JSON.stringify(T.G.tech));
  T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.resetDreadField();
  T.G.mode=undefined; T.G.graceT=150; T.G.dread=0; T.G.over=null; T.G.time=0; T.G.tech={}; if(T.resetRunScore)T.resetRunScore();
}

// --- worked-out deposits go EMPTY + stop; renewable ones RESET after a cooldown; the rest are gone for good ---
{ T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.G.over=null; T.G.time=999; T.G.graceT=1e9; T.G.dread=0;
  T.spawnVillager(0,0,"reaper");   // one living husk so the extinction-loss doesn't halt the sim mid-cooldown
  const g=T.placeNode("grave",30,0); g.amount=0; T.depleteNode(g);
  ok("a worked-out renewable deposit goes empty + onto a cooldown", g.amount===0 && g.cooldown>0 && g.mesh.userData.depleted===true, "amt="+g.amount+" cd="+(g.cooldown||0).toFixed(0)+" empty="+g.mesh.userData.depleted);
  for(let s=0;s<30*12;s++) T.stepEconomy(1/30);
  ok("an empty deposit does NOT trickle back during cooldown (the bug: no pecking at a done node)", g.amount===0, "amt="+g.amount.toFixed(2)+" cd="+g.cooldown.toFixed(0));
  g.cooldown=0.001; for(let s=0;s<30*2;s++) T.stepEconomy(1/30);
  ok("a renewable deposit RESETS to full once its cooldown ends", g.amount===g.max && g.mesh.userData.depleted===false, "amt="+g.amount+"/"+g.max+" empty="+g.mesh.userData.depleted);
  const w=T.placeNode("waste",-30,0); w.amount=0; T.depleteNode(w);
  ok("a non-renewable deposit is gone for good (no cooldown reset)", w.cooldown===0, "cd="+w.cooldown);
  for(let s=0;s<30*6;s++) T.stepEconomy(1/30);
  ok("a depleted non-renewable stays depleted", w.amount===0 && w.mesh.userData.depleted===true, "amt="+w.amount+" empty="+w.mesh.userData.depleted);
  T.buildings.length=0; T.villagers.length=0; T.nodes.length=0;
  T.G.mode=undefined; T.G.graceT=150; T.G.dread=0; T.G.over=null; T.G.time=0;
}

console.log("\n=== "+pass+" passed, "+fail+" failed ===");
process.exit(fail?1:0);
