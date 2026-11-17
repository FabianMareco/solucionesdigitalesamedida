"""Dos demos para elegir, con la misma forma y los mismos tiempos que «Horno encendido» (90 BPM, 18 compases,
empieza a los 0,982 s del video; compás 5 = aparece la web; compás 18 = acorde final).
Uso:  python variante.py taller   |   python variante.py tren     (escribe musica-<nombre>/song.json)
"""
import json, sys, pathlib
SKILL = pathlib.Path('/home/user/solucionesdigitalesamedida/.claude/skills/music-production/scripts')
sys.path.insert(0, str(SKILL))
from musiclib import blocks, expression  # noqa: E402

NOMBRE = sys.argv[1]
AQUI = pathlib.Path(__file__).parent / f'musica-{NOMBRE}'
asoc = json.loads((AQUI / 'association.json').read_text())
BPB = 4

CFG = {
    'taller': {
        'title': 'Taller en marcha',
        'style': {'primary': 'pop/uptempo', 'borrow': {'rhythm': 'jazz/funk'}},
        'whole': ('Un taller frente al río a la hora de la siesta: alguien lija una tabla de arce con papel de lija, '
                  'un geco se desliza por la pared mate, una hamaca se mece, se oye la bocina del ferry que cruza, '
                  'hay aceitunas en un plato, un bordado a medio hacer y el cierre de una mochila que se abre para salir.'),
        'gives': [
            {'level': 'rhythm', 'what': 'la lija: el shaker en semicorcheas que no para; la hamaca: un leve swing', 'where': 'batería, compases 5–17'},
            {'level': 'sounds', 'what': 'el arce: marimba de madera para el gancho y guitarra criolla; el ferry: el bajo largo de la apertura', 'where': 'todas las partes'},
            {'level': 'melody', 'what': 'el geco que se desliza: notas de adorno que suben a la nota principal', 'where': 'marimba'},
        ],
        'chords': ['Fm7', 'Dbmaj7', 'Bbm7', 'Eb7sus4',
                   'Ab', 'Fm7', 'Dbadd9', 'Eb', 'Ab', 'Fm7', 'Dbadd9', 'Eb',
                   'Ab', [(0, 'Cm7'), (2, 'F7')], 'Bbm7', 'Eb7sus4',
                   [(0, 'Dbadd9'), (2, 'Eb')], 'Ab'],
        'lead': {'engine': 'soundfont', 'program': 12, 'name': 'Marimba (gancho)'},
        'keys': {'engine': 'soundfont', 'program': 24, 'name': 'Guitarra criolla', 'figure': 'strum', 'intro': 'broken'},
        'bass': {'engine': 'soundfont', 'program': 32, 'name': 'Contrabajo'},
        'pad': None,
        'drums': {'program': 0, 'backbeat_sound': 'clap', 'cymbal': 'shaker', 'feel': 'soul', 'pulse': 'sixteenth', 'kick': 'syncopated'},
        'swing': {'ratio': 0.56, 'unit': 0.25},
    },
    'tren': {
        'title': 'Tren de la tarde',
        'style': 'pop/uptempo',
        'whole': ('Un supermercado magenta sobre una loma, a la tarde: en el porche alguien con overol clava un aviso con una '
                  'chinche, la cámara hace clic, los carámbanos del techo gotean como una llovizna, una cinta de correr '
                  'zumba al fondo, se oye el traqueteo de los changuitos y una media perdida espera en el escalón.'),
        'gives': [
            {'level': 'rhythm', 'what': 'la cinta de correr: el bombo parejo en negras; el clic de la cámara: la palma en 2 y 4', 'where': 'batería, compases 5–17'},
            {'level': 'sounds', 'what': 'la chinche y los carámbanos: el gancho en glockenspiel, corto y brillante; piano de cola para los acordes', 'where': 'gancho y piano'},
            {'level': 'form', 'what': 'el traqueteo de los changuitos: un redoble que entra a cada sección', 'where': 'batería, finales de sección'},
        ],
        'chords': ['Fm', 'Dbadd9', 'Ab', 'Eb',
                   'Ab', 'Eb', 'Fm7', 'Dbadd9', 'Ab', 'Eb', 'Fm7', 'Dbadd9',
                   'Ab', 'Eb', 'Fm7', [(0, 'Dbadd9'), (2, 'Eb')],
                   [(0, 'Dbadd9'), (2, 'Eb')], 'Ab'],
        'lead': {'engine': 'soundfont', 'program': 9, 'name': 'Glockenspiel (gancho)'},
        'keys': {'engine': 'soundfont', 'program': 0, 'name': 'Piano', 'figure': 'syncopated', 'intro': 'held'},
        'bass': {'engine': 'surge', 'surge': {'preset': 'bass_1'}, 'name': 'Bajo'},
        'pad': {'engine': 'surge', 'surge': {'preset': 'bright_pad'}, 'name': 'Colchón brillante'},
        'drums': {'program': 0, 'backbeat_sound': 'clap', 'cymbal': 'closed_hat', 'feel': 'dance', 'pulse': 'eighth', 'kick': 'four_floor'},
        'swing': None,
    },
}[NOMBRE]

