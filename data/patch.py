import re
p='app.src.html'
s=open(p).read()
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt,(s.count(old),old[:70])
    s=s.replace(old,new)

# 1) Sätze einbetten
sent=''.join(open('data/sent%d.txt'%i).read().rstrip('\n')+'\n' for i in (1,2,3))
assert '`' not in sent and '${' not in sent
block="""
/* Beispielsätze: Wort | indonesischer Satz | englischer Satz, [Klammer] = englisches Gegenstück des Wortes */
const SENT_RAW=`
"""+sent+"""`;
const SENT={};
SENT_RAW.split('\\n').forEach(l=>{
  const q=l.split(' | ');if(q.length<3)return;
  const m=q[2].match(/\\[([^\\]]+)\\]/);if(!m)return;
  SENT[q[0].trim().toLowerCase()]={id:q[1].trim(),tpl:q[2].trim(),en:q[2].replace(/[\\[\\]]/g,'').trim(),slot:m[1]};
});
"""
rep("/* ---------- Hilfsfunktionen ---------- */",block+"\n/* ---------- Hilfsfunktionen ---------- */")

# 2) Zustand
rep("const defaults=()=>({v:1,lang:null,newPerDay:1,dayOffset:0,progress:{},daily:{date:'',newCount:0,extra:0},done:{}});\nlet state=load();",
"const FAR='9999-12-31';   // Fälligkeit für Wörter auf der Fehlerliste: nie automatisch fällig\nconst defaults=()=>({v:2,lang:null,newPerDay:1,dayOffset:0,progress:{},list:null,daily:{date:'',newCount:0,extra:0,lt:[]},done:{}});\nlet state=load();migrate();")
rep("function daily(){const t=today();if(state.daily.date!==t)state.daily={date:t,newCount:0,extra:0};return state.daily}",
"""function daily(){const t=today();if(state.daily.date!==t)state.daily={date:t,newCount:0,extra:0,lt:[]};if(!state.daily.lt)state.daily.lt=[];return state.daily}
/* Version 2: Fehlerliste. Alte Daten: Wörter auf Stufe 0 wandern in die Liste. */
function migrate(){
  if(!state.list){
    state.list={};
    const y=addDays(today(),-1);
    Object.keys(state.progress||{}).forEach(lg=>{
      const m=state.list[lg]=state.list[lg]||{},pr=state.progress[lg];
      Object.keys(pr).forEach(k=>{if(pr[k].l===0){m[k]={n:1,s:y};pr[k].d=FAR;}});
    });
  }
  if(!state.daily)state.daily={date:'',newCount:0,extra:0,lt:[]};
  if(!state.daily.lt)state.daily.lt=[];
  state.v=2;
}
const listOf=()=>{const m=state.list||(state.list={});return m[state.lang]||(m[state.lang]={});};
function listWords(){
  const L=curLang(),m=listOf();
  return L.words.filter(w=>m[w.k]).sort((a,b)=>(m[b.k].n-m[a.k].n)||(m[a.k].s<m[b.k].s?-1:m[a.k].s>m[b.k].s?1:0)||(a.k<b.k?-1:1));
}""")
old_plan=s[s.index("function plan(){"):s.index("function streak(){")]
new_plan="""function plan(){
  const L=curLang(),t=today(),prog=state.progress[L.id]||{},lm=listOf(),dq=daily();
  const due=shuffle(L.words.filter(w=>prog[w.k]&&prog[w.k].d<=t&&!lm[w.k])).sort((a,b)=>prog[a.k].d<prog[b.k].d?-1:prog[a.k].d>prog[b.k].d?1:0);
  const need=Math.max(0,state.newPerDay+dq.extra-dq.newCount);
  const fresh=L.words.filter(w=>!prog[w.k]).slice(0,need);
  const vol=listWords().filter(w=>dq.lt.indexOf(w.k)<0);          // Fehlerliste, heute noch nicht geübt
  const mand=dq.lt.length===0?(vol.find(w=>lm[w.k].s<t)||null):null; // Pflichtwort: meiste Fehler, bei Gleichstand das älteste
  return {due,fresh,mand,vol};
}
"""
s=s.replace(old_plan,new_plan)
old_rec=s[s.index("function record(w,ok){"):s.index("/* ---------- Farben & Effekte")]
new_rec="""function record(w,ok,type){
  const L=curLang(),prog=state.progress[L.id]||(state.progress[L.id]={}),lm=listOf();
  const prev=prog[w.k],dq=daily();
  let res;
  if(ok){
    const level=type==='list'?1:Math.min((prev?prev.l:0)+1,5);
    const days=INTERVALS[level-1];
    prog[w.k]={l:level,d:addDays(today(),days)};
    delete lm[w.k];
    res={level,days};
  }else{
    const e=lm[w.k]||(lm[w.k]={n:0,s:today()});
    e.n++;
    prog[w.k]={l:0,d:FAR};
    res={n:e.n};
  }
  if(!prev)dq.newCount++;
  if(type==='list')dq.lt.push(w.k);
  save();
  return res;
}

"""
s=s.replace(old_rec,new_rec)

