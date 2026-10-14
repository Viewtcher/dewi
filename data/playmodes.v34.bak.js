/* ===== Playmodes =====
   Ein PLAYMODE legt fest, welche Module eine Round für jedes Wort einsetzt.
   - Random: Module gemischt, abhängig von Stufe und Wortart (so läuft die Daily Round).
   - Solo:   genau ein Modul für alle Wörter, wählbar bei Freeplay. playmode = Modul-Kennung (blocks, typing, swipe, gap, choice).
   planCards(...) liefert die Kartenreihe eines Wortes als Liste von Modul-Kennungen. */

/* Random: welches Satz-Modul bekommt dieses Wort? (Swipe ca. 30 %, sonst Lückensatz oder Auswahl, ohne Satz Bausteine) */
function pickSentenceModule(w){
  const s=sentOf(w);
  if(Math.random()<(window.__swipeP==null?.3:window.__swipeP))return 'swipe';
  if(s){
    const gp=gapParts(s,w);
    return (gp&&Math.random()<.5)?'gap':'choice';
  }
  return MOD.blocks.can(w)?'blocks':null;
}
/* Kartenreihe: neu = Kennenlernen, Satz-Modul, Tippen. Stufe 1-2 und Fehlerliste = Satz-Modul, Tippen. Ab Stufe 3 nur Tippen. */
function planCards(type,lvl,w,playmode){
  if(playmode&&playmode!=='random')return [resolveModule(playmode,w)];
  const sm=pickSentenceModule(w),sent=sm?[sm]:[];
  if(type==='new')return ['intro'].concat(sent,['typing']);
  if(type==='list'||lvl<=2)return sent.concat(['typing']);
  return ['typing'];
}

/* Playmode-Wahl für Freeplay */
const playmodeLabel=m=>{const x=MOD[m];return x?x.name():'';};
function openPlaymodes(kind){
  const p=plan(),words=kind==='freeplay_list'?p.vol:p.revVol,N=words.length;
  if(!N)return;
  const sizes=[5,10].filter(n=>n<N).concat([0]);                 // 0 = alle
  let rn=sizes.indexOf(state.roundN)>-1?state.roundN:(sizes.indexOf(10)>-1?10:0);
  sheet.hidden=false;document.body.style.overflow='hidden';S=null;
  const title=kind==='freeplay_list'?t('Fehlerliste'):t('Wiederholungsliste');
  const solo=MODULES.filter(m=>m.solo);
  sheet.innerHTML=`<div class="sin modes"><div class="shead"><button class="iconbtn" id="mback" aria-label="${t('Zurück')}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
    <div><h1 class="mh">${t('Playmode')}</h1><p class="hint">${t('Freeplay')} · ${title} · ${t('{0} Wörter',N)}</p></div></div>
    <button class="mrand" data-playmode="random"><span class="mbadge">${t('Standard')}</span>
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none" stroke="#1b0b26" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 36h8c8 0 10-20 18-20h12M38 8l8 8-8 8"/><path d="M6 16h8c3 0 5 3 7 6M30 30c2 3 4 6 8 6h8M38 28l8 8-8 8"/></svg>
      <span><b>${t('Random')}</b><small>${t('Alle Module gemischt, passend zur Stufe, wie in der Daily Round')}</small></span></button>
    <div class="eyebrow msolo">${t('Solo · nur ein Modul')}</div>
    <div class="mgrid">${solo.map(m=>`<button class="mtile ${m.tone}" data-playmode="${m.id}">${m.isNew?'<span class="mnew">'+t('NEU')+'</span>':''}${m.icon}<b>${m.name()}</b><small>${m.desc()}</small></button>`).join('')}
      <div class="mtile soon" aria-hidden="true"><svg width="46" height="40" viewBox="0 0 46 40" fill="none" stroke="#a888ff" stroke-width="3" stroke-linecap="round"><path d="M8 20v0M16 12v16M24 6v28M32 12v16M40 20v0"/></svg><b>${t('Bald mehr')}</b><small>${t('Hören, Paare, Puzzle …')}</small></div></div>
    ${sizes.length>1?`<section class="card set"><div class="eyebrow">${t('Wörter pro Round')}</div><div class="seg three" role="radiogroup" aria-label="${t('Wörter pro Round')}">${sizes.map(n=>`<button role="radio" data-rn="${n}" aria-checked="${n===rn}">${n?n:t('Alle {0}',N)}</button>`).join('')}</div></section>`:''}</div>`;
  sheet.scrollTop=0;
  $('#mback').onclick=closeSheet;
  $$('[data-rn]',sheet).forEach(b=>b.onclick=()=>{rn=+b.dataset.rn;state.roundN=rn;save();$$('[data-rn]',sheet).forEach(x=>x.setAttribute('aria-checked',String(x===b)));});
  $$('[data-playmode]',sheet).forEach(b=>b.onclick=()=>startRound(kind,{playmode:b.dataset.playmode,n:rn}));
}
