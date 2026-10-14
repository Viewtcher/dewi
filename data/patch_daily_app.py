import re
p='app.src.html'
s=open(p,encoding='utf-8').read()
def rep(a,b,cnt=1):
    global s
    if s.count(a)<1: raise SystemExit('FEHLT: '+a[:70])
    s=s.replace(a,b) if cnt==0 else s.replace(a,b,cnt)

# --- State
rep("v:2,lang:null,ui:null,newPerDay:1,dayOffset:0,progress:{},list:null,daily:{date:'',newCount:0,extra:0,lt:[]},done:{},",
    "v:2,lang:null,ui:null,dayOffset:0,progress:{},list:null,daily:{date:'',newCount:0,extra:0,lt:[],got:[]},done:{},flawed:{},best:{},")
rep("state.daily={date:t,newCount:0,extra:0,lt:[],rvm:false};if(!state.daily.lt)state.daily.lt=[];return state.daily}",
    "state.daily={date:t,newCount:0,extra:0,lt:[],got:[]};if(!state.daily.lt)state.daily.lt=[];if(!state.daily.got)state.daily.got=[];return state.daily}")
rep("  if(!state.daily.lt)state.daily.lt=[];\n  if(!state.ui","  if(!state.daily.lt)state.daily.lt=[];\n  if(!state.daily.got)state.daily.got=[];\n  if(!state.flawed||typeof state.flawed!=='object')state.flawed={};\n  if(!state.best||typeof state.best!=='object')state.best={};\n  delete state.newPerDay;\n  if(!state.ui")

# --- plan
i=s.index("function plan(){"); j=s.index("function streak(){")
s=s[:i]+"""/* Plan der nächsten Daily Round:
   repair = alle Wörter der Fehlerliste (Reparatur-Stage, läuft zuerst)
   fresh  = das eine neue Wort (erstes noch ungesehenes) oder null
   review = bekannte Wörter für die Review-Stage: 2 am längsten überfällige + zufällige weitere fällige,
            aufgefüllt mit noch nicht fälligen (früheste Fälligkeit zuerst), insgesamt 4 (ohne neues Wort 5) */
function plan(){
  const L=curLang(),t=today(),prog=state.progress[L.id]||{},lm=listOf();
  const repair=listWords();
  const fresh=L.words.find(w=>!prog[w.k])||null;
  const want=fresh?4:5;
  const known=L.words.filter(w=>prog[w.k]&&prog[w.k].l>=1&&!lm[w.k]);
  const byD=(a,b)=>prog[a.k].d<prog[b.k].d?-1:prog[a.k].d>prog[b.k].d?1:0;
  const due=known.filter(w=>prog[w.k].d<=t).sort(byD);
  let pick=due.slice(0,Math.min(2,want));
  pick=pick.concat(shuffle(due.slice(pick.length)).slice(0,want-pick.length));
  if(pick.length<want)pick=pick.concat(known.filter(w=>pick.indexOf(w)<0).sort(byD).slice(0,want-pick.length));
  return {repair,fresh,review:shuffle(pick)};
}
"""+s[j:]

# --- record
rep("  if(type==='review')dq.rvm=true;\n","  if(ok&&dq.got.indexOf(w.k)<0)dq.got.push(w.k);\n")
open(p,'w',encoding='utf-8').write(s)
print('state/plan ok')
