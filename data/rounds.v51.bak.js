/* ===== Rounds =====
   Eine ROUND ist eine komplette Abfrage vom Start bis zum Ergebnis. Es gibt zwei Arten:

   DAILY ROUND (kind 'daily'), immer Playmode Random, keine Leben:
     Stage 0  Reparatur   nur wenn die Fehlerliste gefüllt ist: jedes Fehlerlisten-Wort, 1 zufälliges Modul. Klappt eins nicht,
                          wird es hinten wieder angestellt (anderes Modul), bis alle bestanden sind.
     Stage 1  Einführung  das neue Wort (Modul intro, „Weiter“ erst nach ein paar Sekunden)
     Stage 2  Review      4 bekannte Wörter (2 überfällige, 2 zufällige, aufgefüllt mit noch nicht fälligen),
                          zum Schluss kommt das neue Wort noch einmal (schweres Modul: Tippen oder Bausteine).
     Pro Wort genau ein Modul, nie zweimal dasselbe Modul hintereinander. Fehlerrecht je Modul: siehe TRIES.
     Wird ein Modul verloren, kommt das Wort auf die Fehlerliste.

   SURVIVAL (kind 'survival', früher Freeplay), nur nach der Daily Round:
     Alle bekannten Wörter, jedes einmal, gemischt. 3 Leben insgesamt, pro Karte ein Versuch. Score mit Serienbonus,
     eigener Rekord je Playmode. Ein richtiges Wort steigt wie in der Daily Round eine Stufe (einmal pro Tag und Wort).

   S = Zustand der laufenden Round: items (Karten), i (aktuelle Karte), cur (aktuelle Karte mit Wort und Modul), kind, playmode … */
let S=null;

/* Versuche pro Modul (Daily Round): ein Fehler erlaubt = 2 Versuche, Tippen 2 Fehler = 3 Versuche, Swipe nur 1 Versuch.
   Im Survival hat jede Karte nur einen Versuch. */
const TRIES={swipe:1,typing:3,blocks:2,gap:2,choice:2,reels:2};
const triesFor=id=>(S&&S.kind==='survival')?1:(TRIES[id]||2);
const roundLives=()=>(S&&S.kind==='survival')?livesHtml(S.lives,S.cur&&S.cur.healed?S.lives-1:-1):'';
const HEART_STREAK=8,HEART_MAX=3;   // 8 richtige in Folge geben ein verlorenes Herz zurück, nie mehr als am Start
window.__introMs=(typeof window.__introMs==='number')?window.__introMs:3000;   // Sperre des „Weiter“ in der Einführung (Tests setzen 0)

/* Serienbonus im Survival: 3 in Folge +2, 5 +3, 10 +5, 15 +8, danach alle 5 weiteren +8 */
function survivalBonus(run){
  if(run===3)return 2;
  if(run===5)return 3;
  if(run===10)return 5;
  if(run>=15&&run%5===0)return 8;
  return 0;
}
const bestStore=()=>{const m=state.best||(state.best={});return m[state.lang]||(m[state.lang]={});};
const bestFor=pm=>bestStore()[pm]||0;

function dailyCards(){
  const p=plan(),cards=[];
  p.repair.forEach(w=>cards.push({w,kind:'repair',type:'list'}));
  if(p.fresh)cards.push({w:p.fresh,kind:'intro',type:'new'});
  p.review.forEach(w=>cards.push({w,kind:'review',type:'review'}));
  if(p.fresh)cards.push({w:p.fresh,kind:'final',type:'new'});
  return cards;
}
function survivalWords(){
  const L=curLang(),prog=state.progress[L.id]||{},lm=listOf();
  return L.words.filter(w=>prog[w.k]&&prog[w.k].l>=1&&!lm[w.k]);
}
function startRound(kind,opt){
  const o=opt||{};
  const items=kind==='survival'?shuffle(survivalWords()).map(w=>({w,kind:'surv',type:'review'})):dailyCards();
  if(!items.length)return;
  S={items,i:0,right:0,wrong:0,missed:[],cleared:[],cur:null,streak0:streak(),kind:kind||'daily',playmode:o.playmode||'random',
     last:null,lives:3,score:0,run:0,words:0,lost:0,rf:{},best:kind==='survival'?bestFor(o.playmode||'random'):0};
  sheet.hidden=false;document.body.style.overflow='hidden';
  showItem();
}

