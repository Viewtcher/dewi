/* ===== Modul Slots (Version 155): goldener Spielautomat mit Symbolen =====
   Statt Wörtern drehen die Walzen Bilder: Zahlen 0–10 und Früchte. Wo die Walzen stoppen, steht schon vorher fest
   (der „Zufall“ ist Show). Danach nennt man für jedes Symbol das Wort in der Lernsprache (Auswahl aus zwei Knöpfen).
   - Kommt nur, wenn das aktuelle Wort ein Symbol hat. Es zählt für die Stufen wie jedes Modul.
   - 1 bekanntes Symbolwort: alle drei Walzen gleich (erzwungen, kein Bonus, keine Jackpot-Show).
     2 bekannte: zwei gleiche und ein anderes. Ab 3: echter Zufall, das aktuelle Wort ist immer dabei.
   - Drei gleiche Symbole: nur eine Frage. Echter Dreier (ab 3 bekannten) = Jackpot-Show.
   - Alle richtig: im Survival doppelte Punkte (nicht beim erzwungenen Dreier).
   - Falsche Antwort-Option: ein Wort, das man schon kennt (bevorzugt ein anderes Symbolwort).
   Das alte Modul Reels bleibt unverändert daneben bestehen. */

const SL_NUM=['zero','one','two','three','four','five','six','seven','eight','nine','ten'];
const SL_FRUIT=['apple','banana','orange','lemon','mango','pineapple','watermelon','coconut'];
const SL_SYMS=SL_NUM.concat(SL_FRUIT);
const SL_CELL=80,SL_WIN=120;   // Höhe einer Symbolzelle und des Walzenfensters in px
const SL_STRIP=26;         // Zellen pro Walzenstreifen (Version 156: länger, damit der Wirbel richtig schnell ist)
const SL_STOP=[.75,1,1.25];   // Version 156: ein schneller Wirbel, Stopp links, Mitte, rechts (Sekunden)
const SL_OUT='#2a0c20';

/* Englische Bedeutung des Wortes: im Englischkurs steht sie im Wort selbst, sonst in w.en */
function slotKey(w){
  if(!w)return null;
  const e=String(state.lang==='en'?w.id:w.en).toLowerCase().trim();
  return SL_SYMS.indexOf(e)>=0?e:null;
}
const slKnown=w=>!!(state.progress[state.lang]||{})[w.k];

