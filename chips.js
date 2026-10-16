/* ===== Chips (Version 132, ersetzt die Diamanten aus Version 91) =====
   Einzige Währung der App. state.chips = Kontostand, state.chipShown = was die Pille zuletzt gezeigt hat.
   Gutschriften landen sofort in state.chips (nichts geht verloren, wenn man eine Round abbricht);
   auf dem Startscreen fliegen dann Chips in die Pille und die Zahl tickt bis zum Kontostand hoch.
   Quellen in Phase 1: Survival (hier) und ab Version 133 die Auszahlung der Daily-Pokerhand (poker.js).
   Umstellung alter Stände: migrate() rechnet Diamanten einmalig × 10 in Chips um.

   Der Dewi-Chip (Novas Bauteil „Dewi-Chip“, Design-Canvas „dewi. Poker-Screens“) liegt einmal als SVG-Symbol
   pro Variante im Dokument und wird über <use> eingesetzt. So kosten auch 40 Chips im Regen fast nichts. */
const CHIPV={survWord:5,survCap:300};
const CHIP_TONES=['pink','gold','holo','grey','empty'];

/* Varianten: Grundfarbe, Innenring, Kanten, Dewi (Kapuze, Gesicht, Wangen, Neigung, Stimmung) */
const CHIP_T={
  pink:{base:'#f566b9',inner:'#d94da0',edge:'#2a1630',faceOp:1,mood:'haughty',rot:-9,hood:'#f566b9',hoodIn:'#d044a0',face:'#fffaf2',cheek:'#ff9fb4'},
  gold:{base:'#ffc23d',inner:'#e9a422',edge:'#2a1630',faceOp:1,mood:'cash',rot:-4,hood:'#ffc23d',hoodIn:'#e09a12',face:'#fff6e0',cheek:'#ffb37a'},
  holo:{base:'url(#chipHoloG)',inner:'url(#chipHoloG2)',edge:'#2a1630',faceOp:1,mood:'superior',rot:-14,hood:'url(#dwHoloHood)',hoodIn:'#c9b6ff',face:'#fffaf2',cheek:'#ff9fd8'},
  grey:{base:'#4a2f63',inner:'#3a2450',edge:'#251634',faceOp:.55,mood:'sad',rot:3,hood:'#8a7a9a',hoodIn:'#6f6080',face:'#d9d0e0',cheek:'#b9a8c6'}
};
const CHIP_STAR='M0 -9 L2.5 -2.5 L9 0 L2.5 2.5 L0 9 L-2.5 2.5 L-9 0 L-2.5 -2.5Z';
const CHIP_FACE={
  haughty:'<path d="M54 88 Q69 83 84 90" stroke="#2a1630" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M116 84 Q131 65 146 76" stroke="#2a1630" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="68" cy="112" rx="19" ry="20" fill="#fff" stroke="#2a1630" stroke-width="3"/><ellipse cx="70" cy="119" rx="13" ry="13" fill="#6fb2de"/><circle cx="70" cy="119" r="7.5" fill="#2a1630"/><circle cx="65" cy="113" r="4.2" fill="#fff"/><path d="M49 104 Q68 92 87 106 L87 92 L49 92Z" fill="#d3aef0"/><path d="M49 104 Q68 99 87 106" stroke="#2a1630" stroke-width="4" fill="none"/><ellipse cx="132" cy="112" rx="19" ry="20" fill="#fff" stroke="#2a1630" stroke-width="3"/><ellipse cx="134" cy="119" rx="13" ry="13" fill="#6fb2de"/><circle cx="134" cy="119" r="7.5" fill="#2a1630"/><circle cx="129" cy="113" r="4.2" fill="#fff"/><path d="M113 106 Q132 92 151 104 L151 92 L113 92Z" fill="#d3aef0"/><path d="M113 106 Q132 99 151 104" stroke="#2a1630" stroke-width="4" fill="none"/><path d="M91 143 Q97 148 102 144 Q108 148 113 140" stroke="#2a1630" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M92 144 Q100 152 111 142 Q104 150 92 144Z" fill="#e0295a" stroke="#2a1630" stroke-width="1.8" stroke-linejoin="round"/>',
  cash:'<path d="M54 80 Q69 72 84 80" stroke="#2a1630" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M116 80 Q131 72 146 80" stroke="#2a1630" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="68" cy="112" rx="19" ry="20" fill="#fff" stroke="#2a1630" stroke-width="3"/><circle cx="68" cy="113" r="14.5" fill="#2fcf5e" stroke="#0e7a33" stroke-width="2"/><text x="68" y="121" text-anchor="middle" font-size="22" font-weight="900" font-family="Arial,Helvetica,sans-serif" fill="#ffe27a" stroke="#0e7a33" stroke-width=".8">$</text><ellipse cx="132" cy="112" rx="19" ry="20" fill="#fff" stroke="#2a1630" stroke-width="3"/><circle cx="132" cy="113" r="14.5" fill="#2fcf5e" stroke="#0e7a33" stroke-width="2"/><text x="132" y="121" text-anchor="middle" font-size="22" font-weight="900" font-family="Arial,Helvetica,sans-serif" fill="#ffe27a" stroke="#0e7a33" stroke-width=".8">$</text><path d="M87 140 Q100 162 113 140 Q100 146 87 140Z" fill="#e0295a" stroke="#2a1630" stroke-width="2.8" stroke-linejoin="round"/><path d="M91 142 Q100 148 109 142 L108 146 Q100 151 92 146Z" fill="#fff"/>',
  superior:'<path d="M54 88 Q69 84 84 88" stroke="#2a1630" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M116 82 Q131 68 146 78" stroke="#2a1630" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M51 106 Q68 126 85 106" stroke="#2a1630" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M51 106 Q46 110 40 114" stroke="#2a1630" stroke-width="3.5" stroke-linecap="round" fill="none"/><ellipse cx="68" cy="105" rx="16" ry="5" fill="#d3aef0" opacity=".85"/><path d="M115 106 Q132 126 149 106" stroke="#2a1630" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M149 106 Q154 110 160 114" stroke="#2a1630" stroke-width="3.5" stroke-linecap="round" fill="none"/><ellipse cx="132" cy="105" rx="16" ry="5" fill="#d3aef0" opacity=".85"/><path d="M91 143 Q97 148 102 144 Q108 148 113 140" stroke="#2a1630" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M92 144 Q100 152 111 142 Q104 150 92 144Z" fill="#e0295a" stroke="#2a1630" stroke-width="1.8" stroke-linejoin="round"/>',
  sad:'<path d="M54 93 Q69 83 84 81" stroke="#2a1630" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M116 81 Q131 83 146 93" stroke="#2a1630" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="68" cy="112" rx="19" ry="20" fill="#fff" stroke="#2a1630" stroke-width="3"/><circle cx="68" cy="121" r="11" fill="#6fb2de"/><circle cx="68" cy="121" r="7" fill="#2a1630"/><circle cx="64" cy="116" r="3.6" fill="#fff"/><path d="M50 106 L86 100 L86 94 Q68 88 50 98Z" fill="#d3aef0"/><path d="M50 106 L86 100" stroke="#2a1630" stroke-width="4"/><ellipse cx="132" cy="112" rx="19" ry="20" fill="#fff" stroke="#2a1630" stroke-width="3"/><circle cx="132" cy="121" r="11" fill="#6fb2de"/><circle cx="132" cy="121" r="7" fill="#2a1630"/><circle cx="128" cy="116" r="3.6" fill="#fff"/><path d="M114 100 L150 106 L150 98 Q132 88 114 94Z" fill="#d3aef0"/><path d="M114 100 L150 106" stroke="#2a1630" stroke-width="4"/><path d="M90 150 Q100 140 110 150" stroke="#2a1630" stroke-width="3.4" fill="none" stroke-linecap="round"/>'
};
const CHIP_EXTRA={
  cash:`<g fill="#ffe27a" stroke="#2a1630" stroke-width="1.6" stroke-linejoin="round"><path transform="translate(14 60) scale(1.4)" d="${CHIP_STAR}"/><path transform="translate(188 52) scale(1.7)" d="${CHIP_STAR}"/></g>`,
  superior:`<g fill="#fff" stroke="#2a1630" stroke-width="1.6" stroke-linejoin="round"><path transform="translate(18 52) scale(1.3)" d="${CHIP_STAR}"/><path transform="translate(186 40) scale(1.6)" d="${CHIP_STAR}"/><path transform="translate(176 96)" d="${CHIP_STAR}"/></g>`,
  sad:'<path d="M52 140 q-7 11 0 15 q7 -4 0 -15Z" fill="#8fd3ff" stroke="#2a1630" stroke-width="2" stroke-linejoin="round"/><circle cx="50" cy="150" r="1.6" fill="#fff"/>',
  haughty:''
};
/* Ein Symbol je Variante: Casino-Rand mit Kartensymbolen und Kronen, gestrichelter Ring, Dewi in der Mitte */
function chipSymbol(tone){
  if(tone==='empty')return '<symbol id="chip-empty" viewBox="0 0 200 200"><circle cx="100" cy="100" r="90" fill="#3a2450" fill-opacity=".35" stroke="#f566b9" stroke-width="10" stroke-dasharray="20 14"/></symbol>';
  const c=CHIP_T[tone],edge='M146.0 13.5 A98 98 0 0 1 186.5 54.0 L163.6 66.2 A72 72 0 0 0 133.8 36.4 Z',crown='M88 21 L88 10 L94 15 L100 7 L106 15 L112 10 L112 21 Z';
  const rot4=d=>[0,90,180,270].map(a=>`<path d="${d}"${a?` transform="rotate(${a} 100 100)"`:''}/>`).join('');
  return `<symbol id="chip-${tone}" viewBox="0 0 200 200">
<circle cx="100" cy="100" r="98" fill="${c.base}"/>
<g fill="${c.edge}">${rot4(edge)}</g>
<g fill="#fff6fb"><path transform="translate(160 40) rotate(45) scale(1.15)" d="M0 5 C-8 -1 -6 -8 0 -4 C6 -8 8 -1 0 5Z"/><g transform="translate(160 160) rotate(135) scale(1.05)"><circle cx="0" cy="-4" r="3.2"/><circle cx="-4" cy="1.5" r="3.2"/><circle cx="4" cy="1.5" r="3.2"/><path d="M-1.4 1 L1.4 1 L2.4 7 L-2.4 7Z"/></g><path transform="translate(40 160) rotate(225) scale(1.15)" d="M0 -7 L5 0 L0 7 L-5 0Z"/><path transform="translate(40 40) rotate(315) scale(1.05)" d="M0 -7 C-7 0 -7 5 -2 4 L-3 8 H3 L2 4 C7 5 7 0 0 -7Z"/></g>
<g fill="#fff6fb" stroke="#2a1630" stroke-width="1.2" stroke-linejoin="round">${rot4(crown)}</g>
<circle cx="100" cy="100" r="70" fill="${c.inner}"/>
<circle cx="100" cy="100" r="66" fill="none" stroke="#fff6fb" stroke-width="5" stroke-dasharray="7 7"/>
<circle cx="100" cy="100" r="61" fill="${c.base}"/>
<g clip-path="url(#chipFaceClip)" opacity="${c.faceOp}"><svg x="29" y="37" width="142" height="132" viewBox="-6 -2 212 196"><g transform="rotate(${c.rot} 100 120)">
<path d="M26 92 Q22 30 46 16 Q58 10 96 46Z" fill="${c.hood}" stroke="#2a1630" stroke-width="4" stroke-linejoin="round"/><path d="M44 62 Q42 34 52 28 Q62 30 74 46Z" fill="${c.hoodIn}"/><path d="M174 92 Q178 30 154 16 Q142 10 104 46Z" fill="${c.hood}" stroke="#2a1630" stroke-width="4" stroke-linejoin="round"/><path d="M156 62 Q158 34 148 28 Q138 30 126 46Z" fill="${c.hoodIn}"/>
<path d="M100 38 C48 38 14 70 14 112 C14 126 18 136 24 146 L14 156 L28 156 C44 176 70 182 100 182 C130 182 156 176 172 156 L186 156 L176 146 C182 136 186 126 186 112 C186 70 152 38 100 38Z" fill="${c.hood}" stroke="#2a1630" stroke-width="4" stroke-linejoin="round"/>
<path d="M100 62 C54 62 30 84 30 114 C30 126 34 134 38 140 L30 148 L44 148 C56 164 78 170 100 170 C122 170 144 164 156 148 L170 148 L162 140 C166 134 170 126 170 114 C170 84 146 62 100 62Z" fill="${c.face}" stroke="#2a1630" stroke-width="3.5" stroke-linejoin="round"/>
<ellipse cx="50" cy="132" rx="13" ry="8" fill="${c.cheek}" opacity=".75"/><ellipse cx="150" cy="132" rx="13" ry="8" fill="${c.cheek}" opacity=".75"/>
<path d="M96 78 q-7 -6 -1 -11 q7 -2 6 4 q-1 4 -5 3" stroke="#2a1630" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M97 132 Q100 129 103 132 Q100 135 97 132Z" fill="#e0788e" stroke="#2a1630" stroke-width="1.8"/>
${CHIP_FACE[c.mood]}</g>${CHIP_EXTRA[c.mood]}</svg></g>
<circle cx="100" cy="100" r="61" fill="none" stroke="${c.edge}" stroke-width="2.5" stroke-opacity=".5"/>
<circle cx="100" cy="100" r="97" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="2"/>
</symbol>`;
}
/* Einmal beim Start: unsichtbare Sammlung aller Varianten plus Verläufe und Gesichtsmaske */
function chipSprite(){
  if(document.getElementById('chipsprite'))return;
  const box=document.createElement('div');box.id='chipsprite';box.setAttribute('aria-hidden','true');
  box.style.cssText='position:absolute;width:0;height:0;overflow:hidden';
  box.innerHTML=`<svg width="0" height="0" focusable="false"><defs>
<linearGradient id="chipHoloG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff92d2"/><stop offset=".3" stop-color="#a888ff"/><stop offset=".55" stop-color="#5aa9ff"/><stop offset=".78" stop-color="#35dcd2"/><stop offset="1" stop-color="#ffc23d"/></linearGradient>
<linearGradient id="chipHoloG2" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd1ec"/><stop offset=".4" stop-color="#c9b6ff"/><stop offset=".75" stop-color="#9fe9e3"/><stop offset="1" stop-color="#ffe08a"/></linearGradient>
<linearGradient id="dwHoloHood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff7fd0"/><stop offset=".35" stop-color="#9d7bff"/><stop offset=".65" stop-color="#4fb6ff"/><stop offset="1" stop-color="#3fe0c8"/></linearGradient>
<clipPath id="chipFaceClip"><circle cx="100" cy="100" r="61"/></clipPath>
${CHIP_TONES.map(chipSymbol).join('')}</defs></svg>`;
  document.body.appendChild(box);
}
/* Ein Chip zum Einsetzen: chipSvg('gold','big') */
const chipSvg=(tone,cls)=>`<svg class="dchip${cls?' '+cls:''}" viewBox="0 0 200 200" aria-hidden="true" focusable="false"><use href="#chip-${(CHIP_T[tone]||tone==='empty')?tone:'pink'}"/></svg>`;
/* Rückseite für den Münz-Flip bei der Blind-Auswahl (Version 143): schlichte Prägung, kein Dewi-Gesicht */
function chipBackSvg(tone){
  const c=CHIP_T[tone]||CHIP_T.pink;
  return `<svg class="dchip" viewBox="0 0 200 200" aria-hidden="true" focusable="false"><circle cx="100" cy="100" r="92" fill="${c.base}" stroke="${c.edge}" stroke-width="9"/><circle cx="100" cy="100" r="68" fill="none" stroke="${c.hoodIn||c.inner}" stroke-width="5" stroke-dasharray="9 8"/><text x="100" y="120" text-anchor="middle" font-family="'Bricolage Grotesque',Arial,sans-serif" font-weight="800" font-size="60" fill="${c.hoodIn||c.inner}">d.</text></svg>`;
}

