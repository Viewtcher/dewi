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
  const rec=pm=>{const b=bestFor(pm);return b?`<span class="mrec">${t('Rekord: {0}',b)}</span>`:'';};
  sheet.innerHTML=`<div class="sin modes"><div class="shead"><button class="iconbtn" id="mback" aria-label="${t('Zurück')}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
    <div><h1 class="mh">${t('Survival')}</h1><p class="hint">${t('{0} Wörter', N)} · ${t('3 Leben')}</p></div></div>
    <button class="mrand" data-playmode="random"><span class="mbadge">${t('Playmode')}</span>
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none" stroke="#1b0b26" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 36h8c8 0 10-20 18-20h12M38 8l8 8-8 8"/><path d="M6 16h8c3 0 5 3 7 6M30 30c2 3 4 6 8 6h8M38 28l8 8-8 8"/></svg>
      <span><b>${t('Random')}</b><small>${t('Alle Module gemischt, nie zweimal dasselbe hintereinander')}</small>${rec('random')}</span></button>
    <div class="eyebrow msolo">${t('Solo · nur ein Modul')}</div>
    <div class="mgrid">${solo.map(m=>`<button class="mtile ${m.tone}" data-playmode="${m.id}">${m.isNew?'<span class="mnew">'+t('NEU')+'</span>':''}${m.icon}<b>${m.name()}</b><small>${m.desc()}</small>${rec(m.id)}</button>`).join('')}
      <div class="mtile soon" aria-hidden="true"><svg width="46" height="40" viewBox="0 0 46 40" fill="none" stroke="#a888ff" stroke-width="3" stroke-linecap="round"><path d="M8 20v0M16 12v16M24 6v28M32 12v16M40 20v0"/></svg><b>${t('Bald mehr')}</b><small>${t('Hören, Paare, Puzzle …')}</small></div></div>
    <p class="hint">${t('Jede Frage hat nur einen Versuch. Drei falsche Antworten und die Round ist vorbei. Je mehr Wörter du schaffst, desto höher dein Score.')}</p></div>`;
  sheet.scrollTop=0;
  $('#mback').onclick=closeSheet;
  $$('[data-playmode]',sheet).forEach(b=>b.onclick=()=>startRound('survival',{playmode:b.dataset.playmode}));
}
