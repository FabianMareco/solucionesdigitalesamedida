// Textos escritos a mano (Caveat) y título en cursiva de un solo trazo (Sacramento), con un halo del color del papel.
import { clamp, ss } from '/core/lib.js';
const INK = 'rgba(29,26,23,';
const ACENTO = 'rgba(177,15,46,';
function halo(ctx, text, x, y, w) { ctx.strokeStyle = 'rgba(244,239,228,0.92)'; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.filter = 'blur(3px)'; ctx.strokeText(text, x, y); ctx.filter = 'none'; }

// baseline de los subtítulos: 9:16 dentro de la zona segura de Reels/TikTok (≤ 1248 px); 4:5 cerca del borde inferior
export const subY = H => (H >= 1700 ? 1190 : H - 120);

export function subtitle(ctx, text, t0, t1, t, W, H) {
  if (t < t0 - 0.01 || t > t1 + 0.45) return null;
  const size = 58, lines = text.split('\n'), lh = size * 1.12, yb = subY(H) - (lines.length - 1) * lh;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.font = `500 ${size}px Caveat`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const w = Math.max(...lines.map(l => ctx.measureText(l).width)), x0 = W / 2 - w / 2;
  const write = clamp((t - t0) / Math.min(1.1, 0.2 + text.length * 0.017));
  ctx.globalAlpha = 1 - clamp((t - t1) / 0.45);
  // se escribe renglón por renglón, de izquierda a derecha
  const per = 1 / lines.length;
  lines.forEach((l, i) => {
    const u = ss(clamp((write - i * per) / per)); if (u <= 0) return;
    const y = yb + i * lh;
    ctx.save(); ctx.beginPath(); ctx.rect(x0 - 24, y - size * 1.2, (w + 48) * u, size * 1.7); ctx.clip();
    halo(ctx, l, W / 2, y, 14); ctx.fillStyle = INK + '0.86)'; ctx.fillText(l, W / 2, y); ctx.restore();
  });
  ctx.restore();
  return { text, x0: x0 - 4, y0: yb - size, x1: x0 + w + 4, y1: yb + (lines.length - 1) * lh + size * .35 };
}

// cierre: «Hablemos» en cursiva carmesí sobre el papel libre, y el usuario escrito a mano debajo
export function cierre(ctx, F, t, W, H) {
  if (t < F.titulo) return [];
  const out = [];
  const ty = H >= 1700 ? 720 : H * 0.36, uy = H >= 1700 ? 1060 : H * 0.6, cx = W * 0.62;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.textAlign = 'center';
  const a1 = clamp((t - F.titulo) / 1.5);
  ctx.font = '170px Sacramento';
  const w = ctx.measureText(F.texto).width;
  ctx.save(); ctx.beginPath(); ctx.rect(cx - w / 2 - 30, ty - 190, (w + 60) * a1, 280); ctx.clip();
  halo(ctx, F.texto, cx, ty, 18); ctx.fillStyle = ACENTO + '0.95)'; ctx.fillText(F.texto, cx, ty); ctx.restore();
  out.push({ text: F.texto, x0: cx - w / 2, y0: ty - 150, x1: cx + w / 2, y1: ty + 40 });
  if (t >= F.usuario) {
    const a2 = clamp((t - F.usuario) / 1.0);
    ctx.font = '600 50px Caveat'; const w2 = ctx.measureText(F.handle).width, cx2 = Math.min(cx, W - 70 - w2 / 2);
    ctx.save(); ctx.beginPath(); ctx.rect(cx2 - w2 / 2 - 20, uy - 70, (w2 + 40) * a2, 110); ctx.clip();
    halo(ctx, F.handle, cx2, uy, 12); ctx.fillStyle = INK + '0.86)'; ctx.fillText(F.handle, cx2, uy); ctx.restore();
    out.push({ text: F.handle, x0: cx2 - w2 / 2, y0: uy - 50, x1: cx2 + w2 / 2, y1: uy + 14 });
  }
  ctx.restore();
  return out;
}
