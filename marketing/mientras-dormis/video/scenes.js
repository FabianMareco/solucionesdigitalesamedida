// «Lo que pasa mientras dormís» · sin voz. Cada escena es un clip a pantalla completa y los textos escritos a mano encima.
// Los textos van en una tarjeta de papel (como un recorte clavado), en la franja alta de la zona segura.
const card = (s, str, at, out, { y, size = 84, rot = -2 } = {}) => s.text(str, {
  x: s.cx, y: y ?? s.safe.top + 90, size, font: 'hand', color: 'ink', bg: '#F4EFE4', padding: 26, radius: 6,
  rotate: rot, at, out, enter: 'write', dur: 0.2 + str.length * 0.03, exit: 'fade', sfx: false, camera: false,
});

function noche(s) {
  s.camera([]);
  s.clip('assets/clips/dm_noche.mp4', { full: true, at: 0, enter: 'none', camera: false });
  card(s, 'Cerraste a las 20.', 0.3, 2.8);
  card(s, '23:00', 3.4, 5.8, { size: 100, rot: 2 });
  card(s, 'Pero alguien\nbusca turno.', 6.4, 9.3, { rot: -1.5, y: s.safe.top + 150 });
}

function reserva(s) {
  s.camera([]);
  s.clip('assets/clips/reserva.mp4', { full: true, at: 0, enter: 'none', camera: false });
  card(s, 'Entonces entra a tu web.', 0.5, 3.8, { rot: 1.5 });
  card(s, 'Elige el jueves, 10 h.', 4.7, 7.7, { rot: -2 });
  card(s, 'Paga la seña.', 8.0, 10.6, { rot: 2 });
  card(s, 'Nadie la atendió.', 11.2, 13.2, { rot: -1.5 });
  card(s, 'Y quedó atendida.', 13.3, 14.9, { rot: 1.5 });
}

function dia(s) {
  s.camera([]);
  s.clip('assets/clips/dm_dia.mp4', { full: true, at: 0, enter: 'none', camera: false });
  card(s, 'A la mañana…', 1.0, 3.8, { rot: 2 });
  card(s, 'Agenda llena.', 6.6, 8.4, { rot: -2 });
  s.text('@solucionesdigitalesamedida', { x: s.cx, y: s.safe.top + 90, size: 46, font: 'body', color: 'ink', bg: '#F4EFE4', padding: 18, radius: 30, at: 10.9, enter: 'rise', sfx: false, camera: false });
}

export default { noche, reserva, dia };
