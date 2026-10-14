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
/* Zuordnung: Token des Lernsprachen-Satzes → Positionen im übersetzten Satz (nur sicher gefundene, sonst null) */
/* ---- Wort-Zuordnung zwischen Lernsprache und Übersetzung (für die Markierungen) ----
   Wörterbuch (alle Bedeutungen) + die gebeugten Formen aus den Beispielsätzen (z. B. makan = esse, lerne) + Ähnlichkeit (English = Englisch).
   Ergebnis je Token der Lernsprache: Positionen im übersetzten Satz oder null. */
let ALX=null,ALX_K='';
function alexBuild(){
  const k=state.lang+'|'+state.ui;
  if(ALX&&ALX_K===k)return ALX;
  const L=curLang(),M={};
  const add=(key,txt)=>{
    if(!key)return;
    const o=tokensOf(txt).map(normId).filter(Boolean);if(!o.length)return;
    const a=M[key]||(M[key]=[]),j=o.join(' ');
    if(!a.some(x=>x.join(' ')===j))a.push(o);
  };
  const keyOf=v=>tokensOf(v).map(normId).filter(Boolean).join(' ');
  L.words.forEach(x=>{
    const keys=[x.id].concat(x.alts||[]).map(keyOf);
    gl(x).split(' / ').forEach(opt=>keys.forEach(kk=>add(kk,opt.replace(/\([^)]*\)/g,' '))));
    const s=sentOf(x);
    if(s&&s.tpl){
      const m=s.tpl.match(/\[([^\]]+)\]/),sp=wordSpan(s.id,x.id);
      if(m&&sp&&!/[A-Za-zÄÖÜäöüß]$/.test(s.tpl.slice(0,m.index))&&!/^[A-Za-zÄÖÜäöüß]/.test(s.tpl.slice(m.index+m[0].length))){
        add(tokensOf(s.id).slice(sp[0],sp[1]+1).map(normId).join(' '),m[1]);
      }
    }
  });
  /* Kleine Wörter, die im Wörterbuch fehlen oder je nach Satz anders heißen (Pronomen/Besitz, Präpositionen) */
  const SUP=state.lang==='en'?{
    de:{in:'in im',on:'auf an',at:'um an bei in',to:'zu nach um',with:'mit',for:'für',from:'von aus',of:'von',and:'und',but:'aber',not:'nicht',i:'ich',he:'er',she:'sie',we:'wir',they:'sie',it:'es',my:'mein',your:'dein euer Ihr',his:'sein',her:'ihr',our:'unser',their:'ihr'},
    en:{}
  }:{
    de:{saya:'ich mein',aku:'ich mein',kamu:'du dein',anda:'Sie Ihr',dia:'er sie es sein ihr',kami:'wir unser',kita:'wir unser',mereka:'sie ihr',ke:'zu nach in',di:'in im bei auf an',dari:'von aus',untuk:'für',dengan:'mit',dan:'und',pada:'am um bei'},
    en:{saya:'i my',aku:'i my',kamu:'you your',anda:'you your',dia:'he she it his her',kami:'we our',kita:'we our',mereka:'they their',ke:'to at',di:'in at on',dari:'from',untuk:'for',dengan:'with',dan:'and',pada:'at on'}
  };
  const sup=SUP[state.ui==='de'?'de':'en']||{};
  Object.keys(sup).forEach(kk=>sup[kk].split(' ').forEach(o=>add(normId(kk),o)));
  ALX=M;ALX_K=k;return M;
}
/* Grundformen eines gebeugten Worts der Lernsprache (englisch: -s, -ed, -ing; indonesisch: Vor- und Nachsilben) */
function alexStems(n){
  const o=[];
  if(state.lang==='en'){
    if(/ies$/.test(n))o.push(n.slice(0,-3)+'y');
    if(/(es|ed)$/.test(n))o.push(n.slice(0,-2));
    if(/[sd]$/.test(n))o.push(n.slice(0,-1));
    if(/ing$/.test(n)){o.push(n.slice(0,-3),n.slice(0,-3)+'e');if(/(.)\1ing$/.test(n))o.push(n.slice(0,-4));}
    if(/ied$/.test(n))o.push(n.slice(0,-3)+'y');
  }else{
    const bases=[n];
    ['nya','kan','an','i','lah','kah','ku','mu'].forEach(sf=>{if(n.length>sf.length+2&&n.endsWith(sf))bases.push(n.slice(0,-sf.length));});
    bases.slice().forEach(b=>{
      [['meny','s'],['meng','k'],['meng',''],['mem','p'],['mem',''],['men','t'],['men',''],['me',''],['ber',''],['bel',''],['ter',''],['di',''],['per',''],['pe',''],['peng',''],['pem',''],['pen',''],['ke',''],['se','']].forEach(([pf,r])=>{
        if(b.startsWith(pf)&&b.length>pf.length+2)bases.push(r+b.slice(pf.length));
      });
    });
    bases.forEach(x=>{if(x!==n)o.push(x);});
  }
  return o.filter(x=>x.length>=2);
}
function alexOpts(n){
  const M=alexBuild();
  if(M[n])return M[n];
  for(const c of alexStems(n))if(M[c])return M[c];
  return null;
}
/* Ähnliche Wortformen (Beugung: lernen/lerne, jeder/jeden, Kind/Kinder) */
function fzMatch(a,b){
  if(a===b)return true;
  const m=Math.min(a.length,b.length);if(m<3)return false;
  let p=0;while(p<m&&a[p]===b[p])p++;
  if(Math.abs(a.length-b.length)>3)return false;
  if(m===3)return p===3&&Math.abs(a.length-b.length)<=1;
  return p>=3&&p>=m-2;
}
function alignOf(idText,glText){
  const idT=tokensOf(idText),nt=tilesOf(glText).map(normId),nid=idT.map(normId),res=idT.map(()=>null),used=new Set();
  const M=alexBuild();
  const find=(o,fuzzy)=>{
    const n=o.length;
    for(let i=0;i+n<=nt.length;i++){let ok=true;for(let j=0;j<n;j++)if(nt[i+j]!==o[j]||used.has(i+j)){ok=false;break;}if(ok)return o.map((_,j)=>i+j);}
    if(fuzzy&&n===1)for(let i=0;i<nt.length;i++)if(!used.has(i)&&fzMatch(nt[i],o[0]))return [i];
    return null;
  };
  const take=(i0,len,pos)=>{pos.forEach(k=>used.add(k));for(let j=0;j<len;j++)res[i0+j]=pos;};
  for(const len of [3,2])for(let i=0;i+len<=idT.length;i++){
    if(res.slice(i,i+len).some(Boolean))continue;
    const o=M[nid.slice(i,i+len).join(' ')];if(!o)continue;
    for(const x of o){const pos=find(x,false);if(pos){take(i,len,pos);break;}}
  }
  for(const fuzzy of [false,true])for(let i=0;i<idT.length;i++){
    if(res[i]||!nid[i])continue;
    const o=alexOpts(nid[i])||[];
    let pos=null;
    if(!fuzzy){const same=nt.findIndex((x,k)=>x===nid[i]&&!used.has(k));if(same>=0)pos=[same];}
    for(const x of o){if(pos)break;pos=find(x,fuzzy);}
    if(pos)take(i,1,pos);
  }
  /* Verwandte Wörter ohne Wörterbuch-Eintrag (English/Englisch, Mathematik/matematika) */
  const sim=(a,b)=>1-editDist(a,b)/Math.max(a.length,b.length);
  const pairs=[];
  res.forEach((r,i)=>{if(r||nid[i].length<4)return;nt.forEach((x,k)=>{if(used.has(k)||x.length<4||x[0]!==nid[i][0])return;const sc=sim(nid[i],x);if(sc>=.6)pairs.push([sc,i,k]);});});
  pairs.sort((a,b)=>b[0]-a[0]).forEach(([,i,k])=>{if(!res[i]&&!used.has(k))take(i,1,[k]);});
  return res;
}
/* Markierung der Übersetzung oben: gesuchte Wörter (gelb) und geschenkte (dezent lila). askedId/givenId = Token-Nummern des Lernsprachen-Satzes.
   all=true: der ganze Satz wird gebaut, alles außer den geschenkten Wörtern ist gesucht (gelb). Sonst nur die zugeordneten Wörter;
   Wörter ohne Wörterbuch-Entsprechung werden nur markiert, wenn die Zahl der offenen Plätze es hergibt. */