project = {
    'schema': 'music-production/v1', 'title': CFG['title'], 'version': '1.0.r1',
    'brief': 'Demo para elegir dirección: fondo instrumental de 47,5 s, energía media, misma forma y tiempos que «Horno encendido».',
    'clock': {'bars': 18, 'meter': [4, 4], 'tempo': [[0, 90]], 'tail_seconds': 4},
    'sections': [
        {'id': 'apertura', 'start_bar': 0, 'bars': 4, 'intent': 'Tranquila, una burbuja por compás'},
        {'id': 'web', 'start_bar': 4, 'bars': 8, 'intent': 'Aparece la web: entra el groove y el gancho'},
        {'id': 'recorrido', 'start_bar': 12, 'bars': 4, 'intent': 'El gancho sube'},
        {'id': 'cierre', 'start_bar': 16, 'bars': 2, 'intent': 'Cadencia y acorde final'},
    ],
    'style': CFG['style'],
    'association': {'source': asoc.get('source', 'draw'), 'seed': asoc.get('seed'), 'words': asoc.get('words'),
                    'whole': CFG['whole'], 'gives': CFG['gives']},
    'plan': {'identity': CFG['whole'][:120], 'high_point': {'section': 'cierre', 'means': 'la nota más alta del gancho sobre el acorde final'}},
    'tracks': [], 'mix': {'chain': 'bus', 'rules': 2, 'target_lufs': -16},
    'decisions': ['plan: demo para elegir dirección; el plan por sección queda para la versión elegida'],
}
chords = CFG['chords']
project['harmony'] = [{'bar': i + 1, 'beat': b, 'symbol': sym} for i, c in enumerate(chords) for b, sym in (c if isinstance(c, list) else [(0, c)])]
s = blocks.seed(CFG['title'])

def track(id_, name, role, engine, **kw):
    t = {'id': id_, 'name': name, 'role': role, 'engine': engine, 'notes': [], 'performance': {'notes': {}}, 'mix': {}}
    t.update(kw); project['tracks'].append(t); return t
def keep(r, lo, hi):
    r = dict(r); r['notes'] = [n for n in r['notes'] if lo <= n['on'] < hi]; return r
def inst(spec):
    return {k: v for k, v in spec.items() if k in ('engine', 'program', 'surge')}

# ---------- gancho ----------
lead = track('lead', CFG['lead']['name'], 'melody', range=[64, 96], mix={'level_dbfs': -19.5, 'pan': 0.12, 'reverb_db': -15, 'highpass': 200}, **inst(CFG['lead']))
def put(phrase, bar, vel=80, grace=False):
    for on, p, d in phrase:
        nid = f'lead_b{bar:03d}_{int(on*4):02d}'
        if grace and d >= 1.0 and on >= 0.25:
            gid = nid + 'g'
            lead['notes'].append({'id': gid, 'on': bar * BPB + on - 0.25, 'duration': 0.25, 'pitch': p - 2})
            lead['performance']['notes'][gid] = {'velocity': vel - 18, 'timing_ms': 0, 'gate': .8}
        lead['notes'].append({'id': nid, 'on': bar * BPB + on, 'duration': d, 'pitch': p})
        lead['performance']['notes'][nid] = {'velocity': vel, 'timing_ms': 0, 'gate': .85}
