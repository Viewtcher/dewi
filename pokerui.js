/* ===== Poker-Screens (Version 134) =====
   Gestaltung nach Novas Konzept (konzept-poker-shop.md, Abschnitte 0 und 5; Design-Canvas „dewi. Poker-Screens“, Reihe „Version 2“).
   Drei feste Zonen: oben Dewi (Kopf ca. 76 px, daneben Sprechblase oder Poker-Leiste, „?“ am Kopf), Mitte Inhalt,
   unten die Aktionszone (56 px). Eine Heldenzahl pro Screen (Archivo, breit, kursiv), Gold nur für den Multiplikator.
   Die Regeln stehen in poker.js, hier wird nur gezeigt.

   Blind-Wahl     showBlindStage(): eigener Screen im Round-Blatt. Tipp auf einen Chip: er gleitet weg, die Hand startet.
   Während der Hand  chipTrack() ersetzt den Fortschrittsbalken (geschafft = holo, solange der Royal Flush drin ist,
                  sonst pink/gold; verloren = grau; aktuell = gestrichelt). handZone() = Dewi-Kopf + Poker-Leiste,
                  das „?“ tauscht die Leiste gegen Dewis Erklärung. Multiplikator: springt hoch (+1), rutscht runter (−1, Big Blind),
                  blinkt grau (verloren beim Small Blind). Die Module selbst bleiben unverändert; ihr kleiner Dewi entfällt in der Hand. */
const FLAME_SM='<svg class="flsm" viewBox="0 0 24 30" aria-hidden="true" focusable="false"><path d="M12 2 C14 7 20 10 20 18 C20 24 16.5 28 12 28 C7.5 28 4 24 4 18 C4 13.5 7 11 8.5 8 C9.5 11 10.5 12 11.5 12 C11 8 11 5 12 2Z" fill="#ff8a3d" stroke="#2a1630" stroke-width="2.4" stroke-linejoin="round"/><path d="M12 15 C14 18 16 19.5 16 22 C16 24.5 14.2 26 12 26 C9.8 26 8 24.5 8 22 C8 19.8 10 18 12 15Z" fill="#ffc23d"/></svg>';
const XIC='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const bonusPill=(pct,id)=>pct?`<span class="bonuspill"${id?` id="${id}"`:''} role="img" aria-label="${t('Serien-Bonus +{0} %',pct)}">${FLAME_SM}<span aria-hidden="true">+${pct} %</span></span>`:'';
/* Sprechblase ohne Kopf (der Kopf sitzt schon in der Dewi-Zone). Gleiches Markup wie mascotHtml, damit die Schreibmaschine greift. */
function dzBubble(text){
  return `<div class="bubble dzb" role="status" data-ty="1" aria-label="${esc(text)}"><span aria-hidden="true">${Array.from(text).map(c=>`<span class="c">${esc(c)}</span>`).join('')}</span></div>`;
}
const dzHelp=key=>({
  blind:t('Jedes geschaffte Modul gibt +1 auf den Multiplikator. Am Ende zahle ich Einsatz mal Multiplikator, alles richtig gibt doppelt. Beim Big Blind kostet dich jeder Fehler ×1.'),
  small:t('Die goldene Zahl ist dein Multiplikator. Richtig: +1. Beim Small Blind kostet ein Fehler nichts. Schimmern alle Chips, ist der Royal Flush noch drin.'),
  big:t('Die goldene Zahl ist dein Multiplikator. Richtig: +1. Beim Big Blind kostet ein Fehler ×1. Schimmern alle Chips, ist der Royal Flush noch drin.')
})[key];
/* „?“ an Dewis Kopf: tauscht den Inhalt rechts neben ihr gegen ihre Erklärung und zurück */
function bindDz(helpKey){
  const q=$('#dzq'),body=$('#dzbody');if(!q||!body)return;
  let keep=null;
  q.onclick=e=>{
    e.stopPropagation();
    const open=q.getAttribute('aria-expanded')==='true';
    if(open){body.innerHTML=keep;keep=null;}else{keep=body.innerHTML;body.innerHTML=dzBubble(dzHelp(helpKey));}
    q.setAttribute('aria-expanded',String(!open));q.classList.toggle('on',!open);
  };
}
const dzHead=mood=>`<div class="dzhead">${activeChar().art(mood)}<button class="dzq" id="dzq" type="button" aria-label="${t('Erklärung')}" aria-expanded="false">?</button></div>`;
/* Dewis Gesicht in der Hand neu setzen (z. B. aus dem Modul Reels heraus) */
function dzFace(mood){const h=$('#dzone .dzhead .dw');if(h)h.outerHTML=activeChar().art(mood);}

