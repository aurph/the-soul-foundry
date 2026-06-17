/* Renders the procedural world top-down to a PNG so we can SEE the geography
   (biome regions, resource fields, relief) without a browser. Pure Node (zlib).
   Run: node tools/worldpreview.js [seed]  -> writes preview.png                */
const zlib=require('zlib'), fs=require('fs'), path=require('path');
const SEED=+(process.argv[2]||Date.now()%100000);
const HALF=75;

function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function vnoise(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;
  const h=(a,b)=>{let n=a*374761393+b*668265263;n=(n^(n>>13))*1274126177;return((n^(n>>16))>>>0)/4294967296;};
  const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),L=(a,b,t)=>a+(b-a)*t;
  return L(L(h(xi,yi),h(xi+1,yi),u),L(h(xi,yi+1),h(xi+1,yi+1),u),v);}
function fbm(x,y){let s=0,a=0.5,f=1;for(let i=0;i<5;i++){s+=a*vnoise(x*f,y*f);f*=2;a*=0.5;}return s;}
const lerp=(a,b,t)=>a+(b-a)*t, clamp=(v,a,b)=>v<a?a:v>b?b:v;
function hsl(h,s,l){ const a=s*Math.min(l,1-l); const f=n=>{const k=(n+h*12)%12; return l-a*Math.max(-1,Math.min(k-3,9-k,1));};
  return [f(0),f(8),f(4)]; }

/* ---- WORLD GEN (this is what will be ported into the game) ---- */
function genRegions(seed){
  const r=mulberry32(seed*7+13); const types=['forest','silica','ash','ruins','graves','bog'];
  const regs=[]; const n=8+Math.floor(r()*4);
  // ensure at least one of each essential
  const forced=['forest','forest','silica','ash','graves','ruins','bog'];
  for(let i=0;i<n;i++){ const ang=r()*6.28, dist=20+r()*48;
    regs.push({type: i<forced.length?forced[i]:types[(r()*types.length)|0], x:Math.cos(ang)*dist, z:Math.sin(ang)*dist, rad:9+r()*11, seed:(r()*1e6)|0}); }
  return regs;
}
function baseHeight(x,z){
  const d=Math.hypot(x,z)/HALF;
  const hills=(fbm(x*0.028+10,z*0.028+20)-0.5)*24;
  const ridge=(fbm(x*0.075-5,z*0.075+5)-0.5)*7;
  const basin=-8*Math.exp(-Math.pow(d*2.3,2));          // central settlement bowl
  let h=hills+ridge+basin;
  const rv=Math.abs(fbm(x*0.018-7,z*0.018+3)-0.5);       // a winding ash-river channel
  if(rv<0.045) h-=5*(1-rv/0.045);
  return h;
}
function regionAt(x,z,regs){ let best=null;
  for(const g of regs){ const d=Math.hypot(x-g.x,z-g.z); if(d<g.rad){ const t=1-d/g.rad; if(!best||t>best.t) best={reg:g,t}; } }
  return best; }
const BIOME={ forest:[0.27,0.16,0.26], silica:[0.10,0.05,0.42], ash:[0.04,0.06,0.17],
  ruins:[0.60,0.05,0.30], graves:[0.33,0.08,0.28], bog:[0.22,0.16,0.22] };
function biomeColor(x,z,h,regs){
  // visible desolate palette: ashen tan / mud / dead-grass / pale rock (NOT near-black)
  let c; if(h<-4)c=hsl(0.08,0.06,0.20); else if(h<-1)c=hsl(0.09,0.10,0.27); else if(h<6)c=hsl(0.11,0.10,0.34); else c=hsl(0.07,0.05,0.42);
  const rg=regionAt(x,z,regs);
  if(rg){ const b=BIOME[rg.reg.type]; const bc=hsl(b[0],b[1],b[2]); const t=Math.pow(rg.t,0.6)*0.92;
    c=[lerp(c[0],bc[0],t),lerp(c[1],bc[1],t),lerp(c[2],bc[2],t)]; }
  return c;
}

/* ---- top-down PNG render ---- */
const W=420,H=420; const buf=Buffer.alloc(W*H*4);
const regs=genRegions(SEED);
function shadeAt(x,z){
  const h=baseHeight(x,z);
  // simple relief shading via height gradient
  const e=0.7, hx=baseHeight(x+e,z)-baseHeight(x-e,z), hz=baseHeight(x,z+e)-baseHeight(x,z-e);
  const slope=clamp(1+(-(hx)-(hz))*0.16,0.5,1.55);   // light NW-facing slopes, dark SE
  let c=biomeColor(x,z,h,regs);
  return [clamp(c[0]*slope,0,1),clamp(c[1]*slope,0,1),clamp(c[2]*slope,0,1)];
}
for(let py=0;py<H;py++){ for(let px=0;px<W;px++){
  const x=(px/W*2-1)*HALF, z=(py/H*2-1)*HALF; const c=shadeAt(x,z);
  const i=(py*W+px)*4; buf[i]=c[0]*255; buf[i+1]=c[1]*255; buf[i+2]=c[2]*255; buf[i+3]=255;
}}
// overlay: region centers (white ring) + scattered node dots per region
function dot(px,py,r,col){ for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){ if(dx*dx+dy*dy>r*r)continue;
  const X=px+dx,Y=py+dy; if(X<0||Y<0||X>=W||Y>=H)continue; const i=(Y*W+X)*4; buf[i]=col[0];buf[i+1]=col[1];buf[i+2]=col[2];buf[i+3]=255; } }
const toPx=(x,z)=>[((x/HALF)*0.5+0.5)*W|0,((z/HALF)*0.5+0.5)*H|0];
const NCOL={forest:[120,150,90],silica:[200,200,220],ash:[150,90,70],ruins:[120,140,160],graves:[150,160,140],bog:[110,130,90]};
for(const g of regs){ const rr=mulberry32(g.seed); const cnt=10+(rr()*16|0);
  for(let k=0;k<cnt;k++){ const a=rr()*6.28, d=rr()*g.rad; const [px,py]=toPx(g.x+Math.cos(a)*d,g.z+Math.sin(a)*d); dot(px,py,2,NCOL[g.type]||[200,200,200]); }
  const [cx,cy]=toPx(g.x,g.z); dot(cx,cy,3,[255,230,180]); }
// settlement centre marker
{ const [cx,cy]=toPx(0,0); dot(cx,cy,4,[255,140,60]); }

// encode PNG
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
fs.writeFileSync(path.join(__dirname,'preview.png'),png(W,H,buf));
console.log("seed",SEED,"regions:",regs.map(r=>r.type).join(","));
console.log("wrote preview.png ("+W+"x"+H+")");