function closeSheet(){sheet.hidden=true;sheet.innerHTML='';document.body.style.overflow='';S=null;render();}

function sheetBody(inner){
  const pct=S.items.length?Math.round(S.i/S.items.length*100):0;
  sheet.innerHTML=`<div class="sin"><div class="shead"><button class="iconbtn" id="quit" aria-label="${t('Round beenden')}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button><div class="sbar" role="progressbar" aria-valuemin="0" aria-valuemax="${S.items.length}" aria-valuenow="${S.i}"><i style="width:${pct}%;--p:${Math.max(pct/100,0.05)}"></i></div><div class="scount">${Math.min(S.i+1,S.items.length)} / ${S.items.length}</div>${musIcon()}</div>${inner}</div>`;
  $('#quit').onclick=closeSheet;
  sheet.scrollTop=0;
}

/* Welches Modul bekommt diese Karte? Immer ein Modul pro Wort, nie dasselbe wie die Karte davor.
   Das neue Wort am Ende der Review-Stage bekommt bevorzugt ein schweres Modul (Tippen oder Bausteine). */
function chooseModule(card){
  const w=card.w;
  if(window.__force&&MOD[window.__force]&&MOD[window.__force].can(w))return window.__force;   // nur für Tests
  if(S.kind==='survival'&&S.playmode!=='random')return resolveModule(S.playmode,w);
  const all=MODULES.filter(m=>m.solo&&m.can(w)).map(m=>m.id);
  let pool=all.filter(id=>id!==S.last);
  if(card.kind==='final'){const heavy=pool.filter(id=>id==='typing'||id==='blocks');if(heavy.length)pool=heavy;}
  if(!pool.length)pool=all;
  return pool[Math.floor(Math.random()*pool.length)];
}

function showItem(){
  const it=S.items[S.i];
  if(!it)return showEnd();
  const L=curLang(),w=it.w,key=normG(gl(w));
  const same=L.words.filter(x=>normG(gl(x))===key);
  const pr=(state.progress[L.id]||{})[w.k];
  const lvl=pr?pr.l:0;
  S.cur={w,card:it,type:it.type,lvl,tries:0,ok:true,settled:false,module:null,dir:Math.random()<.5?'id2gl':'gl2id',accept:same.map(x=>normId(x.id)),alts:same.filter(x=>x.k!==w.k).map(x=>x.id)};
  if(it.kind==='intro'){S.cur.module='intro';return MOD.intro.show(w);}
  const m=chooseModule(it);
  it.module=m;S.cur.module=m;S.last=m;
  MOD[m].show(w);
  helpAuto(m);
}

/* Das Wort ist durch dieses Modul gewertet (richtig oder verloren). Wird von jedem Modul genau einmal aufgerufen. */
function settleCard(typedOk){
  const c=S.cur;
  if(c.settled)return c.res;
  c.settled=true;
  if(typedOk!==undefined)c.ok=c.ok&&typedOk;
  const ok=c.ok,w=c.w,card=c.card;
  let r={};
  if(S.kind==='survival'){
    S.run=ok?(S.run||0)+1:0;
    if(ok){
      S.words++;S.right++;
      if(S.run%HEART_STREAK===0&&S.lives<HEART_MAX){S.lives++;c.healed=true;setLives(S.lives,S.lives-1);sfx('gems');haptic([20,40,20]);}
      c.pts=1+survivalBonus(S.run);S.score+=c.pts;
      const dq=daily();
      if(dq.got.indexOf(w.k)<0)r=record(w,true,'review');   // Stufe +1, aber nur einmal pro Tag und Wort
      else{const pr=(state.progress[state.lang]||{})[w.k]||{};r={level:pr.l||1,days:0,same:true};}
    }else{S.wrong++;S.lives--;setLives(S.lives);}
  }else{
    if(!ok&&card.kind==='repair'&&S.rf[w.k])r={n:(listOf()[w.k]||{}).n||1};   // schon in dieser Round gescheitert: nicht doppelt zählen
    else r=record(w,ok,c.type);
    if(ok)S.right++;else{S.wrong++;S.lost++;}
    if(!ok&&card.kind==='repair'){S.rf[w.k]=1;const at=S.items.findIndex((x,ix)=>ix>S.i&&x.kind!=='repair');S.items.splice(at<0?S.items.length:at,0,{w,kind:'repair',type:'list'});}   // am Ende der Reparatur wieder anstellen (vor der Einführung)
    if(!ok&&c.type!=='list')S.missed.push(w);
    if(ok&&c.type==='list')S.cleared.push(w);
    S.run=ok?(S.run||0)+1:0;
  }
  c.res=r;
  return r;
}

