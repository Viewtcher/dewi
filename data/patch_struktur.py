import json,re
ic=json.load(open('data/icons.json',encoding='utf-8'))
def rd(f):return open(f,encoding='utf-8').read()
def wr(f,s):open(f,'w',encoding='utf-8').write(s)
def sub(f,old,new,cnt=1):
    s=rd(f);assert s.count(old)>=1,(f,old[:60]);wr(f,s.replace(old,new,cnt if cnt else -1) if cnt else s.replace(old,new))
# ---- Modul-Dateien: Kicker-Aufrufe + Registrierung
sub('modules/swipe.js',"kicker(c,'sent',t('Swipe')+' · '+(id2gl?toGl():toIdl()))","kicker(c,'swipe',id2gl?toGl():toIdl())")
sub('modules/gap.js',"kicker(c,'sent',t('Satz-Übung')+' · '+t('Lückensatz'))","kicker(c,'gap')")
sub('modules/choice.js',"kicker(c,'sent')","kicker(c,'choice')")
sub('modules/blocks.js',"kicker(c,'sent',t('Bausteine')+' · '+(dir==='id2gl'?toGl():toIdl()))","kicker(c,'blocks',dir==='id2gl'?toGl():toIdl())")
sub('modules/typing.js',"kicker(c,'type',t('Tippen')+' · '+(id2gl?toGl():toIdl()))","kicker(c,'typing',id2gl?toGl():toIdl())")
def reg(f,id,key,nameDe,desc,tone,solo,fb,can,show,isNew=False):
    s=rd(f).rstrip()+"\n\n"
    icon=ic[key]['icon'] if key else ''
    s+=f"registerModule({{id:'{id}',name:()=>t('{nameDe}'),desc:()=>t('{desc}'),tone:'{tone}',solo:{solo},{'isNew:true,' if isNew else ''}fallback:{fb},\n  icon:'{icon}',\n  can:{can},show:{show}}});\n"
    wr(f,s)
