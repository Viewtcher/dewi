function choiceOptions(w){
  const L=curLang(),right=glFirst(w),bad=new Set(gl(w).split(' / ').map(normG)),out=[right];
  const pool=shuffle(L.words.filter(x=>x.k!==w.k));
  const pri=pool.filter(x=>x.cat===w.cat).concat(pool.filter(x=>x.cat!==w.cat));
  for(const x of pri){
    const g=glFirst(x),n=normG(g);
    if(!n||bad.has(n))continue;
    bad.add(n);out.push(g);if(out.length>=4)break;
  }
  return shuffle(out);
}

function showChoice(){
  const c=S.cur,w=c.w,L=curLang(),s=sentOf(w),opts=choiceOptions(w),right=opts.indexOf(glFirst(w));
  let lives=triesFor('choice');
  sheetBody(`<div class="smain">${kicker(c,'choice')}${roundLives()}
    <div class="sentbox hq" lang="${state.ui}">${hlSlot(s.tpl,w.id,'slot')}${helpBtn('choice')}</div>
    <div class="opts" id="opts">${opts.map((o,i)=>`<button class="opt" data-i="${i}" lang="${state.ui}">${esc(o)}</button>`).join('')}</div>
    <div id="exfb"></div></div>`);
  $$('.opt',sheet).forEach(b=>b.onclick=()=>{
    const i=+b.dataset.i,good=i===right;
    if(!good){
      lives--;b.classList.add('no');b.disabled=true;
      if(lives>0){$('#exfb').innerHTML=`<p class="fb bad" role="status">${t('Nicht ganz. Versuch es nochmal.')}</p>`;return;}
    }
    $$('.opt',sheet).forEach(x=>x.disabled=true);
    if(good)b.classList.add('ok');else $$('.opt',sheet)[right].classList.add('ok');
    c.ok=c.ok&&good;settleCard();
    $('#exfb').innerHTML=`<div class="res ${good?'good':'bad'}" role="status"><div class="rl">${good?t('Richtig'):t('Nicht ganz')}</div>
      <div class="pair"><span lang="${L.code.toLowerCase()}">${esc(w.id)}</span><em>=</em><span lang="${state.ui}">${esc(gl(w))}</span></div>
      <p class="hint" style="margin-top:8px" lang="${L.code.toLowerCase()}">${hlId(s.id,w.id)}</p></div>${resultNote(good)}
      <button class="btn primary block" id="nx" style="margin-top:12px">${t('Weiter')}</button>`;
    $('#nx').onclick=nextStep;
    try{$('#nx').focus({preventScroll:true});}catch(e){}
    if(good)burst($('.res'),18);
  });
}

registerModule({id:'choice',name:()=>t('Auswahl'),desc:()=>t('Richtige Bedeutung aus vier Optionen'),tone:'t5',solo:true,fallback:'swipe',
  icon:'<svg width="46" height="40" viewBox="0 0 46 40" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="40" height="12" rx="5" stroke="#6ee77a" stroke-width="3" fill="rgba(110,231,122,.18)"/><path d="M12 10l3 3 6-6" stroke="#6ee77a" stroke-width="2.8"/><rect x="3" y="22" width="40" height="12" rx="5" stroke="#8c76a3" stroke-width="3"/></svg>',
  can:w=>!!sentOf(w)&&sentKnown(w),show:()=>showChoice()});
