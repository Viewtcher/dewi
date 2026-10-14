const toGl=()=>t(state.ui==='de'?'ins Deutsche':'ins Englische');

const toIdl=()=>t('ins Indonesische');

/* Hervorhebung: Wort im Satz finden (nur ganze Wörter) */
function hlId(text,word){
  const lt=text.toLowerCase(),lw=word.toLowerCase(),isL=ch=>!!ch&&/[a-zäöüß]/i.test(ch);
  let i=lt.indexOf(lw);
  while(i>-1&&(isL(lt[i-1])||isL(lt[i+lw.length])))i=lt.indexOf(lw,i+1);
  if(i<0)return esc(text);
  return esc(text.slice(0,i))+'<b>'+esc(text.slice(i,i+lw.length))+'</b>'+esc(text.slice(i+lw.length));
}

function hlSlot(tpl,repl,cls){
  const m=tpl.match(/\[([^\]]+)\]/);
  if(!m)return esc(tpl);
  const i=m.index;
  return esc(tpl.slice(0,i))+`<${cls?'span class="'+cls+'"':'b'}>`+esc(repl==null?m[1]:repl)+`</${cls?'span':'b'}>`+esc(tpl.slice(i+m[0].length));
}

let PROPER=null,POOL={};

function tokensOf(text){return text.replace(/[.,!?;:"“”]/g,' ').split(/\s+/).filter(Boolean);}

function isProper(tk){
  if(!PROPER){
    PROPER=new Set(PROPER_EXTRA);
    Object.keys(SENT).forEach(k=>{[SENT[k].id,SENT[k].en,SENT[k].de].forEach(tx=>{if(tx)tokensOf(tx).forEach((x,i)=>{if(i>0&&/^[A-ZÄÖÜ]/.test(x))PROPER.add(x);});});});
    Object.values(LANGS).forEach(L=>L.words.forEach(w=>{if(/^[A-Z]/.test(w.id))w.id.split(' ').forEach(x=>PROPER.add(x));}));
  }
  return /^I($|')/.test(tk)||PROPER.has(tk);
}

const tileText=(tk,i)=>(i===0&&!isProper(tk))?tk.charAt(0).toLowerCase()+tk.slice(1):tk;

function tilesOf(text){return tokensOf(text).map(tileText);}

function poolOf(lang){
  if(!POOL[lang]){const set=new Set();Object.values(SENT).forEach(s=>{const tx=lang==='id'?s.id:s[lang];if(tx)tilesOf(tx).forEach(x=>set.add(x));});POOL[lang]=Array.from(set);}
  return POOL[lang];
}

function distractors(target,lang,n){
  const have=new Set(target.map(normId)),out=[];
  for(const x of shuffle(poolOf(lang).slice())){
    const k=normId(x);if(!k||have.has(k))continue;
    have.add(k);out.push(x);if(out.length>=n)break;
  }
  return out;
}

function editDist(a,b){   // Damerau-Levenshtein: ein Buchstabendreher zählt als 1 Fehler
  const m=a.length,n=b.length,d=[];
  for(let i=0;i<=m;i++){d[i]=[i];}
  for(let j=1;j<=n;j++)d[0][j]=j;
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++){
    d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
    if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1);
  }
  return d[m][n];
}

const HEART='<path d="M12 21s-7.5-4.6-9.5-9.2C1.2 8.4 3.2 5 6.6 5c2 0 3.4 1.1 5.4 3 2-1.9 3.4-3 5.4-3 3.4 0 5.4 3.4 4.1 6.8C19.5 16.4 12 21 12 21z"/>';

const hearts=(n,g)=>[0,1,2].map(i=>`<svg viewBox="0 0 24 24" class="${i<n?(i===g?'heal':''):'x'}" aria-hidden="true">${HEART}</svg>`).join('');

const livesHtml=(n,g)=>`<div class="lives" id="tries" role="status" aria-label="${n} ${t('Leben')}">${hearts(n,g)}<span>${t('Leben')}</span></div>`;

const setLives=(n,g)=>{const e=$('#tries');if(e){e.innerHTML=hearts(n,g)+'<span>'+t('Leben')+'</span>';e.setAttribute('aria-label',n+' '+t('Leben'));}};
