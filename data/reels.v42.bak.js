/* Modul Reels: Spielautomat. Drei Walzen tragen Wörter des Beispielsatzes (bei längeren Sätzen: das gelernte Wort und seine zwei Nachbarn).
   Hebel ziehen, dann jede Walze antippen, wenn das richtige Wort auf der Linie steht.
   Richtig: Walze rastet grün ein. Falsch: Walze zuckt rot und dreht wieder an (ein Fehler ist frei, im Survival nicht).
   Jackpot (alles beim ersten Stopp) ist nur Show und ändert nichts an Stufen oder Punkten. */
const RL_ROW=44,RL_V=3.2;   // Wörter pro Sekunde: bewusst langsam
function reelsData(w){
  const s=sentOf(w);if(!s)return null;
  const idT=tilesOf(s.id),glT=tilesOf(s.plain);
  if(idT.length<3||glT.length<3)return null;
  const dir=Math.random()<.5?'gl2id':'id2gl';   // gl2id: Satz in der App-Sprache oben, Walzen tragen Indonesisch
  const from=dir==='gl2id'?s.plain:s.id,toks=dir==='gl2id'?idT:glT,toLang=dir==='gl2id'?'id':state.ui;
  let idx;
  if(dir==='gl2id'){
    const f=normId(tokensOf(w.id)[0]||'');idx=toks.findIndex(x=>normId(x)===f);
  }else{
    const m=s.tpl.match(/\[([^\]]+)\]/);idx=m?tokensOf(s.tpl.slice(0,m.index)).length:-1;
  }
  if(idx<0||idx>=toks.length)idx=Math.floor(toks.length/2);
  const st=Math.max(0,Math.min(toks.length-3,idx-1));
  const right=toks.slice(st,st+3);
  const reels=right.map((r,i)=>{
    const words=[r].concat(distractors(toks,toLang,9).filter(x=>x.length<=9).slice(0,2));
    const ws=shuffle(words);
    return {words:ws,right:ws.indexOf(r)};
  });
  return {dir,toLang,from,toks,st,right,reels,before:toks.slice(0,st).join(' '),after:toks.slice(st+3).join(' '),full:toks.join(' '),
    fullFrom:from};
}
const rlMod=(a,n)=>((a%n)+n)%n;
const rlEase=k=>{const c=1.4;return 1+(c+1)*Math.pow(k-1,3)+c*Math.pow(k-1,2);};

