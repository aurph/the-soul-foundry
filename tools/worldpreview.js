/* Renders the procedural world top-down to a PNG so we can SEE the geography
   (biome regions, resource fields, relief) without a browser.

   It does NOT re-implement the world: it evaluates the REAL terrainHeight /
   genRegions / regionAt / biomeColor straight out of game/index.html with a
   faithful Color stub, so the preview is pixel-true to the game and can never
   drift from it. Pure Node (zlib).

   Module: require('./worldpreview') -> { terrainHeight, biomeColor, genRegions, regionAt, HALF, render } */
const zlib=require('zlib'), fs=require('fs'), vm=require('vm'), path=require('path');

/* ---- load the real game world-gen ---- */
function loadGameWorld(){
  let code=fs.readFileSync(path.join(__dirname,'..','game','index.html'),'utf8')
    .match(/<script>([\s\S]*?)<\/script>/g).map(s=>s.replace(/<\/?script>/g,'')).find(s=>s.includes('use strict'));
  code=code.replace(/\nstart\(\);/,'\n/*no start*/');
  code+=`\n;this.__W={terrainHeight,genRegions,regionAt,biomeColor,HALF};`;

  // faithful Color (real HSL<->RGB) so biomeColor returns TRUE pixels
  function hue2(p,q,t){ if(t<0)t+=1; if(t>1)t-=1; if(t<1/6)return p+(q-p)*6*t; if(t<1/2)return q; if(t<2/3)return p+(q-p)*(2/3-t)*6; return p; }
  function Color(){ this.r=1; this.g=1; this.b=1; }
  Color.prototype.setHSL=function(h,s,l){ h=((h%1)+1)%1; if(s<=0){this.r=this.g=this.b=l;} else { const q=l<0.5?l*(1+s):l+s-l*s, p=2*l-q; this.r=hue2(p,q,h+1/3); this.g=hue2(p,q,h); this.b=hue2(p,q,h-1/3);} return this; };
  Color.prototype.getHSL=function(t){ const r=this.r,g=this.g,b=this.b,mx=Math.max(r,g,b),mn=Math.min(r,g,b); let h,s,l=(mx+mn)/2;
    if(mx===mn){h=0;s=0;} else { const d=mx-mn; s=l>0.5?d/(2-mx-mn):d/(mx+mn); h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4; h/=6; } t.h=h;t.s=s;t.l=l; return t; };
  Color.prototype.offsetHSL=function(dh,ds,dl){ const o={}; this.getHSL(o); return this.setHSL(o.h+dh,Math.max(0,Math.min(1,o.s+ds)),Math.max(0,Math.min(1,o.l+dl))); };
  Color.prototype.lerp=function(c,t){ this.r+=(c.r-this.r)*t; this.g+=(c.g-this.g)*t; this.b+=(c.b-this.b)*t; return this; };
  Color.prototype.clone=function(){ const c=new Color(); c.r=this.r;c.g=this.g;c.b=this.b; return c; };
  Color.prototype.copy=function(c){ this.r=c.r;this.g=c.g;this.b=c.b; return this; };
  Color.prototype.multiplyScalar=function(s){ this.r*=s;this.g*=s;this.b*=s; return this; };
  Color.prototype.set=function(){ return this; };

  // minimal stub surface: only what the game script touches at load time
  const noop=()=>{};
  function Obj(){return{position:{set:noop,copy:noop,x:0,y:0,z:0},rotation:{set:noop},scale:{set:noop,setScalar:noop,multiplyScalar:noop},userData:{},children:[],add:noop,remove:noop,traverse:noop,clone(){return Obj();}};}
  function geo(){return{attributes:{position:{count:0,getX:()=>0,getY:()=>0,getZ:()=>0,setX:noop,setY:noop,setZ:noop},normal:{getX:()=>0,getY:()=>1,getZ:()=>0}},rotateX(){return this;},rotateY(){return this;},translate(){return this;},center(){return this;},computeVertexNormals:noop,setAttribute:noop};}
  function Mat(){return{color:new Color(),emissive:new Color(),clone(){return Mat();}};}
  const THREE={ Color, WebGLRenderer:function(){return{setClearColor:noop,setPixelRatio:noop,setSize:noop,render:noop,outputEncoding:0,shadowMap:{}};},
    sRGBEncoding:1,DoubleSide:2,BackSide:1, Scene:function(){const o=Obj();o.fog=null;o.background=null;return o;}, FogExp2:function(){return{};},
    PerspectiveCamera:function(){const o=Obj();o.aspect=1;o.updateProjectionMatrix=noop;o.lookAt=noop;return o;},
    HemisphereLight:Obj,DirectionalLight:Obj,PointLight:function(){const o=Obj();o.intensity=1;return o;},
    Group:Obj,Mesh:function(){return Obj();},Points:Obj,
    InstancedMesh:function(){const o=Obj();o.count=0;o.instanceMatrix={needsUpdate:false};o.setMatrixAt=noop;return o;},
    PlaneGeometry:geo,BoxGeometry:geo,CylinderGeometry:geo,ConeGeometry:geo,IcosahedronGeometry:geo,DodecahedronGeometry:geo,SphereGeometry:geo,TorusGeometry:geo,CircleGeometry:geo,BufferGeometry:geo,
    MeshStandardMaterial:Mat,MeshBasicMaterial:Mat,ShaderMaterial:Mat,PointsMaterial:Mat,
    Float32BufferAttribute:function(){return{};}, Vector3:function(x=0,y=0,z=0){return{x,y,z,set:noop,copy:noop};}, Vector2:function(){return{x:0,y:0};}, Matrix4:function(){return{makeScale:noop,setPosition:noop};},
    Box3:function(){return{min:{x:0,y:0,z:0},max:{x:0,y:0,z:0},setFromObject(){return this;}};}, Raycaster:function(){return{setFromCamera:noop,intersectObject:()=>[],intersectObjects:()=>[]};},
    AnimationMixer:function(){return{update:noop,clipAction:()=>({play:()=>({}),timeScale:0})};}, GLTFLoader:function(){return{load:noop};}, SkeletonUtils:{clone:o=>o} };
  const el=()=>({style:{},dataset:{},width:0,height:0,getContext:()=>new Proxy({},{get:()=>()=>({})}),addEventListener:noop,setPointerCapture:noop,getBoundingClientRect:()=>({left:0,top:0,width:1,height:1}),appendChild:noop,removeChild:noop,remove:noop,setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop,contains:()=>false}});
  const sandbox={THREE,console,Math,Date,JSON,performance:{now:()=>0},setTimeout:noop,clearTimeout:noop,innerWidth:800,innerHeight:600,devicePixelRatio:1,requestAnimationFrame:()=>0,addEventListener:noop,removeEventListener:noop,location:{search:""},navigator:{getGamepads:()=>[]},document:{getElementById:el,createElement:el,addEventListener:noop,body:el()}};
  sandbox.window=sandbox; sandbox.globalThis=sandbox;
  vm.createContext(sandbox); vm.runInContext(code,sandbox,{filename:"game"});
  return sandbox.__W;
}
const W=loadGameWorld();
const HALF=W.HALF;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;

