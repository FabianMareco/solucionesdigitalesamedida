"""«Horno encendido»: música original para el video de presentación de Soluciones Digitales a Medida.

Neo-soul, 90 BPM, 4/4, 18 compases. La música empieza a los 0,982 s del video, así:
- los compases 1–4 caen con las cuatro burbujas de la apertura (0,98 · 3,65 · 6,32 · 8,98 s);
- el compás 5 cae en 11,65 s, cuando aparece la web (el horno se enciende);
- el compás 17 (43,65 s) arranca el cierre y el 18 (46,32 s) es el acorde final.
Uso:  python componer.py   (escribe song.json al lado)
"""
import json, sys, pathlib
SKILL = pathlib.Path('/home/user/solucionesdigitalesamedida/.claude/skills/music-production/scripts')
sys.path.insert(0, str(SKILL))
from musiclib import blocks, expression  # noqa: E402

AQUI = pathlib.Path(__file__).parent
asoc = json.loads((AQUI / 'association.json').read_text())
BPB = 4  # beats por compás

title = 'Horno encendido'
project = {
    'schema': 'music-production/v1',
    'title': title,
    'version': '1.0.r1',
    'brief': ('Fondo instrumental de 47,5 s para un video de redes sin voz: neo-soul, energía media, cálido y moderno. '
              'Apertura tranquila bajo cuatro problemas en burbujas de chat; se enciende cuando aparece la web; '
              'acompaña el recorrido sin tapar textos ni efectos; levanta en el cierre.'),
    'clock': {'bars': 18, 'meter': [4, 4], 'tempo': [[0, 90]], 'tail_seconds': 4},
    'sections': [
        {'id': 'nublado', 'start_bar': 0, 'bars': 4, 'intent': 'Tarde nublada: teclado y colchón solos, una burbuja por compás'},
        {'id': 'horno', 'start_bar': 4, 'bars': 8, 'intent': 'Se enciende el horno: entra el groove y el gancho del punteo'},
        {'id': 'locomotora', 'start_bar': 12, 'bars': 4, 'intent': 'El recorrido sigue andando: el gancho sube una tercera'},
        {'id': 'cierre', 'start_bar': 16, 'bars': 2, 'intent': 'Cierre: un último giro y el acorde final que respira'},
    ],
    'style': {'primary': 'jazz/soul', 'borrow': {'rhythm': 'jazz/funk'}},
    'association': {
        'source': asoc.get('source', 'draw'), 'seed': asoc.get('seed'), 'words': asoc.get('words'),
        'whole': ('Una tarde nublada y sofocante en un taller de cerámica: una chica se ata la cola de caballo con un giro de '
                  'muñeca, saca ciruelas y alcauciles de la alacena, se sacude la pelusa del delantal y se encoge de hombros '
                  'ante el cielo gris; quiebra una ramita para encender el horno y, cuando el horno prende, una locomotora de '
                  'juguete arranca a dar vueltas sobre la mesa y no para hasta la noche.'),
        'gives': [
            {'level': 'form', 'what': 'nublado (sin batería) → el horno prende (todo entra de golpe) → la locomotora sigue → cierre', 'where': 'secciones'},
            {'level': 'rhythm', 'what': 'la locomotora: el bajo con un patrón de tren (corchea, silencio, dos semicorcheas) y el shaker continuo', 'where': 'bajo y batería, compases 5–17'},
            {'level': 'harmony', 'what': 'nublado en Fa menor (Fm9, Bbm9) que se abre a La bemol mayor cuando prende el horno', 'where': 'compases 1–5'},
            {'level': 'sounds', 'what': 'el horno: un soplido de ruido que crece y un golpe al encenderse; ciruela y alcaucil: un teclado de valija redondo y un punteo de madera', 'where': 'compás 4–5; teclado y punteo'},
            {'level': 'melody', 'what': 'el encogerse de hombros: el gancho termina cada vez en una nota que baja y queda suspendida', 'where': 'punteo, compases 5–16'},
        ],
    },
    'plan': {
        'identity': 'Un groove de neo-soul tibio que se enciende con la web: piano eléctrico de valija, bajo de tren y un punteo de madera que responde',
        'high_point': {'section': 'cierre', 'means': 'el gancho llega a su nota más alta (La bemol 5) sobre el acorde final abierto, con el colchón entero'},
        'sections': [
            {'section': 'nublado', 'sounds': ['keys', 'pad', 'bass', 'fx'], 'leads': 'keys'},
            {'section': 'horno', 'sounds': ['keys', 'bass', 'drums', 'lead', 'fx'], 'leads': 'lead', 'dynamics': 'louder',
             'differs': 'entra la batería y el gancho; la armonía pasa a La bemol mayor'},
            {'section': 'locomotora', 'sounds': ['keys', 'bass', 'drums', 'lead', 'pad'], 'leads': 'lead', 'register': {'lead': 'higher'},
             'differs': 'el gancho sube una tercera y vuelve el colchón'},
            {'section': 'cierre', 'sounds': ['keys', 'bass', 'drums', 'lead', 'pad'], 'leads': 'lead',
             'differs': 'una cadencia y el acorde final que queda sonando'},
        ],
    },
    'tracks': [],
    'mix': {'chain': 'bus', 'rules': 2, 'target_lufs': -16},
    'decisions': [],
}

