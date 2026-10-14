/* Quelle für Bausteine: Beispielsatz des Wortes, bei Alltagssätzen der Eintrag selbst.
   Noch nicht gelernte Wörter im Satz werden geschenkt: Sie stehen schon fest im Satz (gelb), man setzt nur die übrigen Kacheln ein.
   Grenzen: höchstens 2 geschenkte Wörter, mindestens 2 Kacheln selbst setzen, höchstens 7 Wörter. Das Zielwort zählt als bekannt. */
const BLOCKS_MAX_GIVEN=2,BLOCKS_MIN_FREE=2,BLOCKS_MAX_TOKENS=7;
function knownTokens(w){
  const L=curLang(),prog=state.progress[L.id]||{},set=new Set();
  L.words.forEach(x=>{const p=prog[x.k];if((p&&p.l>=1)||x.k===w.k)tokensOf(x.id).forEach(tk=>set.add(normId(tk)));});
  return set;
}
/* Deutsche/englische Entsprechung eines unbekannten indonesischen Worts im Zielsatz (Positionen) oder null */
function blockEquiv(u,target){
  const L=curLang(),nu=normId(u),nt=target.map(normId);
  for(const x of L.words){
    if(x.id.split(' ').length!==1||normId(x.id)!==nu)continue;
    for(const opt of gl(x).split(' / ')){
      const o=tokensOf(opt).map(normId);if(!o.length)continue;
      for(let i=0;i+o.length<=nt.length;i++)if(o.every((v,j)=>v&&v===nt[i+j]))return o.map((_,j)=>i+j);
    }
  }
  return null;
}
/* Plan für eine Richtung: Zielkacheln und Positionen der geschenkten Wörter, oder null wenn nicht machbar */
function blockPlan(pair,w,dir){
  const idT=tokensOf(pair.id);
  if(idT.length>BLOCKS_MAX_TOKENS)return null;
  const known=knownTokens(w),unk=idT.filter(tk=>!isProper(tk)&&!known.has(normId(tk)));
  const target=tilesOf(dir==='id2gl'?pair.gl:pair.id),given=new Set();
  if(target.length<2||target.length>BLOCKS_MAX_TOKENS)return null;
  for(const u of unk){
    if(dir==='gl2id'){target.forEach((tk,i)=>{if(normId(tk)===normId(u))given.add(i);});}
    else{const eq=blockEquiv(u,target);if(!eq)return null;eq.forEach(i=>given.add(i));}
  }
  if(given.size>BLOCKS_MAX_GIVEN||target.length-given.size<BLOCKS_MIN_FREE)return null;
  return {target,given};
}
const blockDirs=(pair,w)=>['id2gl','gl2id'].filter(d=>blockPlan(pair,w,d));
function buildPair(w){
  const s=sentOf(w);
  const pair=s?{id:s.id,gl:s.plain}:{id:w.id,gl:glFirst(w)};
  return blockDirs(pair,w).length?pair:null;
}
/* Ablenker-Kacheln möglichst aus bereits gelernten Wörtern */
function blockDistractors(target,toLang,n,w){
  if(toLang!=='id')return distractors(target,toLang,n);
  const have=new Set(target.map(normId)),out=[];
  const known=shuffle(Array.from(knownTokens(w)));
  for(const k of known){if(have.has(k))continue;have.add(k);out.push(k);if(out.length>=n)return out;}
  return out.concat(distractors(target.concat(out),toLang,n-out.length));
}

function showBuild(pair){
  const c=S.cur,w=c.w,L=curLang();
  const dirs=blockDirs(pair,w),dir=dirs[Math.floor(Math.random()*dirs.length)],toLang=dir==='id2gl'?state.ui:'id';
  const from=dir==='id2gl'?pair.id:pair.gl,to=dir==='id2gl'?pair.gl:pair.id;
  const {target,given}=blockPlan(pair,w,dir),want=target.map(normId).join('|');
  const free=target.map((tk,i)=>i).filter(i=>!given.has(i)),nFree=free.length;
  const tiles=shuffle(free.map(i=>target[i]).concat(blockDistractors(target,toLang,2,w)));
  let ans=[],done=false,lives=triesFor('blocks');
  window.__lastBuild={dir,target,given:Array.from(given)};   // nur für Tests
  sheetBody(`<div class="smain">${kicker(c,'blocks',dir==='id2gl'?toGl():toIdl())}${roundLives()}
    <div class="sentbox hq" lang="${dir==='id2gl'?L.code.toLowerCase():state.ui}">${esc(from)}${helpBtn('blocks')}</div>
    <div class="ans" id="ans2" aria-label="${t('Dein Satz')}" lang="${toLang==='id'?L.code.toLowerCase():toLang}"></div>
    <div class="bank" id="bank" lang="${toLang==='id'?L.code.toLowerCase():toLang}"></div>
    <div id="exfb"></div>
    <button class="btn primary block" id="chk" disabled>${t('Prüfen')}</button></div>`);
  const A=$('#ans2'),B=$('#bank'),chk=$('#chk');
  function paint(){
    A.classList.remove('bad');if(!done)$('#exfb').innerHTML='';
    let k=0;   // geschenkte Wörter stehen fest an ihrer Stelle, die freien Felder füllen sich von links nach rechts
    A.innerHTML=target.map((tk,pi)=>given.has(pi)?`<span class="tile given">${esc(tk)}</span>`:k<ans.length?`<button class="tile" data-i="${ans[k++]}">${esc(tiles[ans[k-1]])}</button>`:'<span class="bslot" aria-hidden="true"></span>').join('');
    B.innerHTML=tiles.map((x,i)=>ans.indexOf(i)>-1?`<span class="tile ghost" aria-hidden="true">${esc(x)}</span>`:`<button class="tile" data-i="${i}">${esc(x)}</button>`).join('');
    chk.disabled=ans.length<nFree;   // erst prüfbar, wenn alle Felder gefüllt sind
  }
  A.onclick=e=>{const b=e.target.closest('button');if(!b||done)return;ans.splice(ans.indexOf(+b.dataset.i),1);paint();};
  B.onclick=e=>{const b=e.target.closest('button');if(!b||done||ans.length>=nFree)return;ans.push(+b.dataset.i);paint();};
  chk.onclick=()=>{
    if(done){nextStep();return;}
    if(ans.length<nFree)return;   // Sicherung: nur prüfen, wenn alle Felder gefüllt sind
    let k=0;const good=target.map((tk,pi)=>given.has(pi)?normId(tk):normId(tiles[ans[k++]])).join('|')===want;
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
