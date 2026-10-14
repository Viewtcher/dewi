/* ---------- Stempel-Briefmarken (Serie) ---------- */
let stId=0;
const STAMP_KEYS=['sly','shades','superior','haughty','surprised','mean','bored','content','annoyed','sleep'];
const STAMP_NAME={sly:()=>t('Schelmisch'),shades:()=>t('Cool'),superior:()=>t('Überlegen'),haughty:()=>t('Überheblich'),surprised:()=>t('Überrascht'),mean:()=>t('Gemein'),bored:()=>t('Gelangweilt'),content:()=>t('Zufrieden'),annoyed:()=>t('Genervt'),sleep:()=>t('Schlafend')};
/* Pro erledigtem Tag eine zufällige Miene; nie dieselbe wie am Vor- oder Folgetag. Wird einmal gewürfelt und gespeichert. */
function stampFor(d){
  const m=state.stamps||(state.stamps={});
  if(m[d])return m[d];
  const ban=[m[addDays(d,-1)],m[addDays(d,1)]];
  const pool=STAMP_KEYS.filter(k=>ban.indexOf(k)<0);
  m[d]=pool[Math.floor(Math.random()*pool.length)];
  return m[d];
}
function stampSvg(mood,phase){
  const id='st'+(++stId),calm=reduceMotion(),d=phase||0;
  const inner=dwSvg(mood).replace(/^[\s\S]*?<svg[^>]*>/,'').replace(/<\/svg>[\s\S]*$/,'');
  let holes='';
  for(let k=0;k<8;k++){const x=3.75+k*7.5;holes+=`<circle cx="${x}" cy="0" r="2.3"/><circle cx="${x}" cy="60" r="2.3"/><circle cx="0" cy="${x}" r="2.3"/><circle cx="60" cy="${x}" r="2.3"/>`;}
  const an=(x)=>calm?'':x;
  const star=(x,y,s,tt)=>`<path transform="translate(${x} ${y})" d="M0 -4 L1 -1 L4 0 L1 1 L0 4 L-1 1 L-4 0 L-1 -1Z" fill="#fff" opacity="${calm?.7:0}">${an(`<animate attributeName="opacity" values="0;1;0;0" keyTimes="0;.2;.45;1" dur="${tt}s" begin="${(-d-s).toFixed(1)}s" repeatCount="indefinite"/>`)}</path>`;
  return `<svg viewBox="-2 -2 66 66" aria-hidden="true" focusable="false">
  <defs>
   <mask id="${id}m"><rect width="60" height="60" fill="#fff"/><g fill="#000">${holes}</g></mask>
   <clipPath id="${id}c"><rect x="2.5" y="2.5" width="55" height="55"/></clipPath>
   <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd6ee"/><stop offset="1" stop-color="#d8c4ff"/></linearGradient>
   <linearGradient id="${id}w" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="26" y2="14" spreadMethod="repeat">
     <stop offset="0" stop-color="#18e6ff"/><stop offset=".25" stop-color="#5a6bff"/><stop offset=".5" stop-color="#ff2bd6"/><stop offset=".75" stop-color="#7a5cff"/><stop offset="1" stop-color="#18e6ff"/>
     ${an(`<animateTransform attributeName="gradientTransform" type="translate" values="0 0;26 14" dur="3.2s" begin="${-d}s" repeatCount="indefinite"/>`)}
   </linearGradient>
   <linearGradient id="${id}x" gradientUnits="userSpaceOnUse" x1="0" y1="60" x2="60" y2="0" spreadMethod="repeat">
     <stop offset="0" stop-color="#ff4fd8" stop-opacity="0"/><stop offset=".5" stop-color="#7ff6ff" stop-opacity=".95"/><stop offset="1" stop-color="#ff4fd8" stop-opacity="0"/>
     ${an(`<animateTransform attributeName="gradientTransform" type="translate" values="-60 60;60 -60" dur="2.8s" begin="${-d}s" repeatCount="indefinite"/>`)}
   </linearGradient>
   <pattern id="${id}g" width="3" height="3" patternUnits="userSpaceOnUse"><path d="M0 .4H3M.4 0V3" stroke="#fff" stroke-width=".28"/></pattern>
  </defs>
  <g mask="url(#${id}m)">
   <rect width="60" height="60" fill="#fff6ec"/>
   <g clip-path="url(#${id}c)">
    <rect width="60" height="60" fill="url(#${id}b)"/>
    <g transform="translate(-2 -2.5) scale(.32)">${inner}</g>
    <rect width="60" height="60" fill="url(#${id}w)" opacity=".5" style="mix-blend-mode:color"/>
    <rect width="60" height="60" fill="url(#${id}w)" opacity=".34" style="mix-blend-mode:overlay"/>
    <rect width="60" height="60" fill="url(#${id}x)" opacity=".55" style="mix-blend-mode:screen"/>
    <rect width="60" height="60" fill="url(#${id}g)" opacity=".22" style="mix-blend-mode:overlay"/>
    ${star(14,13,0,2.4)}${star(46,10,.9,2.9)}${star(10,36,1.6,2.2)}${star(34,26,.5,3.3)}${star(50,34,1.2,2.6)}
   </g>
   <rect x="1.2" y="1.2" width="57.6" height="57.6" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width=".7"/>
  </g>
  <g transform="rotate(-14 46 47)" opacity=".94">
   <path d="M6 51 q3 -3 6 0 t6 0 t6 0 t6 0 M8 56 q3 -3 6 0 t6 0 t6 0" fill="none" stroke="#2a1630" stroke-width="1" stroke-linecap="round" opacity=".55"/>
   <circle cx="46" cy="47" r="12.5" fill="rgba(255,255,255,.28)" stroke="#2a1630" stroke-width="1.5"/>
   <circle cx="46" cy="47" r="9.6" fill="none" stroke="#2a1630" stroke-width=".6" stroke-dasharray="1.5 1.1"/>
   <path d="M40.6 47.2 L44.6 51.3 L51.8 42.4" fill="none" stroke="#1f2f1f" stroke-width="4.8" stroke-linecap="round" stroke-linejoin="round"/>
   <path d="M40.6 47.2 L44.6 51.3 L51.8 42.4" fill="none" stroke="#3be28b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </g></svg>`;
}
/* Große Ansicht: zentriert, per Ziehen (Maus oder Finger) anheben und neigen, springt beim Loslassen zurück */
let svReturn=null;
function closeStamp(){
  const o=$('.stampview');if(!o)return;
  o.remove();document.documentElement.classList.remove('sv-open');
  document.removeEventListener('keydown',svKey);
  if(svReturn&&document.contains(svReturn))try{svReturn.focus();}catch(e){}
  svReturn=null;
}
function svKey(e){if(e.key==='Escape')closeStamp();}
function openStamp(d,from){
  closeStamp();svReturn=from||null;
  const mood=stampFor(d);
  const o=document.createElement('div');o.className='stampview';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');
  o.setAttribute('aria-label',t('Marke ansehen'));
  o.innerHTML=`<div class="sv-back"></div><button class="sv-x" aria-label="${t('Schließen')}">×</button>
  <div class="sv-stage"><div class="sv-card" id="svcard"><div class="sv-idle">${stampSvg(mood,0)}</div></div>
  <p class="sv-cap"><b>${esc(dayName(d,{weekday:'long',day:'numeric',month:'long'}))}</b><span>${esc(STAMP_NAME[mood]())}</span></p>
  <p class="sv-hint">${t('Ziehen, um die Marke anzuheben und zu neigen.')}</p></div>`;
  document.body.appendChild(o);document.documentElement.classList.add('sv-open');
  document.addEventListener('keydown',svKey);
  $('.sv-back',o).onclick=closeStamp;$('.sv-x',o).onclick=closeStamp;
  try{$('.sv-x',o).focus();}catch(e){}
  const card=$('#svcard',o);let sx=0,sy=0,drag=false;
  const clamp=(v,m)=>Math.max(-m,Math.min(m,v));
  const move=e=>{
    if(!drag)return;
    const dx=e.clientX-sx,dy=e.clientY-sy,w=card.offsetWidth||260;
    const tx=clamp(dx*.35,70),ty=clamp(dy*.45,90);
    const ry=clamp(dx/w*22,18),rx=clamp(-dy/w*22,18);
    card.style.setProperty('--lift',String(Math.min(1,Math.hypot(tx,ty)/70)));
    card.style.transform=`translate(${tx}px,${ty}px) perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.07)`;
  };
  const up=()=>{
    if(!drag)return;drag=false;card.classList.remove('held');card.classList.add('back');
    card.style.transform='';card.style.setProperty('--lift','0');
  };
  card.addEventListener('pointerdown',e=>{
    drag=true;sx=e.clientX;sy=e.clientY;card.classList.add('held');card.classList.remove('back');
    try{card.setPointerCapture(e.pointerId);}catch(x){}
    card.style.transform='translate(0,0) scale(1.07)';e.preventDefault();
  });
  card.addEventListener('pointermove',move);card.addEventListener('pointerup',up);card.addEventListener('pointercancel',up);
}
