/* ===== Einführung eines neuen Wortes (Version 108) =====
   Drei kurze Takte statt einer Textwand – jeder Takt hat genau eine Aufgabe:
     1 sehen        Wort + Übersetzung, antippen (statt Countdown), Aussprache per Lautsprecher
     2 wiedererkennen  „Was heißt X?“ – zwei Optionen, unverlierbar (falsch = nochmal)
     3 anwenden     der Beispielsatz mit Lücke, zwei Optionen (entfällt ohne Beispielsatz)
   Farben: Zielsprache pink (.tgt), Deutsch/Englisch neutral. */
function introBeat1(){
  /* Version 124: zentriert, zwei ruhige Schritte. 1) Wort poppt allein auf  2) Tipp: Übersetzung  3) Tipp: weiter */
  const c=S.cur,w=c.w,L=curLang(),lc=L.code.toLowerCase();
  sheetBody(`<div class="smain intro1" id="i1">${kicker(c,'intro')}
    <button class="wordtap" id="wtap" type="button" aria-label="${esc(w.id)} – ${esc(gl(w))}. ${t('Antippen zum Fortfahren')}">
      <span class="bigword tgt iw" lang="${lc}">${esc(w.id)}</span>
      <span class="gloss ig" lang="${state.ui}">${esc(gl(w))}</span></button>
    <button class="spk" id="spk" type="button" aria-label="${t('Aussprache anhören')}">${SPKIC}</button>
    <i class="tapdot" aria-hidden="true"></i></div>`);
  sfx('wordin',120);
  const sp=$('#spk');if(sp)sp.onclick=e=>{e.stopPropagation();say(w.id);};
  let st=0;
  $('#i1').onclick=()=>{
    const el=$('#wtap');if(!el)return;
    if(st===0&&window.__introMs!==0){   // Tests springen direkt weiter
      st=1;el.classList.add('shown');sfx('pop');return;
    }
    if(st===2)return;st=2;el.classList.add('tapped');sfx('pop');introSoon(introBeat2,260);
  };
}
/* ein falscher Gegenvorschlag, möglichst aus derselben Kategorie */
function introFoil(w,side){
  const L=curLang(),mine=side==='gl'?normG(gl(w)):normId(w.id);
  const pool=shuffle(L.words.filter(x=>x.k!==w.k));
  const pri=pool.filter(x=>x.cat===w.cat).concat(pool.filter(x=>x.cat!==w.cat));
  for(const x of pri){
    const v=side==='gl'?glFirst(x):x.id;
    if((side==='gl'?normG(v):normId(v))!==mine)return v;
  }
  return side==='gl'?glFirst(w):w.id;
}
function introBeat2(){
  const c=S.cur,w=c.w,L=curLang(),lc=L.code.toLowerCase();
  const right=glFirst(w),opts=shuffle([right,introFoil(w,'gl')]);
  sheetBody(`<div class="smain introc">${kicker(c,'intro')}
    <div class="introstep">${t('Erkennst du es wieder?')}</div>
    <div class="bigword tgt" lang="${lc}">${esc(w.id)}</div>
    <div class="opts two" id="opts">${opts.map(o=>`<button class="iopt" data-r="${o===right?1:0}" lang="${state.ui}">${esc(o)}</button>`).join('')}</div>
    <div id="exfb"></div></div>`);
  $$('.iopt',sheet).forEach(b=>b.onclick=()=>{
    const good=b.dataset.r==='1';
    if(!good){   // unverlierbar: nur ein Hinweis, der Takt geht weiter
      b.classList.add('no');b.disabled=true;sfx('retry',60);
      $('#exfb').innerHTML=`<p class="fb bad" role="status">${t('Fast! Schau nochmal hin.')}</p>`;return;
    }
    $$('.iopt',sheet).forEach(x=>x.disabled=true);b.classList.add('ok');sfx('glitter');
    burst(b,14);
    const s=sentOf(w);
    introSoon(s?introBeat3:introDone,520);
  });
}
function introBeat3(){
  const c=S.cur,w=c.w,L=curLang(),lc=L.code.toLowerCase(),s=sentOf(w);
  const opts=shuffle([w.id,introFoil(w,'id')]);
  sheetBody(`<div class="smain introc">${kicker(c,'intro')}
    <div class="introstep">${t('Jetzt im Satz')}</div>
    <div class="sentbox" lang="${lc}" id="sbox">${introGap(s.id,w.id)}</div>
    <div class="sentbox tr" lang="${state.ui}">${introTr(w,s)}</div>
    <div class="opts two" id="opts">${opts.map(o=>`<button class="iopt tgt" data-r="${o===w.id?1:0}" lang="${lc}">${esc(o)}</button>`).join('')}</div>
    <div id="exfb"></div></div>`);
  $$('.iopt',sheet).forEach(b=>b.onclick=()=>{
    const good=b.dataset.r==='1';
    if(!good){b.classList.add('no');b.disabled=true;sfx('retry',60);$('#exfb').innerHTML=`<p class="fb bad" role="status">${t('Fast! Schau nochmal hin.')}</p>`;return;}
    $$('.iopt',sheet).forEach(x=>x.disabled=true);b.classList.add('ok');sfx('glitter');
    $('#sbox').innerHTML=hlId(s.id,w.id);
    $('#exfb').innerHTML=`<button class="btn primary block" id="nx" style="margin-top:14px">${t('Weiter')}</button>`;
    $('#nx').onclick=introDone;
    try{$('#nx').focus({preventScroll:true});}catch(e){}
  });
}
/* Übersetzung: das Wort, das dem neuen Wort entspricht, markieren (pink unterstrichen wie in den Modulen).
   Primär die Klammer der Vorlage (für alle Beispielsätze vorhanden und geprüft), ersatzweise die Zuordnung. */
function introTr(w,s){
  let idx=learnedIdx(w,s,'gl');
  if(!idx.length){const al=alignFor(w,s.id,s.plain);if(al)idx=mapIdx(al,learnedIdx(w,s,'id'),'a');}
  return idx.length?markTokens(s.plain,idx,'slot'):esc(s.plain);
}
/* Lücke an der Stelle des neuen Wortes */
function introGap(text,word){
  const h=hlId(text,word);
  return h.indexOf('<b>')<0?esc(text):h.replace(/<b>.*?<\/b>/,'<span class="gapslot">?</span>');
}
/* In den Tests (__introMs=0) laufen die Takte ohne Verzögerung */
function introSoon(f,ms){if(window.__introMs===0)return f();setTimeout(f,ms);}
function introDone(){nextStep();}
function showIntro(){introBeat1();}

registerModule({id:'intro',name:()=>t('Kennenlernen'),desc:()=>'',solo:false,fallback:null,icon:'',can:()=>true,show:()=>showIntro()});
