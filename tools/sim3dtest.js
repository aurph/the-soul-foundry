/* Headless economy test for THE SOUL FOUNDRY.
   Stubs THREE + DOM, loads the real game script (minus start()), then drives a
   full settlement to verify gather->refine->Compute, needs, and no exceptions. */
const fs=require('fs'), vm=require('vm'), path=require('path');
let code=fs.readFileSync(path.join(__dirname,'..','game','index.html'),'utf8')
  .match(/<script>([\s\S]*?)<\/script>/g).map(s=>s.replace(/<\/?script>/g,'')).find(s=>s.includes('use strict'));
code=code.replace(/\nstart\(\);/,'\n/*no start*/');
code+=`\n;this.__T={G,buildings,villagers,nodes,BLD,placeBuildingFree,placeBuilding,spawnVillager,assignHusk,stepEconomy,stepHusks,placeNode,seedSettlement,terrainHeight,canAfford,buildingWorkSpot,buildingFits,genRegions,storageCap,addStock,pileFill,updateStockpiles,serializeState,applySave,SND};`;

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
const sandbox={THREE,console,Math,Date,JSON,performance:{now:()=>Date.now()},setTimeout,clearTimeout,
  innerWidth:1280,innerHeight:720,devicePixelRatio:1,requestAnimationFrame(){return 0;},addEventListener(){},removeEventListener(){},
  location:{search:""},navigator:{getGamepads:()=>[]},document:{getElementById:()=>el(),createElement:()=>el(),addEventListener(){},body:el()}};
sandbox.window=sandbox; sandbox.globalThis=sandbox;
vm.createContext(sandbox); vm.runInContext(code,sandbox,{filename:"sf.js"});
const T=sandbox.__T;

let pass=0,fail=0; const ok=(n,c,x="")=>{(c?pass++:fail++);console.log((c?"  PASS ":"  FAIL ")+n+(x?"  "+x:""));};
ok("internals exposed",!!T); if(!T){console.log("aborting");process.exit(1);}

// --- build a full, well-fed settlement ---
let threw=null;
try{
  T.seedSettlement();
  // generous stock so we can build the whole chain and not starve during the test
  Object.assign(T.G.stock,{wood:400,relic:300,pith:400,silica:0,ash:0,water:0});
  // nodes near the centre
  T.placeNode("grove",-12,0); T.placeNode("grove",12,0); T.placeNode("grove",-16,6); T.placeNode("grove",16,-6);
  T.placeNode("dune",0,-14); T.placeNode("vent",0,14); T.placeNode("well",16,10); T.placeNode("well",-16,-10);
  // gathering posts beside their nodes
  const wc=T.placeBuildingFree("woodcutter",-12,3), pp=T.placeBuildingFree("pithpost",12,3),
        dr=T.placeBuildingFree("dredge",0,-11), vc=T.placeBuildingFree("ventcap",0,11), wr=T.placeBuildingFree("wellrig",13,10);
  // refiners
  const fu=T.placeBuildingFree("furnace",-4,-4), mi=T.placeBuildingFree("mill",4,-4),
        as=T.placeBuildingFree("assembly",-4,5), dc=T.placeBuildingFree("datacenter",5,5);
  // wards to keep dread suppressed (a sustainable colony, like real play)
  T.placeBuildingFree("ward",-10,-8); T.placeBuildingFree("ward",10,8); T.placeBuildingFree("ward",-10,8);
  // a big bound workforce
  for(let i=0;i<22;i++) T.spawnVillager((i%9-4)*2, (((i/9)|0)-2)*2, ["worker","worker","stump","reaper"][i%4]);
  const idle=()=>T.villagers.filter(v=>!v.dead&&!v.assigned);
  function staff(b,n){ for(let k=0;k<n;k++){ const f=idle()[0]; if(f) T.assignHusk(f,b); } }
  staff(wc,3); staff(pp,3); staff(dr,3); staff(vc,3); staff(wr,2);
  staff(fu,3); staff(mi,3); staff(as,4); staff(dc,5);
}catch(e){ threw=e; }
ok("settlement builds without throwing",!threw,threw?String(threw.stack||threw):"");

// --- run ~5 simulated minutes ---
let maxC=0,maxCore=0,maxGlass=0,maxWafer=0; threw=null;
try{ for(let s=0;s<30*300;s++){ T.stepHusks(1/30); T.stepEconomy(1/30);
  maxGlass=Math.max(maxGlass,T.G.stock.glass); maxWafer=Math.max(maxWafer,T.G.stock.wafer);
  maxCore=Math.max(maxCore,T.G.stock.core); maxC=Math.max(maxC,T.G.stock.compute,0);
  if(T.G.over) break; } }catch(e){ threw=e; }
ok("5-minute sim runs without throwing",!threw,threw?String(threw.stack||threw):"");
ok("gatherers harvested raw materials", (T.G.stock.silica+T.G.stock.ash+T.G.stock.water)>0 || maxGlass>0, "sil="+Math.floor(T.G.stock.silica)+" ash="+Math.floor(T.G.stock.ash)+" wat="+Math.floor(T.G.stock.water));
ok("Furnace produced Cinderglass", maxGlass>0, "glass peak="+Math.floor(maxGlass));
ok("Mill produced Sigil-Discs", maxWafer>0, "wafer peak="+Math.floor(maxWafer));
ok("Assembly produced Reliquary Cores", maxCore>0, "core peak="+Math.floor(maxCore));
ok("Datacenter produced COMPUTE (full chain end-to-end)", maxC>0, "compute peak="+Math.floor(maxC));
ok("population survived (needs balance ok)", T.villagers.filter(v=>!v.dead).length>0, "alive="+T.villagers.filter(v=>!v.dead).length);
ok("dread stayed bounded 0..100", T.G.dread>=0&&T.G.dread<=100, "dread="+T.G.dread.toFixed(0));

