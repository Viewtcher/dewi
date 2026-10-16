# -*- coding: utf-8 -*-
"""Version 147: Artikel wieder aus den deutschen Glossen entfernen (Gegenstück zu data/artikel.py, Version 116).
   Entfernt wird nur „der/die/das + ein einzelnes großgeschriebenes Wort“: „der Nachbar“ → „Nachbar“.
   Unverändert bleiben Pronomen und feste Wendungen wie „das dort“ (that), „das hier“ (this), „Die Rechnung bitte“, „eine Million“.
   Doppelte Varianten nach dem Entfernen fallen weg („Freund / Freundin / die Freundin“ → „Freund / Freundin“).
   Aufruf im Hauptordner: python data/strip_artikel.py, danach make_en.py, make_de.py und data/align/emit.py."""
import re,glob
ART=re.compile(r'^(?:der|die|das) ([A-ZÄÖÜ][^\s]*)$')
changed=0
for f in sorted(glob.glob('data/en/[0-9]*.txt')):
    out=[]
    for l in open(f,encoding='utf-8').read().split('\n'):
        s=l.strip()
        if not s or s.startswith('#') or '|' not in s or '=' not in s.split('|')[0]:
            out.append(l);continue
        p=l.split('|')
        en,de=p[0].split('=',1)
        gl=[]
        for g in [x.strip() for x in de.split('/')]:
            m=ART.match(g)
            if m:g=m.group(1)
            if g not in gl:gl.append(g)
        nd=' / '.join(gl)
        if nd!=de.strip():changed+=1
        p[0]=en.rstrip()+' = '+nd+' '
        out.append('|'.join(p))
    open(f,'w',encoding='utf-8').write('\n'.join(out))
print(changed,'Zeilen ohne Artikel')
