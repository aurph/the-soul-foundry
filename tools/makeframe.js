// makeframe.js — composite a 9-slice "lashed sticks" UI frame from a single
// low-poly branch PNG. Keys the flat background, grades the warm wood to cold
// grimy charcoal/bone (David Szymanski palette), squishes it skinnier, lashes
// four copies into a square frame with cord-knot corners, then dithers+grains
// it for that PS1/Build-engine low-res feel.
//
// Usage: node tools/makeframe.js [srcBranch.png]
// Out:   game/assets/ui/frame-branch.png   (transparent center, 9-slice source)
//        tools/_frame-preview.png          (frame over a dark panel, for review)

const fs = require('fs');
const path = require('path');
const { PNG } = require(path.join(__dirname, 'node_modules', 'pngjs'));

const SRC = process.argv[2] ||
  '/Users/jackschwartz/Downloads/Gemini_Generated_Image_irftpvirftpvirft.png';
const OUT_ASSET = path.join(__dirname, '..', 'game', 'assets', 'ui', 'frame-branch.png');
const OUT_PREV  = path.join(__dirname, '_frame-preview.png');

// ---- tunables ----
const P = {
  keyTol: 30,          // background = contiguous-from-edge pixels near the sampled bg color
  pocketTol: 44,       // global key for background trapped in concavities — color-only, so dark wood FACES (warmer) survive
  desat: 0.85,         // pull toward luminance (drain the cozy brown)
  tint: [0.96, 0.99, 1.07], // cool it (less red, more blue) -> cold bone-grey
  gain: 1.46,          // lift wood into a visible driftwood range (brighter so the frame isn't black)
  lift: 13,            // flat lift so shadows don't crush to black
  contrast: 1.06,
  S: 640,              // frame canvas size
  T: 160,              // slice thickness (border inset)
  woodSquish: 0.98,    // band fill: trunk nearly fills the slice band so the frame reads as solid wood, not gaps
  trunkThr: 0.26,      // lower = keep more twig stubs around the trunk
  grainAmp: 9,         // per-pixel noise
  posterize: 8,        // color levels per channel (chunky, but less banding)
  cordDark: [42, 42, 48],
  cordLite: [102, 102, 95],
};

// ---- tiny raster lib over RGBA Uint8 buffers ----
function mk(w, h) { return { w, h, d: new Uint8Array(w * h * 4) }; }
function load(p) { const png = PNG.sync.read(fs.readFileSync(p)); return { w: png.width, h: png.height, d: new Uint8Array(png.data) }; }
function save(img, p) { const png = new PNG({ width: img.w, height: img.h }); png.data = Buffer.from(img.d.buffer, img.d.byteOffset, img.d.length); fs.writeFileSync(p, PNG.sync.write(png)); }
const clamp = v => v < 0 ? 0 : v > 255 ? 255 : v | 0;
function gp(img, x, y) { const i = (y * img.w + x) * 4, d = img.d; return [d[i], d[i + 1], d[i + 2], d[i + 3]]; }
function sp(img, x, y, r, g, b, a) { if (x < 0 || y < 0 || x >= img.w || y >= img.h) return; const i = (y * img.w + x) * 4, d = img.d; d[i] = clamp(r); d[i + 1] = clamp(g); d[i + 2] = clamp(b); d[i + 3] = clamp(a); }

// alpha-over blit of src onto dst at (ox,oy)
function blit(dst, src, ox, oy) {
  for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
    const dx = ox + x, dy = oy + y; if (dx < 0 || dy < 0 || dx >= dst.w || dy >= dst.h) continue;
    const si = (y * src.w + x) * 4, a = src.d[si + 3] / 255; if (a === 0) continue;
    const di = (dy * dst.w + dx) * 4;
    dst.d[di]   = clamp(src.d[si]   * a + dst.d[di]   * (1 - a));
    dst.d[di+1] = clamp(src.d[si+1] * a + dst.d[di+1] * (1 - a));
    dst.d[di+2] = clamp(src.d[si+2] * a + dst.d[di+2] * (1 - a));
    dst.d[di+3] = clamp(255 * a + dst.d[di+3] * (1 - a));
  }
}

// nearest-neighbor resize (keep it chunky)
function resize(src, w, h) {
  const o = mk(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const sx = Math.min(src.w - 1, (x * src.w / w) | 0), sy = Math.min(src.h - 1, (y * src.h / h) | 0);
    const si = (sy * src.w + sx) * 4, di = (y * w + x) * 4;
    o.d[di] = src.d[si]; o.d[di+1] = src.d[si+1]; o.d[di+2] = src.d[si+2]; o.d[di+3] = src.d[si+3];
  }
  return o;
}

