# REVIEW — Día 1 · «Antes y ahora»

Render: `marketing/dia-01/salida/dia-01-antes-y-ahora.mp4` · 1080 × 1920 · 30 fps · 27 s · H.264 · 3,5 MB · sin audio.

## Decisiones creativas
- Storyline C (elegida por Fabián entre tres propuestas basadas en su idea; A «Mientras dormías» y B «El cóctel» quedaron
  sin construir, ver la conversación del 16/11).
- Sin voz en off: el texto en pantalla carga la historia (acordado con Fabián). Textos con viral-hooks, storytelling,
  dumbify y voice-dna (voseo, frases cortas, sin precios ni promesas).
- Personajes y lugares hechos con Diorama Worlds (acabado miniatura) porque no hay filmación: la misma persona en las dos
  escenas. Recortados del fondo blanco y puestos sobre los colores de la marca.
- Notificaciones de ejemplo (nombres y horarios inventados, sin montos), con los estados reales del sistema de turnos.

## Qué se midió y qué solo se miró
- `hyperframes check`: ok, sin errores. Diorama `look-world`: las dos escenas pasan todo (contactos de manos con el
  teléfono y la copa, loop sin salto, velocidad real).
- Miré: cuadros de QA del SPEC, las tres hojas de `snapshot --review` (incluida la de celular a 360 px) y cuadros del
  MP4 final. Todo texto se lee a 360 px.
- Nadie escuchó nada: no hay sonido.

## Arreglado en la revisión
- P0 · 21,0–21,8 s · la historia tapaba al cierre y el relleno carmesí aparecía de golpe → z-index del cierre sobre la
  historia; ahora la última notificación crece hasta llenar la pantalla.
- P0 · 0–12 s · la escena de noche quedaba tapada por el título y las burbujas → mitad superior más alta, habitación a la
  derecha, burbujas a la izquierda.
- P1 · burbujas sobre «Mismo negocio.» → entran antes y se van a los 9,1 s.
- P1 · todo el texto dentro de las zonas seguras de TikTok, Reels y Shorts (y 288–1248, x 120–888/780).

## Avisos que quedan a propósito
- `film_silent`: la música se elige en Instagram/TikTok al publicar (sin cuenta de HeyGen no hay catálogo de música).
- `outside_safe_zone` ×2: solo durante el colapso (12,6–13,4 s), cuando la mitad de arriba sale de cuadro.

## El plano más débil y qué cambiaría con más tiempo
- 13,4–17 s: la pantalla completa «Ahora» es la parte más quieta; con más tiempo, un acercamiento lento a la reposera
  cuando llega cada notificación, o el celular de la mesita en primer plano.
- La tarjeta de la notificación se vuelve carmesí apenas empieza el cierre (0,1 s antes de crecer): detalle menor.
