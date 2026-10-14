/* Modul Reihenfolge: Die Wörter eines bekannten Satzes liegen durcheinander und werden per Ziehen in die richtige Reihenfolge gebracht.
   Aufgabe: Übersetzung steht oben, der indonesische Satz wird sortiert. Nur für Wörter bis Stufe 2, Sätze mit 4 bis 7 Wörtern,
   die komplett aus gelernten Wörtern bestehen (das Zielwort zählt als gelernt). Ein Versuch.
   Bedienung: Kachel ziehen, die anderen weichen live aus (Platzhalter wandert), beim Loslassen rastet sie ein. Pfeiltasten verschieben ebenfalls. */
const ORDER_MIN=4,ORDER_MAX=7,ORDER_MAXLVL=2;
function orderPair(w){
  const L=curLang(),p=(state.progress[L.id]||{})[w.k];
  if(p&&p.l>ORDER_MAXLVL)return null;
  const s=sentOf(w);
  const pair=s?{id:s.id,gl:s.plain}:{id:w.id,gl:glFirst(w)};
  const tl=tilesOf(pair.id);
  if(tl.length<ORDER_MIN||tl.length>ORDER_MAX)return null;
  if(!window.__rlAll){const kn=knownTokens(w);if(!tokensOf(pair.id).every(tk=>isName(tk)||kn.has(normId(tk))))return null;}
  if(new Set(tl.map(normId)).size<2)return null;
  return pair;
}

