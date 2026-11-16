import { defineWorld } from '@diorama/worlds';
// «Antes»: 23:14, la dueña sigue contestando WhatsApp sentada a la mesa, con el velador prendido.
// Cronología (6 s, loop): 0–2.6 tipea con los dos pulgares · 2.6–3.1 baja el teléfono · 3.1–4.2 se frota los ojos con la
// mano izquierda · 4.2–4.8 vuelve a levantar el teléfono · 4.8–6 tipea. La pantalla parpadea con cada mensaje que entra.
const duration = 6;
const SHIRT = '#de7c5a', PANTS = '#33403f', SKIN = '#c08a66';

export default defineWorld({
  name: 'noche', title: 'Las 23:14 y sigue contestando', duration,
  description: 'De noche, una mujer sentada a la mesa de su casa, bajo la luz de un velador, contesta mensajes en el celular. Cada tanto baja el teléfono y se frota los ojos, cansada, y vuelve a escribir.',
  bounds: [[-1.9, -.3, -1.6], [1.9, 2.4, 1.5]],
  still: 1.2,
  contactTimes: [.5, 1.5, 3.6, 5.4],
  build(W) {
    const { box, ball, cylinder, line, group } = W;
    // Piso de madera oscura y dos paredes en corte, en tonos de noche.
    W.surface(3.6, 2.9, '#4a3f55', 0, .02, 0, 9, .1);
    for (let i = 0; i < 9; i++) box(3.6, .006, .012, '#3d3447', 0, .035, -1.3 + i * .32);
    box(3.6, 2.3, .08, '#2f2a44', 0, 1.15, -1.45);
    box(.08, 2.3, 2.9, '#28243b', -1.8, 1.15, 0);
    // Ventana con luna, y un reloj de pared que marca las 23:14.
    box(.9, .8, .03, '#1d1b2c', .55, 1.55, -1.4);
    for (const x of [.55]) box(.03, .8, .035, '#3c3754', x, 1.55, -1.39);
    box(.9, .03, .035, '#3c3754', .55, 1.55, -1.39);
    ball(.07, '#efe6c4', .8, 1.78, -1.38);
    const clock = group(-.75, 1.7, -1.4);
    const face = cylinder(.2, .03, '#e8dcc2', 0, 0, 0, clock, 20); face.rotation.x = Math.PI / 2;
    const hour = box(.022, .11, .012, '#2a2236', 0, 0, .025, clock); hour.position.set(-.045, .028, .025); hour.rotation.z = (11 + 14 / 60) / 12 * Math.PI * 2;
    const minute = box(.016, .16, .012, '#2a2236', 0, 0, .03, clock); minute.position.set(.068, .03, .03); minute.rotation.z = -14 / 60 * Math.PI * 2;
    // Alfombra, mesa, silla.
    box(2.2, .012, 1.6, '#6b3a4a', 0, .03, .25);
    const table = group(0, 0, .52);
    for (const x of [-.62, .62]) for (const z of [-.32, .32]) box(.06, .74, .06, '#6a4a34', x, .38, z, table);
    box(1.4, .06, .8, '#8a6446', 0, .76, 0, table);
    const chair = group(0, 0, -.2);
    for (const x of [-.2, .2]) for (const z of [-.18, .18]) box(.045, .46, .045, '#5e4330', x, .23, z, chair);
    box(.48, .05, .44, '#7a573c', 0, .48, 0, chair);
    box(.48, .5, .04, '#7a573c', 0, .76, -.21, chair);
    // Velador: base, pie y pantalla cálida; taza y anotador sobre la mesa.
    const lamp = group(-.5, .79, .4);
    cylinder(.09, .03, '#3a2f2a', 0, .015, 0, lamp, 12); cylinder(.015, .42, '#3a2f2a', 0, .23, 0, lamp, 6);
    cylinder(.16, .2, '#f2c879', 0, .5, 0, lamp, 12); ball(.05, '#ffe39a', 0, .44, 0, lamp);
    cylinder(.06, .1, '#d9cdb8', .48, .84, .62, undefined, 10);
    box(.24, .01, .32, '#e6d8bd', .25, .795, .72);
    // La dueña sentada (misma ropa que en «Ahora»).
    const owner = W.person(0, -.18, SHIRT, PANTS, 1, SKIN);
    owner.root.position.y = 0;
    // El celular, con su pantalla encendida, y los dos agarres.
    const phone = group(0, 1.02, .18);
    box(.085, .16, .012, '#1f1f24', 0, 0, 0, phone);
    const screen = box(.072, .14, .004, '#8fcaf2', 0, 0, .008, phone);
    const flash = group(0, .04, .011, phone); box(.06, .03, .003, '#ffe9a8', 0, 0, 0, flash);
    const gL = group(-.05, -.03, 0, phone), gR = group(.05, -.03, 0, phone);
    const v = new W.THREE.Vector3();
    return { owner, phone, flash, gL, gR, v, palms: {} };
  },
  tick({ t, parts: p, W }) {
    const s = (a, b) => W.smooth((t - a) / (b - a));
    const o = p.owner;
    // Sentada: cadera a la altura del asiento, muslos hacia adelante, canillas hacia abajo.
    o.body.position.y = .55;
    for (const [leg, shin] of [[o.leftLeg, o.leftShin], [o.rightLeg, o.rightShin]]) { leg.rotation.set(-Math.PI / 2 + .05, 0, 0); shin.rotation.set(Math.PI / 2 - .05, 0, 0); }
    const down = s(2.6, 3.1) * (1 - s(4.2, 4.8));      // baja el teléfono
    const rub = s(3.05, 3.35) * (1 - s(3.95, 4.25));   // se frota los ojos
    o.chest.rotation.set(.16 + .06 * down, 0, 0);
    o.head.rotation.set(.42 - .18 * rub + .05 * down, -.04 * Math.sin(t / duration * Math.PI * 2), 0);
    // El teléfono sube y baja con ella; un leve temblor al tipear.
    const tap = (1 - down) * .006 * Math.sin(t / duration * Math.PI * 2 * 21);
    p.phone.position.set(0, 1.02 - .2 * down + tap, .18 + .05 * down);
    p.phone.rotation.set(-.55 - .5 * down, 0, 0);
    // Cada mensaje que entra hace parpadear la pantalla.
    const pulse = Math.max(0, Math.sin(t / duration * Math.PI * 2 * 3)) ** 8;
    p.flash.scale.setScalar(Math.max(.001, pulse));
    p.phone.updateMatrixWorld(true);
    const at = g => { g.getWorldPosition(p.v); return p.v.toArray(); };
    const R = at(p.gR);
    let L = at(p.gL);
    if (rub > 0) { o.head.updateMatrixWorld(true); p.v.set(-.03, .02, .12); o.head.localToWorld(p.v); L = W.THREE.MathUtils.lerp ? [0, 1, 2].map(i => L[i] + (p.v.toArray()[i] - L[i]) * rub) : L; }
    p.palms.L = W.reach(o, -1, L); p.palms.R = W.reach(o, 1, R);
    p.palms.holdL = rub < .01;
  },
  contacts({ parts: p }) {
    const at = g => { g.getWorldPosition(p.v); return p.v.toArray(); };
    const out = [{ label: 'la mano derecha sostiene el teléfono', a: p.palms.R, b: at(p.gR) }];
    if (p.palms.holdL) out.push({ label: 'la mano izquierda sostiene el teléfono', a: p.palms.L, b: at(p.gL) });
    return out;
  }
});
