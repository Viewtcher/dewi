/* ===== Poker-Screens (Version 134) =====
   Gestaltung nach Novas Konzept (konzept-poker-shop.md, Abschnitte 0 und 5; Design-Canvas „dewi. Poker-Screens“, Reihe „Version 2“).
   Drei feste Zonen: oben Dewi (Kopf ca. 76 px, daneben Sprechblase oder Poker-Leiste, „?“ am Kopf), Mitte Inhalt,
   unten die Aktionszone (56 px). Eine Heldenzahl pro Screen (Archivo, breit, kursiv), Gold nur für den Multiplikator.
   Die Regeln stehen in poker.js, hier wird nur gezeigt.

   Blind-Wahl     showBlindStage(): eigener Screen im Round-Blatt. Tipp auf einen Chip: er gleitet weg, die Hand startet.
   Während der Hand  chipTrack() ersetzt den Fortschrittsbalken (geschafft = holo, solange der Royal Flush drin ist,
                  sonst pink/gold; verloren = grau; aktuell = gestrichelt). Seit Version 136 darunter nur eine kleine Zeile
                  wie im Survival (pkBar): Einsatz, ×, Multiplikator weiß leuchtend, „?“. Dewi erscheint in der Hand nur in den Modulen.
                  Multiplikator: springt hoch (+1), rutscht runter (−1, Big Blind), blinkt grau (verloren beim Small Blind). */
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
  big:t('Die goldene Zahl ist dein Multiplikator. Richtig: +1. Beim Big Blind kostet ein Fehler ×1. Schimmern alle Chips, ist der Royal Flush noch drin.'),
  pay:t('Einsatz plus Serien-Bonus, mal Multiplikator. Alles richtig gibt doppelt. Mathe, Darling. Keine Magie.')
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
/* Poker-Zeile (Version 136): klein wie Score und Herzen im Survival. Links bleibt frei, rechts Einsatz-Chip mit Betrag,
   kleines ×, Multiplikator weiß leuchtend wie der Survival-Score, daneben ein kleines „?“ für die Regeln.
   anim: 'up' (springt hoch, Chip-Klick) | 'down' (rutscht runter, Big Blind) | 'hold' (blinkt grau, Small Blind) | '' */
function pkBar(anim){
  const h=S.hand,m=h.mult,name=h.blind==='big'?'Big Blind':'Small Blind';
  const num=anim==='down'?`<span class="o" aria-hidden="true">${m+1}</span><span class="n">${m}</span>`:`<span class="n">${m}</span>`;
  return `<div class="pkrow" id="pkrow"><span class="pkspace"></span><div class="pkright"><span class="pkstake">${chipSvg(h.blind==='big'?'gold':'pink','pks')}<span class="vh">${name} </span>${h.stake?fmtChip(h.stake):t('ohne Einsatz')}</span><span class="pkx" aria-hidden="true">×</span><b class="pkm${anim?' '+anim:''}" id="pkmult" aria-label="${t('Multiplikator')} ×${m}">${num}</b><button class="pkq" id="pkq" type="button" aria-label="${t('Erklärung')}" aria-expanded="false">?</button></div></div><p class="pkhelp" id="pkhelp" hidden>${dzHelp(h.blind==='big'?'big':'small')}</p>`;
}
function handZone(){
  const c=S.cur;
  let anim='';
  if(c&&c.settled&&!c.pkAnim&&c.dm!==undefined){anim=c.dm>0?'up':c.dm<0?'down':!c.ok?'hold':'';}
  return pkBar(anim);
}
/* Nach dem Einsetzen ins Blatt: „?“ verbinden, Animation einmal pro Karte, Ton und Haptik dazu */
function handAfterRender(){
  const q=$('#pkq'),hp=$('#pkhelp');
  if(q&&hp)q.onclick=e=>{e.stopPropagation();const open=hp.hidden;hp.hidden=!open;q.setAttribute('aria-expanded',String(open));q.classList.toggle('on',open);};
  const c=S&&S.cur;
  if(!c||!c.settled||c.pkAnim||c.dm===undefined)return;
  c.pkAnim=true;
  if(c.dm>0){sfx('chipclick',120);haptic(12);}
}
window.__pokerui={showBlindStage,chipTrack,pkBar};
/* ===== Auszahlung und Royal Flush (Version 135) =====
   Gleicher Aufbau für jede Auszahlung, damit nichts springt (Design-Canvas „Auszahlung2“ und „Royal2“):
   oben Chip-Pille und Dewi (erst nur ihr Kopf, am Ende ihr Spruch), Mitte Ergebnis-Chips, Gewinn als Heldenzahl
   mit Einsatz-Chip davor, darunter klein die Rechnung (Einsatz + Flamme Bonus, Multiplikator in Gold), unten „Weiter“.
   Bühne in Schritten (stageSeq/countTo aus Version 126), ein Tipp springt zum Endzustand.
   Royal Flush: Schriftzug in Holo zwischen zwei Diamanten, Holo-Chips, „×5 ×2“, Chipregen, eigene Fanfare (sfx royal).
   Bei ×0: der Einsatz-Chip rutscht zu Dewi rüber, die Heldenzahl bleibt eine graue 0, Dewi bissig. */