/* ---- top-down PNG render of the real terrain ---- */
function shadeAt(x,z,regs){
  const h=W.terrainHeight(x,z);
  const e=0.7, hx=W.terrainHeight(x+e,z)-W.terrainHeight(x-e,z), hz=W.terrainHeight(x,z+e)-W.terrainHeight(x,z-e);
  const slope=clamp(Math.hypot(hx,hz)*0.5,0,1);
  const c=W.biomeColor(x,z,h,slope);                       // the EXACT colour the game paints
  const light=clamp(1+(-(hx)-(hz))*0.18,0.55,1.55);        // NW-facing relief shading
  return [clamp(c.r*light,0,1),clamp(c.g*light,0,1),clamp(c.b*light,0,1)];
}
function png(w,h,rgba){
  const raw=Buffer.alloc((w*4+1)*h);
  for(let y=0;y<h;y++){ raw[y*(w*4+1)]=0; rgba.copy(raw,y*(w*4+1)+1,y*w*4,(y+1)*w*4); }
  const idat=zlib.deflateSync(raw);
  const crcTab=(()=>{const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
  const crc=b=>{let c=0xffffffff;for(let i=0;i<b.length;i++)c=crcTab[(c^b[i])&0xff]^(c>>>8);return (c^0xffffffff)>>>0;};
  const chunk=(type,data)=>{const len=Buffer.alloc(4);len.writeUInt32BE(data.length);const t=Buffer.from(type);const cb=Buffer.concat([t,data]);
    const c=Buffer.alloc(4);c.writeUInt32BE(crc(cb));return Buffer.concat([len,cb,c]);};
  const ihdr=Buffer.alloc(13); ihdr.writeUInt32BE(w,0); ihdr.writeUInt32BE(h,4); ihdr[8]=8; ihdr[9]=6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',idat),chunk('IEND',Buffer.alloc(0))]);
}
const NCOL={forest:[120,150,90],silica:[200,200,220],ash:[150,90,70],ruins:[120,140,160],graves:[150,160,140],bog:[110,130,90]};
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

function render(seed,outPath,size){
  const W2=size||440, H2=W2; const buf=Buffer.alloc(W2*H2*4);
  const regs=W.genRegions(seed);
  for(let py=0;py<H2;py++){ for(let px=0;px<W2;px++){
    const x=(px/W2*2-1)*HALF, z=(py/H2*2-1)*HALF; const c=shadeAt(x,z,regs);
    const i=(py*W2+px)*4; buf[i]=c[0]*255; buf[i+1]=c[1]*255; buf[i+2]=c[2]*255; buf[i+3]=255;
  }}
  const toPx=(x,z)=>[((x/HALF)*0.5+0.5)*W2|0,((z/HALF)*0.5+0.5)*H2|0];
  const dot=(px,py,r,col)=>{ for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){ if(dx*dx+dy*dy>r*r)continue;
    const X=px+dx,Y=py+dy; if(X<0||Y<0||X>=W2||Y>=H2)continue; const i=(Y*W2+X)*4; buf[i]=col[0];buf[i+1]=col[1];buf[i+2]=col[2];buf[i+3]=255; } };
  for(const g of regs){ const rr=mulberry32(g.seed); const cnt=10+(rr()*16|0);
    for(let k=0;k<cnt;k++){ const a=rr()*6.28, d=rr()*g.rad; const [px,py]=toPx(g.x+Math.cos(a)*d,g.z+Math.sin(a)*d); dot(px,py,2,NCOL[g.type]||[200,200,200]); }
    const [cx,cy]=toPx(g.x,g.z); dot(cx,cy,3,[255,230,180]); }
  { const [cx,cy]=toPx(0,0); dot(cx,cy,4,[255,140,60]); }   // settlement
  fs.writeFileSync(outPath,png(W2,H2,buf));
  return regs;
}

module.exports={ terrainHeight:W.terrainHeight, biomeColor:W.biomeColor, genRegions:W.genRegions, regionAt:W.regionAt, HALF, render };

if(require.main===module){
  const SEED=+(process.argv[2]||Date.now()%100000);
  const out=path.join(__dirname,'preview.png');
  const regs=render(SEED,out,440);
  console.log("seed",SEED,"regions:",regs.map(r=>r.type).join(","));
  console.log("wrote preview.png (440x440) — rendered from the REAL game terrain");
}