function showReels(w){
  const c=S.cur,L=curLang(),D=reelsData(w);
  const tries=triesFor('reels'),list=reduceMotion();
  const R={D,tries,miss:0,locked:0,state:'idle',reels:D.reels.map((r,i)=>({words:r.words,right:r.right,p:Math.random()*6,v:0,st:'idle',t:0,p0:0,tgt:0})),tick:0};
  c.rl=R;
  const maxLen=Math.max(...D.reels.map(r=>Math.max(...r.words.map(x=>x.length))));
  const fs=maxLen>8?'rw-s':maxLen>6?'rw-m':'';
  const ctx=(D.before||D.after)?`<p class="rl-ctx" lang="${D.toLang==='id'?L.code.toLowerCase():state.ui}">${esc(D.before)} <i>▮ ▮ ▮</i> ${esc(D.after)}</p>`:'';
  const bulbs=n=>'<i></i>'.repeat(n);
  const reelHtml=list?
    D.reels.map((r,i)=>`<div class="rl-pick" data-i="${i}" role="group" aria-label="${t('Walze {0}',i+1)}">${r.words.map((x,k)=>`<button class="opt" data-k="${k}" lang="${D.toLang==='id'?L.code.toLowerCase():state.ui}">${esc(x)}</button>`).join('')}</div>`).join(''):
    D.reels.map((r,i)=>`<div class="reel ${fs}" data-i="${i}" aria-label="${t('Walze {0}',i+1)}" lang="${D.toLang==='id'?L.code.toLowerCase():state.ui}">${[0,1,2,3,4].map(()=>'<div class="rw"></div>').join('')}</div>`).join('');
  sheetBody(`<div class="smain rl">${kicker(c,'reels',D.dir==='gl2id'?toIdl():toGl())}${roundLives()}
    <p class="hint">${list?t('Wähle für jede Stelle das richtige Wort.'):t('Ziehe den Hebel. Tippe dann irgendwo auf den Automaten, wenn das richtige Wort auf der Linie steht. Die Walzen rasten von links nach rechts ein.')}</p>
    <div class="sentbox" lang="${D.dir==='gl2id'?state.ui:L.code.toLowerCase()}">${esc(D.from)}</div>${ctx}
    ${list?`<div class="rl-list">${reelHtml}</div>`:`<div class="cab" id="cab" data-st="idle">
      <div class="bl bt">${bulbs(11)}</div><div class="bl bb">${bulbs(11)}</div><div class="bl bl2">${bulbs(5)}</div><div class="bl br2">${bulbs(5)}</div>
      <div class="sign" id="sign">DEWI REELS</div>
      <div class="cbody"><div class="win" id="win" role="button" tabindex="0" aria-label="${t('Walzen stoppen')}">${reelHtml}<div class="pay"></div><b class="arr l"></b><b class="arr r"></b></div>
        <div class="lev"><div class="track"></div><div class="knob" id="knob" role="button" tabindex="0" aria-label="${t('Hebel ziehen')}"></div></div></div>
    </div>`}
    <div id="rlm" class="rl-m">${mascot('reels_ready',null,'sm')}</div>
    <div id="exfb"></div></div>`);
  const cab=$('#cab'),sign=$('#sign');
  const say=k=>{const m=$('#rlm');if(m)m.innerHTML=mascot(k,null,'sm');};
  const alive=()=>!!$('#rlm');
  const el=i=>$$('.reel',sheet)[i];

  function paint(i){
    const r=R.reels[i],e=el(i);if(!e)return;
    const base=Math.round(r.p),d=r.p-base,n=r.words.length;
    e.querySelectorAll('.rw').forEach((row,k)=>{
      const off=k-2,txt=r.words[rlMod(base+off,n)];
      if(row.textContent!==txt)row.textContent=txt;
      row.style.transform=`translateY(${((off-d)*RL_ROW+RL_ROW).toFixed(1)}px)`;
      row.classList.toggle('mid',off===0);
    });
    if(R.last[i]!==base){R.last[i]=base;if(r.st==='spin'){const now=performance.now();if(now-R.tick>55){R.tick=now;sfx('tick');}}}
  }
  R.last=[];
  const curIdx=()=>R.reels.findIndex(r=>r.st!=='ok');
  function paintAll(){R.reels.forEach((_,i)=>paint(i));const a=R.state==='over'?-1:curIdx();$$('.reel',sheet).forEach((e,i)=>e.classList.toggle('act',i===a&&R.state==='spin'));}

  function finish(win){
    R.state='over';
    const jack=win&&R.miss===0;
    R.jack=jack;
    c.ok=c.ok&&win;settleCard();
    if(cab)cab.dataset.st=jack?'jack':win?'win':'lose';
    if(sign)sign.textContent=jack?'JACKPOT':win?'YES!':'GAME OVER';
    R.reels.forEach((r,i)=>{
      if(!win&&r.st!=='ok'){r.st='rev';r.p=r.right;const e=el(i);if(e){e.classList.remove('no');e.classList.add('rev');}}
      if(jack){const e=el(i);if(e)e.classList.add('gold');}
    });
    paintAll();
    if(jack){sfx('jackpot');haptic([30,40,30,40,30,40,80]);const b=cab||sheet;burst(b,46);setTimeout(()=>alive()&&burst(b,34),350);setTimeout(()=>alive()&&burst(b,34),750);}
    else if(!win){sfx('end_bad');}
    say(jack?'reels_jackpot':win?'reels_win':'reels_lose');
    const L2=D.toLang==='id'?L.code.toLowerCase():state.ui;
    $('#exfb').innerHTML=`<div class="res ${win?'good':'bad'}" data-snd="1" role="status"><div class="rl">${jack?t('Jackpot!'):win?t('Richtig'):t('Nicht ganz')}</div>
      <div class="pair" lang="${L2}">${esc(D.full)}</div></div>
      ${jack?`<p class="hint" style="margin-top:8px">${t('Alles beim ersten Stopp getroffen.')}</p>`:''}${resultNote(win)}
      <button class="btn primary block" id="nx" style="margin-top:12px">${t('Weiter')}</button>`;
    $('#nx').onclick=nextStep;
    try{$('#nx').focus({preventScroll:true});}catch(e){}
    if(win&&!jack)burst($('.res'),18);
  }

  /* Ein Versuch für Walze i mit Wort k (von Hand oder Liste) */
  function attempt(i,k){
    const r=R.reels[i];
    if(R.state!=='spin'&&!list)return;
    if(R.state==='over'||r.st==='ok')return;
    if(k===r.right){
      r.st='ok';R.locked++;
      const e=el(i);if(e){e.classList.remove('no');e.classList.add('ok');}
      const pk=$$('.rl-pick',sheet)[i];if(pk){pk.classList.add('ok');$$('.opt',pk).forEach((b,x)=>{b.disabled=true;if(x===k)b.classList.add('ok');});}
      sfx('rwin');haptic([22]);
      if(R.locked===3)finish(true);else say('reels_ok');
    }else{
      R.miss++;r.st='no';
      const e=el(i);if(e){e.classList.add('no');}
      const pk=$$('.rl-pick',sheet)[i];if(pk){const b=$$('.opt',pk)[k];if(b){b.classList.add('no');b.disabled=true;}}
      sfx('rbad');haptic([40,30,40]);
      if(R.miss>=R.tries)finish(false);
      else{say('reels_bad');if(!list){r.t=0;}else r.st='idle';}
    }
  }

  function stop(i){
    const r=R.reels[i];
    if(R.state!=='spin'||r.st!=='spin')return;
    r.st='snap';r.t=0;r.p0=r.p;r.tgt=Math.round(r.p+r.v*.07);
    sfx('thunk');haptic([8]);
  }

  R.frame=dt=>{
    if(R.state==='over')return;
    R.reels.forEach((r,i)=>{
      if(r.st==='spin'){r.p+=r.v*dt;}
      else if(r.st==='snap'){
        r.t+=dt;const k=Math.min(1,r.t/.24);r.p=r.p0+(r.tgt-r.p0)*rlEase(k);
        if(k>=1){r.p=r.tgt;r.st='idle';attempt(i,rlMod(r.tgt,r.words.length));}
      }else if(r.st==='no'){
        r.t+=dt;
        if(r.t>=.55&&R.state==='spin'){r.st='spin';r.v=RL_V+Math.random()*.6;r.p=Math.random()*r.words.length;const e=el(i);if(e)e.classList.remove('no');}
      }
    });
    paintAll();
  };
  R.stop=stop;
  R.stopNext=()=>{const i=curIdx();if(i>=0)stop(i);};   // immer die linkeste noch offene Walze
  R.pull=()=>{
    if(R.state!=='idle')return;
    R.state='spin';
    R.reels.forEach((r,i)=>{if(r.st==='idle'){r.st='spin';r.v=RL_V+i*.35+Math.random()*.4;}});
    if(cab)cab.dataset.st='spin';if(sign)sign.textContent='SPIN!';
    paintAll();
    sfx('lever');sfx('whirr',320);haptic([14]);
    const knob=$('#knob');if(knob){knob.classList.add('pulled');knob.style.setProperty('--ly','74px');setTimeout(()=>knob.style.setProperty('--ly','0px'),170);setTimeout(()=>knob.classList.remove('pulled'),600);}
  };

  if(list){
    R.state='spin';
    $$('.rl-pick',sheet).forEach((pk,i)=>$$('.opt',pk).forEach(b=>b.onclick=()=>attempt(i,+b.dataset.k)));
    return;
  }
  paintAll();
  /* Ganzer Automat: Tippen irgendwo stoppt die nächste Walze (links nach rechts). Der Hebel hat seine eigene Bedienung. */
  cab.addEventListener('pointerdown',ev=>{if(ev.target.closest('#knob'))return;ev.preventDefault();R.stopNext();});
  const wn=$('#win');wn.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();R.stopNext();}});
  wn.addEventListener('click',ev=>{if(ev.detail===0)R.stopNext();});   // Tastatur / Hilfsmittel
  /* Hebel: ziehen oder antippen */
  const knob=$('#knob');let drag=null;
  const setY=y=>knob.style.setProperty('--ly',y+'px');
  knob.addEventListener('pointerdown',ev=>{ev.preventDefault();if(R.state!=='idle')return;drag={y:ev.clientY};try{knob.setPointerCapture(ev.pointerId);}catch(e){}knob.classList.add('drag');});
  knob.addEventListener('pointermove',ev=>{if(!drag)return;const y=Math.max(0,Math.min(74,ev.clientY-drag.y));setY(y);if(y>=60&&R.state==='idle'){drag=null;knob.classList.remove('drag');setY(0);R.pull();}});
  const end=()=>{if(!drag)return;const moved=parseFloat(knob.style.getPropertyValue('--ly'))||0;drag=null;knob.classList.remove('drag');setY(0);if(R.state==='idle'&&moved<20)R.pull();};
  knob.addEventListener('pointerup',end);knob.addEventListener('pointercancel',()=>{drag=null;knob.classList.remove('drag');setY(0);});
  knob.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();R.pull();}});
  let last=0;
  const loop=ts=>{
    if(!alive()||R.state==='over'&&R.done)return;
    const dt=last?Math.min(.05,(ts-last)/1000):0;last=ts;
    R.frame(dt);
    if(R.state==='over'){R.done=true;return;}
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

registerModule({id:'reels',name:()=>t('Reels'),desc:()=>t('Hebel ziehen, Walzen beim richtigen Wort stoppen'),tone:'t3',solo:true,isNew:true,fallback:'choice',
  icon:'<svg width="46" height="40" viewBox="0 0 46 40" aria-hidden="true"><rect x="2" y="6" width="36" height="28" rx="6" fill="#ff4fa3" stroke="#ffcf4a" stroke-width="2.5"/><rect x="7" y="12" width="8" height="16" rx="2" fill="#fff"/><rect x="17" y="12" width="8" height="16" rx="2" fill="#fff"/><rect x="27" y="12" width="8" height="16" rx="2" fill="#fff"/><path d="M5 20h30" stroke="#e0295a" stroke-width="1.5"/><rect x="40" y="10" width="3" height="16" rx="1.5" fill="#ffcf4a"/><circle cx="41.5" cy="8" r="4" fill="#e0295a" stroke="#fff" stroke-width="1"/></svg>',
  can:w=>!!reelsData(w),show:w=>showReels(w)});