/* Nächste Karte */
function nextStep(){
  const c=S.cur;
  if(c.module!=='intro'&&!c.settled)settleCard();
  S.i++;
  if(S.kind==='survival'&&S.lives<=0)return showEnd();
  showItem();
}

/* Kennzeile: Round, Stage, Modul */
function kicker(c,id,dir){
  const k=c.card;let base,col;
  if(S.kind==='survival'){base=t('Survival · {0} Punkte',S.score);col='var(--c-pink)';}
  else if(k.kind==='repair'){const n=S.items.slice(S.i).filter(x=>x.kind==='repair').length;base=t('Daily Round · Reparatur · noch {0}',n);col='var(--lv0)';}
  else if(k.kind==='intro'){base=t('Daily Round · Einführung');col='var(--c-violet)';}
  else if(k.kind==='final'){base=t('Daily Round · Review · neues Wort');col='var(--c-violet)';}
  else{const rv=S.items.filter(x=>x.kind==='review'),n=rv.indexOf(k)+1;base=t('Daily Round · Review {0} von {1}',n,rv.length);col=LVCOL[c.lvl]||'var(--c-cyan)';}
  const label=id==='intro'?'':' · '+t('Modul {0}',MOD[id].name());
  const solo=(S.kind==='survival'&&S.playmode!=='random')?` · <span class="only">${t('Solo')}</span>`:'';
  return `<div class="kicker" style="--k:${col}">${base}${label}${dir?' · '+dir:''}${solo}</div>`;
}

/* Hinweis unter dem Ergebnis eines Moduls */
function resultNote(good){
  const c=S.cur,r=c.res||{};
  if(S.kind==='survival')return good?`<p class="hint" style="margin-top:8px">+${c.pts} ${t('Punkte')}${S.run>=3?' · '+t('{0} in Folge',S.run):''}${c.healed?' · '+t('Serie von {0}: ein Herz kommt zurück!',HEART_STREAK):''}</p>`:`<p class="hint" style="margin-top:8px">${t('Ein Leben weniger.')}</p>`;
  if(!good)return `<p class="hint" style="margin-top:8px">${c.type==='list'?t('Das Wort bleibt auf der Fehlerliste und kommt gleich nochmal dran.'):t('Das Wort kommt auf die Fehlerliste.')}</p>`;
  if(c.type==='list')return `<p class="hint" style="margin-top:8px">${t('Geschafft. Das Wort verlässt die Fehlerliste und kommt morgen wieder (Stufe 1).')}</p>`;
  return `<p class="hint" style="margin-top:8px">${r.days===1?t('Stufe {0} von 5. Nächste Wiederholung morgen.',r.level):t('Stufe {0} von 5. Nächste Wiederholung in {1} Tagen.',r.level,r.days)}</p>`;
}

/* Ergebnis des Moduls Tippen (die anderen Module zeigen ihr Ergebnis selbst) */
function finish(typedOk){
  const c=S.cur,w=c.w,L=curLang(),r=settleCard(typedOk),ok=c.ok,type=c.type;
  let qk,qc={n:ok?S.run:(r.n||1),w:w.id,lv:c.lvl};
  if(ok)qk=c.tries>1&&typedOk?'ok_try2':S.run>=3&&S.run%3===0?'ok_run':'ok';
  else qk=type==='list'&&(r.n||1)>=2?'bad_again':c.lvl>=3?'bad_rare':'bad';
  const alts=c.dir==='gl2id'&&c.alts.length?`<p class="hint" style="margin-top:6px">${t('Auch richtig: {0}',c.alts.map(esc).join(', '))}</p>`:'';
  const typoNote=c.typo?`<p class="hint" style="margin-top:6px">${t('Kleiner Tippfehler. Richtig geschrieben: {0}','<b lang="'+(c.dir==='gl2id'?L.code.toLowerCase():state.ui)+'">'+esc(c.dir==='gl2id'?w.id:glFirst(w))+'</b>')}</p>`:'';
  sheetBody(`<div class="smain">${S.kind==='survival'?roundLives():''}<div class="res ${ok?'good':'bad'}" role="status"><div class="rl">${ok?t('Richtig'):t('Leider falsch')}</div>
    <div class="pair"><span lang="${L.code.toLowerCase()}">${esc(w.id)}</span><em>=</em><span lang="${state.ui}">${esc(gl(w))}</span></div>${typoNote}${alts}</div>
    ${resultNote(ok)}${mascot(qk,qc,'sm')}<button class="btn primary block" id="next">${t('Weiter')}</button></div>`);
  const n=$('#next');n.onclick=nextStep;
  try{n.focus({preventScroll:true});}catch(e){}
  if(ok&&S.kind!=='survival')levelUp(c,r);
}

