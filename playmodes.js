/* ===== Playmodes =====
   Ein PLAYMODE legt fest, welche Module eine Round für jedes Wort einsetzt.
   - Random: Module gemischt, nie zweimal dasselbe hintereinander (so läuft die Daily Round, immer Random).
   - Solo:   genau ein Modul für alle Wörter. Nur im Survival wählbar. playmode = Modul-Kennung (blocks, typing, swipe, gap, choice).
   Die Modulwahl pro Karte steht in rounds.js (chooseModule). Hier liegt die Playmode-Wahl für den Survival Mode. */
const playmodeLabel=m=>{const x=MOD[m];return x?x.name():'';};
function openPlaymodes(kind){
  const N=survivalWords().length;
  if(N<1)return;
  const rush=kind==='rush';   // Version 163: dieselbe Auswahl (Random + Solo) auch für den Rush
  sheet.hidden=false;document.body.style.overflow='hidden';S=null;
  const solo=MODULES.filter(m=>m.solo);
  const rec=pm=>{const b=bestFor(rush?'rush:'+pm:pm);return b?`<span class="mrec">${rush?t('Bestzeit: {0}',fmtTime(b)):t('Rekord: {0}',fmtSc(b))}</span>`:'';};
  sheet.innerHTML=`<div class="sin modes surv${rush?' rushsel':''}"><div class="shead"><button class="iconbtn" id="mback" aria-label="${t('Zurück')}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
    <div><h1 class="mh">${rush?'Rush':t('Survival')}</h1><p class="hint">${rush?t('{0} Module · +{1} s pro Fehler',RUSH_N,RUSH_PEN):t('{0} Wörter', N)+' · '+t('3 Leben')}</p></div>${rush?RUSH_WATCH:SURV_HEARTS}</div>
    <button class="mrand" data-playmode="random"><span class="mbadge">${t('Playmode')}</span>
      <svg class="mdie" width="56" height="56" viewBox="0 0 56 56" aria-hidden="true"><rect x="5" y="5" width="46" height="46" rx="11" fill="#fff" stroke="#1b0b26" stroke-width="3.4"/><g fill="#1b0b26"><circle cx="18" cy="18" r="4"/><circle cx="38" cy="18" r="4"/><circle cx="28" cy="28" r="4"/><circle cx="18" cy="38" r="4"/><circle cx="38" cy="38" r="4"/></g></svg>
      <span><b>${t('Random')}</b><small>${t('Alle Module gemischt, nie zweimal dasselbe hintereinander')}</small>${rec('random')}</span></button>
    <div class="eyebrow msolo">${t('Solo · nur ein Modul')}</div>
    <div class="mgrid">${solo.map(m=>{const n=soloCount(m.id,SOLO_MIN),lock=n<SOLO_MIN,crs=lock&&courseWords(m.id).length>0;return `<button class="mtile ${m.tone}${lock?' locked':''}${crs?' course':''}" data-playmode="${m.id}"${crs?' data-course="1"':lock?' disabled':''}>${m.icon}<b>${m.name()}</b><small>${m.desc()}</small>${lock?`<small class="mlock">${t('Noch zu wenige passende Wörter ({0}/{1})',n,SOLO_MIN)}</small>${crs?`<small class="mcrs">${t('Antippen: Kurz-Einsteigerkurs')}</small>`:''}`:rec(m.id)}</button>`;}).join('')}
      <div class="mtile soon" aria-hidden="true"><svg width="46" height="40" viewBox="0 0 46 40" fill="none" stroke="#a888ff" stroke-width="3" stroke-linecap="round"><path d="M8 20v0M16 12v16M24 6v28M32 12v16M40 20v0"/></svg><b>${t('Bald mehr')}</b><small>${t('Hören, Paare, Puzzle …')}</small></div></div>
    <p class="hint">${rush?t('Zehn Module, so schnell du kannst. Jeder Fehler kostet {0} Sekunden.',RUSH_PEN):t('Jede Frage hat nur einen Versuch. Drei falsche Antworten und die Round ist vorbei. Je mehr Wörter du schaffst, desto höher dein Score.')}</p></div>`;
  sheet.scrollTop=0;
  $('#mback').onclick=openGamemodes;
  $$('[data-playmode]',sheet).forEach(b=>b.onclick=()=>b.dataset.course?startCourse(b.dataset.playmode,rush?'rush':'survival'):b.disabled||startRound(rush?'rush':'survival',{playmode:b.dataset.playmode}));   // Version 175: gesperrtes Pads/Slots startet den Einsteigerkurs
}