function rot90(src, dir) { // dir: 'cw' | 'ccw' | '180'
  let w, h; if (dir === '180') { w = src.w; h = src.h; } else { w = src.h; h = src.w; }
  const o = mk(w, h);
  for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
    let dx, dy;
    if (dir === 'cw') { dx = (src.h - 1 - y); dy = x; }
    else if (dir === 'ccw') { dx = y; dy = (src.w - 1 - x); }
    else { dx = src.w - 1 - x; dy = src.h - 1 - y; }
    const si = (y * src.w + x) * 4, di = (dy * w + dx) * 4;
    o.d[di] = src.d[si]; o.d[di+1] = src.d[si+1]; o.d[di+2] = src.d[si+2]; o.d[di+3] = src.d[si+3];
  }
  return o;
}
function flipH(src) { const o = mk(src.w, src.h); for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) { const si = (y*src.w+x)*4, di=(y*src.w+(src.w-1-x))*4; o.d[di]=src.d[si];o.d[di+1]=src.d[si+1];o.d[di+2]=src.d[si+2];o.d[di+3]=src.d[si+3]; } return o; }

// faithfully reproduce CSS `border-image: <frame> <sl> / <bw> stretch` over a bg panel
function sub(frame, sx, sy, sw, sh) { const t = mk(sw, sh); for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) { const si = ((sy + y) * frame.w + (sx + x)) * 4, di = (y * sw + x) * 4; t.d[di]=frame.d[si];t.d[di+1]=frame.d[si+1];t.d[di+2]=frame.d[si+2];t.d[di+3]=frame.d[si+3]; } return t; }
function nineSlice(frame, sl, bw, W, H, bg) {
  const o = mk(W, H); for (let i = 0; i < o.d.length; i += 4) { o.d[i]=bg[0];o.d[i+1]=bg[1];o.d[i+2]=bg[2];o.d[i+3]=bg[3]; }
  const S = frame.w, inW = W - 2 * bw, inH = H - 2 * bw, mid = S - 2 * sl;
  blit(o, resize(sub(frame, 0, 0, sl, sl), bw, bw), 0, 0);
  blit(o, resize(sub(frame, S - sl, 0, sl, sl), bw, bw), W - bw, 0);
  blit(o, resize(sub(frame, 0, S - sl, sl, sl), bw, bw), 0, H - bw);
  blit(o, resize(sub(frame, S - sl, S - sl, sl, sl), bw, bw), W - bw, H - bw);
  blit(o, resize(sub(frame, sl, 0, mid, sl), inW, bw), bw, 0);
  blit(o, resize(sub(frame, sl, S - sl, mid, sl), inW, bw), bw, H - bw);
  blit(o, resize(sub(frame, 0, sl, sl, mid), bw, inH), 0, bw);
  blit(o, resize(sub(frame, S - sl, sl, sl, mid), bw, inH), W - bw, bw);
  return o;
}

// sample the flat background color from the four corners (branch is centered)
function sampleBg(img) {
  let r = 0, g = 0, b = 0, n = 0; const s = 24;
  const corners = [[0, 0], [img.w - s, 0], [0, img.h - s], [img.w - s, img.h - s]];
  for (const [px, py] of corners) for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) { const i = ((py + y) * img.w + (px + x)) * 4; r += img.d[i]; g += img.d[i + 1]; b += img.d[i + 2]; n++; }
  return [r / n, g / n, b / n];
}

// ---- 1. key the flat background (contiguous flood from edges, by color distance) ----
function keyBg(img) {
  const { w, h, d } = img; const bg = sampleBg(img); const tol2 = P.keyTol * P.keyTol;
  const vis = new Uint8Array(w * h); const st = [];
  const push = (x, y) => { if (x >= 0 && y >= 0 && x < w && y < h) st.push(y * w + x); };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (st.length) {
    const i = st.pop(); if (vis[i]) continue; vis[i] = 1;
    const p = i * 4, dr = d[p] - bg[0], dg = d[p + 1] - bg[1], db = d[p + 2] - bg[2];
    if (dr * dr + dg * dg + db * db >= tol2) continue;   // not bg color; hit the wood
    d[p + 3] = 0;                                         // background -> transparent
    const x = i % w, y = (i / w) | 0;
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }
}