/* ---- Symbole: glänzend, Comic-Kontur, Früchte mit Diva-Gesicht ---- */
function slFace(cx,cy,s){
  s=s||1;const e=(x,m)=>`M${x-5*s} ${cy} q${5*s} ${4*s*m} ${10*s} 0`;
  const lash=(x,d)=>`M${x} ${cy} l${d*3*s} ${-3*s} M${x+d*2*s} ${cy+1.2*s} l${d*3.4*s} ${-2*s}`;
  return `<g class="face" fill="none" stroke="${SL_OUT}" stroke-width="${2.4*s}" stroke-linecap="round">
    <ellipse cx="${cx-14*s}" cy="${cy+7*s}" rx="${4.5*s}" ry="${2.6*s}" fill="#ff6fa6" stroke="none" opacity=".75"/>
    <ellipse cx="${cx+14*s}" cy="${cy+7*s}" rx="${4.5*s}" ry="${2.6*s}" fill="#ff6fa6" stroke="none" opacity=".75"/>
    <path d="${e(cx-9*s,1)} ${e(cx+9*s,1)}"/>
    <path d="${lash(cx-14*s,-1)} ${lash(cx+14*s,1)}" stroke-width="${1.8*s}"/>
    <path d="M${cx-4*s} ${cy+9*s} q${4*s} ${3.5*s} ${8*s} ${-1*s}"/></g>`;
}
const slSpark=(x,y,r)=>`<path d="M${x} ${y-r}Q${x+r*.18} ${y-r*.18} ${x+r} ${y}Q${x+r*.18} ${y+r*.18} ${x} ${y+r}Q${x-r*.18} ${y+r*.18} ${x-r} ${y}Q${x-r*.18} ${y-r*.18} ${x} ${y-r}Z" fill="#fff"/>`;
const slGloss=(x,y,rx,ry,rot)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".6" transform="rotate(${rot||-30} ${x} ${y})"/><circle cx="${x+rx*.9}" cy="${y+ry*1.6}" r="${Math.max(2,ry*.35)}" fill="#fff" opacity=".7"/>`;
function slGrad(id,stops,radial){
  const st=stops.map((c,i)=>`<stop offset="${Math.round(i/(stops.length-1)*100)}%" stop-color="${c}"/>`).join('');
  return radial?`<radialGradient id="${id}" cx="38%" cy="32%" r="75%">${st}</radialGradient>`:`<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${st}</linearGradient>`;
}
const SL_ART={
  apple:()=>`<defs>${slGrad('sl-ap',['#ff8a8a','#ff2d4f','#a50a2c'],1)}${slGrad('sl-lf',['#9dff8a','#28b54a'])}</defs>
    <path d="M52 30Q56 16 62 11" stroke="#6b3a1c" stroke-width="5" stroke-linecap="round" fill="none"/>
    <path d="M56 24Q70 8 84 16Q72 32 56 24Z" fill="url(#sl-lf)" stroke="${SL_OUT}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M50 31C34 18 10 28 12 53C14 80 36 94 50 87C64 94 86 80 88 53C90 28 66 18 50 31Z" fill="url(#sl-ap)" stroke="${SL_OUT}" stroke-width="3.5" stroke-linejoin="round"/>
    ${slGloss(30,44,9,5)}${slFace(50,60,1)}${slSpark(84,28,7)}`,
  banana:()=>`<defs>${slGrad('sl-ba',['#fff59a','#ffd530','#e59a0c'])}</defs>
    <path d="M16 26Q18 82 76 82Q88 82 90 72Q52 74 36 28Q32 18 24 19Q14 20 16 26Z" fill="url(#sl-ba)" stroke="${SL_OUT}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M16 26Q14 20 20 18L24 19Q20 21 21 26Z" fill="#6b3a1c" stroke="${SL_OUT}" stroke-width="2.5" stroke-linejoin="round"/>
    ${slGloss(28,44,4,11,-25)}${slFace(52,64,.85)}${slSpark(80,24,7)}`,
  orange:()=>`<defs>${slGrad('sl-or',['#ffd08a','#ff9a1f','#d9560a'],1)}${slGrad('sl-lf2',['#9dff8a','#28b54a'])}</defs>
    <circle cx="50" cy="56" r="33" fill="url(#sl-or)" stroke="${SL_OUT}" stroke-width="3.5"/>
    <path d="M50 24Q60 8 76 14Q64 30 50 24Z" fill="url(#sl-lf2)" stroke="${SL_OUT}" stroke-width="3" stroke-linejoin="round"/>
    <g fill="#c4500a" opacity=".45"><circle cx="66" cy="44" r="1.6"/><circle cx="72" cy="56" r="1.6"/><circle cx="36" cy="74" r="1.6"/><circle cx="60" cy="80" r="1.6"/></g>
    ${slGloss(34,42,9,5)}${slFace(50,58,1)}${slSpark(84,30,7)}`,
  lemon:()=>`<defs>${slGrad('sl-le',['#fffbb0','#ffe93a','#e0b40c'],1)}</defs>
    <path d="M10 56Q12 46 22 44Q38 24 62 28Q82 32 88 48Q93 54 88 60Q82 80 56 81Q32 82 20 68Q10 66 10 56Z" fill="url(#sl-le)" stroke="${SL_OUT}" stroke-width="3.5" stroke-linejoin="round"/>
    ${slGloss(34,42,10,5,-15)}${slFace(52,56,1)}${slSpark(84,22,7)}`,
  mango:()=>`<defs>${slGrad('sl-ma',['#ffe066','#ff9a2e','#ff3d5a'])}${slGrad('sl-lf3',['#9dff8a','#28b54a'])}</defs>
    <path d="M28 32Q60 12 80 40Q94 66 70 84Q44 96 26 76Q12 56 28 32Z" fill="url(#sl-ma)" stroke="${SL_OUT}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M44 24Q50 6 70 8Q62 26 44 24Z" fill="url(#sl-lf3)" stroke="${SL_OUT}" stroke-width="3" stroke-linejoin="round"/>
    ${slGloss(34,42,9,5)}${slFace(52,58,1)}${slSpark(86,26,7)}`,
  pineapple:()=>`<defs>${slGrad('sl-pi',['#fff08a','#ffc21f','#d98a0c'])}${slGrad('sl-lf4',['#9dff8a','#1f9a3e'])}<clipPath id="sl-pic"><ellipse cx="50" cy="64" rx="27" ry="30"/></clipPath></defs>
    <path d="M50 38L36 10L48 24L50 4L54 24L66 8L60 38Z" fill="url(#sl-lf4)" stroke="${SL_OUT}" stroke-width="3" stroke-linejoin="round"/>
    <ellipse cx="50" cy="64" rx="27" ry="30" fill="url(#sl-pi)" stroke="${SL_OUT}" stroke-width="3.5"/>
    <g clip-path="url(#sl-pic)" stroke="#b86d0a" stroke-width="2" opacity=".55"><path d="M10 40L90 120M10 60L80 130M10 20L90 100M30 10L100 80M90 40L10 120M90 60L20 130M90 20L10 100M70 10L0 80"/></g>
    ${slGloss(36,50,8,5)}${slFace(50,66,.95)}${slSpark(84,34,7)}`,
  watermelon:()=>`<defs>${slGrad('sl-wm',['#ff8aa8','#ff2d55','#d0103e'])}</defs>
    <path d="M8 34L92 34A42 42 0 0 1 8 34Z" fill="#3ccf5a" stroke="${SL_OUT}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M15 34L85 34A35 35 0 0 1 15 34Z" fill="#eaffd8"/>
    <path d="M19 34L81 34A31 31 0 0 1 19 34Z" fill="url(#sl-wm)"/>
    <g fill="${SL_OUT}"><ellipse cx="30" cy="44" rx="2" ry="3.2"/><ellipse cx="70" cy="44" rx="2" ry="3.2"/><ellipse cx="40" cy="58" rx="2" ry="3.2"/><ellipse cx="62" cy="58" rx="2" ry="3.2"/></g>
    <path d="M26 38Q38 40 46 38" stroke="#fff" stroke-width="3" opacity=".6" stroke-linecap="round" fill="none"/>
    ${slFace(50,44,.85)}${slSpark(86,18,7)}`,
  coconut:()=>`<defs>${slGrad('sl-co',['#c98a5a','#8a4f26','#4f2a12'],1)}</defs>
    <circle cx="50" cy="56" r="34" fill="url(#sl-co)" stroke="${SL_OUT}" stroke-width="3.5"/>
    <g stroke="#3a1c0a" stroke-width="1.6" opacity=".55" stroke-linecap="round"><path d="M28 34l4 5M68 30l-3 6M80 52l-5 2M22 60l5 1M34 84l3-4M70 82l-3-4"/></g>
    ${slGloss(34,40,9,5)}${slFace(50,58,1)}${slSpark(86,26,7)}`
};
function slNumArt(k){
  const n=String(SL_NUM.indexOf(k)),fs=n.length>1?62:84,y=n.length>1?74:82,id='sl-n'+n;
  const txt=a=>`<text x="50" y="${y}" text-anchor="middle" font-size="${fs}" font-weight="900" style="font-family:var(--display)" ${a}>${n}</text>`;
  return `<defs>${slGrad(id,['#ff7a7a','#ff1f45','#a8062a'])}<clipPath id="${id}c">${txt('')}</clipPath></defs>
    ${txt(`fill="none" stroke="${SL_OUT}" stroke-width="15" stroke-linejoin="round"`)}
    ${txt('fill="none" stroke="#ffd34d" stroke-width="8" stroke-linejoin="round"')}
    ${txt(`fill="url(#${id})"`)}
    <rect x="0" y="0" width="100" height="${y-fs*.42}" fill="#fff" opacity=".38" clip-path="url(#${id}c)"/>
    ${slSpark(n.length>1?88:80,20,7)}`;
}
function slSvg(k){
  const body=SL_ART[k]?SL_ART[k]():slNumArt(k);
  return `<svg class="slsym" viewBox="0 0 100 100" aria-hidden="true">${body}</svg>`;
}

/* ---- Plan: welche Symbole landen wo, welche Fragen kommen ---- */
function slotsData(w){
  const L=curLang(),key=slotKey(w);if(!key)return null;
  const bySym={};bySym[key]=w;
  L.words.forEach(x=>{const k=slotKey(x);if(k&&!bySym[k]&&x.k!==w.k&&slKnown(x))bySym[k]=x;});
  const pool=Object.keys(bySym),n=pool.length;
  let reels;
  if(n===1)reels=[key,key,key];
  else if(n===2){const o=pool.find(k=>k!==key);reels=shuffle(Math.random()<.5?[key,key,o]:[key,o,o]);}
  else{reels=[0,1,2].map(()=>pool[Math.floor(Math.random()*n)]);reels[Math.floor(Math.random()*3)]=key;}
  if(window.__slReels)reels=window.__slReels.slice();   // nur für Tests
  const triple=reels[0]===reels[1]&&reels[1]===reels[2];
  const forced=triple&&n<3;
  /* Fragen: bei drei gleichen nur eine, sonst eine pro Walze */
  const qs=(triple?[0]:[0,1,2]).map(i=>{const sw=bySym[reels[i]];return {i,sym:reels[i],w:sw,right:sw.id,opts:shuffle([sw.id,slFoil(sw,bySym)])};});
  return {key,reels,triple,forced,qs,pool:pool.length};
}
/* falsche Option: ein bekanntes Wort, bevorzugt ein anderes Symbolwort, ähnliche Länge */
function slFoil(sw,bySym){
  const L=curLang(),me=normId(sw.id);
  const ok=x=>x.k!==sw.k&&normId(x.id)!==me&&slotKey(x)!==slotKey(sw);
  const syms=shuffle(Object.values(bySym).filter(ok));
  if(syms.length)return syms[0].id;
  const known=L.words.filter(x=>ok(x)&&slKnown(x));
  const near=known.sort((a,b)=>Math.abs(a.id.length-sw.id.length)-Math.abs(b.id.length-sw.id.length)+(Math.random()-.5)*4);
  if(near.length)return near[0].id;
  const any=shuffle(L.words.filter(ok));return any.length?any[0].id:'?';
}
function slSoon(f,ms){if(window.__introMs===0||reduceMotion())return f();setTimeout(f,ms);}

function showSlots(w){
  const c=S.cur,L=curLang(),D=slotsData(w),lc=L.code.toLowerCase();
  const tries=triesFor('slots');
  const Z={D,miss:0,q:0,state:'idle'};c.sl=Z;
  const strip=(tgt,i)=>{
    const cells=[];for(let k=0;k<SL_STRIP;k++)cells.push(SL_SYMS[Math.floor(Math.random()*SL_SYMS.length)]);
    cells[SL_STRIP-2]=tgt;   // hier bleibt die Walze stehen (mit einem Nachbarn darunter)
    cells[1]=SL_SYMS[(SL_SYMS.indexOf(tgt)+3+i)%SL_SYMS.length];
    return cells.map(k=>`<div class="slc">${slSvg(k)}</div>`).join('');
  };
  sheetBody(`<div class="smain slm">${kicker(c,'slots',toIdl())}${roundLives()}
    <div id="rlm" class="rl-m">${mascot('reels_ready',null,'sm')}</div>
    <div class="slstage">${helpBtn('slots')}
      <div class="slmach" id="slmach" data-st="idle">
        <div class="slcap l"></div>
        <div class="slbody"><div class="slwin">${D.reels.map((k,i)=>`<div class="slreel" data-i="${i}" aria-label="${t('Walze {0}',i+1)}"><div class="slstrip">${strip(k,i)}</div><i class="slstreak" aria-hidden="true"></i><span class="slword" lang="${lc}"></span></div>`).join('')}
          ${[0,1,2,3].map(k=>`<i class="slring r${k}" aria-hidden="true"></i>`).join('')}
          <i class="slarr l" aria-hidden="true"></i><i class="slarr r" aria-hidden="true"></i></div></div>
        <div class="slcap r"></div>
        <div class="sllev" id="sllev" role="button" tabindex="0" aria-label="${t('Hebel ziehen')}"><i class="slrod"></i><i class="slball"></i></div>
      </div>
    </div>
    <div id="slq" class="slq"><p class="slhint">${t('Zieh den Hebel.')}</p></div>
    <div id="exfb"></div></div>`);
  const mach=$('#slmach'),lev=$('#sllev'),reels=$$('.slreel',sheet);
  const say=k=>{const m=$('#rlm');if(m)m.innerHTML=mascot(k,null,'sm');};
  /* Startstellung: zweite Zelle sichtbar */
  const pos=k=>`translate3d(0,${-(k*SL_CELL)+(SL_WIN-SL_CELL)/2}px,0)`;
  reels.forEach(r=>{r.firstChild.style.transform=pos(1);});

  function pull(){
    if(Z.state!=='idle')return;Z.state='spin';
    mach.dataset.st='spin';lev.classList.add('pulled');setTimeout(()=>lev.classList.remove('pulled'),420);
    /* Version 156: elektrisches Aufladen, Knistern während des Wirbels, harter Einschlag pro Walze */
    sfx('slcharge');sfx('slcrack',140);haptic([30,20,45]);
    $('#slq').innerHTML='';
    const instant=window.__introMs===0||reduceMotion();
    reels.forEach((r,i)=>{
      const s=r.firstChild,dur=SL_STOP[i];
      r.classList.add('spin');
      if(!instant){s.style.transition=`transform ${dur}s cubic-bezier(.22,.9,.3,1.03)`;}
      s.style.transform=pos(SL_STRIP-2);
      slSoon(()=>{r.classList.remove('spin');r.classList.add('stop');sfx('slslam');haptic([45]);},dur*1000);
    });
    slSoon(()=>{if(mach.dataset.st==='spin')mach.dataset.st='glow';},SL_STOP[2]*1000);
    slSoon(landed,SL_STOP[2]*1000+200);
  }
  function landed(){
    if(Z.state!=='spin'||!$('#slq'))return;
    Z.state='ask';mach.dataset.st=D.triple&&!D.forced?'jack':'ask';
    if(D.triple&&!D.forced){sfx('jackpot');haptic([30,40,30,40,80]);burst(mach,30);say('reels_jackpot');}
    ask();
  }
  function ask(){
    const q=D.qs[Z.q];
    reels.forEach((r,i)=>r.classList.toggle('act',D.triple?true:i===q.i));
    $('#slq').innerHTML=`<p class="slhint">${D.triple?t('Alle drei: Wie heißt das?'):t('Wie heißt Symbol {0}?',q.i+1)}</p>
      <div class="opts two">${q.opts.map(o=>`<button class="iopt tgt" data-r="${o===q.right?1:0}" lang="${lc}">${esc(o)}</button>`).join('')}</div>`;
    $$('#slq .iopt',sheet).forEach(b=>b.onclick=()=>answer(b,b.dataset.r==='1'));
  }
  function answer(b,good){
    if(Z.state!=='ask')return;
    const q=D.qs[Z.q];
    if(!good){
      Z.miss++;b.classList.add('no');b.disabled=true;sfx('rbad');haptic([40,30,40]);
      if(Z.miss>=tries)return finish(false);
      say('reels_bad');return;
    }
    b.classList.add('ok');$$('#slq .iopt',sheet).forEach(x=>x.disabled=true);
    sfx('rwin');haptic([22]);
    (D.triple?reels:[reels[q.i]]).forEach(r=>{r.classList.add('ok');r.classList.remove('act');r.querySelector('.slword').textContent=q.right;});
    Z.q++;
    if(Z.q>=D.qs.length)return slSoon(()=>finish(true),260);
    say('reels_ok');slSoon(ask,320);
  }
  function finish(win){
    if(Z.state==='over')return;Z.state='over';
    c.ok=c.ok&&win;
    if(win&&S.kind==='survival'&&!D.forced)c.ptsMul=2;   // alle richtig: doppelte Punkte (nicht beim erzwungenen Dreier)
    settleCard();
    mach.dataset.st=win?(D.triple&&!D.forced?'jack':'win'):'lose';
    /* nicht beantwortete Symbole aufdecken */
    D.qs.forEach(q=>(D.triple?reels:[reels[q.i]]).forEach(r=>{const s=r.querySelector('.slword');if(!s.textContent){s.textContent=q.right;r.classList.add('rev');}}));
    reels.forEach(r=>r.classList.remove('act'));
    if(win){chipRain(D.triple&&!D.forced?40:24);sfx('chips');haptic([20,30,20]);say(D.triple&&!D.forced?'reels_jackpot':'reels_win');}
    else{sfx('end_bad');say('reels_lose');}
    const words=D.reels.map(k=>D.qs.find(q=>q.sym===k).right);
    $('#slq').innerHTML='';
    $('#exfb').innerHTML=`<div class="res ${win?'good':'bad'}" role="status"><div class="rl">${win?(D.triple&&!D.forced?t('Jackpot!'):t('Richtig')):t('Nicht ganz')}</div>
      <div class="pair" lang="${lc}">${words.map(esc).join(' · ')}</div>
      ${win&&c.ptsMul===2?`<p class="hint" style="margin-top:6px">${t('Alle richtig: doppelte Punkte!')}</p>`:''}</div>${resultNote(win)}
      <button class="btn primary block" id="nx" style="margin-top:12px">${t('Weiter')}</button>`;
    $('#nx').onclick=nextStep;
    try{$('#nx').focus({preventScroll:true});}catch(e){}
  }
  c.slPull=pull;
  /* Hebel: antippen oder nach unten ziehen */
  let dy=null;
  lev.addEventListener('pointerdown',e=>{e.preventDefault();if(Z.state!=='idle')return;dy=e.clientY;try{lev.setPointerCapture(e.pointerId);}catch(x){}});
  lev.addEventListener('pointermove',e=>{if(dy===null)return;if(e.clientY-dy>40){dy=null;pull();}});
  lev.addEventListener('pointerup',()=>{if(dy!==null){dy=null;pull();}});
  lev.addEventListener('pointercancel',()=>{dy=null;});
  lev.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pull();}});
  lev.addEventListener('click',e=>{if(e.detail===0)pull();});
  /* Tippen auf den Automaten zieht auch den Hebel */
  mach.addEventListener('click',e=>{if(!e.target.closest('#sllev'))pull();});
}

registerModule({id:'slots',name:()=>t('Slots'),desc:()=>t('Hebel ziehen, Symbole benennen'),tone:'t2',solo:true,isNew:true,fallback:'choice',
  icon:'<svg width="52" height="40" viewBox="0 0 52 40" aria-hidden="true"><defs><linearGradient id="slig" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2a8"/><stop offset=".5" stop-color="#f5b81f"/><stop offset="1" stop-color="#b9780c"/></linearGradient></defs><rect x="2" y="9" width="38" height="24" rx="12" fill="url(#slig)" stroke="#2a0c20" stroke-width="2"/><rect x="8" y="13" width="26" height="16" rx="3" fill="#fff" stroke="#2a0c20" stroke-width="1.5"/><text x="21" y="26" text-anchor="middle" font-size="12" font-weight="900" fill="#ff1f45" font-family="sans-serif">777</text><rect x="43" y="12" width="3" height="16" rx="1.5" fill="#d8d8e0"/><circle cx="44.5" cy="9" r="5" fill="url(#slig)" stroke="#2a0c20" stroke-width="1.5"/></svg>',
  can:w=>!!slotKey(w),show:w=>showSlots(w)});