wr('modules/intro.js',rd('modules/intro.js').rstrip()+"\n\nregisterModule({id:'intro',name:()=>t('Kennenlernen'),desc:()=>'',solo:false,fallback:null,icon:'',can:()=>true,show:()=>showIntro()});\n")
reg('modules/blocks.js','blocks','build','Bausteine','Satz aus Wortkacheln zusammensetzen','t1','true',"'swipe'","w=>!!buildPair(w)","w=>showBuild(buildPair(w))")
reg('modules/typing.js','typing','type','Tippen','Übersetzung selbst schreiben','t2','true','null',"()=>true","()=>showQuestion()")
reg('modules/swipe.js','swipe','swipe','Swipe','Zwei Vorschläge, einer stimmt','t3','true','null',"()=>true","()=>showSwipe()",True)
reg('modules/gap.js','gap','gap','Lückensatz','Fehlendes Wort im Satz einsetzen','t4','true',"'choice'","w=>{const s=sentOf(w);return !!(s&&gapParts(s,w));}","w=>{const s=sentOf(w);showGap(w,s,gapParts(s,w));}")
reg('modules/choice.js','choice','choice','Auswahl','Richtige Bedeutung aus vier Optionen','t5','true',"'swipe'","w=>!!sentOf(w)","()=>showChoice()")
# ---- rounds.js
s=rd('rounds.js')
s=s.replace("/* ---------- Abfrage ---------- */\nlet S=null;","/* ===== Rounds =====\n   Eine ROUND ist eine komplette Abfrage vom Start bis zum Ergebnis.\n   - Daily Round: die Pflicht des Tages (Wiederholung, neue Wörter, Fehlerlisten-Wort), immer Playmode Random.\n   - Freeplay: freiwillig aus der Wiederholungsliste (kind 'freeplay_review') oder der Fehlerliste ('freeplay_list'),\n     Playmode Random oder Solo (ein Modul).\n   S = Zustand der laufenden Round: items (Wörter), i (aktuelles Wort), cur (aktuelle Karte), playmode, kind … */\nlet S=null;",1)
old=s[s.index("function startSession(mode,opt){"):s.index("function closeSheet()")]
new='''function startRound(kind,opt){
  const p=plan(),o=opt||{};
  let items;
  if(kind==='freeplay_list')items=p.vol.slice(0,o.n||999).map(w=>({w,type:'list'}));
  else if(kind==='freeplay_review')items=p.revVol.slice(0,o.n||999).map(w=>({w,type:'review'}));
  else{
    items=(p.rev?[{w:p.rev,type:'review'}]:[]).concat(p.fresh.map(w=>({w,type:'new'})));
    if(p.mand)items.push({w:p.mand,type:'list'});
  }
  if(!items.length)return;
  S={items,i:0,right:0,wrong:0,missed:[],cleared:[],cur:null,streak0:streak(),kind:kind||'daily',playmode:o.playmode||'random'};
  sheet.hidden=false;document.body.style.overflow='hidden';
  showItem();
}

'''
s=s.replace(old,new,1)
s=s.replace("steps:(S.mode&&S.mode!=='random')?(S.mode==='type'?['type']:['sent']):stepsFor(it.type,lvl),si:0,","steps:planCards(it.type,lvl,it.w,S.playmode),si:0,",1)
old=s[s.index("function nextStep(){"):s.index("function kicker(")]
new='''/* Nächste Karte der aktuellen Wort-Reihe. Sind alle Karten durch (nur im Playmode Solo), ist das Wort fertig. */
function nextStep(){
  const c=S.cur,id=c.steps[c.si++];
  if(id===undefined)return finish(true);
  MOD[id].show(c.w);
}

'''
s=s.replace(old,new,1)
old=s[s.index("function kicker("):s.index("function finish(")]
new='''function kicker(c,id,dir){
  let base,col;
  if(c.type==='new'){base=t('Neue Vokabel · Phase {0} von {1}',c.steps.indexOf(id)+1,c.steps.length);col='var(--c-violet)';}
  else if(c.type==='list'){base=t('Fehlerliste');col='var(--lv0)';}
  else{base=t('Wiederholung · Stufe {0}',c.lvl);col=LVCOL[c.lvl];}
  const label=id==='intro'?t('Kennenlernen'):t('Modul {0}',MOD[id].name());
  const solo=(S&&S.playmode&&S.playmode!=='random')?` · <span class="only">${t('Solo')}</span>`:'';
  return `<div class="kicker" style="--k:${col}">${base} · ${label}${dir?' · '+dir:''}${solo}</div>`;
}

'''
s=s.replace(old,new,1)
s=s.replace("t('Abfrage beenden')","t('Round beenden')").replace("t('Abfrage beendet')","t('Round beendet')")
wr('rounds.js',s)
# ---- playmodes.js
pm='''/* ===== Playmodes =====
   Ein PLAYMODE legt fest, welche Module eine Round für jedes Wort einsetzt.
   - Random: Module gemischt, abhängig von Stufe und Wortart (so läuft die Daily Round).
   - Solo:   genau ein Modul für alle Wörter, wählbar bei Freeplay. playmode = Modul-Kennung (blocks, typing, swipe, gap, choice).
   planCards(...) liefert die Kartenreihe eines Wortes als Liste von Modul-Kennungen. */

/* Random: welches Satz-Modul bekommt dieses Wort? (Swipe ca. 30 %, sonst Lückensatz oder Auswahl, ohne Satz Bausteine) */
function pickSentenceModule(w){
  const s=sentOf(w);
  if(Math.random()<(window.__swipeP==null?.3:window.__swipeP))return 'swipe';
  if(s){
    const gp=gapParts(s,w);
    return (gp&&Math.random()<.5)?'gap':'choice';
  }
  return MOD.blocks.can(w)?'blocks':null;
}
/* Kartenreihe: neu = Kennenlernen, Satz-Modul, Tippen. Stufe 1-2 und Fehlerliste = Satz-Modul, Tippen. Ab Stufe 3 nur Tippen. */
function planCards(type,lvl,w,playmode){
  if(playmode&&playmode!=='random')return [resolveModule(playmode,w)];
  const sm=pickSentenceModule(w),sent=sm?[sm]:[];
  if(type==='new')return ['intro'].concat(sent,['typing']);
  if(type==='list'||lvl<=2)return sent.concat(['typing']);
  return ['typing'];
}

/* Playmode-Wahl für Freeplay */
const playmodeLabel=m=>{const x=MOD[m];return x?x.name():'';};
function openPlaymodes(kind){
  const p=plan(),words=kind==='freeplay_list'?p.vol:p.revVol,N=words.length;
  if(!N)return;
  const sizes=[5,10].filter(n=>n<N).concat([0]);                 // 0 = alle
  let rn=sizes.indexOf(state.roundN)>-1?state.roundN:(sizes.indexOf(10)>-1?10:0);
  sheet.hidden=false;document.body.style.overflow='hidden';S=null;
  const title=kind==='freeplay_list'?t('Fehlerliste'):t('Wiederholungsliste');
  const solo=MODULES.filter(m=>m.solo);
  sheet.innerHTML=`<div class="sin modes"><div class="shead"><button class="iconbtn" id="mback" aria-label="${t('Zurück')}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
    <div><h1 class="mh">${t('Playmode')}</h1><p class="hint">${t('Freeplay')} · ${title} · ${t('{0} Wörter',N)}</p></div></div>
    <button class="mrand" data-playmode="random"><span class="mbadge">${t('Standard')}</span>
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none" stroke="#1b0b26" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 36h8c8 0 10-20 18-20h12M38 8l8 8-8 8"/><path d="M6 16h8c3 0 5 3 7 6M30 30c2 3 4 6 8 6h8M38 28l8 8-8 8"/></svg>
      <span><b>${t('Random')}</b><small>${t('Alle Module gemischt, passend zur Stufe, wie in der Daily Round')}</small></span></button>
    <div class="eyebrow msolo">${t('Solo · nur ein Modul')}</div>
    <div class="mgrid">${solo.map(m=>`<button class="mtile ${m.tone}" data-playmode="${m.id}">${m.isNew?'<span class="mnew">'+t('NEU')+'</span>':''}${m.icon}<b>${m.name()}</b><small>${m.desc()}</small></button>`).join('')}
      <div class="mtile soon" aria-hidden="true"><svg width="46" height="40" viewBox="0 0 46 40" fill="none" stroke="#a888ff" stroke-width="3" stroke-linecap="round"><path d="M8 20v0M16 12v16M24 6v28M32 12v16M40 20v0"/></svg><b>${t('Bald mehr')}</b><small>${t('Hören, Paare, Puzzle …')}</small></div></div>
    ${sizes.length>1?`<section class="card set"><div class="eyebrow">${t('Wörter pro Round')}</div><div class="seg three" role="radiogroup" aria-label="${t('Wörter pro Round')}">${sizes.map(n=>`<button role="radio" data-rn="${n}" aria-checked="${n===rn}">${n?n:t('Alle {0}',N)}</button>`).join('')}</div></section>`:''}</div>`;
  sheet.scrollTop=0;
  $('#mback').onclick=closeSheet;
  $$('[data-rn]',sheet).forEach(b=>b.onclick=()=>{rn=+b.dataset.rn;state.roundN=rn;save();$$('[data-rn]',sheet).forEach(x=>x.setAttribute('aria-checked',String(x===b)));});
  $$('[data-playmode]',sheet).forEach(b=>b.onclick=()=>startRound(kind,{playmode:b.dataset.playmode,n:rn}));
}
'''
wr('playmodes.js',pm)
# ---- app.src.html: Startseite, Texte, EN
a=rd('app.src.html')
def r(old,new,cnt=1):
    global a
    assert a.count(old)>=1,old[:70]
    a=a.replace(old,new) if cnt==0 else a.replace(old,new,cnt)
