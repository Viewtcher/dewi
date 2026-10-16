/* ===== Poker: die Daily Round als Pokerhand (Version 133) =====
   Grundlage: konzept-poker-shop.md (Nova), Abschnitte 2 und 3. Alles Rechnen steht hier, die Anzeige in rounds.js
   (ab Version 134 die gestalteten Poker-Screens).

   BLINDS     Vor jeder Hand wählt man Small (100) oder Big (300).
              Erste Daily Round des Tages: den Small Blind zahlt Dewi, der Big Blind ist freiwillig und kostet den vollen Betrag.
              „Noch eine Runde“: beide zahlt man selbst. Reicht das Konto nicht für den Small Blind, zahlt Dewi ihn
              höchstens einmal pro Tag (Rettung, daily().rescue). Danach: Hand ohne Einsatz (Auszahlung 0, Lernen geht immer).
              Der eigene Einsatz wird beim Start abgebucht.
   HAND       Alle gewerteten Module der Round (Review-Wörter + neues Wort am Ende). Das Kennenlernen zählt nicht.
   MULTIPLIKATOR  startet bei ×0, jedes geschaffte Modul +1. Verlorenes Modul: Small bleibt stehen, Big −1 (nie unter 0).
   ROYAL FLUSH    alle Module der Hand geschafft → Multiplikator am Ende verdoppelt (auch bei kleinen Händen).
   AUSZAHLUNG nur am Ende: (Einsatz + Serien-Bonus) × Multiplikator (× 2 bei Royal Flush). Den Bonus zahlt das Haus.
   SERIEN-BONUS   nach der Serie vor der Hand (was die Flamme bei der Blind-Wahl zeigt): 7 +10 %, 14 +20 %, 30 +30 %,
              50 +40 %, 100 +50 %, 365 +100 % (Obergrenze). Gilt auch, wenn Dewi zahlt.
   VERFALLEN  Eine pausierte Daily-Hand verfällt um Mitternacht samt Einsatz (openRun). Eine Hand, die gerade
              auf dem Bildschirm läuft, darf über Mitternacht zu Ende gespielt werden. Survival ist nicht betroffen. */
const BLINDS={small:100,big:300};
const BONUS_STEPS=[[365,100],[100,50],[50,40],[30,30],[14,20],[7,10]];   // Serie ab … Tage → Bonus in Prozent
const STREAK_MILES=BONUS_STEPS.map(x=>x[0]).reverse();                     // Meilensteine = Bonus-Stufen: 7, 14, 30, 50, 100, 365
function bonusPct(st){for(const [d,p] of BONUS_STEPS)if(st>=d)return p;return 0;}

/* Was die Blind-Wahl anbietet. paid: wer den Small Blind zahlt ('dewi' | 'self' | 'rescue' | 'none' = ohne Einsatz) */
function blindOffer(){
  const first=!state.done[today()],acc=state.chips|0,st=streak();
  const paid=first?'dewi':acc>=BLINDS.small?'self':!daily().rescue?'rescue':'none';
  return {first,acc,st,pct:bonusPct(st),small:{paid,stake:paid==='none'?0:BLINDS.small},big:{stake:BLINDS.big,ok:acc>=BLINDS.big}};
}
/* Neue Hand anlegen und den eigenen Einsatz abbuchen. blind: 'small' | 'big' */
function handNew(blind){
  const o=blindOffer();
  let h;
  if(blind==='big'&&o.big.ok){h={blind:'big',stake:BLINDS.big,paid:'self'};state.chips=(state.chips|0)-BLINDS.big;}
  else{
    h={blind:'small',stake:o.small.stake,paid:o.small.paid};
    if(h.paid==='self')state.chips=(state.chips|0)-BLINDS.small;
    if(h.paid==='rescue')daily().rescue=true;
  }
  state.chipShown=Math.min(state.chipShown|0,state.chips|0);   // Pille zeigt den Abzug sofort, ohne Einflug
  h.st=o.st;h.pct=o.pct;h.bonus=Math.round(h.stake*h.pct/100);h.mult=0;h.done=0;h.lost=0;h.date=today();
  save();
  return h;
}
/* Ein Modul der Hand ist gewertet. Gibt die Änderung des Multiplikators zurück (+1, −1 oder 0). */
function handSettle(h,ok){
  if(!h)return 0;
  h.done++;
  if(ok){h.mult++;return 1;}
  h.lost++;
  if(h.blind==='big'&&h.mult>0){h.mult--;return -1;}
  return 0;
}
/* Abrechnung am Ende der Hand. Schreibt die Chips gut und gibt die Rechnung zurück. */
function handPayout(h){
  if(!h)return null;
  const rf=h.done>0&&h.lost===0,mult=h.mult*(rf?2:1);
  const payout=(h.stake+h.bonus)*mult;
  chipAdd(payout);
  return {stake:h.stake,bonus:h.bonus,pct:h.pct,mult:h.mult,rf,payout,paid:h.paid,blind:h.blind,net:payout-(h.paid==='self'?h.stake:0)};
}

