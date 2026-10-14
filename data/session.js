/* ---------- Abfrage ---------- */
let S=null;
function startSession(mode){
  const p=plan();
  let items;
  if(mode==='vol')items=p.vol.slice(0,5).map(w=>({w,type:'list'}));
  else{
    items=p.due.map(w=>({w,type:'review'})).concat(p.fresh.map(w=>({w,type:'new'})));
    if(p.mand)items.push({w:p.mand,type:'list'});
  }
  if(!items.length)return;
  S={items,i:0,right:0,wrong:0,missed:[],cleared:[],cur:null,streak0:streak()};
  sheet.hidden=false;document.body.style.overflow='hidden';
  showItem();
}
function closeSheet(){sheet.hidden=true;sheet.innerHTML='';document.body.style.overflow='';S=null;render();}
function sheetBody(inner){
  const pct=S.items.length?Math.round(S.i/S.items.length*100):0;
  sheet.innerHTML=`<div class="sin"><div class="shead"><button class="iconbtn" id="quit" aria-label="Abfrage beenden"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button><div class="sbar" role="progressbar" aria-valuemin="0" aria-valuemax="${S.items.length}" aria-valuenow="${S.i}"><i style="width:${pct}%;--p:${Math.max(pct/100,0.05)}"></i></div><div class="scount">${Math.min(S.i+1,S.items.length)} / ${S.items.length}</div></div>${inner}</div>`;
  $('#quit').onclick=closeSheet;
  sheet.scrollTop=0;
}

/* Schritte pro Wort: neu = Kennenlernen, Satz-Übung, Tippen. Stufe 1-2 und Fehlerliste = Satz-Übung, Tippen. Ab Stufe 3 nur Tippen. */
function stepsFor(type,lvl){
  if(type==='new')return ['intro','sent','type'];
  if(type==='list')return ['sent','type'];
  return lvl<=2?['sent','type']:['type'];
}
function showItem(){
  const it=S.items[S.i];
  if(!it)return showEnd();
  const L=curLang(),key=normEn(it.w.en);
  const same=L.words.filter(x=>normEn(x.en)===key);
  const pr=(state.progress[L.id]||{})[it.w.k];
  const lvl=pr?pr.l:0;
  S.cur={w:it.w,type:it.type,lvl,tries:0,ok:true,steps:stepsFor(it.type,lvl),si:0,dir:Math.random()<.5?'id2en':'en2id',accept:same.map(x=>normId(x.id)),alts:same.filter(x=>x.k!==it.w.k).map(x=>x.id)};
  nextStep();
}
function nextStep(){
  const c=S.cur,st=c.steps[c.si++];
  if(st==='intro')showIntro();else if(st==='sent')showSentence();else showQuestion();
}
function kicker(c,step,extra){
  const names={intro:'Kennenlernen',sent:'Satz-Übung',type:'Tippen'};
  let base,col;
  if(c.type==='new'){base='Neue Vokabel · Phase '+(c.steps.indexOf(step)+1)+' von '+c.steps.length;col='var(--c-violet)';}
  else if(c.type==='list'){base='Fehlerliste';col='var(--lv0)';}
  else{base='Wiederholung · Stufe '+c.lvl;col=LVCOL[c.lvl];}
  return `<div class="kicker" style="--k:${col}">${base} · ${extra||names[step]}</div>`;
}

