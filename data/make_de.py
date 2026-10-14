# -*- coding: utf-8 -*-
"""Deutsch-Kurs aus data/en/*.txt erzeugen (Version 117).
   Der Englisch-Kurs steht als „englisches Wort = deutsche Glosse | englischer Satz | [deutscher] Satz“ da.
   Für Deutsch als Lernsprache wird die Zeile umgedreht:
     deutsche Glosse = englisches Wort | deutscher Satz | englischer Satz mit [Klammer] um das englische Wort
   Die Klammer wird automatisch gesetzt; make_en.py prüft bereits, dass das englische Wort im Satz vorkommt."""
import re,glob,json

ART=re.compile(r'^(der|die|das|ein|eine)\s+',re.I)
cats=[];sent=[];seen=set();alts={};skipped=[]

def bracket(en_sent,word):
    m=re.search(r'(?<![A-Za-z])'+re.escape(word)+r'(?![A-Za-z])',en_sent,re.I)
    if not m:return None
    return en_sent[:m.start()]+'['+en_sent[m.start():m.end()]+']'+en_sent[m.end():]

for f in sorted(glob.glob('data/en/[0-9]*.txt')):
    for l in open(f,encoding='utf-8').read().split('\n'):
        l=l.strip()
        if not l:continue
        if l.startswith('## '):cats.append([l[3:],[]]);continue
        p=[x.strip() for x in l.split('|')]
        en,de=[x.strip() for x in p[0].split('=',1)]
        gl=[x.strip() for x in de.split('/')]
        word=gl[0]                       # Hauptform, z. B. „der Nachbar“
        key=word.lower()
        if key in seen:                  # gleiche deutsche Glosse zweimal (z. B. „gut“): nur die erste
            skipped.append((word,en));continue
        seen.add(key)
        a=[]
        for g in gl[1:]:                 # weitere Glossen als Schreibvarianten
            a.append(g)
            if ART.match(g):a.append(ART.sub('',g))
        if ART.match(word):a.append(ART.sub('',word))   # „Nachbar“ ohne Artikel zählt beim Tippen
        if a:alts[key]=sorted(set(a))
        cats[-1][1].append(word+' = '+en)
        gs=p[2].replace('[','').replace(']','').strip()     # deutscher Satz
        es=bracket(p[1],en)                                  # englischer Satz mit Klammer
        if es:sent.append(word+' | '+gs+' | '+es)

js="/* Deutsch-Kurs (erzeugt von data/make_de.py aus data/en/*.txt) */\n"
js+="LANGS.de={id:'de',name:'Deutsch',native:'Deutsch',code:'DE',kp:'de:',needsEn:true,alts:"+json.dumps(alts,ensure_ascii=False)+",cats:[\n"
js+=",\n".join("["+json.dumps(c,ensure_ascii=False)+",`\n"+"\n".join(ws)+"\n`]" for c,ws in cats)
js+="\n]};\nconst DE_SENT_RAW=`\n"+"\n".join(sent)+"\n`;\n"
assert '${' not in js and '\\' not in js
open('lang_de.js','w',encoding='utf-8').write(js)
print(len(seen),'Wörter',len(cats),'Kategorien',len(alts),'mit Varianten',len(sent),'Sätze')
if skipped:print('übersprungen (doppelte Glosse):',len(skipped),skipped[:12])
