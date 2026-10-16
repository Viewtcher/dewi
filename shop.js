/* ===== Shop und Inventar (Phase 2, ab Version 137) =====
   Grundlage: konzept-poker-shop.md, Abschnitte 6–10. Preise stehen nur hier (SHOP_PRICE) und lassen sich nach Erfahrungswerten anpassen.
   Inventar im Zustand:  state.shields  Streak-Schutze im Vorrat (0 bis SHIELD_MAX)
                         state.shielded {Tag:true} Tage, die ein Schutz gerettet hat (eisblauer Stempel)
                         state.owned    gekaufte Artikel (ids), ab Version 139
                         state.equip    aktuelle Auswahl {fur, head, theme}, ab Version 139

   STREAK-SCHUTZ   schützt genau einen verpassten Tag und wird automatisch eingesetzt (applyShields beim Öffnen).
                   Er wird nur eingesetzt, wenn er die Serie wirklich rettet: Fehlen mehr Tage, als Schutze da sind,
                   bleiben alle im Vorrat. Der geschützte Tag zählt nicht mit (die Serienzahl bleibt stehen, auch für die
                   Bonus-Stufen), unterbricht die Serie aber nicht. */
const SHOP_PRICE={shield:1000,common:2500,rare:6000,legendary:15000};
const SHIELD_MAX=2;

/* Verpasste Tage seit der letzten gespielten Daily Round (ohne heute), die noch nicht geschützt sind */
function missedSinceLast(){
  const t0=today(),y=addDays(t0,-1),sh=state.shielded||{};
  const days=Object.keys(state.done||{}).filter(d=>d<t0).sort();
  const last=days[days.length-1];if(!last)return null;
  const gap=[];for(let d=addDays(last,1);d<=y;d=addDays(d,1))if(!sh[d])gap.push(d);
  return {last,gap};
}
/* Beim Öffnen: Schutze einsetzen, wenn sie die ganze Lücke schließen. Merkt sich einen Hinweis für den Moment. */
function applyShields(){
  const m=missedSinceLast();if(!m||!m.gap.length)return 0;
  const have=state.shields|0;
  if(m.gap.length>have)return 0;   // reicht nicht: Serie ist ohnehin weg, Schutze bleiben im Vorrat
  const sh=state.shielded||(state.shielded={});
  m.gap.forEach(d=>{sh[d]=true;});
  state.shields=have-m.gap.length;
  state.shieldNote={n:m.gap.length,left:state.shields};
  save();
  return m.gap.length;
}
/* Eisblauer Moment beim nächsten Startscreen: „Streak-Schutz eingesetzt“ */
const SHIELD_SVG='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.5 L20 5.5 V11.5 C20 16.5 16.6 20 12 21.5 C7.4 20 4 16.5 4 11.5 V5.5 Z" fill="#8fd8ff" stroke="#2a1630" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 5 L17.6 7.1 V11.6 C17.6 15.2 15.4 17.9 12 19.1 Z" fill="#c9efff"/><path d="M8.5 11.8 L11 14.2 L15.8 9.4" fill="none" stroke="#2a1630" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function shieldMoment(){
  const n=state.shieldNote;if(!n||$('.moment'))return;
  state.shieldNote=null;save();
  const q=sayQuip('shield_used');
  const el=moment('shield',`<div class="mm-art">${SHIELD_SVG}</div>
    <div class="mm-lab">${n.n===1?t('Streak-Schutz eingesetzt'):t('{0} Streak-Schutze eingesetzt',n.n)}</div>
    <div class="mm-sub">${t('Deine Serie bleibt bei {0} Tagen.',streak())}</div>
    <div class="mm-sub">${esc(q.text)}</div>
    <div class="mm-sub">${n.left===1?t('Noch 1 Schutz im Vorrat.'):t('Noch {0} Schutze im Vorrat.',n.left)}</div>`);
  sfx('lockin');haptic([20,60,20]);
  return el;
}
/* Sicherung (Version 137): alles außer der offenen Hand und den Test-Merkern */
const BACKUP_SKIP=['run','dayOffset','dev','devTest','shieldNote'];
function backupData(){const d={};Object.keys(state).forEach(k=>{if(BACKUP_SKIP.indexOf(k)<0)d[k]=state[k];});return d;}
window.__shop={applyShields,missedSinceLast,backupData};
