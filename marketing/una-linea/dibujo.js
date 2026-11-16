// «Una línea»: todo el dibujo es una sola línea. Coordenadas en unidades de papel, y hacia abajo.
// Las viñetas van en columna (para el formato vertical):
//   rulos (y −2050…−1500) → nudo de burbujas (≈ −1250) → mostrador con timbre (−980…−640) → agenda (−360…60)
//   → etiqueta de oferta que se vuelve flyer (380…860) → celular con web y botón de chat (1130…1770) → tramo libre en carmesí.
// El motor (geom.js) une las partes con conectores de tangente continua: la plumilla nunca se levanta.

const f = v => v.toFixed(1);
function smoothPts(pts) {   // Catmull-Rom → Bézier; el punto actual tiene que ser pts[0]
  let d = '';
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  return d;
}
const path = pts => `M ${f(pts[0][0])},${f(pts[0][1])}` + smoothPts(pts);
// rectángulo redondeado, recorrido completo en sentido horario desde el medio del lado izquierdo
const rrect = (x0, y0, x1, y1, r) => `M ${x0},${(y0 + y1) / 2} L ${x0},${y0 + r} Q ${x0},${y0} ${x0 + r},${y0} L ${x1 - r},${y0} Q ${x1},${y0} ${x1},${y0 + r}
 L ${x1},${y1 - r} Q ${x1},${y1} ${x1 - r},${y1} L ${x0 + r},${y1} Q ${x0},${y1} ${x0},${y1 - r} L ${x0},${(y0 + y1) / 2}`;
// círculo completo que empieza y termina a la izquierda
const circle = (cx, cy, r) => { const k = r * 0.5523; return `M ${cx - r},${cy} C ${cx - r},${cy - k} ${cx - k},${cy - r} ${cx},${cy - r} C ${cx + k},${cy - r} ${cx + r},${cy - k} ${cx + r},${cy}
 C ${cx + r},${cy + k} ${cx + k},${cy + r} ${cx},${cy + r} C ${cx - k},${cy + r} ${cx - r},${cy + k} ${cx - r},${cy}`; };
// burbuja de chat: rectángulo redondeado con la cola abajo a la izquierda
const bubble = (x0, y0, x1, y1, r = 34) => `M ${x0 + 70},${y1} L ${x0 + 30},${y1 + 46} L ${x0 + 40},${y1} L ${x0 + r},${y1} Q ${x0},${y1} ${x0},${y1 - r}
 L ${x0},${y0 + r} Q ${x0},${y0} ${x0 + r},${y0} L ${x1 - r},${y0} Q ${x1},${y0} ${x1},${y0 + r} L ${x1},${y1 - r} Q ${x1},${y1} ${x1 - r},${y1} L ${x0 + 70},${y1}`;

// ---------- 1. Rulos: la línea entra corriendo desde arriba a la izquierda y hace bucles mientras baja ----------
const RULOS = (() => {
  const pts = [], n = 150, loops = 5.5, R = 62;
  for (let i = 0; i <= n; i++) {
    const s = i / n, a = s * loops * Math.PI * 2;
    const bx = -620 + 520 * s + 60 * Math.sin(s * 3), by = -2060 + 640 * s;
    pts.push([bx + R * Math.sin(a), by - R * Math.cos(a) + R]);
  }
  return path(pts);
})();

// ---------- 2. El nudo: tres burbujas de chat encimadas y un garabato que se aprieta hasta el centro (ahí se frena) ----------
export const NUDO_C = [10, -1250];
const B1 = bubble(-270, -1430, 70, -1290), B2 = bubble(-70, -1350, 280, -1210), B3 = bubble(-220, -1250, 140, -1110);
const ENREDO = (() => {
  const pts = [], n = 70;
  for (let i = 0; i <= n; i++) {
    const u = i / n, a = i * 0.62, r = 230 * (1 - u) ** 1.1 + 6;
    pts.push([NUDO_C[0] + r * Math.cos(a) * 1.15 + 18 * Math.sin(i * 1.7) * (1 - u), NUDO_C[1] + r * Math.sin(a) * 0.8 + 14 * Math.cos(i * 1.3) * (1 - u)]);
  }
  return path(pts);
})();

// ---------- 3. Mostrador con timbre de atención: tapa, borde, frente ----------
const MOSTRADOR = `M -400,-900 L 120,-900 C 120,-950 156,-962 174,-962 L 174,-984 L 190,-984 L 190,-962 C 208,-962 244,-950 244,-900 L 400,-900
 L 400,-868 L -400,-868 L -370,-868 L -370,-640 L 370,-640 L 370,-868 L 370,-640 L -370,-640`;

