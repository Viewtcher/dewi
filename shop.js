/* ===== Shop und Inventar (Phase 2, ab Version 137) =====
   Grundlage: konzept-poker-shop.md, Abschnitte 6–10. Preise stehen nur hier (SHOP_PRICE) und lassen sich nach Erfahrungswerten anpassen.
   Inventar im Zustand:  state.shields  Streak-Schutze im Vorrat (0 bis SHIELD_MAX)
                         state.shielded {Tag:true} Tage, die ein Schutz gerettet hat (eisblauer Stempel)
                         state.owned    gekaufte Artikel (ids), ab Version 139
                         state.equip    aktuelle Auswahl {fur, head, face, theme}, ab Version 139 (face ab Version 182)

   STREAK-SCHUTZ   schützt genau einen verpassten Tag und wird automatisch eingesetzt (applyShields beim Öffnen).
                   Er wird nur eingesetzt, wenn er die Serie wirklich rettet: Fehlen mehr Tage, als Schutze da sind,
                   bleiben alle im Vorrat. Der geschützte Tag zählt nicht mit (die Serienzahl bleibt stehen, auch für die
                   Bonus-Stufen), unterbricht die Serie aber nicht. */
const SHOP_PRICE={shield:1000,common:3500,rare:8000,legendary:20000};   // Version 182: etwas teurer (vorher 2.500 / 6.000 / 15.000)
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
const BACKUP_SKIP=['run','dayOffset','shieldNote'];
function backupData(){const d={};Object.keys(state).forEach(k=>{if(BACKUP_SKIP.indexOf(k)<0)d[k]=state[k];});return d;}

/* ===== Shop-Screen (Version 138) =====
   Gestaltung: Design-Canvas „dewi. Poker-Screens“, Reihe „Phase 2: Shop“ (Shop2, Startartikel).
   Oben die Umkleide (Dewi groß mit aktueller Ausstattung bzw. Anprobe, daneben ihr Kommentar), darunter drei Reiter,
   der Schalter „Nur meine“ (= Inventar) und die Aktionszone. Antippen probiert an, auch vor dem Kauf; ein Theme färbt
   den Screen als Vorschau. Kaufen rüstet Cosmetics gleich aus. Gratis und immer im Besitz: Classic-Fell, kein Kopf, Dewi Classic. */
const SHOP_ITEMS=[
  {id:'fur:classic',slot:'fur',val:'classic',name:'Classic',rar:'free'},
  {id:'fur:mitternacht',slot:'fur',val:'mitternacht',name:'Mitternacht',rar:'rare'},
  {id:'fur:minze',slot:'fur',val:'minze',name:'Minze',rar:'common'},
  {id:'fur:holo',slot:'fur',val:'holo',name:'Holo',rar:'legendary'},
  {id:'head:none',slot:'head',val:'none',name:'Nichts',rar:'free'},
  {id:'head:schleife',slot:'head',val:'schleife',name:'Schleife',rar:'common'},
  {id:'head:krone',slot:'head',val:'krone',name:'Krone',rar:'rare'},
  {id:'face:none',slot:'face',val:'none',name:'Nichts',rar:'free'},
  {id:'face:herzbrille',slot:'face',val:'herzbrille',name:'Herzbrille',rar:'common'},
  {id:'theme:classic',slot:'theme',val:'classic',name:'Dewi Classic',rar:'free'},
  {id:'theme:neon',slot:'theme',val:'neon',name:'Neon-Nacht',rar:'rare'},
  {id:'theme:sunset',slot:'theme',val:'sunset',name:'Sonnenuntergang',rar:'rare'},
  {id:'theme:holo',slot:'theme',val:'holo',name:'Holo-Lounge',rar:'legendary'},
  {id:'shield',slot:'shield',val:'shield',name:'Streak-Schutz',rar:'shield'}
];
const SHOP_TABS=[['cos','Cosmetics',['fur','head','face']],['ext','Extras',['theme']],['con','Consumables',['shield']]];
const SHOP_SECT={fur:'FELL',head:'KOPF',face:'GESICHT',theme:'THEMES',shield:'STREAK-SCHUTZ'};
const SHOP_RAR={free:'Gratis',common:'Gewöhnlich',rare:'Selten',legendary:'Legendär',shield:'Verbrauch'};
const SHOP_Q={'fur:classic':'Das Original. Zeitlos, wie ich.','fur:mitternacht':'Mitternacht mit Sternen. Endlich versteht mich jemand.',
  'head:none':'Ohne alles. Mutig.','head:schleife':'Die Schleife. Süß, aber gefährlich.',
  'fur:minze':'Minze. Frisch, aber nicht aufdringlich.','fur:holo':'Holo. Ich schimmere, also bin ich.',
  'head:krone':'Eine Krone. Endlich macht es jemand offiziell.','face:none':'Ohne Brille. Mein Blick reicht.','face:herzbrille':'Herzbrille. Ich sehe nur noch Chips.',
  'theme:sunset':'Sonnenuntergang. Mein Licht, mein Auftritt.','theme:holo':'Holo-Lounge. Hier schimmert sogar die Luft.',
  'theme:classic':'Mein Wohnzimmer. Gemütlich dunkel.','theme:neon':'Neon-Nacht. Fühlt sich teuer an.',
  shield:'Ein Tag frei, ohne dass ich es merke. Fast.'};