const DIAMOND='<svg class="rfdia" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 3h10l4 6-9 12L3 9z" fill="#b48cff" stroke="#2a1630" stroke-width="1.4" stroke-linejoin="round"/><path d="M3 9h18L12 21z" fill="#7d4dff"/><path d="M9.5 9L12 21l2.5-12" fill="#a77bff"/><path d="M3 9h18" stroke="#fff" stroke-opacity=".55" stroke-width="1"/></svg>';
function payoutStage(E){
  const P=E.pay,h=S.hand,rf=P.rf,zero=!P.payout;
  const mods=S.items.filter(x=>x.kind!=='intro'),okN=mods.filter(x=>x.ok).length;
  const won=rf?'holo':h.blind==='big'?'gold':'pink',tone=h.blind==='big'?'gold':'pink';
  const qk=rf?'pay_rf':zero?(P.paid==='self'?'pay_zero':'pay_zero_free'):P.mult>=3?'pay_good':'pay_low';
  const q=sayQuip(qk,{n:okN,m:mods.length}),face=rf?'cash':q.mood;
  const after=state.chips|0,before=after-P.payout;
  state.chipShown=after;save();   // die Pille zählt hier hoch, der Startscreen muss nicht noch einmal einfliegen lassen
  sheet.innerHTML=`<div class="sin poker paystage${rf?' rf':''}" id="est"><div class="kicker" style="--k:var(--c-pink)">${t('Round beendet')}</div>
    <div class="shead"><span class="sp"></span>${chipPill('chippill2')}</div>
    <div class="dzone" id="dzone">${dzHead(h.face||'sly')}<div class="dzbody" id="dzbody"></div></div>
    <div class="pomain">
      ${rf?`<div class="rftitle rv" id="ertitle">${DIAMOND}<span>ROYAL FLUSH</span>${DIAMOND}</div>`:''}
      <div class="porow" role="img" aria-label="${t('{0} von {1} Modulen geschafft',okN,mods.length)}">${mods.map((x,i)=>`<span class="pochip" id="poc${i}">${chipSvg(x.ok?won:'grey','pc')}</span>`).join('')}</div>
      <div class="pohero rv${zero?' zero':''}" id="egem"><span class="phw">${chipSvg(tone,'phc')}</span><b id="egn">${zero?'0':'+0'}</b></div>
      <p class="poline rv" id="epay">${fmtChip(P.stake)}${P.bonus?` <i>+</i> <span class="pobonus">${FLAME_SM}${fmtChip(P.bonus)}</span>`:''} <span class="pomult" id="epm">×${P.mult}${rf?' ×2':''}</span>${zero&&P.paid==='self'?`<span class="vh"> · ${t('Einsatz weg')}</span>`:''}</p>
    </div>
    <button class="btn primary block actbtn rv" id="endnext">${E.first?t('Weiter'):t('Fertig')}</button></div>`;
  sheet.scrollTop=0;
  const pillN=$('#chippill2 b');if(pillN)pillN.textContent=fmtChipShort(before);
  bindDz('pay');
  const q2=stageSeq(),stage=$('#est');
  stageTap(q2,stage);
  let T=250;
  mods.forEach((x,i)=>{q2.at(T+i*90,()=>{on('poc'+i);sfx('chipclick');});});
  T+=mods.length*90+180;
  q2.at(T,()=>{on('egem');sfx(zero?'pop':'chips');haptic(15);});
  T+=320;
  q2.at(T,()=>{on('epay');});
  if(zero){
    T+=350;
    q2.at(T,()=>{const c=$('#egem .phw'),d=$('#dzone .dzhead');
      if(c&&d&&!window.__test&&!reduceMotion()&&c.animate){const a=c.getBoundingClientRect(),b=d.getBoundingClientRect();
        c.animate([{transform:'none',opacity:1},{transform:`translate(${b.left+b.width/2-a.left-a.width/2}px,${b.top+b.height/2-a.top-a.height/2}px) scale(.35)`,opacity:0}],{duration:650,easing:'cubic-bezier(.5,0,.75,0)',fill:'forwards'});}
      else if(c)c.classList.add('gone');});
    T+=600;
  }else{
    if(rf){T+=300;q2.at(T,()=>{on('ertitle');const m=$('#epm');if(m)m.classList.add('flash');sfx('royal');haptic([30,60,30,60,50]);chipRain(46,['holo','gold','pink']);});T+=550;}
    const cm=Math.min(1100,450+P.payout*.3);
    T+=200;
    q2.at(T,()=>{countTo($('#egn'),0,P.payout,cm,v=>'+'+fmtChip(v),q2,true);if(pillN)countTo(pillN,before,after,cm,fmtChipShort,q2,false);});
    T+=cm+150;
    q2.at(T,()=>{const g=$('#egn');if(g){g.textContent='+'+fmtChip(P.payout);g.classList.add('pulse');}if(pillN)pillN.textContent=fmtChipShort(after);sfx('lockin');burst($('#egem'),rf?60:30);});
  }
  T+=420;
  q2.at(T,()=>{dzFace(face);const b=$('#dzbody');if(b&&!b.querySelector('.bubble'))b.innerHTML=dzBubble(q.text);sfx(rf?'end_perfect':zero?'end_bad':'end_good');});
  T+=450;
  q2.at(T,()=>{$$('.rv,.pochip',stage).forEach(e=>e.classList.add('on'));});
  $('#endnext').onclick=()=>{if(!$('#endnext').classList.contains('on'))return;q2.stop();if(E.first)streakMoment(E);else closeSheet();};
  if(window.__test)$$('.rv,.pochip',stage).forEach(e=>e.classList.add('on'));
}
/* Startscreen: Hinweis unter „Weiterspielen“, z. B. „Big Blind 300 · ×3 · verfällt um Mitternacht“ */
function openHandHint(){
  const r=openRun('daily'),h=r&&r.hand;if(!h)return '';
  return `<p class="ohint" id="ohint">${h.blind==='big'?'Big Blind':'Small Blind'} ${h.stake?fmtChip(h.stake):t('ohne Einsatz')} · <b>×${h.mult}</b> · ${t('verfällt um Mitternacht')}</p>`;
}
/* Abend-Sticheln: ab 21 Uhr bei offener Hand (Testhaken window.__hour) */
const hourNow=()=>window.__test&&typeof window.__hour==='number'?window.__hour:new Date().getHours();
const lateHand=()=>hourNow()>=21&&!!(openRun('daily')||{}).hand;
