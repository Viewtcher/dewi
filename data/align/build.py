# -*- coding: utf-8 -*-
"""Wort-zu-Wort-Zuordnung für alle Satzpaare erzeugen (Version 118).
   Ergebnis: data/align/align.txt  (Schlüssel | Gruppen Satz A | Gruppen Satz B | ok/offen)
   Gruppen: gleiche Zahl = einander entsprechende Wörter, 0 = keine Entsprechung.
   Geprüft wird streng: bleibt ein Wort ohne Entsprechung, das keines der erlaubten Füllwörter ist,
   gilt das Paar als offen und wird in der App nicht für Markierungen verwendet."""
import re,json,glob,sys,unicodedata
sys.path.insert(0,'data/align')
from lex import EN_DE,ID_EN,ID_DE

TOK=re.compile(r'[^\s.,!?;:"“”„]+')
def toks(s):return TOK.findall(s)
def fold(s):
    s=s.lower().replace('ä','ae').replace('ö','oe').replace('ü','ue').replace('ß','ss')
    s=unicodedata.normalize('NFD',s)
    s=''.join(c for c in s if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]','',s)

# ---- Vokabeln der Kurse als Wörterbuch
def vocab():
    en_de={};id_en={};id_de={}
    for f in sorted(glob.glob('data/en/[0-9]*.txt')):
        for l in open(f,encoding='utf-8'):
            l=l.strip()
            if not l or l.startswith('##'):continue
            p=[x.strip() for x in l.split('|')]
            w,de=[x.strip() for x in p[0].split('=',1)]
            for g in de.split('/'):
                g=g.strip()
                en_de.setdefault(w,set()).add(g)
                g2=re.sub(r'^(der|die|das|ein|eine)\s+','',g)
                if g2!=g:en_de.setdefault(w,set()).add(g2)
    src=open('app.src.html',encoding='utf-8').read()
    def block(n):
        i=src.index('const '+n+'=`');j=src.index('`;',i);return src[i+len('const '+n+'=`'):j]
    cur=None
    for m in re.finditer(r'^([a-zA-Zà-ÿ\' ]+) = (.+)$',src[src.index("const LANGS={id:"):src.index('/*@include lang_en.js*/')],re.M):
        id_en.setdefault(m.group(1).strip(),set()).update(x.strip() for x in m.group(2).split('/'))
    for l in block('DE_RAW').split('\n'):
        q=[x.strip() for x in l.split(' | ')]
        if len(q)<2:continue
        id_de.setdefault(q[0],set()).update(x.strip() for x in q[1].split('/'))
    return en_de,id_en,id_de
EN_DE_V,ID_EN_V,ID_DE_V=vocab()

STRIP=('to','a','an','the','der','die','das','ein','eine','einen','einem','einer')
def mklex(voc,extra):
    L={}
    def put(k,o):
        if k and o:L.setdefault(k,set()).add(o)
    def add(a,b):
        ka=[fold(x) for x in toks(a) if fold(x)]
        ob=[fold(x) for x in toks(b) if fold(x)]
        if not ka or not ob:return
        kas=[ka]+([ka[1:]] if len(ka)>1 and ka[0] in STRIP else [])
        obs=[ob]+([ob[1:]] if len(ob)>1 and ob[0] in STRIP else [])
        for k in kas:
            for o in obs:put(''.join(k),tuple(o))
    for a,bs in voc.items():
        for b in bs:add(a,b)
    for a,bs in extra.items():
        for b in bs.split(' '):add(a,b)
    return L
LEX={'en|de':mklex(EN_DE_V,EN_DE),'id|en':mklex(ID_EN_V,ID_EN),'id|de':mklex(ID_DE_V,ID_DE)}
# Rückrichtung
def invert(L):
    R={}
    for a,bs in L.items():
        for b in bs:
            if len(b)==1:R.setdefault(b[0],set()).add((a,))
    return R
REV={k:invert(v) for k,v in LEX.items()}

