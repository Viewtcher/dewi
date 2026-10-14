/* Quelle für Bausteine: Beispielsatz des Wortes, bei Alltagssätzen der Eintrag selbst */
/* Bausteine sind nur so schwer wie das, was schon gelernt wurde: höchstens ein unbekanntes Wort im Satz (Zielwort zählt als bekannt),
   höchstens 7 Wörter. Sonst wählt die App ein anderes Modul. */
const BLOCKS_MAX_UNKNOWN=1,BLOCKS_MAX_TOKENS=7;
function knownTokens(w){
  const L=curLang(),prog=state.progress[L.id]||{},set=new Set();
  L.words.forEach(x=>{const p=prog[x.k];if((p&&p.l>=1)||x.k===w.k)tokensOf(x.id).forEach(tk=>set.add(normId(tk)));});
  return set;
}
function buildPair(w){
  const s=sentOf(w);
  const pair=s?{id:s.id,gl:s.plain}:{id:w.id,gl:glFirst(w)};
  const idT=tokensOf(pair.id);
  if(!(idT.length>=2&&tokensOf(pair.gl).length>=2))return null;
  if(idT.length>BLOCKS_MAX_TOKENS)return null;
  const known=knownTokens(w);
  return idT.filter(tk=>!isProper(tk)&&!known.has(normId(tk))).length<=BLOCKS_MAX_UNKNOWN?pair:null;
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
  const dir=Math.random()<.5?'id2gl':'gl2id',toLang=dir==='id2gl'?state.ui:'id';
  const from=dir==='id2gl'?pair.id:pair.gl,to=dir==='id2gl'?pair.gl:pair.id;
  const target=tilesOf(to),want=target.map(normId).join('|');
  const tiles=shuffle(target.concat(blockDistractors(target,toLang,2,w)));
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
    A.innerHTML=ans.map(i=>`<button class="tile" data-i="${i}">${esc(tiles[i])}</button>`).join('')+'<span class="bslot" aria-hidden="true"></span>'.repeat(Math.max(0,target.length-ans.length));
    B.innerHTML=tiles.map((x,i)=>ans.indexOf(i)>-1?`<span class="tile ghost" aria-hidden="true">${esc(x)}</span>`:`<button class="tile" data-i="${i}">${esc(x)}</button>`).join('');
    chk.disabled=ans.length<target.length;   // erst prüfbar, wenn alle Felder gefüllt sind
  }
  A.onclick=e=>{const b=e.target.closest('button');if(!b||done)return;ans.splice(ans.indexOf(+b.dataset.i),1);paint();};
  B.onclick=e=>{const b=e.target.closest('button');if(!b||done||ans.length>=target.length)return;ans.push(+b.dataset.i);paint();};
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
