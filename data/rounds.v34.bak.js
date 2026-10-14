/* ===== Rounds =====
   Eine ROUND ist eine komplette Abfrage vom Start bis zum Ergebnis.
   - Daily Round: die Pflicht des Tages (Wiederholung, neue Wörter, Fehlerlisten-Wort), immer Playmode Random.
   - Freeplay: freiwillig aus der Wiederholungsliste (kind 'freeplay_review') oder der Fehlerliste ('freeplay_list'),
     Playmode Random oder Solo (ein Modul).
   S = Zustand der laufenden Round: items (Wörter), i (aktuelles Wort), cur (aktuelle Karte), playmode, kind … */
let S=null;

function startRound(kind,opt){
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

function closeSheet(){sheet.hidden=true;sheet.innerHTML='';document.body.style.overflow='';S=null;render();}

function sheetBody(inner){
  const pct=S.items.length?Math.round(S.i/S.items.length*100):0;
  sheet.innerHTML=`<div class="sin"><div class="shead"><button class="iconbtn" id="quit" aria-label="${t('Round beenden')}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button><div class="sbar" role="progressbar" aria-valuemin="0" aria-valuemax="${S.items.length}" aria-valuenow="${S.i}"><i style="width:${pct}%;--p:${Math.max(pct/100,0.05)}"></i></div><div class="scount">${Math.min(S.i+1,S.items.length)} / ${S.items.length}</div></div>${inner}</div>`;
  $('#quit').onclick=closeSheet;
  sheet.scrollTop=0;
}

function showItem(){
  const it=S.items[S.i];
  if(!it)return showEnd();
  const L=curLang(),key=normG(gl(it.w));
  const same=L.words.filter(x=>normG(gl(x))===key);
  const pr=(state.progress[L.id]||{})[it.w.k];
  const lvl=pr?pr.l:0;
  S.cur={w:it.w,type:it.type,lvl,tries:0,ok:true,steps:planCards(it.type,lvl,it.w,S.playmode),si:0,dir:Math.random()<.5?'id2gl':'gl2id',accept:same.map(x=>normId(x.id)),alts:same.filter(x=>x.k!==it.w.k).map(x=>x.id)};
  nextStep();
}

/* Nächste Karte der aktuellen Wort-Reihe. Sind alle Karten durch (nur im Playmode Solo), ist das Wort fertig. */
function nextStep(){
  const c=S.cur,id=c.steps[c.si++];
  if(id===undefined)return finish(true);
  MOD[id].show(c.w);
}

function kicker(c,id,dir){
  let base,col;
  if(c.type==='new'){base=t('Neue Vokabel · Phase {0} von {1}',c.steps.indexOf(id)+1,c.steps.length);col='var(--c-violet)';}
  else if(c.type==='list'){base=t('Fehlerliste');col='var(--lv0)';}
  else{base=t('Wiederholung · Stufe {0}',c.lvl);col=LVCOL[c.lvl];}
  const label=id==='intro'?t('Kennenlernen'):t('Modul {0}',MOD[id].name());
  const solo=(S&&S.playmode&&S.playmode!=='random')?` · <span class="only">${t('Solo')}</span>`:'';
  return `<div class="kicker" style="--k:${col}">${base} · ${label}${dir?' · '+dir:''}${solo}</div>`;
}

function finish(typedOk){
  const c=S.cur,w=c.w,ok=c.ok&&typedOk,type=c.type,r=record(w,ok,type);
  if(ok)S.right++;else S.wrong++;
  if(!ok&&type!=='list')S.missed.push(w);
  if(ok&&type==='list')S.cleared.push(w);
  const L=curLang();
  S.run=ok?(S.run||0)+1:0;
  let qk,qc={n:ok?S.run:r.n,w:w.id,lv:c.lvl};
  if(ok)qk=c.tries>1&&typedOk?'ok_try2':S.run>=3&&S.run%3===0?'ok_run':'ok';
  else qk=type==='list'&&r.n>=2?'bad_again':c.lvl>=3?'bad_rare':'bad';
  const alts=c.dir==='gl2id'&&c.alts.length?`<p class="hint" style="margin-top:6px">${t('Auch richtig: {0}',c.alts.map(esc).join(', '))}</p>`:'';
  const typoNote=c.typo?`<p class="hint" style="margin-top:6px">${t('Kleiner Tippfehler. Richtig geschrieben: {0}','<b lang="'+(c.dir==='gl2id'?L.code.toLowerCase():state.ui)+'">'+esc(c.dir==='gl2id'?w.id:glFirst(w))+'</b>')}</p>`:'';
  let when;
  if(ok&&type==='list')when=t('Geschafft. Das Wort verlässt die Fehlerliste und kommt morgen wieder (Stufe 1).');
  else if(ok)when=r.days===1?t('Stufe {0} von 5. Nächste Wiederholung morgen.',r.level):t('Stufe {0} von 5. Nächste Wiederholung in {1} Tagen.',r.level,r.days);
  else if(type==='list')when=t('Das Wort bleibt auf der Fehlerliste (Fehler: {0}).',r.n);
  else when=(typedOk?t('Eine Übung davor war falsch.')+' ':'')+t('Das Wort kommt auf die Fehlerliste.');
  sheetBody(`<div class="smain"><div class="res ${ok?'good':'bad'}" role="status"><div class="rl">${ok?t('Richtig'):t('Leider falsch')}</div>
    <div class="pair"><span lang="${L.code.toLowerCase()}">${esc(w.id)}</span><em>=</em><span lang="${state.ui}">${esc(gl(w))}</span></div>${typoNote}${alts}</div>
    <p class="hint">${when}</p>${mascot(qk,qc,'sm')}<button class="btn primary block" id="next">${t('Weiter')}</button></div>`);
  const n=$('#next');n.onclick=()=>{S.i++;showItem();};
  try{n.focus({preventScroll:true});}catch(e){}
  if(ok)levelUp(c,r);
}

/* Vollbild-Animation bei richtigem Wort: Strahlen, Level-Abzeichen, Stufenleiste */
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
  const t0=today();
  S.i=S.items.length;
  const p=plan();
  if(!p.rev&&!p.fresh.length&&!p.mand)state.done[t0]=true;
  Object.keys(state.done).forEach(k=>{if(k<addDays(t0,-120))delete state.done[k];});
  save();
  const total=S.items.length,st=streak();
  const chips=(arr,txt)=>arr.length?`<div><p class="hint" style="margin-bottom:8px">${txt}</p><div class="missed">${arr.map(w=>`<span>${esc(w.id)}</span>`).join('')}</div></div>`:'';
  const grew=st>S.streak0;
  sheetBody(`<div class="smain"><div class="kicker" style="--k:var(--c-pink)">${t('Round beendet')}</div>
    <div class="bigword">${t('{0} von {1}',S.right,total)}</div><p class="hint">${t('komplett richtig beantwortet')}</p>
    <div class="endstreak${grew?' grew':''}${st>0?' on':''}">${flameSvg(st,true)}<div><b>${st}</b>${st===1?t('Tag'):t('Tage')} ${t('in Folge')}<small>${grew?t('Serie verlängert!'):t('Die Serie läuft weiter.')}</small></div></div>
    ${mascot(S.right===total?'end_perfect':S.right/total>=.6?'end_good':'end_bad',null,'sm')}
    ${chips(S.cleared,t('Von der Fehlerliste gestrichen:'))}${chips(S.missed,t('Neu auf der Fehlerliste:'))}
    <button class="btn primary block" id="fin">${t('Fertig')}</button></div>`);
  $('#fin').onclick=closeSheet;
  sfx(S.right===total?'end_perfect':S.right/total>=.6?'end_good':'end_bad',120);
  if(grew)sfx('stamp',900);
  if(grew)burst($('.endstreak'),44);else if(S.right===total)burst($('.bigword'),32);
}