// ---------- 4. Agenda: hoja con dos argollas, encabezado, grilla de 3 × 2, un día con círculo y una tilde ----------
const AGENDA = `M -230,-360 L -150,-360 C -150,-418 -90,-418 -90,-360 L 90,-360 C 90,-418 150,-418 150,-360 L 230,-360 L 230,60 L -230,60 L -230,-360
 L -230,-270 L 230,-270 L 230,-160 L -230,-160 L -230,-50 L 230,-50 L 230,60 L 77,60 L 77,-270 L -77,-270 L -77,60`;
const DIA = circle(0, -105, 66);
export const TILDE_FIN = [62, -152];
const TILDE = `M -42,-108 L -10,-70 L 62,-152 L 230,-152 L 300,-152 C 360,-152 372,-40 372,120 C 372,300 300,440 210,520`;

// ---------- 5. Oferta: etiqueta de precio con su agujero y su hilo, un «%», y el marco que la vuelve un flyer ----------
const ETIQUETA = `M 210,520 L -170,520 L -262,620 L -170,720 L 210,720 L 210,520`;
const AGUJERO = circle(-185, 620, 20);
const HILO = `M -205,620 C -250,598 -290,560 -330,540 C -362,524 -392,552 -404,590`;
const PCT1 = circle(-6, 580, 24), PCT_BARRA = `M 108,556 L -40,690`, PCT2 = circle(74, 662, 24);
const FLYER = rrect(-410, 380, 330, 860, 22);
export const BRILLO_C = [262, 384];
const BRILLO = `M 262,330 L 276,370 L 316,384 L 276,398 L 262,438 L 248,398 L 208,384 L 248,370 L 262,330`;

// ---------- 6. Web: celular con encabezado, dos renglones, una foto, y el botón de chat ----------
const CELU = rrect(-190, 1130, 190, 1770, 44);
const ENCABEZADO = `M -190,1450 L -190,1222 L 190,1222`;
const RENGLON1 = `M 112,1288 C 60,1300 20,1276 -20,1288 C -60,1300 -100,1276 -140,1288`;
const RENGLON2 = `M -140,1336 C -110,1326 -70,1346 -30,1336 C 0,1328 30,1342 56,1336`;
const FOTO = `M -140,1388 L 140,1388 L 140,1528 L -140,1528 L -140,1388 L -40,1470 L 10,1430 L 140,1528`;
const BOTON = rrect(-128, 1588, 128, 1668, 40);
export const BOTON_C = [0, 1628];
const ICONO = bubble(-44, 1608, 44, 1644, 12);

// ---------- 7. El tramo libre (acento carmesí): baja del celular, gira y corre hacia la derecha hasta salirse del papel ----------
const LIBRE = `M 0,1770 C 0,1830 -40,1880 -110,1906 C -170,1928 -200,1990 -150,2030 C -90,2078 120,2060 400,2060 C 700,2060 1000,2050 1500,2056`;

// tabla de capítulos: ventana de tiempo [t0, t1] en segundos y «voz» de la línea
export const SEGS = [
  { id: 'rulos', style: 'rapido', t: [0.3, 3.5], parts: [{ d: RULOS }], slowK: 1.2 },
  { id: 'nudo', style: 'tenso', t: [3.5, 6.95], parts: [{ d: B1 }, { d: B2 }, { d: B3 }, { d: ENREDO }], slowK: 1.6,
    holds: [{ f: .999, t: 6.95, dur: 2.6 }] },
  { id: 'mostrador', style: 'calmo', t: [9.55, 14.0], parts: [{ d: MOSTRADOR }], slowK: 2.6 },
  { id: 'agenda', style: 'calmo', t: [14.0, 19.0], parts: [{ d: AGENDA }, { d: DIA }, { d: TILDE }], slowK: 2.4,
    marks: [{ at: TILDE_FIN, t: 17.5 }] },
  { id: 'oferta', style: 'calmo', t: [19.0, 24.0], parts: [{ d: ETIQUETA }, { d: PCT1 }, { d: PCT_BARRA }, { d: PCT2 }, { d: AGUJERO }, { d: HILO }, { d: FLYER }], slowK: 2.2 },
  { id: 'web', style: 'calmo', t: [24.0, 29.0], parts: [{ d: CELU }, { d: ENCABEZADO }, { d: RENGLON1 }, { d: RENGLON2 }, { d: FOTO }, { d: BOTON }, { d: ICONO }], slowK: 2.2,
    holds: [{ f: .999, t: 29.0, dur: 0.6 }] },
  { id: 'libre', style: 'acento', t: [29.6, 36.6], parts: [{ d: LIBRE }], slowK: 1.4 },
];
