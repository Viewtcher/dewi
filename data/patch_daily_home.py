p='app.src.html'
s=open(p,encoding='utf-8').read()
def rep(a,b):
    global s
    if a not in s: raise SystemExit('FEHLT: '+a[:70])
    s=s.replace(a,b,1)

rep("const n1=p.rev?1:0,n2=p.fresh.length,n3=p.mand?1:0,total=n1+n2+n3,doneToday=!!state.done[t0],st=streak();",
    "const nR=p.repair.length,nF=p.fresh?1:0,nV=p.review.length,doneToday=!!state.done[t0],st=streak();")
# Wochenstreifen: grauer Stempel
rep("""const had=!!(state.stamps&&state.stamps[d]),mood=stampFor(d);if(!had)chg=true;
      week+=`<button class="day on${i===0?' now':''}" data-stamp="${d}" data-mood="${mood}" aria-label="${esc(lab)}: ${t('erledigt')} · ${t('Marke ansehen')}"><span class="st">${stampSvg(mood,i*.7)}</span>""",
"""const had=!!(state.stamps&&state.stamps[d]),mood=stampFor(d),fl=!!(state.flawed&&state.flawed[d]);if(!had)chg=true;
      week+=`<button class="day on${fl?' flawed':''}${i===0?' now':''}" data-stamp="${d}" data-mood="${mood}"${fl?' data-flawed="1"':''} aria-label="${esc(lab)}: ${fl?t('mit Fehlern erledigt'):t('erledigt')} · ${t('Marke ansehen')}"><span class="st">${stampSvg(mood,i*.7,fl)}</span>""")

# Plan-Karte
i=s.index("  let planHtml;"); j=s.index("  const lv=[0,0,0,0,0,0];let nNew=0;")
new = """  const lw=listWords(),lm=listOf();
  const stageNums=`<div class="nums">${nR?'<div class="num"><b>'+nR+'</b><span>'+t('Reparatur')+'</span></div>':''}${nF?'<div class="num"><b>1</b><span>'+t('neue Vokabel')+'</span></div>':''}<div class="num"><b>${nV+nF}</b><span>${t('Review')}</span></div></div>`;
  let planHtml;
  if(!doneToday){
    planHtml=`<div class="eyebrow">${t('Heute dran')}</div>${stageNums}
      ${nR?'<p class="hint" style="margin:10px 0 2px">'+t('Die Fehlerliste muss zuerst leer werden. Danach geht es mit dem neuen Wort weiter.')+'</p>':''}
      <button class="btn primary block pulse" id="start">${nR?t('Reparatur starten'):t('Daily Round starten')}</button>`;
  }else{
    planHtml=`<div class="eyebrow">${t('Heute')}</div>
      <h2>${t('Für heute geschafft.')}</h2>
      <p class="hint">${nR?t('Die nächste Daily Round startet mit der Reparatur der Fehlerliste.'):nTomorrow>0?t('Morgen kommt 1 Wiederholung dran.'):t('Morgen steht noch keine Wiederholung an.')}</p>
      ${nF||nR?'<div class="btns" style="margin-top:14px"><button class="btn block light" id="extra">'+(nR?t('Fehlerliste reparieren'):t('Noch eine neue Vokabel'))+'</button></div>':''}`;
  }
  const listHtml=lw.length?`<section class="card"><div class="eyebrow">${t('Fehlerliste')}</div>
    <p style="margin-top:6px"><b>${lw.length}</b> ${lw.length===1?t('Wort'):t('Wörter')} ${t('zum Reparieren.')} ${t('Die Daily Round ist gesperrt, bis die Liste leer ist.')}</p>
    <div class="missed" style="margin-top:12px">${lw.slice(0,8).map(w=>`<span>${esc(w.id)}<em>×${lm[w.k].n}</em></span>`).join('')}${lw.length>8?`<span>+${lw.length-8}</span>`:''}</div></section>`:'';
  const nSurv=survivalWords().length,bestR=bestFor('random');
  const revHtml=doneToday&&nSurv>=5?`<section class="card"><div class="eyebrow">${t('Survival')}</div>
    <p style="margin-top:6px">${t('{0} Wörter, 3 Leben, ein Versuch pro Frage. Wie weit kommst du?',nSurv)}</p>
    <p class="hint">${bestR?t('Rekord: {0}',bestR):t('Noch kein Rekord.')}</p>
    <div class="btns" style="margin-top:14px"><button class="btn block" id="surv">${t('Survival starten')}</button></div></section>`:'';
"""
s=s[:i]+new+s[j:]
# der alte lw/lm/dq Block war in dem ersetzten Bereich enthalten (zwischen planHtml und lv)
rep("${homeMascot(p,st,lw.length,doneToday,prog)}","${homeMascot(p,st,lw.length,doneToday,prog)}")
rep("const any=Object.keys(prog).length>0,total=(p.rev?1:0)+p.fresh.length+(p.mand?1:0);","const any=Object.keys(prog).length>0,total=p.repair.length+(p.fresh?1:0)+p.review.length;")
rep("""  const v=$('#vol');if(v)v.onclick=()=>openPlaymodes('freeplay_list');
  const rv=$('#rvol');if(rv)rv.onclick=()=>openPlaymodes('freeplay_review');
  const e=$('#extra');if(e)e.onclick=()=>{daily().extra++;save();startRound('daily');};""",
"""  const v=$('#surv');if(v)v.onclick=()=>openPlaymodes('survival');
  const e=$('#extra');if(e)e.onclick=()=>startRound('daily');""")

