/* ===== Rounds =====
   Eine ROUND ist eine komplette Abfrage vom Start bis zum Ergebnis. Es gibt zwei Arten:

   DAILY ROUND (kind 'daily'), immer Playmode Random, keine Leben:
     Stage 1  Einführung  das neue Wort (Modul intro, „Weiter“ erst nach ein paar Sekunden)
     Stage 2  Review      4 bekannte Wörter (Vorrang: fällige Wörter auf Stufe 0; dann überfällige und zufällige fällige,
                          aufgefüllt mit noch nicht fälligen), zum Schluss das neue Wort noch einmal (Tippen oder Bausteine).
     Pro Wort genau ein Modul, nie zweimal dasselbe Modul hintereinander. Fehlerrecht je Modul: siehe TRIES.
     Wird ein Modul verloren, fällt das Wort auf Stufe 0 und ist morgen fällig (Version 131, die Fehlerliste ist entfallen).

   SURVIVAL (kind 'survival', früher Freeplay), nur nach der Daily Round:
     Alle begonnenen Wörter (auch Stufe 0), jedes einmal, gemischt. 3 Leben insgesamt, pro Karte ein Versuch. Score mit Serienbonus,
     eigener Rekord je Playmode. Ein richtiges Wort steigt wie in der Daily Round eine Stufe (einmal pro Tag und Wort).

   S = Zustand der laufenden Round: items (Karten), i (aktuelle Karte), cur (aktuelle Karte mit Wort und Modul), kind, playmode … */
let S=null;

/* Versuche pro Modul (Daily Round): ein Fehler erlaubt = 2 Versuche, Tippen 2 Fehler = 3 Versuche, Swipe nur 1 Versuch.
   Im Survival hat jede Karte nur einen Versuch. */
const TRIES={swipe:1,typing:3,blocks:2,gap:2,choice:2,reels:2,order:1};
const triesFor=id=>(S&&S.kind==='survival')?1:(TRIES[id]||2);
/* Version 123: Die Herzen stehen jetzt links in der Score-Zeile (siehe scoreRow), nicht mehr im Modul. */
const roundLives=()=>'';
/* Fortschritt zum nächsten Herz, 0 bis knapp 1 (nur solange ein Herz fehlt) */
const healProg=()=>(S&&S.kind==='survival'&&S.lives<HEART_MAX&&S.run>0)?(S.run%HEART_STREAK)/HEART_STREAK:0;
const HEART_STREAK=8,HEART_MAX=3;   // 8 richtige in Folge geben ein verlorenes Herz zurück, nie mehr als am Start
window.__introMs=(typeof window.__introMs==='number')?window.__introMs:3000;   // Sperre des „Weiter“ in der Einführung (Tests setzen 0)

/* Punkte pro richtigem Wort im Survival (intern und angezeigt gleich, z. B. 137):
   Grundpunkte je Modul (leichte weniger, schwere mehr), Perfekt-Bonus +25 % (ohne „?“, ohne Tippfehler),
   danach Serien-Multiplikator: ab 3 in Folge x1,5, ab 5 x2, ab 10 x2,5, ab 15 x3, ab 20 x4. */