function levelUp(c,r){
  if(reduceMotion())return;
  const w=c.w,type=c.type,old=$('.lvl');if(old)old.remove();
  const lab=type==='list'?t('Gerettet!'):type==='new'?t('Neues Wort!'):(r.level>c.lvl?t('Level up!'):t('Stufe gehalten'));
  const el=document.createElement('div');el.className='lvl';el.setAttribute('role','status');
  const lk=type==='list'?'lvl_saved':type==='new'?'lvl_new':(r.level>c.lvl?'lvl_up':'lvl_hold');
  el.innerHTML=`<div class="lvl-rays"></div><div class="lvl-in"><div class="lvl-lab">${lab}</div>
    <div class="lvl-badge"><span>${r.level}</span></div>
    <div class="lvl-pips">${[1,2,3,4,5].map(i=>`<i class="${i<=r.level?'on':''}" style="--d:${300+i*110}ms;--pc:${LVCOL[i]}"></i>`).join('')}</div>
    <div class="lvl-word">${esc(w.id)} = ${esc(gl(w))}</div>
    <div class="lvl-sub">${r.days===1?t('Stufe {0} von 5 · nächste Wiederholung morgen',r.level):t('Stufe {0} von 5 · nächste Wiederholung in {1} Tagen',r.level,r.days)}</div>
    ${mascot(lk,null,'col')}</div>`;
  document.body.appendChild(el);
  let gone=false;
  const close=()=>{if(gone)return;gone=true;el.classList.add('out');setTimeout(()=>el.remove(),300);};
  el.onclick=close;setTimeout(close,2600);
  burst($('.lvl-badge',el),46);
}

function showEnd(){
  if(S.kind==='survival')return showSurvivalEnd();
  const t0=today();
  S.i=S.items.length;
  let firstToday=false;
  if(!state.done[t0]){state.done[t0]=true;firstToday=true;if(S.lost>0){(state.flawed||(state.flawed={}))[t0]=true;}}
  Object.keys(state.done).forEach(k=>{if(k<addDays(t0,-120)){delete state.done[k];if(state.flawed)delete state.flawed[k];}});
  save();
  const total=S.right+S.wrong,st=streak();
  const chips=(arr,txt)=>arr.length?`<div><p class="hint" style="margin-bottom:8px">${txt}</p><div class="missed">${arr.map(w=>`<span>${esc(w.id)}</span>`).join('')}</div></div>`:'';
  const grew=st>S.streak0,gray=firstToday&&S.lost>0;
  sheetBody(`<div class="smain"><div class="kicker" style="--k:var(--c-pink)">${t('Round beendet')}</div>
    <div class="bigword">${t('{0} von {1}',S.right,total)}</div><p class="hint">${t('Module geschafft')}</p>
    <div class="endstreak${grew?' grew':''}${st>0?' on':''}">${flameSvg(st,true)}<div><b>${st}</b>${st===1?t('Tag'):t('Tage')} ${t('in Folge')}<small>${grew?t('Serie verlängert!'):t('Die Serie läuft weiter.')}</small></div></div>
    ${gray?`<p class="hint">${t('Heute gibt es einen grauen Stempel. Ohne verlorenes Modul bekommst du den vollen mit Holo.')}</p>`:''}
    ${mascot(S.lost===0?'end_perfect':S.right/Math.max(1,total)>=.6?'end_good':'end_bad',null,'sm')}
    ${chips(S.cleared,t('Von der Fehlerliste gestrichen:'))}${chips(S.missed,t('Neu auf der Fehlerliste:'))}
    <button class="btn primary block" id="fin">${t('Fertig')}</button></div>`);
  $('#fin').onclick=closeSheet;
  sfx(S.lost===0?'end_perfect':S.right/Math.max(1,total)>=.6?'end_good':'end_bad',120);
  if(grew)sfx('stamp',900);
  if(grew)burst($('.endstreak'),44);else if(S.lost===0)burst($('.bigword'),32);
}