const priceOf=it=>it.rar==='free'?0:it.rar==='shield'?SHOP_PRICE.shield:SHOP_PRICE[it.rar];
const ownsItem=it=>it.rar==='free'||(state.owned||[]).indexOf(it.id)>=0;
const equipOf=slot=>(state.equip&&state.equip[slot])||(slot==='head'||slot==='face'?'none':'classic');
const isEquipped=it=>it.slot!=='shield'&&equipOf(it.slot)===it.val;
function applyTheme(id){try{const r=document.documentElement;if(id&&id!=='classic')r.dataset.theme=id;else delete r.dataset.theme;}catch(e){}}
let SHOP=null;   // {tab, sel, mine} solange der Shop offen ist
function openShop(){
  SHOP={tab:'cos',sel:null,mine:false};
  sheet.hidden=false;sheet.classList.add('shop-open');document.body.style.overflow='hidden';
  $$('.tab',tabs).forEach(b=>b.removeAttribute('aria-current'));
  $('#shoptab',tabs).setAttribute('aria-current','page');   // Version 146: Leiste bleibt im Shop sichtbar, Shop-Reiter wird aktiv markiert
  renderShop();
}
function closeShop(){SHOP=null;applyTheme(equipOf('theme'));closeSheet();}
function shopItemArt(it,size){
  if(it.slot==='fur'||it.slot==='head'||it.slot==='face')return dwSvg('haughty',{fur:it.slot==='fur'?it.val:'classic',head:it.slot==='head'?it.val:'none',face:it.slot==='face'?it.val:'none'});
  if(it.slot==='theme'){const c={neon:['#0b1026','#141c3d','#35dcd2'],sunset:['#2b1020','#4d2236','#ff9a4d'],holo:['#141225','#272350','linear-gradient(135deg,#ff92d2,#a888ff 45%,#35dcd2)']}[it.val]||['#1a0f24','#251634','#f566b9'];
    return `<span class="shsw" aria-hidden="true"><span style="background:${c[0]}"></span><span style="background:${c[1]}"></span><span style="background:${c[2]}"></span></span>`;}
  return `<span class="shshield">${SHIELD_SVG}</span>`;
}
function renderShop(){
  if(!SHOP)return;
  /* Version 183: Scrollstand merken. Antippen baut den Shop neu auf; ohne das sprang die Liste nach oben. Beim Reiterwechsel startet sie oben. */
  const oldList=$('.shlist',sheet),keepTop=oldList&&SHOP.shown===SHOP.tab?oldList.scrollTop:0,keepSheet=oldList&&SHOP.shown===SHOP.tab?sheet.scrollTop:0;
  SHOP.shown=SHOP.tab;
  const sel=SHOP.sel,tab=SHOP_TABS.find(x=>x[0]===SHOP.tab);
  applyTheme(sel&&sel.slot==='theme'?sel.val:equipOf('theme'));   // Theme als Vorschau
  const look={fur:sel&&sel.slot==='fur'?sel.val:equipOf('fur'),head:sel&&sel.slot==='head'?sel.val:equipOf('head'),face:sel&&sel.slot==='face'?sel.val:equipOf('face')};
  const quip=sel?t(SHOP_Q[sel.id]):t('Probier ruhig an. Anfassen kostet nichts. Noch.');
  const info=sel?(ownsItem(sel)||sel.slot==='shield'?t(SHOP_RAR[sel.rar]):t('Anprobe')+' · '+t(SHOP_RAR[sel.rar])):'';
  const sections=tab[2].map(slot=>{
    const items=SHOP_ITEMS.filter(it=>it.slot===slot&&(!SHOP.mine||slot==='shield'||ownsItem(it)));
    if(!items.length)return '';
    return `<div class="shsec"><span class="shsect">${t(SHOP_SECT[slot])}</span><div class="shgrid">${items.map(it=>{
      const tag=it.slot==='shield'?t('Vorrat {0}/{1}',state.shields|0,SHIELD_MAX):isEquipped(it)?t('Ausgerüstet'):ownsItem(it)?t('Gekauft'):fmtChip(priceOf(it));
      const cls=['shit','r-'+it.rar,sel&&sel.id===it.id?'on':'',isEquipped(it)?'eq':ownsItem(it)?'own':''].join(' ');
      return `<button class="${cls}" type="button" data-shop="${it.id}" aria-pressed="${!!(sel&&sel.id===it.id)}" aria-label="${esc(t(it.name))}, ${esc(t(SHOP_RAR[it.rar]))}, ${esc(tag)}"><span class="shart">${shopItemArt(it)}</span><span class="shn">${esc(t(it.name))}</span><span class="sht">${!ownsItem(it)&&it.slot!=='shield'?chipSvg('pink','shc'):''}${esc(tag)}</span></button>`;
    }).join('')}</div></div>`;
  }).join('');
  /* Aktionszone */
  let label=t('Antippen zum Anprobieren'),off=true,act='';
  if(sel){
    const p=priceOf(sel),acc=state.chips|0;
    if(sel.slot==='shield'){
      if((state.shields|0)>=SHIELD_MAX)label=t('Vorrat voll ({0}/{1})',SHIELD_MAX,SHIELD_MAX);
      else if(acc<p)label=t('Noch {0} Chips',fmtChip(p-acc));
      else{label=t('Kaufen')+' · '+fmtChip(p);off=false;act='buy';}
    }else if(isEquipped(sel))label=t('Ausgerüstet');
    else if(ownsItem(sel)){label=t('Ausrüsten');off=false;act='equip';}
    else if(acc<p)label=t('Noch {0} Chips',fmtChip(p-acc));
    else{label=t('Kaufen')+' · '+fmtChip(p);off=false;act='buy';}
  }
  sheet.innerHTML=`<div class="sin shop" id="shop"><div class="shead"><button class="iconbtn" id="quit" aria-label="${t('Shop schließen')}">${XIC}</button><span class="shtitle">SHOP</span>${chipPill('chippill2')}</div>
    <div class="shroom"><div class="shdewi">${dwSvg(sel&&sel.slot==='shield'?'shades':'haughty',look)}</div><div class="shsay"><div class="bubble shb" role="status">${esc(quip)}</div>${info?`<span class="shinfo">${esc(info)}</span>`:''}</div></div>
    <div class="shtabs" role="tablist">${SHOP_TABS.map(x=>`<button role="tab" type="button" class="shtab${x[0]===SHOP.tab?' on':''}" aria-selected="${x[0]===SHOP.tab}" data-tab="${x[0]}">${t(x[1])}</button>`).join('')}</div>
    <div class="shmine"><span id="shminel">${t('Nur meine')}</span><button type="button" role="switch" class="shsw2${SHOP.mine?' on':''}" id="shmine" aria-checked="${SHOP.mine}" aria-labelledby="shminel"><i></i></button></div>
    <div class="shlist">${sections}</div>
    <button class="btn primary block actbtn" id="shact" type="button"${off?' aria-disabled="true"':''} data-act="${act}">${esc(label)}</button></div>`;
  const nl=$('.shlist',sheet);if(nl){nl.scrollTop=keepTop;}sheet.scrollTop=keepSheet;
  $('#quit').onclick=closeShop;
  $$('.shtab',sheet).forEach(b=>b.onclick=()=>{SHOP.tab=b.dataset.tab;SHOP.sel=null;renderShop();});
  $('#shmine').onclick=()=>{SHOP.mine=!SHOP.mine;renderShop();};
  $$('[data-shop]',sheet).forEach(b=>b.onclick=()=>{SHOP.sel=SHOP_ITEMS.find(x=>x.id===b.dataset.shop);sfx('pop');renderShop();});
  $('#shact').onclick=()=>shopAct(act);
}
function shopAct(act){
  const it=SHOP&&SHOP.sel;if(!it||!act)return;
  if(act==='buy'){
    const p=priceOf(it);if((state.chips|0)<p)return;
    state.chips=(state.chips|0)-p;state.chipShown=state.chips;
    if(it.slot==='shield')state.shields=Math.min(SHIELD_MAX,(state.shields|0)+1);
    else{state.owned=(state.owned||[]).concat([it.id]);state.equip=Object.assign({},state.equip,{[it.slot]:it.val});}
    sfx('chips');haptic([20,40,20]);
  }else if(act==='equip'){state.equip=Object.assign({},state.equip,{[it.slot]:it.val});sfx('lockin');haptic(15);}
  save();renderShop();
}
window.__shop={applyShields,missedSinceLast,backupData,openShop,shopAct};
