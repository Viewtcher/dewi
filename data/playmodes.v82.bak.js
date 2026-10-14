/* ===== Playmodes =====
   Ein PLAYMODE legt fest, welche Module eine Round für jedes Wort einsetzt.
   - Random: Module gemischt, nie zweimal dasselbe hintereinander (so läuft die Daily Round, immer Random).
   - Solo:   genau ein Modul für alle Wörter. Nur im Survival wählbar. playmode = Modul-Kennung (blocks, typing, swipe, gap, choice).
   Die Modulwahl pro Karte steht in rounds.js (chooseModule). Hier liegt die Playmode-Wahl für den Survival Mode. */
const playmodeLabel=m=>{const x=MOD[m];return x?x.name():'';};
function openPlaymodes(kind){
  const N=survivalWords().length;
  if(N<1)return;
  sheet.hidden=false;document.body.style.overflow='hidden';S=null;
  const solo=MODULES.filter(m=>m.solo);
  const rec=pm=>{const b=bestFor(pm);return b?`<span class="mrec">${t('Rekord: {0}',fmtSc(b))}</span>`:'';};
  sheet.innerHTML=`<div class="sin modes surv"><div class="shead"><button class="iconbtn" id="mback" aria-label="${t('Zurück')}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
    <div><h1 class="mh">${t('Survival')}</h1><p class="hint">${t('{0} Wörter', N)} · ${t('3 Leben')}</p></div>${SURV_HEARTS}</div>
    <button class="mrand" data-playmode="random"><span class="mbadge">${t('Playmode')}</span>
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none" stroke="#1b0b26" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 36h8c8 0 10-20 18-20h12M38 8l8 8-8 8"/><path d="M6 16h8c3 0 5 3 7 6M30 30c2 3 4 6 8 6h8M38 28l8 8-8 8"/></svg>
      <span><b>${t('Random')}</b><small>${t('Alle Module gemischt, nie zweimal dasselbe hintereinander')}</small>${rec('random')}</span></button>
    <div class="eyebrow msolo">${t('Solo · nur ein Modul')}</div>
    <div class="mgrid">${solo.map(m=>{const n=soloWords(m.id).length,lock=n<SOLO_MIN;return `<button class="mtile ${m.tone}${lock?' locked':''}" data-playmode="${m.id}"${lock?' disabled':''}>${m.isNew?'<span class="mnew">'+t('NEU')+'</span>':''}${m.icon}<b>${m.name()}</b><small>${m.desc()}</small>${lock?`<small class="mlock">${t('Noch zu wenige passende Wörter ({0}/{1})',n,SOLO_MIN)}</small>`:rec(m.id)}</button>`;}).join('')}
      <div class="mtile soon" aria-hidden="true"><svg width="46" height="40" viewBox="0 0 46 40" fill="none" stroke="#a888ff" stroke-width="3" stroke-linecap="round"><path d="M8 20v0M16 12v16M24 6v28M32 12v16M40 20v0"/></svg><b>${t('Bald mehr')}</b><small>${t('Hören, Paare, Puzzle …')}</small></div></div>
    <p class="hint">${t('Jede Frage hat nur einen Versuch. Drei falsche Antworten und die Round ist vorbei. Je mehr Wörter du schaffst, desto höher dein Score.')}</p></div>`;
  sheet.scrollTop=0;
  $('#mback').onclick=openGamemodes;
  $$('[data-playmode]',sheet).forEach(b=>b.onclick=()=>b.disabled||startRound('survival',{playmode:b.dataset.playmode}));
}

/* ===== Gamemodes: Übersicht über alle Spielarten außerhalb der Daily Round; bisher nur Survival ===== */
/* kleine Herzen für Kopfzeile der Survival-Auswahl */
const SURV_HEARTS='<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="svh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#ffc0da"/></linearGradient></defs></svg><div class="hearts sm" aria-hidden="true">'+'<svg viewBox="0 0 24 24"><path d="M12 21.2s-8.1-4.9-10.3-9.9C.2 7.7 2.2 3.8 6.2 3.8c2.3 0 4 1.2 5.8 3.3 1.8-2.1 3.5-3.3 5.8-3.3 4 0 6 3.9 4.5 7.5C20.1 16.3 12 21.2 12 21.2z" fill="url(#svh)"/></svg>'.repeat(3)+'</div>';
function survivalCard(){
  const nSurv=survivalWords().length,bestR=bestFor('random'),doneToday=!!state.done[today()];
  const MINW=5,lockWhy=!doneToday?t('Gesperrt: erst die Daily Round für heute schaffen.'):nSurv<MINW?t('Gesperrt: du brauchst mindestens {0} bekannte Wörter, jetzt {1}.',MINW,nSurv):'';
  const heart=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.2s-8.1-4.9-10.3-9.9C.2 7.7 2.2 3.8 6.2 3.8c2.3 0 4 1.2 5.8 3.3 1.8-2.1 3.5-3.3 5.8-3.3 4 0 6 3.9 4.5 7.5C20.1 16.3 12 21.2 12 21.2z" fill="url(#svh)"/><ellipse cx="7.3" cy="8" rx="2.3" ry="1.5" transform="rotate(-35 7.3 8)" fill="#fff" opacity=".85"/></svg>`;
  return `<section class="card survcard${lockWhy?' locked':''}"><svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="svh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#ffc0da"/></linearGradient></defs></svg>
    <div class="srow"><div class="stxt"><div class="stitle">${t('Survival')}<button class="qh sq" type="button" id="survq" aria-expanded="false" aria-controls="survd" aria-label="${t('Hilfe zu diesem Modul')}">?</button></div>
      <p class="hint">${lockWhy?lockWhy:(bestR?t('Rekord: {0}',fmtSc(bestR)):t('Noch kein Rekord.'))}</p></div>
      <div class="hearts" aria-hidden="true">${heart}${heart}${heart}</div></div>
    <p class="sdesc" id="survd" hidden>${t('{0} Wörter, 3 Leben, ein Versuch pro Frage. Wie weit kommst du?',Math.max(nSurv,0))}</p>
    <button class="btn block" id="surv"${lockWhy?' disabled':''}>${lockWhy?LOCKIC:''}${t('Survival starten')}</button></section>`;
}
function openGamemodes(){
  sheet.hidden=false;document.body.style.overflow='hidden';S=null;
  sheet.innerHTML=`<div class="sin modes"><div class="shead"><button class="iconbtn" id="mback" aria-label="${t('Zurück')}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
    <div><h1 class="mh">${t('Gamemodes')}</h1></div></div>
    ${survivalCard()}
    <div class="mtile soon" aria-hidden="true" style="margin-top:12px;min-height:0"><b>${t('Bald mehr')}</b><small>${t('Mehr Gamemodes kommen')}</small></div></div>`;
  sheet.scrollTop=0;
  $('#mback').onclick=closeSheet;
  const v=$('#surv');if(v)v.onclick=()=>openPlaymodes('survival');
  const q=$('#survq');if(q)q.onclick=()=>{const d=$('#survd'),open=d.hidden;d.hidden=!open;q.setAttribute('aria-expanded',String(open));};
}