const SURV_BASE={swipe:61,choice:73,gap:88,reels:97,order:112,blocks:124,typing:149};
function survMult(run){return run>=20?4:run>=15?3:run>=10?2.5:run>=5?2:run>=3?1.5:1;}
function survPoints(mod,run,perfect){return Math.round((SURV_BASE[mod]||80)*(perfect?1.25:1)*survMult(run));}
const bestStore=()=>{const m=state.best||(state.best={});return m[state.lang]||(m[state.lang]={});};
const bestFor=pm=>bestStore()[pm]||0;
/* Score-Anzeige: Punkte mit Tausenderpunkt. */
function fmtSc(n){return fmtRaw(n);}
function fmtRaw(v){return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g,state.ui==='de'?'.':',');}
function scRecLine(){
  if(!S||S.kind!=='survival')return '';
  const b=S.best||0,sh=S.shown||0;
  if(b&&sh>b)return t('Neuer Rekord!');
  return b?t('Rekord: {0}',fmtSc(b)):'';
}
function scoreRow(){
  if(!S||S.kind!=='survival'||S.i>=S.items.length)return '';
  return `<div class="scrow">${livesHtml(S.lives,-1,healProg())}<div class="scbox"><div class="scline"><span class="scl">Score</span><b class="scnum" id="scnum">${fmtSc(S.shown||0)}</b></div><small id="screc">${scRecLine()}</small></div></div>`;
}
/* Nach einem Modul: Zahl wird kurz groß und tickt in 100er-Schritten nach oben. */
function scoreTick(){
  if(!S||S.kind!=='survival')return;
  const from=S.shown||0,to=S.score;
  if(to<=from)return;
  S.shown=to;
  const el=$('#scnum');if(!el)return;
  const fin=()=>{const e=$('#scnum');if(e){e.textContent=fmtSc(to);e.classList.remove('bump');}const r=$('#screc');if(r)r.textContent=scRecLine();};
  if(reduceMotion()){fin();return;}
  const t0=Date.now(),dur=Math.min(900,450+(to-from)*0.6),a=from,z=to;
  el.classList.add('bump');
  const step=()=>{
    const e=$('#scnum');if(!e)return;
    const k=Math.min(1,(Date.now()-t0)/dur),v=a+(z-a)*(1-Math.pow(1-k,2.2));   // schnell los, am Ende sanft
    e.textContent=fmtRaw(k>=1?z:v);
    if(k<1)setTimeout(step,28);else setTimeout(fin,220);
  };
  step();
}

function dailyCards(){
  const p=plan(),cards=[];
  if(p.fresh)cards.push({w:p.fresh,kind:'intro',type:'new'});
  p.review.forEach(w=>cards.push({w,kind:'review',type:'review'}));
  if(p.fresh)cards.push({w:p.fresh,kind:'final',type:'new'});
  return cards;
}
function survivalWords(){
  const L=curLang(),prog=state.progress[L.id]||{};
  return L.words.filter(w=>prog[w.k]);   // Version 131: auch Wörter auf Stufe 0
}
/* Solo-Playmode: nur Wörter, die zum gewählten Modul passen (kein Ersatzmodul). Zu wenige passende Wörter = Solo gesperrt. */
const SOLO_MIN=3;
const soloWords=pm=>{const m=MOD[pm];return survivalWords().filter(w=>!m||!m.can||m.can(w));};
/* ===== Offener Run (Version 114) =====
   Beim Abbrechen oder Verlassen der App soll man dort weitermachen, wo man war.
   Gespeichert wird vor jeder Karte: welche Wörter in welcher Reihenfolge, die Stelle im Run,
   Leben, Punkte, Serie und die bereits gewerteten Wörter. Wörter stehen als Schlüssel drin,
   damit der Spielstand klein bleibt und sich beim Laden gegen die aktuelle Wortliste prüfen lässt.
   Die angefangene Karte beginnt beim Fortsetzen von vorn (halb gesetzte Kacheln lassen sich nicht retten). */
