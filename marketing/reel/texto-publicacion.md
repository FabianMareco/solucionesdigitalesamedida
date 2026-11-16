# Reel «El pedido llega»

Video: `salida/reel-pedido-llega.mp4` (1080 × 1920, 21,5 s, sin audio: elegí la música desde Instagram).

## Texto para la publicación

¿Se te va el día contestando el WhatsApp? 📱

Turnos, pedidos, precios, «¿estás abierto?»… y mientras tanto el negocio espera.

Armo herramientas web a la medida de tu negocio: agendas con seña, catálogos que mandan el pedido armado al WhatsApp, generadores de flyers con tu marca. Para que el pedido llegue solo y vos te dediques a atender.

Contame qué te pasa y lo vemos juntos, sin palabras técnicas. Te respondo en el día 👉 link en la bio.

#emprendedores #comerciodebarrio #pymesargentinas #desarrolloweb #negociosdigitales #buenosaires #whatsappbusiness #transformaciondigital

## Para la historia (versión corta)

¿Se te va el día en el WhatsApp? Que el pedido llegue solo. Contame qué te pasa 👉 (sumar el sticker de enlace a la web)

## Cómo se hizo

- Escena: skill Diorama Worlds (educlopez/diorama, MIT), acabado miniatura. Fuente: `almacen.js`.
- `node .claude/skills/diorama-worlds/scripts/build-world.mjs marketing/reel/almacen.js marketing/reel/build/almacen.html`
- `node marketing/reel/grabar.js marketing/reel/build/almacen.html marketing/reel/build/frames` (180 cuadros, 30 fps, reloj fijo)
- `node marketing/reel/render_textos.js` (placas de texto) y luego ffmpeg (ver el commit).