r("if(s)s.onclick=()=>startSession();","if(s)s.onclick=()=>startRound('daily');")
r("if(v)v.onclick=()=>openModes('vol');","if(v)v.onclick=()=>openPlaymodes('freeplay_list');")
r("if(rv)rv.onclick=()=>openModes('rvol');","if(rv)rv.onclick=()=>openPlaymodes('freeplay_review');")
r("daily().extra++;save();startSession();","daily().extra++;save();startRound('daily');")
assert 'startSession' not in a and 'openModes' not in a
r("t('Abfrage starten')","t('Daily Round starten')");r('"Abfrage starten": "Start session"','"Daily Round starten": "Start Daily Round"')
r("t('Freiwillig weiter üben')","t('Freeplay: weiter üben')");r('"Freiwillig weiter üben": "Keep practicing"','"Freeplay: weiter üben": "Freeplay: keep practicing"')
r("t('Freiwillig nachholen')","t('Freeplay: nachholen')");r('"Freiwillig nachholen": "Catch up voluntarily"','"Freeplay: nachholen": "Freeplay: catch up"')
r("t('Abfrage')","t('Round')");r('"Abfrage": "Session"','"Round": "Round"')
r('aria-label="Abfrage"','aria-label="Round"')
r('"Abfrage beenden": "End session"','"Round beenden": "End round"')
r('"Abfrage beendet": "Session finished"','"Round beendet": "Round finished"')
r('"Fertig": "Done",','"Fertig": "Done", "Modul {0}": "Module {0}", "Solo": "Solo", "Playmode": "Playmode", "Freeplay": "Freeplay", "Random": "Random", "Alle Module gemischt, passend zur Stufe, wie in der Daily Round": "All modules mixed by level, as in the Daily Round", "Solo · nur ein Modul": "Solo · one module only", "Wörter pro Round": "Words per round",')
r(".kicker .only{color:#f566b9}",".kicker .only{color:#f566b9}\n.msolo{margin:4px 2px -4px}")
wr('app.src.html',a)
print('ok')