chords = ['Fm9', 'Dbmaj9', 'Bbm9', 'Eb9sus4',
          'Abmaj9', 'Fm9', 'Dbmaj9', 'Eb9',
          'Abmaj9', 'Fm9', 'Dbmaj9', 'Eb9',
          'Ab6', [(0, 'Cm7'), (2, 'F7')], 'Bbm9', 'Eb9sus4',
          [(0, 'Dbmaj9'), (2, 'Eb9')], 'Ab6']
project['harmony'] = []
for i, c in enumerate(chords):
    for beat, sym in (c if isinstance(c, list) else [(0, c)]):
        project['harmony'].append({'bar': i + 1, 'beat': beat, 'symbol': sym})

s = blocks.seed(title)

def track(id_, name, role, engine, **kw):
    t = {'id': id_, 'name': name, 'role': role, 'engine': engine, 'notes': [], 'performance': {'notes': {}}, 'mix': {}}
    t.update(kw)
    project['tracks'].append(t)
    return t

def keep(result, lo_beat, hi_beat):
    result = dict(result)
    result['notes'] = [n for n in result['notes'] if lo_beat <= n['on'] < hi_beat]
    return result

# ---------- el punteo de madera (gancho) ----------
lead = track('lead', 'Punteo de madera (gancho)', 'melody', 'surge', surge={'preset': 'late_fall'}, range=[60, 84],
             mix={'level_dbfs': -19.5, 'pan': 0.12, 'reverb_db': -15, 'delay_db': -20, 'highpass': 180})
A = [(0.5, 75, .5), (1.0, 72, .5), (1.5, 75, .5), (2.5, 77, 1.0), (3.5, 75, .5)]   # Abmaj9: Mib Do Mib Fa Mib
B = [(0.0, 72, 1.0), (1.5, 68, .5), (2.0, 70, .5), (2.5, 72, 1.5)]                 # Fm9: Do Lab Sib Do
C = [(0.5, 77, .5), (1.0, 75, .5), (1.5, 72, .5), (2.0, 75, 1.0), (3.0, 72, .5)]   # Dbmaj9
D = [(0.0, 70, 1.5), (2.0, 67, .5), (2.5, 72, .5), (3.0, 70, 1.0)]                 # Eb13: el hombro que baja y queda
D2 = [(0.0, 70, 1.0), (1.5, 72, .5), (2.0, 75, 2.0)]                               # respuesta que sube a Mib
def put(phrase, bar, shift=0, vel=78):
    for on, p, d in phrase:
        lead['notes'].append({'id': f'lead_b{bar:03d}_{int(on*4):02d}', 'on': bar * BPB + on, 'duration': d, 'pitch': p + shift})
        lead['performance']['notes'][lead['notes'][-1]['id']] = {'velocity': vel, 'timing_ms': 0, 'gate': .9}
# compases 5–8 (índice 4–7): el gancho entero
for i, ph in enumerate([A, B, C, D]): put(ph, 4 + i, vel=80)
# compases 9–12: solo la primera mitad y la respuesta (deja aire a los textos)
put(A, 8, vel=72); put(B, 9, vel=70); put(D2, 11, vel=74)
# compases 13–16: una tercera arriba (Lab mayor: la tercera diatónica), más presente
UP = {68: 72, 70: 74, 72: 75, 75: 79, 77: 80, 67: 70}
def up(ph): return [(on, UP.get(p, p + 3), d) for on, p, d in ph]
for i, ph in enumerate([A, B]): put(up(ph), 12 + i, vel=84)
put([(0.5, 77, .5), (1.0, 79, .5), (1.5, 80, 1.5), (3.0, 79, .5), (3.5, 77, .5)], 14, vel=84)   # Bbm9
put([(0.0, 75, 1.5), (2.0, 70, .5), (2.5, 75, .5), (3.0, 77, 1.0)], 15, vel=80)                 # Eb9sus4
# cierre: cadencia y la nota más alta sobre el acorde final
put([(0.5, 77, .5), (1.0, 75, .5), (1.5, 77, .5), (2.0, 79, 1.0), (3.0, 75, .5), (3.5, 77, .5)], 16, vel=82)
put([(0.0, 80, 4.0)], 17, vel=86)

# ---------- bajo de tren ----------
bass = track('bass', 'Bajo de tren', 'bass', 'surge', surge={'preset': 'fingered_bass'}, range=[28, 52],
             mix={'level_dbfs': -23, 'pan': 0, 'reverb_db': None, 'highpass': 35})
line = blocks.bass(chords, [4, 4], seed=s, figure='pattern', pattern='x..xx.o.x..x.o..', complexity=.35, intensity=.55,
                   low=29, high=48, push='phrase', fills=.4, phrasing=1.0)
