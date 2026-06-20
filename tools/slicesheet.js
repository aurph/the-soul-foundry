// slicesheet.js — cut the generated sheets into per-item PNGs.
//  - kit/icons-sheet.png (12 resource icons on pure black) -> game/assets/ui/res/*.png
//    keyed transparent + trimmed, for inline use on panels.
//  - glyphs-sheet.png (12 woodcut glyphs on charred-wood plaques) -> game/assets/ui/glyph/*.png
//    square center-crops kept on their wood plaque, used as wooden buttons.
const fs = require('fs'), path = require('path');
const { PNG } = require(path.join(__dirname, 'node_modules', 'pngjs'));
const G = p => path.join(__dirname, '..', 'game', p);
function load(p){ const g = PNG.sync.read(fs.readFileSync(p)); return { w: g.width, h: g.height, d: new Uint8Array(g.data) }; }
function save(img, p){ const g = new PNG({ width: img.w, height: img.h }); g.data = Buffer.from(img.d.buffer, img.d.byteOffset, img.d.length); fs.writeFileSync(p, PNG.sync.write(g)); }
function mk(w, h){ return { w, h, d: new Uint8Array(w * h * 4) }; }
function crop(src, x0, y0, w, h){ const o = mk(w, h); for (let y=0;y<h;y++) for (let x=0;x<w;x++){ const sx=x0+x, sy=y0+y; if(sx<0||sy<0||sx>=src.w||sy>=src.h) continue; const si=(sy*src.w+sx)*4, di=(y*w+x)*4; o.d[di]=src.d[si];o.d[di+1]=src.d[si+1];o.d[di+2]=src.d[si+2];o.d[di+3]=src.d[si+3]; } return o; }
function keyBlack(img){ const d=img.d; for(let i=0;i<d.length;i+=4){ const L=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2]; d[i+3]= L<22?0 : L>62?255 : Math.round((L-22)/40*255); } }
function trim(img, pad){ let x0=img.w,y0=img.h,x1=-1,y1=-1; for(let y=0;y<img.h;y++)for(let x=0;x<img.w;x++){ if(img.d[(y*img.w+x)*4+3]>24){ if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y; } } if(x1<x0) return img; pad=pad||4; x0=Math.max(0,x0-pad);y0=Math.max(0,y0-pad);x1=Math.min(img.w-1,x1+pad);y1=Math.min(img.h-1,y1+pad); return crop(img,x0,y0,x1-x0+1,y1-y0+1); }

const RES = [['dead','bonesil','soulash','ichor'],['ingot','wafer','die','core'],['power','compute','cross','bones']];
{ const src = load(G('assets/ui/kit/icons-sheet.png')); const cw=src.w/4, ch=src.h/3, out=G('assets/ui/res'); fs.mkdirSync(out,{recursive:true});
  for(let r=0;r<3;r++)for(let c=0;c<4;c++){ let cell=crop(src,Math.round(c*cw),Math.round(r*ch),Math.round(cw),Math.round(ch)); keyBlack(cell); cell=trim(cell,8); save(cell,path.join(out,RES[r][c]+'.png')); }
  console.log('wrote 12 resource icons -> game/assets/ui/res/'); }

const GLY = [['ledger','market','info','economy'],['pause','play','fast','demolish'],['dwelling','gathering','refining','civic']];
{ const src = load(G('assets/ui/glyphs-sheet.png')); const cw=src.w/4, ch=src.h/3, out=G('assets/ui/glyph'); fs.mkdirSync(out,{recursive:true});
  const sq=Math.round(Math.min(cw,ch)*0.94);
  for(let r=0;r<3;r++)for(let c=0;c<4;c++){ const cx=Math.round(c*cw+cw/2), cy=Math.round(r*ch+ch/2); const cell=crop(src,Math.round(cx-sq/2),Math.round(cy-sq/2),sq,sq); save(cell,path.join(out,GLY[r][c]+'.png')); }
  console.log('wrote 12 glyph buttons -> game/assets/ui/glyph/'); }

const GLY2 = [['rites','sound','soundoff','options'],['assign','close','objective','codex']];
{ const src = load(G('assets/ui/glyphs2-sheet.png')); const cw=src.w/4, ch=src.h/2, out=G('assets/ui/glyph');
  const sq=Math.round(Math.min(cw,ch)*0.94);
  for(let r=0;r<2;r++)for(let c=0;c<4;c++){ const cx=Math.round(c*cw+cw/2), cy=Math.round(r*ch+ch/2); const cell=crop(src,Math.round(cx-sq/2),Math.round(cy-sq/2),sq,sq); save(cell,path.join(out,GLY2[r][c]+'.png')); }
  console.log('wrote 8 more glyph buttons -> game/assets/ui/glyph/'); }
