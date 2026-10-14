/* Quelle für Bausteine: Beispielsatz des Wortes, bei Alltagssätzen der Eintrag selbst */
function buildPair(w){
  const s=sentOf(w);
  const pair=s?{id:s.id,gl:s.plain}:{id:w.id,gl:glFirst(w)};
  return (tokensOf(pair.id).length>=2&&tokensOf(pair.gl).length>=2)?pair:null;
}

function showBuild(pair){
  const c=S.cur,w=c.w,L=curLang();
  const dir=Math.random()<.5?'id2gl':'gl2id',toLang=dir==='id2gl'?state.ui:'id';
  const from=dir==='id2gl'?pair.id:pair.gl,to=dir==='id2gl'?pair.gl:pair.id;
  const target=tilesOf(to),want=target.map(normId).join('|');
  const tiles=shuffle(target.concat(distractors(target,toLang,2)));
  let ans=[],done=false,lives=triesFor('blocks');
  sheetBody(`<div class="smain">${kicker(c,'blocks',dir==='id2gl'?toGl():toIdl())}${roundLives()}
    <div class="sentbox hq" lang="${dir==='id2gl'?L.code.toLowerCase():state.ui}">${esc(from)}${helpBtn('blocks')}</div>
    <div class="ans" id="ans2" aria-label="${t('Dein Satz')}" lang="${toLang==='id'?L.code.toLowerCase():toLang}"></div>
    <div class="bank" id="bank" lang="${toLang==='id'?L.code.toLowerCase():toLang}"></div>
    <div id="exfb"></div>
    <button class="btn primary block" id="chk" disabled>${t('Prüfen')}</button></div>`);
  const A=$('#ans2'),B=$('#bank'),chk=$('#chk');
  function paint(){
    A.classList.remove('bad');if(!done)$('#exfb').innerHTML='';
    A.innerHTML=ans.map(i=>`<button class="tile" data-i="${i}">${esc(tiles[i])}</button>`).join('');
    B.innerHTML=tiles.map((x,i)=>ans.indexOf(i)>-1?`<span class="tile ghost" aria-hidden="true">${esc(x)}</span>`:`<button class="tile" data-i="${i}">${esc(x)}</button>`).join('');
    chk.disabled=!ans.length;
  }
  A.onclick=e=>{const b=e.target.closest('button');if(!b||done)return;ans.splice(ans.indexOf(+b.dataset.i),1);paint();};
  B.onclick=e=>{const b=e.target.closest('button');if(!b||done)return;ans.push(+b.dataset.i);paint();};
  chk.onclick=()=>{
    if(done){nextStep();return;}
    const good=ans.map(i=>normId(tiles[i])).join('|')===want;
    if(!good){
      lives--;
      if(lives>0){A.classList.add('bad');$('#exfb').innerHTML=`<p class="fb bad" role="status">${t('Nicht ganz. Versuch es nochmal.')}</p>`;return;}
    }
    done=true;
    c.ok=c.ok&&good;settleCard();
    A.classList.add(good?'good':'bad');
    $$('.tile',sheet).forEach(x=>{if(x.tagName==='BUTTON')x.disabled=true;});
    $('#exfb').innerHTML=`<div class="res ${good?'good':'bad'}" role="status"><div class="rl">${good?t('Richtig'):t('Nicht ganz')}</div>
      <div class="pair">${esc(to)}</div></div>${resultNote(good)}`;
    chk.textContent=t('Weiter');chk.disabled=false;
    try{chk.focus({preventScroll:true});}catch(e){}
    if(good)burst($('.res'),18);
  };
  paint();
}

registerModule({id:'blocks',name:()=>t('Bausteine'),desc:()=>t('Satz aus Wortkacheln zusammensetzen'),tone:'t1',solo:true,fallback:'swipe',
  icon:'<svg width="46" height="40" viewBox="0 0 46 40" aria-hidden="true"><rect x="2" y="22" width="19" height="14" rx="4" fill="#ffc23d"/><rect x="24" y="22" width="19" height="14" rx="4" fill="#ff8a3d"/><rect x="12" y="4" width="20" height="14" rx="4" fill="#ff5c9d"/></svg>',
  can:w=>!!buildPair(w),show:w=>showBuild(buildPair(w))});
