import { defineWorld } from '@diorama/worlds';
// «El pedido llega»: almacén de barrio de Soluciones Digitales a Medida.
// Cronología (6 s, loop): 0–0.6 el celular se ilumina y aparece la burbuja de pedido · 0.6–1.3 la dueña gira y toma
// el paquete del estante · 1.3–2.4 lo trae con las dos manos al mostrador · 2.2–2.6 entrega (los cuatro agarres a la vez)
// · 2.6–3.2 el cliente lo acerca · 3.2–4.4 lo guarda en la bolsa · 4.4–6 saludo, el estante se repone desde atrás.
const duration = 6, TAU = Math.PI * 2;
const RED = '#b10f2e', DEEP = '#570000', CORAL = '#de7c5a', CREAM = '#f3ead8';

const P0 = [.42, 1.205, -.02];   // paquete en el estante
const PM = [-.2, 1.27, .24];       // delante del pecho de la dueña
const PH = [-.42, 1.12, .33];      // sobre el mostrador, del lado del cliente
const PC = [-.66, 1.2, .38];       // el cliente lo acerca
const PT = [-.92, 1.34, .63];      // encima de la bolsa
const PIN = [-.92, .9, .63];       // adentro de la bolsa
const HIDE = [.98, 1.205, -.02]; // detrás del panel del estante

const lerp = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);

