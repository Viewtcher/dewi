const toGl=()=>t(state.ui==='de'?'ins Deutsche':'ins Englische');

const toIdl=()=>t(state.lang==='en'?'ins Englische':state.lang==='de'?'ins Deutsche':'ins Indonesische');

/* Hervorhebung: Wort im Satz finden (nur ganze Wörter) */
/* Wort im Satz finden: Token-Bereich [von,bis] oder null. Erst exakt, dann gebeugte Form
   (z. B. menjawab → jawab, tagihan → tagihannya, dua belas → kedua belas). Zerlegung wie tokensOf. */
const ARTIKEL=/^(der|die|das|den|dem|des|ein|eine|einen|einem|einer)$/;
function wordSpan(text,word){
  const T=tokensOf(text).map(x=>x.toLowerCase());let W=tokensOf(word).map(x=>x.toLowerCase());
  if(W.length>1&&ARTIKEL.test(W[0]))W=W.slice(1);   // „der Nachbar“ steht im Satz als „Nachbar“
  if(!W.length)return null;
  const stems=b=>{const o=[b],m=b.match(/^(meng|meny|mem|men|me|ber|ter|di|per|pe|ke)(.{3,})$/);if(m)o.push(m[2]);return o.filter(x=>x.length>=3);};
  const find=eq=>{for(let i=0;i+W.length<=T.length;i++){let ok=true;for(let j=0;j<W.length;j++)if(!eq(T[i+j],W[j])){ok=false;break;}if(ok)return [i,i+W.length-1];}return null;};
  return find((a,b)=>a===b)||find((a,b)=>stems(b).some(x=>a.includes(x)));
}
/* Wörter eines Satzes (nach Token-Nummer) mit gelber Unterstreichung; gleiche Zerlegung wie tokensOf */
function markTokens(text,idx,cls,extra,xcls,more){
  const set=new Set(idx),ex=new Set(extra||[]),mo=new Set((more&&more.idx)||[]),re=/[^\s.,!?;:"“”]+/g;let out='',last=0,i=0,m;
  while((m=re.exec(text))){
    const c=ex.has(i)?(xcls||'gv'):mo.has(i)?more.cls:set.has(i)?(cls||'slot'):'';
    out+=esc(text.slice(last,m.index))+(c?'<span class="'+c+'">'+esc(m[0])+'</span>':esc(m[0]));
    last=m.index+m[0].length;i++;
  }
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
/* ===== Wort-zu-Wort-Zuordnung (Version 118) =====
   Früher wurde zur Laufzeit geraten, welches Wort welchem entspricht (Wörterbuch, Endungen,
   Ähnlichkeit, Position). Das war nie ganz zuverlässig. Jetzt steht die Zuordnung in den Daten:
   align.js enthält für jedes geprüfte Satzpaar zwei Zahlenreihen, eine je Satz.
   Gleiche Zahl = einander entsprechende Wörter, 0 = keine Entsprechung.
   Fehlt ein Paar, wird nichts behauptet: dann markiert die App nur die gelernte Vokabel. */
const ALIGN={};
ALIGN_RAW.split('\n').forEach(l=>{
  const q=l.split('|');if(q.length<3)return;
  ALIGN[q[0].trim()]={a:q[1].trim().split(' ').map(Number),b:q[2].trim().split(' ').map(Number)};
});
/* Zuordnung für das Wort w zwischen seinem Beispielsatz und der Übersetzung, oder null */
function alignFor(w,idText,glText){
  const e=(state.myalign&&state.myalign[w.k+':'+state.ui])||ALIGN[w.k+':'+state.ui];   // Version 178: eigene Korrektur zuerst
  if(!e)return null;
  if(e.a.length!==tokensOf(idText).length||e.b.length!==tokensOf(glText).length)return null;
  return e;
}
/* Positionen im übersetzten Satz, die zu den angegebenen Token des Lernsatzes gehören */
function mapIdx(al,idx,side){
  const from=side==='a'?al.a:al.b,to=side==='a'?al.b:al.a,g=new Set();
  idx.forEach(i=>{if(from[i])g.add(from[i]);});
  const out=[];to.forEach((v,k)=>{if(v&&g.has(v))out.push(k);});
  return out;
}
/* Deutscher/englischer Satz oben (Richtung „in die Lernsprache“):
   gesuchte Wörter pink unterstrichen, geschenkte bleiben neutral.
   Ohne geprüfte Zuordnung wird nur die gelernte Vokabel markiert. */
function glPrompt(w,idText,glText,askedId,givenId){
  const s=sentOf(w),lrn=[];
  if(s&&s.id===idText&&s.plain===glText)learnedIdx(w,s,'gl').forEach(i=>lrn.push(i));
  if(!givenId||!givenId.size){   // nichts geschenkt: der ganze Satz ist gesucht, dafür braucht es keine Zuordnung
    const all=[];for(let k=0;k<tokensOf(glText).length;k++)all.push(k);
    return markTokens(glText,all,'slot');
  }
  const al=alignFor(w,idText,glText);
  if(!al)return markTokens(glText,lrn,'slot');
  const given=new Set(mapIdx(al,Array.from(givenId||[]),'a'));
  const y=mapIdx(al,Array.from(askedId||[]),'a').filter(k=>!given.has(k));
  lrn.forEach(k=>{if(!given.has(k)&&y.indexOf(k)<0)y.push(k);});
  return markTokens(glText,y,'slot');
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

/* Herzen (Version 123): das nächste leere Herz füllt sich von unten nach oben,
   je nachdem wie weit die Regeneration ist (8 richtige in Folge geben ein Herz zurück). */
let HEART_UID=0;
const hearts=(n,g,p)=>[0,1,2].map(i=>{
  if(i<n)return `<svg viewBox="0 0 24 24" class="${i===g?'heal':''}" aria-hidden="true">${HEART}</svg>`;
  if(i===n&&p>0){
    const id='hcf'+(++HEART_UID),h=(24*p).toFixed(2);
    return `<svg viewBox="0 0 24 24" class="x fill" aria-hidden="true"><defs><clipPath id="${id}"><rect x="0" y="${(24-24*p).toFixed(2)}" width="24" height="${h}"/></clipPath></defs>${HEART}<g class="hf" clip-path="url(#${id})">${HEART}</g></svg>`;
  }
  return `<svg viewBox="0 0 24 24" class="x" aria-hidden="true">${HEART}</svg>`;
}).join('');

const livesHtml=(n,g,p)=>`<div class="lives" id="tries" role="status" aria-label="${n} ${t('Leben')}">${hearts(n,g,p)}<span>${t('Leben')}</span></div>`;

const setLives=(n,g)=>{const e=$('#tries');if(e){e.innerHTML=hearts(n,g,healProg())+'<span>'+t('Leben')+'</span>';e.setAttribute('aria-label',n+' '+t('Leben'));}};


/* ===== Satz verbessern (Version 178) =====
   Nach der Antwort in Bausteine/Reihenfolge: beide Sätze Wort für Wort, Paare antippen (Wort links, dann das passende rechts).
   Gleiche Farbe = gehört zusammen. Gespeichert in state.myalign[Wort:App-Sprache] = {a,b} im selben Format wie align.js. */
const AL_COL=['#ff5c9d','#ffc23d','#4fd1c5','#8a7bff','#7ed957','#ff8a3d','#5ab0ff','#f06292'];
function alignFixOk(w,idText,glText){const s=sentOf(w);return !!(s&&s.id===idText&&s.plain===glText);}
function alignFixBtn(w,idText,glText){
  return alignFixOk(w,idText,glText)?`<div class="myadd" id="alfix"><button class="btn ghost" id="alopen" type="button">${t('Satz verbessern')}</button></div>`:'';
}
function alignFixBind(w,idText,glText){
  const host=$('#alfix'),open=$('#alopen');if(!host||!open)return;
  open.onclick=()=>{
    const A=tokensOf(idText),B=tokensOf(glText);
    const cur=alignFor(w,idText,glText);
    let a,b;
    if(cur){a=cur.a.slice();b=cur.b.slice();}
    else{a=A.map(()=>0);b=B.map(()=>0);const s=sentOf(w);learnedIdx(w,s,'id').forEach(i=>{a[i]=1;});learnedIdx(w,s,'gl').forEach(i=>{if(i<b.length)b[i]=1;});}
    let sel=null;   // {side:'a'|'b',i}
    const draw=()=>{
      const chip=(side,arr,toks)=>toks.map((tk,i)=>{const g=arr[i],on=sel&&sel.side===side&&sel.i===i;return `<button type="button" class="alchip${g?' g':''}${on?' on':''}" data-s="${side}" data-i="${i}" style="${g?'--ac:'+AL_COL[(g-1)%AL_COL.length]:''}">${esc(tk)}</button>`;}).join('');
      host.innerHTML=`<div class="aled"><p class="hint">${t('Tippe ein Wort und dann das passende im anderen Satz. Gleiche Farbe = gehört zusammen.')}</p>
        <div class="alrow" lang="${curLang().code.toLowerCase()}">${chip('a',a,A)}</div><div class="alrow" lang="${state.ui}">${chip('b',b,B)}</div>
        <div class="btns"><button class="btn ghost" type="button" id="alnone"${sel?'':' disabled'}>${t('Keine Entsprechung')}</button><button class="btn ghost" type="button" id="alcancel">${t('Abbrechen')}</button><button class="btn primary" type="button" id="alsave">${t('Speichern')}</button></div><p class="hint" id="alfl" role="status"></p></div>`;
      $$('.alchip',host).forEach(x=>x.onclick=()=>{
        const side=x.dataset.s,i=+x.dataset.i;
        if(!sel||sel.side===side){sel=sel&&sel.side===side&&sel.i===i?null:{side,i};return draw();}
        const mine=side==='a'?a:b,other=sel.side==='a'?a:b;
        let g=other[sel.i]||mine[i];
        if(!g)g=Math.max(0,...a,...b)+1;
        other[sel.i]=g;mine[i]=g;sel=null;draw();
      });
      $('#alnone').onclick=()=>{if(!sel)return;(sel.side==='a'?a:b)[sel.i]=0;sel=null;draw();};
      $('#alcancel').onclick=()=>{host.innerHTML=`<button class="btn ghost" id="alopen" type="button">${t('Satz verbessern')}</button>`;alignFixBind(w,idText,glText);};
      $('#alsave').onclick=()=>{
        if(!a.some(Boolean)||!b.some(Boolean)){$('#alfl').textContent=t('Mindestens ein Paar nötig.');return;}
        if(!state.myalign)state.myalign={};
        state.myalign[w.k+':'+state.ui]={a:a.slice(),b:b.slice(),t:idText};save();
        host.innerHTML=`<p class="hint">${t('Gespeichert. Gilt ab der nächsten Karte.')}</p>`;
      };
    };
    draw();
  };
}
