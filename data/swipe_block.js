/* ===== Swipe-Modus: Wort oben, zwei ähnliche Vorschläge, einer ist richtig ===== */
function swipeWrong(w,id2gl){
  const L=curLang(),right=id2gl?glFirst(w):w.id,nr=id2gl?normG(right):normId(right);
  const ok=new Set(id2gl?gl(w).split(' / ').map(normG):[normId(w.id)].concat(S.cur&&S.cur.accept||[]));
  const cands=[];
  for(const x of L.words){
    if(x.k===w.k)continue;
    const cand=id2gl?glFirst(x):x.id,n=id2gl?normG(cand):normId(cand);
    if(!n||ok.has(n))continue;
    /* ähnlich = gleiche Kategorie, ähnliche Schreibweise, ähnliche Länge */
    const score=(x.cat===w.cat?3:0)+Math.max(0,3-editDist(n,nr)*.45)+Math.max(0,2-Math.abs(n.length-nr.length)*.4)+Math.random()*1.2;
    cands.push([score,cand]);
  }
  cands.sort((a,b)=>b[0]-a[0]);
  return cands.length?cands[0][1]:'?';
}
let swKey=null;
function showSwipe(){
  const c=S.cur,w=c.w,L=curLang(),s=sentOf(w),id2gl=Math.random()<.5;
  const right=id2gl?glFirst(w):w.id,wrong=swipeWrong(w,id2gl);
  const opts=Math.random()<.5?[[right,1],[wrong,0]]:[[wrong,0],[right,1]];
  const word=id2gl?w.id:gl(w),wl=id2gl?L.code.toLowerCase():state.ui,ol=id2gl?state.ui:L.code.toLowerCase();
  sheetBody(`<div class="smain">${kicker(c,'sent',t('Swipe')+' · '+(id2gl?toGl():toIdl()))}
    <p class="hint">${t('Wische die Karte zur richtigen Übersetzung oder tippe sie an.')}</p>
    <div class="swstage"><div class="swcard${word.length>16?' long':''}" id="swcard" lang="${wl}" aria-label="${esc(word)}">${esc(word)}</div></div>
    <div class="swopts">${opts.map((o,i)=>`<button class="swb ${i?'r':'l'}" data-i="${i}" data-r="${o[1]}" lang="${ol}">${i?'':'<i aria-hidden="true">←</i>'}<span>${esc(o[0])}</span>${i?'<i aria-hidden="true">→</i>':''}</button>`).join('')}</div>
    <div id="exfb"></div></div>`);
  const card=$('#swcard'),bs=$$('.swb',sheet);
  let done=false,drag=false,x0=0,dx=0,tm=0;
  const lean=d=>{bs[0].classList.toggle('lean',d<-24);bs[1].classList.toggle('lean',d>24);card.classList.toggle('lean',Math.abs(d)>24);};
  const choose=i=>{
    if(done)return;done=true;drag=false;
    const good=opts[i][1]===1,dir=i?1:-1;
    lean(0);card.classList.remove('drag');
    card.style.transform=`translateX(${dir*Math.max(380,window.innerWidth)}px) rotate(${dir*24}deg)`;card.classList.add('gone');
    sfx('swipe');
    bs.forEach((b,k)=>{b.disabled=true;if(opts[k][1]===1)b.classList.add('ok');else if(k===i)b.classList.add('no');});
    c.ok=c.ok&&good;
    $('#exfb').innerHTML=`<div class="res ${good?'good':'bad'}" role="status"><div class="rl">${good?t('Richtig'):t('Nicht ganz')}</div>
      <div class="pair"><span lang="${L.code.toLowerCase()}">${esc(w.id)}</span><em>=</em><span lang="${state.ui}">${esc(gl(w))}</span></div>
      ${s?`<p class="hint" style="margin-top:8px" lang="${L.code.toLowerCase()}">${hlId(s.id,w.id)}</p>`:''}</div>
      <button class="btn primary block" id="nx" style="margin-top:12px">${t('Weiter')}</button>`;
    $('#nx').onclick=nextStep;
    try{$('#nx').focus({preventScroll:true});}catch(e){}
    if(good)burst($('.res'),18);
  };
  bs.forEach((b,i)=>b.onclick=()=>choose(i));
  card.addEventListener('pointerdown',e=>{if(done)return;drag=true;x0=e.clientX;dx=0;tm=Date.now();card.classList.add('drag');try{card.setPointerCapture(e.pointerId);}catch(x){}});
  card.addEventListener('pointermove',e=>{if(!drag)return;dx=e.clientX-x0;card.style.transform=`translateX(${dx}px) rotate(${dx/14}deg)`;lean(dx);});
  const end=()=>{
    if(!drag)return;drag=false;card.classList.remove('drag');
    const v=Math.abs(dx)/Math.max(1,Date.now()-tm);
    if(Math.abs(dx)>70||(v>.6&&Math.abs(dx)>25))choose(dx<0?0:1);
    else{card.style.transform='';lean(0);}
  };
  card.addEventListener('pointerup',end);card.addEventListener('pointercancel',end);
  /* Pfeiltasten am PC */
  if(swKey)document.removeEventListener('keydown',swKey);
  swKey=e=>{
    if(!document.body.contains(card)){document.removeEventListener('keydown',swKey);swKey=null;return;}
    if(e.key==='ArrowLeft'){e.preventDefault();choose(0);}else if(e.key==='ArrowRight'){e.preventDefault();choose(1);}
  };
  document.addEventListener('keydown',swKey);
}
