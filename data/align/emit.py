# -*- coding: utf-8 -*-
"""align.js aus data/align/align.txt erzeugen (nur geprüfte Paare).
   Schlüssel: <Wortschlüssel der App>:<Sprache der Übersetzung>
   Wert: Gruppen des Satzes der Lernsprache | Gruppen der Übersetzung"""
import re,glob
# Deutsch-Kurs: englisches Wort -> deutsche Hauptglosse (wie make_de.py)
ende={}
seen=set()
for f in sorted(glob.glob('data/en/[0-9]*.txt')):
    for l in open(f,encoding='utf-8'):
        l=l.strip()
        if not l or l.startswith('##'):continue
        p=[x.strip() for x in l.split('|')]
        en,de=[x.strip() for x in p[0].split('=',1)]
        g=de.split('/')[0].strip()
        if g.lower() in seen:continue
        seen.add(g.lower());ende[en]=g
out=[]
for line in open('data/align/align.txt',encoding='utf-8'):
    q=[x.strip() for x in line.split('|')]
    if len(q)<4 or q[3]!='ok':continue
    course,key,other=q[0].split(':',2)
    a,b=q[1],q[2]
    if course=='id':
        out.append(key.lower()+':'+other+'|'+a+'|'+b)
    else:                      # en-Kurs: a=englischer Satz, b=deutscher Satz
        out.append('en:'+key.lower()+':de|'+a+'|'+b)
        if key in ende:        # Deutsch-Kurs: gleiche Daten, Seiten getauscht
            out.append('de:'+ende[key].lower()+':en|'+b+'|'+a)
js="/* Wort-zu-Wort-Zuordnung der Beispielsätze (erzeugt von data/align/emit.py).\n"
js+="   Gleiche Zahl = einander entsprechende Wörter, 0 = keine Entsprechung.\n"
js+="   Nur geprüfte Satzpaare stehen hier; alles andere wird in der App nicht markiert. */\n"
js+="const ALIGN_RAW=`\n"+"\n".join(out)+"\n`;\n"
open('align.js','w',encoding='utf-8').write(js)
print(len(out),'Einträge,',len(js)//1024,'KB')
