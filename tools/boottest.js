/* boottest.js — actually RUN the world-build functions headlessly to catch boot
   exceptions the economy test misses (it never calls bootWorld). Loads the real
   game script with a fuller THREE/DOM stub, seeds RNG, then calls buildTerrain /
   scatterWorld / scatterGroundDetail / seedSettlement in try/catch. */
const fs=require('fs'), vm=require('vm'), path=require('path');

let code=fs.readFileSync(path.join(__dirname,'..','game','index.html'),'utf8')
  .match(/<script>([\s\S]*?)<\/script>/g).map(s=>s.replace(/<\/?script>/g,'')).find(s=>s.includes('use strict'));
code=code.replace(/\nstart\(\);/,'\n/*no start*/');
code+=`\n;this.__W={ buildTerrain, buildEnvironment, buildAsh, scatterWorld, scatterGroundDetail, seedSettlement, buildShroud, updateShroud, terrainHeight,
  __seed:(s)=>{ WORLD_SEED=s; RNG=mulberry32(s); genRegions(s); } };`;

const noop=()=>{};
function vec(x=0,y=0,z=0){ return {x,y,z,set(a,b,c){this.x=a;this.y=b;this.z=c;return this;},copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this;},setScalar(s){this.x=this.y=this.z=s;return this;},multiplyScalar(){return this;},add(){return this;},clone(){return vec(this.x,this.y,this.z);}}; }
function Obj(){ const o={ position:vec(), rotation:{set:noop,x:0,y:0,z:0}, scale:vec(1,1,1), userData:{}, children:[], visible:true,
  add(c){ if(c) this.children.push(c); }, remove:noop, traverse(f){ f(this); }, clone(){ const c=Obj(); c.material=this.material; return c; }, frustumCulled:false, castShadow:false, receiveShadow:false, material:Mat() }; return o; }
function geo(){ return { attributes:{ position:{count:0,getX:()=>0,getY:()=>0,getZ:()=>0,setX:noop,setY:noop,setZ:noop}, normal:{getX:()=>0,getY:()=>1,getZ:()=>0} },
  parameters:{radius:1,height:1,width:0.5,depth:0.5,radiusTop:1,radiusBottom:1,tube:0.2,widthSegments:6}, rotateX(){return this;}, rotateY(){return this;}, translate(){return this;}, center(){return this;}, computeVertexNormals:noop, setAttribute:noop, dispose:noop }; }