export default defineWorld({
  name: 'almacen', title: 'El pedido llega', duration, still: 2.3,
  description: 'En un almacén de barrio con toldo rojo, el celular del mostrador se ilumina con un pedido nuevo. La dueña toma un paquete del estante, se lo entrega por el mostrador a un cliente, y él lo guarda en su bolsa y saluda.',
  bounds: [[-2.1, -.45, -1.7], [2.3, 2.65, 1.7]],
  contactTimes: [1.3, 1.8, 2.3, 2.5, 3.0, 3.8],
  build(W) {
    const { box, cylinder, ball, line, group } = W;
    W.terrain(4.4, 3.4, '#8a9a62', 23); W.grass(4.4, 3.4, 520, 31);
    // Vereda de baldosas: el local se lee como un comercio de barrio, no como un jardín.
    for (let row = 0; row < 7; row++) for (let col = 0; col < 9; col++) {
      const x = -1.85 + col * .44 + (row % 2) * .2, z = -1.35 + row * .42;
      if (Math.abs(x) > 1.9 || Math.abs(z) > 1.4) continue;
      box(.41, .035, .38, ['#c9bfa9', '#d4cbb5', '#bdb39e'][(row + col) % 3], x, .03, z);
    }
    // Pared y estantería del fondo, llena de mercadería en colores de la marca.
    box(3.0, 2.2, .1, '#efe4cf', 0, 1.13, -1.05);
    for (const y of [.55, 1.0, 1.45, 1.9]) box(2.7, .04, .32, '#9a7650', 0, y, -.86);
    for (const x of [-1.37, 1.37]) box(.05, 1.95, .34, '#86653f', x, 1.0, -.86);
    const goods = [RED, CORAL, '#e7c56d', '#6f8a52', CREAM, DEEP, '#d9a066'];
    for (const y of [.55, 1.0, 1.45]) for (let i = 0; i < 11; i++) {
      const x = -1.22 + i * .245, c = goods[(i * 3 + Math.round(y * 10)) % goods.length];
      if (i % 3 === 0) cylinder(.06, .18, c, x, y + .11, -.84, undefined, 10);
      else box(.16, .16 + (i % 2) * .08, .16, c, x, y + .1 + (i % 2) * .04, -.84);
    }
    // Toldo a rayas rojo y crema, colgado de la pared sobre los estantes (no tapa a la dueña).
    for (let i = 0; i < 12; i++) {
      const s = box(.25, .03, .62, i % 2 ? CREAM : RED, -1.375 + i * .25, 2.33, -.78);
      s.rotation.x = .38;
    }
    for (let i = 0; i < 12; i++) box(.25, .12, .025, i % 2 ? CREAM : RED, -1.375 + i * .25, 2.14, -.49);
    // Estante lateral, a la derecha de la dueña, abierto hacia ella.
    const shelf = group(.62, 0, -.02);
    box(.03, 1.75, .5, '#7b5b37', .17, .9, 0, shelf);
    for (const z of [-.25, .25]) box(.34, 1.75, .03, '#86653f', 0, .9, z, shelf);
    for (const y of [.4, .76, 1.11, 1.47]) box(.34, .03, .5, '#a37d52', 0, y, 0, shelf);
    for (const [y, c] of [[.47, CORAL], [.83, '#e7c56d'], [1.54, RED]]) box(.2, .12, .16, c, 0, y + .02, -.08, shelf);
    // Mostrador: frente rojo de marca con un filo crema, tapa de madera.
    box(1.9, .96, .5, RED, .33, .5, .5);
    box(1.9, .05, .02, CREAM, .33, .8, .76);
    box(2.0, .05, .58, '#b8935f', .33, 1.0, .5);
    box(.3, .3, .02, CREAM, .9, .45, .76);
    // Detalles del mostrador: balanza, frasco de caramelos, y el celular con su pantalla y la burbuja de pedido.
    box(.22, .06, .18, '#cfd2cf', .85, 1.06, .48); box(.16, .02, .14, '#e9ece8', .85, 1.1, .48);
    cylinder(.08, .2, '#e2ece9', 1.08, 1.13, .55, undefined, 10); ball(.03, RED, 1.08, 1.08, .55); ball(.03, '#e7c56d', 1.06, 1.12, .57);
    const phone = group(.06, 1.035, .5); phone.rotation.y = .35;
    box(.1, .014, .18, '#2b2b2f', 0, 0, 0, phone);
    const screen = group(0, .01, 0, phone); box(.084, .006, .16, '#ffe7b8', 0, 0, 0, screen);
    const badge = group(.06, 1.13, .5);
    ball(.045, RED, 0, 0, 0, badge); box(.034, .008, .008, '#ffffff', 0, 0, .046, badge);
    // El paquete: caja de cartón con cinta roja. Agarres: arriba (mano derecha de la dueña) y extremo
    // izquierdo (su mano izquierda); caras delantera y trasera del lado del cliente (cliente).
    const pack = group(...P0);
    box(.24, .16, .14, '#c9a26b', 0, 0, 0, pack);
    box(.245, .03, .145, RED, 0, .02, 0, pack);
    box(.03, .165, .145, RED, -.04, 0, 0, pack);
    const gR = group(.06, .085, 0, pack), gL = group(-.125, 0, 0, pack);
    const cL = group(-.07, 0, .075, pack), cR = group(-.07, 0, -.075, pack);
    // Cajones de fruta y verdura delante del mostrador, y una pizarra.
    for (const [x, z, c] of [[1.55, .75, '#e58f3a'], [1.55, 1.25, '#7d9b4f']]) {
      const g = group(x, 0, z); box(.42, .22, .36, '#a8834f', 0, .14, 0, g);
      for (let i = 0; i < 9; i++) ball(.06, c, -.13 + (i % 3) * .13, .28, -.11 + Math.floor(i / 3) * .11, g);
    }
    const sign = group(-1.4, 0, 1.15); sign.rotation.y = .5;
    const a = box(.42, .62, .03, '#3a3a36', 0, .42, .06, sign); a.rotation.x = -.16;
    const b = box(.42, .62, .03, '#3a3a36', 0, .42, -.06, sign); b.rotation.x = .16;
    box(.3, .05, .035, RED, 0, .58, .1, sign); box(.26, .03, .035, CREAM, 0, .46, .095, sign); box(.2, .03, .035, CREAM, 0, .38, .092, sign);
    W.tree(1.85, -1.35, .55, 5);
    // La dueña, detrás del mostrador (la escena está espejada: el cliente queda lejos de la cámara, de frente), con delantal bordó.
    const owner = W.person(-.25, 0, '#efe6d2', '#33403f', 1, '#c08a66'); owner.root.position.y = .005;
    box(.31, .43, .018, DEEP, 0, .29, .133, owner.chest);
    for (const x of [-.12, .12]) box(.025, .25, .018, DEEP, x, .52, .133, owner.chest);
    // El cliente, en la punta del mostrador, con una bolsa de tela abierta colgada del hombro izquierdo.
    const customer = W.person(-.92, .33, '#7f98a8', '#3e4042', .94, '#8e624d'); customer.root.rotation.y = Math.PI / 2; customer.root.position.y = .005;
    const tote = group(-.3, -.42, 0, customer.chest);
    box(.28, .02, .2, '#d8c39a', 0, -.17, 0, tote);
    for (const z of [-.1, .1]) box(.28, .34, .015, '#e2cfa6', 0, 0, z, tote);
    for (const x of [-.14, .14]) box(.015, .34, .2, '#d8c39a', x, 0, 0, tote);
    box(.2, .06, .016, RED, 0, .02, .11, tote);
    line([[.0, .17, -.1], [.05, .45, -.05], [.02, .62, 0]], '#c9b386', .012, tote);
    const v = new W.THREE.Vector3();
    return { owner, customer, pack, gL, gR, cL, cR, screen, badge, v, palms: {} };
  },
  tick({ t, parts: p, W }) {
    const s = (a, b) => W.smooth((t - a) / (b - a));
    // Celular: pantalla y burbuja aparecen, y se apagan al final del ciclo.
    const lit = s(.15, .4) * (1 - s(5.55, 5.9));
    p.screen.scale.set(Math.max(.001, lit), 1, Math.max(.001, lit));
    const pop = s(.25, .55) * (1 - s(1.4, 1.7));
    p.badge.scale.setScalar(Math.max(.001, pop * (1 + .12 * Math.sin(t * 9) * (1 - s(.55, 1.2)))));
    p.badge.position.y = 1.13 + .08 * pop;
    // Trayectoria del paquete, con un arco al cruzar.
    let pos;
    if (t < 1.3) pos = P0;
    else if (t < 2.0) { const k = s(1.3, 2.0); pos = lerp(P0, PM, k); pos[1] += .06 * Math.sin(k * Math.PI); }
    else if (t < 2.4) pos = lerp(PM, PH, s(2.0, 2.4));
    else if (t < 2.6) pos = PH;
    else if (t < 3.2) pos = lerp(PH, PC, s(2.6, 3.2));
    else if (t < 3.8) { const k = s(3.2, 3.8); pos = lerp(PC, PT, k); pos[1] += .05 * Math.sin(k * Math.PI); }
    else if (t < 4.4) pos = lerp(PT, PIN, s(3.8, 4.4));
    else if (t < 4.7) pos = PIN;
    else if (t < 5.25) pos = HIDE;   // oculto: dentro de la bolsa, después detrás del panel del estante
    else pos = lerp(HIDE, P0, s(5.25, 5.85));
    p.pack.position.set(...pos);
    p.pack.rotation.y = .25 * s(1.3, 2.0) * (1 - s(2.0, 2.4)) - .2 * s(2.6, 3.2) * (1 - s(3.2, 3.8));
    p.pack.updateMatrixWorld(true);
    const at = g => { g.getWorldPosition(p.v); return p.v.toArray(); };

    // Dueña: mira el celular, gira al estante, trae el paquete, entrega y vuelve.
    const toShelf = s(.6, 1.2) * (1 - s(1.4, 2.1)), toCounter = s(1.6, 2.3) * (1 - s(2.6, 3.4));
    W.plant(p.owner, { crouch: .03 + .02 * toShelf, lean: .07 + .06 * toCounter + .04 * toShelf, twist: .5 * toShelf - .3 * toCounter });
    const lookPhone = 1 - s(.55, .9) + s(5.1, 5.5);
    p.owner.head.rotation.set(.3 * lookPhone + .12, .55 * toShelf - .25 * toCounter - .1 * lookPhone, 0);
    const restL = [-.47, 1.04, .3], restR = [-.05, 1.04, .3];
    const holdR = t >= 1.15 && t < 2.6, holdL = t >= 1.75 && t < 2.6;
    let L = restL, R = restR;
    if (t >= .6 && t < 1.3) R = lerp(restR, at(p.gR), s(.6, 1.15));
    if (holdR) R = at(p.gR);
    if (t >= 2.6 && t < 3.1) R = lerp(at(p.gR), restR, s(2.6, 3.1));
    if (t >= 1.3 && t < 1.75) L = lerp(restL, at(p.gL), s(1.3, 1.75));
    if (holdL) L = at(p.gL);
    if (t >= 2.6 && t < 3.1) L = lerp(at(p.gL), restL, s(2.6, 3.1));
    // Saludo con la mano izquierda, la del lado del cliente.
    const wave = s(4.4, 4.7) * (1 - s(5.2, 5.5));
    if (wave > 0) L = lerp(L, [-.62, 1.78 + .05 * Math.sin(t * 14), .25], wave);
    p.palms.oL = W.reach(p.owner, -1, L); p.palms.oR = W.reach(p.owner, 1, R);
    p.palms.holdL = holdL; p.palms.holdR = holdR;

    // Cliente: espera, toma el paquete, lo acerca, lo guarda, asiente.
    const take = s(1.9, 2.3) * (1 - s(3.0, 3.6));
    W.plant(p.customer, { crouch: .015 + .02 * take, lean: .03 + .1 * take, twist: .06 * Math.sin(t / duration * TAU) });
    const cHoldL = t >= 2.25 && t < 4.4, cHoldR = t >= 2.25 && t < 3.8;
    const cRestL = [-.84, .95, .5], cRestR = [-.82, .95, .2];
    let CL = cRestL, CR = cRestR;
    if (t >= 1.85 && t < 2.25) { CL = lerp(cRestL, at(p.cL), s(1.85, 2.25)); CR = lerp(cRestR, at(p.cR), s(1.85, 2.25)); }
    if (cHoldL) CL = at(p.cL);
    if (cHoldR) CR = at(p.cR);
    if (t >= 3.8 && t < 4.3) CR = lerp(at(p.cR), cRestR, s(3.8, 4.3));
    if (t >= 4.4) CL = lerp([-.92, 1.02, .58], cRestL, s(4.4, 4.9));
    p.palms.cL = W.reach(p.customer, -1, CL); p.palms.cR = W.reach(p.customer, 1, CR);
    p.palms.cHoldL = cHoldL; p.palms.cHoldR = cHoldR;
    const nod = s(4.5, 4.75) * (1 - s(4.9, 5.2));
    p.customer.head.rotation.set(.22 * take + .18 * nod + .08 * s(3.2, 3.6) * (1 - s(4.3, 4.6)), -.12 * Math.sin(t / duration * TAU), 0);
  },
  contacts({ parts: p }) {
    const at = g => { g.getWorldPosition(p.v); return p.v.toArray(); };
    const out = [];
    if (p.palms.holdL) out.push({ label: 'la mano izquierda de la dueña toma el paquete', a: p.palms.oL, b: at(p.gL) });
    if (p.palms.holdR) out.push({ label: 'la mano derecha de la dueña toma el paquete', a: p.palms.oR, b: at(p.gR) });
    if (p.palms.cHoldL) out.push({ label: 'la mano izquierda del cliente toma el paquete', a: p.palms.cL, b: at(p.cL) });
    if (p.palms.cHoldR) out.push({ label: 'la mano derecha del cliente toma el paquete', a: p.palms.cR, b: at(p.cR) });
    for (const actor of [p.owner, p.customer]) for (const side of [-1, 1]) {
      const foot = side < 0 ? actor.leftFoot : actor.rightFoot; foot.getWorldPosition(p.v); const a = p.v.toArray();
      p.v.set(side * .13, .09, 0); actor.root.localToWorld(p.v); out.push({ label: 'el tobillo queda sobre su apoyo', a, b: p.v.toArray() });
    }
    return out;
  }
});