O = 12 if NOMBRE == 'tren' else 0          # el glockenspiel suena una octava arriba de lo escrito en la marimba
if NOMBRE == 'taller':
    A = [(0.5, 75, .5), (1.0, 72, .5), (1.5, 75, .5), (2.5, 77, 1.0), (3.5, 75, .5)]   # Ab
    B = [(0.0, 72, 1.0), (1.5, 68, .5), (2.0, 70, .5), (2.5, 72, 1.5)]                 # Fm7
    C = [(0.5, 77, .5), (1.0, 75, .5), (1.5, 72, .5), (2.0, 73, 1.0), (3.0, 72, .5)]   # Db
    D = [(0.0, 70, 1.5), (2.0, 67, .5), (2.5, 70, .5), (3.0, 70, 1.0)]                 # Eb
else:
    A = [(0.0, 72, 1.0), (1.0, 75, .5), (1.5, 77, .5), (2.0, 75, 1.0), (3.0, 72, 1.0)]  # Ab
    B = [(0.0, 70, 1.5), (1.5, 67, .5), (2.0, 70, 1.0), (3.0, 75, 1.0)]                # Eb
    C = [(0.0, 72, 1.0), (1.0, 68, .5), (1.5, 72, .5), (2.0, 77, 2.0)]                 # Fm7
    D = [(0.0, 77, 1.0), (1.0, 75, .5), (1.5, 72, .5), (2.0, 73, 1.0), (3.0, 72, 1.0)] # Db
g = NOMBRE == 'taller'
for i, ph in enumerate([A, B, C, D]): put([(o, p + O, d) for o, p, d in ph], 4 + i, 80, g)
put([(o, p + O, d) for o, p, d in A], 8, 72, g); put([(o, p + O, d) for o, p, d in B], 9, 70, g)
put([(o, p + O, d) for o, p, d in C], 10, 72, g); put([(o, p + O, d) for o, p, d in D], 11, 74, g)
up = lambda ph: [(o, p + (4 if p % 12 in (0, 8) else 3 if p % 12 in (5, 1, 10) else 5) + O, d) for o, p, d in ph]
put([(o, p + O, d) for o, p, d in A], 12, 84, g)
put([(o, p + O, d) for o, p, d in (B if NOMBRE == 'tren' else B)], 13, 82, g)
put([(o, p + O, d) for o, p, d in C], 14, 84, g)
put([(0.0, 75 + O, 1.5), (2.0, 72 + O, .5), (2.5, 75 + O, .5), (3.0, 77 + O, 1.0)], 15, 80, g)
put([(0.5, 77 + O, .5), (1.0, 75 + O, .5), (1.5, 77 + O, .5), (2.0, 79 + O, 1.0), (3.0, 75 + O, .5), (3.5, 77 + O, .5)], 16, 82, g)
put([(0.0, 80 + O, 4.0)], 17, 86)

# ---------- bajo ----------
bass = track('bass', CFG['bass']['name'], 'bass', range=[28, 52], mix={'level_dbfs': -23, 'pan': 0, 'reverb_db': None, 'highpass': 35}, **inst(CFG['bass']))
fig = dict(figure='pattern', pattern='x..xx.o.x..x.o..') if NOMBRE == 'taller' else dict(figure='kick')
line_intro = blocks.bass(chords, [4, 4], seed=s, figure='root', complexity=.0, intensity=.38, low=29, high=48, push='none', fills=0.0)

# ---------- batería ----------
dcfg = CFG['drums']
drums = track('drums', 'Batería', 'drums', 'soundfont', program=dcfg['program'], bank=128, drums=True, mix={'level_dbfs': -20, 'pan': 0, 'reverb_db': -18})
groove = blocks.drums(bars=18, meter=[4, 4], seed=s, sections=project['sections'], feel=dcfg['feel'], backbeat='normal',
                      kick=dcfg['kick'], pulse=dcfg['pulse'], cymbal=dcfg['cymbal'], backbeat_sound=dcfg['backbeat_sound'],
                      complexity={'apertura': .2, 'web': .35, 'recorrido': .45, 'cierre': .35},
                      intensity={'apertura': .3, 'web': .5, 'recorrido': .6, 'cierre': .55}, fills=.4, variation=.3)
