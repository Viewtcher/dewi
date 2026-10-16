/* ===== Poker: die Daily Round als Pokerhand (Version 133) =====
   Grundlage: konzept-poker-shop.md (Nova), Abschnitte 2 und 3. Alles Rechnen steht hier, die Anzeige in rounds.js
   und in pokerui.js (die gestalteten Poker-Screens, ab Version 134).

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
  h.st=o.st;h.pct=o.pct;h.bonus=Math.round(h.stake*h.pct/100);h.mult=0;h.done=0;h.lost=0;h.date=today();h.face=h.blind==='big'?'cash':'sly';
  save();
  return h;
}
/* Ein Modul der Hand ist gewertet. Gibt die Änderung des Multiplikators zurück (+1, −1 oder 0). */
function handSettle(h,ok){
  if(!h)return 0;
  h.done++;
  let d=0;
  if(ok){h.mult++;d=1;}
  else{h.lost++;if(h.blind==='big'&&h.mult>0){h.mult--;d=-1;}}
  /* Dewis Gesicht in der Dewi-Zone: Royal Flush noch drin = überlegen (ab ×4 Dollar-Augen), sonst überheblich; verloren = genervt */
  h.face=!ok?'annoyed':h.lost===0?(h.mult>=4?'cash':'superior'):'haughty';
  return d;
}
/* Abrechnung am Ende der Hand. Schreibt die Chips gut und gibt die Rechnung zurück. */
function handPayout(h){
  if(!h)return null;
  const rf=h.done>0&&h.lost===0,mult=h.mult*(rf?2:1);
  const payout=(h.stake+h.bonus)*mult;
  chipAdd(payout);
  return {stake:h.stake,bonus:h.bonus,pct:h.pct,mult:h.mult,rf,payout,paid:h.paid,blind:h.blind,net:payout-(h.paid==='self'?h.stake:0)};
}

window.__poker={bonusPct,blindOffer,handNew,handSettle,handPayout};
