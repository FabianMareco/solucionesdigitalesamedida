// Cámara: t (s), (x, y) centro de la composición en unidades de papel, z zoom, r rolido (grados), f peso de seguimiento a la plumilla.
// fitH: zoom pensado para el alto de 1920 px; en 4:5 se escala con el alto del cuadro (la revelación tiene que entrar entera).
export const CAM = [
  { t: 0.0, x: -380, y: -1820, z: 1.15, r: -3, f: .85 },        // la línea entra corriendo
  { t: 3.4, x: -140, y: -1360, z: 1.25, r: 0, f: .5 },
  { t: 5.4, x: 10, y: -1190, z: 1.45, r: 0, f: .15 },           // el nudo entero
  { t: 6.9, x: 10, y: -1210, z: 1.8, r: 0, f: 0 },              // se frena: acercamiento
  { t: 9.4, x: 10, y: -1235, z: 2.7, r: 0, f: 0 },              // silencio, acercamiento lento a la mancha
  { t: 10.4, x: 0, y: -880, z: 1.45, r: 0, f: .3 },             // la punta baja al mostrador
  { t: 13.7, x: 20, y: -820, z: 1.5, r: 0, f: .2 },
  { t: 14.5, x: 0, y: -110, z: 1.5, r: 0, f: .35 },             // agenda
  { t: 18.7, x: 0, y: -95, z: 1.55, r: 0, f: .15 },
  { t: 19.6, x: -40, y: 690, z: 1.28, r: 0, f: .35 },           // oferta → flyer
  { t: 23.7, x: -40, y: 705, z: 1.3, r: 0, f: .15 },
  { t: 24.6, x: 0, y: 1520, z: 1.4, r: 2, f: .3 },              // web
  { t: 28.9, x: 0, y: 1530, z: 1.45, r: 0, f: .1 },
  { t: 29.6, x: 0, y: 1550, z: 1.45, r: 0, f: 0 },              // respiro
  { t: 32.6, x: 140, y: 0, z: 0.5, r: 0, f: 0, fitH: true },    // revelación: todo era una sola línea
  { t: 34.0, x: 140, y: 0, z: 0.5, r: 0, f: 0, fitH: true },
  { t: 35.2, x: 450, y: 1760, z: 0.95, r: 0, f: 0 },            // cierre: el tramo carmesí sale del papel
  { t: 38.0, x: 470, y: 1765, z: 0.95, r: 0, f: 0 },
];
