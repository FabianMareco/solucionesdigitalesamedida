// «Lo que pasa mientras dormís» · recortes de papel (30_matisse: borde de tijera, sombra de papel clavado, gouache).
// Un solo local de papel de punta a punta. Mundo en coordenadas de 1080×1920 con cámara (cx, cy, z).
// dm_noche (10 s): cartel a CERRADO → persiana baja → luna y barrio que se apaga → ventana de enfrente con un celular.
// dm_dia (12 s): sol empuja a la luna → persiana sube → agenda llena → cartel a ABIERTO y la frase escrita en la vidriera.
(() => {
  const W = 1080, H = 1920, TAU = Math.PI * 2, { clamp, lerp, ss } = U, P = PAINT;
  const C = { cream: '#F4EFE4', creamD: '#E4D8C4', crim: '#B10F2E', crimD: '#86102A', ink: '#1D1A17', night: '#2E2622',
    gold: '#E8B04A', sage: '#7C9A7E', sageD: '#5E7A62', skin: '#E2A98A', brown: '#4A3B33', brownL: '#C8B49E', glassN: '#3B302A', glassD: '#E3EADF' };
  const cut = P.cut, K = {};
  const memo = (k, f) => K[k] || (K[k] = f());
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, p) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], p))).join(',')})`; };
  const shadow = (c, fn, o = 1) => { c.save(); c.shadowColor = 'rgba(20,12,8,.32)'; c.shadowOffsetX = 5 * o; c.shadowOffsetY = 6 * o; c.shadowBlur = 4; fn(); c.restore(); };
  const rect = (k, x0, y0, x1, y1, step = 22, amp = 2.2) => memo('r' + k, () => cut([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], k * 13 + 7, step, amp));
  const circ = (k, cx, cy, r, n = 26, amp = 2) => memo('c' + k, () => cut(Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * TAU) * r, cy + Math.sin(i / n * TAU) * r]), k * 17 + 3, 16, amp));
  const fill = (c, path, col) => { c.fillStyle = col; c.fill(path); };
  const tw = (x, a, b) => U.ease.inOut(clamp((x - a) / (b - a)));
  function capsule(A, th, L, w) {
    const d = [Math.sin(th), -Math.cos(th)], n = [-d[1], d[0]], T = [A[0] + d[0] * (L - w / 2), A[1] + d[1] * (L - w / 2)], pts = [];
    pts.push([A[0] + n[0] * w * 0.5, A[1] + n[1] * w * 0.5]);
    for (let k = 0; k <= 6; k++) { const a = Math.atan2(n[1], n[0]) - k / 6 * Math.PI; pts.push([T[0] + Math.cos(a) * w / 2, T[1] + Math.sin(a) * w / 2]); }
    pts.push([A[0] - n[0] * w * 0.5, A[1] - n[1] * w * 0.5]);
    return pts;
  }

  // ---------- mano de papel: muñeca en (0,0), dedos hacia arriba ----------
  const handPath = (pose) => memo('hand' + pose, () => {
    const p = new Path2D(), sd = pose === 'point' ? 1 : 2;
    p.addPath(cut(Array.from({ length: 20 }, (_, i) => [Math.cos(i / 20 * TAU) * 42, -50 + Math.sin(i / 20 * TAU) * 50]), 31 + sd, 14, 1.6));
    const F = pose === 'point' ? [[-26, -84, 0.05, 30, 21], [-8, -88, 0, 92, 21], [9, -86, 0.04, 30, 20], [26, -80, 0.12, 28, 18]]
      : [[-26, -84, -0.1, 52, 21], [-8, -90, -0.03, 60, 21], [10, -88, 0.05, 58, 20], [27, -80, 0.16, 48, 18]];
    F.forEach(([x, y, th, L, w], k) => p.addPath(cut(capsule([x, y + 10], th, L, w), 40 + k + sd * 9, 12, 1.4)));
    p.addPath(cut(capsule([-34, -30], -1.05, 50, 22), 51 + sd, 12, 1.4));
    return p;
  });
  const sleevePath = memo('sleeve', () => cut([[-40, -6], [40, -10], [46, 330], [-46, 330]], 61, 18, 2));
  function hand(c, x, y, ang, s, sleeve, pose = 'point') {
    c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s);
    shadow(c, () => { fill(c, handPath(pose), C.skin); fill(c, sleevePath, sleeve); });
    c.restore();
  }

  // ---------- gouache encima (espacio de pantalla) ----------
  const gouache = () => P.cached('dm_gouache', W, H, (g) => {
    const r = U.rng(2026); g.lineCap = 'round';
    for (let i = 0; i < 2200; i++) { const x = r() * W, y = r() * H, a = -0.25 + (r() - 0.5) * 0.5, L = 60 + r() * 240;
      g.strokeStyle = r() < 0.5 ? `rgba(255,255,255,${0.04 + r() * 0.06})` : `rgba(0,0,0,${0.03 + r() * 0.05})`; g.lineWidth = 6 + r() * 16;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); }
  });

  // ---------- mundo ----------
  const STARS = Array.from({ length: 16 }, (_, k) => { const r = U.rng(k * 97 + 11); return [-200 + r() * 2600, 120 + r() * 640, 9 + r() * 10, k]; });
  const starPath = (k, r0) => memo('st' + k, () => { const r = U.rng(k * 31 + 5), pts = []; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, rr = (i % 2 ? r0 * 0.42 : r0) * (0.8 + r() * 0.35); pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); } return cut(pts, k * 17, 6, 1); });
  // ventanas del barrio: [x, y, w, h, apagado en (t)] — la de enfrente (id 'cli') nunca se apaga de noche
  const WIN = [];
  [[1170, 470, 1630, 4, 7], [1690, 600, 2330, 4, 6]].forEach(([x0, y0, x1, cols, rows], b) => {
    const gw = (x1 - x0 - 40) / cols;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const r = U.rng(b * 400 + j * 17 + i * 5); const x = x0 + 30 + i * gw, y = y0 + 40 + j * 128;
      WIN.push({ x, y, w: gw - 34, h: 88, off: 3.9 + r() * 2.3, k: b * 100 + j * 10 + i, cli: b === 1 && j === 1 && i === 1 });
    }
  });
  const CLI = WIN.find(w => w.cli);

  function world(c, s, t) {
    const sky = mix(C.cream, C.night, s.night);
    c.fillStyle = sky; c.fillRect(-1500, -1500, 5000, 5000);
    // estrellas y luna
    if (s.night > 0.05) STARS.forEach(([x, y, r, k]) => { const sc = (0.75 + 0.25 * Math.sin(t * 5 + k * 1.7)) * s.night;
      c.save(); c.translate(x, y); c.rotate(t * (k % 2 ? 0.6 : -0.5)); c.scale(sc, sc); fill(c, starPath(k, r), C.gold); c.restore(); });
    if (s.sun) { const [x, y] = s.sun; c.save(); c.translate(x, y); c.rotate(t * 0.25);
      for (let i = 0; i < 12; i++) { c.save(); c.rotate(i / 12 * TAU); fill(c, memo('ray' + i, () => cut(capsule([0, -150], 0, 70, 30), 300 + i, 10, 1.6)), i % 2 ? C.crim : C.gold); c.restore(); }
      c.restore(); shadow(c, () => { c.save(); c.translate(x, y); fill(c, circ('sun', 0, 0, 120, 30, 2.4), C.gold); c.restore(); }); }
    if (s.moon) { const [x, y] = s.moon, br = 1 + 0.03 * Math.sin(t * 2.2);
      shadow(c, () => { c.save(); c.translate(x, y); c.scale(br, br); fill(c, circ('moon', 0, 0, 92, 28, 2), C.gold); c.restore(); });
      c.save(); c.translate(x + 42, y - 22); fill(c, circ('moonC', 0, 0, 84, 28, 2), sky); c.restore(); }
    // nube de papel que se desliza
    const cx = -300 + ((t * 26) % 2600);
    if (s.night > 0.3) shadow(c, () => { c.save(); c.translate(cx, 170); fill(c, memo('cloud', () => { const p = new Path2D(); [[0, 0, 70], [80, -30, 86], [170, 0, 64], [90, 20, 80]].forEach(([x, y, r], k) => p.addPath(cut(Array.from({ length: 22 }, (_, i) => [x + Math.cos(i / 22 * TAU) * r, y + Math.sin(i / 22 * TAU) * r * 0.62]), 900 + k, 14, 1.8))); return p; }), mix(C.creamD, C.brown, s.night * 0.8)); c.restore(); });

    // edificios de enfrente
    const bA = mix(C.brownL, C.brown, s.night), bB = mix('#B9C4AE', C.sageD, s.night * 0.85);
    shadow(c, () => { fill(c, rect(1, 1150, 470, 1650, 1520), bA); fill(c, rect(2, 1680, 600, 2340, 1520), bB);
      fill(c, rect(3, 1130, 440, 1670, 480, 18, 1.6), C.ink); fill(c, rect(4, 1660, 572, 2360, 610, 18, 1.6), C.crimD); });
    WIN.forEach(wn => {
      const on = wn.cli ? s.cliOn : s.night > 0.5 && t < 1e8 && s.lightsT < wn.off ? 1 : 0;
      fill(c, rect('w' + wn.k, wn.x, wn.y, wn.x + wn.w, wn.y + wn.h, 16, 1.5), on ? C.gold : mix('#D9CDB9', '#2A221E', s.night));
      fill(c, rect('wl' + wn.k, wn.x + wn.w / 2 - 3, wn.y, wn.x + wn.w / 2 + 3, wn.y + wn.h, 30, 0.6), mix(C.cream, C.ink, s.night * 0.7));
    });
    // la clienta en su ventana: una mano con el celular
    if (s.cliOn > 0) {
      const { x, y, w, h } = CLI; c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
      const px = x + w / 2 + 6, py = y + h * 0.62, sw = Math.sin(t * 3) * 0.04;
      c.save(); c.translate(px, py); c.rotate(-0.12 + sw); c.scale(0.34, 0.34);
      shadow(c, () => { fill(c, handPath('hold'), C.skin); fill(c, sleevePath, C.crim); });
      shadow(c, () => { fill(c, rect('ph', -34, -150, 34, -20, 14, 1.2), C.ink); });
      fill(c, rect('phs', -26, -140, 26, -32, 14, 1), mix(C.cream, '#FFF4DA', 0.5 + 0.5 * Math.sin(t * 4)));
      for (let i = 0; i < 4; i++) { const yy = -128 + ((i * 26 + t * 40) % 100); c.save(); c.translate(0, yy); fill(c, rect('pl' + i, -18, 0, 18, 6, 12, 0.6), i === 1 ? C.crim : '#CDBFA8'); c.restore(); }
      c.translate(0, 0); c.rotate(0.2 * Math.sin(t * 6)); fill(c, memo('thumb', () => cut(capsule([-30, -30], 0.7, 60, 24), 77, 10, 1.2)), C.skin);
      c.restore(); c.restore();
    }
    // farol
    shadow(c, () => { fill(c, rect(5, 1036, 880, 1056, 1560, 30, 1.4), C.ink); fill(c, rect(6, 1004, 840, 1088, 890, 16, 1.4), C.ink); });
    if (s.night > 0.4) { c.save(); c.globalAlpha = 0.18 * s.night * (0.85 + 0.15 * Math.sin(t * 3.1)); fill(c, circ('glow', 1046, 905, 120, 30, 4), C.gold); c.restore(); }
    fill(c, rect(7, 1014, 886, 1078, 930, 14, 1.2), s.night > 0.4 ? C.gold : C.creamD);

    // vereda y calle
    fill(c, rect(8, -600, 1500, 2600, 1612, 24, 2), mix(C.creamD, '#4A3E36', s.night * 0.7));
    fill(c, rect(9, -600, 1606, 2600, 1630, 24, 1.6), C.ink);
    fill(c, rect(10, -600, 1630, 2600, 2700, 30, 2), mix('#BBAE9C', '#3A302B', s.night));
    for (let i = 0; i < 9; i++) fill(c, rect('ln' + i, -500 + i * 340, 1760, -340 + i * 340, 1782, 20, 1.4), C.sage);

    // ---------- el local ----------
    shadow(c, () => {
      fill(c, rect(11, 120, 520, 960, 1500), C.crim);
      fill(c, rect(12, 170, 412, 910, 512, 20, 2), C.cream);
      fill(c, rect(13, 170, 492, 910, 512, 24, 1.4), C.ink);
    }, 1.2);
    // letrero: tres tijeras de papel (sin texto: el negocio puede ser cualquiera)
    [[330, 462], [540, 462], [750, 462]].forEach(([x, y], k) => { c.save(); c.translate(x, y); c.rotate(Math.sin(t * 1.4 + k) * 0.06);
      fill(c, circ('lg' + k, 0, 0, 22, 18, 1.4), k === 1 ? C.crim : C.sage); c.restore(); });
    // toldo a rayas con borde festoneado, que se mece apenas
    c.save(); c.translate(0, 560); c.transform(1, 0, 0, 1 + 0.015 * Math.sin(t * 2), 0, 0);
    shadow(c, () => { for (let i = 0; i < 10; i++) { const x0 = 100 + i * 88;
      fill(c, memo('aw' + i, () => cut([[x0, 0], [x0 + 88, 0], [x0 + 88, 96], ...Array.from({ length: 7 }, (_, k) => [x0 + 88 - k * 88 / 6, 96 + Math.sin(k / 6 * Math.PI) * 30]), [x0, 96]], 500 + i, 14, 1.4)), i % 2 ? C.cream : C.crimD); } });
    c.restore();

    // vidriera con el mostrador y la agenda adentro
    const glass = mix(C.glassD, C.glassN, s.night);
    fill(c, rect(14, 186, 724, 646, 1186, 20, 1.8), C.ink);
    fill(c, rect(15, 198, 736, 634, 1174, 20, 1.6), glass);
    c.save(); c.beginPath(); c.rect(198, 736, 436, 438); c.clip();
    fill(c, rect(16, 210, 1080, 622, 1180, 20, 1.6), mix(C.sage, C.sageD, s.night));
    fill(c, rect(17, 200, 1066, 632, 1086, 20, 1.2), C.ink);
    drawAgenda(c, s, t);
    if (s.agendaHand) { const [x, y, a] = s.agendaHand; hand(c, x, y, a, 0.42, C.sage, 'hold'); }
    c.globalAlpha = 0.25; for (let i = 0; i < 3; i++) fill(c, memo('gl' + i, () => cut([[240 + i * 150, 736], [300 + i * 150, 736], [180 + i * 150, 1174], [120 + i * 150, 1174]], 700 + i, 30, 1.5)), C.cream);
    c.restore();
    if (s.phrase > 0) phrase(c, s.phrase);

    // puerta y cartel
    fill(c, rect(18, 682, 724, 908, 1500, 20, 1.8), C.ink);
    fill(c, rect(19, 696, 740, 894, 1180, 18, 1.4), glass);
    fill(c, rect(20, 696, 1200, 894, 1500, 18, 1.4), C.crimD);
    fill(c, circ('handle', 870, 1250, 12, 14, 1), C.gold);
    drawSign(c, s.sign, t);

    // persiana que baja y sube
    if (s.shutter > 0.001) {
      const yb = lerp(720, 1500, s.shutter);
      shadow(c, () => {
        c.save(); c.beginPath(); c.rect(160, 700, 770, yb - 700); c.clip();
        for (let y = 700, i = 0; y < 1520; y += 36, i++) fill(c, memo('sh' + i, () => cut([[164, 700 + i * 36], [926, 700 + i * 36], [926, 736 + i * 36], [164, 736 + i * 36]], 800 + i, 26, 1.2)), i % 2 ? '#3A322D' : C.ink);
        c.restore();
        c.save(); c.translate(0, yb - 1500); fill(c, rect(21, 156, 1488, 934, 1512, 22, 1.4), C.brown); fill(c, rect(22, 520, 1490, 570, 1512, 10, 1), C.gold); c.restore();
      });
    }
    shadow(c, () => fill(c, rect(23, 150, 684, 940, 724, 22, 1.6), C.ink));

    // manos en el mundo
    if (s.ownerHand) { const [x, y, a] = s.ownerHand; hand(c, x, y, a, 0.8, C.sage, 'point'); }
  }

  // cartel colgado en la puerta: p 0 = ABIERTO, 1 = CERRADO (da la vuelta con scaleX = cos)
  function drawSign(c, p, t) {
    const x = 795, y = 880, sw = Math.sin(t * 2.3) * 0.04 * (1 - Math.abs(Math.sin(p * Math.PI)));
    c.save(); c.strokeStyle = C.ink; c.lineWidth = 3; c.beginPath(); c.moveTo(x, 790); c.lineTo(x - 70, y - 40); c.moveTo(x, 790); c.lineTo(x + 70, y - 40); c.stroke();
    fill(c, circ('nail', x, 790, 7, 12, 0.6), C.gold);
    c.translate(x, y); c.rotate(sw); const f = Math.cos(p * Math.PI); c.scale(Math.max(0.04, Math.abs(f)), 1);
    const cerrado = f < 0;
    shadow(c, () => fill(c, rect('sg', -90, -44, 90, 44, 16, 1.6), cerrado ? C.ink : C.cream));
    fill(c, rect('sgb', -82, -36, 82, 36, 16, 1.2), cerrado ? C.ink : C.cream);
    c.fillStyle = cerrado ? C.cream : C.crim; c.font = '46px "Caveat-600"'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(cerrado ? 'CERRADO' : 'ABIERTO', 0, 3);
    c.restore();
  }

  // agenda sobre el mostrador (frente): open 0 = cerrada, 1 = abierta; marks = cuántas marcas carmesí
  function drawAgenda(c, s, t) {
    const x = 416, y = 1016;
    c.save(); c.translate(x, y);
    shadow(c, () => {
      fill(c, rect('ag0', -150, -56, 150, 52, 16, 1.4), C.crimD);
      fill(c, rect('ag1', -142, -50, 142, 46, 16, 1.2), C.cream);
    });
    if (s.open > 0) {
      for (let j = 0; j < 3; j++) for (let i = 0; i < 6; i++) {
        const gx = -128 + i * 44 + (i > 2 ? 12 : 0), gy = -38 + j * 28, k = j * 6 + i;
        fill(c, rect('cell' + k, gx, gy, gx + 34, gy + 20, 10, 0.8), '#E9DFCC');
        const m = clamp(s.marks - k * 0.06) ;
        if (m > 0 && [0, 2, 3, 4, 7, 8, 10, 11, 13, 14, 15, 16].includes(k)) { const sc = U.ease.outBack(clamp(m * 3));
          c.save(); c.translate(gx + 17, gy + 10); c.scale(sc, sc); fill(c, circ('mk' + k, 0, 0, 9, 12, 1), k % 5 ? C.crim : C.sage); c.restore(); }
      }
      fill(c, rect('ag2', -3, -50, 3, 46, 16, 0.6), C.crimD);
    }
    if (s.open < 0.5) shadow(c, () => fill(c, rect('covL', -152, -56, 2, 52, 16, 1.4), C.crim));
    // tapa: gira sobre el lomo (x = 0) de derecha a izquierda
    const f = Math.cos(s.open * Math.PI);
    c.save(); c.scale(f, 1);
    if (f > 0.02) shadow(c, () => { fill(c, rect('cov', 0, -56, 152, 52, 16, 1.4), C.crim); fill(c, rect('covb', 108, -56, 122, 52, 16, 1), C.gold); });
    else if (f < -0.02) fill(c, rect('cov2', 0, -56, 152, 52, 16, 1.4), C.crimD);
    c.restore();
    c.restore();
  }

  // la frase escrita a mano en la vidriera (se escribe de izquierda a derecha)
  function phrase(c, p) {
    const L = [['Tu negocio', 800], ['abrió antes', 874], ['que vos.', 948]];
    c.save(); c.font = '72px "Caveat-600"'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    L.forEach(([s, y], i) => { const q = clamp(p * 3 - i); if (q <= 0) return; const w = c.measureText(s).width;
      c.save(); c.beginPath(); c.rect(416 - w / 2 - 10, y - 80, (w + 20) * q, 110); c.clip();
      c.fillStyle = 'rgba(244,239,228,.85)'; c.fillText(s, 418, y + 3); c.fillStyle = C.crim; c.fillText(s, 416, y); c.restore(); });
    c.restore();
  }

  function frame(c, s, cam, t) {
    c.save(); c.fillStyle = C.cream; c.fillRect(0, 0, W, H);
    c.translate(W / 2, H / 2); c.rotate(cam.r || 0); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y);
    world(c, s, t);
    c.restore();
    c.save(); c.globalCompositeOperation = 'overlay'; c.drawImage(gouache(), 0, 0); c.restore();
  }
  const camLerp = (a, b, p) => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), p)), r: lerp(a.r || 0, b.r || 0, p) });

  SCENES.dm_noche = { draw(c, lt, t) {
    const A = { x: 795, y: 930, z: 1.9 }, B = { x: 830, y: 1000, z: 0.72 }, Cc = { x: 1840, y: 900, z: 1.0 }, D = { x: CLI.x + CLI.w / 2 + 6, y: CLI.y + CLI.h * 0.62 - 29, z: 9 };
    let cam = lt < 3 ? { ...A, x: A.x + Math.sin(lt * 0.8) * 6 } : lt < 6 ? camLerp(A, B, tw(lt, 3, 5.6)) : lt < 8.4 ? camLerp(B, Cc, tw(lt, 6, 8.2)) : camLerp(Cc, D, U.ease.in(clamp((lt - 8.4) / 1.6)));
    const flip = tw(lt, 0.95, 1.55);
    const hin = tw(lt, 0.25, 0.9), hout = tw(lt, 1.6, 2.3);
    const s = {
      night: lerp(0.72, 1, tw(lt, 0, 4)), sign: flip, shutter: U.ease.out(clamp((lt - 1.75) / 0.75)) - 0.03 * Math.sin(clamp((lt - 2.5) / 0.4) * Math.PI),
      moon: [880, lerp(1050, 290, tw(lt, 2.6, 5.6))], lightsT: lt, cliOn: 1,
      ownerHand: hout < 1 ? [lerp(1180, 838, hin) + hout * 360, lerp(1560, 940, hin) + hout * 300 + Math.sin(flip * Math.PI) * -10, -0.35 + flip * 0.25] : null,
      open: 0, marks: 0, phrase: 0,
    };
    frame(c, s, cam, t);
  } };

  SCENES.dm_dia = { draw(c, lt, t) {
    const B = { x: 640, y: 960, z: 1.0 }, Ag = { x: 416, y: 1000, z: 2.9 }, E = { x: 540, y: 960, z: 1.0 };
    let cam = lt < 4.2 ? { ...B, y: B.y - lt * 6 } : lt < 8 ? camLerp({ ...B, y: B.y - 25 }, Ag, tw(lt, 4.2, 5.4)) : camLerp(Ag, E, tw(lt, 8, 9.3));
    const ag = tw(lt, 5.3, 5.8), agOut = tw(lt, 7.4, 8.0), fl = tw(lt, 9.6, 10.2), hin = tw(lt, 9.0, 9.55), hout = tw(lt, 10.3, 11.0);
    const s = {
      night: 1 - tw(lt, 0.4, 3.4), sign: 1 - fl, shutter: 1 - tw(lt, 2.2, 3.6),
      moon: lt < 2.8 ? [lerp(880, 1500, tw(lt, 0.3, 2.6)), lerp(290, 120, tw(lt, 0.3, 2.6))] : null,
      sun: [lerp(250, 300, tw(lt, 0.3, 3.2)), lerp(1150, 320, tw(lt, 0.3, 3.2))], lightsT: 99, cliOn: 0,
      open: tw(lt, 5.8, 6.5), marks: clamp((lt - 6.5) / 1.1),
      agendaHand: ag > 0 && agOut < 1 ? [lerp(560, 470, ag) + agOut * 160, lerp(1260, 1060, ag) + agOut * 240 + Math.sin(tw(lt, 5.8, 6.5) * Math.PI) * -12, -0.5 + tw(lt, 5.8, 6.5) * 0.5] : null,
      ownerHand: hin > 0 && hout < 1 ? [lerp(1180, 838, hin) + hout * 360, lerp(1560, 940, hin) + hout * 300, -0.35 + fl * 0.25] : null,
      phrase: clamp((lt - 10.0) / 1.5),
    };
    frame(c, s, cam, t);
  } };
})();
