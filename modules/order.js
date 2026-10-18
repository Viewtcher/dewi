/* Modul Reihenfolge: Die Wörter eines Satzes liegen durcheinander und werden per Ziehen in die richtige Reihenfolge gebracht.
   Aufgabe: Übersetzung steht oben, der indonesische Satz wird sortiert. Sätze mit 4 bis 7 Wörtern, keine Stufen-Grenze.
   Noch nicht gelernte Wörter stehen fest an ihrer Stelle (dezent lila), das passende Wort der Übersetzung ist lila unterstrichen, die gelernte Vokabel gelb. Ein Versuch.
   Bedienung: Kachel ziehen, die anderen weichen live aus (Platzhalter wandert), beim Loslassen rastet sie ein. Pfeiltasten verschieben ebenfalls. */
/* Feintuning des Gefühls: Dauer des Ausweichens, Pause zwischen zwei Platzwechseln, Randzone (Anteil der Breite), die nicht auslöst */
const ORDER_GLIDE=.32,ORDER_COOLDOWN=230,ORDER_EDGE=.22;
const ORDER_MIN=4,ORDER_MAX=7,ORDER_MAX_GIVEN=2,ORDER_MIN_FREE=2;
/* Plan für ein Wort oder null. Noch nicht gelernte Wörter des Satzes werden geschenkt: Sie stehen fest an ihrer Stelle (dezent lila), und das passende
   Wort der Übersetzung wird markiert. Grenzen: höchstens 2 feste Steine, mindestens 2 zum Sortieren, 4 bis 7 Wörter. Keine Stufen-Grenze. */
function orderPair(w){
  const s=sentOf(w);
  const pair=s?{id:s.id,gl:s.plain}:{id:w.id,gl:glFirst(w)};
  const target=tilesOf(pair.id);
  if(target.length<ORDER_MIN||target.length>ORDER_MAX)return null;
  const known=knownTokens(w),given=new Set(),hl=new Set(),glT=tilesOf(pair.gl);
  const unk=window.__rlAll?[]:tokensOf(pair.id).filter(tk=>!isName(tk)&&!known.has(normId(tk)));
  for(const u of unk){
    const eq=blockEquiv(u,glT);if(!eq)return null;
    eq.forEach(i=>hl.add(i));
    target.forEach((tk,i)=>{if(normId(tk)===normId(u))given.add(i);});
  }
  if(given.size>ORDER_MAX_GIVEN||target.length-given.size<ORDER_MIN_FREE)return null;
  if(new Set(target.filter((tk,i)=>!given.has(i)).map(normId)).size<2)return null;
  return {id:pair.id,gl:pair.gl,given:Array.from(given),hl:Array.from(hl)};
}
/* Übersetzung mit markierten Wörtern (gleiche Zerlegung wie tokensOf) */
function orderGlHtml(pair,w){
  const T=tilesOf(pair.id),g=new Set(pair.given),as=new Set();
  T.forEach((tk,i)=>{if(!g.has(i))as.add(i);});
  return glPrompt(w,pair.id,pair.gl,as,g);
}

