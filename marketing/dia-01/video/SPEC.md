# SPEC — Día 1 · «Antes y ahora» (storyline C, elegida por Fabián)

GOAL:    un dueño de negocio se ve en la mitad de arriba (23 h contestando WhatsApp), quiere la de abajo
         (su agenda atiende mientras descansa) y escribe a @solucionesdigitalesamedida.
OUTPUT:  HyperFrames, 1080 × 1920, 30 fps, sin voz en off (decisión de Fabián: para leer).
TIME:    27 s × 30 = 810 cuadros. Sin música en el render (no hay fuente sin cuenta de HeyGen): se suma en la app.
LOOK:    el medio es la miniatura de Diorama Worlds (acabado miniature) recortada sobre bloques planos de color de la marca.
         Arriba «Antes»: suelo #2b0d14 (casi negro granate, de #280000), tinta #fdffff.
         Abajo «Ahora»: suelo #f9e7dc (salmón muy claro, de #de7c5a al 15 %), tinta #570000.
         Acento #b10f2e: una palabra por plano (la hora, «descansás», el cierre entero).
         Display: Big Shoulders Display 800, mayúsculas, 104 px (5,4 % del alto), interlínea 0,92, tracking 0.
         Texto: Hanken Grotesk 500/700, 34–40 px. Nada legible por debajo de 28 px.
         Sombra de tarjetas: 0 18px 40px rgba(40,0,0,.18). Sin grano, sin viñeta.
OBJECTS: la dueña (misma remera salmón y pantalón oscuro en las dos escenas); de noche: mesa, velador, reloj en 23:14,
         ventana con luna, celular encendido en la mano; de día: reposera, sombrilla carmesí y crema, pileta, cóctel con
         rodaja de naranja, celular en la mesita que se ilumina.
         Burbujas de chat (blancas, cola abajo a la izquierda) con mensajes de clientas.
         Notificaciones de la agenda: tarjeta blanca de 28 px de radio, ícono carmesí con un calendario, «Agenda · ahora»,
         título en negrita y una línea. Nombres y horarios de ejemplo; sin montos.
MOTION:  llegada expo.out / power4.out 0,5–0,7 s; salida 40–50 % más corta, power3.in; cámara y colapso power2.inOut;
         título por palabra: blur 6px→0 y opacidad 0→1 en 0,13 s, 0,067 s entre palabras, sin desplazamiento;
         tarjetas: entran desde y −40 px con resorte back.out(1.3) solo en posición; burbujas: escala 0,85→1 back.out(1.4),
         60 ms de desfase; reloj: rueda tipo tragamonedas 0,1 s por número. Títulos quietos una vez que llegan.
SHOTS:
  0–90     (0–3 s)    Pantalla partida ya armada en el cuadro 0 (miniatura). Arriba «SON LAS 23:14.» + «Y SEGUÍS CONTESTANDO
                      WHATSAPP.»; burbujas 1,2 s / 1,8 s / 2,4 s. Abajo la escena de día, quieta de texto.
  90–255   (3–8,5 s)  Abajo: «MIENTRAS TANTO, TU AGENDA:» y llegan tres notificaciones (4,0 / 5,6 / 7,2 s); arriba
                      sigue tipeando. Se lee: el contraste entre las dos mitades.
  255–378  (8,5–12,6) Arriba el reloj rueda 23:14 → 23:41 y llegan dos burbujas más; sobre la división:
                      «MISMO NEGOCIO.» / «DISTINTA NOCHE.»
  378–402  (12,6–13,4) Colapso: la mitad de arriba sale hacia arriba (0,6 s power3.in, blur 12 px); la de abajo sube y
                      ocupa toda la pantalla (0,8 s power2.inOut), la miniatura crece 0,9→1,15.
  402–630  (13,4–21)  Pantalla completa «Ahora»: «TU AGENDA RESERVA, COBRA LA SEÑA Y AVISA SOLA.»; dos notificaciones
                      más; a los 17 s el título cambia a «TU NEGOCIO ATIENDE. VOS DESCANSÁS.» (descansás en carmesí).
  630–810  (21–27 s)  Cierre: la última notificación crece hasta llenar la pantalla de carmesí (0,65 s power2.inOut);
                      entra la marca «</>», «CONTAME QUÉ TE QUITA EL TIEMPO.», la píldora @solucionesdigitalesamedida
                      y «WhatsApp en el link de la bio». Se sostiene 3 s quieto.
BANNED:  los de spec.md, y además: mencionar precios o montos; prometer números; emoji (no hay fuente de emoji en el
         render); un logo pegado en una esquina; que la dueña aparezca en una escena y no en la otra.
QA:      cuadro 0 (portada legible), 2,5 s (tres burbujas), 7,4 s (tres notificaciones), 10 s (división con el título),
         13,0 s (en pleno colapso), 15,5 s, 18,5 s (título final), 21,4 s (relleno carmesí), 26 s (cierre quieto).
         Todo texto entre 168 y 1330 px de alto y fuera de los 140 px de la derecha.
