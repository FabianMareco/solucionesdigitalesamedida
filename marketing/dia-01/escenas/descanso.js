import { defineWorld } from '@diorama/worlds';
// «Ahora»: la misma dueña descansa en una reposera junto a la pileta, con un cóctel, bajo una sombrilla de la marca.
// Cronología (6 s, loop): 0.8 el celular de la mesita se ilumina (reserva nueva) · 1.0–1.8 ella gira la cabeza y lo mira ·
// 2.4–3.4 toma un sorbo · 3.9 otra notificación · 4.1–4.7 la mira de reojo · 6 vuelve a la pose inicial.
const duration = 6;
const SHIRT = '#de7c5a', PANTS = '#33403f', SKIN = '#c08a66';
const RED = '#b10f2e', CREAM = '#efdcc0';

export default defineWorld({
  name: 'descanso', title: 'Ella descansa, su agenda atiende', duration,
  description: 'De día, la misma mujer descansa en una reposera junto a una pileta, bajo una sombrilla roja y crema, con un cóctel en la mano. El celular de la mesita se ilumina con reservas nuevas; ella lo mira tranquila y sigue tomando.',
  bounds: [[-2.1, -.3, -1.7], [2.1, 2.5, 1.7]],
  still: 2.9,
  contactTimes: [.5, 2.9, 5.5],
  build(W) {
    const { box, ball, cylinder, line, group } = W;
    W.terrain(4.2, 3.4, '#86a05a', 31); W.grass(4.2, 3.4, 600, 17);
    // Deck de madera clara.
    for (let i = 0; i < 12; i++) box(.3, .04, 2.4, i % 2 ? '#d8b98c' : '#ceae80', -1.35 + i * .31, .04, .1);
    // Pileta con borde, a la derecha.
    const pool = group(1.25, 0, -.4);
    box(1.5, .1, 2.0, '#dccfb8', 0, .05, 0, pool);
    box(1.3, .02, 1.8, '#6fc3d6', 0, .105, 0, pool);
    for (let i = 0; i < 5; i++) { const r = box(.5, .004, .04, '#93d3e2', -.3 + (i % 2) * .4, .118, -.7 + i * .35, pool); r.rotation.y = .3; }
    // Sombrilla con los colores de la marca.
    const umb = group(-.15, 0, -.65);
    cylinder(.025, 2.15, '#dccfb8', 0, 1.08, 0, umb, 8);
    cylinder(1.05, .06, RED, 0, 2.15, 0, umb, 16);
    for (let k = 0; k < 4; k++) { const st = box(.22, .012, 2.08, CREAM, 0, 2.185, 0, umb); st.rotation.y = k * Math.PI / 4; }
    cylinder(.07, .08, CREAM, 0, 2.23, 0, umb, 10);
    cylinder(.2, .05, '#9b8c78', 0, .07, 0, umb, 12);
    // Reposera: armazón, asiento y respaldo inclinado (la persona mira hacia +z).
    const lounge = group(-.15, 0, -.1);
    for (const x of [-.3, .3]) for (const z of [-.75, .75]) box(.04, .3, .04, '#e2d6c4', x, .15, z, lounge);
    box(.64, .06, 1.2, '#e2d6c4', 0, .32, .25, lounge);
    box(.58, .04, 1.1, '#c95d63', 0, .36, .25, lounge);
    const back = group(0, .34, -.3, lounge); back.rotation.x = -1.05;
    box(.64, .06, .8, '#e2d6c4', 0, 0, -.4, back); box(.58, .04, .74, '#c95d63', 0, .04, -.4, back);
    // Mesita con el celular.
    const side = group(-.75, 0, .05);
    cylinder(.22, .03, '#e2d6c4', 0, .5, 0, side, 16); cylinder(.025, .5, '#e2d6c4', 0, .25, 0, side, 6);
    const phone = group(0, .53, 0, side); phone.rotation.y = .5;
    box(.09, .012, .17, '#1f1f24', 0, 0, 0, phone);
    const glow = group(0, .008, 0, phone); box(.076, .004, .15, '#9fd4f5', 0, 0, 0, glow);
    const note = group(0, .015, -.03, phone); box(.07, .004, .045, '#ffe6a6', 0, 0, 0, note);
    // Plantas en macetas y un árbol al fondo.
    for (const [x, z] of [[-1.6, -1.2], [1.7, 1.1]]) { const g = group(x, 0, z); cylinder(.17, .32, '#b9714f', 0, .16, 0, g, 10); for (let i = 0; i < 7; i++) ball(.12, i % 2 ? '#5f8a46' : '#6f9a4f', Math.cos(i) * .1, .42 + (i % 3) * .08, Math.sin(i) * .1, g); }
    W.tree(-1.75, .9, .6, 8);
    // La dueña (misma ropa que en «Antes») recostada.
    const owner = W.person(-.15, -.18, SHIRT, PANTS, 1, SKIN);
    owner.root.position.y = 0;
    box(.2, .04, .02, '#2a2a2a', 0, .02, .125, owner.head);   // anteojos de sol
    // El cóctel: copa, jugo naranja, rodaja y sorbete; el agarre es el pie de la copa.
    const glass = group(0, 0, 0);
    cylinder(.05, .12, '#f5d27a', 0, .06, 0, glass, 10); cylinder(.055, .01, '#bfe4ef', 0, .125, 0, glass, 10);
    const slice = ball(.035, '#f08a2c', .045, .13, 0, glass); slice.scale.z *= .3;
    line([[-.01, .06, 0], [-.03, .2, 0]], RED, .006, glass);
    const grip = group(0, .03, 0, glass);
    const v = new W.THREE.Vector3();
    return { owner, glass, grip, glow, note, v, palms: {} };
  },
  tick({ t, parts: p, W }) {
    const s = (a, b) => W.smooth((t - a) / (b - a));
    const o = p.owner;
    // Recostada: cadera sobre el asiento, torso hacia atrás contra el respaldo, piernas estiradas sobre la reposera.
    o.body.position.y = .5;
    o.chest.rotation.set(-.62, 0, 0);
    for (const [leg, shin, a] of [[o.leftLeg, o.leftShin, .04], [o.rightLeg, o.rightShin, -.04]]) { leg.rotation.set(-1.42, 0, a); shin.rotation.set(.12, 0, 0); }
    // Notificaciones: la pantalla y la tarjeta se encienden dos veces por vuelta.
    const n1 = s(.7, .85) * (1 - s(2.4, 2.8)), n2 = s(3.8, 3.95) * (1 - s(5.3, 5.7));
    const lit = Math.max(n1, n2);
    p.glow.scale.setScalar(Math.max(.001, lit)); p.note.scale.setScalar(Math.max(.001, lit));
    // Mira el celular, tranquila, y vuelve.
    const look = s(1.0, 1.4) * (1 - s(1.8, 2.2)) + .7 * s(4.1, 4.4) * (1 - s(4.7, 5.0));
    // Toma un sorbo.
    const sip = s(2.4, 2.85) * (1 - s(3.0, 3.4));
    o.head.rotation.set(.35 + .1 * look - .12 * sip, .75 * look, 0);
    o.root.updateMatrixWorld(true);
    // La copa descansa a la altura del pecho y sube a la boca en el sorbo.
    p.v.set(.2, .32, .26); o.chest.localToWorld(p.v); const rest = p.v.toArray();
    o.head.updateMatrixWorld(true); p.v.set(.03, -.06, .16); o.head.localToWorld(p.v); const mouth = p.v.toArray();
    const g = [0, 1, 2].map(i => rest[i] + (mouth[i] - rest[i]) * sip);
    p.glass.position.set(g[0], g[1] - .03, g[2]); p.glass.rotation.set(0, 0, -.5 * sip);
    p.glass.updateMatrixWorld(true);
    p.grip.getWorldPosition(p.v);
    p.palms.R = W.reach(o, 1, p.v.toArray());
    // La otra mano descansa sobre la panza.
    p.v.set(-.06, .1, .16); o.chest.localToWorld(p.v);
    p.palms.L = W.reach(o, -1, p.v.toArray());
  },
  contacts({ parts: p }) {
    p.grip.getWorldPosition(p.v);
    return [{ label: 'la mano derecha sostiene la copa', a: p.palms.R, b: p.v.toArray() }];
  }
});