// starvation test: cut food AND wood (no warmth); resolve must fall
try{ T.G.over=null; T.G.dread=0; T.nodes.length=0; T.G.stock.pith=0; T.G.stock.wood=0; T.G.grow=999; // remove all food/wood sources + freeze growth
  const avg=()=>{const a=T.villagers.filter(v=>!v.dead);return a.reduce((s,v)=>s+v.resolve,0)/Math.max(1,a.length);};
  const before=avg();
  for(let s=0;s<30*30;s++){ T.stepEconomy(1/30); T.stepHusks(1/30); }
  ok("starvation/cold erodes resolve", avg()<before-0.2, "avg resolve "+before.toFixed(2)+" -> "+avg().toFixed(2));
}catch(e){ ok("starvation test",false,String(e)); }

// placement coverage: after the gentler-terrain fix, most open land must be buildable across seeds
{ let total=0,okp=0; T.buildings.length=0; T.nodes.length=0;
  for(const seed of [42,7,314,999,55,1234]){ T.genRegions(seed);
    for(let i=0;i<240;i++){ const a=Math.random()*6.283, r=Math.random()*68; const x=Math.cos(a)*r, z=Math.sin(a)*r; total++; if(T.buildingFits(x,z,1.8)) okp++; } }
  ok("most open land is buildable (placement)", okp/total>0.9, (100*okp/total).toFixed(0)+"% of valley buildable across 6 seeds"); }

// --- material repositories / stockpiles (#1 sauce) ---
{ T.buildings.length=0; T.nodes.length=0; T.G.over=null; T.G.stock.wood=0;
  const baseCap=T.storageCap("wood");
  ok("storageCap returns a positive floor", baseCap>0, "base="+baseCap);
  const sp=T.placeBuildingFree("stockpile",8,8);
  const raised=T.storageCap("wood");
  ok("a stockpile raises storage capacity", raised>baseCap, baseCap+" -> "+raised);
  for(let i=0;i<5000;i++) T.addStock("wood",1);
  ok("addStock can exceed the base cap once a stockpile stands", T.G.stock.wood>baseCap, "wood="+Math.floor(T.G.stock.wood)+" (base "+baseCap+")");
  ok("addStock still clamps to the raised cap", T.G.stock.wood<=raised+0.001, "wood="+Math.floor(T.G.stock.wood)+" <= "+raised);
  T.G.stock.ash=0; ok("pileFill is 0 when empty", T.pileFill("ash")===0, "fill="+T.pileFill("ash"));
  T.G.stock.wood=raised; ok("pileFill is ~1 when full", Math.abs(T.pileFill("wood")-1)<0.001, "fill="+T.pileFill("wood").toFixed(2));
  ok("stockpile yard builds 8 material bins", sp.mesh.userData.piles&&sp.mesh.userData.piles.length===8, "bins="+(sp.mesh.userData.piles||[]).length);
  T.G.stock.wood=raised*0.5; T.updateStockpiles();
  const woodPile=sp.mesh.userData.piles.find(p=>p.res==="wood");
  ok("updateStockpiles scales a pile to its fill", woodPile&&Math.abs(woodPile.node.scale.y-0.5)<0.02&&woodPile.node.visible, "scaleY="+(woodPile?woodPile.node.scale.y.toFixed(2):"?"));
}

// --- save/load round-trips the whole foundry ---
{ T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.G.over=null;
  T.seedSettlement();
  T.placeNode("grove",-10,0); T.placeBuildingFree("furnace",-3,-3);
  T.spawnVillager(2,2,"reaper");
  T.G.stock.silica=42; T.G.writ=77; T.G.dread=33; T.G.quota.level=4;
  const snap=T.serializeState();
  const nb=T.buildings.length, nv=T.villagers.filter(v=>!v.dead).length, nn=T.nodes.length;
  T.buildings.length=0; T.villagers.length=0; T.nodes.length=0; T.G.writ=0; T.G.dread=0; T.G.stock.silica=0; T.G.quota.level=1;
  T.applySave(snap);
  ok("save/load restores buildings", T.buildings.length===nb, T.buildings.length+"/"+nb);
  ok("save/load restores villagers", T.villagers.filter(v=>!v.dead).length===nv, T.villagers.length+"/"+nv);
  ok("save/load restores nodes", T.nodes.length===nn, T.nodes.length+"/"+nn);
  ok("save/load restores resources & writ", T.G.stock.silica===42&&T.G.writ===77, "sil="+T.G.stock.silica+" writ="+T.G.writ);
  ok("save/load restores quota progress", T.G.quota.level===4, "lvl="+T.G.quota.level);
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

console.log("\n=== "+pass+" passed, "+fail+" failed ===");
process.exit(fail?1:0);