function showOrder(pair){
  const c=S.cur,L=curLang(),lang=L.code.toLowerCase();
  const target=tilesOf(pair.id),want=target.map(normId),wantS=want.join('|'),given=new Set(pair.given),n=target.length;
  const freeIdx=target.map((tk,i)=>i).filter(i=>!given.has(i)),nFree=freeIdx.length;
  let order,guard=0;
  do{order=shuffle(freeIdx.slice());}while(nFree>2&&order.map(i=>want[i]).join('|')===freeIdx.map(i=>want[i]).join('|')&&++guard<30);
  let k=0,done=false,lives=triesFor('order'),drag=null;
  window.__lastOrder={target,order:order.slice(),given:pair.given.slice()};   // nur für Tests
  const cells=target.map((tk,pi)=>given.has(pi)?`<span class="tile given" data-i="${pi}">${esc(tk)}</span>`:`<button type="button" class="tile otile" data-i="${order[k++]}"><i class="grip" aria-hidden="true"></i>${esc(target[order[k-1]])}</button>`).join('');
  sheetBody(`<div class="smain">${kicker(c,'order')}${roundLives()}
    <div class="sentbox hq" lang="${state.ui}">${orderGlHtml(pair,c.w)}${helpBtn('order')}</div>
    <div class="ord" id="ord" lang="${lang}" aria-label="${t('Dein Satz')}">${cells}</div>
    <p class="hint ordhint">${t('Zieh die Kacheln in die richtige Reihenfolge.')}</p>
    <div id="exfb"></div>
    <button class="btn primary block" id="chk" disabled>${t('Prüfen')}</button></div>`);   // gesperrt, bis die erste Kachel verschoben wurde (kein Prüfen aus Reflex)
  const O=$('#ord'),chk=$('#chk');
  /* einmaliger Hinweis beim Erscheinen: die erste bewegliche Kachel wackelt kurz */
  const w0=$('.otile',O);if(w0){w0.classList.add('wig');w0.addEventListener('pointerdown',()=>w0.classList.remove('wig'),{once:true});}
  const touched=()=>{if(!done)chk.disabled=false;};
  const fixedAt={};$$('.given',O).forEach(e=>{fixedAt[+e.dataset.i]=e;});
  const cur=()=>Array.from(O.querySelectorAll('.otile'));
  const all=()=>Array.from(O.children).filter(e=>e.dataset.i!==undefined&&!e.classList.contains('oph'));
  const clearMarks=()=>{O.classList.remove('bad');cur().forEach(e=>e.classList.remove('bad','good'));if(!done)$('#exfb').innerHTML='';};
  const dragEl=()=>drag&&drag.moved?drag.el:null;
  /* freie Kacheln (plus Platzhalter) in Anzeigereihenfolge; die festen Steine bleiben immer an ihrer Position */
  const items=()=>Array.from(O.children).filter(x=>x!==dragEl()&&(x.classList.contains('otile')||x.classList.contains('oph')));
  function layout(list){
    const el=dragEl(),wantEls=[];let q=0;
    for(let pos=0;pos<n;pos++)wantEls.push(fixedAt[pos]||list[q++]);
    let cursor=O.firstChild;
    wantEls.forEach(e=>{
      while(cursor&&cursor===el)cursor=cursor.nextSibling;
      if(cursor===e)cursor=cursor.nextSibling;else O.insertBefore(e,cursor);
    });
  }
  /* Geschwister gleiten an ihren neuen Platz (FLIP), statt zu springen */
  function flip(mut){
    const els=Array.from(O.children).filter(x=>x!==dragEl()),before=els.map(e=>e.getBoundingClientRect());
    mut();
    els.forEach((e,i)=>{
      const b=e.getBoundingClientRect(),dx=before[i].left-b.left,dy=before[i].top-b.top;
      if(!dx&&!dy)return;
      e.style.transition='none';e.style.transform=`translate(${dx}px,${dy}px)`;e.getBoundingClientRect();
      e.style.transition='transform '+ORDER_GLIDE+'s cubic-bezier(.22,.8,.24,1)';e.style.transform='';
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
    const el=drag.el;
    el.style.left=(px-drag.dx-drag.bx)+'px';el.style.top=(py-drag.dy-drag.by)+'px';
    drag.px=px;drag.py=py;
    const now=Date.now(),wait=drag.last+ORDER_COOLDOWN-now;
    if(wait>0){   // Pause nach dem letzten Platzwechsel; danach wird die aktuelle Fingerposition noch einmal geprüft
      clearTimeout(drag.tm);drag.tm=setTimeout(()=>{if(drag&&drag.moved)shuffleTo(drag.px,drag.py);},wait+10);
      return;
    }
    shuffleTo(px,py);
  }
  function shuffleTo(px,py){
    const ph=drag.ph;
    const list=items(),sibs=list.filter(x=>x!==ph);
    const inside=(s,x,y)=>{const r=s.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;};
    const core=(s,x,y)=>{const r=s.getBoundingClientRect(),m=r.width*ORDER_EDGE;return x>=r.left+m&&x<=r.right-m&&y>=r.top&&y<=r.bottom;};   // Randzone löst nichts aus
    let ref=null,after=false;
    const hit=sibs.find(s=>core(s,px,py));
    if(hit){ref=hit;after=list.indexOf(ph)<list.indexOf(hit);}
    else{
      if(inside(ph,px,py)||sibs.some(s=>inside(s,px,py)))return;   // noch auf einer Kachel (Randzone): nichts tun
      let bd=1e9;
      sibs.forEach(s=>{const r=s.getBoundingClientRect(),d=Math.abs(py-(r.top+r.height/2))*3+Math.abs(px-(r.left+r.width/2));if(d<bd){bd=d;ref=s;after=px>r.left+r.width/2;}});
      // über einem festen Stein: Platzhalter nicht verschieben
      if(Object.values(fixedAt).some(f=>inside(f,px,py)))return;
    }
    if(!ref)return;
    const next=sibs.slice(),at=next.indexOf(ref)+(after?1:0);next.splice(at,0,ph);
    if(next.every((x,i)=>x===list[i]))return;
    drag.last=Date.now();
    flip(()=>layout(next));
    sfx('click');haptic(5);
  }
  function drop(){
    const d=drag;if(!d)return;drag=null;clearTimeout(d.tm);
    if(!d.moved)return;
    const r=d.ph.getBoundingClientRect();
    touched();
    d.el.style.transition='left .22s cubic-bezier(.22,.8,.24,1),top .22s cubic-bezier(.22,.8,.24,1),transform .22s ease';
    d.el.style.left=(r.left-d.bx)+'px';d.el.style.top=(r.top-d.by)+'px';d.el.classList.add('landing');
    const fin=()=>{
      if(!d.ph.parentNode)return;
      O.replaceChild(d.el,d.ph);
      d.el.classList.remove('dragging','landing');['left','top','width','height','transition','transform'].forEach(p=>d.el.style[p]='');
    };
    setTimeout(fin,230);sfx('pop');haptic(10);
  }
  O.addEventListener('pointerdown',e=>{
    const el=e.target.closest&&e.target.closest('.otile');
    if(!el||done||drag||(e.button&&e.button!==0))return;
    const r=el.getBoundingClientRect();
    drag={el,id:e.pointerId,dx:e.clientX-r.left,dy:e.clientY-r.top,sx:e.clientX,sy:e.clientY,moved:false,last:0,tm:0};
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
    const back=e.key==='ArrowLeft'||e.key==='ArrowUp',list=items(),i=list.indexOf(el),j=i+(back?-1:1);
    if(j<0||j>=list.length)return;
    const next=list.slice();next.splice(i,1);next.splice(j,0,el);
    flip(()=>layout(next));touched();
    try{el.focus({preventScroll:true});}catch(x){}
    sfx('click');
  });
  chk.onclick=()=>{
    if(done){nextStep();return;}
    if(drag||chk.disabled)return;
    const tiles=all(),ids=tiles.map(e=>want[+e.dataset.i]),good=ids.join('|')===wantS,els=tiles;
    if(!good){
      lives--;
      if(lives>0){
        els.forEach((e,p)=>{if(!e.classList.contains('given'))e.classList.toggle('bad',ids[p]!==want[p]);});
        $('#exfb').innerHTML=`<p class="fb bad" role="status">${t('Nicht ganz. Versuch es nochmal.')}</p>`;return;
      }
    }
    done=true;
    c.ok=c.ok&&good;settleCard();
    els.forEach((e,p)=>{if(e.classList.contains('given'))return;e.classList.remove('bad');e.classList.add(ids[p]===want[p]?'good':'bad');e.disabled=true;});
    O.classList.add(good?'good':'bad');
    $('.ordhint').hidden=true;
    $('#exfb').innerHTML=`<div class="res ${good?'good':'bad'}" role="status"><div class="rl">${good?t('Richtig'):t('Nicht ganz')}</div>
      <div class="pair" lang="${lang}">${esc(target.join(' '))}</div></div>${resultNote(good)}${alignFixBtn(c.w,pair.id,pair.gl)}`;
    alignFixBind(c.w,pair.id,pair.gl);
    chk.textContent=t('Weiter');
    try{chk.focus({preventScroll:true});}catch(x){}
    if(good)burst($('.res'),18);
  };
}

registerModule({id:'order',name:()=>t('Reihenfolge'),desc:()=>t('Wörter in die richtige Reihenfolge schieben'),tone:'t5',solo:true,fallback:'swipe',
  icon:'<svg width="46" height="40" viewBox="0 0 46 40" fill="none" aria-hidden="true"><rect x="2" y="6" width="12" height="12" rx="3.5" fill="#6ee77a"/><rect x="17" y="6" width="12" height="12" rx="3.5" fill="#35dcd2"/><rect x="32" y="6" width="12" height="12" rx="3.5" fill="#a888ff"/><path d="M8 29h30M33 25l5 4-5 4" stroke="#b9a5cc" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  can:w=>!!orderPair(w),show:w=>showOrder(orderPair(w))});