gd = keep(groove, 4 * BPB, 17 * BPB + 1)
gd['notes'] = [n for n in gd['notes'] if n['on'] < 17 * BPB or n['pitch'] in (36, 49)]
for at in (4 * BPB, 17 * BPB):
    if not any(n['on'] == at and n['pitch'] == 49 for n in gd['notes']):
        gd['notes'].append({'on': at, 'duration': 1.0, 'pitch': 49, 'velocity': 76})
blocks.add(drums, gd, 'd')

if NOMBRE == 'taller':
    line = blocks.bass(chords, [4, 4], seed=s, complexity=.35, intensity=.55, low=29, high=48, push='phrase', fills=.4, phrasing=1.0, **fig)
else:
    line = blocks.bass(chords, [4, 4], seed=s, complexity=.35, intensity=.55, low=29, high=48, push='phrase', fills=.4, phrasing=1.0, kick=groove, **fig)
blocks.add(bass, keep(line_intro, 2 * BPB, 4 * BPB), 'bi')
blocks.add(bass, keep(line, 4 * BPB, 18 * BPB), 'b')

# ---------- acordes ----------
kc = CFG['keys']
keys = track('keys', kc['name'], 'rhythm' if kc['figure'] == 'strum' else 'harmony', range=[48, 79],
             mix={'level_dbfs': -22, 'pan': -0.15, 'reverb_db': -16, 'highpass': 110}, **inst(kc))
intro = blocks.accompaniment(chords, [4, 4], seed=s, figure=kc['intro'], complexity=.4, intensity=.42, low=52, high=74, voices=4,
                             push='none', bass=line['notes'])
comp = blocks.accompaniment(chords, [4, 4], seed=s, figure=kc['figure'], complexity=.5, intensity=.55, low=50, high=74,
                            voices=4, push='phrase', melody=lead['notes'], bass=line['notes'])
held = blocks.accompaniment(chords, [4, 4], seed=s, figure='held', complexity=.3, intensity=.5, low=50, high=74, voices=4,
                            push='none', bass=line['notes'])
blocks.add(keys, keep(intro, 0, 4 * BPB), 'ki')
blocks.add(keys, keep(comp, 4 * BPB, 17 * BPB), 'k')
blocks.add(keys, keep(held, 17 * BPB, 18 * BPB), 'kf')
if CFG['pad']:
    pad = track('pad', CFG['pad']['name'], 'texture', range=[48, 76], mix={'level_dbfs': -29, 'pan': 0, 'reverb_db': -12, 'highpass': 150}, **inst(CFG['pad']))
    blocks.add(pad, keep(held, 12 * BPB, 18 * BPB), 'p')

# ---------- el golpe cuando aparece la web ----------
fx = track('fx', 'Soplido y golpe', 'effect', 'noise', range=[48, 72], mix={'level_dbfs': -26, 'pan': 0, 'reverb_db': -14, 'highpass': 200})
fx['notes'] = [{'id': 'fx_rise', 'on': 3 * BPB, 'duration': 4.0, 'pitch': 60, 'articulation': 'rise'},
               {'id': 'fx_hit', 'on': 4 * BPB, 'duration': 2.0, 'pitch': 48, 'articulation': 'impact'}]
fx['performance']['notes'] = {'fx_rise': {'velocity': 70, 'timing_ms': 0, 'gate': 1}, 'fx_hit': {'velocity': 90, 'timing_ms': 0, 'gate': 1}}

over = {'fx': None}
if kc['figure'] == 'strum': over['keys'] = {'strum': True}
expression.apply(project, over, seed=s, drift='time')
if CFG['swing']:
    for t in project['tracks']:
        if t['id'] in ('drums', 'keys'): t['performance']['swing'] = CFG['swing']
(AQUI / 'song.json').write_text(json.dumps(project, ensure_ascii=False, indent=1))
print(NOMBRE, ':', sum(len(t['notes']) for t in project['tracks']), 'notas en', len(project['tracks']), 'partes')