function showSurvivalEnd(){
  S.i=S.items.length;
  const all=S.words>=S.items.length&&S.lives>0,best=S.best,rec=S.score>best;
  if(rec){bestStore()[S.playmode]=S.score;}
  save();
  const pmName=S.playmode==='random'?t('Random'):playmodeLabel(S.playmode);
  sheetBody(`<div class="smain"><div class="kicker" style="--k:var(--c-pink)">${all?t('Survival komplett geschafft!'):t('Survival beendet')} · ${pmName}</div>
    <div class="bigword">${S.score}</div><p class="hint">${t('Punkte')} · ${t('{0} Wörter geschafft',S.words)}</p>
    <p class="hint">${rec?t('Neuer Rekord! Vorher: {0}',best):(best?t('Rekord: {0}. Noch {1} bis zum Rekord.',best,best-S.score+1):'')}</p>
    ${mascot(rec||all?'end_perfect':S.words>=5?'end_good':'end_bad',null,'sm')}
    <button class="btn primary block" id="again">${t('Nochmal spielen')}</button>
    <button class="btn block" id="fin">${t('Fertig')}</button></div>`);
  $('#fin').onclick=closeSheet;
  $('#again').onclick=()=>startRound('survival',{playmode:S.playmode});
  sfx(rec||all?'end_perfect':S.words>=5?'end_good':'end_bad',120);
  if(rec)burst($('.bigword'),52);
}

/* ===== Dewi in jedem Modul + „?“ =====
   Jedes Modul zeigt von Beginn an Dewi mit einem Spruch (QUIPS.task) in ihrer normalen Sprechblase im Fluss der Seite
   (bei Reels die Blase unter dem Automaten). Das „?“ lässt sie genervt seufzen (Stimmung „sigh“) und die Kurzbeschreibung
   des Moduls vorlesen, mit einem von fünf zufälligen Zusätzen (QUIPS.help_x). */
function helpBtn(id){return `<button class="qh" type="button" data-help="${id}" aria-expanded="false" aria-label="${t('Hilfe zu diesem Modul')}">?</button>`;}
function helpBox(q){
  const box=document.createElement('div');box.className='helpm';box.innerHTML=mascotHtml(q.mood,q.text,'sm');return box;
}
/* „?“: Dewi seufzt und liest die Kurzbeschreibung des Moduls vor (dieselbe wie auf der Survival-Kachel) */
function helpOpen(btn){
  if(!btn||!btn.isConnected)return;
  const id=btn.dataset.help,q=sayQuip('help_x',{d:MOD[id].desc()});
  const rl=$('#rlm',sheet);
  if(rl){rl.innerHTML=mascotHtml(q.mood,q.text,'sm');return;}   // Reels: die vorhandene Blase unter dem Automaten
  const old=$('.helpm',sheet),box=helpBox(q);
  if(old)old.replaceWith(box);else{const task=btn.parentElement;task.parentElement.insertBefore(box,task);}
  btn.setAttribute('aria-expanded','true');
}
/* Zu jedem Modul gehört von Anfang an Dewi mit einem Spruch; Reels bringt seine Blase selbst mit */
function helpAuto(id){
  if(id==='intro')return;
  const b=$('.qh[data-help="'+id+'"]',sheet);if(!b||$('#rlm',sheet))return;
  const task=b.parentElement;task.parentElement.insertBefore(helpBox(sayQuip('task')),task);
}
try{
  document.addEventListener('click',e=>{
    const b=e.target&&e.target.closest&&e.target.closest('.qh');if(!b)return;
    helpOpen(b);
  },true);
}catch(e){}