function Mat(){ return { color:{set:noop,setHSL:noop,getHSL:o=>{o.h=0;o.s=0;o.l=0;return o;},clone(){return {};},copy(){return this;},offsetHSL(){return this;},lerp(){return this;}}, emissive:{set:noop}, emissiveIntensity:1, side:0, clone(){return Mat();}, dispose:noop }; }
function Mtx(){ return { makeScale(){return this;}, setPosition(){return this;}, compose(){return this;}, identity(){return this;} }; }
const THREE={
  Group:Obj, Mesh:function(g,m){const o=Obj();o.geometry=g||geo();if(m)o.material=m;return o;}, Points:Obj, Sprite:function(){return Obj();}, Object3D:Obj, LOD:Obj,
  InstancedMesh:function(){ const o=Obj(); o.count=0; o.instanceMatrix={needsUpdate:false}; o.setMatrixAt=noop; o.setColorAt=noop; return o; },
  PlaneGeometry:geo,BoxGeometry:geo,CylinderGeometry:geo,ConeGeometry:geo,IcosahedronGeometry:geo,DodecahedronGeometry:geo,SphereGeometry:geo,TorusGeometry:geo,CircleGeometry:geo,BufferGeometry:geo,TetrahedronGeometry:geo,OctahedronGeometry:geo,RingGeometry:geo,
  MeshStandardMaterial:Mat,MeshBasicMaterial:Mat,ShaderMaterial:Mat,PointsMaterial:Mat,SpriteMaterial:Mat,MeshLambertMaterial:Mat,
  Color:function(){ return {r:1,g:1,b:1,set:noop,setHSL:noop,getHSL:o=>{o.h=0;o.s=0;o.l=0;return o;},offsetHSL(){return this;},lerp(){return this;},clone(){return THREE.Color();},copy(){return this;},multiplyScalar(){return this;}}; },
  Vector3:function(x,y,z){return vec(x,y,z);}, Vector2:function(){return {x:0,y:0,set:noop};}, Matrix4:Mtx, Quaternion:function(){return {setFromEuler(){return this;}};}, Euler:function(){return {set:noop};},
  Float32BufferAttribute:function(){return {};}, InstancedBufferAttribute:function(){return {};},
  Box3:function(){return {min:vec(),max:vec(),setFromObject(){return this;},getSize:()=>vec(),getCenter:()=>vec()};}, Raycaster:function(){return {setFromCamera:noop,intersectObject:()=>[],intersectObjects:()=>[]};},
  Texture:function(){return {needsUpdate:false};}, CanvasTexture:function(){return {needsUpdate:false};}, DataTexture:function(){return {needsUpdate:false};},
  WebGLRenderer:function(){return {setClearColor:noop,setPixelRatio:noop,setSize:noop,render:noop,outputEncoding:0,shadowMap:{},domElement:el(),capabilities:{getMaxAnisotropy:()=>1}};},
  Scene:function(){const o=Obj();o.fog=null;o.background=null;return o;}, FogExp2:function(){return {};}, Fog:function(){return {};},
  PerspectiveCamera:function(){const o=Obj();o.aspect=1;o.updateProjectionMatrix=noop;o.lookAt=noop;o.getWorldDirection=()=>vec();return o;}, OrthographicCamera:function(){const o=Obj();o.updateProjectionMatrix=noop;return o;},
  HemisphereLight:Obj,DirectionalLight:function(){const o=Obj();o.shadow={camera:{},mapSize:{set:noop}};o.target=Obj();return o;},AmbientLight:Obj,PointLight:function(){const o=Obj();o.intensity=1;o.shadow={mapSize:{set:noop}};return o;},SpotLight:Obj,
  AnimationMixer:function(){return {update:noop,clipAction:()=>({play:()=>({}),timeScale:0,setLoop:noop,reset(){return this;}})};}, GLTFLoader:function(){return {load:noop};}, SkeletonUtils:{clone:o=>o},
  sRGBEncoding:1,LinearEncoding:0,DoubleSide:2,BackSide:1,FrontSide:0,AdditiveBlending:2,NormalBlending:1,RepeatWrapping:1000,PCFSoftShadowMap:1,
};
function el(){ return {style:{},dataset:{},width:0,height:0,getContext:()=>new Proxy({},{get:()=>()=>({})}),addEventListener:noop,setPointerCapture:noop,getBoundingClientRect:()=>({left:0,top:0,width:1,height:1}),appendChild:noop,removeChild:noop,remove:noop,setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},style:{}}; }
const sandbox={ THREE,console,Math,Date,JSON,performance:{now:()=>0},setTimeout:noop,clearTimeout:noop,requestAnimationFrame:()=>0,
  innerWidth:1280,innerHeight:720,devicePixelRatio:1,addEventListener:noop,removeEventListener:noop,location:{search:""},navigator:{getGamepads:()=>[]},localStorage:{getItem:()=>null,setItem:noop,removeItem:noop},
  document:{getElementById:el,createElement:el,addEventListener:noop,body:el(),documentElement:el()} };
sandbox.window=sandbox; sandbox.globalThis=sandbox;
vm.createContext(sandbox);
vm.runInContext(code,sandbox,{filename:"game"});
const W=sandbox.__W;

W.__seed(1234);
const steps=[['buildTerrain',()=>W.buildTerrain()],['scatterWorld',()=>W.scatterWorld()],['seedSettlement',()=>W.seedSettlement()],['buildShroud',()=>W.buildShroud()],['updateShroud',()=>W.updateShroud()]];
let failed=false;
for(const [name,fn] of steps){
  try { fn(); console.log('OK   '+name); }
  catch(e){ failed=true; console.log('FAIL '+name+'  ->  '+e.message); console.log(e.stack.split('\n').slice(0,4).join('\n')); break; }
}
console.log(failed?'=== BOOT WOULD HANG ===':'=== all world-build steps ran ===');