line_intro = blocks.bass(chords, [4, 4], seed=s, figure='root', complexity=.0, intensity=.38, low=29, high=48, push='none', fills=0.0)
blocks.add(bass, keep(line_intro, 2 * BPB, 4 * BPB), 'bi')
blocks.add(bass, keep(line, 4 * BPB, 18 * BPB), 'b')
project['decisions'].append('bass: patrón propio de tren (x..xx.o.x..x.o..) desde el compás 5; en la apertura solo la fundamental desde el compás 3')

# ---------- teclado de valija ----------
keys = track('keys', 'Piano eléctrico de valija', 'harmony', 'surge', surge={'preset': 'soft_suitcase'}, range=[50, 79],
             mix={'level_dbfs': -21, 'pan': -0.15, 'reverb_db': -16, 'highpass': 120})
held = blocks.accompaniment(chords, [4, 4], seed=s, figure='held', complexity=.4, intensity=.42, low=53, high=76, voices=4,
                            push='none', keep_root=False, bass=line['notes'])
comp = blocks.accompaniment(chords, [4, 4], seed=s, figure='syncopated', complexity=.45, intensity=.55, low=53, high=76,
                            voices=4, push='phrase', melody=lead['notes'], bass=line['notes'])
blocks.add(keys, keep(held, 0, 4 * BPB), 'kh')
blocks.add(keys, keep(comp, 4 * BPB, 17 * BPB), 'k')
blocks.add(keys, keep(held, 17 * BPB, 18 * BPB), 'kf')
project['decisions'].append('keys: acordes tenidos en la apertura y el final; sincopados que responden al gancho en el groove')

# ---------- colchón ----------
pad = track('pad', 'Colchón nublado', 'texture', 'surge', surge={'preset': 'moody_pad'}, range=[48, 76],
            mix={'level_dbfs': -28, 'pan': 0, 'reverb_db': -12, 'highpass': 150})
blocks.add(pad, keep(held, 0, 4 * BPB), 'pa')
blocks.add(pad, keep(held, 12 * BPB, 18 * BPB), 'pb')

# ---------- batería (escobillas, feel soul) ----------
drums = track('drums', 'Batería con escobillas', 'drums', 'soundfont', program=40, bank=128, drums=True,
              mix={'level_dbfs': -20, 'pan': 0, 'reverb_db': -18})
groove = blocks.drums(bars=18, meter=[4, 4], seed=s, sections=project['sections'], feel='soul', backbeat='normal',
                      kick='syncopated', pulse='eighth', cymbal='shaker', complexity={'nublado': .2, 'horno': .35, 'locomotora': .45, 'cierre': .35},
                      intensity={'nublado': .3, 'horno': .45, 'locomotora': .55, 'cierre': .5}, fills=.35, variation=.3)
g = keep(groove, 4 * BPB, 17 * BPB + 1)
g['notes'] = [n for n in g['notes'] if n['on'] < 17 * BPB or n['pitch'] in (36, 49)]   # en el acorde final: bombo y platillo
if not any(n['on'] == 17 * BPB and n['pitch'] == 49 for n in g['notes']):
    g['notes'].append({'on': 17 * BPB, 'duration': 1.0, 'pitch': 49, 'velocity': 70})
if not any(n['on'] == 4 * BPB and n['pitch'] == 49 for n in g['notes']):
    g['notes'].append({'on': 4 * BPB, 'duration': 1.0, 'pitch': 49, 'velocity': 76})   # el horno prende: platillo
blocks.add(drums, g, 'd')
project['decisions'].append(f"drums: feel soul con shaker; record {json.dumps(groove['record'].get('typical'), ensure_ascii=False)}")

# ---------- el horno: soplido que crece y golpe ----------
fx = track('fx', 'Horno (soplido y golpe)', 'effect', 'noise', range=[48, 72],
           mix={'level_dbfs': -26, 'pan': 0, 'reverb_db': -14, 'highpass': 200})
fx['notes'] = [{'id': 'fx_rise', 'on': 3 * BPB, 'duration': 4.0, 'pitch': 60, 'articulation': 'rise'},
               {'id': 'fx_hit', 'on': 4 * BPB, 'duration': 2.0, 'pitch': 48, 'articulation': 'impact'}]
fx['performance']['notes'] = {'fx_rise': {'velocity': 70, 'timing_ms': 0, 'gate': 1}, 'fx_hit': {'velocity': 90, 'timing_ms': 0, 'gate': 1}}

project['decisions'] += [
    'vertical: las suspensiones 4-3 del colchón (Fa sobre Do menor, Sib sobre Fa7) son buscadas: resuelven en el mismo compás bajo el gancho',
    'stiffness:pad: el colchón es nublado a propósito: acordes tenidos en bloque, sin ritmo propio, debajo del teclado que sí se mueve',
    'outside_chord.accompaniment: el Fa del colchón sobre Do menor es la suspensión 4-3 de la figura held',
]
expression.apply(project, {'fx': None}, seed=s, drift='time')
(AQUI / 'song.json').write_text(json.dumps(project, ensure_ascii=False, indent=1))
print('song.json:', sum(len(t['notes']) for t in project['tracks']), 'notas en', len(project['tracks']), 'partes')