def stems(n,lang):
    o={n}
    if lang=='de':
        for sf in ('en','er','es','em','e','n','s','t','st','te','ten','et'):
            if len(n)>len(sf)+2 and n.endswith(sf):o.add(n[:-len(sf)])
        if n.startswith('ge') and len(n)>5:o.add(n[2:]);o.add(n[2:].rstrip('t'))
        for x in list(o):          # Umlaut zurücknehmen: traegt → tragt → trag
            y=x.replace('ae','a').replace('oe','o').replace('ue','u')
            if y!=x:o.add(y)
        for x in list(o):
            if len(x)>4:o.add(x[:-1])
    elif lang=='en':
        for sf in ('ies','es','ed','ing','s'):
            if len(n)>len(sf)+2 and n.endswith(sf):o.add(n[:-len(sf)])
        if n.endswith('ies'):o.add(n[:-3]+'y')
    else:
        for sf in ('nya','kan','an','i','lah','ku','mu'):
            if len(n)>len(sf)+2 and n.endswith(sf):o.add(n[:-len(sf)])
        for pre in ('meng','meny','mem','men','me','ber','ter','di','per','ke','se'):
            if n.startswith(pre) and len(n)>len(pre)+2:o.add(n[len(pre):])
    return o

def match(aspan,bspan,pair,la,lb):
    L=LEX[pair];R=REV[pair]
    ka=fold(' '.join(aspan));kb=tuple(fold(x) for x in bspan)
    if ka in L and kb in L[ka]:return 3
    if len(aspan)==1 and len(bspan)==1:
        fa,fb=fold(aspan[0]),fold(bspan[0])
        if fa==fb and len(fa)>2:return 3
        sb=stems(fb,lb)
        for sa in stems(fa,la):
            if sa in L:
                for opt in L[sa]:
                    if len(opt)==1 and (stems(opt[0],lb)&sb):return 2
        for x in sb:
            if x in R:
                for opt in R[x]:
                    if len(opt)==1 and (stems(opt[0],la)&stems(fa,la)):return 2
    return 0

def align(A,B,pair,la,lb):
    """Gierige Zuordnung: erst die sichersten Treffer, Ueberkreuzungen erlaubt.
       Danach duerfen uebrige Woerter an eine bereits gefundene Gruppe andocken
       (deutsche Hilfsverben: "habe ... gekauft" gehoert beides zu "beli")."""
    n,m=len(A),len(B)
    cand=[]
    for i in range(n):
        for a in range(1,min(3,n-i)+1):
            for j in range(m):
                for b in range(1,min(3,m-j)+1):
                    sc=match(A[i:i+a],B[j:j+b],pair,la,lb)
                    if sc:cand.append((sc,a+b,i,a,j,b))
    cand.sort(key=lambda x:(-x[0],-x[1],x[2],x[4]))
    ga=[0]*n;gb=[0]*m;g=0;spans=[]
    for sc,ln,i,a,j,b in cand:
        if any(ga[k] for k in range(i,i+a)) or any(gb[k] for k in range(j,j+b)):continue
        g+=1
        for k in range(i,i+a):ga[k]=g
        for k in range(j,j+b):gb[k]=g
        spans.append((g,A[i:i+a],B[j:j+b]))
    for g0,sa,sb in spans:
        for j in range(m):
            if not gb[j] and match(sa,[B[j]],pair,la,lb):gb[j]=g0
        for i in range(n):
            if not ga[i] and match([A[i]],sb,pair,la,lb):ga[i]=g0
    return ga,gb

# Woerter, die in der anderen Sprache schlicht fehlen: Artikel, Hilfsverben, Partikeln
FILL={'en':set('a an the to of do does did is are am was were be been being s it there'.split()),
      'de':set('der die das den dem des ein eine einen einem einer eines zu sich es man ist sind bin bist war waren habe hat haben hatte hatten wird werde werden sei da'.split()),
      'id':set('yang nya lah pun kah adalah ada itu ini di dengan untuk pada se buah orang'.split())}
def verified(A,B,ga,gb,la,lb):
    for t,g in zip(A,ga):
        if g==0 and fold(t) not in {fold(x) for x in FILL[la]}:return False
    for t,g in zip(B,gb):
        if g==0 and fold(t) not in {fold(x) for x in FILL[lb]}:return False
    return True

pairs=json.load(open('data/align/pairs.json',encoding='utf-8'))
out=[];ok=0
for course,key,la,ta,lb,tb in pairs:
    A,B=toks(ta),toks(tb)
    ga,gb=align(A,B,la+'|'+lb,la,lb)
    v=verified(A,B,ga,gb,la,lb)
    ok+=v
    out.append('%s:%s:%s | %s | %s | %s'%(course,key,lb,' '.join(map(str,ga)),' '.join(map(str,gb)),'ok' if v else 'offen'))
open('data/align/align.txt','w',encoding='utf-8').write('\n'.join(out)+'\n')
print(len(pairs),'Paare,',ok,'geprüft (%.0f%%)'%(100*ok/len(pairs)))