/* ----- Behelfs-Anzeige bis Version 134 (dann ersetzt durch die Poker-Screens) ----- */
/* Blind-Wahl als kleines Fenster. cb('small' | 'big'). Tests können mit window.__autoBlind eine Wahl vorgeben. */
function chooseBlind(cb){
  if(window.__test&&window.__autoBlind)return cb(window.__autoBlind);
  const o=blindOffer();
  const who={dewi:t('Dewi zahlt'),self:'',rescue:t('Dewi rettet dich (einmal am Tag)'),none:t('ohne Einsatz')}[o.small.paid];
  const box=document.createElement('div');box.className='askbox blindbox';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');
  box.innerHTML=`<div class="ask-back"></div><div class="ask-in"><b>${t('Dein Einsatz')}</b>
    <p>${o.pct?t('Serien-Bonus +{0} %',o.pct):t('Noch kein Serien-Bonus')}</p>
    <button class="btn primary block" id="blind-small">Small Blind ${o.small.stake?fmtChip(o.small.stake):''}${who?' · '+who:''}</button>
    <button class="btn block" id="blind-big"${o.big.ok?'':' disabled'}>Big Blind ${fmtChip(BLINDS.big)}</button>
    <button class="btn block ghost" id="blind-no">${t('Abbrechen')}</button></div>`;
  document.body.appendChild(box);
  const close=()=>box.remove();
  $('.ask-back',box).onclick=close;$('#blind-no',box).onclick=close;
  $('#blind-small',box).onclick=()=>{close();cb('small');};
  $('#blind-big',box).onclick=()=>{if(!o.big.ok)return;close();cb('big');};
  try{$('#blind-small',box).focus();}catch(e){}
}
/* Zeile im Kopf der Round: Einsatz, Bonus, Multiplikator */
function pokerRow(){
  const h=S&&S.kind==='daily'&&S.hand;if(!h||S.i>=S.items.length)return '';
  const name=h.blind==='big'?'Big Blind':'Small Blind';
  return `<div class="pkrow" id="pkrow"><span>${name} ${h.stake?fmtChip(h.stake):t('ohne Einsatz')}${h.pct?' · +'+h.pct+' %':''}</span><b id="pkmult">×${h.mult}</b></div>`;
}
/* Endscreen: die Rechnung in einer Zeile, z. B. „100 + 30 · ×4 · ×2 Royal Flush“ */
function payoutLine(P){
  if(!P)return '';
  const parts=[fmtChip(P.stake)+(P.bonus?' + '+fmtChip(P.bonus):''),'×'+P.mult];
  if(P.rf)parts.push('×2 Royal Flush');
  return `<p class="hint rv" id="epay">${parts.join(' · ')}${!P.payout&&P.paid==='self'?' · '+t('Einsatz weg'):''}</p>`;
}
window.__poker={bonusPct,blindOffer,handNew,handSettle,handPayout};