function saveRun(){
  if(!S||!S.items||S.i>=S.items.length)return;
  state.run={v:1,lang:state.lang,kind:S.kind,playmode:S.playmode,i:S.i,
    items:S.items.map(x=>({k:x.w.k,kind:x.kind,type:x.type,ok:x.ok})),
    right:S.right,wrong:S.wrong,missed:S.missed.map(w=>w.k),
    streak0:S.streak0,last:S.last,lives:S.lives,score:S.score,shown:S.score,run:S.run,words:S.words,lost:S.lost,best:S.best,hand:S.hand||null,date:S.date||today()};
  save();
}
function clearRun(){if(state.run){state.run=null;save();}}
/* Liefert den offenen Run, wenn er zur aktuellen Lernsprache passt und alle Wörter noch existieren */
function openRun(kind){
  const r=state.run;
  if(!r||r.v!==1||r.lang!==state.lang)return null;
  if(kind&&r.kind!==kind)return null;
  const L=curLang();if(!L)return null;
  const by={};L.words.forEach(w=>{by[w.k]=w;});
  if(!r.items||!r.items.length||r.items.some(x=>!by[x.k]||x.kind==='repair'))return null;   // Runs von vor Version 131 mit Reparatur-Karten verfallen
  if(r.i>=r.items.length)return null;
  if(r.kind==='daily'&&r.date&&r.date<today()){state.run=null;save();return null;}   // Version 133: pausierte Daily-Hand verfällt um Mitternacht samt Einsatz
  return r;
}
function resumeRun(){
  const r=openRun();if(!r)return false;
  const L=curLang(),by={};L.words.forEach(w=>{by[w.k]=w;});
  S={items:r.items.map(x=>({w:by[x.k],kind:x.kind,type:x.type,ok:x.ok})),i:r.i,right:r.right,wrong:r.wrong,
     missed:(r.missed||[]).map(k=>by[k]).filter(Boolean),
     cur:null,streak0:r.streak0,kind:r.kind,playmode:r.playmode,last:r.last,lives:r.lives,score:r.score,
     shown:r.score,run:r.run,words:r.words,lost:r.lost,best:r.best,hand:r.hand||null,date:r.date||today()};
  sheet.hidden=false;document.body.style.overflow='hidden';
  showItem();
  return true;
}
/* Kleine Rückfrage, bevor ein offener Run verworfen wird */
function askDiscard(cb){
  const r=openRun();if(!r)return cb();
  const o=document.createElement('div');o.className='askbox';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');
  const what=r.kind==='survival'?t('Survival'):t('Daily Round'),hand=r.kind==='daily';   // Version 133: eine Daily-Hand lässt sich nicht verwerfen
  o.innerHTML=`<div class="ask-back"></div><div class="ask-in"><b>${hand?t('Offene Hand'):t('Offener Run: {0}',what)}</b>
    <p>${hand?t('Erst die offene Hand zu Ende spielen.'):t('Wenn du neu startest, ist der alte Run weg.')}</p>
    ${hand?'':`<button class="btn primary block" id="askgo">${t('Trotzdem neu starten')}</button>`}
    <button class="btn block" id="askon">${t('Weiterspielen')}</button>
    <button class="btn block ghost" id="askno">${t('Abbrechen')}</button></div>`;
  document.body.appendChild(o);
  const close=()=>o.remove();
  $('.ask-back',o).onclick=close;$('#askno',o).onclick=close;
  if(!hand)$('#askgo',o).onclick=()=>{close();clearRun();cb();};
  $('#askon',o).onclick=()=>{close();resumeRun();};
  try{($('#askgo',o)||$('#askon',o)).focus();}catch(e){}
}
function startRound(kind,opt){
  const o=opt||{},open=openRun();
  if(!o.force&&open){
    if(open.kind==='daily'&&kind!=='survival')return resumeRun();   // offene Daily-Hand: nur weiterspielen
    return askDiscard(()=>startRound(kind,Object.assign({force:1},o)));
  }
  if(kind!=='survival'&&!o.blind)return showBlindStage(kind,o);   // erst der Einsatz (Version 133), als eigener Screen (Version 134)
  clearRun();
  const pool=kind==='survival'&&o.playmode&&o.playmode!=='random'?soloWords(o.playmode):survivalWords();
  if(kind==='survival'&&o.playmode&&o.playmode!=='random'&&pool.length<SOLO_MIN)return;
  const items=kind==='survival'?shuffle(pool).map(w=>({w,kind:'surv',type:'review'})):dailyCards();
  if(!items.length)return;
  S={items,i:0,right:0,wrong:0,missed:[],cur:null,streak0:streak(),kind:kind||'daily',playmode:o.playmode||'random',
     last:null,lives:3,score:0,shown:0,run:0,words:0,lost:0,best:kind==='survival'?bestFor(o.playmode||'random'):0,
     hand:kind==='survival'?null:handNew(o.blind),date:today()};
  sheet.hidden=false;document.body.style.overflow='hidden';
  showItem();
}

