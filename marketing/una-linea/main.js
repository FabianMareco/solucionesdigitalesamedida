import { buildPath, headAt, posAt } from './geom.js';
import { SEGS } from './dibujo.js';
import { prepare, drawLine, drawBlots } from './ink.js';
import { makePaper, drawPaper, vignette, makeTooth, drawTooth } from './paper.js';
import { DUR, SUBS, FIN } from './story.js';
import { subtitle, cierre } from './subs.js';
import { camAt, worldToScreen, BASE } from './cam.js';
import { CAM } from './shots.js';
import { penShadow } from './hands.js';
import { clamp } from '/core/lib.js';

const q = new URLSearchParams(location.search);
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
// el tamaño lo pone la herramienta de render (--size): 1080×1920 (9:16) o 1080×1350 (4:5)
cv.width = window.innerWidth; cv.height = window.innerHeight;
const W = cv.width, H = cv.height;
await document.fonts.load('500 40px Caveat'); await document.fonts.load('600 40px Caveat'); await document.fonts.load('80px Sacramento');

const P = prepare(buildPath(SEGS));
const paper = makePaper(), tooth = makeTooth();
window.PATH = P;
const NOSUB = q.has('nosub') || q.has('clean');
// en 4:5 la revelación tiene que entrar en un cuadro más bajo: los zooms marcados fitH se escalan con el alto
const KEYS = CAM.map(k => (k.fitH ? { ...k, z: k.z * Math.min(1, H / 1920) } : k));

function camFor(t) {
  let cam = camAt(P, KEYS, t, W, H);
  const fixed = (x, y, z) => ({ cx: x, cy: y, k: BASE * z, r: 0, z });
  if (q.get('cam')) cam = fixed(...q.get('cam').split(',').map(Number));
  return cam;
}

// la mano que dibuja está abajo a la derecha: la sombra de la plumilla apunta hacia allá
const DIR = [0.56, 0.83];

function render(t) {
  const cam = camFor(t);
  const M = worldToScreen(cam, W, H);
  drawPaper(ctx, paper, cam, W, H);
  const head = q.has('all') ? P.N - 1 : headAt(P, t);
  if (t >= P.T[0] || q.has('all')) drawLine(ctx, P, head, M, cam.k);
  drawBlots(ctx, P, q.has('all') ? 999 : t, M, cam.k);
  drawTooth(ctx, tooth, cam, W, H);
  vignette(ctx, W, H);
  if (!q.has('nopen') && !q.has('all')) {
    const tip = M(...posAt(P, head));
    const lift = t < P.T[0] ? clamp((P.T[0] - t) / 0.8) : t > P.T[P.N - 1] ? clamp((t - P.T[P.N - 1]) / 0.8) : 0;
    const appear = clamp((t - 0.05) / 0.4);
    if (appear > 0 && lift < 1) penShadow(ctx, tip, DIR, cam.k, { lift, alpha: appear });
  }
  TEXTS_NOW = [];
  if (!NOSUB) {
    for (const s of SUBS) { const b = subtitle(ctx, s.text, s.t0, s.t1, t, W, H); if (b) TEXTS_NOW.push({ id: 'sub', ...b }); }
    for (const b of cierre(ctx, FIN, t, W, H)) TEXTS_NOW.push({ id: 'fin', ...b });
  }
}
let TEXTS_NOW = [];

// eventos para la mezcla: velocidad de la plumilla (200 Hz), esquinas, primer toque, manchas, comienzo de cada capítulo
function events() {
  const ev = [], track = [];
  for (let t = 0; t <= DUR; t += 0.005) {
    const h = headAt(P, t), i = Math.floor(h), cam = camAt(P, KEYS, t, W, H), M = worldToScreen(cam, W, H);
    const p = M(...posAt(P, h)); const seg = P.segs[P.SEG[i]];
    const moving = t >= P.T[0] && t <= P.T[P.N - 1];
    track.push([+t.toFixed(3), moving ? Math.round(P.V[i]) : 0, +(p[0] / W).toFixed(3), seg.style, +(P.DRY[i] || 0).toFixed(2)]);
  }
  ev.push({ t: 0, type: 'track', data: track });
  const corners = [];
  for (let i = 8; i < P.N - 8; i += 1) {
    if (P.TURN[i] < 0.5) continue;
    let isMin = true; for (let j = -6; j <= 6; j++) if (P.V[i + j] < P.V[i]) { isMin = false; break; }
    if (isMin && (!corners.length || P.T[i] - corners.at(-1).t > 0.12)) corners.push({ t: +P.T[i].toFixed(3), seg: P.segs[P.SEG[i]].id, turn: +P.TURN[i].toFixed(2) });
  }
  ev.push({ t: 0, type: 'corners', data: corners });
  ev.push({ t: P.T[0], type: 'tap' });
  P.blots.forEach(b => ev.push({ t: b.t0, type: 'blot', dur: b.dur }));
  P.segs.forEach(s => ev.push({ t: s.t[0], type: 'seg', id: s.id, t1: s.t[1] }));
  ev.push({ t: FIN.titulo, type: 'titulo' });
  return ev;
}

window.DUR = DUR;
window.EV = events();
window.SUBS = SUBS.map(s => ({ t0: s.t0, t1: s.t1, text: s.text.replace('\n', ' ') }));
window.TEXTS = t => { render(t); return TEXTS_NOW; };
window.render = render;
window.READY = true;