# 3) Home
rep("const n1=p.due.length,n2=p.fresh.length,total=n1+n2,doneToday","const n1=p.due.length,n2=p.fresh.length,n3=p.mand?1:0,total=n1+n2+n3,doneToday")
rep("""<div class="num"><b>${n2}</b><span>${n2===1?'neue Vokabel':'neue Vokabeln'}</span></div></div>""","""<div class="num"><b>${n2}</b><span>${n2===1?'neue Vokabel':'neue Vokabeln'}</span></div>${n3?'<div class="num"><b>1</b><span>aus der Fehlerliste</span></div>':''}</div>""")
rep("""      <button class="btn primary block pulse" id="start">Abfrage starten</button>`;""","""      <button class="btn primary block pulse" id="start">Abfrage starten</button>`;""")
rep("const lv=[0,0,0,0,0,0];let nNew=0;","""const lw=listWords(),lm=listOf(),dq=daily();
  const listHtml=lw.length?`<section class="card"><div class="eyebrow">Fehlerliste</div>
    <p style="margin-top:6px"><b>${lw.length}</b> ${lw.length===1?'Wort':'Wörter'} zum Wiederholen. ${p.mand?'Eins davon ist heute Pflicht.':dq.lt.length?'Die Pflicht für heute ist erledigt.':'Ab morgen ist täglich ein Wort daraus Pflicht.'}</p>
    <div class="missed" style="margin-top:12px">${lw.slice(0,8).map(w=>`<span>${esc(w.id)}<em>×${lm[w.k].n}</em></span>`).join('')}${lw.length>8?`<span>+${lw.length-8}</span>`:''}</div>
    ${!p.mand&&p.vol.length?'<div class="btns" style="margin-top:14px"><button class="btn block" id="vol">Freiwillig weiter üben</button></div>':''}</section>`:'';
  const lv=[0,0,0,0,0,0];let nNew=0;""")
rep("{c:LVCOL[n],n:lv[n],l:n===0?'Nochmal':'Stufe '+n}","{c:LVCOL[n],n:lv[n],l:n===0?'Fehlerliste':'Stufe '+n}")
rep("""<section class="card"><div class="streak">""","""${listHtml}
  <section class="card"><div class="streak">""",1) if False else None
# Liste nach dem Plan-Karte einfügen
rep("""<section class="card plan">${planHtml}</section>\n""","""<section class="card plan">${planHtml}</section>\n  ${listHtml}\n""")
rep("const s=$('#start');if(s)s.onclick=startSession;","const s=$('#start');if(s)s.onclick=()=>startSession();\n  const v=$('#vol');if(v)v.onclick=()=>startSession('vol');")