# Einstellungen: Neue Vokabeln pro Tag entfernen
a=s.index("  <section class=\"card set\"><div><div class=\"eyebrow\">${t('Neue Vokabeln pro Tag')}")
b=s.index("  <section class=\"card set\"><div class=\"eyebrow\">${t('Tägliche Erinnerung')}")
s=s[:a]+s[b:]
rep("  $$('.seg button[data-n]',app).forEach(b=>b.onclick=()=>{state.newPerDay=+b.dataset.n;save();$$('.seg button[data-n]',app).forEach(x=>x.setAttribute('aria-checked',String(x===b)));});\n","")
rep("ui:state.ui,newPerDay:state.newPerDay,progress","ui:state.ui,flawed:state.flawed,best:state.best,progress")

# Stempel: grau ohne Holo
rep("function stampSvg(mood,phase){","""/* Stempel: bei flawed (Tag mit verlorenem Modul) grau und ohne Holo */
function stampSvg(mood,phase,flawed){
  let x=stampSvg0(mood,phase);
  if(flawed){
    x=x.replace('<g class="pl pl-holo">','<g class="pl pl-holo" style="display:none">').replace('<g class="pl pl-glare">','<g class="pl pl-glare" style="display:none">')
       .replace('<svg viewBox','<svg style="filter:grayscale(1) brightness(.85)" viewBox');
  }
  return x;
}
function stampSvg0(mood,phase){""")
rep("const mood=stampFor(d);\n  const o=document.createElement('div');o.className='stampview'","const mood=stampFor(d),flawed=!!(state.flawed&&state.flawed[d]);\n  const o=document.createElement('div');o.className='stampview'")
rep("${stampSvg(mood,0)}</div></div>\n  <p class=\"sv-cap\"><b>${esc(dayName(d,{weekday:'long',day:'numeric',month:'long'}))}</b><span>${esc(STAMP_NAME[mood]())}</span></p>",
    "${stampSvg(mood,0,flawed)}</div></div>\n  <p class=\"sv-cap\"><b>${esc(dayName(d,{weekday:'long',day:'numeric',month:'long'}))}</b><span>${esc(STAMP_NAME[mood]())}${flawed?' · '+t('mit Fehlern'):''}</span></p>")
open(p,'w',encoding='utf-8').write(s)
print('ok')