function chipAdd(n){n=Math.max(0,Math.round(n)||0);if(!n)return 0;state.chips=(state.chips|0)+n;save();return n;}
/* Survival: 5 Chips pro geschafftem Wort, höchstens 300 pro Tag. Kein Rekord-Bonus (sonst: Rekord um 1 knacken und aussteigen). */
function chipSurvival(words){
  const t0=today(),g=state.chipSurv&&state.chipSurv.d===t0?state.chipSurv:(state.chipSurv={d:t0,n:0});
  const n=Math.max(0,Math.min(Math.max(0,words|0)*CHIPV.survWord,CHIPV.survCap-g.n));
  g.n+=n;return chipAdd(n);
}
/* Zahlen: volle Zahl mit Tausenderpunkt (Deutsch) bzw. -komma (Englisch) */
function fmtChip(n){return String(n|0).replace(/\B(?=(\d{3})+(?!\d))/g,state.ui==='de'?'.':',');}
/* Nur für die Pille: ab 10.000 mit K/M und einer Nachkommastelle (12,5K · 1,2M), abgerundet, damit nie mehr angezeigt wird als da ist */
function fmtChipShort(n){
  n=n|0;if(n<10000)return fmtChip(n);
  const dec=state.ui==='de'?',':'.';
  const [v,u]=n<1e6?[Math.floor(n/100)/10,'K']:[Math.floor(n/1e5)/10,'M'];
  return v.toFixed(1).replace('.',dec)+u;
}
function chipPill(id){
  const v=Math.min(state.chipShown|0,state.chips|0);
  const inner=`<span class="chipwrap">${chipSvg('pink')}</span><b>${fmtChipShort(v)}</b>`;
  if(!id)return `<button class="chippill" id="chippill" type="button" aria-label="${t('{0} Chips',fmtChip(state.chips|0))} · ${t('Shop öffnen')}">${inner}</button>`;   // Startscreen: öffnet den Shop (Version 138)
  return `<div class="chippill" id="${id}" role="img" aria-label="${t('{0} Chips',fmtChip(state.chips|0))}">${inner}</div>`;
}
/* Zeile auf den Endscreens: Chip und „+300“ */
function chipLine(total){
  if(!total)return '';
  return `<div class="chipline">${chipSvg('pink')}<b>+${fmtChip(total)}</b></div>`;
}
/* Startscreen: Chips fliegen in die Pille, die Zahl tickt hoch */
function chipFly(){
  const pill=$('#chippill');if(!pill)return;
  const from=state.chipShown|0,to=state.chips|0;
  if(to<=from){if(to<from){state.chipShown=to;save();}return;}
  state.chipShown=to;save();
  const num=$('b',pill);
  if(reduceMotion()||typeof requestAnimationFrame!=='function'||!document.body.animate){num.textContent=fmtChipShort(to);return;}
  const pr=pill.getBoundingClientRect(),tx=pr.left+16,ty=pr.top+pr.height/2;
  const src=$('.plan')||$('.mascot'),sr=src?src.getBoundingClientRect():{left:innerWidth/2-20,top:innerHeight/2,width:40,height:40};
  const cx=sr.left+sr.width/2,cy=Math.min(innerHeight*.6,sr.top+sr.height/2);
  const k=Math.min(12,Math.max(3,Math.ceil((to-from)/50)));let landed=0;
  sfx('chips',150);
  for(let i=0;i<k;i++){
    const el=document.createElement('div');el.className='chipfly';el.innerHTML=chipSvg('pink');
    const a=i/k*Math.PI*2,r=40+((i*37)%30);
    const sx=cx+Math.cos(a)*r,sy=cy+Math.sin(a)*r*.6;
    el.style.left=sx+'px';el.style.top=sy+'px';
    document.body.appendChild(el);
    const d=380+i*70;
    el.animate([
      {transform:'translate(-50%,-50%) scale(.2)',opacity:0},
      {transform:'translate(-50%,-50%) scale(1.15)',opacity:1,offset:.25},
      {transform:`translate(calc(-50% + ${tx-sx}px),calc(-50% + ${ty-sy}px)) scale(.55)`,opacity:.9}
    ],{duration:d+260,delay:i*55,easing:'cubic-bezier(.55,0,.75,.4)',fill:'forwards'}).onfinish=()=>{
      el.remove();landed++;
      const v=Math.round(from+(to-from)*landed/k);num.textContent=fmtChipShort(v);
      pill.classList.remove('bump');void pill.offsetWidth;pill.classList.add('bump');
      sfx('tick');
    };
  }
}
/* Chipregen über den ganzen Bildschirm (Reels-Gewinn, später Royal Flush) */
function chipRain(n,tones){
  if(reduceMotion())return;
  const tn=tones||['pink','gold','holo'];
  const box=document.createElement('div');box.className='drain';box.setAttribute('aria-hidden','true');
  for(let i=0;i<n;i++){
    const sz=18+Math.random()*20,g=document.createElement('i');
    g.style.cssText=`left:${(Math.random()*100).toFixed(1)}%;width:${sz.toFixed(0)}px;height:${sz.toFixed(0)}px;--dx:${(Math.random()*80-40).toFixed(0)}px;--r:${(Math.random()*540-270).toFixed(0)}deg;animation-duration:${(1.1+Math.random()*.9).toFixed(2)}s;animation-delay:${(Math.random()*.7).toFixed(2)}s`;
    g.innerHTML=chipSvg(tn[i%tn.length]);
    box.appendChild(g);
  }
  document.body.appendChild(box);setTimeout(()=>box.remove(),2900);
}
window.__chip={add:chipAdd,surv:chipSurvival,short:fmtChipShort};