/* Hervorhebung: Wort im Satz finden (nur ganze Wörter) */
function hlId(text,word){
  const lt=text.toLowerCase(),lw=word.toLowerCase(),isL=ch=>!!ch&&/[a-z]/i.test(ch);
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

function showIntro(){
  const c=S.cur,w=c.w,L=curLang(),s=SENT[w.k];
  const ex=s?`<div class="ex"><div class="xi" lang="${L.code.toLowerCase()}">${hlId(s.id,w.id)}</div><div class="xe" lang="en">${hlSlot(s.tpl)}</div></div>`:'';
  sheetBody(`<div class="smain">${kicker(c,'intro')}
    <div class="bigword" lang="${L.code.toLowerCase()}">${esc(w.id)}</div><div class="gloss" lang="en">${esc(w.en)}</div>
    <div class="eyebrow" style="margin-top:4px">${esc(L.cats[w.cat][0])}</div>${ex}
    <p class="hint">Präg dir das Wort und den Satz ein. Gleich wendest du es an.</p>
    <button class="btn primary block" id="go">Weiter</button></div>`);
  $('#go').onclick=nextStep;
}

/* ---- Satz-Übung ---- */
const PROPER_EXTRA='Indonesia Bali Jakarta Germany Berlin Bandung Medan Vito Dewi Rina Indonesian English Independence Day Monday Tuesday Wednesday Thursday Friday Saturday Sunday January February March April May June July August September October November December'.split(' ');
let PROPER=null,POOL={};
function tokensOf(text){return text.replace(/[.,!?;:"“”]/g,' ').split(/\s+/).filter(Boolean);}
function isProper(t){
  if(!PROPER){
    PROPER=new Set(PROPER_EXTRA);
    Object.keys(SENT).forEach(k=>{[SENT[k].id,SENT[k].en].forEach(tx=>tokensOf(tx).forEach((t,i)=>{if(i>0&&/^[A-ZÄÖÜ]/.test(t))PROPER.add(t);}));});
    Object.values(LANGS).forEach(L=>L.words.forEach(w=>{if(/^[A-Z]/.test(w.id))w.id.split(' ').forEach(t=>PROPER.add(t));}));
  }
  return /^I($|')/.test(t)||PROPER.has(t);
}
const tileText=(t,i)=>(i===0&&!isProper(t))?t.charAt(0).toLowerCase()+t.slice(1):t;
function tilesOf(text){return tokensOf(text).map(tileText);}
function poolOf(lang){
  if(!POOL[lang]){const set=new Set();Object.values(SENT).forEach(s=>tilesOf(lang==='id'?s.id:s.en).forEach(t=>set.add(t)));POOL[lang]=Array.from(set);}
  return POOL[lang];
}
function distractors(target,lang,n){
  const have=new Set(target.map(normId)),out=[];
  for(const t of shuffle(poolOf(lang).slice())){
    const k=normId(t);if(!k||have.has(k))continue;
    have.add(k);out.push(t);if(out.length>=n)break;
  }
  return out;
}
function choiceOptions(w){
  const L=curLang(),right=w.en.split(' / ')[0].trim(),bad=new Set(w.en.split(' / ').map(normEn)),out=[right];
  const pool=shuffle(L.words.filter(x=>x.k!==w.k));
  const pri=pool.filter(x=>x.cat===w.cat).concat(pool.filter(x=>x.cat!==w.cat));
  for(const x of pri){
    const g=x.en.split(' / ')[0].trim(),n=normEn(g);
    if(!n||bad.has(n))continue;
    bad.add(n);out.push(g);if(out.length>=4)break;
  }
  return shuffle(out);
}
/* Quelle für Bausteine: Beispielsatz des Wortes, bei Alltagssätzen der Eintrag selbst */
function buildPair(w){
  const s=SENT[w.k];
  const pair=s?{id:s.id,en:s.en}:{id:w.id,en:w.en.split(' / ')[0].trim()};
  return (tokensOf(pair.id).length>=2&&tokensOf(pair.en).length>=2)?pair:null;
}
function showSentence(){
  const c=S.cur,w=c.w,pair=buildPair(w),s=SENT[w.k];
  if(s&&(!pair||Math.random()<.5))return showChoice();
  if(pair)return showBuild(pair);
  nextStep();
}
function showChoice(){
  const c=S.cur,w=c.w,L=curLang(),s=SENT[w.k],opts=choiceOptions(w),right=opts.indexOf(w.en.split(' / ')[0].trim());
  sheetBody(`<div class="smain">${kicker(c,'sent')}
    <p class="hint">Was bedeutet das markierte Wort?</p>
    <div class="sentbox" lang="en">${hlSlot(s.tpl,w.id,'slot')}</div>
    <div class="opts" id="opts">${opts.map((o,i)=>`<button class="opt" data-i="${i}" lang="en">${esc(o)}</button>`).join('')}</div>
    <div id="exfb"></div></div>`);
  $$('.opt',sheet).forEach(b=>b.onclick=()=>{
    const i=+b.dataset.i,good=i===right;
    $$('.opt',sheet).forEach(x=>x.disabled=true);
    b.classList.add(good?'ok':'no');
    if(!good)$$('.opt',sheet)[right].classList.add('ok');
    c.ok=c.ok&&good;
    $('#exfb').innerHTML=`<div class="res ${good?'good':'bad'}" role="status"><div class="rl">${good?'Richtig':'Nicht ganz'}</div>
      <div class="pair"><span lang="${L.code.toLowerCase()}">${esc(w.id)}</span><em>=</em><span lang="en">${esc(w.en)}</span></div>
      <p class="hint" style="margin-top:8px" lang="${L.code.toLowerCase()}">${hlId(s.id,w.id)}</p></div>
      <button class="btn primary block" id="nx" style="margin-top:12px">Weiter</button>`;
    $('#nx').onclick=nextStep;
    try{$('#nx').focus({preventScroll:true});}catch(e){}
    if(good)burst($('.res'),18);
  });
}
function showBuild(pair){
  const c=S.cur,w=c.w,L=curLang();
  const dir=Math.random()<.5?'id2en':'en2id',toLang=dir==='id2en'?'en':'id';
  const from=dir==='id2en'?pair.id:pair.en,to=dir==='id2en'?pair.en:pair.id;
  const target=tilesOf(to),want=target.map(normId).join('|');
  const tiles=shuffle(target.concat(distractors(target,toLang,2)));
  let ans=[],done=false;
  sheetBody(`<div class="smain">${kicker(c,'sent','Bausteine · '+(dir==='id2en'?'ins Englische':'ins Indonesische'))}
    <p class="hint">Setze den Satz aus den Bausteinen zusammen. Du hast einen Versuch.</p>
    <div class="sentbox" lang="${dir==='id2en'?L.code.toLowerCase():'en'}">${esc(from)}</div>
    <div class="ans" id="ans2" aria-label="Dein Satz" lang="${toLang}"></div>
    <div class="bank" id="bank" lang="${toLang}"></div>
    <div id="exfb"></div>
    <button class="btn primary block" id="chk" disabled>Prüfen</button></div>`);
  const A=$('#ans2'),B=$('#bank'),chk=$('#chk');
  function paint(){
    A.innerHTML=ans.map(i=>`<button class="tile" data-i="${i}">${esc(tiles[i])}</button>`).join('');
    B.innerHTML=tiles.map((t,i)=>ans.indexOf(i)>-1?`<span class="tile ghost" aria-hidden="true">${esc(t)}</span>`:`<button class="tile" data-i="${i}">${esc(t)}</button>`).join('');
    chk.disabled=!ans.length;
  }
  A.onclick=e=>{const b=e.target.closest('button');if(!b||done)return;ans.splice(ans.indexOf(+b.dataset.i),1);paint();};
  B.onclick=e=>{const b=e.target.closest('button');if(!b||done)return;ans.push(+b.dataset.i);paint();};
  chk.onclick=()=>{
    if(done){nextStep();return;}
    done=true;
    const good=ans.map(i=>normId(tiles[i])).join('|')===want;
    c.ok=c.ok&&good;
    A.classList.add(good?'good':'bad');
    $$('.tile',sheet).forEach(x=>{if(x.tagName==='BUTTON')x.disabled=true;});
    $('#exfb').innerHTML=`<div class="res ${good?'good':'bad'}" role="status"><div class="rl">${good?'Richtig':'Nicht ganz'}</div>
      <div class="pair" lang="${toLang}">${esc(to)}</div></div>`;
    chk.textContent='Weiter';chk.disabled=false;
    try{chk.focus({preventScroll:true});}catch(e){}
    if(good)burst($('.res'),18);
  };
  paint();
}

/* ---- Tippen ---- */
function hintFor(c){
  let t=c.dir==='id2en'?c.w.en.split('/')[0]:c.w.id;
  t=t.replace(/\([^)]*\)/g,'').replace(/^\s*to\s+(?=\S)/i,'').trim();
  return t.slice(0,2);
}
function isCorrect(c,val){
  if(c.dir==='id2en'){const a=normEn(val);return !!a&&c.w.en.split('/').map(normEn).indexOf(a)>-1;}
  const a=normId(val);return !!a&&c.accept.indexOf(a)>-1;
}
function dots(n){return [0,1,2].map(i=>`<i class="${i<n?'':'x'}"></i>`).join('')}
function showQuestion(){
  const c=S.cur,w=c.w,L=curLang(),id2en=c.dir==='id2en';
  c.tries=0;
  sheetBody(`<div class="smain">${kicker(c,'type','Tippen · '+(id2en?'ins Englische':'ins Indonesische'))}
    <div class="bigword" lang="${id2en?L.code.toLowerCase():'en'}">${esc(id2en?w.id:w.en)}</div>
    <form class="qform" id="qf" autocomplete="off"><div class="inwrap" id="iw"><input class="field" id="ans" type="text" aria-label="Deine Antwort" placeholder="Antwort tippen" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="done"></div>
    <button class="btn primary block" type="submit">Prüfen</button></form>
    <div class="tries" id="tries">${dots(3)}<span>Versuche übrig</span></div>
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
    if(c.tries>=3)return finish(false);
    const left=3-c.tries,fb=$('#fb');
    fb.className='fb bad';
    fb.textContent='Nicht ganz. Noch '+left+(left===1?' Versuch.':' Versuche.')+(c.tries===2?' Tipp: beginnt mit „'+hintFor(c)+'“.':'');
    $('#tries').innerHTML=dots(left)+'<span>Versuche übrig</span>';
    inp.classList.remove('shake');void inp.offsetWidth;inp.classList.add('shake');inp.select();
  };
  try{inp.focus({preventScroll:true});}catch(e){inp.focus();}
}
function finish(typedOk){
  const c=S.cur,w=c.w,ok=c.ok&&typedOk,type=c.type,r=record(w,ok,type);
  if(ok)S.right++;else S.wrong++;
  if(!ok&&type!=='list')S.missed.push(w);
  if(ok&&type==='list')S.cleared.push(w);
  const L=curLang();
  const alts=c.dir==='en2id'&&c.alts.length?`<p class="hint" style="margin-top:6px">Auch richtig: ${c.alts.map(esc).join(', ')}</p>`:'';
  let when;
  if(ok&&type==='list')when='Geschafft. Das Wort verlässt die Fehlerliste und kommt morgen wieder (Stufe 1).';
  else if(ok)when='Stufe '+r.level+' von 5. Nächste Wiederholung '+(r.days===1?'morgen':'in '+r.days+' Tagen')+'.';
  else if(type==='list')when='Das Wort bleibt auf der Fehlerliste (Fehler: '+r.n+').';
  else when=(typedOk?'Eine Übung davor war falsch. ':'')+'Das Wort kommt auf die Fehlerliste.';
  sheetBody(`<div class="smain"><div class="res ${ok?'good':'bad'}" role="status"><div class="rl">${ok?'Richtig':'Leider falsch'}</div>
    <div class="pair"><span lang="${L.code.toLowerCase()}">${esc(w.id)}</span><em>=</em><span lang="en">${esc(w.en)}</span></div>${alts}</div>
    <p class="hint">${when}</p><button class="btn primary block" id="next">Weiter</button></div>`);
  const n=$('#next');n.onclick=()=>{S.i++;showItem();};
  try{n.focus({preventScroll:true});}catch(e){}
  if(ok)burst($('.res'),28);
}
function showEnd(){
  const t=today();
  S.i=S.items.length;
  const p=plan();
  if(!p.due.length&&!p.fresh.length&&!p.mand)state.done[t]=true;
  Object.keys(state.done).forEach(k=>{if(k<addDays(t,-120))delete state.done[k];});
  save();
  const total=S.items.length,st=streak();
  const chips=(arr,txt)=>arr.length?`<div><p class="hint" style="margin-bottom:8px">${txt}</p><div class="missed">${arr.map(w=>`<span>${esc(w.id)}</span>`).join('')}</div></div>`:'';
  const grew=st>S.streak0;
  sheetBody(`<div class="smain"><div class="kicker" style="--k:var(--c-pink)">Abfrage beendet</div>
    <div class="bigword">${S.right} von ${total}</div><p class="hint">komplett richtig beantwortet</p>
    <div class="endstreak${grew?' grew':''}">${flameSvg(st,true)}<div><b>${st}</b>${st===1?'Tag':'Tage'} in Folge<small>${grew?'Serie verlängert!':'Die Serie läuft weiter.'}</small></div></div>
    ${chips(S.cleared,'Von der Fehlerliste gestrichen:')}${chips(S.missed,'Neu auf der Fehlerliste:')}
    <button class="btn primary block" id="fin">Fertig</button></div>`);
  $('#fin').onclick=closeSheet;
  if(grew)burst($('.endstreak'),44);else if(S.right===total)burst($('.bigword'),32);
}
