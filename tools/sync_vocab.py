#!/usr/bin/env python3
"""Copy Jacob's Spanish words from Anki (AnkiConnect on :8765) into vocab.json, by topic.
Run: python3 tools/sync_vocab.py   (Anki must be open)"""
import json, re, urllib.request, pathlib, html
def ac(action, **p):
    r = json.loads(urllib.request.urlopen(urllib.request.Request('http://127.0.0.1:8765', json.dumps({'action': action, 'version': 6, 'params': p}).encode()), timeout=60).read())
    if r['error']: raise SystemExit(r['error'])
    return r['result']
def clean(s): return html.unescape(re.sub(r'<[^>]+>', ' ', s or '')).replace('\xa0', ' ').strip()
TOPS = {'Spanish::Vocabulario': 'Natural', 'Spanish::Legal': 'Legal', 'Spanish::Claude Corrections': 'Correcciones'}
out = []
for deck, top in TOPS.items():
    notes = ac('notesInfo', notes=ac('findNotes', query=f'deck:"{deck}"'))
    cards = {c['cardId']: c['deckName'] for c in ac('cardsInfo', cards=[c for n in notes for c in n['cards']])}
    for n in notes:
        d = cards[n['cards'][0]]
        parts = d.split('::')
        tema = re.sub(r'^\d\d\s+', '', parts[2]) if top != 'Correcciones' and len(parts) > 2 else ('Mis correcciones' if top == 'Correcciones' else 'Nuevas')
        front = n['fields']['Front']['value']
        es, _, note = front.partition('<br>')
        item = {'es': clean(es), 'en': clean(n['fields']['Back']['value']), 'top': top, 'tema': tema, 'orden': d}
        if clean(note): item['ej'] = clean(note)
        out.append(item)
out.sort(key=lambda x: (list(TOPS.values()).index(x['top']), x['orden'], x['es'].lower()))
for x in out: x.pop('orden')
p = pathlib.Path(__file__).resolve().parent.parent / 'vocab.json'
p.write_text(json.dumps(out, ensure_ascii=False, indent=0) + '\n', encoding='utf-8')
from collections import Counter
print(len(out), 'words →', p); print(Counter((x['top'], x['tema']) for x in out))
