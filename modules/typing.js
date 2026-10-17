/* ---- Tippen ---- */
function hintFor(c){
  let x=c.dir==='id2gl'?glFirst(c.w):c.w.id;
  x=x.replace(/\([^)]*\)/g,'').trim();
  if(state.ui==='en')x=x.replace(/^\s*to\s+(?=\S)/i,'');
  return x.slice(0,2);
}

const typoTol=(len,lvl)=>{const d=TYPO_DIV[Math.max(0,Math.min(5,lvl||0))];return d===Infinity?0:Math.floor(len/d);};

let ANS_CACHE={};

function ownAnswers(dir){   // alle Schreibweisen anderer Wörter: ein anderes echtes Wort wird nie als Tippfehler durchgewunken
  const key=state.lang+dir+state.ui;
  if(!ANS_CACHE[key]){
    const set=new Set();
    curLang().words.forEach(w=>{if(dir==='id2gl')glList(w).join('/').split('/').forEach(x=>set.add(normG(x)));else set.add(normId(w.id));});
    ANS_CACHE[key]=set;
  }
  return ANS_CACHE[key];
}

function isCorrect(c,val){
  c.typo=false;c.near=false;
  const id2gl=c.dir==='id2gl';
  const a=id2gl?normG(val):normId(val);
  if(!a)return false;
  const cands=(id2gl?glList(c.w).join('/').split('/').map(normG):c.accept).filter(Boolean);
  if(cands.indexOf(a)>-1)return true;
  if(a.length<3)return false;
  const own=ownAnswers(id2gl?'id2gl':'gl2id');
  let best=99,tolBest=0;
  for(const x of cands){
    const d=editDist(a,x),tol=typoTol(x.length,c.lvl);
    if(d<best){best=d;tolBest=tol;}
  }
  if(best<=tolBest&&best>0&&!own.has(a)){c.typo=true;return true;}
  if(best<=tolBest+1&&best>0&&cands[0].length>=4)c.near=true;
  return false;
}

function showQuestion(){
  const c=S.cur,w=c.w,L=curLang(),id2gl=c.dir==='id2gl';
  c.tries=0;
  sheetBody(`<div class="smain">${kicker(c,'typing',id2gl?toGl():toIdl())}${roundLives()}
    <div class="bigword hq" lang="${id2gl?L.code.toLowerCase():state.ui}">${esc(id2gl?w.id:gl(w))}${helpBtn('typing')}</div>
    <form class="qform" id="qf" autocomplete="off"><div class="inwrap" id="iw"><input class="field" id="ans" type="text" aria-label="${t('Deine Antwort')}" placeholder="${t('Antwort tippen')}" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="done"></div>
    <button class="btn primary block" type="submit">${t('Prüfen')}</button></form>
    <p class="fb" id="fb" role="status" aria-live="polite"></p></div>`);
  const inp=$('#ans'),iw=$('#iw');let keys=0;
  inp.addEventListener('input',()=>{
    const col=PAL[++keys%PAL.length];
    iw.style.setProperty('--pc',col);iw.style.setProperty('--pcs',col+'44');
    iw.classList.toggle('typing',inp.value.length>0);
    iw.classList.remove('pulse');void iw.offsetWidth;iw.classList.add('pulse');
  });
  $('#qf').onsubmit=e=>{
    e.preventDefault();
    const val=inp.value;
    if(!val.trim()){inp.classList.remove('shake');void inp.offsetWidth;inp.classList.add('shake');return;}
    c.tries++;
    if(isCorrect(c,val))return finish(true);
    if(c.tries>=triesFor('typing'))return finish(false);
    const fb=$('#fb');
    fb.className='fb bad';
    fb.textContent=(c.near?t('Fast! Achte auf die Schreibweise.'):t('Nicht ganz. Versuch es nochmal.'))+(c.tries===triesFor('typing')-1?t(' Tipp: beginnt mit „{0}“.',hintFor(c)):'');
    inp.classList.remove('shake');void inp.offsetWidth;inp.classList.add('shake');inp.select();
  };
  try{inp.focus({preventScroll:true});}catch(e){inp.focus();}
}

registerModule({id:'typing',name:()=>t('Tippen'),desc:()=>t('Übersetzung selbst schreiben'),tone:'t2',solo:true,fallback:null,
  icon:'<svg width="46" height="40" viewBox="0 0 46 40" fill="none" aria-hidden="true"><rect x="2" y="8" width="42" height="26" rx="7" stroke="#35dcd2" stroke-width="3"/><path d="M12 22h12" stroke="#35dcd2" stroke-width="3.4" stroke-linecap="round"/><path d="M30 14v14" stroke="#f566b9" stroke-width="3.4" stroke-linecap="round"/></svg>',
  can:()=>true,show:()=>showQuestion()});
