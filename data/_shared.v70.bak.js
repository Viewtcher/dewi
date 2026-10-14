const toGl=()=>t(state.ui==='de'?'ins Deutsche':'ins Englische');

const toIdl=()=>t(state.lang==='en'?'ins Englische':'ins Indonesische');

/* Hervorhebung: Wort im Satz finden (nur ganze Wörter) */
/* Wort im Satz finden: Token-Bereich [von,bis] oder null. Erst exakt, dann gebeugte Form
   (z. B. menjawab → jawab, tagihan → tagihannya, dua belas → kedua belas). Zerlegung wie tokensOf. */
function wordSpan(text,word){
  const T=tokensOf(text).map(x=>x.toLowerCase()),W=tokensOf(word).map(x=>x.toLowerCase());
  if(!W.length)return null;
  const stems=b=>{const o=[b],m=b.match(/^(meng|meny|mem|men|me|ber|ter|di|per|pe|ke)(.{3,})$/);if(m)o.push(m[2]);return o.filter(x=>x.length>=3);};
  const find=eq=>{for(let i=0;i+W.length<=T.length;i++){let ok=true;for(let j=0;j<W.length;j++)if(!eq(T[i+j],W[j])){ok=false;break;}if(ok)return [i,i+W.length-1];}return null;};
  return find((a,b)=>a===b)||find((a,b)=>stems(b).some(x=>a.includes(x)));
}
/* Wörter eines Satzes (nach Token-Nummer) mit gelber Unterstreichung; gleiche Zerlegung wie tokensOf */
function markTokens(text,idx,cls,extra,xcls){
  const set=new Set(idx),ex=new Set(extra||[]),re=/[^\s.,!?;:"“”]+/g;let out='',last=0,i=0,m;
  while((m=re.exec(text))){const c=set.has(i)?(cls||'slot'):ex.has(i)?(xcls||'gv'):'';out+=esc(text.slice(last,m.index))+(c?'<span class="'+c+'">'+esc(m[0])+'</span>':esc(m[0]));last=m.index+m[0].length;i++;}
  return out+esc(text.slice(last));
}
function hlId(text,word){
  const lt=text.toLowerCase(),lw=word.toLowerCase(),isL=ch=>!!ch&&/[a-zäöüß]/i.test(ch);
  let i=lt.indexOf(lw);
  while(i>-1&&(isL(lt[i-1])||isL(lt[i+lw.length])))i=lt.indexOf(lw,i+1);
  if(i<0){
    const sp=wordSpan(text,word);if(!sp)return esc(text);
    const re=/[^\s.,!?;:"“”]+/g;let k=0,a=-1,b=-1,m;
    while((m=re.exec(text))){if(k===sp[0])a=m.index;if(k===sp[1]){b=m.index+m[0].length;break;}k++;}
    return a<0?esc(text):esc(text.slice(0,a))+'<b>'+esc(text.slice(a,b))+'</b>'+esc(text.slice(b));
  }
  return esc(text.slice(0,i))+'<b>'+esc(text.slice(i,i+lw.length))+'</b>'+esc(text.slice(i+lw.length));
}
/* Token-Nummern der gelernten Vokabel im Beispielsatz: side 'id' = Satz der Lernsprache, 'gl' = Übersetzung (Klammer der Vorlage) */
function learnedIdx(w,s,side){
  const out=[];if(!s)return out;
  if(side==='id'){const sp=wordSpan(s.id,w.id);if(sp)for(let i=sp[0];i<=sp[1];i++)out.push(i);return out;}
  const m=s.tpl&&s.tpl.match(/\[([^\]]+)\]/);if(!m)return out;
  const pre=s.tpl.slice(0,m.index).replace(/[.,!?;:"“”]/g,' ');
  let a=tokensOf(pre).length;if(/\S$/.test(pre))a--;   // Klammer mitten im Wort (z. B. Orangen[saft])
  const n=Math.max(1,tokensOf(m[1]).length);
  for(let i=0;i<n;i++)out.push(a+i);return out;
}
/* Satz oben in der Aufgabe: die gelernte Vokabel gelb unterstrichen (nur wenn der Text wirklich der Beispielsatz ist) */
function promptHtml(w,text,side,given){   // given: Token-Nummern geschenkter Wörter (dezent lila)
  const s=sentOf(w);
  if(!s||text!==(side==='id'?s.id:s.plain))return markTokens(text,[],'slot',given);
  return markTokens(text,learnedIdx(w,s,side),'slot',given);
}

function hlSlot(tpl,repl,cls){
  const m=tpl.match(/\[([^\]]+)\]/);
  if(!m)return esc(tpl);
  const i=m.index;
  return esc(tpl.slice(0,i))+`<${cls?'span class="'+cls+'"':'b'}>`+esc(repl==null?m[1]:repl)+`</${cls?'span':'b'}>`+esc(tpl.slice(i+m[0].length));
}

let PROPER=null,PROPER_L=null,POOL={};
/* Satz-Schlüssel des aktuellen Kurses (Englisch-Schlüssel tragen den Vorsatz „en:“) */
const sentKeys=()=>Object.keys(SENT).filter(k=>state.lang==='id'?k.indexOf(':')<0:k.indexOf(state.lang+':')===0);

function tokensOf(text){return text.replace(/[.,!?;:"“”]/g,' ').split(/\s+/).filter(Boolean);}

function isProper(tk){
  if(!PROPER||PROPER_L!==state.lang){
    PROPER_L=state.lang;PROPER=new Set(PROPER_EXTRA);
    sentKeys().forEach(k=>{[SENT[k].id,SENT[k].en,SENT[k].de].forEach(tx=>{if(tx)tokensOf(tx).forEach((x,i)=>{if(i>0&&/^[A-ZÄÖÜ]/.test(x))PROPER.add(x);});});});
    const CL=curLang();if(CL)CL.words.forEach(w=>{if(/^[A-Z]/.test(w.id))w.id.split(' ').forEach(x=>PROPER.add(x));});
  }
  return /^I($|')/.test(tk)||PROPER.has(tk);
}

/* Echte Eigennamen (Orte, Namen, Monate …): gelten beim Lernstand immer als bekannt. Anreden wie „Bu“ oder „Pak“ gehören NICHT dazu,
   auch wenn sie im Satz großgeschrieben sind: Sie sind Vokabeln, die man noch nicht kennen kann. */
function isName(tk){return PROPER_EXTRA.indexOf(tk)>-1;}

/* Besteht der ganze Beispielsatz des Wortes aus gelernten Wörtern (und Namen)? Das Zielwort selbst zählt als gelernt.
   Auswahl und Lückensatz zeigen den ganzen Satz, deshalb nur mit solchen Sätzen. */
function sentKnown(w){
  const s=sentOf(w);if(!s)return false;
  if(window.__rlAll)return true;   // nur für Tests
  const kn=knownTokens(w);
  return tokensOf(s.id).every(tk=>isName(tk)||kn.has(normId(tk)));
}

const tileText=(tk,i)=>(i===0&&!isProper(tk))?tk.charAt(0).toLowerCase()+tk.slice(1):tk;

function tilesOf(text){return tokensOf(text).map(tileText);}

function poolOf(lang){
  const pk=state.lang+'|'+lang;
  if(!POOL[pk]){const set=new Set();sentKeys().forEach(k=>{const s=SENT[k],tx=lang==='id'?s.id:s[lang];if(tx)tilesOf(tx).forEach(x=>set.add(x));});POOL[pk]=Array.from(set);}
  return POOL[pk];
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