# 4) Heft
rep("[['all','Alle'],['due','Fällig'],['learned','Gelernt'],['new','Neu']]","[['all','Alle'],['due','Fällig'],['learned','Gelernt'],['new','Neu'],['err','Fehlerliste']]")
rep("function renderList(){\n  const L=curLang(),t=today(),prog=state.progress[L.id]||{};","function renderList(){\n  const L=curLang(),t=today(),prog=state.progress[L.id]||{},lm=listOf();")
rep("    if(bookF==='new'&&pr)return;","    if(bookF==='new'&&pr)return;\n    if(bookF==='err'&&!lm[w.k])return;")
rep("const pr=prog[w.k],due=pr&&pr.d<=t;","const pr=prog[w.k],due=pr&&pr.d<=t&&!lm[w.k],err=lm[w.k];")
rep("""${due?'<span class="tag">fällig</span>':''}""","""${err?'<span class="tag err">Fehlerliste ×'+err.n+'</span>':due?'<span class="tag">fällig</span>':''}""")

# 5) Einstellungen / Sicherung
rep("data:{lang:state.lang,newPerDay:state.newPerDay,progress:state.progress,daily:state.daily,done:state.done}","data:{lang:state.lang,newPerDay:state.newPerDay,progress:state.progress,list:state.list,daily:state.daily,done:state.done}")
rep("state=Object.assign(defaults(),o.data,{dayOffset:0});save();render();","state=Object.assign(defaults(),o.data,{dayOffset:0});migrate();save();render();")
rep("()=>{state=defaults();save();view='home';render();}","()=>{state=defaults();migrate();save();view='home';render();}")
rep("<p class=\"hint\">Dazu kommen immer alle fälligen Wiederholungen.</p>","<p class=\"hint\">Dazu kommen immer alle fälligen Wiederholungen und ein Wort aus der Fehlerliste.</p>")

# 6) Sitzung
a=s.index("/* ---------- Abfrage ---------- */");b=s.index("\nrender();\n})();")
s=s[:a]+open('data/session.js').read()+s[b:]

# 7) CSS
css="""
/* Fehlerliste, Satz-Übung, Bausteine */
.num:nth-child(3) b{color:var(--c-orange)}
.missed em{font-style:normal;color:var(--bad);margin-left:6px;font-size:12px;font-weight:700}
.tag.err{color:var(--bad)}
.ex{border-left:3px solid var(--c-cyan);padding:2px 0 2px 14px;display:grid;gap:4px}
.ex .xi{font:600 20px/1.3 var(--display)}
.ex .xi b{color:var(--c-yellow);font-weight:700}
.ex .xe{color:var(--muted)}
.ex .xe b{color:var(--c-cyan);font-weight:600}
.sentbox{font:600 24px/1.35 var(--display);text-wrap:balance}
.sentbox .slot{color:var(--c-yellow);border-bottom:3px solid var(--c-yellow);padding:0 2px}
.opts{display:grid;gap:10px}
.opt{min-height:54px;text-align:left;padding:0 16px;border-radius:12px;border:1.5px solid var(--line);border-bottom-width:3px;background:var(--surface);font-size:17px;font-weight:600}
.opt:active:not(:disabled){transform:translateY(2px)}
.opt:disabled{cursor:default}
.opt.ok{border-color:var(--good);background:var(--good-soft)}
.opt.no{border-color:var(--bad);background:var(--bad-soft);animation:shake .35s}
.ans{min-height:64px;display:flex;flex-wrap:wrap;gap:8px;padding:10px 0;align-content:flex-start;border-top:2px solid var(--line);border-bottom:2px solid var(--line)}
.bank{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.tile{min-height:44px;padding:0 14px;border-radius:12px;border:1.5px solid var(--line);border-bottom-width:3px;background:var(--raised);font:600 17px var(--body);color:var(--text)}
.tile:active:not(:disabled){transform:translateY(2px)}
.tile.ghost{display:inline-flex;align-items:center;background:var(--surface);border:1.5px dashed var(--line-soft);color:transparent}
.ans.good .tile{border-color:var(--good);background:var(--good-soft)}
.ans.bad .tile{border-color:var(--bad);background:var(--bad-soft)}
"""
rep("@media (prefers-reduced-motion:reduce)",css+"@media (prefers-reduced-motion:reduce)")
open(p,'w').write(s)
print('patched',len(s))
