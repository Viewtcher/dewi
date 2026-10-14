p='/home/claude/kata/app.src.html'
s=open(p,encoding='utf8').read()
def rep(old,new):
    global s
    assert s.count(old)==1,(s.count(old),old[:70])
    s=s.replace(old,new)
rep("state.daily={date:t,newCount:0,extra:0,lt:[]};","state.daily={date:t,newCount:0,extra:0,lt:[],rvm:false};")
rep("""  const need=Math.max(0,state.newPerDay+dq.extra-dq.newCount);""","""  // Wiederholung: täglich nur ein Pflichtwort (das am längsten überfällige), der Rest ist freiwillig
  const rev=dq.rvm?null:(dueAll[0]||null);
  const revVol=dueAll.filter(w=>w!==rev);
  const need=Math.max(0,state.newPerDay+dq.extra-dq.newCount);""")
rep("  const due=shuffle(L.words.filter(w=>prog[w.k]&&prog[w.k].d<=t&&!lm[w.k]))","  const dueAll=shuffle(L.words.filter(w=>prog[w.k]&&prog[w.k].d<=t&&!lm[w.k]))")
rep("  return {due,fresh,mand,vol};","  return {rev,revVol,fresh,mand,vol};")
rep("  if(type==='list')dq.lt.push(w.k);","  if(type==='list')dq.lt.push(w.k);\n  if(type==='review')dq.rvm=true;")
# Startseite
rep("const n1=p.due.length,n2=","const n1=p.rev?1:0,n2=")
rep("${nTomorrow>0?(nTomorrow===1?t('Morgen kommt 1 Wiederholung dran.'):t('Morgen kommen {0} Wiederholungen dran.',nTomorrow)):t(","${nTomorrow+p.revVol.length>0?t('Morgen kommt 1 Wiederholung dran.'):t(")
rep("  const any=Object.keys(prog).length>0,total=p.due.length+p.fresh.length+(p.mand?1:0);","  const any=Object.keys(prog).length>0,total=(p.rev?1:0)+p.fresh.length+(p.mand?1:0);")
rep("  const lv=[0,0,0,0,0,0];let nNew=0;","""  const rl=p.revVol,revHtml=rl.length?`<section class="card"><div class="eyebrow">${t('Wiederholungsliste')}</div>
    <p style="margin-top:6px"><b>${rl.length}</b> ${rl.length===1?t('Wort'):t('Wörter')} ${t('zum Nachholen.')} ${p.rev?t('Heute ist nur eine Wiederholung Pflicht.'):t('Die Pflicht für heute ist erledigt.')}</p>
    <div class="missed" style="margin-top:12px">${rl.slice(0,8).map(w=>`<span>${esc(w.id)}</span>`).join('')}${rl.length>8?`<span>+${rl.length-8}</span>`:''}</div>
    ${!p.rev?'<div class="btns" style="margin-top:14px"><button class="btn block" id="rvol">'+t('Freiwillig nachholen')+'</button></div>':''}</section>`:'';
  const lv=[0,0,0,0,0,0];let nNew=0;""")
rep("  ${listHtml}\n","  ${listHtml}\n  ${revHtml}\n")
rep("  const v=$('#vol');if(v)v.onclick=()=>startSession('vol');","  const v=$('#vol');if(v)v.onclick=()=>startSession('vol');\n  const rv=$('#rvol');if(rv)rv.onclick=()=>startSession('rvol');")
# Sitzung
rep("  if(mode==='vol')items=p.vol.slice(0,5).map(w=>({w,type:'list'}));","  if(mode==='vol')items=p.vol.slice(0,5).map(w=>({w,type:'list'}));\n  else if(mode==='rvol')items=p.revVol.slice(0,5).map(w=>({w,type:'review'}));")
rep("    items=p.due.map(w=>({w,type:'review'})).concat(p.fresh","    items=(p.rev?[{w:p.rev,type:'review'}]:[]).concat(p.fresh")
rep("  if(!p.due.length&&!p.fresh.length&&!p.mand)state.done[t0]=true;","  if(!p.rev&&!p.fresh.length&&!p.mand)state.done[t0]=true;")
rep("t('Dazu kommen immer alle fälligen Wiederholungen und ein Wort aus der Fehlerliste.')","t('Dazu kommen täglich eine Wiederholung und ein Wort aus der Fehlerliste.')")
rep("const EN={","const EN={\"Wiederholungsliste\": \"Review list\", \"zum Nachholen.\": \"to catch up on.\", \"Heute ist nur eine Wiederholung Pflicht.\": \"Only one review is mandatory today.\", \"Freiwillig nachholen\": \"Catch up voluntarily\", \"Dazu kommen täglich eine Wiederholung und ein Wort aus der Fehlerliste.\": \"On top of that there is one review and one word from the error list each day.\", ")
open(p,'w',encoding='utf8').write(s)
print('ok')