/* ----- Blind-Wahl ----- */
function showBlindStage(kind,o){
  if(window.__test&&window.__autoBlind)return startRound(kind,Object.assign({},o,{blind:window.__autoBlind,force:1}));
  const B=blindOffer(),q=sayQuip('blind_'+B.small.paid);
  const badge={dewi:t('GRATIS'),rescue:t('RETTUNG'),none:t('OHNE EINSATZ'),self:''}[B.small.paid];
  sheet.hidden=false;document.body.style.overflow='hidden';
  sheet.innerHTML=`<div class="sin poker blindstage" id="blindstage">
    <div class="shead"><button class="iconbtn" id="quit" aria-label="${t('Schließen')}">${XIC}</button><span class="sp"></span>${chipPill('chippill2')}</div>
    <div class="dzone" id="dzone">${dzHead(q.mood)}<div class="dzbody" id="dzbody">${dzBubble(q.text)}</div></div>
    <div class="bsmain">
      <div class="bshead"><span class="eyebrow2">${t('DEIN EINSATZ')}</span>${bonusPill(B.pct,'bonuspill')}</div>
      <div class="bsgrid">
        <button class="bschip" id="blind-small" type="button" aria-label="Small Blind ${B.small.stake?fmtChip(B.small.stake):t('ohne Einsatz')}${badge?' · '+badge:''}">${badge?`<span class="bsbadge" aria-hidden="true">${badge}</span>`:''}${chipSvg('pink','bsc')}<span class="bsv" aria-hidden="true">${B.small.stake?fmtChip(B.small.stake):'0'}</span><span class="bsl" aria-hidden="true">SMALL</span></button>
        <button class="bschip" id="blind-big" type="button" aria-label="Big Blind ${fmtChip(BLINDS.big)}"${B.big.ok?'':' disabled'}>${chipSvg('gold','bsc')}<span class="bsv" aria-hidden="true">${fmtChip(BLINDS.big)}</span><span class="bsl" aria-hidden="true">BIG</span></button>
      </div>
    </div>
    <div class="actzone" aria-hidden="true"></div></div>`;
  sheet.scrollTop=0;
  $('#quit').onclick=closeSheet;
  bindDz('blind');
  let go=false;
  const pick=(b,btn)=>{
    if(go||btn.disabled)return;go=true;
    sfx('chips');haptic(20);
    btn.classList.add('go');
    const start=()=>startRound(kind,Object.assign({},o,{blind:b,force:1}));
    if(window.__test||reduceMotion())start();else setTimeout(start,420);
  };
  $('#blind-small').onclick=e=>pick('small',e.currentTarget);
  $('#blind-big').onclick=e=>pick('big',e.currentTarget);
}

/* ----- Während der Hand ----- */
/* Dewi-Chips als Fortschritt im Kopf der Round */
function chipTrack(){
  const h=S.hand,mods=S.items.map((x,i)=>({x,i})).filter(o=>o.x.kind!=='intro');
  const okN=mods.filter(o=>o.x.ok===true).length;
  const won=h.lost===0?'holo':h.blind==='big'?'gold':'pink';
  const cells=mods.map(({x,i})=>x.ok===true?chipSvg(won,'ct'+(won==='holo'?' sh':'')):x.ok===false?chipSvg('grey','ct'):i===S.i?chipSvg('empty','ct now'):'<i class="cslot"></i>').join('');
  return `<div class="ctrack" style="--n:${mods.length}" role="img" aria-label="${t('{0} von {1} Modulen geschafft',okN,mods.length)}">${cells}</div>`;
}
/* Poker-Leiste: Einsatz-Chip, Serien-Bonus, Multiplikator (Heldenzahl). anim: 'up' | 'down' | 'hold' | '' */
function pkBar(anim){
  const h=S.hand,m=h.mult,name=h.blind==='big'?'Big Blind':'Small Blind';
  const num=anim==='down'?`<span class="o" aria-hidden="true">×${m+1}</span><span class="n">×${m}</span>`:`<span class="n">×${m}</span>`;
  return `<div class="pkbar" id="pkrow"><div class="pkleft"><span class="pkstake">${chipSvg(h.blind==='big'?'gold':'pink','pks')}<span class="vh">${name} </span>${h.stake?fmtChip(h.stake):t('ohne Einsatz')}</span>${h.pct?`<span class="pkbonus">${FLAME_SM}+${h.pct} %</span>`:''}</div>
    <b class="pkm${anim?' '+anim:''}" id="pkmult" aria-label="${t('Multiplikator')} ×${m}">${num}</b></div>`;
}
function handZone(){
  const c=S.cur,h=S.hand;
  let anim='';
  if(c&&c.settled&&!c.pkAnim&&c.dm!==undefined){anim=c.dm>0?'up':c.dm<0?'down':!c.ok?'hold':'';}
  return `<div class="dzone hand" id="dzone">${dzHead(h.face||'sly')}<div class="dzbody" id="dzbody">${pkBar(anim)}</div></div>`;
}
/* Nach dem Einsetzen ins Blatt: Animation einmal pro Karte, Ton und Haptik dazu */
function handAfterRender(){
  const c=S&&S.cur;bindDz(S.hand.blind==='big'?'big':'small');
  if(!c||!c.settled||c.pkAnim||c.dm===undefined)return;
  c.pkAnim=true;
  if(c.dm>0){sfx('chipclick',120);haptic(12);}
}
window.__pokerui={showBlindStage,chipTrack,pkBar};
/* Endscreen-Rechnung (Behelf aus Version 133, wird in Version 135 durch die gestaltete Auszahlung ersetzt) */
function payoutLine(P){
  if(!P)return '';
  const parts=[fmtChip(P.stake)+(P.bonus?' + '+fmtChip(P.bonus):''),'×'+P.mult];
  if(P.rf)parts.push('×2 Royal Flush');
  return `<p class="hint rv" id="epay">${parts.join(' · ')}${!P.payout&&P.paid==='self'?' · '+t('Einsatz weg'):''}</p>`;
}