function closeSheet(){sheet.hidden=true;sheet.innerHTML='';sheet.classList.remove('shop-open');document.body.style.overflow='';S=null;render();}

function sheetBody(inner){
  const pct=S.items.length?Math.round(S.i/S.items.length*100):0;
  const hand=S.kind==='daily'&&S.hand&&S.i<S.items.length;   // Version 134: Pokerhand mit Dewi-Chips und Dewi-Zone
  const prog=hand?chipTrack():`<div class="sbar" role="progressbar" aria-valuemin="0" aria-valuemax="${S.items.length}" aria-valuenow="${S.i}"><i style="width:${pct}%;--p:${Math.max(pct/100,0.05)}"></i></div><div class="scount">${Math.min(S.i+1,S.items.length)} / ${S.items.length}</div>`;
  sheet.innerHTML=`<div class="sin${hand?' hand':''}"><div class="shead"><button class="iconbtn" id="quit" aria-label="${hand?t('Round pausieren'):t('Round beenden')}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>${prog}${musIcon()}</div>${scoreRow()}${hand?handZone():''}${inner}</div>`;
  $('#quit').onclick=closeSheet;
  if(hand)handAfterRender();
  sheet.scrollTop=0;
  if(S.kind==='survival'&&S.score>(S.shown||0))setTimeout(scoreTick,350);
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
  saveRun();
  const L=curLang(),w=it.w,key=normG(gl(w));
  const same=L.words.filter(x=>normG(gl(x))===key);
  const pr=(state.progress[L.id]||{})[w.k];
  const lvl=pr?pr.l:0;
  S.cur={w,card:it,type:it.type,lvl,tries:0,ok:true,settled:false,module:null,dir:Math.random()<.5?'id2gl':'gl2id',accept:same.reduce((a,x)=>a.concat([normId(x.id)],(x.alts||[]).map(normId)),[]),alts:same.filter(x=>x.k!==w.k).map(x=>x.id)};
  if(it.kind==='intro'){S.cur.module='intro';return MOD.intro.show(w);}
  if(S.kind==='survival'&&S.playmode!=='random'&&MOD[S.playmode]&&!MOD[S.playmode].can(w)){S.i++;return showItem();}   // Solo: nie ein fremdes Modul, Karte überspringen
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
      if(S.run%HEART_STREAK===0&&S.lives<HEART_MAX){S.lives++;c.healed=true;setLives(S.lives,S.lives-1);haptic([20,40,20]);setTimeout(heartMoment,420);}
      c.perfect=!c.helped&&!c.typo;c.pts=survPoints(c.module,S.run,c.perfect);S.score+=c.pts;setTimeout(scoreTick,350);
      const dq=daily();
      if(dq.got.indexOf(w.k)<0)r=record(w,true,'review');   // Stufe +1, aber nur einmal pro Tag und Wort
      else{const pr=(state.progress[state.lang]||{})[w.k]||{};r={level:pr.l||1,days:0,same:true};}
    }else{S.wrong++;S.lives--;setLives(S.lives);if(S.kind==='survival'&&S.lives<=0)window.__gover=Date.now();}
  }else{
    r=record(w,ok,c.type);
    if(ok)S.right++;else{S.wrong++;S.lost++;S.missed.push(w);}
    c.dm=handSettle(S.hand,ok);   // Multiplikator der Pokerhand: +1, −1 (Big Blind) oder 0
    card.ok=ok;                   // für die Dewi-Chips im Kopf (auch nach dem Fortsetzen)
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
  if(S.kind==='survival'){base='Survival';col='var(--c-pink)';}
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
  if(S.kind==='survival')return good?`<p class="hint" style="margin-top:8px">+${fmtSc(c.pts)} ${t('Punkte')}${S.run>=3?' · '+t('{0} in Folge',S.run):''}${c.healed?' · '+t('Serie von {0}: ein Herz kommt zurück!',HEART_STREAK):''}</p>`:`<p class="hint" style="margin-top:8px">${t('Ein Leben weniger.')}</p>`;
  if(!good)return `<p class="hint" style="margin-top:8px">${t('Das Wort fällt auf Stufe 0 und kommt morgen wieder.')}</p>`;
  if(r.saved)return `<p class="hint" style="margin-top:8px">${t('Geschafft. Das Wort kommt morgen wieder (Stufe 1).')}</p>`;
  return `<p class="hint" style="margin-top:8px">${r.days===1?t('Stufe {0} von 5. Nächste Wiederholung morgen.',r.level):t('Stufe {0} von 5. Nächste Wiederholung in {1} Tagen.',r.level,r.days)}</p>`;
}