function glPrompt(w,idText,glText,askedId,givenId,all){
  const al=alignOf(idText,glText),y=new Set(),p=new Set(),s=sentOf(w),n=tokensOf(glText).length;
  if(s&&s.id===idText&&s.plain===glText)learnedIdx(w,s,'gl').forEach(i=>y.add(i));
  let open=0;
  al.forEach((pos,i)=>{
    if(givenId.has(i)){if(pos)pos.forEach(k=>p.add(k));}
    else if(askedId.has(i)){if(pos)pos.forEach(k=>y.add(k));else open++;}
  });
  if(all){for(let k=0;k<n;k++)y.add(k);}
  else{
    const used=new Set();al.forEach(pos=>{if(pos)pos.forEach(k=>used.add(k));});
    const free=[];for(let k=0;k<n;k++)if(!used.has(k))free.push(k);
    if(open&&free.length&&free.length<=open)free.forEach(k=>y.add(k));
  }
  p.forEach(k=>y.delete(k));
  return markTokens(glText,Array.from(y),'slot',Array.from(p),'gv');
}
/* Satz der Lernsprache oben: Wörter, deren Übersetzung gesucht wird (gelb), und geschenkte (dezent lila) */
function idPrompt(w,idText,askedId,givenId,glText){
  const s=sentOf(w),y=new Set(askedId);
  if(s&&s.id===idText)learnedIdx(w,s,'id').forEach(i=>y.add(i));
  givenId.forEach(i=>y.delete(i));
  return markTokens(idText,Array.from(y),'slot',Array.from(givenId),'gv');
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
