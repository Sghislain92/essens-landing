/* Ess'Sens · scène « Le service » : ouverture, versement, glaçons (canvas 2D) */
/* ===== Scène de service : ouverture, versement, glaçons ===== */
{
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const sec = $('#service'), cv = $('#pour'), g = cv.getContext('2d');
const caps = $$('#service .pc'), doseEl = $('#dose');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const bottle = new Image(); bottle.src = 'assets/img/bottle.webp';
const bgi = new Image(); bgi.src = 'assets/img/bokeh2.webp';
const empty = new Image(); empty.src = 'assets/img/bottle_empty.webp';
const iceImg = [1, 2, 3].map(i => { const im = new Image(); im.src = `assets/img/ice${i}.webp`; return im; });

const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const E = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const seg = (p, a, b) => clamp((p - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = i => { const x = Math.sin(i * 127.1 + 3.7) * 43758.5; return x - Math.floor(x); };
const bounce = x => { x = clamp(x); const n = 7.5625, d = 2.75;
  if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + .75;
  if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + .9375; return n * (x -= 2.625 / d) * x + .984375; };
const rot = (x, y, a) => ({ x: x * Math.cos(a) - y * Math.sin(a), y: x * Math.sin(a) + y * Math.cos(a) });

/* géométrie (unités du monde) */
const BW = 450, BH = 1810, BHW = 600, K = BHW / BH;
const CAP = { x: 126, w: 208, h: 144 }, MOUTH = { x: 232, y: 108 };
const T = 300, GX = 150, GT = T - 270, GB = T, IB = GB - 30;
const TH = 1.95, MT = { x: GX - 30, y: GT - 74 };
const UP = { x: -170, y: T - BHW / 2 };
const CAPREST = { x: -318, y: T - CAP.h * K / 2 };
const ICE = [{ x: -44, y: IB - 33, s: 64, r: .18, d: 0 }, { x: 40, y: IB - 36, s: 68, r: -.24, d: .035 }, { x: -4, y: IB - 94, s: 62, r: .55, d: .07 }];
const DEW = Array.from({ length: 60 }, (_, i) => ({ x: rnd(i) * 2 - 1, y: rnd(i + 99), r: 1 + rnd(i + 7) * 2.4 }));
const ORBS = Array.from({ length: 12 }, (_, i) => ({ x: rnd(i + 3), y: rnd(i + 11) * .65, r: 30 + rnd(i + 5) * 80, s: .3 + rnd(i + 8) }));
const hw = y => 94 + (IB - y) / (IB - GT) * 16;

let land = true, P = 0, S = 0, W = 1, H = 1, u = 1, ox = 0, oy = 0, vis = false, last = 0, time = 0;
const drops = [], bubbles = [];

function size() {
  const d = Math.min(devicePixelRatio || 1, 2), r = cv.getBoundingClientRect();
  W = cv.width = Math.round(r.width * d); H = cv.height = Math.round(r.height * d);
  land = r.width > r.height * 1.1;
  if (land) { u = Math.min(H / 940, W / 1050); ox = W * .6; oy = H * .5; }
  else { u = Math.min(H / 1250, W / 700); ox = W * .5; oy = H * .38; }
}

function pose(p) {
  const tilt = E(seg(p, .40, .52)) * (1 - E(seg(p, .86, .94)));
  const extra = .16 * E(seg(p, .52, .84));
  const a = TH + extra;
  const m = rot((MOUTH.x - BW / 2) * K, (MOUTH.y - BH / 2) * K, a);
  const lift = Math.sin(Math.PI * clamp(tilt)) * 30;
  return { x: lerp(UP.x, MT.x - m.x, tilt), y: lerp(UP.y, MT.y - m.y, tilt) - lift, th: a * tilt, tilt };
}
function mouthOf(b) { const m = rot((MOUTH.x - BW / 2) * K, (MOUTH.y - BH / 2) * K, b.th); return { x: b.x + m.x, y: b.y + m.y }; }

/* ---------- éléments ---------- */
function drawCapImg(spin) {
  g.drawImage(bottle, CAP.x, 0, CAP.w, CAP.h, -CAP.w / 2, -CAP.h / 2, CAP.w, CAP.h);
  if (spin > 0) {
    g.save(); g.beginPath(); g.rect(-CAP.w / 2 + 6, -CAP.h / 2 + 14, CAP.w - 12, CAP.h - 18); g.clip();
    const bx = -CAP.w / 2 + ((spin * 2.2) % 1) * CAP.w * 1.4 - CAP.w * .2;
    const sg = g.createLinearGradient(bx - 30, 0, bx + 30, 0);
    sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.5, 'rgba(255,230,230,.45)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = sg; g.fillRect(bx - 30, -CAP.h / 2, 60, CAP.h); g.restore();
  }
}
function drawLip() {
  const lg = g.createLinearGradient(150, 0, 314, 0);
  lg.addColorStop(0, 'rgba(255,255,255,.4)'); lg.addColorStop(.18, 'rgba(140,70,70,.25)'); lg.addColorStop(.5, 'rgba(40,10,12,.35)');
  lg.addColorStop(.82, 'rgba(255,255,255,.28)'); lg.addColorStop(1, 'rgba(255,255,255,.45)');
  g.fillStyle = lg; g.fillRect(152, 108, 160, 46);
  g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.32)';
  for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(153, 122 + i * 11); g.quadraticCurveTo(232, 129 + i * 11, 311, 119 + i * 11); g.stroke(); }
  g.beginPath(); g.ellipse(232, 108, 80, 9, 0, 0, Math.PI * 2); g.fillStyle = 'rgba(40,6,10,.95)'; g.fill();
  g.strokeStyle = 'rgba(255,255,255,.65)'; g.lineWidth = 3.5; g.stroke();
}
function bottleLocal(b) { g.translate(b.x, b.y); g.rotate(b.th); g.scale(K, K); g.translate(-BW / 2, -BH / 2); }
function drawBottle(b, capOn, un, drain) {
  const body = (img, shadow) => {
    g.save(); bottleLocal(b);
    if (shadow) { g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 40 * u; g.shadowOffsetY = 18 * u; }
    g.drawImage(img, 0, 144, BW, BH - 144, 0, 144, BW, BH - 144);
    g.restore();
  };
  if (drain <= 0.001 || !empty.complete) body(bottle, true);
  else {
    /* surface libre horizontale : la part vide se loge toujours en haut, quelle que soit l'inclinaison */
    const pts = [[10, 330], [440, 330], [10, 1785], [440, 1785]].map(([lx, ly]) => { const q = rot((lx - BW / 2) * K, (ly - BH / 2) * K, b.th); return b.y + q.y; });
    const top = Math.min(...pts), bot = Math.max(...pts), sy = top + drain * (bot - top);
    g.save(); g.beginPath(); g.rect(-5000, sy, 10000, 10000); g.clip(); body(bottle, false); g.restore();
    g.save(); g.beginPath(); g.rect(-5000, -10000, 10000, 10000 + sy); g.clip(); body(empty, false); g.restore();
    /* ménisque : fine ligne claire à la surface du liquide */
    g.save(); g.beginPath(); g.rect(-5000, sy - 1.2, 10000, 2.4); g.clip(); g.globalAlpha = .7; g.globalCompositeOperation = 'lighter'; body(bottle, false); g.restore();
  }
  g.save(); bottleLocal(b);
  drawLip();
  if (capOn) { g.save(); g.translate(CAP.x + CAP.w / 2, CAP.h / 2 - un * 46); drawCapImg(un * 3); g.restore(); }
  g.restore();
}
function drawIce(i, x, y, sz, r, a) {
  const im = iceImg[i % 3]; if (!im.complete || !im.naturalWidth) return;
  const w = sz * 1.32, h = w * im.naturalHeight / im.naturalWidth;
  g.save(); g.translate(x, y); g.rotate(r); g.globalAlpha = a; g.drawImage(im, -w / 2, -h / 2, w, h);
  g.globalCompositeOperation = 'screen'; g.globalAlpha = a * .7; g.drawImage(im, -w / 2, -h / 2, w, h); g.restore();
}
function innerPath() { g.beginPath(); g.moveTo(GX - 110, GT); g.lineTo(GX - 94, IB); g.ellipse(GX, IB, 94, 11, 0, Math.PI, 0, true); g.lineTo(GX + 110, GT); g.closePath(); }

/* ---------- rendu ---------- */
function frame(p, dt) {
  g.setTransform(1, 0, 0, 1, 0, 0);
  const bgG = g.createRadialGradient(W * .62, H * .42, 10, W * .62, H * .42, Math.max(W, H) * .8);
  bgG.addColorStop(0, '#5c0d1b'); bgG.addColorStop(.55, '#2a070e'); bgG.addColorStop(1, '#120306');
  g.fillStyle = bgG; g.fillRect(0, 0, W, H);
  if (bgi.complete && bgi.naturalWidth) { const s = Math.max(W / bgi.width, H / bgi.height); g.globalAlpha = .28; g.drawImage(bgi, (W - bgi.width * s) / 2, (H - bgi.height * s) / 2, bgi.width * s, bgi.height * s); g.globalAlpha = 1; }
  ORBS.forEach((o, i) => { const x = ((o.x * W + time * 12 * o.s * u) % (W + 200)) - 100, y = o.y * H + Math.sin(time * .4 + i) * 10 * u, r = o.r * u * 1.4;
    const og = g.createRadialGradient(x, y, 0, x, y, r); og.addColorStop(0, i % 3 ? 'rgba(255,150,90,.10)' : 'rgba(255,90,110,.12)'); og.addColorStop(1, 'rgba(255,120,90,0)'); g.fillStyle = og; g.fillRect(x - r, y - r, r * 2, r * 2); });

  const ze = E(seg(p, .9, 1)), z = 1 + (land ? .14 : .1) * ze, cx = lerp(0, land ? -10 : 0, ze), cy = lerp(0, land ? 10 : 20, ze);
  const sc = u * z; g.setTransform(sc, 0, 0, sc, ox - cx * sc, oy - cy * sc);

  /* bar */
  const tg = g.createLinearGradient(0, T, 0, T + 500);
  tg.addColorStop(0, '#4a1d10'); tg.addColorStop(.08, '#2c0f08'); tg.addColorStop(1, '#0c0302');
  g.fillStyle = tg; g.fillRect(-3000, T, 6000, 1400);
  g.fillStyle = 'rgba(255,200,160,.18)'; g.fillRect(-3000, T, 6000, 1.5);

  const fill = .72 * E(seg(p, .52, .84));
  const ly = IB - fill * (IB - (GT + 26));
  const b = pose(p);
  const flow = E(seg(p, .5, .54)) * (1 - E(seg(p, .82, .87)));
  const un = E(seg(p, .2, .3)), fl = seg(p, .3, .43), fe = E(fl);

  /* lumière rouge sur le bar */
  if (fill > 0) { const rg = g.createRadialGradient(GX + 30, T + 22, 4, GX + 30, T + 22, 260); rg.addColorStop(0, `rgba(230,30,60,${.5 * fill / .72})`); rg.addColorStop(1, 'rgba(230,30,60,0)'); g.fillStyle = rg; g.fillRect(GX - 300, T, 640, 200); }
  /* ombres */
  g.fillStyle = 'rgba(0,0,0,.5)';
  g.beginPath(); g.ellipse(GX + 10, T + 6, 120, 14, 0, 0, Math.PI * 2); g.fill();
  if (b.tilt < .95) { g.globalAlpha = 1 - b.tilt; g.beginPath(); g.ellipse(UP.x + 12, T + 5, 92, 12, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }

  /* reflet de la bouteille sur le bar */
  if (b.tilt < .3 && bottle.complete) {
    g.save(); g.globalAlpha = .13 * (1 - b.tilt / .3); g.translate(UP.x, T); g.scale(K, -K); g.translate(-BW / 2, 0);
    g.drawImage(bottle, 0, 900, BW, BH - 900, 0, 0, BW, BH - 900); g.restore();
  }

  /* bouchon posé */
  if (fl > 0) {
    const s0 = { x: UP.x + (CAP.x + CAP.w / 2 - BW / 2) * K, y: UP.y + (CAP.h / 2 - BH / 2) * K - 46 * K }, m = { x: -250, y: UP.y - BHW / 2 - 150 };
    const t = fe, x = (1 - t) * (1 - t) * s0.x + 2 * (1 - t) * t * m.x + t * t * CAPREST.x, y = (1 - t) * (1 - t) * s0.y + 2 * (1 - t) * t * m.y + t * t * CAPREST.y;
    if (t > .97) { g.fillStyle = 'rgba(0,0,0,.45)'; g.beginPath(); g.ellipse(CAPREST.x + 4, T + 3, 38, 6, 0, 0, Math.PI * 2); g.fill(); }
    g.save(); g.translate(x, y); g.rotate(Math.sin(Math.PI * t) * -.9); g.scale(K, K); drawCapImg(0); g.restore();
  }

  /* bouteille */
  if (bottle.complete) drawBottle(b, fl <= 0, un, .12 * E(seg(p, .52, .84)));

  /* verre : paroi arrière */
  g.beginPath(); g.moveTo(GX - 118, GT); g.lineTo(GX - 100, GB); g.ellipse(GX, GB, 100, 13, 0, Math.PI, 0, true); g.lineTo(GX + 118, GT); g.ellipse(GX, GT, 118, 16, 0, 0, Math.PI, true); g.closePath();
  g.fillStyle = 'rgba(255,255,255,.05)'; g.fill();
  g.beginPath(); g.ellipse(GX, GT, 118, 16, 0, Math.PI, Math.PI * 2); g.strokeStyle = 'rgba(255,255,255,.32)'; g.lineWidth = 2; g.stroke();

  /* glaçons + liquide */
  const ice = ICE.map((c, i) => { const fe2 = bounce(seg(p, .03 + c.d, .13 + c.d)), y0 = lerp(GT - 520, c.y, fe2);
    const fy = fill > 0 ? Math.min(c.y, ly + c.s * (.18 + i * .06)) : c.y;
    const y = fe2 < 1 ? y0 : fy + (fill > 0 ? Math.sin(time * 1.6 + i * 2) * 1.6 : 0);
    return { x: GX + c.x + (1 - fe2) * (i - 1) * 30, y, s: c.s, r: c.r * .35 + (1 - fe2) * 1.2 + (fill > 0 ? Math.sin(time + i) * .03 : 0), vis: seg(p, .03 + c.d, .2) > 0 }; });
  g.save(); innerPath(); g.clip();
  ice.forEach((c, i) => c.vis && drawIce(i, c.x, c.y, c.s, c.r, 1));
  let impact = null;
  if (fill > .002) {
    const lg = g.createLinearGradient(0, ly, 0, IB + 12);
    lg.addColorStop(0, '#c81d3e'); lg.addColorStop(.35, '#8e0b22'); lg.addColorStop(1, '#4a0410');
    g.globalAlpha = .86; g.fillStyle = lg; g.fillRect(GX - 130, ly, 260, IB + 20 - ly);
    const eg = g.createLinearGradient(GX - 110, 0, GX + 110, 0);
    eg.addColorStop(0, 'rgba(20,0,4,.5)'); eg.addColorStop(.25, 'rgba(255,60,90,.12)'); eg.addColorStop(.6, 'rgba(0,0,0,0)'); eg.addColorStop(1, 'rgba(20,0,4,.55)');
    g.fillStyle = eg; g.fillRect(GX - 130, ly, 260, IB + 20 - ly); g.globalAlpha = 1;
    ice.forEach((c, i) => drawIce(i, c.x, c.y, c.s, c.r, .38));
    /* surface */
    const r = hw(ly);
    g.beginPath(); g.ellipse(GX, ly, r, 9, 0, 0, Math.PI * 2);
    const sgr = g.createLinearGradient(GX - r, 0, GX + r, 0); sgr.addColorStop(0, '#9e1029'); sgr.addColorStop(.4, '#e0425f'); sgr.addColorStop(1, '#a3122c');
    g.fillStyle = sgr; g.fill(); g.strokeStyle = 'rgba(255,180,195,.5)'; g.lineWidth = 1.5; g.stroke();
    /* bulles */
    bubbles.forEach(bb => { if (bb.y < ly + 3) return; g.beginPath(); g.arc(bb.x, bb.y, bb.r, 0, Math.PI * 2); g.strokeStyle = `rgba(255,210,220,${.55 * bb.l})`; g.lineWidth = 1; g.stroke(); });
    /* glaçons hors du liquide */
    g.save(); g.beginPath(); g.rect(GX - 140, GT - 600, 280, ly - GT + 600); g.clip();
    ice.forEach((c, i) => drawIce(i, c.x, c.y, c.s, c.r, 1)); g.restore();
  }
  g.restore();

  /* filet de liqueur */
  if (flow > .02 && b.tilt > .97) {
    const M = mouthOf(b), dx = Math.sin(b.th), dy = -Math.cos(b.th), V = 34, G = 460;
    const A = .5 * G, B = dy * V, C = M.y - ly, sMax = (-B + Math.sqrt(B * B - 4 * A * C)) / (2 * A);
    const pts = []; for (let i = 0; i <= 26; i++) { const s = sMax * i / 26, k = i / 26; pts.push({ x: M.x + dx * V * s + Math.sin(time * 21 + i * .8) * 1.3 * k, y: M.y + dy * V * s + A * s * s }); }
    impact = pts[pts.length - 1];
    g.lineCap = 'round'; g.lineJoin = 'round';
    const w = 3 + 6.5 * flow;
    const sg = g.createLinearGradient(0, M.y, 0, ly); sg.addColorStop(0, '#7e0a20'); sg.addColorStop(1, '#c41a3a');
    g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y)); g.strokeStyle = sg; g.lineWidth = w; g.stroke();
    g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(q.x - w * .22, q.y) : g.moveTo(q.x - w * .22, q.y)); g.strokeStyle = 'rgba(255,205,215,.5)'; g.lineWidth = w * .22; g.stroke();
    /* ondes */
    for (let k = 0; k < 3; k++) { const ph = ((time * 1.6 + k / 3) % 1), rr = 6 + ph * 46; g.beginPath(); g.ellipse(impact.x, ly, rr, rr * .2, 0, 0, Math.PI * 2); g.strokeStyle = `rgba(255,190,205,${.45 * (1 - ph) * flow})`; g.lineWidth = 1.2; g.stroke(); }
    /* éclaboussures et bulles */
    if (!reduce && dt > 0) {
      for (let k = 0; k < 2; k++) drops.push({ x: impact.x + (rnd(time * 97 + k) - .5) * 8, y: ly - 2, vx: (rnd(time * 53 + k) - .5) * 160, vy: -60 - rnd(time * 31 + k) * 120, l: 1, r: 1.6 + rnd(time + k) * 2 });
      bubbles.push({ x: impact.x + (rnd(time * 7) - .5) * 40, y: ly + 20 + rnd(time * 9) * 60, r: 1.5 + rnd(time * 3) * 3, l: 1 });
    }
  }
  /* gouttes */
  drops.forEach(d => { d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.l -= dt * 1.6; });
  for (let i = drops.length - 1; i >= 0; i--) if (drops[i].l <= 0 || drops[i].y > ly + 4) drops.splice(i, 1);
  bubbles.forEach(bb => { bb.y -= 50 * dt; bb.x += Math.sin(time * 6 + bb.r) * .3; bb.l -= dt * .7; });
  for (let i = bubbles.length - 1; i >= 0; i--) if (bubbles[i].l <= 0 || bubbles[i].y < ly) bubbles.splice(i, 1);
  g.fillStyle = '#d02447'; drops.forEach(d => { g.globalAlpha = clamp(d.l); g.beginPath(); g.arc(d.x, d.y, d.r, 0, Math.PI * 2); g.fill(); }); g.globalAlpha = 1;

  /* verre : face avant */
  g.beginPath(); g.moveTo(GX - 96, IB); g.ellipse(GX, IB, 96, 11, 0, Math.PI, 0, true); g.lineTo(GX + 100, GB); g.ellipse(GX, GB, 100, 13, 0, 0, Math.PI, false); g.closePath();
  const bg2 = g.createLinearGradient(0, IB - 10, 0, GB + 13); bg2.addColorStop(0, 'rgba(255,255,255,.26)'); bg2.addColorStop(1, 'rgba(255,255,255,.07)');
  g.fillStyle = bg2; g.fill(); if (fill > 0) { g.fillStyle = `rgba(200,20,55,${.35 * fill / .72})`; g.fill(); }
  g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 1.5; g.stroke();
  g.lineWidth = 2.2; g.strokeStyle = 'rgba(255,255,255,.45)';
  g.beginPath(); g.moveTo(GX - 118, GT); g.lineTo(GX - 100, GB); g.moveTo(GX + 118, GT); g.lineTo(GX + 100, GB); g.stroke();
  const hl = g.createLinearGradient(0, GT, 0, GB);
  hl.addColorStop(0, 'rgba(255,255,255,0)'); hl.addColorStop(.25, 'rgba(255,255,255,.42)'); hl.addColorStop(.75, 'rgba(255,255,255,.18)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = hl; g.beginPath(); g.moveTo(GX - 103, GT + 18); g.lineTo(GX - 89, GT + 18); g.lineTo(GX - 76, GB - 44); g.lineTo(GX - 88, GB - 44); g.closePath(); g.fill();
  g.globalAlpha = .55; g.beginPath(); g.moveTo(GX + 84, GT + 26); g.lineTo(GX + 90, GT + 26); g.lineTo(GX + 80, GB - 60); g.lineTo(GX + 75, GB - 60); g.closePath(); g.fill(); g.globalAlpha = 1;
  /* buée */
  const dew = E(seg(p, .14, .5));
  if (dew > 0) DEW.forEach(d => { const y = GT + 34 + d.y * (IB - GT - 44), x = GX + d.x * (hw(y) - 10);
    g.globalAlpha = dew * .8; g.beginPath(); g.arc(x, y, d.r, 0, Math.PI * 2); g.fillStyle = 'rgba(255,255,255,.28)'; g.fill();
    g.beginPath(); g.arc(x - d.r * .3, y - d.r * .3, d.r * .35, 0, Math.PI * 2); g.fillStyle = 'rgba(255,255,255,.8)'; g.fill(); });
  g.globalAlpha = 1;
  /* bord avant */
  g.beginPath(); g.ellipse(GX, GT, 118, 16, 0, 0, Math.PI); g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 2.6; g.stroke();
  g.beginPath(); g.ellipse(GX, GT + 3, 111, 13, 0, 0, Math.PI); g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 1.5; g.stroke();
  g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(GX - 70, GT + 13, 10, 2.2, .1, 0, Math.PI * 2); g.fill();

  doseEl.textContent = Math.round(fill / .72 * 6);
  caps.forEach(c => c.classList.toggle('on', p >= +c.dataset.from && p < +c.dataset.to));
}

function loop(ts) {
  const dt = last ? Math.min(.05, (ts - last) / 1000) : 0; last = ts; time += reduce ? 0 : dt;
  S += (P - S) * (reduce ? 1 : .14);
  frame(S, dt);
  if (vis) requestAnimationFrame(loop); else last = 0;
}
function readP() { const r = sec.getBoundingClientRect(); P = clamp(-r.top / (r.height - innerHeight)); }
addEventListener('scroll', readP, { passive: true });
if (window.ScrollTrigger) ScrollTrigger.create({ trigger: sec, start: 'top top', end: 'bottom bottom', onUpdate: s => { P = s.progress; } });
new IntersectionObserver(es => { const was = vis; vis = es[0].isIntersecting; if (vis && !was) { readP(); requestAnimationFrame(loop); } }, { rootMargin: '100px' }).observe(sec);
const ro = new ResizeObserver(() => { size(); frame(S, 0); }); ro.observe(cv);
bottle.onload = () => frame(S, 0);
size(); readP(); S = P;
}