/* Ergebnis des Moduls Tippen (die anderen Module zeigen ihr Ergebnis selbst) */
function finish(typedOk){
  const c=S.cur,w=c.w,L=curLang(),r=settleCard(typedOk),ok=c.ok,type=c.type;
  let qk,qc={n:ok?S.run:(r.n||1),w:w.id,lv:c.lvl};
  if(ok)qk=c.tries>1&&typedOk?'ok_try2':S.run>=3&&S.run%3===0?'ok_run':'ok';
  else qk=(r.n||1)>=2?'bad_again':c.lvl>=3?'bad_rare':'bad';   // Fehlerzähler des Wortes (bleibt seit Version 131 im Wort)
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
  const lab=r.saved?t('Gerettet!'):type==='new'?t('Neues Wort!'):(r.level>c.lvl?t('Level up!'):t('Stufe gehalten'));
  const el=document.createElement('div');el.className='lvl';el.setAttribute('role','status');
  const lk=r.saved?'lvl_saved':type==='new'?'lvl_new':(r.level>c.lvl?'lvl_up':'lvl_hold');
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

/* ===== Endscreen der Daily Round (Version 110) =====
   Zwei Momente statt einer Wand: erst das Ergebnis (ab Version 133 mit der Auszahlung der Pokerhand) und Dewis Kommentar,
   dann die Serie allein groß. Danach schließt sich die Round von selbst. */
function showEnd(){
  if(S.kind==='survival')return showSurvivalEnd();
  clearRun();
  const t0=today();
  S.i=S.items.length;
  let firstToday=false;
  if(!state.done[t0]){state.done[t0]=true;firstToday=true;if(S.lost>0){(state.flawed||(state.flawed={}))[t0]=true;}}
  Object.keys(state.done).forEach(k=>{if(k<addDays(t0,-120)){delete state.done[k];if(state.flawed)delete state.flawed[k];}});
  save();
  const total=S.right+S.wrong,st=streak();
  const grew=st>S.streak0,gray=firstToday&&S.lost>0;
  /* Version 133: Chips gibt es nur noch aus der Auszahlung der Pokerhand (poker.js) */
  const P=S.hand&&!S.paidOut?handPayout(S.hand):null;S.paidOut=true;
  const E={total,st,grew,gray,chips:P?P.payout:0,pay:P,first:firstToday};
  if(P)payoutStage(E);else endResult(E);   // Version 135: gestaltete Auszahlung; endResult nur noch für Runs von vor Version 133
}
/* ===== Bühnen-Helfer für die Endscreens (Version 126) =====
   Ein Ablaufplan (q) setzt Schritte zeitversetzt; ein Tipp auf die Bühne springt zum Endzustand.
   In Tests laufen alle Schritte sofort und der Endzustand steht gleich da. */
const CNT={p:0};
function stageSeq(){
  const q={items:[],at(ms,f){
      if(window.__test){f();return;}
      const it={f,done:false};it.id=setTimeout(()=>{it.done=true;f();},ms);q.items.push(it);},
    skip(){q.items.forEach(it=>{if(!it.done){clearTimeout(it.id);it.done=true;it.f();}});q.skipped=true;},
    stop(){q.items.forEach(it=>{if(!it.done){clearTimeout(it.id);it.done=true;}});}};
  return q;
}
/* Zahl zählt hoch (ease-out) und tickt mit steigender Tonhöhe; q.skip setzt sie sofort auf den Endwert */
function countTo(el,from,to,ms,fmt,q,tick){
  if(!el)return;
  if(window.__test||reduceMotion()||to<=from){el.textContent=fmt(to);return;}
  const t0=performance.now();let last=-1,lt=0;el.textContent=fmt(from);
  const iv=setInterval(()=>{
    const k=Math.min(1,(performance.now()-t0)/ms),v=Math.round(from+(to-from)*(1-Math.pow(1-k,3)));
    if(v!==last){last=v;el.textContent=fmt(v);
      if(tick&&performance.now()-lt>58){lt=performance.now();CNT.p=k;sfx('counttick');}}
    if(k>=1)clearInterval(iv);},30);
  q.at(ms,()=>{clearInterval(iv);el.textContent=fmt(to);});
}
const on=id=>{const e=$('#'+id);if(e)e.classList.add('on');};
/* Tipp auf die Bühne: Ablauf überspringen. Gibt true zurück, wenn noch etwas lief. */
function stageTap(q,stage){
  stage.addEventListener('click',e=>{
    if(q.skipped||e.target.closest('button,a'))return;
    q.skip();
  });
}
/* Schritt 1: „x von y“ zählt hoch, dann der Gewinn in Chips (falls es einen gibt), dann Dewi und Weiter */
function endResult(E){
  const good=S.lost===0?'end_perfect':S.right/Math.max(1,E.total)>=.6?'end_good':'end_bad';
  const full=t('{0} von {1}','\u0001',E.total).split('\u0001');
  sheetBody(`<div class="smain endstage" id="est"><div class="kicker" style="--k:var(--c-pink)">${t('Round beendet')}</div>
    <div class="bigword es-big${S.lost===0?' perf':''}" id="ebig">${esc(full[0])}<span id="enum">0</span>${esc(full[1]||'')}</div>
    <p class="hint rv" id="esub">${t('Module geschafft')}</p>
    ${E.chips?`<div class="chipline rv" id="egem">${chipSvg('pink')}<b id="egn">+0</b></div>`:''}
    <div class="rv" id="emas">${mascot(good,null,'sm')}</div>
    <button class="btn primary block rv" id="endnext">${E.first?t('Weiter'):t('Fertig')}</button></div>`);
  const q=stageSeq(),stage=$('#est');
  stageTap(q,stage);
  const cd=Math.min(1100,350+S.right*170);
  let T=250;
  q.at(T,()=>countTo($('#enum'),0,S.right,cd,v=>String(v),q,true));
  T+=cd+120;
  q.at(T,()=>{const b=$('#ebig');if(b)b.classList.add('lock');sfx('lockin');haptic(25);on('esub');if(S.lost===0)burst($('#ebig'),34);});
  T+=520;
  if(E.chips){
    const cm=Math.min(1100,450+E.chips*.4);
    q.at(T,()=>{on('egem');sfx('chips');countTo($('#egn'),0,E.chips,cm,v=>'+'+fmtChip(v),q,true);});
    T+=cm+250;
    q.at(T-200,()=>{const g=$('#egn');if(g){g.textContent='+'+fmtChip(E.chips);g.classList.add('pulse');}});
  }
  q.at(T,()=>{on('emas');sfx(good);});
  T+=450;
  q.at(T,()=>{$$('.rv',stage).forEach(e=>e.classList.add('on'));});
  $('#endnext').onclick=()=>{if(!$('#endnext').classList.contains('on'))return;if(E.first)streakMoment(E);else closeSheet();};   // Serie nur beim ersten Spielen des Tages
  if(window.__test)$$('.rv',stage).forEach(e=>e.classList.add('on'));
}
/* ===== Große Momente (Version 123) =====
   Herz-Regeneration und Serienstand bekommen je eine eigene Bühne über dem ganzen Bildschirm.
   Ein Tipp irgendwo schließt sie. Die Einblendung hängt am body, nicht im Sheet,
   damit der Flächen-Tipp der Ergebnis-Screens nicht mitfeuert. */
function moment(kind,inner,onClose){
  const old=$('.moment');if(old)old.remove();
  const el=document.createElement('div');
  el.className='moment '+kind;el.setAttribute('role','status');
  if(kind.indexOf('streak')===0)el.id='fin';   // Tests und Tastatur finden den Abschluss
  el.innerHTML=`<div class="mm-in">${inner}<div class="mm-tap">${t('Tippen zum Fortfahren')}</div></div>`;
  document.body.appendChild(el);
  let gone=false;
  el.onclick=()=>{
    if(gone)return;gone=true;
    if(window.__test){el.remove();if(onClose)onClose();return;}   // Tests warten nicht auf das Ausblenden
    el.classList.add('out');setTimeout(()=>{el.remove();if(onClose)onClose();},260);
  };
  return el;
}
/* Herz zurück: rosa Puls, Herzschlag, Funken */
function heartMoment(){
  const el=moment('heart',`<div class="mm-art"><svg viewBox="0 0 24 24" aria-hidden="true">${HEART}</svg></div>
    <div class="mm-big">+1</div>
    <div class="mm-lab">${t('Herz zurück')}</div>
    <div class="mm-sub">${t('{0} richtige in Folge',HEART_STREAK)}</div>`);
  sfx('heartback');haptic([20,90,20]);burst($('.mm-art',el),30);
}
/* Serie am Ende der Daily Round: Flamme steigt auf, Funkenflug, Zahl groß */
function streakMoment(E){
  const st=E.st,ms=E.grew&&STREAK_MILES.indexOf(st)>=0;   // Version 133: Meilensteine = Stufen des Serien-Bonus
  const em=[];for(let i=0;i<11;i++)em.push(`<i style="left:${6+i*8.6}%;animation-delay:${(i*.19).toFixed(2)}s"></i>`);
  /* Gewachsene Serie: alte Zahl rutscht weg, neue rastet ein (Level-up) */
  const num=E.grew&&st>1?`<div class="mm-roll"><b class="ro" aria-hidden="true">${st-1}</b><b class="rn">${st}</b></div>`:`<div class="mm-big">${st}</div>`;
  const el=moment('streak'+(ms?' ms':''),`<div class="mm-art"><div class="mm-em">${em.join('')}</div>${flameSvg(st,true)}</div>
    ${num}
    <div class="mm-lab">${st===1?t('Tag'):t('Tage')} ${t('in Folge')}</div>
    ${ms?`<div class="mm-ms">${t('Meilenstein!')}</div><div class="mm-sub" id="mmbonus">${t('Serien-Bonus jetzt +{0} %',bonusPct(st))}</div>`:''}
    <div class="mm-sub">${E.grew?t('Serie verlängert!'):t('Die Serie läuft weiter.')}</div>`,closeSheet);
  if(E.grew){
    sfx(ms?'milestone':'streakup');
    setTimeout(()=>{if(document.body.contains(el)){haptic(ms?[30,60,30,60,50]:[30,70,30]);burst($('.mm-roll',el)||$('.mm-art',el),ms?90:46);}},window.__test?0:900);
  }else sfx('pop');
}

function showSurvivalEnd(){
  clearRun();
  S.i=S.items.length;
  const all=S.words>=S.items.length&&S.lives>0,best=S.best,rec=S.score>best;
  if(rec){bestStore()[S.playmode]=S.score;}
  const gS=chipSurvival(S.words);   // Version 132: 5 Chips pro Wort, max. 300 am Tag, kein Rekord-Bonus
  save();
  const pmName=S.playmode==='random'?t('Random'):playmodeLabel(S.playmode);
  const mood=rec||all?'end_perfect':S.words>=5?'end_good':'end_bad';
  sheetBody(`<div class="smain endstage" id="est"><div class="kicker" style="--k:var(--c-pink)">${all?t('Survival komplett geschafft!'):t('Survival beendet')} · ${pmName}</div>
    <div class="es-lab">${all?t('Survival komplett geschafft!'):t('Survival beendet')} · ${pmName}</div>
    <div class="bigword es-big${rec?' recd':''}" id="ebig"><span id="snum">${fmtSc(0)}</span></div>
    <p class="hint">${t('Punkte')} · ${t('{0} Wörter geschafft',S.words)}</p>
    <p class="${rec?'es-rec':'hint'} rv" id="srec">${rec?t('Neuer Rekord! Vorher: {0}',fmtSc(best)):(best?t('Rekord: {0}. Noch {1} bis zum Rekord.',fmtSc(best),fmtSc(best-S.score+1)):'')}</p>
    <div class="rv" id="sgem">${chipLine(gS)}</div>
    <div class="rv" id="smas">${mascot(mood,null,'sm')}</div>
    <div class="es-btns rv" id="sbtn"><button class="btn primary block" id="again">${t('Nochmal spielen')}</button>
    <button class="btn block" id="fin">${t('Fertig')}</button></div></div>`);
  $('#fin').onclick=closeSheet;
  $('#again').onclick=()=>startRound('survival',{playmode:S.playmode});
  const q=stageSeq(),stage=$('#est');
  stageTap(q,stage);
  const cd=Math.min(2300,Math.max(900,500+S.score*.5));
  q.at(300,()=>countTo($('#snum'),0,S.score,cd,fmtSc,q,true));
  let T=300+cd+100;
  q.at(T,()=>{const b=$('#ebig');if(b)b.classList.add('lock');sfx(rec?'milestone':'lockin');haptic(rec?[30,60,30,60,50]:25);on('srec');if(rec)burst($('#ebig'),80);});
  T+=rec?900:500;
  q.at(T,()=>{on('sgem');if(gS)sfx('chips');});T+=450;
  q.at(T,()=>{on('smas');sfx(mood);});T+=400;
  q.at(T,()=>{on('sbtn');});
  if(window.__test){$$('.rv',stage).forEach(e=>e.classList.add('on'));}
  else q.at(T,()=>{$$('.rv',stage).forEach(e=>e.classList.add('on'));});
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
  if(S&&S.cur)S.cur.helped=true;
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

/* ---- Schneller weiter: nach der Antwort geht ein Tipp oder Wisch auf die freie Fläche wie der Weiter-Button ---- */
(function(){
  const ADV_SKIP='button,a,input,textarea,select,label,.tile,.otile,.reel,.cab,.swcard,.qh,.helpm,.bslot,[role=button]';
  const wd=()=>t('Weiter');
  function advBtn(){
    const n=$('#nx')||$('#next');if(n&&!n.disabled)return n;
    const c=$('#chk');if(c&&!c.disabled&&c.textContent.trim()===wd())return c;
    const g=$('#go');if(g&&!g.disabled&&g.textContent.trim()===wd())return g;
    return null;
  }
  const ready=b=>{if(!b)return false;if(!b.__t)b.__t=Date.now();return Date.now()-b.__t>450;};
  /* taucht der Weiter-Button auf, wird er bei Bedarf in den sichtbaren Bereich gescrollt (kurz warten, bis Platz frei wurde) */
  const reveal=b=>setTimeout(()=>{if(b.isConnected&&!sheet.hidden){try{b.scrollIntoView({block:'nearest',behavior:reduceMotion()?'auto':'smooth'});}catch(e){}}},340);
  new MutationObserver(()=>{const b=advBtn();if(b&&!b.__t){b.__t=Date.now();if(b.id!=='go')reveal(b);}}).observe(sheet,{childList:true,subtree:true,characterData:true});
  sheet.addEventListener('click',e=>{
    if(sheet.hidden||e.target.closest(ADV_SKIP))return;
    const b=advBtn();if(ready(b))b.click();
  });
  let p0=null;
  sheet.addEventListener('pointerdown',e=>{p0=e.target.closest(ADV_SKIP)?null:{x:e.clientX,y:e.clientY};});
  sheet.addEventListener('pointerup',e=>{
    const p=p0;p0=null;if(!p||sheet.hidden)return;
    const dx=e.clientX-p.x,dy=e.clientY-p.y;
    if(Math.abs(dx)>60&&Math.abs(dy)<70){const b=advBtn();if(ready(b))b.click();}
  });
})();
