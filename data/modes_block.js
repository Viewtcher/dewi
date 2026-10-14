/* ===== Moduswahl für freiwilliges Üben (Wiederholungsliste, Fehlerliste) ===== */
const MODES=[
  ['build','Bausteine','Satz aus Wortkacheln zusammensetzen','t1','<svg width="46" height="40" viewBox="0 0 46 40" aria-hidden="true"><rect x="2" y="22" width="19" height="14" rx="4" fill="#ffc23d"/><rect x="24" y="22" width="19" height="14" rx="4" fill="#ff8a3d"/><rect x="12" y="4" width="20" height="14" rx="4" fill="#ff5c9d"/></svg>'],
  ['type','Tippen','Übersetzung selbst schreiben','t2','<svg width="46" height="40" viewBox="0 0 46 40" fill="none" aria-hidden="true"><rect x="2" y="8" width="42" height="26" rx="7" stroke="#35dcd2" stroke-width="3"/><path d="M12 22h12" stroke="#35dcd2" stroke-width="3.4" stroke-linecap="round"/><path d="M30 14v14" stroke="#f566b9" stroke-width="3.4" stroke-linecap="round"/></svg>'],
  ['swipe','Swipe','Zwei Vorschläge, einer stimmt','t3','<svg width="52" height="40" viewBox="0 0 52 40" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="14" y="4" width="26" height="32" rx="7" fill="#f566b9" transform="rotate(8 27 20)"/><path d="M4 20h8M7 15l-5 5 5 5" stroke="#a888ff" stroke-width="3"/><path d="M48 20h-8M45 15l5 5-5 5" stroke="#35dcd2" stroke-width="3"/></svg>'],
  ['gap','Lückensatz','Fehlendes Wort im Satz einsetzen','t4','<svg width="46" height="40" viewBox="0 0 46 40" fill="none" stroke-linecap="round" aria-hidden="true"><path d="M3 14h12M31 14h12M3 30h40" stroke="#b9a5cc" stroke-width="3.4"/><rect x="17" y="8" width="12" height="12" rx="3" stroke="#ff8a3d" stroke-width="2.8" stroke-dasharray="4 3"/></svg>'],
  ['choice','Auswahl','Richtige Bedeutung aus vier Optionen','t5','<svg width="46" height="40" viewBox="0 0 46 40" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="40" height="12" rx="5" stroke="#6ee77a" stroke-width="3" fill="rgba(110,231,122,.18)"/><path d="M12 10l3 3 6-6" stroke="#6ee77a" stroke-width="2.8"/><rect x="3" y="22" width="40" height="12" rx="5" stroke="#8c76a3" stroke-width="3"/></svg>']
];
const modeLabel=m=>{const r=MODES.find(x=>x[0]===m);return r?t(r[1]):'';};
function openModes(kind){
  const p=plan(),words=kind==='vol'?p.vol:p.revVol,N=words.length;
  if(!N)return;
  const sizes=[5,10].filter(n=>n<N).concat([0]);                 // 0 = alle
  let rn=sizes.indexOf(state.roundN)>-1?state.roundN:(sizes.indexOf(10)>-1?10:0);
  sheet.hidden=false;document.body.style.overflow='hidden';S=null;
  const title=kind==='vol'?t('Fehlerliste'):t('Wiederholungsliste');
  sheet.innerHTML=`<div class="sin modes"><div class="shead"><button class="iconbtn" id="mback" aria-label="${t('Zurück')}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
    <div><h1 class="mh">${t('Wie willst du üben?')}</h1><p class="hint">${title} · ${t('{0} Wörter',N)}</p></div></div>
    <button class="mrand" data-mode="random"><span class="mbadge">${t('Standard')}</span>
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none" stroke="#1b0b26" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 36h8c8 0 10-20 18-20h12M38 8l8 8-8 8"/><path d="M6 16h8c3 0 5 3 7 6M30 30c2 3 4 6 8 6h8M38 28l8 8-8 8"/></svg>
      <span><b>${t('Zufällig')}</b><small>${t('Alle Übungen gemischt: Bausteine, Tippen, Swipe und mehr, wie bisher')}</small></span></button>
    <div class="mgrid">${MODES.map(m=>`<button class="mtile ${m[3]}" data-mode="${m[0]}">${m[0]==='swipe'?'<span class="mnew">'+t('NEU')+'</span>':''}${m[4]}<b>${t(m[1])}</b><small>${t(m[2])}</small></button>`).join('')}
      <div class="mtile soon" aria-hidden="true"><svg width="46" height="40" viewBox="0 0 46 40" fill="none" stroke="#a888ff" stroke-width="3" stroke-linecap="round"><path d="M8 20v0M16 12v16M24 6v28M32 12v16M40 20v0"/></svg><b>${t('Bald mehr')}</b><small>${t('Hören, Paare, Puzzle …')}</small></div></div>
    ${sizes.length>1?`<section class="card set"><div class="eyebrow">${t('Wörter pro Runde')}</div><div class="seg three" role="radiogroup" aria-label="${t('Wörter pro Runde')}">${sizes.map(n=>`<button role="radio" data-rn="${n}" aria-checked="${n===rn}">${n?n:t('Alle {0}',N)}</button>`).join('')}</div></section>`:''}</div>`;
  sheet.scrollTop=0;
  $('#mback').onclick=closeSheet;
  $$('[data-rn]',sheet).forEach(b=>b.onclick=()=>{rn=+b.dataset.rn;state.roundN=rn;save();$$('[data-rn]',sheet).forEach(x=>x.setAttribute('aria-checked',String(x===b)));});
  $$('[data-mode]',sheet).forEach(b=>b.onclick=()=>startSession(kind,{mode:b.dataset.mode,n:rn}));
}