function showOrder(pair){
  const c=S.cur,L=curLang(),lang=L.code.toLowerCase();
  const target=tilesOf(pair.id),want=target.map(normId),wantS=want.join('|');
  let order,guard=0;
  do{order=shuffle(target.map((tk,i)=>i));}while(order.map(i=>want[i]).join('|')===wantS&&++guard<30);
  let done=false,lives=triesFor('order'),drag=null;
  window.__lastOrder={target,order:order.slice()};   // nur für Tests
  sheetBody(`<div class="smain">${kicker(c,'order')}${roundLives()}
    <div class="sentbox hq" lang="${state.ui}">${esc(pair.gl)}${helpBtn('order')}</div>
    <div class="ord" id="ord" lang="${lang}" aria-label="${t('Dein Satz')}">${order.map(i=>`<button type="button" class="tile otile" data-i="${i}">${esc(target[i])}</button>`).join('')}</div>
    <p class="hint ordhint">${t('Zieh die Kacheln in die richtige Reihenfolge.')}</p>
    <div id="exfb"></div>
    <button class="btn primary block" id="chk">${t('Prüfen')}</button></div>`);
  const O=$('#ord'),chk=$('#chk');
  const cur=()=>Array.from(O.querySelectorAll('.otile'));
  const clearMarks=()=>{O.classList.remove('bad');cur().forEach(e=>e.classList.remove('bad','good'));if(!done)$('#exfb').innerHTML='';};
  /* Geschwister gleiten an ihren neuen Platz (FLIP), statt zu springen */
  function flip(mut){
    const els=Array.from(O.children).filter(x=>!drag||x!==drag.el),before=els.map(e=>e.getBoundingClientRect());
    mut();
    els.forEach((e,i)=>{
      const b=e.getBoundingClientRect(),dx=before[i].left-b.left,dy=before[i].top-b.top;
      if(!dx&&!dy)return;
      e.style.transition='none';e.style.transform=`translate(${dx}px,${dy}px)`;e.getBoundingClientRect();
      e.style.transition='transform .18s ease';e.style.transform='';
    });
  }
  function begin(e){
    const el=drag.el,r=el.getBoundingClientRect();
    const ph=document.createElement('span');ph.className='tile oph';ph.style.width=r.width+'px';ph.style.height=r.height+'px';ph.setAttribute('aria-hidden','true');
    O.insertBefore(ph,el);drag.ph=ph;drag.moved=true;
    el.classList.add('dragging');el.style.width=r.width+'px';el.style.height=r.height+'px';el.style.left='0px';el.style.top='0px';
    const o=el.getBoundingClientRect();drag.bx=o.left;drag.by=o.top;   // Bezug auch dann richtig, wenn ein Elternteil „fixed" verschiebt
    clearMarks();sfx('pop');haptic(8);
  }
  function place(px,py){
    const el=drag.el,ph=drag.ph;
    el.style.left=(px-drag.dx-drag.bx)+'px';el.style.top=(py-drag.dy-drag.by)+'px';
    const kids=Array.from(O.children).filter(x=>x!==el),sibs=kids.filter(x=>x!==ph);
    const hit=sibs.find(s=>{const r=s.getBoundingClientRect();return px>=r.left&&px<=r.right&&py>=r.top&&py<=r.bottom;});
    let ref=null,after=false;
    if(hit){after=kids.indexOf(ph)<kids.indexOf(hit);ref=hit;}
    else{
      const rp=ph.getBoundingClientRect();
      if(px>=rp.left&&px<=rp.right&&py>=rp.top&&py<=rp.bottom)return;
      let bd=1e9;
      sibs.forEach(s=>{const r=s.getBoundingClientRect(),d=Math.abs(py-(r.top+r.height/2))*3+Math.abs(px-(r.left+r.width/2));if(d<bd){bd=d;ref=s;after=px>r.left+r.width/2;}});
    }
    if(!ref)return;
    const nextEl=after?ref.nextSibling:ref;
    if(nextEl===ph||ref.nextSibling===ph&&after)return;
    flip(()=>O.insertBefore(ph,nextEl));
    sfx('click');haptic(5);
  }
  function drop(){
    const d=drag;if(!d)return;drag=null;
    if(!d.moved)return;
    const r=d.ph.getBoundingClientRect();
    d.el.style.transition='left .14s ease,top .14s ease,transform .14s ease';
    d.el.style.left=(r.left-d.bx)+'px';d.el.style.top=(r.top-d.by)+'px';d.el.classList.add('landing');
    const fin=()=>{
      if(!d.ph.parentNode)return;
      O.replaceChild(d.el,d.ph);
      d.el.classList.remove('dragging','landing');['left','top','width','height','transition','transform'].forEach(p=>d.el.style[p]='');
    };
    setTimeout(fin,150);sfx('pop');haptic(10);
  }
  O.addEventListener('pointerdown',e=>{
    const el=e.target.closest&&e.target.closest('.otile');
    if(!el||done||drag||(e.button&&e.button!==0))return;
    const r=el.getBoundingClientRect();
    drag={el,id:e.pointerId,dx:e.clientX-r.left,dy:e.clientY-r.top,sx:e.clientX,sy:e.clientY,moved:false};
    try{el.setPointerCapture(e.pointerId);}catch(x){}
  });
  O.addEventListener('pointermove',e=>{
    if(!drag||e.pointerId!==drag.id)return;
    if(!drag.moved){if(Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)<5)return;begin(e);}
    e.preventDefault();place(e.clientX,e.clientY);
  });
  ['pointerup','pointercancel'].forEach(n=>O.addEventListener(n,e=>{if(drag&&e.pointerId===drag.id)drop();}));
  O.addEventListener('contextmenu',e=>e.preventDefault());
  /* Tastatur: Pfeiltasten verschieben die fokussierte Kachel */
  O.addEventListener('keydown',e=>{
    const el=e.target.closest&&e.target.closest('.otile');
    if(!el||done||(e.key!=='ArrowLeft'&&e.key!=='ArrowRight'&&e.key!=='ArrowUp'&&e.key!=='ArrowDown'))return;
    e.preventDefault();clearMarks();
    const back=e.key==='ArrowLeft'||e.key==='ArrowUp',sib=back?el.previousElementSibling:el.nextElementSibling;
    if(!sib)return;
    flip(()=>O.insertBefore(el,back?sib:sib.nextSibling));
    try{el.focus({preventScroll:true});}catch(x){}
    sfx('click');
  });
  chk.onclick=()=>{
    if(done){nextStep();return;}
    if(drag)return;
    const els=cur(),ids=els.map(e=>want[+e.dataset.i]),good=ids.join('|')===wantS;
    if(!good){
      lives--;
      if(lives>0){
        els.forEach((e,p)=>e.classList.toggle('bad',ids[p]!==want[p]));
        $('#exfb').innerHTML=`<p class="fb bad" role="status">${t('Nicht ganz. Versuch es nochmal.')}</p>`;return;
      }
    }
    done=true;
    c.ok=c.ok&&good;settleCard();
    els.forEach((e,p)=>{e.classList.remove('bad');e.classList.add(ids[p]===want[p]?'good':'bad');e.disabled=true;});
    O.classList.add(good?'good':'bad');
    $('.ordhint').hidden=true;
    $('#exfb').innerHTML=`<div class="res ${good?'good':'bad'}" role="status"><div class="rl">${good?t('Richtig'):t('Nicht ganz')}</div>
      <div class="pair" lang="${lang}">${esc(target.join(' '))}</div></div>${resultNote(good)}`;
    chk.textContent=t('Weiter');
    try{chk.focus({preventScroll:true});}catch(x){}
    if(good)burst($('.res'),18);
  };
}

registerModule({id:'order',name:()=>t('Reihenfolge'),desc:()=>t('Wörter in die richtige Reihenfolge schieben'),tone:'t5',solo:true,isNew:true,fallback:'swipe',
  icon:'<svg width="46" height="40" viewBox="0 0 46 40" fill="none" aria-hidden="true"><rect x="2" y="6" width="12" height="12" rx="3.5" fill="#6ee77a"/><rect x="17" y="6" width="12" height="12" rx="3.5" fill="#35dcd2"/><rect x="32" y="6" width="12" height="12" rx="3.5" fill="#a888ff"/><path d="M8 29h30M33 25l5 4-5 4" stroke="#b9a5cc" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  can:w=>!!orderPair(w),show:w=>showOrder(orderPair(w))});