// the contiguous flood can't reach background trapped in the concave curves between
// sticks — those pockets stay opaque and read as "black background" when sliced into a
// border. Key them globally by COLOR ONLY (no luminance): the pockets are the same flat
// dark bg color, while the wood's dark FACES are warmer/browner and sit beyond the
// tolerance, so they survive and the sticks stay solid. Runs before grading.
function keyBgGlobal(img, tol) {
  const { d } = img; const bg = sampleBg(img); const t2 = tol * tol;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const dr = d[i] - bg[0], dg = d[i + 1] - bg[1], db = d[i + 2] - bg[2];
    if (dr * dr + dg * dg + db * db < t2) d[i + 3] = 0;
  }
}

// paint out a bright corner watermark (Gemini sparkle) before keying
function removeWatermark(img, bg) {
  const { w, h, d } = img; let x0 = w, y0 = h, x1 = 0, y1 = 0, n = 0;
  for (let y = (h * 0.6) | 0; y < h; y++) for (let x = (w * 0.7) | 0; x < w; x++) {
    const i = (y * w + x) * 4, L = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    if (L > 140) { n++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  if (n < 40) return; const m = 12;
  for (let y = Math.max(0, y0 - m); y <= Math.min(h - 1, y1 + m); y++) for (let x = Math.max(0, x0 - m); x <= Math.min(w - 1, x1 + m); x++) {
    const i = (y * w + x) * 4; d[i] = bg[0]; d[i + 1] = bg[1]; d[i + 2] = bg[2]; d[i + 3] = 255;
  }
}

// crop vertically to the dominant horizontal trunk band (drop the long thin
// twig tips that inflate the bbox), so the trunk fills the frame's stick band
function trunkBand(img) {
  const cov = new Array(img.h).fill(0);
  for (let y = 0; y < img.h; y++) { let c = 0; for (let x = 0; x < img.w; x++) if (img.d[(y * img.w + x) * 4 + 3] > 40) c++; cov[y] = c; }
  let mx = 0; for (const v of cov) if (v > mx) mx = v; const thr = mx * P.trunkThr;
  let y0 = 0, y1 = img.h - 1;
  for (let y = 0; y < img.h; y++) if (cov[y] >= thr) { y0 = y; break; }
  for (let y = img.h - 1; y >= 0; y--) if (cov[y] >= thr) { y1 = y; break; }
  const pad = Math.round((y1 - y0) * 0.16); y0 = Math.max(0, y0 - pad); y1 = Math.min(img.h - 1, y1 + pad);
  const h = y1 - y0 + 1, o = mk(img.w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < img.w; x++) { const si = ((y + y0) * img.w + x) * 4, di = (y * img.w + x) * 4; o.d[di]=img.d[si];o.d[di+1]=img.d[si+1];o.d[di+2]=img.d[si+2];o.d[di+3]=img.d[si+3]; }
  return o;
}

// crop to opaque bounding box (+pad)
function autocrop(img, pad = 2) {
  let x0 = img.w, y0 = img.h, x1 = 0, y1 = 0;
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) {
    if (img.d[(y * img.w + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(img.w - 1, x1 + pad); y1 = Math.min(img.h - 1, y1 + pad);
  const w = x1 - x0 + 1, h = y1 - y0 + 1, o = mk(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const si = ((y + y0) * img.w + (x + x0)) * 4, di = (y * w + x) * 4; o.d[di]=img.d[si];o.d[di+1]=img.d[si+1];o.d[di+2]=img.d[si+2];o.d[di+3]=img.d[si+3]; }
  return o;
}

// ---- 2. grade warm wood -> cold grimy charcoal/bone ----
function grade(img) {
  const d = img.d;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    let r = d[i], g = d[i + 1], b = d[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    r = r * (1 - P.desat) + lum * P.desat;
    g = g * (1 - P.desat) + lum * P.desat;
    b = b * (1 - P.desat) + lum * P.desat;
    r *= P.tint[0]; g *= P.tint[1]; b *= P.tint[2];
    r = (r - 128) * P.contrast + 128; g = (g - 128) * P.contrast + 128; b = (b - 128) * P.contrast + 128;
    r = r * P.gain + P.lift; g = g * P.gain + P.lift; b = b * P.gain + P.lift;
    d[i] = clamp(r); d[i + 1] = clamp(g); d[i + 2] = clamp(b);
  }
}

// thick line (cord) — stamp filled squares along the segment
function cord(img, x0, y0, x1, y1, hw, col) {
  const dx = x1 - x0, dy = y1 - y0, n = Math.ceil(Math.hypot(dx, dy));
  for (let t = 0; t <= n; t++) {
    const cx = (x0 + dx * t / n) | 0, cy = (y0 + dy * t / n) | 0;
    for (let yy = -hw; yy <= hw; yy++) for (let xx = -hw; xx <= hw; xx++) {
      if (xx * xx + yy * yy > hw * hw) continue;
      sp(img, cx + xx, cy + yy, col[0], col[1], col[2], 255);
    }
  }
}

// lash a corner: a few cord wraps across the (T,T) joint, perpendicular to the diagonal
function lash(img, cx, cy, T) {
  const len = T * 0.20, gap = T * 0.058;
  // a tight little binding of a few cord wraps across the stick joint
  const ax = Math.SQRT1_2, ay = Math.SQRT1_2;      // diagonal
  const px = -ay, py = ax;                          // perpendicular (wrap direction)
  for (let k = -1; k <= 1; k++) {
    const ox = cx + ax * gap * k * 2, oy = cy + ay * gap * k * 2;
    cord(img, ox - px * len, oy - py * len, ox + px * len, oy + py * len, 4, P.cordDark);   // dark backing
    if (k === 0) cord(img, ox - px * len, oy - py * len, ox + px * len, oy + py * len, 1, P.cordLite); // single lit strand
  }
}

// ---- 3. grime: seeded noise + posterize over opaque pixels ----
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function grime(img) {
  const rnd = mulberry32(0x50554c); const lv = P.posterize, step = 255 / (lv - 1);
  const d = img.d;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const n = (rnd() - 0.5) * 2 * P.grainAmp;
    for (let c = 0; c < 3; c++) { let v = d[i + c] + n; v = Math.round(v / step) * step; d[i + c] = clamp(v); }
  }
}

// ================= build =================
const raw = load(SRC);
removeWatermark(raw, sampleBg(raw));
keyBg(raw);
keyBgGlobal(raw, P.pocketTol);   // clear background trapped in the concave curves (color-only; wood survives)
let B = autocrop(raw);
B = trunkBand(B);     // tighten to the trunk so the wood reads bold when sliced
grade(B);

const S = P.S, T = P.T;
// skinnier stick: squish the wood band height
const woodH = Math.round(T * P.woodSquish);
const yPad = (T - woodH) >> 1;

const frame = mk(S, S);
// edges (full span so border-image `stretch` reads as one continuous stick)
const top = resize(B, S, woodH);
const bottom = flipH(resize(B, S, woodH));
const Bv = rot90(B, 'ccw');
const left = resize(Bv, woodH, S);
const right = resize(rot90(B, 'cw'), woodH, S);
blit(frame, left, yPad, 0);
blit(frame, right, S - yPad - woodH, 0);
blit(frame, top, 0, yPad);
blit(frame, bottom, 0, S - yPad - woodH);
// corner lashings hide the joins
lash(frame, T * 0.5, T * 0.5, T);
lash(frame, S - T * 0.5, T * 0.5, T);
lash(frame, T * 0.5, S - T * 0.5, T);
lash(frame, S - T * 0.5, S - T * 0.5, T);
grime(frame);
save(frame, OUT_ASSET);

// preview over a dark panel
const prev = mk(S, S);
for (let i = 0; i < prev.d.length; i += 4) { prev.d[i] = 0x15; prev.d[i+1] = 0x16; prev.d[i+2] = 0x1a; prev.d[i+3] = 255; }
blit(prev, frame, 0, 0);
save(prev, OUT_PREV);

console.log('branch cropped to', B.w + 'x' + B.h, '| frame', S + 'x' + S, 'T=' + T, 'woodH=' + woodH);
console.log('wrote', OUT_ASSET);
console.log('wrote', OUT_PREV);

// true-to-CSS panel mocks at real in-game sizes (slice = T, like the stylesheet)
const SLICE = T;
save(nineSlice(frame, SLICE, 30, 266, 392, [12, 13, 17, 255]), path.join(__dirname, '_panel-inspect.png'));
save(nineSlice(frame, SLICE, 44, 600, 430, [12, 13, 17, 255]), path.join(__dirname, '_panel-modal.png'));
save(nineSlice(frame, SLICE, 24, 1000, 150, [12, 13, 17, 255]), path.join(__dirname, '_panel-dock.png'));
console.log('wrote panel mocks (slice=' + SLICE + ', inspect bw=30, modal bw=44, dock bw=24)');

// horizontal stick bar for thin rules (ledger underline) — graded+grimed strip on transparent
const bar = resize(B, 1024, 84); grime(bar);
const OUT_BAR = path.join(__dirname, '..', 'game', 'assets', 'ui', 'stick-bar.png');
save(bar, OUT_BAR); console.log('wrote', OUT_BAR);