/* ===== Gamemodes: Übersicht über alle Spielarten außerhalb der Daily Round; bisher nur Survival ===== */
/* Offener Survival-Run: Kachel ganz oben, im Stil der Random-Kachel, aber mit Weiter-Symbol */
const CONTIC='<svg class="mdie" width="56" height="56" viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="23" fill="#fff" stroke="#1b0b26" stroke-width="3.4"/><path d="M23 18l16 10-16 10z" fill="#1b0b26"/></svg>';
function continueCard(){
  const r=openRun('survival')||openRun('rush');
  if(!r)return '';
  const pm=r.playmode==='random'?t('Random'):playmodeLabel(r.playmode);
  const left=r.items.length-r.i,rs=r.kind==='rush';
  return `<button class="mrand mcont" id="contrun" type="button">${CONTIC}
    <span><b>${t('Weiterspielen')}</b><small>${rs?'Rush · ':''}${esc(pm)} · ${rs?fmtTime((r.el|0)+(r.pen|0)*RUSH_PEN*1000):t('{0} Punkte',fmtSc(r.score))} · ${rs?t('noch {0} Module',left):t('noch {0} Wörter',left)}</small>
    <span class="mrec">${rs?t('Fehler: {0}',r.pen|0):t('{0} Leben übrig',r.lives)}</span></span></button>`;
}
/* Stoppuhr für die Kopfzeile der Rush-Auswahl (Version 166), steht dort wie die Herzen im Survival */
const RUSH_WATCH='<div class="rushwatch" aria-hidden="true"><svg viewBox="0 0 40 40" fill="none"><defs><linearGradient id="rwg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#cdb8ff"/></linearGradient></defs><rect x="16" y="2" width="8" height="4" rx="1.5" fill="url(#rwg)"/><path d="M31 8l3 3" stroke="url(#rwg)" stroke-width="3" stroke-linecap="round"/><circle cx="20" cy="23" r="14" fill="url(#rwg)"/><circle cx="20" cy="23" r="10.5" fill="#6a3de8" fill-opacity=".9"/><path d="M20 23V15M20 23l5 3" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></svg></div>';
/* kleine Herzen für Kopfzeile der Survival-Auswahl */
const SURV_HEARTS='<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="svh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#ffc0da"/></linearGradient></defs></svg><div class="hearts sm" aria-hidden="true">'+'<svg viewBox="0 0 24 24"><path d="M12 21.2s-8.1-4.9-10.3-9.9C.2 7.7 2.2 3.8 6.2 3.8c2.3 0 4 1.2 5.8 3.3 1.8-2.1 3.5-3.3 5.8-3.3 4 0 6 3.9 4.5 7.5C20.1 16.3 12 21.2 12 21.2z" fill="url(#svh)"/></svg>'.repeat(3)+'</div>';
function survivalCard(){
  const nSurv=survivalWords().length,bestR=bestFor('random');
  const MINW=5,lockWhy=nSurv<MINW?t('Gesperrt: du brauchst mindestens {0} bekannte Wörter, jetzt {1}.',MINW,nSurv):'';
  const heart=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.2s-8.1-4.9-10.3-9.9C.2 7.7 2.2 3.8 6.2 3.8c2.3 0 4 1.2 5.8 3.3 1.8-2.1 3.5-3.3 5.8-3.3 4 0 6 3.9 4.5 7.5C20.1 16.3 12 21.2 12 21.2z" fill="url(#svh)"/><ellipse cx="7.3" cy="8" rx="2.3" ry="1.5" transform="rotate(-35 7.3 8)" fill="#fff" opacity=".85"/></svg>`;
  const go=lockWhy?LOCKIC:'<svg class="gmgo" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  return `<section class="card survcard${lockWhy?' locked':''}"><svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="svh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#ffc0da"/></linearGradient></defs></svg>
    <div class="srow"><span class="stxt"><span class="stline"><button class="svgo" type="button" id="surv" aria-label="${t('Survival starten')}"${lockWhy?' disabled':''}><b class="stitle">${t('Survival')}</b></button><button class="qh sq" type="button" id="survq" aria-expanded="false" aria-controls="survd" aria-label="${t('Hilfe zu diesem Modul')}">?</button></span>
      <small class="hint">${lockWhy?lockWhy:(bestR?t('Rekord: {0}',fmtSc(bestR)):t('Noch kein Rekord.'))}</small></span>
      <span class="hearts" aria-hidden="true">${heart}${heart}${heart}</span>${go}</div>
    <p class="sdesc" id="survd" hidden>${t('{0} Wörter, 3 Leben, ein Versuch pro Frage. Wie weit kommst du?',Math.max(nSurv,0))}</p></section>`;
}
/* Rush-Kachel (Version 163): blau-türkis, Stoppuhr statt Herzen. Gesperrt unter RUSH_MIN bekannten Wörtern. */
function rushCard(){
  const nW=survivalWords().length,best=bestFor('rush:random');
  const lockWhy=nW<RUSH_MIN?t('Gesperrt: du brauchst mindestens {0} bekannte Wörter, jetzt {1}.',RUSH_MIN,nW):'';
  const watch='<svg class="rwatch" width="58" height="40" viewBox="0 0 58 40" fill="none" aria-hidden="true"><path d="M2 14h12M0 23h15M4 32h10" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".9"/><rect x="34" y="2" width="8" height="4" rx="1.5" fill="currentColor"/><circle cx="38" cy="23" r="14" fill="#fff" fill-opacity=".55" stroke="currentColor" stroke-width="3"/><path d="M38 23V14M38 23l6 4" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';
  const go=lockWhy?LOCKIC:'<svg class="gmgo" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  return `<section class="card survcard rushcard${lockWhy?' locked':''}">
    <div class="srow"><span class="stxt"><span class="stline"><button class="svgo" type="button" id="rush" aria-label="${t('Rush starten')}"${lockWhy?' disabled':''}><b class="stitle">Rush</b></button><button class="qh sq" type="button" id="rushq" aria-expanded="false" aria-controls="rushd" aria-label="${t('Hilfe zu diesem Modul')}">?</button></span>
      <small class="hint">${lockWhy?lockWhy:(best?t('Bestzeit: {0}',fmtTime(best)):t('Noch keine Bestzeit.'))}</small></span>
      ${lockWhy?'':watch}${go}</div>
    <p class="sdesc" id="rushd" hidden>${t('Zehn Module, so schnell du kannst. Jeder Fehler kostet {0} Sekunden.',RUSH_PEN)}</p></section>`;
}
function openGamemodes(){
  sheet.hidden=false;document.body.style.overflow='hidden';S=null;
  sheet.innerHTML=`<div class="sin modes"><div class="shead"><button class="iconbtn" id="mback" aria-label="${t('Zurück')}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
    <div><h1 class="mh">${t('Gamemodes')}</h1></div></div>
    ${continueCard()}
    ${survivalCard()}
    ${rushCard()}
    <div class="mtile soon" aria-hidden="true" style="margin-top:12px;min-height:0"><b>${t('Bald mehr')}</b><small>${t('Mehr Gamemodes kommen')}</small></div></div>`;
  sheet.scrollTop=0;
  $('#mback').onclick=closeSheet;
  const cc=$('#contrun');if(cc)cc.onclick=()=>resumeRun();
  const v=$('#surv');if(v)v.onclick=()=>openPlaymodes('survival');
  const sc=$('.survcard');if(sc)sc.onclick=ev=>{if(ev.target.closest('#surv,.qh,.sdesc'))return;if(v&&!v.disabled)openPlaymodes('survival');};
  const rv=$('#rush');if(rv)rv.onclick=()=>openPlaymodes('rush');
  const rc=$('.rushcard');if(rc)rc.onclick=ev=>{if(ev.target.closest('#rush,.qh,.sdesc'))return;if(rv&&!rv.disabled)openPlaymodes('rush');};
  const rq=$('#rushq');if(rq)rq.onclick=()=>{const d=$('#rushd'),open=d.hidden;d.hidden=!open;rq.setAttribute('aria-expanded',String(open));};
  const q=$('#survq');if(q)q.onclick=()=>{const d=$('#survd'),open=d.hidden;d.hidden=!open;q.setAttribute('aria-expanded',String(open));};
}
