import re,glob,json,sys
ALTS={'color':['colour'],'gray':['grey'],'apartment':['flat'],'holiday':['vacation'],'trousers':['pants'],'sweater':['jumper'],'television':['tv'],'phone':['mobile'],'luggage':['baggage'],'cookie':['biscuit'],'airport':[],'bill':['check'],'train':[],'neighbor':['neighbour'],'center':['centre'],'favorite':['favourite'],'theater':['theatre'],'bicycle':['bike'],'motorcycle':['motorbike'],'ice cream':['icecream'],'email':['e-mail'],'shop':['store'],'glasses':['spectacles'],'sneakers':['trainers'],'zero':['nought']}
cats=[];sent=[];seen=set()
for f in sorted(glob.glob('data/en/[0-9]*.txt')):
    for l in open(f,encoding='utf-8').read().split('\n'):
        l=l.strip()
        if not l: continue
        if l.startswith('## '): cats.append([l[3:],[]]);continue
        p=[x.strip() for x in l.split('|')]
        w,de=[x.strip() for x in p[0].split('=',1)]
        assert w not in seen,w; seen.add(w)
        assert re.search(r'(?<![A-Za-z])'+re.escape(w)+r'(?![A-Za-z])',p[1],re.I),w
        assert len(re.findall(r'\[[^\]]+\]',p[2]))==1,l
        cats[-1][1].append(f'{w} = {de}')
        sent.append(f'{w} | {p[1]} | {p[2]}')
alts={k:v for k,v in ALTS.items() if v and k in seen}
out="/* Englisch-Kurs (erzeugt von data/make_en.py aus data/en/*.txt) */\n"
out+="LANGS.en={id:'en',name:'Englisch',native:'English',code:'EN',kp:'en:',needsDe:true,alts:"+json.dumps(alts,ensure_ascii=False)+",cats:[\n"
out+=",\n".join("["+json.dumps(c,ensure_ascii=False)+",`\n"+"\n".join(ws)+"\n`]" for c,ws in cats)
out=out.replace('["','[').replace('",`',',`',1) if False else out
open('lang_en.js','w',encoding='utf-8').write('')
# sauber zusammensetzen
parts=[]
for c,ws in cats:
    parts.append("["+json.dumps(c,ensure_ascii=False)+",`\n"+"\n".join(ws)+"\n`]")
js="/* Englisch-Kurs (erzeugt von data/make_en.py aus data/en/*.txt) */\nLANGS.en={id:'en',name:'Englisch',native:'English',code:'EN',kp:'en:',needsDe:true,alts:"+json.dumps(alts,ensure_ascii=False)+",cats:[\n"+",\n".join(parts)+"\n]};\nconst EN_SENT_RAW=`\n"+"\n".join(sent)+"\n`;\n"
assert '${' not in js
open('lang_en.js','w',encoding='utf-8').write(js)
print(len(seen),'Wörter',len(cats),'Kategorien',len(alts),'Varianten')
