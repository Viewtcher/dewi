function gapParts(s,w){
  const text=s.id,lt=text.toLowerCase(),lw=w.id.toLowerCase(),isL=ch=>!!ch&&/[a-zäöüß]/i.test(ch);
  let i=lt.indexOf(lw);
  while(i>-1&&(isL(lt[i-1])||isL(lt[i+lw.length])))i=lt.indexOf(lw,i+1);
  return i<0?null:{a:text.slice(0,i),b:text.slice(i+lw.length)};
}

function gapTiles(w){
  const L=curLang(),bad=new Set(gl(w).split(' / ').map(normG)),n=w.id.split(' ').length,out=[w.id];
  const pool=shuffle(L.words.filter(x=>x.k!==w.k&&x.id!==w.id&&!/^[A-Z]/.test(x.id)&&x.id.split(' ').length===n));
  const pri=pool.filter(x=>x.cat===w.cat).concat(pool.filter(x=>x.cat!==w.cat));
  for(const x of pri){
    const g=normG(glFirst(x));
    if(!g||bad.has(g))continue;
    bad.add(g);out.push(x.id);if(out.length>=4)break;
  }
  return shuffle(out);
}

function showGap(w,s,gp){
  const c=S.cur,L=curLang(),tiles=gapTiles(w),lang=L.code.toLowerCase();
  let lives=triesFor('gap'),done=false;
  sheetBody(`<div class="smain">${kicker(c,'gap')}${roundLives()}
    <div class="sentbox tr hq" lang="${state.ui}">${hlSlot(s.tpl,null,'slot')}${helpBtn('gap')}</div>
    <div class="sentbox gapbox" lang="${lang}">${esc(gp.a)}<span class="gap" id="gap"></span>${esc(gp.b)}</div>
    <div class="bank" id="bank" lang="${lang}">${tiles.map(x=>`<button class="tile" data-r="${x===w.id?1:0}">${esc(x)}</button>`).join('')}</div>
    <div id="exfb"></div></div>`);
  const gap=$('#gap'),B=$('#bank');
  function reveal(good){
    done=true;
    $$('.tile',B).forEach(x=>{x.disabled=true;if(x.dataset.r==='1')x.classList.add('ok');});
    gap.textContent=w.id;gap.className='gap '+(good?'good':'bad');
    c.ok=c.ok&&good;settleCard();
    $('#exfb').innerHTML=`<div class="res ${good?'good':'bad'}" role="status"><div class="rl">${good?t('Richtig'):t('Nicht ganz')}</div>
      <div class="pair"><span lang="${lang}">${esc(w.id)}</span><em>=</em><span lang="${state.ui}">${esc(gl(w))}</span></div>
      <p class="hint" style="margin-top:8px" lang="${lang}">${hlId(s.id,w.id)}</p></div>${resultNote(good)}
      <button class="btn primary block" id="nx" style="margin-top:12px">${t('Weiter')}</button>`;
    $('#nx').onclick=nextStep;
    try{$('#nx').focus({preventScroll:true});}catch(e){}
    if(good)burst($('.res'),18);
  }
  B.onclick=e=>{
    const b=e.target.closest('button');if(!b||done||b.disabled)return;
    const good=b.dataset.r==='1';
    gap.textContent=b.textContent;
    if(good)return reveal(true);
    lives--;b.disabled=true;b.classList.add('wrong');
    gap.className='gap bad';
    if(lives<=0)return reveal(false);
    $('#exfb').innerHTML=`<p class="fb bad" role="status">${t('Nicht ganz. Versuch es nochmal.')}</p>`;
    setTimeout(()=>{if(!done){gap.textContent='';gap.className='gap';}},650);
  };
}

registerModule({id:'gap',name:()=>t('Lückensatz'),desc:()=>t('Fehlendes Wort im Satz einsetzen'),tone:'t4',solo:true,fallback:'choice',
  icon:'<svg width="46" height="40" viewBox="0 0 46 40" fill="none" stroke-linecap="round" aria-hidden="true"><path d="M3 14h12M31 14h12M3 30h40" stroke="#b9a5cc" stroke-width="3.4"/><rect x="17" y="8" width="12" height="12" rx="3" stroke="#ff8a3d" stroke-width="2.8" stroke-dasharray="4 3"/></svg>',
  can:w=>{const s=sentOf(w);return !!(s&&gapParts(s,w)&&sentKnown(w));},show:w=>{const s=sentOf(w);showGap(w,s,gapParts(s,w));}});
